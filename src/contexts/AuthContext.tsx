import { createContext, useContext, ReactNode } from 'react';
import { User } from '../services/types';
import { useAuth as useAuthHook } from '../hooks/useAuth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ requiresOTP: boolean; message?: string }>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
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
  const authHook = useAuthHook();

  // Wrapper functions to match the expected interface
  const login = async (email: string, password: string) => {
    const success = await authHook.login({ email, password });
    return { requiresOTP: success, message: success ? 'Login successful' : 'Login failed' };
  };

  const verifyOTP = async (email: string, otp: string) => {
    await authHook.verifyOTP({ email, otp });
  };

  const register = async (userData: RegisterData) => {
    await authHook.register({
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      password: userData.password,
      confirmPassword: userData.password,
    });
  };

  const logout = () => {
    authHook.logout();
  };

  const updateUser = async (userData: Partial<User>) => {
    await authHook.updateProfile(userData);
    // Force refresh the user data to ensure UI updates
    authHook.refreshUser();
  };

  const value: AuthContextType = {
    user: authHook.user,
    isLoading: authHook.isLoading,
    isAuthenticated: authHook.isAuthenticated,
    login,
    verifyOTP,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
