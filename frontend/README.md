# Frontend - React Authentication App

Modern React application with authentication, protected routes, and user management.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:3000`

## 📦 Dependencies

- **react** - UI library
- **react-dom** - React DOM renderer
- **react-router-dom** - Client-side routing
- **axios** - HTTP client
- **vite** - Build tool and dev server

## 🎨 Features

### Pages
- **Login** (`/login`) - User login page
- **Signup** (`/signup`) - User registration page
- **Dashboard** (`/dashboard`) - Protected page showing all users

### Components
- **ProtectedRoute** - Wrapper for protected routes
- **FormInput** - Reusable form input component
- **Navbar** - Navigation bar with user info and logout
- **UserList** - Display grid of registered users

### State Management
- **AuthContext** - Global authentication state
  - User information
  - Authentication status
  - Login/Signup/Logout functions

### Services
- **api.js** - Axios instance with interceptors
  - Automatic token injection
  - Token expiration handling
- **authService.js** - Authentication API calls

## 🔧 Configuration

The app connects to the backend at `http://localhost:5000/api` by default.

To change this, update `API_BASE_URL` in `src/services/api.js`:

```javascript
const API_BASE_URL = 'http://your-backend-url/api';
```

Or use Vite's proxy configuration in `vite.config.js`.

## 🔒 Authentication Flow

### Signup
1. User fills signup form
2. Form validation (email format, password length, password match)
3. API call to `/api/auth/signup`
4. Token and user data stored in localStorage
5. Redirect to dashboard

### Login
1. User enters credentials
2. Form validation
3. API call to `/api/auth/login`
4. Token and user data stored in localStorage
5. Redirect to dashboard

### Protected Routes
1. ProtectedRoute checks authentication status
2. If not authenticated, redirect to login
3. If authenticated, render protected component

### Logout
1. Clear localStorage (token and user data)
2. Clear AuthContext state
3. Redirect to login page

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── FormInput.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── UserList.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   └── Signup.jsx
│   ├── services/
│   │   ├── api.js
│   │   └── authService.js
│   ├── utils/
│   │   └── localStorage.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

## 🎨 Styling

The app uses custom CSS with CSS variables for theming:

```css
:root {
  --primary-color: #4f46e5;
  --secondary-color: #64748b;
  --success-color: #10b981;
  --error-color: #ef4444;
  /* ... more variables */
}
```

### Responsive Design
- Mobile-first approach
- Breakpoint at 768px for tablets/mobile
- Flexible grid layouts

## 🧪 Testing the App

### Manual Testing Checklist

- [ ] Signup with new user
- [ ] Login with existing user
- [ ] View dashboard and user list
- [ ] Logout and verify redirect
- [ ] Try accessing dashboard without login
- [ ] Refresh page while logged in
- [ ] Test form validation errors
- [ ] Test with invalid credentials

## 🔐 Security Notes

### Token Storage
- Tokens are stored in localStorage
- **Warning:** localStorage is vulnerable to XSS attacks
- For production, consider httpOnly cookies

### Best Practices Implemented
- Automatic token injection in API calls
- Automatic logout on token expiration
- Protected routes prevent unauthorized access
- Form validation prevents invalid data
- Error messages don't expose sensitive info

## 🚀 Production Build

```bash
# Build for production
npm run build

# Output will be in dist/ folder
# Deploy the dist/ folder to your hosting service
```

### Environment Variables

For production, you may want to use environment variables:

```javascript
// .env.production
VITE_API_URL=https://your-api.com/api
```

Then update `src/services/api.js`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🎯 Future Enhancements

- [ ] Remember me functionality
- [ ] Password strength indicator
- [ ] Email verification
- [ ] Password reset
- [ ] Profile editing
- [ ] Avatar upload
- [ ] Dark mode
- [ ] Internationalization (i18n)

