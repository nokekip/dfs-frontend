import { useState } from 'react';
import Layout from '../components/Layout';
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
  Database, 
  Mail, 
  Bell,
  Users,
  FileText,
  Save,
  CheckCircle,
  AlertTriangle,
  Server,
  Key,
  Globe,
  Smartphone
} from 'lucide-react';

export default function AdminSettings() {
  const [saveSuccess, setSaveSuccess] = useState('');
  
  // System Settings
  const [systemSettings, setSystemSettings] = useState({
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
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorRequired: true,
    passwordMinLength: '8',
    passwordRequireSpecial: true,
    passwordRequireNumbers: true,
    passwordRequireUppercase: true,
    maxLoginAttempts: '5',
    lockoutDuration: '15', // minutes
    ipWhitelist: '',
    enableAuditLogs: true
  });

  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUsername: '',
    smtpPassword: '',
    senderEmail: 'noreply@school.co.ke',
    senderName: 'Digital Filing System',
    enableEmailNotifications: true
  });

  // Storage Settings
  const [storageSettings, setStorageSettings] = useState({
    storageProvider: 'local',
    maxTotalStorage: '100', // GB
    autoDeleteInactive: false,
    inactiveDeleteDays: '365',
    enableCompression: true,
    compressionQuality: '85'
  });

  const handleSystemSave = () => {
    // In real app, this would save via Django REST API
    console.log('System settings saved:', systemSettings);
    setSaveSuccess('System settings saved successfully!');
    setTimeout(() => setSaveSuccess(''), 3000);
  };

  const handleSecuritySave = () => {
    // In real app, this would save via Django REST API
    console.log('Security settings saved:', securitySettings);
    setSaveSuccess('Security settings saved successfully!');
    setTimeout(() => setSaveSuccess(''), 3000);
  };

  const handleEmailSave = () => {
    // In real app, this would save via Django REST API
    console.log('Email settings saved:', emailSettings);
    setSaveSuccess('Email settings saved successfully!');
    setTimeout(() => setSaveSuccess(''), 3000);
  };

  const handleStorageSave = () => {
    // In real app, this would save via Django REST API
    console.log('Storage settings saved:', storageSettings);
    setSaveSuccess('Storage settings saved successfully!');
    setTimeout(() => setSaveSuccess(''), 3000);
  };

  const testEmailConnection = () => {
    // In real app, this would test email connection
    setSaveSuccess('Email connection test successful!');
    setTimeout(() => setSaveSuccess(''), 3000);
  };

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

        {/* Success Message */}
        {saveSuccess && (
          <Alert className="bg-success/10 border-success/20">
            <CheckCircle className="h-4 w-4 text-success" />
            <AlertDescription className="text-success-foreground">
              {saveSuccess}
            </AlertDescription>
          </Alert>
        )}

        {/* Settings Tabs */}
        <Tabs defaultValue="system" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
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
                      value={systemSettings.siteName}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, siteName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                    <Input
                      id="maxFileSize"
                      type="number"
                      value={systemSettings.maxFileSize}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, maxFileSize: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={systemSettings.siteDescription}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                  <Input
                    id="allowedFileTypes"
                    value={systemSettings.allowedFileTypes}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, allowedFileTypes: e.target.value }))}
                    placeholder="pdf,docx,xlsx,pptx,jpg,png"
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated list of allowed file extensions
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Select
                    value={systemSettings.sessionTimeout}
                    onValueChange={(value) => setSystemSettings(prev => ({ ...prev, sessionTimeout: value }))}
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
                      checked={systemSettings.maintenanceMode}
                      onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }))}
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
                      checked={systemSettings.registrationEnabled}
                      onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, registrationEnabled: checked }))}
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
                      checked={systemSettings.requireAdminApproval}
                      onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, requireAdminApproval: checked }))}
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
                      checked={securitySettings.twoFactorRequired}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, twoFactorRequired: checked }))}
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
                      checked={securitySettings.enableAuditLogs}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, enableAuditLogs: checked }))}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      value={securitySettings.passwordMinLength}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordMinLength: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      value={securitySettings.maxLoginAttempts}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lockoutDuration">Account Lockout Duration (minutes)</Label>
                  <Input
                    id="lockoutDuration"
                    type="number"
                    value={securitySettings.lockoutDuration}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, lockoutDuration: e.target.value }))}
                    className="max-w-xs"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Require Special Characters</Label>
                      <p className="text-sm text-muted-foreground">
                        Passwords must contain special characters
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.passwordRequireSpecial}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, passwordRequireSpecial: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Require Numbers</Label>
                      <p className="text-sm text-muted-foreground">
                        Passwords must contain numbers
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.passwordRequireNumbers}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, passwordRequireNumbers: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Require Uppercase Letters</Label>
                      <p className="text-sm text-muted-foreground">
                        Passwords must contain uppercase letters
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.passwordRequireUppercase}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, passwordRequireUppercase: checked }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ipWhitelist">IP Whitelist (Optional)</Label>
                  <Textarea
                    id="ipWhitelist"
                    value={securitySettings.ipWhitelist}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, ipWhitelist: e.target.value }))}
                    placeholder="192.168.1.0/24&#10;10.0.0.0/8"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    One IP address or CIDR block per line. Leave empty to allow all IPs.
                  </p>
                </div>

                <Button onClick={handleSecuritySave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Security Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Settings Tab */}
          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Configuration
                </CardTitle>
                <CardDescription>
                  Configure SMTP settings for system notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Enable Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send email notifications for system events
                      </p>
                    </div>
                    <Switch
                      checked={emailSettings.enableEmailNotifications}
                      onCheckedChange={(checked) => setEmailSettings(prev => ({ ...prev, enableEmailNotifications: checked }))}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input
                      id="smtpHost"
                      value={emailSettings.smtpHost}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      value={emailSettings.smtpPort}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: e.target.value }))}
                      placeholder="587"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="smtpUsername">SMTP Username</Label>
                    <Input
                      id="smtpUsername"
                      value={emailSettings.smtpUsername}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpUsername: e.target.value }))}
                      placeholder="username@gmail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                    <Input
                      id="smtpPassword"
                      type="password"
                      value={emailSettings.smtpPassword}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="senderEmail">Sender Email</Label>
                    <Input
                      id="senderEmail"
                      value={emailSettings.senderEmail}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, senderEmail: e.target.value }))}
                      placeholder="noreply@school.co.ke"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senderName">Sender Name</Label>
                    <Input
                      id="senderName"
                      value={emailSettings.senderName}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, senderName: e.target.value }))}
                      placeholder="Digital Filing System"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button onClick={handleEmailSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Email Settings
                  </Button>
                  <Button variant="outline" onClick={testEmailConnection}>
                    <Mail className="h-4 w-4 mr-2" />
                    Test Connection
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Storage Settings Tab */}
          <TabsContent value="storage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Storage Configuration
                </CardTitle>
                <CardDescription>
                  Configure file storage and management settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="storageProvider">Storage Provider</Label>
                  <Select
                    value={storageSettings.storageProvider}
                    onValueChange={(value) => setStorageSettings(prev => ({ ...prev, storageProvider: value }))}
                  >
                    <SelectTrigger className="max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local Storage</SelectItem>
                      <SelectItem value="aws">Amazon S3</SelectItem>
                      <SelectItem value="gcp">Google Cloud Storage</SelectItem>
                      <SelectItem value="azure">Azure Blob Storage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="maxTotalStorage">Max Total Storage (GB)</Label>
                    <Input
                      id="maxTotalStorage"
                      type="number"
                      value={storageSettings.maxTotalStorage}
                      onChange={(e) => setStorageSettings(prev => ({ ...prev, maxTotalStorage: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inactiveDeleteDays">Auto-delete After (days)</Label>
                    <Input
                      id="inactiveDeleteDays"
                      type="number"
                      value={storageSettings.inactiveDeleteDays}
                      onChange={(e) => setStorageSettings(prev => ({ ...prev, inactiveDeleteDays: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Auto-delete Inactive Files</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically delete files not accessed for specified days
                      </p>
                    </div>
                    <Switch
                      checked={storageSettings.autoDeleteInactive}
                      onCheckedChange={(checked) => setStorageSettings(prev => ({ ...prev, autoDeleteInactive: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Enable Compression</Label>
                      <p className="text-sm text-muted-foreground">
                        Compress images to save storage space
                      </p>
                    </div>
                    <Switch
                      checked={storageSettings.enableCompression}
                      onCheckedChange={(checked) => setStorageSettings(prev => ({ ...prev, enableCompression: checked }))}
                    />
                  </div>
                </div>

                {storageSettings.enableCompression && (
                  <div className="space-y-2">
                    <Label htmlFor="compressionQuality">Compression Quality (%)</Label>
                    <Input
                      id="compressionQuality"
                      type="number"
                      min="1"
                      max="100"
                      value={storageSettings.compressionQuality}
                      onChange={(e) => setStorageSettings(prev => ({ ...prev, compressionQuality: e.target.value }))}
                      className="max-w-xs"
                    />
                  </div>
                )}

                <Button onClick={handleStorageSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Storage Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
