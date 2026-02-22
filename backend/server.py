from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any, Literal
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import csv
import io

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'expense-tracker-secret-key-2024')
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_MINUTES = int(os.environ.get("ACCESS_TOKEN_MINUTES", "15"))
SESSION_IDLE_MINUTES = int(os.environ.get("SESSION_IDLE_MINUTES", "120"))
SESSION_ABSOLUTE_HOURS = int(os.environ.get("SESSION_ABSOLUTE_HOURS", "24"))
COOKIE_SECURE = os.environ.get('COOKIE_SECURE', 'false').lower() == 'true'
COOKIE_SAMESITE = os.environ.get('COOKIE_SAMESITE', 'lax').lower()
if COOKIE_SAMESITE not in {"lax", "strict", "none"}:
    COOKIE_SAMESITE = "lax"


# CORS origins from environment or default to local frontend
cors_origins = [
    origin.strip()
    for origin in os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(',')
    if origin.strip()
]

# Create the main app
app = FastAPI(title="Expense Tracker API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in cors_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

ENTRY_TYPES = {"expense", "income"}
ANALYTICS_RAW_DEFAULT_LIMIT = 500
ANALYTICS_RAW_MAX_LIMIT = 2000

# ==================== MODELS ====================

class UserBase(BaseModel):
    email: EmailStr
    name: str
    profile_type: str = "salaried"  # salaried, self_employed, businessman
    preferred_currency: str = "USD"
    picture: Optional[str] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    profile_type: str = "salaried"
    preferred_currency: str = "USD"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    created_at: datetime

class CategoryBase(BaseModel):
    name: str
    icon: Optional[str] = "folder"
    color: Optional[str] = "#064E3B"
    entry_type: Literal["expense", "income"] = "expense"

class SubCategoryCreate(BaseModel):
    name: str
    icon: Optional[str] = "tag"

class CategoryCreate(CategoryBase):
    subcategories: Optional[List[SubCategoryCreate]] = []

class SubCategory(BaseModel):
    subcategory_id: str
    name: str
    icon: str = "tag"

class Category(CategoryBase):
    model_config = ConfigDict(extra="ignore")
    category_id: str
    user_id: str
    subcategories: List[SubCategory] = []
    created_at: datetime

class ExpenseBase(BaseModel):
    amount: float
    currency: str = "USD"
    description: str
    category_id: str
    subcategory_id: Optional[str] = None
    entry_type: Literal["expense", "income"] = "expense"
    date: datetime

class ExpenseCreate(ExpenseBase):
    pass

class Expense(ExpenseBase):
    model_config = ConfigDict(extra="ignore")
    expense_id: str
    user_id: str
    created_at: datetime

class ExpenseUpdate(BaseModel):
    amount: Optional[float] = None
    currency: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[str] = None
    subcategory_id: Optional[str] = None
    entry_type: Optional[Literal["expense", "income"]] = None
    date: Optional[datetime] = None

# ==================== CURRENCY DATA ====================

CURRENCIES = {
    "USD": {"name": "US Dollar", "symbol": "$"},
    "EUR": {"name": "Euro", "symbol": "€"},
    "GBP": {"name": "British Pound", "symbol": "£"},
    "JPY": {"name": "Japanese Yen", "symbol": "¥"},
    "AUD": {"name": "Australian Dollar", "symbol": "A$"},
    "CAD": {"name": "Canadian Dollar", "symbol": "C$"},
    "CHF": {"name": "Swiss Franc", "symbol": "CHF"},
    "CNY": {"name": "Chinese Yuan", "symbol": "¥"},
    "INR": {"name": "Indian Rupee", "symbol": "₹"},
    "MXN": {"name": "Mexican Peso", "symbol": "$"},
    "BRL": {"name": "Brazilian Real", "symbol": "R$"},
    "KRW": {"name": "South Korean Won", "symbol": "₩"},
    "SGD": {"name": "Singapore Dollar", "symbol": "S$"},
    "HKD": {"name": "Hong Kong Dollar", "symbol": "HK$"},
    "NOK": {"name": "Norwegian Krone", "symbol": "kr"},
    "SEK": {"name": "Swedish Krona", "symbol": "kr"},
    "DKK": {"name": "Danish Krone", "symbol": "kr"},
    "NZD": {"name": "New Zealand Dollar", "symbol": "NZ$"},
    "ZAR": {"name": "South African Rand", "symbol": "R"},
    "RUB": {"name": "Russian Ruble", "symbol": "₽"},
    "TRY": {"name": "Turkish Lira", "symbol": "₺"},
    "AED": {"name": "UAE Dirham", "symbol": "د.إ"},
    "SAR": {"name": "Saudi Riyal", "symbol": "﷼"},
    "PLN": {"name": "Polish Zloty", "symbol": "zł"},
    "THB": {"name": "Thai Baht", "symbol": "฿"},
    "IDR": {"name": "Indonesian Rupiah", "symbol": "Rp"},
    "MYR": {"name": "Malaysian Ringgit", "symbol": "RM"},
    "PHP": {"name": "Philippine Peso", "symbol": "₱"},
    "CZK": {"name": "Czech Koruna", "symbol": "Kč"},
    "ILS": {"name": "Israeli Shekel", "symbol": "₪"},
    "CLP": {"name": "Chilean Peso", "symbol": "$"},
    "PKR": {"name": "Pakistani Rupee", "symbol": "₨"},
    "EGP": {"name": "Egyptian Pound", "symbol": "£"},
    "BDT": {"name": "Bangladeshi Taka", "symbol": "৳"},
    "VND": {"name": "Vietnamese Dong", "symbol": "₫"},
    "NGN": {"name": "Nigerian Naira", "symbol": "₦"},
    "ARS": {"name": "Argentine Peso", "symbol": "$"},
    "COP": {"name": "Colombian Peso", "symbol": "$"},
    "PEN": {"name": "Peruvian Sol", "symbol": "S/"},
    "UAH": {"name": "Ukrainian Hryvnia", "symbol": "₴"},
}

# Approximate exchange rates to USD (for demo purposes)
EXCHANGE_RATES = {
    "USD": 1.0, "EUR": 0.92, "GBP": 0.79, "JPY": 149.50, "AUD": 1.53,
    "CAD": 1.36, "CHF": 0.88, "CNY": 7.24, "INR": 83.12, "MXN": 17.15,
    "BRL": 4.97, "KRW": 1320.0, "SGD": 1.34, "HKD": 7.82, "NOK": 10.65,
    "SEK": 10.42, "DKK": 6.87, "NZD": 1.64, "ZAR": 18.65, "RUB": 92.50,
    "TRY": 32.10, "AED": 3.67, "SAR": 3.75, "PLN": 3.98, "THB": 35.50,
    "IDR": 15650.0, "MYR": 4.72, "PHP": 56.20, "CZK": 22.85, "ILS": 3.72,
    "CLP": 890.0, "PKR": 279.0, "EGP": 30.90, "BDT": 110.0, "VND": 24500.0,
    "NGN": 1550.0, "ARS": 870.0, "COP": 3950.0, "PEN": 3.72, "UAH": 37.50,
}

# Default categories by profile type
DEFAULT_CATEGORIES = {
    "salaried": [
        {"name": "Housing", "icon": "home", "color": "#064E3B", "subcategories": [
            {"name": "Rent/Mortgage", "icon": "building"},
            {"name": "Utilities", "icon": "zap"},
            {"name": "Maintenance", "icon": "wrench"}
        ]},
        {"name": "Transportation", "icon": "car", "color": "#10B981", "subcategories": [
            {"name": "Fuel", "icon": "fuel"},
            {"name": "Public Transit", "icon": "train"},
            {"name": "Parking", "icon": "parking-square"}
        ]},
        {"name": "Food & Dining", "icon": "utensils", "color": "#F59E0B", "subcategories": [
            {"name": "Groceries", "icon": "shopping-cart"},
            {"name": "Restaurants", "icon": "chef-hat"},
            {"name": "Coffee & Snacks", "icon": "coffee"}
        ]},
        {"name": "Healthcare", "icon": "heart-pulse", "color": "#EF4444", "subcategories": [
            {"name": "Medical", "icon": "stethoscope"},
            {"name": "Pharmacy", "icon": "pill"},
            {"name": "Insurance", "icon": "shield"}
        ]},
        {"name": "Entertainment", "icon": "gamepad-2", "color": "#8B5CF6", "subcategories": [
            {"name": "Streaming", "icon": "tv"},
            {"name": "Events", "icon": "ticket"},
            {"name": "Hobbies", "icon": "palette"}
        ]},
    ],
    "self_employed": [
        {"name": "Business Operations", "icon": "briefcase", "color": "#064E3B", "subcategories": [
            {"name": "Software & Tools", "icon": "laptop"},
            {"name": "Office Supplies", "icon": "paperclip"},
            {"name": "Marketing", "icon": "megaphone"}
        ]},
        {"name": "Professional Services", "icon": "users", "color": "#10B981", "subcategories": [
            {"name": "Legal", "icon": "scale"},
            {"name": "Accounting", "icon": "calculator"},
            {"name": "Consulting", "icon": "message-circle"}
        ]},
        {"name": "Travel & Client Meetings", "icon": "plane", "color": "#F59E0B", "subcategories": [
            {"name": "Flights", "icon": "plane-takeoff"},
            {"name": "Hotels", "icon": "bed"},
            {"name": "Meals", "icon": "utensils"}
        ]},
        {"name": "Personal Expenses", "icon": "user", "color": "#8B5CF6", "subcategories": [
            {"name": "Groceries", "icon": "shopping-cart"},
            {"name": "Healthcare", "icon": "heart-pulse"},
            {"name": "Entertainment", "icon": "gamepad-2"}
        ]},
    ],
    "businessman": [
        {"name": "Operations", "icon": "factory", "color": "#064E3B", "subcategories": [
            {"name": "Raw Materials", "icon": "box"},
            {"name": "Manufacturing", "icon": "cog"},
            {"name": "Logistics", "icon": "truck"}
        ]},
        {"name": "Human Resources", "icon": "users", "color": "#10B981", "subcategories": [
            {"name": "Salaries", "icon": "wallet"},
            {"name": "Benefits", "icon": "gift"},
            {"name": "Training", "icon": "graduation-cap"}
        ]},
        {"name": "Marketing & Sales", "icon": "trending-up", "color": "#F59E0B", "subcategories": [
            {"name": "Advertising", "icon": "megaphone"},
            {"name": "Events & Trade Shows", "icon": "calendar"},
            {"name": "Client Entertainment", "icon": "wine"}
        ]},
        {"name": "Infrastructure", "icon": "building-2", "color": "#8B5CF6", "subcategories": [
            {"name": "Rent & Lease", "icon": "home"},
            {"name": "Equipment", "icon": "hard-drive"},
            {"name": "IT Systems", "icon": "server"}
        ]},
        {"name": "Finance & Legal", "icon": "landmark", "color": "#EF4444", "subcategories": [
            {"name": "Taxes", "icon": "receipt"},
            {"name": "Insurance", "icon": "shield"},
            {"name": "Legal Fees", "icon": "scale"}
        ]},
    ],
}

DEFAULT_INCOME_CATEGORIES = [
    {"name": "Salary", "icon": "wallet", "color": "#2563EB", "subcategories": [
        {"name": "Base Salary", "icon": "banknote"},
        {"name": "Overtime", "icon": "clock-3"},
    ]},
    {"name": "Bonus", "icon": "gift", "color": "#7C3AED", "subcategories": [
        {"name": "Performance Bonus", "icon": "award"},
        {"name": "Festival Bonus", "icon": "sparkles"},
    ]},
    {"name": "Reimbursement", "icon": "receipt", "color": "#0D9488", "subcategories": [
        {"name": "Travel Reimbursement", "icon": "plane"},
        {"name": "Office Reimbursement", "icon": "briefcase"},
    ]},
    {"name": "Freelance", "icon": "laptop", "color": "#EA580C", "subcategories": [
        {"name": "Project Payment", "icon": "folder-kanban"},
        {"name": "Consulting", "icon": "messages-square"},
    ]},
    {"name": "Investments", "icon": "trending-up", "color": "#16A34A", "subcategories": [
        {"name": "Dividends", "icon": "line-chart"},
        {"name": "Interest", "icon": "coins"},
    ]},
    {"name": "Other Income", "icon": "plus-circle", "color": "#0F766E", "subcategories": [
        {"name": "Gift", "icon": "gift"},
        {"name": "Refund", "icon": "rotate-ccw"},
    ]},
]

def normalize_entry_type(value: Optional[str], default: str = "expense") -> str:
    if not value:
        return default

    normalized = value.lower()
    if normalized not in ENTRY_TYPES:
        raise HTTPException(status_code=400, detail="Invalid entry type")
    return normalized

# ==================== AUTH HELPERS ====================

def build_subcategories_payload(subcategories: List[Dict[str, Any]]) -> List[Dict[str, str]]:
    return [
        {
            "subcategory_id": f"sub_{uuid.uuid4().hex[:12]}",
            "name": sub["name"],
            "icon": sub.get("icon") or "tag",
        }
        for sub in subcategories
    ]

def build_category_doc(user_id: str, category: Dict[str, Any], entry_type: str) -> Dict[str, Any]:
    return {
        "category_id": f"cat_{uuid.uuid4().hex[:12]}",
        "user_id": user_id,
        "name": category["name"],
        "icon": category.get("icon", "folder"),
        "color": category.get("color", "#064E3B"),
        "entry_type": entry_type,
        "subcategories": build_subcategories_payload(category.get("subcategories", [])),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

async def insert_category_doc(user_id: str, category: Dict[str, Any], entry_type: str) -> Dict[str, Any]:
    category_doc = build_category_doc(user_id, category, entry_type)
    await db.categories.insert_one(category_doc)
    return category_doc

def set_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        path="/",
        max_age=SESSION_ABSOLUTE_HOURS * 60 * 60
    )


def get_client_ip(request: Request) -> str:
    x_forwarded_for = request.headers.get("x-forwarded-for")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    client_host = request.client.host if request.client else None
    return client_host or "unknown"


def create_session_doc(user_id: str, request: Request) -> Dict[str, Any]:
    now = datetime.now(timezone.utc)
    session_id = f"sess_{uuid.uuid4().hex[:16]}"
    return {
        "session_id": session_id,
        "user_id": user_id,
        "created_at": now.isoformat(),
        "last_activity_at": now.isoformat(),
        "idle_expires_at": (now + timedelta(minutes=SESSION_IDLE_MINUTES)).isoformat(),
        "absolute_expires_at": (now + timedelta(hours=SESSION_ABSOLUTE_HOURS)).isoformat(),
        "revoked": False,
        "ip": get_client_ip(request),
        "user_agent": request.headers.get("user-agent", "unknown"),
    }

def build_auth_response(user_doc: Dict[str, Any], token: str) -> Dict[str, Any]:
    return {
        "user_id": user_doc["user_id"],
        "email": user_doc["email"],
        "name": user_doc["name"],
        "profile_type": user_doc.get("profile_type", "salaried"),
        "preferred_currency": user_doc.get("preferred_currency", "USD"),
        "token": token,
    }

def build_date_query(start_date: Optional[str], end_date: Optional[str]) -> Dict[str, Any]:
    if not start_date and not end_date:
        return {}

    date_query: Dict[str, str] = {}
    if start_date:
        date_query["$gte"] = start_date
    if end_date:
        date_query["$lte"] = end_date
    return {"date": date_query}

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user_id: str, session_id: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "user_id": user_id,
        "sid": session_id,
        "exp": now + timedelta(minutes=ACCESS_TOKEN_MINUTES),
        "iat": now
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_jwt_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

async def get_current_user(request: Request) -> User:
    # Check cookie first
    session_token = request.cookies.get("session_token")

    # Then check Authorization header
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        if not session_token:
            session_token = token

    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    payload = decode_jwt_token(session_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = payload.get("user_id")
    session_id = payload.get("sid")
    if not user_id or not session_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    session_doc = await db.user_sessions.find_one({"session_id": session_id, "user_id": user_id}, {"_id": 0})
    if not session_doc or session_doc.get("revoked"):
        raise HTTPException(status_code=401, detail="Session revoked")

    now = datetime.now(timezone.utc)
    idle_expires_at = session_doc.get("idle_expires_at")
    absolute_expires_at = session_doc.get("absolute_expires_at")

    try:
        idle_expiry_dt = datetime.fromisoformat(idle_expires_at) if idle_expires_at else None
        absolute_expiry_dt = datetime.fromisoformat(absolute_expires_at) if absolute_expires_at else None
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid session")

    if idle_expiry_dt and idle_expiry_dt <= now:
        await db.user_sessions.update_one({"session_id": session_id}, {"$set": {"revoked": True, "revoked_reason": "idle_timeout"}})
        raise HTTPException(status_code=401, detail="SESSION_IDLE_TIMEOUT")

    if absolute_expiry_dt and absolute_expiry_dt <= now:
        await db.user_sessions.update_one({"session_id": session_id}, {"$set": {"revoked": True, "revoked_reason": "absolute_timeout"}})
        raise HTTPException(status_code=401, detail="SESSION_EXPIRED")

    await db.user_sessions.update_one(
        {"session_id": session_id},
        {
            "$set": {
                "last_activity_at": now.isoformat(),
                "idle_expires_at": (now + timedelta(minutes=SESSION_IDLE_MINUTES)).isoformat(),
            }
        },
    )

    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid token")

    return User(**user_doc)

async def create_default_categories(user_id: str, profile_type: str):
    expense_categories = DEFAULT_CATEGORIES.get(profile_type, DEFAULT_CATEGORIES["salaried"])
    for cat in expense_categories:
        await insert_category_doc(user_id, cat, "expense")
    for cat in DEFAULT_INCOME_CATEGORIES:
        await insert_category_doc(user_id, cat, "income")

async def seed_income_categories_if_missing(user_id: str):
    income_count = await db.categories.count_documents({"user_id": user_id, "entry_type": "income"})
    if income_count > 0:
        return

    for cat in DEFAULT_INCOME_CATEGORIES:
        await insert_category_doc(user_id, cat, "income")

def normalize_category_doc(category_doc: Dict[str, Any]) -> Dict[str, Any]:
    if "entry_type" not in category_doc:
        category_doc["entry_type"] = "expense"
    return category_doc

def normalize_expense_doc(expense_doc: Dict[str, Any]) -> Dict[str, Any]:
    if "entry_type" not in expense_doc:
        expense_doc["entry_type"] = "expense"
    return expense_doc

def parse_analytics_cursor(cursor: str) -> Dict[str, Any]:
    parts = cursor.split("|", 1)
    if len(parts) != 2:
        raise HTTPException(status_code=400, detail="Invalid analytics cursor")

    cursor_date = parts[0].strip()
    cursor_expense_id = parts[1].strip()
    if not cursor_date or not cursor_expense_id:
        raise HTTPException(status_code=400, detail="Invalid analytics cursor")

    return {
        "$or": [
            {"date": {"$lt": cursor_date}},
            {"date": cursor_date, "expense_id": {"$lt": cursor_expense_id}},
        ]
    }

def build_entry_type_query(entry_type: Optional[str]) -> Dict[str, Any]:
    if not entry_type:
        return {}

    normalized = normalize_entry_type(entry_type)
    if normalized == "expense":
        return {"$or": [{"entry_type": "expense"}, {"entry_type": {"$exists": False}}]}
    return {"entry_type": "income"}

async def ensure_category_for_entry_type(category_id: str, user_id: str, entry_type: str):
    category = await db.categories.find_one(
        {"category_id": category_id, "user_id": user_id},
        {"_id": 0}
    )
    if not category:
        raise HTTPException(status_code=400, detail="Category not found")

    category_type = normalize_entry_type(category.get("entry_type"), "expense")
    if category_type != entry_type:
        raise HTTPException(
            status_code=400,
            detail=f"Category type mismatch. Expected '{entry_type}' category."
        )

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/register")
async def register(user_data: UserCreate, request: Request, response: Response):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    hashed_pw = hash_password(user_data.password)
    
    user_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password_hash": hashed_pw,
        "profile_type": user_data.profile_type,
        "preferred_currency": user_data.preferred_currency,
        "picture": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    # Create default categories
    await create_default_categories(user_id, user_data.profile_type)
    
    session_doc = create_session_doc(user_id, request)
    await db.user_sessions.insert_one(session_doc)

    token = create_jwt_token(user_id, session_doc["session_id"])

    set_session_cookie(response, token)
    return build_auth_response(user_doc, token)

@api_router.post("/auth/login")
async def login(credentials: UserLogin, request: Request, response: Response):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})

    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user_doc.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    session_doc = create_session_doc(user_doc["user_id"], request)
    await db.user_sessions.insert_one(session_doc)

    token = create_jwt_token(user_doc["user_id"], session_doc["session_id"])

    set_session_cookie(response, token)
    return build_auth_response(user_doc, token)



