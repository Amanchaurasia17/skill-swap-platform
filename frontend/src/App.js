import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BrowseUsers from './pages/BrowseUsers';
import Profile from './pages/Profile';
import SwapRequests from './pages/SwapRequests';
import Feedback from './pages/Feedback';
import AdminPanel from './pages/AdminPanel';

// Landing page component
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="max-w-4xl mx-auto text-center text-white px-4">
        <h1 className="text-6xl font-bold mb-6">Skill Swap Platform</h1>
        <p className="text-xl mb-8">
          Connect with others to exchange skills and knowledge. 
          Learn something new while teaching what you know best.
        </p>
        <div className="space-x-4">
          <a 
            href="/register" 
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Get Started
          </a>
          <a 
            href="/login" 
            className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
};

// Main App component
function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/browse-users" 
              element={
                <ProtectedRoute>
                  <BrowseUsers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/swap-requests" 
              element={
                <ProtectedRoute>
                  <SwapRequests />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/swap-requests/create" 
              element={
                <ProtectedRoute>
                  <SwapRequests />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/feedback/:requestId" 
              element={
                <ProtectedRoute>
                  <Feedback />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
