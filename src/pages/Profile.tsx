import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDashboard } from '../hooks/useDashboard';
import Layout from '../components/Layout';
import UserAvatar from '../components/UserAvatar';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorBoundary';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Alert, AlertDescription } from '../components/ui/alert';
import { toast } from 'sonner';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  CheckCircle,
  AlertTriangle,
  Save,
  Camera,
  Trash2,
  Shield,
  Activity,
  FileText,
  Clock
} from 'lucide-react';

export default function Profile() {
  const { user, updateUser, isLoading } = useAuth();
  const { stats, isLoading: statsLoading, error: statsError, fetchDashboardStats } = useDashboard(user?.role || 'teacher');
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    bio: '',
    profilePicture: undefined as string | undefined,
    profilePictureFile: undefined as File | undefined, // Store the file for upload
    profilePicturePreview: undefined as string | undefined, // Store preview URL
    removeExistingPicture: false, // Flag to indicate removal of existing picture
  });

  const [isSaving, setIsSaving] = useState(false);

  // Initialize profile data when user loads
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        bio: user.bio || (user.role === 'admin' 
          ? 'System administrator responsible for managing the digital filing system and supporting teachers.'
          : 'Passionate educator dedicated to providing quality education.'),
        profilePicture: user.profilePicture,
        profilePictureFile: undefined,
        profilePicturePreview: undefined,
        removeExistingPicture: false,
      });
    }
  }, [user]);

  // Update profile data when user.profilePicture changes specifically
  useEffect(() => {
    if (user?.profilePicture !== profileData.profilePicture) {
      setProfileData(prev => ({
        ...prev,
        profilePicture: user?.profilePicture
      }));
    }
  }, [user?.profilePicture]);

  // Fetch dashboard stats on component mount
  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const handleSave = async () => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      
      // Prepare update data
      const updateData: any = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phoneNumber: profileData.phoneNumber,
        bio: profileData.bio,
      };

      // Handle profile picture changes
      if (profileData.profilePictureFile) {
        // New file selected
        updateData.profilePictureFile = profileData.profilePictureFile;
      } else if (profileData.removeExistingPicture) {
        // User wants to remove existing picture
        updateData.removeProfilePicture = true;
      }
      
      // Update user profile via the auth hook
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
    } finally {
      setIsSaving(false);
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loading text="Loading profile..." />
        </div>
      </Layout>
    );
  }

  // Error state for stats
  if (statsError) {
    return (
      <Layout>
        <ErrorMessage message={statsError} />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>

        {/* Success/Error Messages */}
        {/* Messages now handled by toast notifications */}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Information */}
          <div className="lg:col-span-2">
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
                      placeholder="Tell us about yourself, your experience, and interests..."
                    />
                  </div>
                </div>

                <Button onClick={handleSave} className="w-full md:w-auto" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loading size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Profile
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Account Summary & Stats */}
          <div className="space-y-6">
            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Account Type</span>
                  <Badge className="capitalize">
                    {user?.role}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge className="bg-success/10 text-success border-success/20">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">2FA Enabled</span>
                  <Badge className="bg-success/10 text-success border-success/20">
                    Yes
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Joined {formatDate(user?.dateJoined || new Date().toISOString())}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Last login {formatDateTime(user?.lastLogin || new Date().toISOString())}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  {user?.role === 'admin' ? 'System Overview' : 'Activity Summary'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {statsLoading ? (
                  <div className="space-y-4">
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                  </div>
                ) : user?.role === 'admin' ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Teachers</span>
                      <span className="text-2xl font-bold">{(stats as any)?.totalTeachers || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Categories</span>
                      <span className="text-2xl font-bold">{(stats as any)?.totalCategories || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Documents</span>
                      <span className="text-2xl font-bold">{(stats as any)?.totalDocuments || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">System Health</span>
                      <Badge className="bg-success/10 text-success border-success/20">
                        Excellent
                      </Badge>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Documents Uploaded</span>
                      <span className="text-2xl font-bold">{(stats as any)?.documentsUploaded || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Files Shared</span>
                      <span className="text-2xl font-bold">{(stats as any)?.documentsShared || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Downloads</span>
                      <span className="text-2xl font-bold">{(stats as any)?.totalDownloads || 0}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {user?.role === 'admin' ? (
                  <>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href="/admin/teachers">
                        <User className="h-4 w-4 mr-2" />
                        Manage Teachers
                      </a>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href="/admin/settings">
                        <Shield className="h-4 w-4 mr-2" />
                        System Settings
                      </a>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href="/admin/reports">
                        <Activity className="h-4 w-4 mr-2" />
                        View Reports
                      </a>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href="/teacher/upload">
                        <FileText className="h-4 w-4 mr-2" />
                        Upload Document
                      </a>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href="/teacher/documents">
                        <FileText className="h-4 w-4 mr-2" />
                        My Documents
                      </a>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href="/teacher/settings">
                        <Shield className="h-4 w-4 mr-2" />
                        Account Settings
                      </a>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
