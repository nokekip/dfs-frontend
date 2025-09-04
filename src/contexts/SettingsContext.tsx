import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { SystemSettings } from '../services/types';
import { apiClient } from '../services/api';
import { useAuth } from './AuthContext';

interface SettingsContextType {
  systemSettings: SystemSettings | null;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
  getSiteName: () => string;
  getSiteDescription: () => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useGlobalSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useGlobalSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [basicSettings, setBasicSettings] = useState<{ siteName?: string; registrationEnabled?: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const refreshSettings = async () => {
    // Only fetch full settings if user is admin
    if (!user || user.role !== 'admin') {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiClient.getSystemSettings();
      if (response.success && response.data) {
        setSystemSettings(response.data);
      }
    } catch (error) {
      // Fallback to default settings if API fails
      console.warn('Failed to load system settings, using defaults');
    } finally {
      setIsLoading(false);
    }
  };

  const loadBasicSettings = async () => {
    try {
      const response = await apiClient.getPublicSettings();
      if (response.success && response.data) {
        setBasicSettings({
          siteName: response.data.site_name,
          registrationEnabled: response.data.registration_enabled
        });
      }
    } catch (error) {
      console.warn('Failed to load basic settings');
    }
  };

  const getSiteName = () => {
    return systemSettings?.siteName || basicSettings?.siteName || 'Digital Filing System for Teachers';
  };

  const getSiteDescription = () => {
    return systemSettings?.siteDescription || 'Kenya Teacher Document Management System';
  };

  // Update document title when settings change
  useEffect(() => {
    const siteName = getSiteName();
    document.title = `${siteName} - Teachers`;
  }, [systemSettings?.siteName, basicSettings?.siteName]);

  // Load basic settings on mount (for everyone)
  useEffect(() => {
    loadBasicSettings();
  }, []);

  // Load full settings when user changes (for admins)
  useEffect(() => {
    if (user) {
      refreshSettings();
    }
  }, [user]);

  const value: SettingsContextType = {
    systemSettings,
    isLoading,
    refreshSettings,
    getSiteName,
    getSiteDescription,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
