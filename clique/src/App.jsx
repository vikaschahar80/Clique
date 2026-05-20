import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Footer } from './components/footer'
import { Navbar } from './components/navbar'
import HomePage from './Pages/HomePage';
import { SignUpPage } from './components/SignUpPage';
import { SignInPage } from './components/SignInPage';
import { ProfileSetup } from './components/ProfileSetup';
import { Dashboard } from './components/Dashboard';
import { Toaster } from 'sonner';
import { useState, useEffect } from 'react';
import MainPage from './components/Chats/MainPage';
import { EditProfile } from './components/EditProfile';
import Profile from './components/Profile';
import { GroupsList } from './components/Groups/GroupsList';
import { GroupDetail } from './components/Groups/GroupDetail';
import { AdminVerification } from './components/Admin/AdminVerification';
import { VerificationFlow } from './components/Verify/VerificationFlow';
import { PrivacyPage } from './components/PrivacyPage';

const ProtectedRoute = ({ children, requireProfileComplete = false }) => {
  const token = localStorage.getItem('authToken');
  const userStr = localStorage.getItem('user');
  let user = null;

  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error("Error parsing user from storage", e);
    localStorage.removeItem('user');
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requireProfileComplete && !user.isProfileComplete) {
    return <Navigate to="/complete-profile" replace />;
  }

  if (!requireProfileComplete && user.isProfileComplete && window.location.pathname === '/complete-profile') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const navigate = useNavigate();

  return (
    <>
      <Toaster />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <main>
                <HomePage />
              </main>
              <Footer />
            </>
          }
        />
        
        <Route
          path="/privacy"
          element={
            <>
              <Navbar />
              <main>
                <PrivacyPage />
              </main>
              <Footer />
            </>
          }
        />

        {/* Auth Routes */}
        <Route path="/login" element={<SignInPage onSignInSuccess={(user) => {
          localStorage.setItem('user', JSON.stringify(user));
          // Navigation is handled inside SignInPage
        }} onSwitchToSignUp={() => navigate('/signup')} />} />

        <Route path="/signup" element={<SignUpPage onSignUpSuccess={(user) => {
          localStorage.setItem('user', JSON.stringify({ ...user, isProfileComplete: false }));
          navigate('/complete-profile');
        }} onSwitchToSignIn={() => navigate('/login')} />} />

        {/* Protected Routes */}
        <Route path="/complete-profile" element={
          <ProtectedRoute>
            <ProfileSetup user={JSON.parse(localStorage.getItem('user'))} onComplete={() => {
              const user = JSON.parse(localStorage.getItem('user'));
              user.isProfileComplete = true;
              localStorage.setItem('user', JSON.stringify(user));
              navigate('/dashboard');
            }} />
          </ProtectedRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute requireProfileComplete={true}>
            <Dashboard user={JSON.parse(localStorage.getItem('user'))} onSignOut={() => {
              localStorage.removeItem('authToken');
              localStorage.removeItem('user');
              navigate('/login');
            }} />
          </ProtectedRoute>
        } />
        
        <Route path="/chats" element={
          <ProtectedRoute requireProfileComplete={true}>
            <MainPage />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute requireProfileComplete={true}>
            <Profile user={JSON.parse(localStorage.getItem('user'))} onSignOut={() => {
              localStorage.removeItem('authToken');
              localStorage.removeItem('user');
              navigate('/login');
            }} />
          </ProtectedRoute>
        } />

        <Route path="/edit-profile" element={
          <ProtectedRoute requireProfileComplete={true}>
            <EditProfile />
          </ProtectedRoute>
        } />
        
        <Route path="/groups" element={
          <ProtectedRoute requireProfileComplete={true}>
            <GroupsList />
          </ProtectedRoute>
        } />

        <Route path="/groups/:handle" element={
          <ProtectedRoute requireProfileComplete={true}>
            <GroupDetail />
          </ProtectedRoute>
        } />

        <Route path="/admin/verify" element={
          <ProtectedRoute>
            <AdminVerification />
          </ProtectedRoute>
        } />

        <Route path="/verify" element={
          <ProtectedRoute requireProfileComplete={true}>
            <VerificationFlow />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  )
}

export default App
