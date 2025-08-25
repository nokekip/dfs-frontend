/**
 * Error handling components
 */

import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onHome?: () => void;
  className?: string;
}

export const ErrorMessage = ({ 
  title = 'Something went wrong', 
  message, 
  onRetry, 
  onHome,
  className = '' 
}: ErrorMessageProps) => (
  <div className={`flex flex-col items-center justify-center p-8 text-center space-y-4 ${className}`}>
    <AlertTriangle className="h-12 w-12 text-destructive" />
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground max-w-md">{message}</p>
    </div>
    <div className="flex gap-2">
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
      {onHome && (
        <Button onClick={onHome} variant="default">
          <Home className="h-4 w-4 mr-2" />
          Go Home
        </Button>
      )}
    </div>
  </div>
);

export const ErrorAlert = ({ 
  message, 
  onDismiss 
}: { 
  message: string; 
  onDismiss?: () => void 
}) => (
  <Alert className="bg-destructive/10 border-destructive/20">
    <AlertTriangle className="h-4 w-4 text-destructive" />
    <AlertDescription className="text-destructive flex justify-between items-center">
      <span>{message}</span>
      {onDismiss && (
        <Button variant="ghost" size="sm" onClick={onDismiss}>
          ×
        </Button>
      )}
    </AlertDescription>
  </Alert>
);

export const ErrorPage = ({ 
  title = 'Page Not Found', 
  message = 'The page you are looking for does not exist.',
  onHome
}: {
  title?: string;
  message?: string;
  onHome?: () => void;
}) => (
  <div className="min-h-screen flex items-center justify-center">
    <ErrorMessage 
      title={title} 
      message={message} 
      onHome={onHome}
    />
  </div>
);

export const NetworkError = ({ onRetry }: { onRetry?: () => void }) => (
  <ErrorMessage
    title="Network Error"
    message="Unable to connect to the server. Please check your internet connection and try again."
    onRetry={onRetry}
  />
);

export const PermissionError = ({ onHome }: { onHome?: () => void }) => (
  <ErrorMessage
    title="Access Denied"
    message="You don't have permission to access this resource."
    onHome={onHome}
  />
);

export default ErrorMessage;
