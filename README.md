# ExpenseTrack

ExpenseTrack is a modern, full-stack expense tracking application designed for precision, elegance, and a premium user experience. It helps users manage their finances with multi-currency support, detailed analytics, and a beautiful, custom UI.

---

## Project Summary

- **Elegant Swiss-inspired UI/UX**
- Multiple user profiles (salaried, self-employed, businessman)
- Multi-currency expense tracking
- Detailed reports and analytics

---

## Tech Stack

**Backend:** FastAPI (Python), MongoDB (Motor), JWT (PyJWT), bcrypt, Pydantic, Uvicorn, Starlette CORS

**Frontend:** React 19, Tailwind CSS, Radix UI, React Hook Form, Zod, Axios, Sonner, Recharts

---

## Project Structure

```
ExpenseTrack/
├── src/
│   ├── backend/
│   │   ├── server.py              # Main FastAPI application
│   │   ├── requirements.txt       # Python dependencies
│   │   └── .env                   # Environment variables
│   ├── frontend/
│   │   ├── public/
│   │   │   └── index.html
│   │   ├── src/
│   │   │   ├── App.js             # Main routing component
│   │   │   ├── index.js           # Entry point
│   │   │   ├── pages/             # Page components
│   │   │   ├── components/        # Shared and UI components
│   │   │   ├── hooks/             # Custom React hooks
│   │   │   └── lib/               # Utility functions
│   │   ├── package.json
│   │   ├── craco.config.js
│   │   ├── tailwind.config.js
│   │   └── postcss.config.js
│   ├── design_guidelines.json     # Design system
│   ├── auth_testing.md            # Auth testing guide
│   ├── test_result.md             # Test documentation
│   └── README.md
└── tests/
	└── __init__.py
```

---

## Key Features

- **Authentication:** JWT-based (email/password only), secure password hashing (bcrypt)
- **User Management:** Multiple profiles, preferences, profile picture
- **Expense Tracking:** CRUD, categories, multi-currency, date filtering
- **Categories:** Pre-defined/custom, management UI, income/expense/investment
- **Reports & Analytics:** Visualizations, trends, comparisons (Recharts)
- **Dashboard:** Recent transactions, summary stats, quick actions

---

## Database Models (MongoDB)

**users**: user_id, email, name, profile_type, preferred_currency, picture, created_at
**categories**: user_id, category_id, name, color, icon, subcategories, created_at
**expenses**: user_id, expense_id, category_id, amount, currency, date, description, created_at

Collections and schemas are managed automatically by the backend—no manual setup required.

---

## API Endpoints (FastAPI)

**/api/auth/**: register, login, me, logout
**/api/expenses/**: list, create, update, delete
**/api/categories/**: list, create, update, delete
**/api/reports/**: summary, export, import

---

## Environment Configuration

**Backend (.env):**

```
MONGO_URL=mongodb://localhost:27017
DB_NAME=expense_tracker_db
JWT_SECRET=your-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRATION_DAYS=7
```

**Frontend (.env):**

```
REACT_APP_BACKEND_URL=http://localhost:8000
```

---

## Getting Started

### Backend

```bash
cd src/backend
pip install -r requirements.txt
python server.py
```

### Frontend

```bash
cd src/frontend
npm install
npm start
```

### Access

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## Development & Design

- Modular code: backend (routes, models), frontend (pages, components, hooks)
- UI: Tailwind CSS, Radix UI, custom design system (see design_guidelines.json)
- Forms: React Hook Form + Zod
- Charts: Recharts
- Toasts: Sonner

---

## Best Practices

- Use Pydantic for backend validation
- Use React Hook Form + Zod for frontend forms
- Validate input on both client and server
- Use environment variables for secrets/config
- CORS enabled for local dev
- All protected routes require JWT

---

## Testing

- Backend: unit/integration tests, auth flow, DB transactions
- Frontend: component/integration/E2E tests

---

## Deployment

- Backend: Deploy FastAPI (Heroku, AWS, DigitalOcean, etc.)
- Frontend: Deploy static build (Netlify, Vercel, S3, etc.)
- Database: MongoDB Atlas or self-hosted

---

## Contributing

See the code structure, follow the design system, and use the provided instructions and testing guides. For questions, see the respective README or instructions.md files in backend/frontend.

---

## License

MIT
