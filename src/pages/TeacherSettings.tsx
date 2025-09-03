import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Layout from '../components/Layout';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import UserAvatar from '../components/UserAvatar';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Bell, 
  Palette, 
  Globe, 
  Download,
  Upload,
  Shield,
  CheckCircle,
  AlertTriangle,
  Save,
  Eye,
  EyeOff,
  Camera,
  Trash2
} from 'lucide-react';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  bio: string;
  profilePicture?: string;
  profilePictureFile?: File;
  profilePicturePreview?: string;
  removeExistingPicture: boolean;
}

interface SecuritySettings {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;
  sessionTimeout: number;
}

interface NotificationSettings {
  emailNotifications: boolean;
  documentShared: boolean;
  documentComments: boolean;
  weeklyDigest: boolean;
}

export default function TeacherSettings() {
  const { user, updateUser } = useAuth();
  
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: '+254 712 345 678',
    bio: 'Passionate educator with 8 years of experience in primary education.',
    profilePicture: user?.profilePicture || undefined,
    profilePictureFile: undefined,
    profilePicturePreview: undefined,
    removeExistingPicture: false,
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: true,
    sessionTimeout: 30,
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    documentShared: true,
    documentComments: false,
    weeklyDigest: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  // Sync local state with user changes
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        profilePicture: user.profilePicture || undefined,
      }));
    }
  }, [user]);

  const handleProfileSave = async () => {
    try {
      // Prepare update data
      const updateData: any = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
      };

      // Handle profile picture changes
      if (profileData.profilePictureFile) {
        // New file selected
        updateData.profilePictureFile = profileData.profilePictureFile;
      } else if (profileData.removeExistingPicture) {
        // User wants to remove existing picture
        updateData.removeProfilePicture = true;
      }
      
      // Update the user in AuthContext with all profile data including profile picture
      await updateUser(updateData);
      
      // Clear the file and preview after successful upload
      setProfileData(prev => ({
        ...prev,
        profilePictureFile: undefined,
        profilePicturePreview: undefined,
        removeExistingPicture: false,
      }));
      
      toast.success('Profile Updated', {
        description: 'Your profile information has been saved successfully'
      });
    } catch (error) {
      toast.error('Update Failed', {
        description: 'Failed to update profile. Please try again.'
      });
    }
  };

  const handlePasswordChange = async () => {
    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      setSaveError('New passwords do not match');
      setTimeout(() => setSaveError(''), 3000);
      return;
    }

    if (securitySettings.newPassword.length < 8) {
      setSaveError('Password must be at least 8 characters long');
      setTimeout(() => setSaveError(''), 3000);
      return;
    }

    try {
      // In real app, this would update password via Django REST API
      setSecuritySettings(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      
      toast.success('Password Changed', {
        description: 'Your password has been updated successfully'
      });
    } catch (error) {
      toast.error('Password Change Failed', {
        description: 'Failed to change password. Please try again.'
      });
    }
  };

  const handleNotificationsSave = () => {
    // In real app, this would save via Django REST API
    toast.success('Settings Saved', {
      description: 'Your notification preferences have been updated'
    });
  };

  const handleChangePhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Validate file size (2MB limit)
        if (file.size > 2 * 1024 * 1024) {
          toast.error('File Too Large', {
            description: 'Please choose an image smaller than 2MB'
          });
          return;
        }

        // Create preview URL and store the file for later upload
        const previewUrl = URL.createObjectURL(file);
        setProfileData(prev => ({
          ...prev,
          profilePictureFile: file,
          profilePicturePreview: previewUrl,
          removeExistingPicture: false,
        }));
        
        toast.success('Photo Selected', {
          description: 'Photo selected. Click "Save Profile" to upload it.'
        });
      }
    };
    input.click();
  };

  const handleRemovePhoto = () => {
    // Clear the preview and selected file, and mark for removal
    setProfileData(prev => ({
      ...prev,
      profilePictureFile: undefined,
      profilePicturePreview: undefined,
      removeExistingPicture: true,
    }));
    
    toast.success('Photo Removed', {
      description: 'Photo will be removed when you save your profile.'
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Success/Error Messages */}
        {saveSuccess && (
          <Alert className="bg-success/10 border-success/20">
            <CheckCircle className="h-4 w-4 text-success" />
            <AlertDescription className="text-success-foreground">
              {saveSuccess}
            </AlertDescription>
          </Alert>
        )}

        {saveError && (
          <Alert className="bg-destructive/10 border-destructive/20">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              {saveError}
            </AlertDescription>
          </Alert>
        )}

        {/* Settings Tabs */}
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your personal details and professional information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-6">
                  <UserAvatar 
                    key={profileData.profilePicturePreview || profileData.profilePicture || 'no-picture'}
                    user={{
                      ...user!,
                      firstName: profileData.firstName,
                      lastName: profileData.lastName,
                      profilePicture: profileData.removeExistingPicture 
                        ? undefined 
                        : (profileData.profilePicturePreview || profileData.profilePicture)
                    }}
                    size="xl" 
                  />
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleChangePhoto}>
                        <Camera className="h-4 w-4 mr-2" />
                        Change Photo
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleRemovePhoto}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or GIF. Max size 2MB.
                    </p>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phoneNumber"
                        value={profileData.phoneNumber}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Professional Details</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      rows={4}
                      placeholder="Tell us about yourself, your teaching experience, and interests..."
                    />
                  </div>
                </div>

                <Button onClick={handleProfileSave} className="w-full md:w-auto">
                  <Save className="h-4 w-4 mr-2" />
                  Save Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Password & Security
                </CardTitle>
                <CardDescription>
                  Manage your password and security preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Change Password */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Change Password</h3>
                  <div className="grid gap-4 md:grid-cols-1 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="currentPassword"
                          type={showPassword ? "text" : "password"}
                          value={securitySettings.currentPassword}
                          onChange={(e) => setSecuritySettings(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="pl-10 pr-10"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={securitySettings.newPassword}
                          onChange={(e) => setSecuritySettings(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="pl-10 pr-10"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={securitySettings.confirmPassword}
                          onChange={(e) => setSecuritySettings(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                  <Button onClick={handlePasswordChange}>
                    Change Password
                  </Button>
                </div>

                {/* Two-Factor Authentication */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">SMS Authentication</p>
                      <p className="text-sm text-muted-foreground">
                        Receive verification codes via SMS
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.twoFactorEnabled}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: checked }))}
                    />
                  </div>
                  {securitySettings.twoFactorEnabled && (
                    <Alert className="bg-success/10 border-success/20">
                      <Shield className="h-4 w-4 text-success" />
                      <AlertDescription className="text-success-foreground">
                        Two-factor authentication is enabled. Your account is secured with SMS verification.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Session Management */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Session Management</h3>
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Select
                      value={securitySettings.sessionTimeout.toString()}
                      onValueChange={(value) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(value) }))}
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose how you want to be notified about activities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Document Notifications */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">General</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Document Activities */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Document Activities</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">Document Shared</p>
                        <p className="text-sm text-muted-foreground">
                          When someone shares a document with you
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.documentShared}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, documentShared: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">Document Comments</p>
                        <p className="text-sm text-muted-foreground">
                          When someone comments on your documents
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.documentComments}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, documentComments: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">Weekly Digest</p>
                        <p className="text-sm text-muted-foreground">
                          Weekly summary of your activity and shared documents
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.weeklyDigest}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, weeklyDigest: checked }))}
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleNotificationsSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
