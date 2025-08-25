import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { 
  Users, 
  FolderOpen, 
  FileText, 
  Share, 
  Activity,
  TrendingUp,
  Calendar,
  Clock,
  UserCheck,
  UserX,
  Plus,
  Edit,
  Trash2,
  Shield,
  Download,
  BarChart3
} from 'lucide-react';

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  school: string;
  employeeId: string;
  status: 'active' | 'pending' | 'suspended';
  joinDate: string;
  filesCount: number;
}

interface ActivityLog {
  id: string;
  teacherName: string;
  action: 'upload' | 'delete' | 'share' | 'login';
  fileName?: string;
  timestamp: string;
}

interface Category {
  id: string;
  name: string;
  requiresClassSubject: boolean;
  documentsCount: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const handleViewReports = () => {
    window.location.href = '/admin/reports';
  };

  const handleExportData = () => {
    console.log('Exporting data...');
    // In real app, this would trigger data export
  };

  const handleSecuritySettings = () => {
    window.location.href = '/admin/settings';
  };

  const handleSystemLogs = () => {
    window.location.href = '/admin/activity';
  };

  // Mock data - in real app, this would come from Django REST API
  useEffect(() => {
    setTeachers([
      {
        id: '1',
        firstName: 'Jane',
        lastName: 'Mwangi',
        email: 'jane.mwangi@school.co.ke',
        school: 'Nairobi Primary School',
        employeeId: 'TSC/12345/2023',
        status: 'active',
        joinDate: '2024-01-15',
        filesCount: 24
      },
      {
        id: '2',
        firstName: 'John',
        lastName: 'Kiprotich',
        email: 'john.kiprotich@school.co.ke',
        school: 'Nairobi Primary School',
        employeeId: 'TSC/12346/2023',
        status: 'active',
        joinDate: '2024-01-10',
        filesCount: 18
      },
      {
        id: '3',
        firstName: 'Mary',
        lastName: 'Ochieng',
        email: 'mary.ochieng@school.co.ke',
        school: 'Nairobi Primary School',
        employeeId: 'TSC/12347/2023',
        status: 'pending',
        joinDate: '2024-01-20',
        filesCount: 0
      }
    ]);

    setRecentActivity([
      {
        id: '1',
        teacherName: 'Jane Mwangi',
        action: 'upload',
        fileName: 'Mathematics Lesson Plan - Week 5',
        timestamp: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        teacherName: 'John Kiprotich',
        action: 'share',
        fileName: 'Science Assessment Template',
        timestamp: '2024-01-15T09:15:00Z'
      },
      {
        id: '3',
        teacherName: 'Jane Mwangi',
        action: 'login',
        timestamp: '2024-01-15T08:00:00Z'
      },
      {
        id: '4',
        teacherName: 'John Kiprotich',
        action: 'upload',
        fileName: 'Student Progress Report',
        timestamp: '2024-01-14T16:45:00Z'
      },
      {
        id: '5',
        teacherName: 'Jane Mwangi',
        action: 'delete',
        fileName: 'Old Lesson Plan Draft',
        timestamp: '2024-01-14T14:20:00Z'
      }
    ]);

    setCategories([
      { id: '1', name: 'Lesson Plans', requiresClassSubject: true, documentsCount: 45 },
      { id: '2', name: 'Assessment Reports', requiresClassSubject: true, documentsCount: 32 },
      { id: '3', name: 'Student Records', requiresClassSubject: true, documentsCount: 28 },
      { id: '4', name: 'Administrative Forms', requiresClassSubject: false, documentsCount: 15 },
      { id: '5', name: 'Professional Development', requiresClassSubject: false, documentsCount: 12 },
      { id: '6', name: 'Meeting Minutes', requiresClassSubject: false, documentsCount: 8 }
    ]);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success/10 text-success border-success/20">Active</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-warning text-warning">Pending</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'upload':
        return <FileText className="h-4 w-4 text-primary" />;
      case 'share':
        return <Share className="h-4 w-4 text-info" />;
      case 'delete':
        return <Trash2 className="h-4 w-4 text-destructive" />;
      case 'login':
        return <UserCheck className="h-4 w-4 text-success" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityDescription = (activity: ActivityLog) => {
    switch (activity.action) {
      case 'upload':
        return `uploaded "${activity.fileName}"`;
      case 'share':
        return `shared "${activity.fileName}"`;
      case 'delete':
        return `deleted "${activity.fileName}"`;
      case 'login':
        return 'logged into the system';
      default:
        return activity.action;
    }
  };

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-KE', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const activeTeachers = teachers.filter(t => t.status === 'active').length;
  const pendingTeachers = teachers.filter(t => t.status === 'pending').length;
  const totalFiles = teachers.reduce((sum, teacher) => sum + teacher.filesCount, 0);
  const totalCategories = categories.length;
  const sharedFilesCount = 8; // Mock data

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage teachers, monitor system activity, and oversee document management
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teachers.length}</div>
              <p className="text-xs text-muted-foreground">
                {activeTeachers} active, {pendingTeachers} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Files</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalFiles}</div>
              <p className="text-xs text-muted-foreground">
                Across all teachers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCategories}</div>
              <p className="text-xs text-muted-foreground">
                Document categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shared Files</CardTitle>
              <Share className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sharedFilesCount}</div>
              <p className="text-xs text-muted-foreground">
                Currently shared
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest system activities and user actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{activity.teacherName}</span>{' '}
                        {getActivityDescription(activity)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDateTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Teachers Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Teachers
                </div>
                <Button size="sm" onClick={() => window.location.href = '/admin/teachers'}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Teacher
                </Button>
              </CardTitle>
              <CardDescription>
                Recent teacher registrations and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teachers.slice(0, 4).map((teacher) => (
                  <div key={teacher.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {teacher.firstName[0]}{teacher.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {teacher.firstName} {teacher.lastName}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{teacher.filesCount} files</span>
                          <span>•</span>
                          <span>Joined {formatDate(teacher.joinDate)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(teacher.status)}
                      {teacher.status === 'pending' && (
                        <Button size="sm" variant="outline">
                          Approve
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categories Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Document Categories
              </div>
              <Button size="sm" onClick={() => window.location.href = '/admin/categories'}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </CardTitle>
            <CardDescription>
              Manage document categories and their requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium">{category.name}</h3>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {category.documentsCount} documents
                  </p>
                  <div className="flex items-center gap-2">
                    {category.requiresClassSubject ? (
                      <Badge variant="outline" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Requires Class/Subject
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        General Category
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Button variant="outline" className="h-20 flex-col" onClick={handleViewReports}>
            <BarChart3 className="h-6 w-6 mb-2" />
            <span>View Reports</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col" onClick={handleExportData}>
            <Download className="h-6 w-6 mb-2" />
            <span>Export Data</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col" onClick={handleSecuritySettings}>
            <Shield className="h-6 w-6 mb-2" />
            <span>Security Settings</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col" onClick={handleSystemLogs}>
            <Activity className="h-6 w-6 mb-2" />
            <span>System Logs</span>
          </Button>
        </div>
      </div>
    </Layout>
  );
}
