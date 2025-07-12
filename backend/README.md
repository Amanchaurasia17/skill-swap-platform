# Skill Swap Platform - Backend API

A comprehensive backend API for the Skill Swap Platform that enables users to exchange skills and knowledge.

## Features

### User Management
- ✅ User registration and authentication
- ✅ JWT-based authorization
- ✅ Profile management (public/private)
- ✅ Skills offered and wanted tracking
- ✅ User search and filtering
- ✅ Rating and feedback system
- ✅ Profile photos and availability settings

### Swap Requests
- ✅ Create, view, and manage swap requests
- ✅ Accept, reject, or cancel requests
- ✅ Request status tracking (pending, accepted, rejected, completed, cancelled)
- ✅ Request history and statistics
- ✅ Messaging system for requests

### Admin Features
- ✅ User management (activate/deactivate accounts)
- ✅ Swap request moderation
- ✅ Platform statistics and reports
- ✅ Content moderation and removal
- ✅ Platform-wide messaging

### Security & Performance
- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Input validation and sanitization
- ✅ Error handling middleware
- ✅ Database indexing for search performance
- ✅ CORS configuration

## API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - Register a new user
- `POST /login` - User login
- `GET /me` - Get current user profile
- `PUT /change-password` - Change user password

### User Routes (`/api/users`)
- `GET /public` - Get all public users (with search, pagination)
- `GET /search` - Search users by skills
- `GET /:id` - Get user by ID
- `PUT /:id` - Update user profile
- `POST /:id/feedback` - Add feedback and rating
- `GET /:id/feedback` - Get user feedback
- `DELETE /:id` - Deactivate user account

### Swap Routes (`/api/swaps`)
- `POST /` - Create swap request
- `GET /my/:userId` - Get user's swap requests
- `GET /:id` - Get swap request details
- `PUT /:id` - Update swap request status
- `DELETE /:id` - Delete swap request
- `GET /stats/:userId` - Get swap statistics

### Admin Routes (`/api/admin`)
- `GET /users` - Get all users (admin only)
- `PUT /users/:id/status` - Activate/deactivate user
- `GET /swaps` - Get all swap requests
- `PUT /swaps/:id/moderate` - Moderate swap requests
- `GET /stats` - Get platform statistics
- `POST /message` - Send platform-wide message
- `DELETE /content/:type/:id` - Remove inappropriate content
- `GET /reports/:type` - Generate reports

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Configure your environment variables:
```env
MONGO_URI=mongodb://localhost:27017/skill-swap-platform
JWT_SECRET=your_very_secure_jwt_secret_key
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

5. Start MongoDB service

6. Create an admin user:
```bash
npm run seed-admin
```

7. Start the development server:
```bash
npm run dev
```

## Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  passwordHash: String (required),
  location: String,
  profilePhoto: String,
  skillsOffered: [String],
  skillsWanted: [String],
  availability: String (enum),
  profileType: String (public/private),
  role: String (user/admin),
  rating: Number,
  ratingCount: Number,
  feedback: [FeedbackSchema],
  isActive: Boolean,
  lastLogin: Date,
  timestamps: true
}
```

### SwapRequest Model
```javascript
{
  fromUser: ObjectId (ref: User),
  toUser: ObjectId (ref: User),
  offeredSkill: String (required),
  wantedSkill: String (required),
  status: String (enum),
  message: String,
  adminNote: String,
  completedAt: Date,
  rejectedAt: Date,
  acceptedAt: Date,
  timestamps: true
}
```

## Error Handling

The API includes comprehensive error handling:
- Input validation errors (400)
- Authentication errors (401)
- Authorization errors (403)
- Not found errors (404)
- Server errors (500)

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT tokens with configurable expiration
- Protected routes with authentication middleware
- Admin-only routes with role-based access
- Input validation and sanitization
- CORS configuration

## Development

### Running in Development Mode
```bash
npm run dev
```

### Creating Admin User
```bash
npm run seed-admin
```

### Production Deployment
1. Set `NODE_ENV=production`
2. Use a strong JWT secret
3. Configure MongoDB connection
4. Set up reverse proxy (nginx)
5. Enable HTTPS
6. Configure proper CORS origins

## API Testing

You can test the API using tools like Postman or curl. Here are some example requests:

### Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "skillsOffered": ["JavaScript", "React"],
    "skillsWanted": ["Python", "Machine Learning"]
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Search users by skill
```bash
curl "http://localhost:5000/api/users/search?q=JavaScript"
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.
