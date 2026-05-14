import React from 'react'
import { useState } from "react";
import { SignUpPage } from "../components/SignUpPage";
import { SignInPage } from "../components/SignInPage";
import { Dashboard } from "../components/Dashboard";
import { ProfileSetup } from "../components/ProfileSetup";
import { Toaster } from "../components/ui/sonner";



const SignUp = () => {
  // Removed <Page> and <User | null> generics
  const [currentPage, setCurrentPage] = useState("signin");
  const [currentUser, setCurrentUser] = useState(null);

  const handleSignUpSuccess = (user) => {
    setCurrentUser(user);
    setCurrentPage("profile-setup");
  };

  const handleSignInSuccess = (user) => {
    setCurrentUser(user);
    setCurrentPage("dashboard");
  };

  const handleProfileComplete = () => {
    setCurrentPage("dashboard");
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setCurrentPage("signin");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster />
      {currentPage === "signin" && (
        <SignInPage
          onSignInSuccess={handleSignInSuccess}
          onSwitchToSignUp={() => setCurrentPage("signup")}
        />
      )}
      {currentPage === "signup" && (
        <SignUpPage
          onSignUpSuccess={handleSignUpSuccess}
          onSwitchToSignIn={() => setCurrentPage("signin")}
        />
      )}
      {currentPage === "profile-setup" && currentUser && (
        <ProfileSetup
          user={currentUser}
          onComplete={handleProfileComplete}
        />
      )}
      {currentPage === "dashboard" && currentUser && (
        <Dashboard user={currentUser} onSignOut={handleSignOut} />
      )}
    </div>
  );
}

export default SignUp
