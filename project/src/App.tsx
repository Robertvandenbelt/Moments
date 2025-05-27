import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

import Homepage from './pages/Homepage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Timeline from './pages/Timeline';
import Profile from './pages/Profile';
import CreateMomentBoard from './pages/CreateMomentBoard';
import ShareMomentBoard from './pages/ShareMomentBoard';
import MomentBoard from './pages/MomentBoard';
import JoinMomentBoard from './pages/JoinMomentBoard';
import EditMomentBoard from './pages/EditMomentBoard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          
          <Route 
            path="/signup" 
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            } 
          />
          
          <Route 
            path="/timeline" 
            element={
              <ProtectedRoute>
                <Timeline />
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
            path="/create" 
            element={
              <ProtectedRoute>
                <CreateMomentBoard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/share/:id" 
            element={
              <ProtectedRoute>
                <ShareMomentBoard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/board/:id" 
            element={
              <ProtectedRoute>
                <MomentBoard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/edit/:id" 
            element={
              <ProtectedRoute>
                <EditMomentBoard />
              </ProtectedRoute>
            } 
          />

          <Route path="/join/:momentBoardId" element={<JoinMomentBoard />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;