# ExpenseTrack Backend - Comprehensive Instructions

## Overview

The backend for ExpenseTrack is a robust, scalable RESTful API built with FastAPI (Python). It manages authentication, user profiles, expenses, categories, reports, and analytics, and is designed for security, extensibility, and performance.

---

## Tech Stack & Rationale

- **FastAPI**: Modern, async Python web framework. Chosen for speed, type safety, and automatic OpenAPI docs.
- **MongoDB (Motor)**: NoSQL database, async driver. Chosen for flexible schema, scalability, and easy JSON storage.
- **Uvicorn**: ASGI server for running FastAPI apps. Chosen for async support and hot-reload in development.
- **Pydantic**: Data validation and settings management. Ensures strict type checking and clear API contracts.
- **JWT (PyJWT)**: Secure, stateless authentication for API endpoints.
- **bcrypt**: Secure password hashing.
- **httpx**: Async HTTP client for external API calls (e.g., Google OAuth).
- **python-dotenv**: Loads environment variables from .env files for configuration.
- **Starlette CORS Middleware**: Handles cross-origin requests for frontend-backend communication.

---

## Folder Structure

```
backend/
├── .env                # Environment variables (never commit secrets)
├── requirements.txt    # All Python dependencies
├── server.py           # Main FastAPI application
└── instructions.md     # This documentation
```

---

## Environment Variables (.env)

- `MONGO_URL`: MongoDB connection string (e.g., mongodb://localhost:27017)
- `DB_NAME`: Database name (e.g., test_database)
- `CORS_ORIGINS`: Allowed origins for CORS (e.g., http://localhost:3000)
- `JWT_SECRET`: Secret key for JWT signing

---

## Authentication (Updated)

- **Only email/password JWT authentication is supported.**
- Google OAuth and all related code have been removed.
- JWT is issued on login/register and set as a secure cookie.
- All protected endpoints require this token.
- Passwords are hashed with bcrypt before storage.

---

## Database Setup (MongoDB)

- No manual collection or schema setup is required.
- Collections (`users`, `categories`, `expenses`) are created automatically by the backend.
- Schemas are defined in server.py using Pydantic models.

---

## Troubleshooting

- If you see `Failed to execute 'json' on 'Response': body stream already read`, check that the backend always returns a JSON response (even on error) and that CORS is configured correctly.
- Make sure the backend is running and accessible at the URL in your frontend .env.

---

---

## Key Features & How They Work

### 1. Authentication

- **JWT Auth**: On login/register, a JWT is issued and set as a secure cookie. All protected endpoints require this token.
- **Google OAuth**: Handles session tokens from Google via Emergent Auth. User sessions are stored in MongoDB.
- **Password Hashing**: All passwords are hashed with bcrypt before storage.

### 2. User Management

- Users have profile types (salaried, self-employed, businessman), preferred currency, and profile picture.
- On registration, default categories are created based on profile type.

### 3. Categories & Subcategories

- Users can create, update, delete categories and subcategories.
- Default categories are provided for each profile type.
- Categories are stored per user for privacy and customization.

### 4. Expenses

- CRUD operations for expenses (create, read, update, delete).
- Expenses are linked to categories and subcategories.
- Multi-currency support with conversion endpoints.

### 5. Reports & Analytics

- Summary reports by week, month, year.
- Grouping by category, daily trends, and CSV export/import.
- Dashboard stats: this month, last month, all time, and percentage change.

### 6. Currencies

- List of supported currencies and demo exchange rates.
- Currency conversion endpoint for analytics and reporting.

---

## API Endpoints (Summary)

- `/api/auth/register` - Register new user
- `/api/auth/login` - Login with email/password
- `/api/auth/session` - Google OAuth session
- `/api/auth/me` - Get current user info
- `/api/auth/logout` - Logout and clear session
- `/api/auth/profile` - Update user profile
- `/api/categories` - CRUD for categories
- `/api/expenses` - CRUD for expenses
- `/api/reports/summary` - Get expense summary
- `/api/reports/export` - Export expenses as CSV
- `/api/reports/import` - Import expenses from CSV
- `/api/currencies` - List currencies and rates
- `/api/currencies/convert` - Convert between currencies
- `/api/dashboard/stats` - Dashboard analytics

---

## How to Run (CMD Prompt)

1. Navigate to backend folder:
   ```cmd
   cd /d "d:\Shree\Expense Teck Project\ExpenseTrack\src\backend"
   ```
2. (Optional) Create and activate a virtual environment:
   ```cmd
   python -m venv venv
   venv\Scripts\activate
   ```
3. Install dependencies:
   ```cmd
   pip install -r requirements.txt
   ```
4. Ensure MongoDB is running at the address in `.env`.
5. Start the server:
   ```cmd
   uvicorn server:app --reload --host 0.0.0.0 --port 8000
   ```
6. Access API docs at: http://localhost:8000/docs

---

## Security & Best Practices

- All sensitive data is stored in environment variables.
- Passwords are never stored in plain text.
- JWT tokens are set as HTTP-only cookies for security.
- CORS is configured for frontend-backend separation.
- All endpoints validate input with Pydantic models.
- Async database operations for scalability.

---

## Development & Testing

- Use `pytest` for backend tests.
- Linting: `flake8`, `black`, `isort`, `mypy` for code quality.
- Test authentication flows using the provided `auth_testing.md`.
- Use the OpenAPI docs for manual endpoint testing.

---

## Extending the Backend

- Add new endpoints by defining new routes in `server.py`.
- Add new models with Pydantic for strict validation.
- Use async/await for all database and network operations.
- Update requirements.txt when adding new dependencies.

---

## Troubleshooting

- If you see `ModuleNotFoundError`, install the missing package with `pip install <package>`.
- If MongoDB connection fails, check your `MONGO_URL` and that MongoDB is running.
- For CORS errors, update `CORS_ORIGINS` in `.env`.

---

## References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Motor (Async MongoDB)](https://motor.readthedocs.io/)
- [Uvicorn](https://www.uvicorn.org/)
- [Pydantic](https://docs.pydantic.dev/)
- [PyJWT](https://pyjwt.readthedocs.io/)
- [bcrypt](https://pypi.org/project/bcrypt/)
- [httpx](https://www.python-httpx.org/)

---

This backend is designed for extensibility, security, and performance. For any new features, follow the established patterns for models, endpoints, and async operations.
