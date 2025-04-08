
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  mobile?: string;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface PaymentMethod {
  id: string;
  cardType: string;
  lastFour: string;
  expiryDate: string;
}

interface UserProfile {
  user: User;
  address?: Address;
  paymentMethods: PaymentMethod[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  profile: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  signupWithGoogle: () => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for demo
const MOCK_USER: User = {
  id: '123',
  name: 'Demo User',
  email: 'demo@example.com',
  avatar: 'https://i.pravatar.cc/150?u=demo@example.com',
  mobile: '1234567890'
};

const MOCK_PROFILE: UserProfile = {
  user: MOCK_USER,
  address: {
    street: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    zip: '94105',
    country: 'United States'
  },
  paymentMethods: [
    {
      id: 'pm_1',
      cardType: 'Visa',
      lastFour: '4242',
      expiryDate: '12/25'
    }
  ]
};

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setProfile(MOCK_PROFILE);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Authentication error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, accept any non-empty credentials
      if (email && password) {
        setUser(MOCK_USER);
        setProfile(MOCK_PROFILE);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(MOCK_USER));
        navigate('/dashboard');
      } else {
        throw new Error('Invalid credentials');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, accept any non-empty values
      if (email && password && name) {
        const newUser = { ...MOCK_USER, email, name };
        setUser(newUser);
        setProfile({ ...MOCK_PROFILE, user: newUser });
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(newUser));
        navigate('/dashboard');
      } else {
        throw new Error('Please fill all required fields');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signupWithGoogle = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API request for Google auth
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, just use the mock user
      setUser(MOCK_USER);
      setProfile(MOCK_PROFILE);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(MOCK_USER));
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email: string, otp: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, consider "1234" as the correct OTP
      return otp === "1234";
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    navigate('/login');
  };

  const updateProfile = async (updatedProfile: Partial<UserProfile>) => {
    setIsLoading(true);
    
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (profile) {
        const newProfile = {
          ...profile,
          ...updatedProfile,
          user: {
            ...profile.user,
            ...(updatedProfile.user || {})
          }
        };
        
        setProfile(newProfile);
        setUser(newProfile.user);
        localStorage.setItem('user', JSON.stringify(newProfile.user));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, just pretend it worked
      if (!currentPassword || !newPassword) {
        throw new Error('Passwords cannot be empty');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        profile,
        login,
        signup,
        signupWithGoogle,
        verifyOtp,
        logout,
        updateProfile,
        updatePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
