import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useGlobalSettings } from '../contexts/SettingsContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  Settings, 
  Shield, 
  Save,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { toast } from 'sonner';

export default function AdminSettings() {
  const { 
    systemSettings, 
    securitySettings, 
    isLoading, 
    updateSystemSettings, 
    updateSecuritySettings 
  } = useSettings('admin');
  
  const { refreshSettings } = useGlobalSettings();
  
  // Initialize local state with default values
  const [localSystemSettings, setLocalSystemSettings] = useState({
    siteName: 'Digital Filing System for Teachers',
    siteDescription: 'Kenya Teacher Document Management System',
    maxFileSize: '10', // MB
    allowedFileTypes: 'pdf,docx,xlsx,pptx,jpg,png',
    sessionTimeout: '30', // minutes
    maintenanceMode: false,
    registrationEnabled: true,
    requireAdminApproval: true
  });

  // Security Settings
  const [localSecuritySettings, setLocalSecuritySettings] = useState({
    twoFactorRequired: true,
    enableAuditLogs: true
  });

  // Update local state when settings are loaded
  useEffect(() => {
    if (systemSettings) {
      setLocalSystemSettings({
        siteName: systemSettings.siteName || 'Digital Filing System for Teachers',
        siteDescription: systemSettings.siteDescription || 'Kenya Teacher Document Management System',
        maxFileSize: systemSettings.maxFileSize?.toString() || '10',
        allowedFileTypes: systemSettings.allowedFileTypes || 'pdf,docx,xlsx,pptx,jpg,png',
        sessionTimeout: systemSettings.sessionTimeout?.toString() || '30',
        maintenanceMode: systemSettings.maintenanceMode || false,
        registrationEnabled: systemSettings.registrationEnabled || true,
        requireAdminApproval: systemSettings.requireAdminApproval || true
      });
    }
  }, [systemSettings]);

  useEffect(() => {
    if (securitySettings) {
      setLocalSecuritySettings({
        twoFactorRequired: securitySettings.twoFactorRequired || true,
        enableAuditLogs: securitySettings.enableAuditLogs || true
      });
    }
  }, [securitySettings]);

  const handleSystemSave = async () => {
    try {
      const updatedSettings = {
        siteName: localSystemSettings.siteName,
        siteDescription: localSystemSettings.siteDescription,
        maxFileSize: parseInt(localSystemSettings.maxFileSize),
        allowedFileTypes: localSystemSettings.allowedFileTypes,
        sessionTimeout: parseInt(localSystemSettings.sessionTimeout),
        maintenanceMode: localSystemSettings.maintenanceMode,
        registrationEnabled: localSystemSettings.registrationEnabled,
        requireAdminApproval: localSystemSettings.requireAdminApproval
      };

      const success = await updateSystemSettings(updatedSettings);
      if (success) {
        // Refresh global settings to update UI throughout the app
        await refreshSettings();
      }
    } catch (error) {
      toast.error('Failed to save system settings');
    }
  };

  const handleSecuritySave = async () => {
    try {
      const updatedSettings = {
        twoFactorRequired: localSecuritySettings.twoFactorRequired,
        enableAuditLogs: localSecuritySettings.enableAuditLogs
      };

      await updateSecuritySettings(updatedSettings);
    } catch (error) {
      toast.error('Failed to save security settings');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading settings...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">
            Configure system-wide settings and preferences
          </p>
        </div>

        {/* Success messages are now handled by toast notifications */}

        {/* Settings Tabs */}
        <Tabs defaultValue="system" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* System Settings Tab */}
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  General Settings
                </CardTitle>
                <CardDescription>
                  Basic system configuration and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={localSystemSettings.siteName}
                      onChange={(e) => setLocalSystemSettings(prev => ({ ...prev, siteName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                    <Input
                      id="maxFileSize"
                      type="number"
                      value={localSystemSettings.maxFileSize}
                      onChange={(e) => setLocalSystemSettings(prev => ({ ...prev, maxFileSize: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={localSystemSettings.siteDescription}
                    onChange={(e) => setLocalSystemSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                  <Input
                    id="allowedFileTypes"
                    value={localSystemSettings.allowedFileTypes}
                    onChange={(e) => setLocalSystemSettings(prev => ({ ...prev, allowedFileTypes: e.target.value }))}
                    placeholder="pdf,docx,xlsx,pptx,jpg,png"
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated list of allowed file extensions
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Select
                    value={localSystemSettings.sessionTimeout}
                    onValueChange={(value) => setLocalSystemSettings(prev => ({ ...prev, sessionTimeout: value }))}
                  >
                    <SelectTrigger className="max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="0">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Temporarily disable system access for maintenance
                      </p>
                    </div>
                    <Switch
                      checked={localSystemSettings.maintenanceMode}
                      onCheckedChange={(checked) => setLocalSystemSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Registration Enabled</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow new teacher registrations
                      </p>
                    </div>
                    <Switch
                      checked={localSystemSettings.registrationEnabled}
                      onCheckedChange={(checked) => setLocalSystemSettings(prev => ({ ...prev, registrationEnabled: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Require Admin Approval</Label>
                      <p className="text-sm text-muted-foreground">
                        New accounts need admin approval before activation
                      </p>
                    </div>
                    <Switch
                      checked={localSystemSettings.requireAdminApproval}
                      onCheckedChange={(checked) => setLocalSystemSettings(prev => ({ ...prev, requireAdminApproval: checked }))}
                    />
                  </div>
                </div>

                <Button onClick={handleSystemSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save System Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Configuration
                </CardTitle>
                <CardDescription>
                  Configure authentication and security policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Two-Factor Authentication Required</Label>
                      <p className="text-sm text-muted-foreground">
                        Force all users to enable 2FA
                      </p>
                    </div>
                    <Switch
                      checked={localSecuritySettings.twoFactorRequired}
                      onCheckedChange={(checked) => setLocalSecuritySettings(prev => ({ ...prev, twoFactorRequired: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Enable Audit Logs</Label>
                      <p className="text-sm text-muted-foreground">
                        Log all system activities for security monitoring
                      </p>
                    </div>
                    <Switch
                      checked={localSecuritySettings.enableAuditLogs}
                      onCheckedChange={(checked) => setLocalSecuritySettings(prev => ({ ...prev, enableAuditLogs: checked }))}
                    />
                  </div>
                </div>

                <Button onClick={handleSecuritySave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Security Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
