# Backend - Authentication API

Node.js/Express backend with JWT authentication and JSON file storage.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and set your JWT_SECRET

# Run development server
npm run dev

# Run production server
npm start
```

## 📦 Dependencies

- **express** - Web framework
- **jsonwebtoken** - JWT implementation
- **bcryptjs** - Password hashing
- **cors** - CORS middleware
- **dotenv** - Environment variables

## 🔧 Configuration

Create a `.env` file with:

```env
PORT=5000
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=24h
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

## 📚 API Endpoints

### Public Routes
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user

### Protected Routes (require JWT token)
- `GET /api/auth/verify` - Verify token
- `POST /api/auth/logout` - Logout user
- `GET /api/users` - Get all users

## 🗂 Data Storage

User data is stored in `data/users.json`. The file is automatically created on first use.

**Example user object:**
```json
{
  "id": "1234567890",
  "email": "user@example.com",
  "password": "$2a$10$...", // hashed
  "name": "John Doe",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## 🔒 Security

- Passwords are hashed with bcrypt (10 salt rounds)
- JWT tokens expire after 24 hours
- CORS configured for specific origins
- Input validation on all endpoints
- Error messages don't expose sensitive info

## 🧪 Testing with cURL

### Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Get Users (with token)
```bash
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── models/          # Data models
│   ├── routes/          # Route definitions
│   ├── utils/           # Utility functions
│   └── server.js        # Main server file
├── data/                # JSON storage
├── package.json
└── .env
```

