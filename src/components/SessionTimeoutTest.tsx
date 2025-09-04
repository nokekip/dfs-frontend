/**
 * Test component for session timeout functionality
 */

import React from 'react';
import { useSessionTimeout } from '../hooks/useSessionTimeout';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const SessionTimeoutTest: React.FC = () => {
  const { showWarning, timeRemaining, extendSession, forceLogout } = useSessionTimeout();

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Session Timeout Test</CardTitle>
        <CardDescription>
          Test the session timeout functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm">
            <strong>Warning Shown:</strong> {showWarning ? 'Yes' : 'No'}
          </p>
          {showWarning && (
            <p className="text-sm text-orange-600">
              <strong>Time Remaining:</strong> {formatTime(timeRemaining)}
            </p>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button onClick={extendSession} variant="outline">
            Extend Session
          </Button>
          <Button onClick={forceLogout} variant="destructive">
            Force Logout
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Move your mouse or type to reset the session timer</p>
          <p>• Session warning appears 5 minutes before timeout</p>
          <p>• Auto-logout occurs when timer reaches 0</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionTimeoutTest;
