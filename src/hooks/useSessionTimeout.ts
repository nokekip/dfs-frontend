/**
 * Custom hook for session timeout management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserPreferences } from './useUserPreferences';

interface SessionTimeoutHook {
  showWarning: boolean;
  timeRemaining: number;
  extendSession: () => void;
  forceLogout: () => void;
}

export const useSessionTimeout = (): SessionTimeoutHook => {
  const { user, isAuthenticated, handleSessionExpiry } = useAuth();
  const { preferences } = useUserPreferences();
  
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  // Refs to track timers and activity
  const lastActivityRef = useRef<number>(Date.now());
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Get session timeout in milliseconds
  const getSessionTimeout = useCallback(() => {
    if (!preferences) return 30 * 60 * 1000; // 30 minutes default
    return preferences.effective_session_timeout * 60 * 1000; // Convert minutes to milliseconds
  }, [preferences]);

  // Get dynamic warning time based on session length
  const getWarningTime = useCallback(() => {
    const sessionTimeout = getSessionTimeout();
    const sessionMinutes = sessionTimeout / (60 * 1000);
    
    // Dynamic warning threshold:
    // - Sessions ≤ 5 min: warn at 50% remaining (e.g., 2.5 min for 5 min session)
    // - Sessions > 5 min: warn at 5 minutes remaining
    if (sessionMinutes <= 5) {
      return Math.max(sessionTimeout * 0.5, 30 * 1000); // At least 30 seconds warning
    } else {
      return 5 * 60 * 1000; // 5 minutes for longer sessions
    }
  }, [getSessionTimeout]);

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, []);

  // Force logout
  const forceLogout = useCallback(() => {
    clearTimers();
    setShowWarning(false);
    handleSessionExpiry();
  }, [clearTimers, handleSessionExpiry]);

  // Start countdown when warning is shown
  const startCountdown = useCallback(() => {
    const warningTime = getWarningTime();
    let remaining = warningTime;
    
    setTimeRemaining(remaining);
    
    countdownTimerRef.current = setInterval(() => {
      remaining -= 1000;
      setTimeRemaining(remaining);
      
      if (remaining <= 0) {
        forceLogout();
      }
    }, 1000);
  }, [forceLogout, getWarningTime]);

  // Update activity timestamp and reset timers
  const updateActivity = useCallback(() => {
    if (!isAuthenticated) return;
    
    const now = Date.now();
    lastActivityRef.current = now;
    
    // Clear existing timers
    clearTimers();
    setShowWarning(false);
    
    const sessionTimeout = getSessionTimeout();
    const warningTime = getWarningTime();
    const timeToWarning = sessionTimeout - warningTime;
    
    // Only set warning timer if we have positive time until warning
    if (timeToWarning > 0) {
      warningTimerRef.current = setTimeout(() => {
        setShowWarning(true);
        startCountdown();
      }, timeToWarning);
    } else {
      // For very short sessions, show warning immediately but with proper countdown
      setShowWarning(true);
      startCountdown();
    }
    
    // Set logout timer
    logoutTimerRef.current = setTimeout(() => {
      forceLogout();
    }, sessionTimeout);
  }, [isAuthenticated, getSessionTimeout, getWarningTime, clearTimers, startCountdown, forceLogout]);

  // Extend session (reset timers)
  const extendSession = useCallback(() => {
    updateActivity();
  }, [updateActivity]);

  // Throttled activity update to prevent excessive timer resets
  const throttledUpdateActivity = useCallback(() => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;
    
    // Only update if more than 1 second has passed since last activity
    if (timeSinceLastActivity > 1000) {
      updateActivity();
    }
  }, [updateActivity]);

  // Set up activity listeners
  useEffect(() => {
    if (!isAuthenticated) {
      clearTimers();
      setShowWarning(false);
      return;
    }

    // Reduced activity events to prevent interference with navigation
    const events = ['mousedown', 'keypress', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, throttledUpdateActivity, false); // Use bubbling, not capturing
    });

    // Initialize timers
    updateActivity();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledUpdateActivity, false);
      });
      clearTimers();
    };
  }, [isAuthenticated, throttledUpdateActivity, clearTimers, updateActivity]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return {
    showWarning,
    timeRemaining,
    extendSession,
    forceLogout,
  };
};

export default useSessionTimeout;
