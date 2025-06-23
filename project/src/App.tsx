import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy load all pages
const Homepage = React.lazy(() => import('./pages/Homepage'));
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const Timeline = React.lazy(() => import('./pages/Timeline'));
const Profile = React.lazy(() => import('./pages/Profile'));
const CreateMomentBoard = React.lazy(() => import('./pages/CreateMomentBoard'));
const ShareMomentBoard = React.lazy(() => import('./pages/ShareMomentBoard'));
const MomentBoard = React.lazy(() => import('./pages/MomentBoard'));
// Temporarily import JoinMomentBoard directly to test
import JoinMomentBoard from './pages/JoinMomentBoard';
const EditMomentBoard = React.lazy(() => import('./pages/EditMomentBoard'));

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
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
        </Suspense>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;