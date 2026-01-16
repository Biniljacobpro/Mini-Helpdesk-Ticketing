# Mini Helpdesk Ticketing System

A secure, full-stack helpdesk ticketing application built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring JWT authentication and comprehensive ticket management.

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Why MongoDB?](#why-mongodb)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [JWT Security Implementation](#jwt-security-implementation)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)

## 🛠️ Tech Stack

### Frontend
- **React** (v18.2.0) - UI library
- **React Router** (v6.21.0) - Client-side routing
- **Axios** (v1.6.2) - HTTP client
- **Vite** (v5.0.8) - Build tool and dev server

### Backend
- **Node.js** with **Express.js** (v4.18.2) - REST API server
- **MongoDB** with **Mongoose** (v8.0.3) - Database and ODM
- **JWT** (jsonwebtoken v9.0.2) - Authentication tokens
- **bcryptjs** (v2.4.3) - Password hashing
- **CORS** (v2.8.5) - Cross-origin resource sharing

### Database
- **MongoDB Atlas** - Cloud-hosted NoSQL database

### Authentication
- **Custom JWT-based authentication** with email/password
- **bcrypt** password hashing (10 salt rounds)
- Token expiration: 7 days (configurable)

## ✨ Features

### Authentication
- ✅ User signup with email/password validation
- ✅ Secure login with JWT token generation
- ✅ Password hashing using bcrypt
- ✅ Protected routes requiring valid JWT
- ✅ Automatic token refresh and error handling
- ✅ Logout functionality

### Ticket Management
- ✅ Create tickets with title, description, priority, and category
- ✅ View all user tickets (isolated per user)
- ✅ Update ticket status (Open ↔ Closed)
- ✅ Delete tickets
- ✅ View detailed ticket information
- ✅ Form validation (title min 5 chars, description min 15 chars)

### Filtering & Sorting
- ✅ Filter by status (Open/Closed)
- ✅ Filter by priority (High/Medium/Low)
- ✅ Automatic sorting: Open first → Priority order (High→Medium→Low) → Latest first
- ✅ Clear filters option

### Security
- ✅ JWT-based authentication on all protected routes
- ✅ User isolation - users can only access their own tickets
- ✅ Proper HTTP status codes (401, 403, 404, 500)
- ✅ Token validation on every API request
- ✅ Authorization header: `Bearer <token>`
- ✅ Never trust frontend - always use JWT user ID on backend

### UI/UX
- ✅ Clean dark theme (charcoal background #1a1a1a)
- ✅ Single font family (Inter)
- ✅ Color-coded priority badges (High=red, Medium=orange, Low=green)
- ✅ Status badges (Open=blue, Closed=gray)
- ✅ Responsive design
- ✅ Modal-based ticket creation and details
- ✅ Empty states and loading indicators
- ✅ Error handling with user-friendly messages

## 🗃️ Why MongoDB?

MongoDB was chosen over Supabase PostgreSQL for this project due to:

1. **Familiarity**: Extensive experience with MongoDB and Mongoose ODM
2. **Schema Flexibility**: NoSQL structure allows easy iteration during development
3. **Developer Experience**: Excellent tooling with MongoDB Atlas and Compass
4. **Performance**: Fast document-based queries suitable for ticket management
5. **Simplicity**: Straightforward setup with Mongoose models and validation

While Supabase offers excellent features, MongoDB provides a more comfortable and familiar development environment for this use case.

## 📁 Project Structure

```
Mini Helpdesk Ticketing/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Signup, login, getMe
│   │   └── ticketController.js   # CRUD operations for tickets
│   ├── middleware/
│   │   └── auth.js               # JWT verification middleware
│   ├── models/
│   │   ├── User.js               # User schema
│   │   └── Ticket.js             # Ticket schema
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   └── ticketRoutes.js       # Ticket endpoints
│   ├── .env                      # Environment variables (not in repo)
│   ├── .env.example              # Example env file
│   ├── .gitignore
│   ├── package.json
│   └── server.js                 # Express app entry point
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── ProtectedRoute.jsx # Route guard component
    │   ├── context/
    │   │   └── AuthContext.jsx    # Auth state management
    │   ├── hooks/
    │   │   └── useAuth.js         # Auth hook
    │   ├── pages/
    │   │   ├── Login.jsx          # Login page
    │   │   ├── Signup.jsx         # Signup page
    │   │   └── Tickets.jsx        # Main tickets page
    │   ├── styles/
    │   │   ├── Auth.css           # Auth page styles
    │   │   └── Tickets.css        # Tickets page styles
    │   ├── utils/
    │   │   └── api.js             # Axios instance with interceptors
    │   ├── App.jsx                # Main app component
    │   ├── main.jsx               # Entry point
    │   └── index.css              # Global styles
    ├── .env                       # Environment variables (not in repo)
    ├── .env.example               # Example env file
    ├── .gitignore
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## 🗄️ Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,              // MongoDB auto-generated
  email: String,              // Unique, required, lowercase
  password: String,           // bcrypt hashed, required, min 6 chars
  createdAt: Date             // Default: Date.now
}
```

**Indexes**: `email` (unique)

### Tickets Collection

```javascript
{
  _id: ObjectId,              // MongoDB auto-generated
  userId: ObjectId,           // Reference to User, required
  title: String,              // Required, min 5 chars
  description: String,        // Required, min 15 chars
  priority: String,           // Enum: ['High', 'Medium', 'Low'], required
  status: String,             // Enum: ['Open', 'Closed'], default: 'Open'
  category: String,           // Enum: ['Bug', 'Feature', 'Support', 'Other'], default: 'Other'
  createdAt: Date,            // Default: Date.now
  updatedAt: Date             // Default: Date.now, auto-updated
}
```

**Indexes**: `userId` (for user isolation queries)

## 🔒 JWT Security Implementation

### Token Generation (Backend)

```javascript
// controllers/authController.js
import jwt from 'jsonwebtoken';

const generateToken = (userId) => {
  return jwt.sign(
    { userId },                        // Payload: user ID only
    process.env.JWT_SECRET,            // Secret key (env variable)
    { expiresIn: process.env.JWT_EXPIRE || '7d' }  // Expiration
  );
};
```

### Token Verification (Middleware)

```javascript
// middleware/auth.js
export const protect = async (req, res, next) => {
  let token;

  // Extract token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // CRITICAL: Attach verified user ID to request
      req.userId = decoded.userId;
      
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
};
```

### User Isolation (Critical Security Rule)

**EVERY protected route MUST use `req.userId` from JWT, never trust frontend IDs:**

```javascript
// ✅ CORRECT: Filter by JWT user ID
const tickets = await Ticket.find({ userId: req.userId });

// ❌ WRONG: Never trust user ID from request body
const tickets = await Ticket.find({ userId: req.body.userId }); // NEVER DO THIS
```

### Token Storage (Frontend)

```javascript
// context/AuthContext.jsx
const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  const { token, user } = response.data;
  
  // Store in localStorage
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};
```

### Request Interceptor (Frontend)

```javascript
// utils/api.js
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;  // Attach token
  }
  return config;
});
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB Atlas account (or local MongoDB)
- Git

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd "Mini Helpdesk Ticketing"
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/helpdesk?retryWrites=true&w=majority
JWT_SECRET=your_super_secure_random_string_here_change_this
JWT_EXPIRE=7d
NODE_ENV=development
```

**MongoDB Atlas Setup:**
1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Database Access → Add user with password
4. Network Access → Add IP (0.0.0.0/0 for development)
5. Connect → Get connection string
6. Replace `<username>`, `<password>`, and database name in `.env`

Start backend server:
```bash
npm run dev
# Server runs on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install

# Create .env file
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm run dev
# App runs on http://localhost:3000
```

### 4. Access Application

Open browser to `http://localhost:3000`

1. Click "Sign up" to create account
2. Log in with credentials
3. Start creating tickets!

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### 1. Sign Up

```http
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "email": "user@example.com"
  }
}
```

#### 2. Log In

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "email": "user@example.com"
  }
}
```

#### 3. Get Current User

```http
GET /auth/me
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "email": "user@example.com"
  }
}
```

### Ticket Endpoints (All Protected)

#### 1. Create Ticket

```http
POST /tickets
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Login button not working",
  "description": "When I click the login button, nothing happens. The page just stays on the same screen.",
  "priority": "High",
  "category": "Bug"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Ticket created successfully",
  "ticket": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "title": "Login button not working",
    "description": "When I click the login button, nothing happens...",
    "priority": "High",
    "status": "Open",
    "category": "Bug",
    "createdAt": "2026-01-15T10:30:00.000Z",
    "updatedAt": "2026-01-15T10:30:00.000Z"
  }
}
```

#### 2. Get All Tickets (with filters)

```http
GET /tickets
Authorization: Bearer <token>

