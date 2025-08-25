import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTeachers } from '../hooks/useTeachers';
import { useCategories } from '../hooks/useCategories';
import { useDashboard } from '../hooks/useDashboard';
import Layout from '../components/Layout';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorBoundary';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
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
import type { Teacher, DocumentCategory } from '../services/types';

interface ActivityLog {
  id: string;
  teacherName: string;
  action: 'upload' | 'delete' | 'share' | 'login';
  fileName?: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { 
    teachers, 
    isLoading: teachersLoading, 
    error: teachersError, 
    approveTeacher, 
    fetchTeachers 
  } = useTeachers();
  const { 
    categories, 
    isLoading: categoriesLoading, 
    error: categoriesError, 
    fetchCategories 
  } = useCategories();
  const { 
    stats, 
    isLoading: statsLoading, 
    error: statsError, 
    fetchDashboardStats 
  } = useDashboard('admin');

  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  
  // Dialog states
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchTeachers();
    fetchCategories();
    fetchDashboardStats();
    
    // Mock recent activity - in real app, this would come from API
    setRecentActivity([
      {
        id: '1',
        teacherName: 'Jane Doe',
        action: 'upload',
        fileName: 'Mathematics Lesson Plan.pdf',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
      {
        id: '2',
        teacherName: 'John Smith',
        action: 'share',
        fileName: 'Science Assessment.docx',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      },
      {
        id: '3',
        teacherName: 'Mary Johnson',
        action: 'login',
        timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      },
    ]);
  }, [fetchTeachers, fetchCategories, fetchDashboardStats]);

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

  const handleApproveTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setApproveDialogOpen(true);
  };

  const confirmApproval = async () => {
    if (selectedTeacher) {
      try {
        await approveTeacher(selectedTeacher.id, true);
        fetchTeachers(); // Refresh list
        setApproveDialogOpen(false);
        setSelectedTeacher(null);
      } catch (error) {
        console.error('Failed to approve teacher:', error);
      }
    }
  };

  // Loading state
  if (teachersLoading || categoriesLoading || statsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loading text="Loading admin dashboard..." />
        </div>
      </Layout>
    );
  }

  // Error state
  if (teachersError || categoriesError || statsError) {
    return (
      <Layout>
        <ErrorMessage message={teachersError || categoriesError || statsError || 'Unknown error'} />
      </Layout>
    );
  }

  const handleEditCategory = (category: DocumentCategory) => {
    setSelectedCategory(category);
    setEditCategoryDialogOpen(true);
  };

  const confirmEditCategory = () => {
    if (selectedCategory) {
      // For now, just redirect to categories page for actual editing
      setEditCategoryDialogOpen(false);
      setSelectedCategory(null);
      window.location.href = '/admin/categories';
    }
  };

  const handleDeleteCategory = (category: DocumentCategory) => {
    setSelectedCategory(category);
    setDeleteCategoryDialogOpen(true);
  };

  const confirmDeleteCategory = () => {
    if (!selectedCategory) return;
    
    if (selectedCategory.documentsCount > 0) {
      console.log('Cannot delete category with existing documents');
      setDeleteCategoryDialogOpen(false);
      setSelectedCategory(null);
      return;
    }
    
    // In real app, this would call deleteCategory API
    console.log(`Deleted category: ${selectedCategory.name}`);
    setDeleteCategoryDialogOpen(false);
    setSelectedCategory(null);
    fetchCategories(); // Refresh list
  };

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
              <div className="text-2xl font-bold">{(stats as any)?.totalTeachers || 0}</div>
              <p className="text-xs text-muted-foreground">
                {(stats as any)?.activeTeachers || 0} active, {(stats as any)?.pendingTeachers || 0} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Files</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats as any)?.totalDocuments || 0}</div>
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
              <div className="text-2xl font-bold">{(stats as any)?.totalCategories || 0}</div>
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
              <div className="text-2xl font-bold">{(stats as any)?.sharedDocuments || 0}</div>
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
                          {teacher.user.firstName[0]}{teacher.user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {teacher.user.firstName} {teacher.user.lastName}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{teacher.documentsCount} files</span>
                          <span>•</span>
                          <span>Joined {formatDate(teacher.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(teacher.status)}
                      {teacher.status === 'pending' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleApproveTeacher(teacher)}
                        >
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
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteCategory(category)}
                      >
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

      {/* Approval Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Teacher Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve the account for {selectedTeacher?.user.firstName} {selectedTeacher?.user.lastName}? 
              They will gain full access to the system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmApproval} className="bg-success hover:bg-success/90">
              <UserCheck className="h-4 w-4 mr-2" />
              Approve Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={editCategoryDialogOpen} onOpenChange={setEditCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              You will be redirected to the categories management page to edit "{selectedCategory?.name}".
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmEditCategory}>
              <Edit className="h-4 w-4 mr-2" />
              Continue to Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      <Dialog open={deleteCategoryDialogOpen} onOpenChange={setDeleteCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the category "{selectedCategory?.name}"? 
              {selectedCategory?.documentsCount === 0 
                ? " This action cannot be undone."
                : ` This category has ${selectedCategory?.documentsCount} documents and cannot be deleted.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmDeleteCategory} 
              variant="destructive"
              disabled={selectedCategory?.documentsCount ? selectedCategory.documentsCount > 0 : false}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
