import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import UserAvatar from '../components/UserAvatar';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { apiClient } from '../services/api';
import { ActivityLog } from '../services/types';
import { 
  Search, 
  Filter, 
  Download, 
  Activity,
  User,
  FileText,
  Share,
  Trash2,
  UserCheck,
  Settings,
  Upload,
  Eye,
  Calendar,
  Clock,
  Shield,
  AlertTriangle
} from 'lucide-react';

export default function AdminActivity() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7');
  const [loading, setLoading] = useState(true);

  // Load activity logs from API
  useEffect(() => {
    const loadActivities = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getActivityLogs();
        
        // Ensure we have valid data and filter out any potential invalid entries
        const validActivities = (response.data || []).filter(activity => 
          activity && 
          activity.id && 
          activity.user && 
          activity.user.id && 
          activity.user.id.trim() !== ''
        );
        
        setActivities(validActivities);
        setFilteredActivities(validActivities);
      } catch (error) {
        console.error('Failed to load activity logs:', error);
        toast.error('Failed to load activity logs');
        // Set empty arrays in case of error to prevent undefined issues
        setActivities([]);
        setFilteredActivities([]);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, []);

  const handleExportLogs = () => {
    // Generate and download activity logs CSV
    const csvHeaders = ['Timestamp', 'User', 'Role', 'Action', 'Target', 'IP Address', 'Severity', 'Details'];
    const csvRows = filteredActivities.map(activity => [
      new Date(activity.createdAt).toLocaleString(),
      `${activity.user?.firstName || ''} ${activity.user?.lastName || ''}`.trim(),
      activity.user?.role || 'unknown',
      activity.action || '',
      activity.targetName || activity.targetType || '',
      activity.ipAddress || '',
      activity.severity || 'LOW',
      (activity.description || '').replace(/,/g, ';') // Replace commas to avoid CSV issues
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `activity-logs-${dateRange}days.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Export Complete', {
      description: `Activity logs for the last ${dateRange} days have been exported successfully`
    });
  };

  // Filter activities
  useEffect(() => {
    if (!activities || activities.length === 0) {
      setFilteredActivities([]);
      return;
    }

    let filtered = activities.filter(activity => {
      // Ensure activity and user data is valid
      if (!activity || !activity.user || !activity.user.id) return false;
      
      const fullUserName = `${activity.user.firstName || ''} ${activity.user.lastName || ''}`.trim();
      const matchesSearch = fullUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           activity.targetName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           activity.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesAction = actionFilter === 'all' || activity.action === actionFilter;
      const matchesUser = userFilter === 'all' || activity.user.id === userFilter;
      const matchesSeverity = severityFilter === 'all' || activity.severity?.toLowerCase() === severityFilter;

      return matchesSearch && matchesAction && matchesUser && matchesSeverity;
    });

    setFilteredActivities(filtered);
  }, [activities, searchQuery, actionFilter, userFilter, severityFilter]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login':
      case 'logout':
        return <User className="h-4 w-4" />;
      case 'create':
      case 'upload':
        return <Upload className="h-4 w-4" />;
      case 'download':
        return <Download className="h-4 w-4" />;
      case 'share':
        return <Share className="h-4 w-4" />;
      case 'delete':
        return <Trash2 className="h-4 w-4" />;
      case 'approve':
      case 'reject':
        return <UserCheck className="h-4 w-4" />;
      case 'flag':
      case 'archive':
        return <Shield className="h-4 w-4" />;
      case 'update':
        return <Settings className="h-4 w-4" />;
      case 'view':
        return <Eye className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
      case 'upload':
      case 'approve':
        return 'text-success';
      case 'delete':
      case 'reject':
      case 'flag':
        return 'text-destructive';
      case 'share':
      case 'download':
      case 'view':
        return 'text-info';
      case 'update':
      case 'archive':
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  const getSeverityBadge = (severity: string) => {
    const normalizedSeverity = severity.toLowerCase();
    switch (normalizedSeverity) {
      case 'high':
      case 'critical':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const formatActionText = (activity: ActivityLog) => {
    const baseAction = (activity.action || '').replace('_', ' ');
    if (activity.targetName) {
      return `${baseAction} "${activity.targetName}"`;
    }
    return baseAction;
  };

  const users = Array.from(new Set(
    activities
      .filter(a => a && a.user && a.user.firstName && a.user.lastName)
      .map(a => `${a.user.firstName} ${a.user.lastName}`)
  ));
  const actions = Array.from(new Set(
    activities
      .map(a => a?.action)
      .filter(action => action && action.trim() !== '')
  ));

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Activity Logs</h1>
            <p className="text-muted-foreground">
              Monitor system activities and user actions
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last 24 hours</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExportLogs}>
              <Download className="h-4 w-4 mr-2" />
              Export Logs
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-2">
                <div className="text-2xl font-bold">{activities.length}</div>
                <p className="text-xs text-muted-foreground">Total Activities</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-2">
                <div className="text-2xl font-bold text-success">
                  {activities.filter(a => a.severity.toLowerCase() === 'low').length}
                </div>
                <p className="text-xs text-muted-foreground">Low Severity</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-2">
                <div className="text-2xl font-bold text-warning">
                  {activities.filter(a => a.severity.toLowerCase() === 'medium').length}
                </div>
                <p className="text-xs text-muted-foreground">Medium Severity</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-2">
                <div className="text-2xl font-bold text-destructive">
                  {activities.filter(a => ['high', 'critical'].includes(a.severity.toLowerCase())).length}
                </div>
                <p className="text-xs text-muted-foreground">High Severity</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities, users, or targets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    {actions
                      .filter(action => action && action.trim() !== '') // Filter out empty actions
                      .map(action => (
                        <SelectItem key={action} value={action}>
                          {action.replace('_', ' ')}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="User" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {Array.from(new Set(
                      activities
                        .filter(a => a && a.user && a.user.id && a.user.id.trim() !== '')
                        .map(a => a.user.id)
                    )).map(userId => {
                      const activity = activities.find(a => a.user.id === userId);
                      const userName = activity && activity.user.firstName && activity.user.lastName 
                        ? `${activity.user.firstName} ${activity.user.lastName}` 
                        : userId;
                      return (
                        <SelectItem key={userId} value={userId}>{userName}</SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities ({filteredActivities.length})</CardTitle>
            <CardDescription>
              Chronological list of system activities
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredActivities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No activities found matching your filters.
                  </div>
                ) : (
                  filteredActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors w-full"
                    >
                      <div className="flex-shrink-0">
                        <div className={`p-2 rounded-full bg-muted ${getActionColor(activity.action || '')}`}>
                          {getActionIcon(activity.action || '')}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <UserAvatar 
                              user={{ 
                                firstName: activity.user?.firstName || '', 
                                lastName: activity.user?.lastName || '',
                                id: activity.user?.id || '', 
                                email: activity.user?.email || '', 
                                role: activity.user?.role || 'teacher',
                                isActive: activity.user?.isActive ?? true,
                                dateJoined: activity.user?.dateJoined || ''
                              }} 
                              size="sm" 
                            />
                            <span className="font-medium">
                              {activity.user?.firstName || ''} {activity.user?.lastName || ''}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {activity.user?.role || 'unknown'}
                            </Badge>
                          </div>
                          {getSeverityBadge(activity.severity || 'LOW')}
                        </div>
                        
                        <p className="text-sm">
                          <span className="font-medium">{formatActionText(activity)}</span>
                          {activity.description && (
                            <span className="text-muted-foreground"> - {activity.description}</span>
                          )}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDateTime(activity.createdAt)}</span>
                          </div>
                          {activity.ipAddress && (
                            <div className="flex items-center gap-1">
                              <span>IP: {activity.ipAddress}</span>
                            </div>
                          )}
                          {activity.targetType && (
                            <div className="flex items-center gap-1">
                              <span>Target: {activity.targetType}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
