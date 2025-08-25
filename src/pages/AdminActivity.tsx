import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
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

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: 'teacher' | 'admin';
  action: 'login' | 'logout' | 'upload' | 'download' | 'share' | 'delete' | 'approve' | 'reject' | 'suspend' | 'settings_change';
  target?: string;
  targetType?: 'document' | 'user' | 'category' | 'system';
  ipAddress: string;
  timestamp: string;
  details?: string;
  severity: 'low' | 'medium' | 'high';
}

export default function AdminActivity() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7');

  const handleExportLogs = () => {
    // Generate and download activity logs CSV
    const csvHeaders = ['Timestamp', 'User', 'Role', 'Action', 'Target', 'IP Address', 'Severity', 'Details'];
    const csvRows = filteredActivities.map(activity => [
      new Date(activity.timestamp).toLocaleString(),
      activity.userName,
      activity.userRole,
      activity.action,
      activity.target,
      activity.ipAddress,
      activity.severity,
      activity.details.replace(/,/g, ';') // Replace commas to avoid CSV issues
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

  // Mock data - in real app, this would come from Django REST API
  useEffect(() => {
    const mockActivities: ActivityLog[] = [
      {
        id: '1',
        userId: 'admin1',
        userName: 'Admin User',
        userRole: 'admin',
        action: 'approve',
        target: 'Mary Ochieng',
        targetType: 'user',
        ipAddress: '192.168.1.10',
        timestamp: '2024-01-20T10:30:00Z',
        details: 'Approved teacher account registration',
        severity: 'medium'
      },
      {
        id: '2',
        userId: 'teacher1',
        userName: 'Jane Mwangi',
        userRole: 'teacher',
        action: 'upload',
        target: 'Mathematics Lesson Plan - Week 5',
        targetType: 'document',
        ipAddress: '192.168.1.15',
        timestamp: '2024-01-20T09:15:00Z',
        details: 'Uploaded new lesson plan document',
        severity: 'low'
      },
      {
        id: '3',
        userId: 'teacher2',
        userName: 'John Kiprotich',
        userRole: 'teacher',
        action: 'share',
        target: 'Science Assessment Template',
        targetType: 'document',
        ipAddress: '192.168.1.22',
        timestamp: '2024-01-20T08:45:00Z',
        details: 'Shared document with 3 colleagues',
        severity: 'low'
      },
      {
        id: '4',
        userId: 'admin1',
        userName: 'Admin User',
        userRole: 'admin',
        action: 'suspend',
        target: 'David Mwema',
        targetType: 'user',
        ipAddress: '192.168.1.10',
        timestamp: '2024-01-19T16:20:00Z',
        details: 'Suspended teacher account for policy violation',
        severity: 'high'
      },
      {
        id: '5',
        userId: 'teacher3',
        userName: 'Mary Ochieng',
        userRole: 'teacher',
        action: 'login',
        ipAddress: '192.168.1.33',
        timestamp: '2024-01-19T14:30:00Z',
        details: 'Successful login via 2FA',
        severity: 'low'
      },
      {
        id: '6',
        userId: 'teacher1',
        userName: 'Jane Mwangi',
        userRole: 'teacher',
        action: 'delete',
        target: 'Old Lesson Plan Draft',
        targetType: 'document',
        ipAddress: '192.168.1.15',
        timestamp: '2024-01-19T12:15:00Z',
        details: 'Deleted draft document',
        severity: 'medium'
      },
      {
        id: '7',
        userId: 'admin1',
        userName: 'Admin User',
        userRole: 'admin',
        action: 'settings_change',
        target: 'Category: Lesson Plans',
        targetType: 'category',
        ipAddress: '192.168.1.10',
        timestamp: '2024-01-19T11:00:00Z',
        details: 'Modified category requirements',
        severity: 'medium'
      },
      {
        id: '8',
        userId: 'teacher4',
        userName: 'David Mwema',
        userRole: 'teacher',
        action: 'download',
        target: 'Mathematics Assessment Template',
        targetType: 'document',
        ipAddress: '192.168.1.44',
        timestamp: '2024-01-19T10:30:00Z',
        details: 'Downloaded shared document',
        severity: 'low'
      }
    ];
    setActivities(mockActivities);
    setFilteredActivities(mockActivities);
  }, []);

  // Filter activities
  useEffect(() => {
    let filtered = activities.filter(activity => {
      const matchesSearch = activity.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           activity.target?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           activity.details?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesAction = actionFilter === 'all' || activity.action === actionFilter;
      const matchesUser = userFilter === 'all' || activity.userId === userFilter;
      const matchesSeverity = severityFilter === 'all' || activity.severity === severityFilter;

      return matchesSearch && matchesAction && matchesUser && matchesSeverity;
    });

    setFilteredActivities(filtered);
  }, [activities, searchQuery, actionFilter, userFilter, severityFilter]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login':
      case 'logout':
        return <User className="h-4 w-4" />;
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
      case 'suspend':
        return <Shield className="h-4 w-4" />;
      case 'settings_change':
        return <Settings className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'upload':
      case 'approve':
        return 'text-success';
      case 'delete':
      case 'reject':
      case 'suspend':
        return 'text-destructive';
      case 'share':
      case 'download':
        return 'text-info';
      case 'settings_change':
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
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
    const baseAction = activity.action.replace('_', ' ');
    if (activity.target) {
      return `${baseAction} "${activity.target}"`;
    }
    return baseAction;
  };

  const users = Array.from(new Set(activities.map(a => a.userName)));
  const actions = Array.from(new Set(activities.map(a => a.action)));

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
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{activities.length}</div>
              <p className="text-xs text-muted-foreground">Total Activities</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-success">
                {activities.filter(a => a.severity === 'low').length}
              </div>
              <p className="text-xs text-muted-foreground">Low Severity</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-warning">
                {activities.filter(a => a.severity === 'medium').length}
              </div>
              <p className="text-xs text-muted-foreground">Medium Severity</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-destructive">
                {activities.filter(a => a.severity === 'high').length}
              </div>
              <p className="text-xs text-muted-foreground">High Severity</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
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
                    {actions.map(action => (
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
                    {users.map(user => (
                      <SelectItem key={user} value={user}>{user}</SelectItem>
                    ))}
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
          <CardContent>
            <div className="space-y-4">
              {filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className={`p-2 rounded-full bg-muted ${getActionColor(activity.action)}`}>
                      {getActionIcon(activity.action)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {activity.userName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{activity.userName}</span>
                        <Badge variant="outline" className="text-xs">
                          {activity.userRole}
                        </Badge>
                      </div>
                      {getSeverityBadge(activity.severity)}
                    </div>
                    
                    <p className="text-sm">
                      <span className="font-medium">{formatActionText(activity)}</span>
                      {activity.details && (
                        <span className="text-muted-foreground"> - {activity.details}</span>
                      )}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDateTime(activity.timestamp)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>IP: {activity.ipAddress}</span>
                      </div>
                      {activity.targetType && (
                        <div className="flex items-center gap-1">
                          <span>Target: {activity.targetType}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
