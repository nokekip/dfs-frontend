import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'teacher' | 'admin';
  isActive: boolean;
  hasCompletedSetup: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ requiresOTP: boolean; message?: string }>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  school: string;
  employeeId: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          // In a real app, validate token with backend
          // For now, we'll simulate getting user data from token
          const userData = localStorage.getItem('userData');
          if (userData) {
            setUser(JSON.parse(userData));
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Simulate API call - in real app, this would be a backend request
      setIsLoading(true);
      
      // Mock response - in real app this would come from Django REST API
      if (email === 'admin@school.co.ke' && password === 'admin123') {
        const mockUser: User = {
          id: '1',
          email: 'admin@school.co.ke',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          isActive: true,
          hasCompletedSetup: true,
        };
        
        // Store auth token and user data
        localStorage.setItem('authToken', 'mock-admin-token');
        localStorage.setItem('userData', JSON.stringify(mockUser));
        setUser(mockUser);
        
        return { requiresOTP: true, message: 'OTP sent to your registered phone number' };
      } else if (email === 'teacher@school.co.ke' && password === 'teacher123') {
        const mockUser: User = {
          id: '2',
          email: 'teacher@school.co.ke',
          firstName: 'Jane',
          lastName: 'Teacher',
          role: 'teacher',
          isActive: true,
          hasCompletedSetup: true,
        };
        
        // Store auth token and user data
        localStorage.setItem('authToken', 'mock-teacher-token');
        localStorage.setItem('userData', JSON.stringify(mockUser));
        setUser(mockUser);
        
        return { requiresOTP: true, message: 'OTP sent to your registered phone number' };
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
      setIsLoading(true);
      
      // Mock OTP verification - in real app, this would verify with backend
      if (otp === '123456') {
        // OTP verification successful - user is now fully authenticated
        return;
      } else {
        throw new Error('Invalid OTP code');
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      
      // Mock registration - in real app, this would be a backend request
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'teacher', // New registrations are teachers by default
        isActive: false, // Pending admin approval
        hasCompletedSetup: false,
      };
      
      // In real app, this would register with backend
      console.log('Registering user:', userData);
      
      // For demo, we'll just show success message
      // setUser(newUser);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));
    }
  };

  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    verifyOTP,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
