
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import PageTransition from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <PageTransition>
      <main className="min-h-screen">
        <Navbar />
        
        <div className="pt-32 px-4 flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <span className="text-8xl font-bold text-primary">404</span>
          </motion.div>
          
          <h1 className="text-3xl font-bold mb-4">Page not found</h1>
          
          <p className="text-muted-foreground mb-8">
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>
          
          <Button asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </main>
    </PageTransition>
  );
};

export default NotFound;
