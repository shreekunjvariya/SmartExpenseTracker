from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
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
JWT_EXPIRATION_DAYS = 7
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

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRATION_DAYS),
        "iat": datetime.now(timezone.utc)
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
    
    # Check if it's a JWT token
    payload = decode_jwt_token(session_token)
    if payload:
        user_doc = await db.users.find_one({"user_id": payload["user_id"]}, {"_id": 0})
        if user_doc:
            return User(**user_doc)
    
    # Only JWT tokens are supported for authentication.
    raise HTTPException(status_code=401, detail="Invalid token")

async def create_default_categories(user_id: str, profile_type: str):
    categories = DEFAULT_CATEGORIES.get(profile_type, DEFAULT_CATEGORIES["salaried"])
    for cat in categories:
        category_id = f"cat_{uuid.uuid4().hex[:12]}"
        subcats = []
        for sub in cat.get("subcategories", []):
            subcats.append({
                "subcategory_id": f"sub_{uuid.uuid4().hex[:12]}",
                "name": sub["name"],
                "icon": sub.get("icon", "tag")
            })
        await db.categories.insert_one({
            "category_id": category_id,
            "user_id": user_id,
            "name": cat["name"],
            "icon": cat.get("icon", "folder"),
            "color": cat.get("color", "#064E3B"),
            "subcategories": subcats,
            "created_at": datetime.now(timezone.utc).isoformat()
        })

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/register")
async def register(user_data: UserCreate, response: Response):
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
    
    # Create JWT token
    token = create_jwt_token(user_id)
    
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        path="/",
        max_age=JWT_EXPIRATION_DAYS * 24 * 60 * 60
    )
    
    return {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "profile_type": user_data.profile_type,
        "preferred_currency": user_data.preferred_currency,
        "token": token
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin, response: Response):
    print("Login Initiated", credentials.email, credentials.password)
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})

    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user_doc.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_jwt_token(user_doc["user_id"])
    
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        path="/",
        max_age=JWT_EXPIRATION_DAYS * 24 * 60 * 60
    )
    
    return {
        "user_id": user_doc["user_id"],
        "email": user_doc["email"],
        "name": user_doc["name"],
        "profile_type": user_doc.get("profile_type", "salaried"),
        "preferred_currency": user_doc.get("preferred_currency", "USD"),
        "token": token
    }



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
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
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
async def get_categories(user: User = Depends(get_current_user)):
    categories = await db.categories.find({"user_id": user.user_id}, {"_id": 0}).to_list(100)
    return categories

@api_router.post("/categories", response_model=Category)
async def create_category(category_data: CategoryCreate, user: User = Depends(get_current_user)):
    category_id = f"cat_{uuid.uuid4().hex[:12]}"
    
    subcats = []
    for sub in category_data.subcategories or []:
        subcats.append({
            "subcategory_id": f"sub_{uuid.uuid4().hex[:12]}",
            "name": sub.name,
            "icon": sub.icon or "tag"
        })
    
    category_doc = {
        "category_id": category_id,
        "user_id": user.user_id,
        "name": category_data.name,
        "icon": category_data.icon or "folder",
        "color": category_data.color or "#064E3B",
        "subcategories": subcats,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.categories.insert_one(category_doc)
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
    return category_doc

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
    user: User = Depends(get_current_user)
):
    query = {"user_id": user.user_id}
    
    if start_date:
        query["date"] = {"$gte": start_date}
    if end_date:
        if "date" in query:
            query["date"]["$lte"] = end_date
        else:
            query["date"] = {"$lte": end_date}
    if category_id:
        query["category_id"] = category_id
    
    expenses = await db.expenses.find(query, {"_id": 0}).sort("date", -1).to_list(1000)
    return expenses