@api_router.get("/auth/me")
async def get_me(user: User = Depends(get_current_user)):
    return {
        "user_id": user.user_id,
        "email": user.email,
        "name": user.name,
        "profile_type": user.profile_type,
        "preferred_currency": user.preferred_currency,
        "picture": user.picture
    }

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]

    if session_token:
        payload = decode_jwt_token(session_token)
        session_id = payload.get("sid") if payload else None
        if session_id:
            await db.user_sessions.update_one(
                {"session_id": session_id},
                {"$set": {"revoked": True, "revoked_reason": "logout", "revoked_at": datetime.now(timezone.utc).isoformat()}},
            )

    response.delete_cookie(
        key="session_token",
        path="/",
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE
    )
    return {"message": "Logged out successfully"}

@api_router.put("/auth/profile")
async def update_profile(
    request: Request,
    user: User = Depends(get_current_user)
):
    body = await request.json()
    update_data = {}
    
    if "name" in body:
        update_data["name"] = body["name"]
    if "profile_type" in body:
        update_data["profile_type"] = body["profile_type"]
    if "preferred_currency" in body:
        update_data["preferred_currency"] = body["preferred_currency"]
    
    if update_data:
        await db.users.update_one(
            {"user_id": user.user_id},
            {"$set": update_data}
        )
    
    user_doc = await db.users.find_one({"user_id": user.user_id}, {"_id": 0})
    return user_doc

