# ExpenseTrack - Project Overview & Copilot Instructions

## Project Summary

**ExpenseTrack** is a modern, full-stack expense tracking application built with a focus on elegant design and precision. The application helps users manage their finances with a Swiss watch-like interface—precise, elegant, and free from generic SaaS tropes.

### Key Mission
- Create a finance app with exceptional UX/UI design
- Support multiple user profiles (salaried, self-employed, businessman)
- Provide comprehensive expense tracking with multi-currency support
- Deliver detailed reports and analytics for financial insights

---

## Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB (async with Motor)
- **Authentication**: JWT + Google OAuth
- **API**: RESTful API with CORS enabled
- **Key Dependencies**:
  - FastAPI 0.110.1
  - Motor 3.3.1 (async MongoDB driver)
  - PyJWT 2.10.1 (JWT authentication)
  - Pydantic 2.6.4 (data validation)
  - Pandas & NumPy (data processing)

### Frontend
- **Framework**: React 19.0
- **Routing**: React Router v7.5.1
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Radix UI components (30+ pre-built components)
- **Form Management**: React Hook Form + Zod validation
- **Charts/Visualizations**: Recharts
- **Build Tool**: Create React App (with Craco configuration)
- **Additional Tools**:
  - Axios for HTTP requests
  - Date-fns for date handling
  - Lucide React for icons
  - Next-themes for theme management
  - Sonner for toast notifications

---

## Project Structure

```
ExpenseTrack/
├── src/
│   ├── backend/
│   │   ├── server.py              # Main FastAPI application
│   │   ├── requirements.txt       # Python dependencies
│   │   └── .env                   # Environment variables
│   │
│   ├── frontend/
│   │   ├── public/
│   │   │   └── index.html
│   │   ├── src/
│   │   │   ├── App.js             # Main routing component
│   │   │   ├── index.js           # Entry point
│   │   │   ├── pages/             # Page components
│   │   │   │   ├── LandingPage.jsx
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   ├── RegisterPage.jsx
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── ExpensesPage.jsx
│   │   │   │   ├── CategoriesPage.jsx
│   │   │   │   ├── ReportsPage.jsx
│   │   │   │   └── SettingsPage.jsx
│   │   │   ├── components/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── ui/            # 30+ Radix UI components
│   │   │   ├── hooks/
│   │   │   │   └── use-toast.js
│   │   │   └── lib/
│   │   │       └── utils.js
│   │   ├── package.json
│   │   ├── craco.config.js        # Create React App configuration override
│   │   ├── tailwind.config.js     # Tailwind CSS config
│   │   └── postcss.config.js
│   │
│   ├── design_guidelines.json     # Design system specification
│   ├── auth_testing.md            # Authentication testing guide
│   ├── test_result.md             # Test documentation
│   └── README.md
│
└── tests/
    └── __init__.py
```

---

## Design System & Branding

### Identity: "E1 - The Anti-AI Designer"
Principles:
- **Fusion over Imitation**: Mix Swiss typography with organic textures
- **Content is King**: Data is the hero, UI is the stage
- **Negative Space**: Luxury defined by what isn't there
- **Asymmetry**: Create tension to guide the eye

### Typography
| Type | Font | Usage |
|------|------|-------|
| Heading | Chivo, sans-serif (weights: 900, 700) | Landing page headlines, dashboard sections |
| Body | Public Sans, sans-serif (weights: 400, 500, 600) | General text, UI labels, form inputs |
| Mono | JetBrains Mono (weights: 400, 500) | Financial data, transaction IDs |

### Color Palette
| Name | Hex | Purpose |
|------|-----|---------|
| Primary (Deep Forest) | #064E3B | Main actions, primary elements |
| Secondary (Stone Mist) | #F3F4F6 | Secondary elements, backgrounds |
| Accent (Electric Lime) | #D9F99D | Highlights, call-to-attention |
| Income (Semantic) | #10B981 | Income transactions |
| Expense (Semantic) | #F43F5E | Expense transactions |
| Investment (Semantic) | #8B5CF6 | Investment transactions |

### Components
- **Buttons**: Rounded-full style with shadow effects
- **Inputs**: 12px height (h-12), rounded-lg, border-2
- **Cards**: Subtle shadows, hover effects, border-border/40
- **Containers**: Grid system (1 col mobile, 3 col tablet, 4 col desktop)

