/**
 * Loading component for various loading states
 */

import { Loader2 } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const Loading = ({ size = 'md', text, className = '' }: LoadingProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
      {text && (
        <span className={`text-muted-foreground ${textSizeClasses[size]}`}>
          {text}
        </span>
      )}
    </div>
  );
};

export const LoadingSpinner = ({ className = '' }: { className?: string }) => (
  <Loader2 className={`animate-spin h-4 w-4 ${className}`} />
);

export const LoadingPage = ({ text = 'Loading...' }: { text?: string }) => (
  <div className="flex items-center justify-center min-h-screen">
    <Loading size="lg" text={text} />
  </div>
);

export const LoadingCard = ({ text = 'Loading...' }: { text?: string }) => (
  <div className="flex items-center justify-center p-8">
    <Loading size="md" text={text} />
  </div>
);

export const LoadingButton = ({ text = 'Loading...' }: { text?: string }) => (
  <div className="flex items-center gap-2">
    <LoadingSpinner />
    <span>{text}</span>
  </div>
);

export default Loading;