# ==================== CATEGORY ENDPOINTS ====================

@api_router.get("/categories", response_model=List[Category])
async def get_categories(
    entry_type: Optional[str] = None,
    user: User = Depends(get_current_user)
):
    await seed_income_categories_if_missing(user.user_id)
    query = {"user_id": user.user_id}
    query.update(build_entry_type_query(entry_type))

    categories = await db.categories.find(query, {"_id": 0}).to_list(200)
    return [normalize_category_doc(category) for category in categories]

@api_router.post("/categories", response_model=Category)
async def create_category(category_data: CategoryCreate, user: User = Depends(get_current_user)):
    entry_type = normalize_entry_type(category_data.entry_type)
    category_doc = await insert_category_doc(
        user.user_id,
        {
            "name": category_data.name,
            "icon": category_data.icon or "folder",
            "color": category_data.color or "#064E3B",
            "subcategories": [sub.model_dump() for sub in category_data.subcategories or []],
        },
        entry_type,
    )
    return category_doc

@api_router.put("/categories/{category_id}")
async def update_category(
    category_id: str,
    request: Request,
    user: User = Depends(get_current_user)
):
    body = await request.json()
    update_data = {}
    
    if "name" in body:
        update_data["name"] = body["name"]
    if "icon" in body:
        update_data["icon"] = body["icon"]
    if "color" in body:
        update_data["color"] = body["color"]
    if "entry_type" in body:
        update_data["entry_type"] = normalize_entry_type(body.get("entry_type"))
    
    if update_data:
        await db.categories.update_one(
            {"category_id": category_id, "user_id": user.user_id},
            {"$set": update_data}
        )
    
    category_doc = await db.categories.find_one(
        {"category_id": category_id, "user_id": user.user_id},
        {"_id": 0}
    )
    if not category_doc:
        raise HTTPException(status_code=404, detail="Category not found")
    return normalize_category_doc(category_doc)