---

## Key Features

### 1. Authentication
- **Google OAuth Integration**
- **JWT-based session management** (7-day expiration)
- **Secure password hashing** with bcrypt
- **Email validation** with Pydantic

### 2. User Management
- Multiple profile types: Salaried, Self-employed, Businessman
- Multi-currency support (default: USD)
- User preferences and settings
- Profile picture support

### 3. Expense Tracking
- Create, read, update, delete expenses
- Categorize expenses
- Multi-currency transactions
- Date-based filtering

### 4. Categories
- Pre-defined and custom categories
- Category management page
- Income/Expense/Investment classifications

### 5. Reports & Analytics
- Expense reports with visualizations
- Chart generation (Recharts)
- Expense trends and patterns
- Multi-period comparison

### 6. Dashboard
- Overview of recent transactions
- Summary statistics
- Quick actions
- Visual data representation

---

## Database Models (MongoDB)

### Collections
1. **users**: User profiles and preferences
   - user_id, email, name, profile_type, preferred_currency, picture, created_at

2. **user_sessions**: Session management
   - user_id, session_token, expires_at, created_at

3. **expenses**: Transaction records
   - user_id, category_id, amount, currency, date, description, created_at

4. **categories**: Expense categories
   - user_id, category_id, name, type (income/expense/investment), color, icon

5. **reports**: Pre-generated or cached reports
   - user_id, period, summary_data, generated_at

---

## API Endpoints (FastAPI)

