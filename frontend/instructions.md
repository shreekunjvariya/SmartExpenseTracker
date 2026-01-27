# ExpenseTrack Frontend - Comprehensive Instructions

## Overview

The frontend for ExpenseTrack is a modern, responsive React application. It provides a beautiful, user-friendly interface for managing expenses, categories, reports, and user profiles, following a custom design system for a premium finance experience.

---

## Tech Stack & Rationale

- **React 19**: Modern, component-based UI library. Chosen for its flexibility, ecosystem, and performance.
- **React Router v7**: Handles client-side routing for a single-page app experience.
- **Tailwind CSS**: Utility-first CSS framework for rapid, consistent, and responsive design.
- **Radix UI**: Accessible, headless UI primitives for building custom components.
- **React Hook Form + Zod**: For robust, type-safe form validation and management.
- **Recharts**: For interactive, customizable data visualizations.
- **Axios**: Promise-based HTTP client for API requests.
- **Craco**: Customizes Create React App without ejecting, for advanced configuration.
- **Sonner**: For toast notifications.

---

## Folder Structure

```
frontend/
├── .env                  # Frontend environment variables
├── package.json          # All dependencies and scripts
├── craco.config.js       # Custom CRA config
├── tailwind.config.js    # Tailwind CSS config
├── postcss.config.js     # PostCSS config
├── public/
│   └── index.html        # HTML template
└── src/
    ├── App.js            # Main routing/layout
    ├── index.js          # Entry point
    ├── pages/            # Page components (Dashboard, Expenses, etc.)
    ├── components/       # Shared and UI components
    │   └── ui/           # Radix UI wrappers
    ├── hooks/            # Custom React hooks
    └── lib/              # Utility functions
```

---

## Environment Variables (.env)

- `REACT_APP_BACKEND_URL`: Backend API base URL (e.g., http://localhost:8000)
- `REACT_APP_API_BASE_URL`: Full API prefix (e.g., http://localhost:8000/api)

---

## Key Features & How They Work

### 1. Authentication (Updated)

- Login/register with email and password (JWT-based).
- **Google OAuth is not used.**
- Auth state managed via cookies and React context.

---

## Environment Variables (.env) (Updated)

- `REACT_APP_BACKEND_URL`: Backend API base URL (should be http://localhost:8000 for local development)

---

## Troubleshooting

- If you see `Failed to execute 'json' on 'Response': body stream already read`, check that the backend is running, accessible, and returns JSON responses.
- Make sure CORS is configured correctly in the backend and the frontend is using the correct backend URL.

---

### 2. Dashboard

- Overview of recent transactions, summary stats, and quick actions.
- Visual data representation using Recharts.

### 3. Expenses

- Add, edit, delete, and filter expenses.
- Multi-currency support and date-based filtering.

### 4. Categories

- Manage categories and subcategories.
- Custom icons and colors for personalization.

### 5. Reports & Analytics

- Visualize spending trends, category breakdowns, and export/import CSV.
- Interactive charts and summary cards.

### 6. Settings

- Update user profile, currency, and preferences.

---

## How to Run (CMD Prompt)

1. Navigate to frontend folder:
   ```cmd
   cd /d "d:\Shree\Expense Teck Project\ExpenseTrack\src\frontend"
   ```
2. Clean install dependencies:
   ```cmd
   rmdir /s /q node_modules
   del package-lock.json
   npm install ajv@8.12.0 ajv-keywords@5.1.0 --save-dev
   npm install --legacy-peer-deps
   npm install react-is
   ```
3. Configure `.env` as needed (see above).
4. Start the development server:
   ```cmd
   npm start
   ```
5. Access the app at: http://localhost:3000

---

## Design System

- See `design_guidelines.json` for all typography, color, and component specs.
- UI is built with Radix UI and Tailwind for consistency and accessibility.
- Custom components in `src/components/ui/` follow the design system.

---

## Best Practices

- Use React Hook Form + Zod for all forms.
- Use Axios for API calls (with error handling and interceptors).
- Use Tailwind utility classes for layout and styling.
- Keep components modular and reusable.
- Use environment variables for all API endpoints.
- Test UI with React Testing Library.

---

## Troubleshooting

- If you see `Module not found: Can't resolve 'react-is'`, run `npm install react-is`.
- For peer dependency or ajv errors, follow the clean install steps above.
- If the backend is not running, API calls will fail (see backend instructions).

---

## Extending the Frontend

- Add new pages in `src/pages/` and routes in `App.js`.
- Add new UI components in `src/components/ui/`.
- Update the design system in `design_guidelines.json` as needed.
- Use the provided hooks and utilities for state management and API calls.

---

## References

- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Recharts](https://recharts.org/)
- [Axios](https://axios-http.com/)

---

This frontend is designed for extensibility, accessibility, and a premium user experience. For new features, follow the established patterns for components, state, and API integration.
