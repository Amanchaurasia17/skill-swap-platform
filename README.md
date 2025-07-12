# Skill Swap Platform

A full-stack web application that allows users to exchange skills and knowledge with each other. Built with Node.js/Express backend and React frontend.

## Features

### User Features
- **User Registration & Authentication**: Secure user registration and login system
- **Profile Management**: Users can create and update their profiles with skills offered and wanted
- **Skill Discovery**: Browse and search for users with specific skills
- **Swap Requests**: Create, manage, and respond to skill swap requests
- **Feedback System**: Leave ratings and reviews after completing skill swaps
- **Dashboard**: Personal dashboard showing activity, stats, and quick actions

### Admin Features
- **User Management**: View, moderate, and manage user accounts
- **Content Moderation**: Monitor and moderate swap requests and feedback
- **Platform Analytics**: View platform statistics and usage data
- **Administrative Controls**: Delete inappropriate content and manage platform

### Technical Features
- **RESTful API**: Well-structured backend API with proper error handling
- **Authentication**: JWT-based authentication system
- **Database**: MongoDB with Mongoose ODM
- **Modern UI**: Responsive design with Tailwind CSS
- **Route Protection**: Protected routes for authenticated and admin users

## Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Frontend
- **React** - Frontend library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **Context API** - State management

## Quick Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or cloud instance)

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```
   MONGODB_URI=mongodb://localhost:27017/skillswap
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api

## Seeding Data

### Create Admin User
```bash
cd backend
node seedAdmin.js
```
Creates admin user with credentials:
- Email: admin@skillswap.com
- Password: Admin123!

### Create Sample Data
```bash
node seedSampleData.js
```
Creates sample users and swap requests for testing.

## Sample Test Users
After running `seedSampleData.js`:
- **john@example.com** / Password123! (JavaScript teacher, wants Python)
- **jane@example.com** / Password123! (Python teacher, wants JavaScript)
- **alice@example.com** / Password123! (Design teacher, wants Photography)
- **bob@example.com** / Password123! (Photography teacher, wants Design)

## Main Features

### Application Flow for Users

1. **Registration/Login**: Users create accounts or log in
2. **Profile Setup**: Add skills offered and skills wanted
3. **Browse Users**: Search for users with desired skills
4. **Create Requests**: Send swap requests to other users
5. **Manage Requests**: Accept/reject incoming requests
6. **Complete Swaps**: Mark requests as completed
7. **Leave Feedback**: Rate and review completed swaps

### Swap Request Lifecycle
1. **Pending**: Initial request created
2. **Accepted**: Target user accepts the request
3. **Completed**: Both parties complete the skill exchange
4. **Rejected**: Target user rejects the request

## Testing

The backend includes comprehensive API documentation and Postman testing resources:
- `API_DOCS.md` - Complete API reference
- `POSTMAN_TESTING_GUIDE.md` - Postman testing guide
- `Skill_Swap_Platform_API.postman_collection.json` - Postman collection

## Development Status

✅ **Completed Features:**
- Complete backend API with all endpoints
- User authentication and authorization
- Profile management system
- Skill browsing and search
- Swap request management
- Feedback and rating system
- Admin panel with user/content management
- Responsive React frontend
- Protected routing
- API integration

 **Ready to Use:**
- Both backend and frontend are fully functional
- Comprehensive testing with Postman
- Sample data for immediate testing
- Complete documentation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ for the skill-sharing community
