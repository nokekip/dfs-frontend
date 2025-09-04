/**
 * Session Warning Dialog Component
 */

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Clock, Shield } from 'lucide-react';

interface SessionWarningDialogProps {
  isOpen: boolean;
  timeRemaining: number; // milliseconds  
  onExtendSession: () => void;
  onLogout: () => void;
  onClose?: () => void; // Make optional
}

export default function SessionWarningDialog({
  isOpen,
  timeRemaining,
  onExtendSession,
  onLogout,
  onClose,
}: SessionWarningDialogProps) {
  const [countdown, setCountdown] = useState(timeRemaining);

  // Update countdown every second
  useEffect(() => {
    if (!isOpen) return;

    // Convert timeRemaining from milliseconds to seconds
    const timeInSeconds = Math.floor(timeRemaining / 1000);
    setCountdown(timeInSeconds);
    
    const interval = setInterval(() => {
      setCountdown(prev => {
        const newTime = Math.max(0, prev - 1);
        if (newTime <= 0) {
          onLogout();
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, timeRemaining, onLogout]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleContinue = () => {
    onExtendSession();
    onClose?.(); // Optional call
  };

  const handleLogout = () => {
    onLogout();
    onClose?.(); // Optional call
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-warning" />
            Session Expiring Soon
          </DialogTitle>
          <DialogDescription>
            Your session will expire due to inactivity. Would you like to continue working?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="bg-warning/10 border-warning/20">
            <Shield className="h-4 w-4 text-warning" />
            <AlertDescription className="text-warning-foreground">
              <div className="flex items-center justify-between">
                <span>Time remaining:</span>
                <span className="font-mono text-lg font-bold">
                  {formatTime(countdown)}
                </span>
              </div>
            </AlertDescription>
          </Alert>

          <div className="text-sm text-muted-foreground">
            <p>
              For security purposes, you will be automatically logged out when the timer reaches zero.
              Click "Continue Working" to extend your session.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full sm:w-auto"
          >
            Logout Now
          </Button>
          <Button
            onClick={handleContinue}
            className="w-full sm:w-auto"
          >
            Continue Working
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
