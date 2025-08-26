import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '../components/ui/dropdown-menu';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { 
  Search, 
  Filter, 
  UserPlus, 
  UserCheck, 
  UserX, 
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Shield,
  FileText,
  Download,
  Users,
  Activity,
  Pause,
  Play,
  Loader2
} from 'lucide-react';
import { useTeachers } from '../hooks/useTeachers';
import { useDocuments } from '../hooks/useDocuments';
import { toast } from 'sonner';

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  status: 'active' | 'pending' | 'suspended' | 'rejected';
  joinDate: string;
  lastLogin?: string;
  documentsCount: number;
  approvalDate?: string;
  approvedBy?: string;
  rejectionReason?: string;
  bio?: string;
}

interface NewTeacherData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  temporaryPassword: string;
}

export default function AdminTeachers() {
  const { teachers, isLoading, approveTeacher, updateTeacher } = useTeachers();
  const { documents } = useDocuments();
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [addTeacherDialogOpen, setAddTeacherDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [suspensionReason, setSuspensionReason] = useState('');

  const [newTeacher, setNewTeacher] = useState<NewTeacherData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    temporaryPassword: ''
  });

  // Mock data - in real app, this would come from Django REST API
  useEffect(() => {
    setFilteredTeachers(teachers);
  }, [teachers]);

  // Filter teachers based on search and status
  useEffect(() => {
    let filtered = teachers.filter(teacher => {
      const matchesSearch = teacher.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           teacher.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           teacher.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || teacher.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    setFilteredTeachers(filtered);
  }, [teachers, searchQuery, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success/10 text-success border-success/20">Active</Badge>;
      case 'pending':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Pending</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="border-destructive text-destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
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

  const handleApproveTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setApproveDialogOpen(true);
  };

  const confirmApproval = async () => {
    if (selectedTeacher) {
      try {
        await updateTeacher(selectedTeacher.id, { 
          status: 'active',
          approval_date: new Date().toISOString(),
          approved_by: 'Admin User'
        });
        setApproveDialogOpen(false);
        setSelectedTeacher(null);
        toast.success('Teacher approved successfully!');
      } catch (error) {
        toast.error('Failed to approve teacher');
      }
    }
  };

  const handleRejectTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setRejectDialogOpen(true);
  };

  const confirmRejection = async () => {
    if (selectedTeacher && rejectionReason.trim()) {
      try {
        await updateTeacher(selectedTeacher.id, { 
          status: 'rejected',
          rejection_reason: rejectionReason
        });
        setRejectDialogOpen(false);
        setSelectedTeacher(null);
        setRejectionReason('');
        toast.success('Teacher account rejected');
      } catch (error) {
        toast.error('Failed to reject teacher');
      }
    }
  };

  const handleSuspendTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setSuspendDialogOpen(true);
  };

  const confirmSuspension = async () => {
    if (selectedTeacher) {
      try {
        const newStatus = selectedTeacher.status === 'suspended' ? 'active' : 'suspended';
        await updateTeacher(selectedTeacher.id, { status: newStatus });
        setSuspendDialogOpen(false);
        setSelectedTeacher(null);
        setSuspensionReason('');
        toast.success(`Teacher ${newStatus === 'suspended' ? 'suspended' : 'reactivated'} successfully!`);
      } catch (error) {
        toast.error('Failed to update teacher status');
      }
    }
  };

  const handleAddTeacher = async () => {
    try {
      const teacherData = {
        first_name: newTeacher.firstName,
        last_name: newTeacher.lastName,
        email: newTeacher.email,
        phone_number: newTeacher.phoneNumber,
        temporary_password: newTeacher.temporaryPassword,
        status: 'active',
        approval_date: new Date().toISOString(),
        approved_by: 'Admin User'
      };

      await addTeacher(teacherData);
      setAddTeacherDialogOpen(false);
      setNewTeacher({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        temporaryPassword: ''
      });
      toast.success('Teacher added successfully!');
    } catch (error) {
      toast.error('Failed to add teacher');
    }
  };

  const generatePassword = () => {
    const password = Math.random().toString(36).slice(-10);
    setNewTeacher(prev => ({ ...prev, temporaryPassword: password }));
  };

  // Calculate document counts per teacher
  const getTeacherDocumentCount = (teacherId: string) => {
    return documents.filter(doc => doc.teacher?.id === teacherId).length;
  };

  const activeTeachers = teachers.filter(t => t.status === 'active').length;
  const pendingTeachers = teachers.filter(t => t.status === 'pending').length;
  const suspendedTeachers = teachers.filter(t => t.status === 'suspended').length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Teacher Management</h1>
            <p className="text-muted-foreground">
              Manage teacher accounts, approvals, and permissions
            </p>
          </div>
          <Button onClick={() => setAddTeacherDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Teacher
          </Button>
        </div>

        {/* Success Message */}
        {/* Success messages are now handled by toast notifications */}

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-success">{activeTeachers}</div>
              <p className="text-xs text-muted-foreground">Active Teachers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-warning">{pendingTeachers}</div>
              <p className="text-xs text-muted-foreground">Pending Approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-destructive">{suspendedTeachers}</div>
              <p className="text-xs text-muted-foreground">Suspended</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{teachers.length}</div>
              <p className="text-xs text-muted-foreground">Total Teachers</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search teachers by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Teachers List */}
        <Card>
          <CardHeader>
            <CardTitle>Teachers ({filteredTeachers.length})</CardTitle>
            <CardDescription>
              Manage teacher accounts and their access to the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Loading teachers...</span>
                </div>
              </div>
            ) : filteredTeachers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No teachers found</p>
              </div>
            ) : (
              <div className="space-y-4">
              {filteredTeachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {teacher.user?.firstName?.[0]}{teacher.user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">
                          {teacher.user?.firstName} {teacher.user?.lastName}
                        </h3>
                        {getStatusBadge(teacher.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{teacher.user?.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{teacher.phoneNumber}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          <span>{teacher.documentsCount || 0} documents</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Joined {formatDate(teacher.createdAt)}</span>
                        </div>
                        {teacher.last_login && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Last login {formatDateTime(teacher.last_login)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap">
                    {teacher.status === 'pending' && (
                      <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                        <Button 
                          size="sm" 
                          onClick={() => handleApproveTeacher(teacher)}
                          className="bg-success hover:bg-success/90 flex-1 lg:flex-initial"
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleRejectTeacher(teacher)}
                          className="flex-1 lg:flex-initial"
                        >
                          <UserX className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedTeacher(teacher);
                            setViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        {teacher.status === 'active' && (
                          <DropdownMenuItem onClick={() => handleSuspendTeacher(teacher)}>
                            <Pause className="h-4 w-4 mr-2" />
                            Suspend
                          </DropdownMenuItem>
                        )}
                        {teacher.status === 'suspended' && (
                          <DropdownMenuItem onClick={() => handleSuspendTeacher(teacher)}>
                            <Play className="h-4 w-4 mr-2" />
                            Reactivate
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
            )}
          </CardContent>
        </Card>

        {/* Add Teacher Dialog */}
        <Dialog open={addTeacherDialogOpen} onOpenChange={setAddTeacherDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Teacher</DialogTitle>
              <DialogDescription>
                Create a new teacher account with the following details
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={newTeacher.firstName}
                    onChange={(e) => setNewTeacher(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newTeacher.lastName}
                    onChange={(e) => setNewTeacher(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={newTeacher.email}
                  onChange={(e) => setNewTeacher(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={newTeacher.phoneNumber}
                  onChange={(e) => setNewTeacher(prev => ({ ...prev, phoneNumber: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temporaryPassword">Temporary Password</Label>
                <div className="flex gap-2">
                  <Input
                    id="temporaryPassword"
                    value={newTeacher.temporaryPassword}
                    onChange={(e) => setNewTeacher(prev => ({ ...prev, temporaryPassword: e.target.value }))}
                  />
                  <Button variant="outline" onClick={generatePassword}>
                    Generate
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddTeacherDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTeacher}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Teacher
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Teacher Details Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Teacher Details</DialogTitle>
            </DialogHeader>
            {selectedTeacher && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary/10 text-primary text-lg">
                      {selectedTeacher.user.firstName?.[0]}{selectedTeacher.user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {selectedTeacher.user.firstName} {selectedTeacher.user.lastName}
                    </h3>
                    <p className="text-muted-foreground">{selectedTeacher.user.email}</p>
                    {getStatusBadge(selectedTeacher.status)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Phone Number</Label>
                    <p className="text-sm text-muted-foreground">{selectedTeacher.phoneNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Documents</Label>
                    <p className="text-sm text-muted-foreground">{getTeacherDocumentCount(selectedTeacher.id)} uploaded</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Join Date</Label>
                    <p className="text-sm text-muted-foreground">{formatDate(selectedTeacher.createdAt)}</p>
                  </div>
                  {selectedTeacher.lastLogin && (
                    <div>
                      <Label className="text-sm font-medium">Last Login</Label>
                      <p className="text-sm text-muted-foreground">{formatDateTime(selectedTeacher.lastLogin)}</p>
                    </div>
                  )}
                </div>

                {selectedTeacher.bio && (
                  <div>
                    <Label className="text-sm font-medium">Bio</Label>
                    <p className="text-sm text-muted-foreground">{selectedTeacher.bio}</p>
                  </div>
                )}

                {selectedTeacher.rejectionReason && (
                  <div>
                    <Label className="text-sm font-medium">Rejection Reason</Label>
                    <p className="text-sm text-destructive">{selectedTeacher.rejectionReason}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Approval Dialog */}
        <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Teacher Account</DialogTitle>
              <DialogDescription>
                Are you sure you want to approve the account for {selectedTeacher?.first_name} {selectedTeacher?.last_name}? 
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

        {/* Rejection Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Teacher Account</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting {selectedTeacher?.first_name} {selectedTeacher?.last_name}'s account.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rejectionReason">Rejection Reason</Label>
                <Textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please explain why this account is being rejected..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmRejection}
                disabled={!rejectionReason.trim()}
              >
                <UserX className="h-4 w-4 mr-2" />
                Reject Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Suspend/Reactivate Dialog */}
        <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedTeacher?.status === 'suspended' ? 'Reactivate' : 'Suspend'} Teacher Account
              </DialogTitle>
              <DialogDescription>
                {selectedTeacher?.status === 'suspended' 
                  ? `Are you sure you want to reactivate ${selectedTeacher?.first_name} ${selectedTeacher?.last_name}'s account?`
                  : `Are you sure you want to suspend ${selectedTeacher?.first_name} ${selectedTeacher?.last_name}'s account?`
                }
              </DialogDescription>
            </DialogHeader>
            {selectedTeacher?.status !== 'suspended' && (
              <div className="space-y-2">
                <Label htmlFor="suspensionReason">Reason for Suspension</Label>
                <Textarea
                  id="suspensionReason"
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder="Please explain the reason for suspension..."
                  rows={3}
                />
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSuspendDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant={selectedTeacher?.status === 'suspended' ? 'default' : 'destructive'}
                onClick={confirmSuspension}
              >
                {selectedTeacher?.status === 'suspended' ? (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Reactivate Account
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Suspend Account
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
