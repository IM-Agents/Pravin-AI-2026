# 🔐 Full-Stack Authentication System

A complete authentication system built with **Node.js/Express** backend and **React** frontend, featuring JWT-based authentication, password hashing, and persistent user storage.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Security Features](#security-features)
- [Screenshots](#screenshots)

## ✨ Features

### Backend
- ✅ RESTful API with Express.js
- ✅ JWT (JSON Web Token) authentication
- ✅ Password hashing with bcrypt
- ✅ JSON file-based persistent storage (no database required)
- ✅ CORS configuration for frontend communication
- ✅ Comprehensive error handling
- ✅ Input validation

### Frontend
- ✅ Modern React application with Vite
- ✅ User signup and login pages
- ✅ Protected dashboard with user list
- ✅ Route protection for authenticated users
- ✅ Token management with localStorage
- ✅ Form validation and error handling
- ✅ Responsive design
- ✅ Loading states and user feedback

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **jsonwebtoken** - JWT implementation
- **bcryptjs** - Password hashing
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Context API** - State management

## 📁 Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── config.js          # Configuration settings
│   │   ├── controllers/
│   │   │   ├── authController.js  # Authentication logic
│   │   │   └── userController.js  # User management logic
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT authentication middleware
│   │   │   └── errorHandler.js    # Global error handler
│   │   ├── models/
│   │   │   └── UserStorage.js     # User storage (JSON file)
│   │   ├── routes/
│   │   │   ├── authRoutes.js      # Authentication routes
│   │   │   └── userRoutes.js      # User routes
│   │   ├── utils/
│   │   │   ├── jwt.js             # JWT utilities
│   │   │   └── password.js        # Password hashing utilities
│   │   └── server.js              # Express server setup
│   ├── data/
│   │   └── users.json             # User data storage (auto-generated)
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FormInput.jsx      # Reusable form input
│   │   │   ├── Navbar.jsx         # Navigation bar
│   │   │   ├── ProtectedRoute.jsx # Route protection wrapper
│   │   │   └── UserList.jsx       # User list display
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Authentication context
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx      # Dashboard page
│   │   │   ├── Login.jsx          # Login page
│   │   │   └── Signup.jsx         # Signup page
│   │   ├── services/
│   │   │   ├── api.js             # Axios instance with interceptors
│   │   │   └── authService.js     # Authentication API calls
│   │   ├── utils/
│   │   │   └── localStorage.js    # localStorage utilities
│   │   ├── App.jsx                # Main app component
│   │   ├── App.css                # Application styles
│   │   ├── index.css              # Global styles
│   │   └── main.jsx               # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   
   # Create .env file from example
   cp .env.example .env
   
   # Edit .env and set your JWT_SECRET
   # JWT_SECRET=your-super-secret-key-change-this
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

You need to run both backend and frontend servers:

#### Terminal 1 - Backend Server
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

#### Terminal 2 - Frontend Server
```bash
cd frontend
npm run dev
# App runs on http://localhost:3000
```

### First Time Setup

1. Open your browser and navigate to `http://localhost:3000`
2. Click "Sign up" to create a new account
3. Fill in your details and submit
4. You'll be automatically logged in and redirected to the dashboard
5. The dashboard displays all registered users

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### 1. User Signup
```http
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe" // optional
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "1234567890",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2. User Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "1234567890",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 3. Verify Token
```http
GET /auth/verify
Authorization: Bearer <token>
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "user": {
      "id": "1234567890",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### 4. Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Logout successful. Please remove token from client."
}
```

#### 5. Get All Users
```http
GET /users
Authorization: Bearer <token>
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": "1234567890",
        "email": "user@example.com",
        "name": "John Doe",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "count": 1
  }
}
```

### Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

Common status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `409` - Conflict (user already exists)
- `500` - Internal Server Error

## 🔧 Environment Variables

### Backend (.env)

```env
PORT=5000                          # Server port
JWT_SECRET=your-secret-key         # Secret key for JWT signing (CHANGE THIS!)
JWT_EXPIRES_IN=24h                 # Token expiration time
NODE_ENV=development               # Environment (development/production)
CORS_ORIGIN=http://localhost:3000  # Allowed CORS origin
```

**⚠️ Important:** Always change `JWT_SECRET` to a strong, random string in production!

## 🔒 Security Features

1. **Password Hashing**
   - Passwords are hashed using bcrypt with salt rounds
   - Plain text passwords are never stored

2. **JWT Authentication**
   - Stateless authentication using JSON Web Tokens
   - Tokens expire after 24 hours (configurable)
   - Tokens are verified on every protected route

3. **Input Validation**
   - Email format validation
   - Password length requirements (minimum 6 characters)
   - Required field validation

4. **CORS Protection**
   - Configured to only allow requests from specified origins
   - Prevents unauthorized cross-origin requests

5. **Error Handling**
   - Sensitive information is not exposed in error messages
   - Generic error messages for authentication failures

## 🎨 Frontend Features

### Authentication Flow

1. **Signup Flow**
   - User fills signup form
   - Frontend validates input
   - API creates user and returns token
   - Token stored in localStorage
   - User redirected to dashboard

2. **Login Flow**
   - User enters credentials
   - API validates and returns token
   - Token stored in localStorage
   - User redirected to dashboard

3. **Protected Routes**
   - Dashboard requires authentication
   - Unauthenticated users redirected to login
   - Token verified on app load

4. **Logout Flow**
   - Token removed from localStorage
   - User state cleared
   - Redirect to login page

### State Management

- **AuthContext** provides global authentication state
- Automatic token verification on app load
- Persistent login across page refreshes
- Automatic logout on token expiration

## 🧪 Testing the Application

### Manual Testing Steps

1. **Test Signup**
   - Navigate to signup page
   - Create a new account
   - Verify redirect to dashboard
   - Check that user appears in user list

2. **Test Login**
   - Logout from dashboard
   - Login with created credentials
   - Verify successful login and redirect

3. **Test Protected Routes**
   - Try accessing `/dashboard` without login
   - Verify redirect to login page

4. **Test Token Persistence**
   - Login and refresh the page
   - Verify you remain logged in

5. **Test Logout**
   - Click logout button
   - Verify redirect to login
   - Try accessing dashboard (should redirect to login)

## 📝 Development Notes

### Data Storage

- User data is stored in `backend/data/users.json`
- File is automatically created on first user signup
- Data persists between server restarts
- For production, consider migrating to a proper database

### Token Storage

- Tokens are stored in browser's localStorage
- **Security Note:** localStorage is vulnerable to XSS attacks
- For production, consider using httpOnly cookies

### CORS Configuration

- Backend allows requests from `http://localhost:3000` by default
- Update `CORS_ORIGIN` in `.env` for different frontend URLs

## 🚀 Production Deployment

### Backend Deployment Checklist

- [ ] Set strong `JWT_SECRET` in environment variables
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper CORS origins
- [ ] Use a proper database instead of JSON file
- [ ] Implement rate limiting
- [ ] Add request logging
- [ ] Set up HTTPS
- [ ] Implement refresh tokens
- [ ] Add password reset functionality

### Frontend Deployment Checklist

- [ ] Update API base URL to production backend
- [ ] Build production bundle: `npm run build`
- [ ] Configure environment variables
- [ ] Set up proper error tracking
- [ ] Implement analytics (optional)
- [ ] Add loading states for all async operations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built with ❤️ by Codegen

---

**Happy Coding! 🚀**

