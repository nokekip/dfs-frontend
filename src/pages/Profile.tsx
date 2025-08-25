import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
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
  const { user, updateUser } = useAuth();
  
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: '+254 712 345 678',
    bio: user?.role === 'admin' 
      ? 'System administrator responsible for managing the digital filing system and supporting teachers.'
      : 'Passionate educator with 8 years of experience in primary education.',
    profilePicture: undefined as string | undefined
  });

  const [activityStats] = useState({
    documentsUploaded: user?.role === 'admin' ? 0 : 24,
    documentsShared: user?.role === 'admin' ? 0 : 8,
    totalDownloads: user?.role === 'admin' ? 0 : 156,
    joinDate: '2024-01-15',
    lastLogin: '2024-01-20T10:30:00Z',
    totalTeachers: user?.role === 'admin' ? 45 : 0,
    totalCategories: user?.role === 'admin' ? 8 : 0
  });

  const handleSave = async () => {
    try {
      // In real app, this would update via Django REST API
      updateUser({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
      });
      
      toast.success('Profile Updated', {
        description: 'Your profile information has been saved successfully'
      });
    } catch (error) {
      toast.error('Update Failed', {
        description: 'Failed to update profile. Please try again.'
      });
    }
  };

  const handleChangePhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // In real app, this would upload to server
        const imageUrl = URL.createObjectURL(file);
        setProfileData(prev => ({ ...prev, profilePicture: imageUrl }));
        toast.success('Photo Updated', {
          description: 'Profile photo has been updated successfully'
        });
      }
    };
    input.click();
  };

  const handleRemovePhoto = () => {
    setProfileData(prev => ({ ...prev, profilePicture: undefined }));
    toast.success('Photo Removed', {
      description: 'Profile photo has been removed successfully'
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
                  <Avatar className="h-20 w-20">
                    {profileData.profilePicture && (
                      <AvatarImage src={profileData.profilePicture} alt="Profile" />
                    )}
                    <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                      {profileData.firstName[0]}{profileData.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
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

                <Button onClick={handleSave} className="w-full md:w-auto">
                  <Save className="h-4 w-4 mr-2" />
                  Save Profile
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
                    <span>Joined {formatDate(activityStats.joinDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Last login {formatDateTime(activityStats.lastLogin)}</span>
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
                {user?.role === 'admin' ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Teachers</span>
                      <span className="text-2xl font-bold">{activityStats.totalTeachers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Categories</span>
                      <span className="text-2xl font-bold">{activityStats.totalCategories}</span>
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
                      <span className="text-2xl font-bold">{activityStats.documentsUploaded}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Files Shared</span>
                      <span className="text-2xl font-bold">{activityStats.documentsShared}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Downloads</span>
                      <span className="text-2xl font-bold">{activityStats.totalDownloads}</span>
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