# Optional query parameters:
# ?status=Open
# ?priority=High
# ?status=Open&priority=High
```

**Response** (200 OK):
```json
{
  "success": true,
  "count": 2,
  "tickets": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
      "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
      "title": "Login button not working",
      "description": "When I click the login button...",
      "priority": "High",
      "status": "Open",
      "category": "Bug",
      "createdAt": "2026-01-15T10:30:00.000Z",
      "updatedAt": "2026-01-15T10:30:00.000Z"
    }
  ]
}
```

**Sorting Logic:**
1. Open tickets before Closed
2. Within same status: High → Medium → Low priority
3. Within same priority: Latest first (createdAt desc)

#### 3. Get Single Ticket

```http
GET /tickets/:id
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "ticket": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "title": "Login button not working",
    "description": "Full description...",
    "priority": "High",
    "status": "Open",
    "category": "Bug",
    "createdAt": "2026-01-15T10:30:00.000Z",
    "updatedAt": "2026-01-15T10:30:00.000Z"
  }
}
```

**Error** (403 Forbidden if not owner):
```json
{
  "success": false,
  "message": "Not authorized to access this ticket"
}
```

#### 4. Update Ticket Status

```http
PATCH /tickets/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "Closed"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Ticket updated successfully",
  "ticket": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "status": "Closed",
    "updatedAt": "2026-01-15T11:00:00.000Z",
    ...
  }
}
```

#### 5. Delete Ticket

```http
DELETE /tickets/:id
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Ticket deleted successfully"
}
```

### Error Responses

#### 401 Unauthorized (No/Invalid Token)
```json
{
  "success": false,
  "message": "Not authorized, token failed or expired"
}
```

#### 403 Forbidden (Not Owner)
```json
{
  "success": false,
  "message": "Not authorized to access this ticket"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Ticket not found"
}
```

#### 400 Bad Request
```json
{
  "success": false,
  "message": "Title must be at least 5 characters"
}
```

## 🔧 Environment Variables

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT signing | `your_random_string` |
| `JWT_EXPIRE` | Token expiration time | `7d` |
| `NODE_ENV` | Environment mode | `development` |

### Frontend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` |

