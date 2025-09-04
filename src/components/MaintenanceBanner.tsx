/**
 * Maintenance Mode Banner Component
 */

import { Alert, AlertDescription } from './ui/alert';
import { Construction, X } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

interface MaintenanceBannerProps {
  message?: string;
  dismissible?: boolean;
}

export default function MaintenanceBanner({ 
  message = "The system is currently under maintenance. You may experience some issues or service interruptions.",
  dismissible = true 
}: MaintenanceBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <Alert className="border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200 mb-0 rounded-none border-l-0 border-r-0 border-t-0">
      <Construction className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <span className="font-medium">Maintenance Mode:</span>
          <span>{message}</span>
        </div>
        {dismissible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDismissed(true)}
            className="ml-4 h-6 w-6 p-0 text-orange-600 hover:text-orange-800 hover:bg-orange-100 dark:text-orange-300 dark:hover:text-orange-100 dark:hover:bg-orange-900"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Dismiss</span>
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