@api_router.delete("/categories/{category_id}")
async def delete_category(category_id: str, user: User = Depends(get_current_user)):
    result = await db.categories.delete_one({"category_id": category_id, "user_id": user.user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Also delete expenses in this category
    await db.expenses.delete_many({"category_id": category_id, "user_id": user.user_id})
    return {"message": "Category deleted"}

@api_router.post("/categories/{category_id}/subcategories")
async def add_subcategory(
    category_id: str,
    subcategory: SubCategoryCreate,
    user: User = Depends(get_current_user)
):
    subcategory_id = f"sub_{uuid.uuid4().hex[:12]}"
    new_sub = {
        "subcategory_id": subcategory_id,
        "name": subcategory.name,
        "icon": subcategory.icon or "tag"
    }
    
    result = await db.categories.update_one(
        {"category_id": category_id, "user_id": user.user_id},
        {"$push": {"subcategories": new_sub}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return new_sub

@api_router.delete("/categories/{category_id}/subcategories/{subcategory_id}")
async def delete_subcategory(
    category_id: str,
    subcategory_id: str,
    user: User = Depends(get_current_user)
):
    result = await db.categories.update_one(
        {"category_id": category_id, "user_id": user.user_id},
        {"$pull": {"subcategories": {"subcategory_id": subcategory_id}}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Category or subcategory not found")
    
    return {"message": "Subcategory deleted"}

# ==================== EXPENSE ENDPOINTS ====================

@api_router.get("/expenses", response_model=List[Expense])
async def get_expenses(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    category_id: Optional[str] = None,
    entry_type: Optional[str] = None,
    user: User = Depends(get_current_user)
):
    query = {"user_id": user.user_id}
    query.update(build_entry_type_query(entry_type))
    query.update(build_date_query(start_date, end_date))
    if category_id:
        query["category_id"] = category_id
    
    expenses = await db.expenses.find(query, {"_id": 0}).sort("date", -1).to_list(1000)
    return [normalize_expense_doc(expense) for expense in expenses]

@api_router.post("/expenses", response_model=Expense)
async def create_expense(expense_data: ExpenseCreate, user: User = Depends(get_current_user)):
    expense_id = f"exp_{uuid.uuid4().hex[:12]}"
    entry_type = normalize_entry_type(expense_data.entry_type)

    await ensure_category_for_entry_type(expense_data.category_id, user.user_id, entry_type)
    
    expense_doc = {
        "expense_id": expense_id,
        "user_id": user.user_id,
        "amount": expense_data.amount,
        "currency": expense_data.currency,
        "description": expense_data.description,
        "category_id": expense_data.category_id,
        "subcategory_id": expense_data.subcategory_id,
        "entry_type": entry_type,
        "date": expense_data.date.isoformat() if isinstance(expense_data.date, datetime) else expense_data.date,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.expenses.insert_one(expense_doc)
    expense_doc.pop("_id", None)
    return expense_doc

@api_router.put("/expenses/{expense_id}")
async def update_expense(
    expense_id: str,
    expense_data: ExpenseUpdate,
    user: User = Depends(get_current_user)
):
    update_data = {k: v for k, v in expense_data.model_dump().items() if v is not None}
    if "date" in update_data and isinstance(update_data["date"], datetime):
        update_data["date"] = update_data["date"].isoformat()

    existing_doc = await db.expenses.find_one(
        {"expense_id": expense_id, "user_id": user.user_id},
        {"_id": 0}
    )
    if not existing_doc:
        raise HTTPException(status_code=404, detail="Expense not found")

    target_entry_type = normalize_entry_type(
        update_data.get("entry_type", existing_doc.get("entry_type")),
        "expense"
    )
    target_category_id = update_data.get("category_id", existing_doc.get("category_id"))
    await ensure_category_for_entry_type(target_category_id, user.user_id, target_entry_type)
    update_data["entry_type"] = target_entry_type

    if update_data:
        await db.expenses.update_one(
            {"expense_id": expense_id, "user_id": user.user_id},
            {"$set": update_data}
        )
    
    expense_doc = await db.expenses.find_one(
        {"expense_id": expense_id, "user_id": user.user_id},
        {"_id": 0}
    )
    if not expense_doc:
        raise HTTPException(status_code=404, detail="Expense not found")
    return normalize_expense_doc(expense_doc)

@api_router.delete("/expenses/{expense_id}")
async def delete_expense(expense_id: str, user: User = Depends(get_current_user)):
    result = await db.expenses.delete_one({"expense_id": expense_id, "user_id": user.user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"message": "Expense deleted"}

# ==================== REPORTS & ANALYTICS ====================

@api_router.get("/analytics/raw")
async def get_analytics_raw(
    limit: int = Query(ANALYTICS_RAW_DEFAULT_LIMIT, ge=1, le=ANALYTICS_RAW_MAX_LIMIT),
    cursor: Optional[str] = None,
    user: User = Depends(get_current_user),
):
    query: Dict[str, Any] = {"user_id": user.user_id}
    if cursor:
        query.update(parse_analytics_cursor(cursor))

    fetch_limit = limit + 1
    expenses = await db.expenses.find(query, {"_id": 0}).sort([
        ("date", -1),
        ("expense_id", -1),
    ]).to_list(fetch_limit)

    has_more = len(expenses) > limit
    page_expenses = expenses[:limit]
    normalized_expenses = [normalize_expense_doc(expense) for expense in page_expenses]

    categories = await db.categories.find({"user_id": user.user_id}, {"_id": 0}).to_list(200)
    normalized_categories = [normalize_category_doc(category) for category in categories]

    next_cursor = None
    if has_more and page_expenses:
        last_expense = page_expenses[-1]
        last_date = str(last_expense.get("date", "")).strip()
        last_id = str(last_expense.get("expense_id", "")).strip()
        if last_date and last_id:
            next_cursor = f"{last_date}|{last_id}"

    return {
        "expenses": normalized_expenses,
        "categories": normalized_categories,
        "currency": user.preferred_currency,
        "has_more": has_more,
        "next_cursor": next_cursor,
        "limit": limit,
    }

@api_router.get("/reports/summary")
async def get_summary(
    period: str = "month",  # week, month, year
    user: User = Depends(get_current_user)
):
    raise HTTPException(
        status_code=410,
        detail="Deprecated endpoint. Use /api/analytics/raw and calculate summary on frontend.",
    )

@api_router.get("/reports/export")
async def export_expenses(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    user: User = Depends(get_current_user)
):
    query = {"user_id": user.user_id}
    query.update(build_date_query(start_date, end_date))
    
    transactions = await db.expenses.find(query, {"_id": 0}).sort("date", -1).to_list(10000)
    categories = await db.categories.find({"user_id": user.user_id}, {"_id": 0}).to_list(100)
    
    cat_map = {c["category_id"]: normalize_category_doc(c) for c in categories}
    subcat_map = {}
    for c in categories:
        for s in c.get("subcategories", []):
            subcat_map[s["subcategory_id"]] = s
    
    # Create CSV
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Date", "Description", "Amount", "Type", "Currency", "Category", "Subcategory"])
    
    for tx in transactions:
        normalize_expense_doc(tx)
        cat_name = cat_map.get(tx["category_id"], {}).get("name", "")
        subcat_name = subcat_map.get(tx.get("subcategory_id"), {}).get("name", "")
        writer.writerow([
            tx["date"][:10],
            tx["description"],
            tx["amount"],
            tx["entry_type"],
            tx["currency"],
            cat_name,
            subcat_name
        ])
    
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=transactions.csv"}
    )

@api_router.post("/reports/import")
async def import_expenses(request: Request, user: User = Depends(get_current_user)):
    body = await request.json()
    csv_data = body.get("csv_data", "")
    
    if not csv_data:
        raise HTTPException(status_code=400, detail="No CSV data provided")
    
    # Get user's categories
    categories = await db.categories.find({"user_id": user.user_id}, {"_id": 0}).to_list(100)
    normalized_categories = [normalize_category_doc(c) for c in categories]
    cat_name_type_map = {
        (c["name"].lower(), c["entry_type"]): c for c in normalized_categories
    }
    fallback_cat_name_map = {}
    for category in normalized_categories:
        key = category["name"].lower()
        if key not in fallback_cat_name_map:
            fallback_cat_name_map[key] = category
    subcat_name_map = {}
    for category in normalized_categories:
        for subcat in category.get("subcategories", []):
            subcat_name_map[(subcat["name"].lower(), category["category_id"])] = subcat
    
    # Parse CSV
    reader = csv.DictReader(io.StringIO(csv_data))
    imported = 0
    errors = []
    
    for i, row in enumerate(reader):
        try:
            entry_type = normalize_entry_type(row.get("Type"), "expense")
            cat_name = row.get("Category", "").lower()
            subcat_name = row.get("Subcategory", "").lower()
            
            category = cat_name_type_map.get((cat_name, entry_type))
            if not category:
                category = fallback_cat_name_map.get(cat_name)
            if not category:
                errors.append(f"Row {i+2}: Category '{row.get('Category')}' not found")
                continue

            category_type = normalize_entry_type(category.get("entry_type"), "expense")
            if category_type != entry_type:
                errors.append(
                    f"Row {i+2}: Category '{row.get('Category')}' is '{category_type}', but row type is '{entry_type}'"
                )
                continue
            
            subcategory_id = None
            if subcat_name:
                subcat = subcat_name_map.get((subcat_name, category["category_id"]))
                if subcat:
                    subcategory_id = subcat["subcategory_id"]
            
            expense_id = f"exp_{uuid.uuid4().hex[:12]}"
            expense_doc = {
                "expense_id": expense_id,
                "user_id": user.user_id,
                "amount": float(row.get("Amount", 0)),
                "currency": row.get("Currency", user.preferred_currency),
                "description": row.get("Description", ""),
                "category_id": category["category_id"],
                "subcategory_id": subcategory_id,
                "entry_type": entry_type,
                "date": row.get("Date", datetime.now(timezone.utc).isoformat()[:10]),
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.expenses.insert_one(expense_doc)
            imported += 1
        except Exception as e:
            errors.append(f"Row {i+2}: {str(e)}")
    
    return {
        "imported": imported,
        "errors": errors[:10]  # Return first 10 errors
    }

# ==================== CURRENCY ENDPOINTS ====================

@api_router.get("/currencies")
async def get_currencies():
    return {
        "currencies": [
            {"code": code, **data}
            for code, data in CURRENCIES.items()
        ],
        "rates": EXCHANGE_RATES
    }

@api_router.get("/currencies/convert")
async def convert_currency(
    amount: float,
    from_currency: str,
    to_currency: str
):
    if from_currency not in EXCHANGE_RATES or to_currency not in EXCHANGE_RATES:
        raise HTTPException(status_code=400, detail="Invalid currency code")
    
    # Convert to USD first, then to target currency
    usd_amount = amount / EXCHANGE_RATES[from_currency]
    converted = usd_amount * EXCHANGE_RATES[to_currency]
    
    return {
        "from": from_currency,
        "to": to_currency,
        "original_amount": amount,
        "converted_amount": round(converted, 2),
        "rate": EXCHANGE_RATES[to_currency] / EXCHANGE_RATES[from_currency]
    }

# ==================== DASHBOARD STATS ====================

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(user: User = Depends(get_current_user)):
    raise HTTPException(
        status_code=410,
        detail="Deprecated endpoint. Use /api/analytics/raw and calculate dashboard stats on frontend.",
    )

# Include the router
app.include_router(api_router)

@app.on_event("startup")
async def ensure_db_indexes():
    try:
        await db.expenses.create_index([("user_id", 1), ("date", -1), ("expense_id", -1)])
        await db.expenses.create_index([("user_id", 1), ("category_id", 1), ("date", -1)])
        await db.categories.create_index([("user_id", 1), ("entry_type", 1)])
        await db.categories.create_index([("user_id", 1), ("category_id", 1)])
        await db.users.create_index([("email", 1)])
        await db.user_sessions.create_index([("session_id", 1)], unique=True)
        await db.user_sessions.create_index([("user_id", 1), ("revoked", 1)])
        await db.user_sessions.create_index([("absolute_expires_at", 1)])
    except Exception as exc:
        logger.warning("Unable to ensure database indexes: %s", exc)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
