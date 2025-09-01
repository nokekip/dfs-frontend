import { createContext, useContext, ReactNode } from 'react';
import { User } from '../services/types';
import { useAuth as useAuthHook } from '../hooks/useAuth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  pendingOtpUser: User | null;
  login: (email: string, password: string) => Promise<{ requiresOtp: boolean; message?: string; user?: User }>;
  verifyOTP: (userId: string, otp: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
    updateUser: (data: Partial<User> & { profilePictureFile?: File; removeProfilePicture?: boolean }) => Promise<void>;
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
    return await authHook.login({ email, password });
  };

  const verifyOTP = async (userId: string, otp: string) => {
    return await authHook.verifyOTP({ user_id: userId, otp });
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

  const updateUser = async (userData: Partial<User> & { profilePictureFile?: File }) => {
    await authHook.updateProfile(userData);
    // Force refresh the user data to ensure UI updates
    authHook.refreshUser();
  };

  const value: AuthContextType = {
    user: authHook.user,
    isLoading: authHook.isLoading,
    isAuthenticated: authHook.isAuthenticated,
    pendingOtpUser: authHook.pendingOtpUser,
    login,
    verifyOTP,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
