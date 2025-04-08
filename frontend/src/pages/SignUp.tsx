
import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import PageTransition from '@/components/layout/PageTransition';
import { useAuth } from '@/context/AuthContext';
import SignupForm from '@/components/auth/SignupForm';
import OtpVerification from '@/components/auth/OtpVerification';

const SignUp = () => {
  const { isAuthenticated } = useAuth();
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [signupData, setSignupData] = useState({
    email: '',
    name: '',
    mobile: '',
    password: ''
  });
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <PageTransition>
      <main className="min-h-screen">
        <Navbar />
        
        <div className="pt-32 px-4 max-w-7xl mx-auto">
          {showOtpForm ? (
            <OtpVerification 
              email={signupData.email} 
              onVerificationComplete={() => {}} 
              onResendOtp={() => {}}
              onBack={() => setShowOtpForm(false)}
            />
          ) : (
            <div className="flex flex-col items-center">
              <SignupForm 
                onSignupComplete={(data) => {
                  setSignupData(data);
                  setShowOtpForm(true);
                }}
              />
              
              <div className="mt-6 flex gap-4 w-full max-w-md">
                <Link to="/login" className="w-full">
                  <button className="w-full h-11 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground flex items-center justify-center">
                    Sign In
                  </button>
                </Link>
                <Link to="/signup" className="w-full">
                  <button className="w-full h-11 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center justify-center">
                    Sign Up
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </PageTransition>
  );
};

export default SignUp;
