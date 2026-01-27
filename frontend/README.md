# ExpenseTrack Frontend

## Prerequisites
- **Node.js** v18 or higher (v22+ tested)
- **npm** v9 or higher

## Setup Instructions (Windows CMD)

### 1. Clone the repository (if not already done)
```
git clone <your-repo-url>
cd "d:\Shree\Expense Teck Project\ExpenseTrack\src\frontend"
```

### 2. Clean install dependencies
```
rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
npm install ajv@8.12.0 ajv-keywords@5.1.0 --save-dev
npm install --legacy-peer-deps
```

### 3. Configure environment variables
Create a `.env` file in the `frontend` folder if it doesn't exist:
```
REACT_APP_BACKEND_URL=http://localhost:8000
REACT_APP_API_BASE_URL=http://localhost:8000/api
```

### 4. Start the development server
```
npm start
```
- The app will be available at: http://localhost:3000

---

## Troubleshooting
- If you see `Error: Cannot find module 'ajv/dist/compile/codegen'`, follow the clean install steps above.
- If you upgrade Node.js, always delete `node_modules` and `package-lock.json` and reinstall.
- For peer dependency issues, use `--legacy-peer-deps` with `npm install`.

---

## Project Structure
- `src/` - React source code (components, pages, hooks, etc.)
- `public/` - Static files and HTML template
- `craco.config.js` - Custom Create React App configuration
- `tailwind.config.js` - Tailwind CSS configuration

---

## Useful Commands
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

---

## Backend Setup
See the main project README or `copilot-instructions.md` for backend setup and API details.
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