## 🧪 Testing the Application

### Manual Testing Flow

1. **Sign Up**
   - Go to `/signup`
   - Enter email and password (min 6 chars)
   - Should redirect to `/tickets`

2. **Create Tickets**
   - Click "New Ticket"
   - Fill form (title min 5 chars, description min 15 chars)
   - Select priority and category
   - Submit

3. **Test Filters**
   - Create tickets with different statuses and priorities
   - Use filter dropdowns
   - Verify sorting (Open first, then High→Med→Low, then latest)

4. **Update Status**
   - Click "Close Ticket" on open ticket
   - Click "Reopen Ticket" on closed ticket
   - Verify status badge updates

5. **Test Security**
   - Log out
   - Try accessing `/tickets` → should redirect to login
   - Open DevTools → Application → Clear localStorage
   - Refresh → should redirect to login

### Using Postman/Thunder Client

Import the example requests from the API Documentation section above. Remember to:
1. Get token from signup/login response
2. Add `Authorization: Bearer <token>` header to all protected requests
3. Test user isolation by trying to access another user's ticket ID

## 📝 Development Notes

### Key Security Practices

1. **Never trust frontend IDs**: Always use `req.userId` from JWT
2. **Validate on both ends**: Frontend for UX, backend for security
3. **Proper HTTP codes**: 401 (auth), 403 (forbidden), 404 (not found)
4. **Password security**: bcrypt with 10 salt rounds
5. **Token expiration**: Set reasonable expiry (7 days default)

### Code Quality

- Clean folder structure
- Consistent naming conventions
- Error handling on all routes
- Input validation
- Commented code where needed
- No hardcoded values

### UI Principles

- Single font (Inter)
- Consistent spacing (multiples of 4px)
- Dark theme (#1a1a1a background)
- Color-coded badges for quick visual scanning
- Responsive design
- Loading and error states

## 🚀 Deployment Considerations

### Backend (Render/Railway/Heroku)

1. Set environment variables in platform
2. Ensure MongoDB Atlas allows connections from all IPs (or add platform IPs)
3. Update CORS origin to frontend URL
4. Set `NODE_ENV=production`

### Frontend (Vercel/Netlify)

1. Update `VITE_API_URL` to production backend URL
2. Build: `npm run build`
3. Deploy `dist` folder

### Production Checklist

- [ ] Secure JWT secret (long random string)
- [ ] MongoDB user with minimal permissions
- [ ] CORS restricted to frontend domain
- [ ] HTTPS enabled
- [ ] Rate limiting on auth endpoints
- [ ] Input sanitization
- [ ] Error messages don't leak sensitive info

## 📄 License

MIT

## 👤 Author

Built as a submission for Mini Helpdesk Ticketing assessment.

---

**Note**: This project demonstrates real-world full-stack development practices including JWT security, user isolation, RESTful API design, and professional UI/UX implementation.
