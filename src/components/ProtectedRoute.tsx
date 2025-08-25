import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'teacher' | 'admin';
  fallbackPath?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole,
  fallbackPath = '/login' 
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // If specific role is required and user doesn't have it, redirect
  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user's actual role
    const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/teacher/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  // If user account is not active, show message
  if (!user.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-background to-primary-100">
        <div className="text-center max-w-md p-6">
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Account Pending</h2>
            <p className="text-muted-foreground mb-4">
              Your account is pending approval from the school administrator. 
              You will receive an email notification once your account is activated.
            </p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="text-primary hover:underline"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