### Authentication Routes (`/api/auth/`)
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/session` - Session verification (OAuth callback)
- `GET /auth/me` - Get current user (protected)
- `POST /auth/logout` - User logout

### Expense Routes (`/api/expenses/`)
- `GET /expenses` - List user expenses (protected)
- `POST /expenses` - Create expense (protected)
- `GET /expenses/{expense_id}` - Get expense details (protected)
- `PUT /expenses/{expense_id}` - Update expense (protected)
- `DELETE /expenses/{expense_id}` - Delete expense (protected)

### Category Routes (`/api/categories/`)
- `GET /categories` - List categories (protected)
- `POST /categories` - Create category (protected)
- `PUT /categories/{category_id}` - Update category (protected)
- `DELETE /categories/{category_id}` - Delete category (protected)

### Reports Routes (`/api/reports/`)
- `GET /reports` - Generate/fetch reports (protected)
- `GET /reports/summary` - Get expense summary (protected)

### Settings Routes (`/api/settings/`)
- `GET /settings` - Get user settings (protected)
- `PUT /settings` - Update user settings (protected)

---

## Frontend Routing

| Path | Component | Purpose |
|------|-----------|---------|
| `/` | LandingPage | Home page for unauthenticated users |
| `/login` | LoginPage | User login |
| `/register` | RegisterPage | User registration |
| `/dashboard` | Dashboard | Main dashboard (protected) |
| `/expenses` | ExpensesPage | Expense management (protected) |
| `/categories` | CategoriesPage | Category management (protected) |
| `/reports` | ReportsPage | Reports & analytics (protected) |
| `/settings` | SettingsPage | User settings (protected) |
| `/auth/callback` | AuthCallback | Google OAuth callback handler |

---

## Environment Configuration

### Backend (.env)
```
MONGO_URL=mongodb+srv://...
DB_NAME=expense_tracker_db
JWT_SECRET=expense-tracker-secret-key-2024
JWT_ALGORITHM=HS256
JWT_EXPIRATION_DAYS=7
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=http://localhost:8000
REACT_APP_API_BASE_URL=http://localhost:8000/api
```

---

## Development Guidelines

### Code Organization
1. **Backend**: Organized by routes (auth, expenses, categories, reports, settings)
2. **Frontend**: Organized by pages and reusable components
3. **UI Components**: Modular Radix UI wrapper components in `/src/components/ui/`

### Best Practices
- ✅ Use Pydantic models for data validation in backend
- ✅ Implement proper error handling with HTTPException
- ✅ Use async/await for MongoDB operations
- ✅ Implement JWT token verification on protected routes
- ✅ Use React Hook Form + Zod for frontend form validation
- ✅ Follow Tailwind CSS conventions for styling
- ✅ Use semantic HTML and accessibility best practices
- ✅ Implement proper CORS configuration

### Important Reminders
- **DO NOT hardcode redirect URLs** in OAuth authentication (breaks auth)
- **Use environment variables** for sensitive data
- **Always validate input** on both client and server side
- **Implement proper session management** with expiration
- **Use secure HTTP headers** for API responses

---

## Testing

### Backend Testing
- Unit tests for models and utilities
- Integration tests for API endpoints
- Authentication flow testing (see auth_testing.md)
- Database transaction testing

### Frontend Testing
- Component testing with React Testing Library
- Integration tests for page flows
- E2E testing for critical paths (login, expense creation, etc.)

---

## Deployment Considerations

1. **Backend**: Deploy FastAPI application (e.g., Heroku, AWS, DigitalOcean)
2. **Frontend**: Build and deploy static files (e.g., Netlify, Vercel, S3)
3. **Database**: MongoDB Atlas for cloud database
4. **Security**: 
   - Enable HTTPS
   - Set secure CORS origins
   - Implement rate limiting
   - Use environment variables for secrets

---

## Common Development Tasks

### Adding a New Expense Category
1. Create endpoint in backend (`server.py`)
2. Add Pydantic model for request/response
3. Implement MongoDB query
4. Create frontend form component in CategoriesPage
5. Test both backend and frontend

### Adding a New Report Type
1. Implement report generation logic in backend
2. Create new report route
3. Build visualization component in frontend using Recharts
4. Add report page or tab in ReportsPage

### Modifying Design System
1. Update `design_guidelines.json` with new specifications
2. Update Tailwind configuration if needed
3. Modify component styles in `src/components/ui/`
4. Test across all pages for consistency

---

## Key File Descriptions

| File | Purpose |
|------|---------|
| [design_guidelines.json](design_guidelines.json) | Complete design system specification with colors, typography, and components |
| [auth_testing.md](auth_testing.md) | Testing playbook for authentication flows |
| [server.py](backend/server.py) | Core FastAPI application with all API routes |
| [App.js](frontend/src/App.js) | Main routing and layout component for React app |
| [package.json](frontend/package.json) | Frontend dependencies and scripts |
| [requirements.txt](backend/requirements.txt) | Backend Python dependencies |

---

## Getting Started

### Backend Setup
```bash
cd src/backend
pip install -r requirements.txt
python server.py
```

### Frontend Setup
```bash
cd src/frontend
npm install
npm start
```

### Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

---

## Notes for Copilot
- Refer to `design_guidelines.json` for all design system specifications
- Follow the existing component structure in `src/components/ui/`
- Always validate data with Pydantic models in backend
- Use React Hook Form for frontend form handling
- Maintain consistency with the "E1 - The Anti-AI Designer" principles
- Check `auth_testing.md` for authentication testing requirements
- Use Tailwind CSS utility classes following the design system
- Ensure all protected routes require JWT authentication



# ExpenseTrack - Copilot Instructions

## Project Overview

ExpenseTrack is a full-stack expense tracking application with a React frontend and a FastAPI backend using MongoDB. Authentication is handled via JWT (email/password only). Google OAuth is not used.

---

## Key Setup Points

- **Frontend**: React 19, Tailwind CSS, Radix UI, React Hook Form, Zod, Axios, Sonner
- **Backend**: FastAPI, MongoDB (Motor), Uvicorn, Pydantic, JWT (PyJWT), bcrypt, python-dotenv, Starlette CORS
- **Database**: MongoDB (collections: users, categories, expenses)
- **Auth**: JWT-based, email/password only
- **CORS**: Configured for local development (localhost:3000 <-> localhost:8000)

---

## How to Use Copilot

- Use this file as a reference for project structure, tech stack, and setup.
- For backend or frontend changes, always check the respective instructions.md files.
- For database schema, see backend/instructions.md or the backend code (server.py).
- For troubleshooting, check the README files and .env configuration.

---

## Recent Changes

- Google OAuth removed from both backend and frontend.
- Only email/password JWT authentication is present.
- CORS configured for local development.
- Database collections and schemas are managed automatically by the backend.

---

## Quick Start

1. Start MongoDB (local or Atlas).
2. Configure .env files for backend and frontend.
3. Start backend (Uvicorn) and frontend (npm start).
4. Register a user and begin using the app.

---

For more details, see the instructions.md files in backend and frontend folders.
