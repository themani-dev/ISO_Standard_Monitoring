
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OtpVerificationProps {
  email: string;
  onVerificationComplete: () => void;
  onResendOtp: () => void;
  onBack: () => void;
}

const OtpVerification = ({ 
  email,
  onVerificationComplete,
  onResendOtp,
  onBack 
}: OtpVerificationProps) => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [isVerified, setIsVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [activeInput, setActiveInput] = useState(0);
  
  const { verifyOtp, signup } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Auto-focus the first input
  useEffect(() => {
    const input = document.getElementById(`otp-${activeInput}`);
    if (input) input.focus();
  }, [activeInput]);
  
  // Countdown timer for resend
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    
    // Only allow one digit
    if (value.length > 1) return;
    
    // Update the OTP array
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value !== '' && index < 3) {
      setActiveInput(index + 1);
    }
  };
  
  // Handle keydown events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        setActiveInput(index - 1);
      }
    }
  };
  
  // Handle paste event
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    
    // If pasted data is a 4-digit number, fill all inputs
    if (/^\d{4}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      setActiveInput(3);
    }
  };
  
  // Handle verification
  const handleVerification = async () => {
    const otpValue = otp.join('');
    
    if (otpValue.length !== 4) {
      toast({
        title: "Incomplete OTP",
        description: "Please enter the complete 4-digit verification code.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // For demo purposes, we'll consider "1234" as the correct OTP
      const isValid = otpValue === "1234";
      
      if (isValid) {
        setIsVerified(true);
        
        // Show success animation for 1 second before proceeding
        setTimeout(async () => {
          // Complete fake signup
          await signup("demo@example.com", "password", "Demo User");
          
          // Navigate to dashboard
          navigate('/dashboard');
          
          toast({
            title: "Verification successful",
            description: "Your account has been created successfully.",
          });
        }, 1500);
      } else {
        setAttemptsLeft(attemptsLeft - 1);
        
        toast({
          title: "Invalid OTP",
          description: `Incorrect verification code. ${attemptsLeft - 1} attempts left.`,
          variant: "destructive",
        });
        
        // Reset OTP
        setOtp(['', '', '', '']);
        setActiveInput(0);
        
        // If no attempts left, go back to signup
        if (attemptsLeft <= 1) {
          toast({
            title: "Verification failed",
            description: "You've reached the maximum number of attempts. Please try again later.",
            variant: "destructive",
          });
          
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      }
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle resend OTP
  const handleResendOtp = () => {
    setTimeLeft(60);
    
    toast({
      title: "OTP resent",
      description: `A new verification code has been sent to ${email}.`,
    });
    
    onResendOtp();
  };
  
  // Successful verification UI
  if (isVerified) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md mx-auto p-8 rounded-2xl bg-white shadow-sm border border-gray-100 text-center"
      >
        <div className="flex flex-col items-center justify-center">
          <CheckCircle size={60} className="text-green-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Verification Successful</h2>
          <p className="text-muted-foreground mb-8">Your account has been verified successfully.</p>
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5 }}
            className="h-1 bg-primary rounded-full w-full"
          />
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto p-8 rounded-2xl bg-white shadow-sm border border-gray-100"
    >
      <Button
        variant="ghost"
        className="p-0 h-8 mb-4"
        onClick={onBack}
      >
        <ArrowLeft size={16} className="mr-1" />
        Back
      </Button>
      
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Verification Code</h1>
        <p className="text-muted-foreground">
          We've sent a 4-digit code to <span className="font-medium">{email}</span>
        </p>
      </div>
      
      <div className="space-y-8">
        <div className="flex justify-center space-x-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="w-14 h-14 text-center text-2xl font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength={1}
              autoComplete="off"
            />
          ))}
        </div>
        
        <Button 
          onClick={handleVerification} 
          className="w-full h-11" 
          disabled={isLoading || otp.some(digit => digit === '')}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verifying...
            </span>
          ) : (
            <span>Verify Code</span>
          )}
        </Button>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Didn't receive a code? {timeLeft > 0 ? `Resend in ${timeLeft}s` : 'Resend now'}
          </p>
          <Button
            variant="link"
            className="p-0 h-auto"
            onClick={handleResendOtp}
            disabled={timeLeft > 0}
          >
            Resend verification code
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default OtpVerification;