@api_router.post("/expenses", response_model=Expense)
async def create_expense(expense_data: ExpenseCreate, user: User = Depends(get_current_user)):
    expense_id = f"exp_{uuid.uuid4().hex[:12]}"
    
    expense_doc = {
        "expense_id": expense_id,
        "user_id": user.user_id,
        "amount": expense_data.amount,
        "currency": expense_data.currency,
        "description": expense_data.description,
        "category_id": expense_data.category_id,
        "subcategory_id": expense_data.subcategory_id,
        "date": expense_data.date.isoformat() if isinstance(expense_data.date, datetime) else expense_data.date,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.expenses.insert_one(expense_doc)
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
    return expense_doc

@api_router.delete("/expenses/{expense_id}")
async def delete_expense(expense_id: str, user: User = Depends(get_current_user)):
    result = await db.expenses.delete_one({"expense_id": expense_id, "user_id": user.user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"message": "Expense deleted"}

# ==================== REPORTS & ANALYTICS ====================

@api_router.get("/reports/summary")
async def get_summary(
    period: str = "month",  # week, month, year
    user: User = Depends(get_current_user)
):
    now = datetime.now(timezone.utc)
    
    if period == "week":
        start_date = (now - timedelta(days=7)).isoformat()
    elif period == "year":
        start_date = (now - timedelta(days=365)).isoformat()
    else:
        start_date = (now - timedelta(days=30)).isoformat()
    
    expenses = await db.expenses.find(
        {"user_id": user.user_id, "date": {"$gte": start_date}},
        {"_id": 0}
    ).to_list(1000)
    
    # Get categories for names
    categories = await db.categories.find({"user_id": user.user_id}, {"_id": 0}).to_list(100)
    cat_map = {c["category_id"]: c for c in categories}
    
    # Calculate totals
    total = sum(e["amount"] for e in expenses)
    
    # Group by category
    by_category = {}
    for exp in expenses:
        cat_id = exp["category_id"]
        cat_name = cat_map.get(cat_id, {}).get("name", "Other")
        cat_color = cat_map.get(cat_id, {}).get("color", "#064E3B")
        if cat_id not in by_category:
            by_category[cat_id] = {
                "category_id": cat_id,
                "name": cat_name,
                "color": cat_color,
                "total": 0,
                "count": 0
            }
        by_category[cat_id]["total"] += exp["amount"]
        by_category[cat_id]["count"] += 1
    
    # Daily trend
    daily_trend = {}
    for exp in expenses:
        date_str = exp["date"][:10]  # YYYY-MM-DD
        if date_str not in daily_trend:
            daily_trend[date_str] = 0
        daily_trend[date_str] += exp["amount"]
    
    return {
        "total": total,
        "count": len(expenses),
        "by_category": list(by_category.values()),
        "daily_trend": [{"date": k, "amount": v} for k, v in sorted(daily_trend.items())],
        "period": period,
        "currency": user.preferred_currency
    }

@api_router.get("/reports/export")
async def export_expenses(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    user: User = Depends(get_current_user)
):
    query = {"user_id": user.user_id}
    if start_date:
        query["date"] = {"$gte": start_date}
    if end_date:
        if "date" in query:
            query["date"]["$lte"] = end_date
        else:
            query["date"] = {"$lte": end_date}
    
    expenses = await db.expenses.find(query, {"_id": 0}).sort("date", -1).to_list(10000)
    categories = await db.categories.find({"user_id": user.user_id}, {"_id": 0}).to_list(100)
    
    cat_map = {c["category_id"]: c for c in categories}
    subcat_map = {}
    for c in categories:
        for s in c.get("subcategories", []):
            subcat_map[s["subcategory_id"]] = s
    
    # Create CSV
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Date", "Description", "Amount", "Currency", "Category", "Subcategory"])
    
    for exp in expenses:
        cat_name = cat_map.get(exp["category_id"], {}).get("name", "")
        subcat_name = subcat_map.get(exp.get("subcategory_id"), {}).get("name", "")
        writer.writerow([
            exp["date"][:10],
            exp["description"],
            exp["amount"],
            exp["currency"],
            cat_name,
            subcat_name
        ])
    
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=expenses.csv"}
    )

@api_router.post("/reports/import")
async def import_expenses(request: Request, user: User = Depends(get_current_user)):
    body = await request.json()
    csv_data = body.get("csv_data", "")
    
    if not csv_data:
        raise HTTPException(status_code=400, detail="No CSV data provided")
    
    # Get user's categories
    categories = await db.categories.find({"user_id": user.user_id}, {"_id": 0}).to_list(100)
    cat_name_map = {c["name"].lower(): c for c in categories}
    subcat_name_map = {}
    for c in categories:
        for s in c.get("subcategories", []):
            subcat_name_map[s["name"].lower()] = {"subcat": s, "cat": c}
    
    # Parse CSV
    reader = csv.DictReader(io.StringIO(csv_data))
    imported = 0
    errors = []
    
    for i, row in enumerate(reader):
        try:
            cat_name = row.get("Category", "").lower()
            subcat_name = row.get("Subcategory", "").lower()
            
            category = cat_name_map.get(cat_name)
            if not category:
                errors.append(f"Row {i+2}: Category '{row.get('Category')}' not found")
                continue
            
            subcategory_id = None
            if subcat_name and subcat_name in subcat_name_map:
                subcategory_id = subcat_name_map[subcat_name]["subcat"]["subcategory_id"]
            
            expense_id = f"exp_{uuid.uuid4().hex[:12]}"
            expense_doc = {
                "expense_id": expense_id,
                "user_id": user.user_id,
                "amount": float(row.get("Amount", 0)),
                "currency": row.get("Currency", user.preferred_currency),
                "description": row.get("Description", ""),
                "category_id": category["category_id"],
                "subcategory_id": subcategory_id,
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
    now = datetime.now(timezone.utc)
    
    # This month
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()
    
    # Last month
    last_month = (now.replace(day=1) - timedelta(days=1)).replace(day=1)
    last_month_end = now.replace(day=1) - timedelta(days=1)
    
    # This month expenses
    this_month_expenses = await db.expenses.find(
        {"user_id": user.user_id, "date": {"$gte": month_start}},
        {"_id": 0}
    ).to_list(1000)
    
    # Last month expenses
    last_month_expenses = await db.expenses.find(
        {"user_id": user.user_id, "date": {"$gte": last_month.isoformat(), "$lt": month_start}},
        {"_id": 0}
    ).to_list(1000)
    
    # All time
    all_expenses = await db.expenses.find({"user_id": user.user_id}, {"_id": 0}).to_list(10000)
    
    this_month_total = sum(e["amount"] for e in this_month_expenses)
    last_month_total = sum(e["amount"] for e in last_month_expenses)
    all_time_total = sum(e["amount"] for e in all_expenses)
    
    # Percentage change
    if last_month_total > 0:
        change = ((this_month_total - last_month_total) / last_month_total) * 100
    else:
        change = 100 if this_month_total > 0 else 0
    
    # Categories count
    categories = await db.categories.count_documents({"user_id": user.user_id})
    
    return {
        "this_month": {
            "total": this_month_total,
            "count": len(this_month_expenses)
        },
        "last_month": {
            "total": last_month_total,
            "count": len(last_month_expenses)
        },
        "all_time": {
            "total": all_time_total,
            "count": len(all_expenses)
        },
        "change_percentage": round(change, 1),
        "categories_count": categories,
        "currency": user.preferred_currency
    }

# Include the router
app.include_router(api_router)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
