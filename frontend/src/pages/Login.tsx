
import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import AuthForm from '@/components/auth/AuthForm';
import Navbar from '@/components/layout/Navbar';
import PageTransition from '@/components/layout/PageTransition';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

const Login = () => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <PageTransition>
      <main className="min-h-screen">
        <Navbar />
        
        <div className="pt-32 px-4 max-w-7xl mx-auto">
          <div className="flex flex-col items-center">
            <AuthForm isLogin={true} hideSignupLink={true} />
            
            <div className="mt-6 flex gap-4 w-full max-w-md">
              <Link to="/login" className="w-full">
                <Button 
                  className="w-full" 
                  variant="outline"
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/signup" className="w-full">
                <Button 
                  className="w-full" 
                  variant="destructive"
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </PageTransition>
  );
};

export default Login;
