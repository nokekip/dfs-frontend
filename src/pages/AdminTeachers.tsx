import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import UserAvatar from '../components/UserAvatar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
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
import { Teacher } from '../services/types';

interface NewTeacherData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  temporaryPassword: string;
}

interface NewTeacherData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  temporaryPassword: string;
}

export default function AdminTeachers() {
  const { teachers, isLoading, addTeacher, deleteTeacher, approveTeacher, updateTeacher } = useTeachers();
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [suspensionReason, setSuspensionReason] = useState('');

  const [newTeacher, setNewTeacher] = useState<NewTeacherData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    temporaryPassword: ''
  });

  // Filter teachers based on search and filter criteria
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
    if (!selectedTeacher) {
      toast.error('No teacher selected');
      return;
    }
    
    try {
      const success = await approveTeacher(selectedTeacher.id, true);
      
      if (success) {
        setApproveDialogOpen(false);
        setSelectedTeacher(null);
        // Success message is already shown by the hook
      } else {
        toast.error('Failed to approve teacher');
      }
    } catch (error) {
      toast.error('Failed to approve teacher');
    }
  };

  const handleRejectTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setRejectDialogOpen(true);
  };

  const confirmRejection = async () => {
    if (!selectedTeacher) {
      toast.error('No teacher selected');
      return;
    }
    
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    try {
      const success = await approveTeacher(selectedTeacher.id, false, rejectionReason.trim());
      
      if (success) {
        setRejectDialogOpen(false);
        setSelectedTeacher(null);
        setRejectionReason('');
        // Success message is already shown by the hook
      } else {
        toast.error('Failed to reject teacher');
      }
    } catch (error) {
      toast.error('Failed to reject teacher');
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
    // Validate required fields
    if (!newTeacher.firstName.trim()) {
      toast.error('First name is required');
      return;
    }
    
    if (!newTeacher.lastName.trim()) {
      toast.error('Last name is required');
      return;
    }
    
    if (!newTeacher.email.trim()) {
      toast.error('Email is required');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newTeacher.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    if (!newTeacher.temporaryPassword.trim()) {
      toast.error('Temporary password is required');
      return;
    }
    
    if (newTeacher.temporaryPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      const teacherData = {
        user: {
          firstName: newTeacher.firstName.trim(),
          lastName: newTeacher.lastName.trim(),
          email: newTeacher.email.trim(),
          password: newTeacher.temporaryPassword
        },
        phoneNumber: newTeacher.phoneNumber?.trim() || undefined
      };

      const success = await addTeacher(teacherData);
      
      if (success) {
        setAddTeacherDialogOpen(false);
        setNewTeacher({
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          temporaryPassword: ''
        });
        // Success message is already shown by the hook
      } else {
        toast.error('Failed to add teacher. Please try again.');
      }
    } catch (error) {
      toast.error('Failed to add teacher. Please try again.');
    }
  };

  const generatePassword = () => {
    const password = Math.random().toString(36).slice(-10);
    setNewTeacher(prev => ({ ...prev, temporaryPassword: password }));
  };

  const handleDeleteTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedTeacher) {
      toast.error('No teacher selected');
      return;
    }
    
    try {
      const success = await deleteTeacher(selectedTeacher.id);
      
      if (success) {
        setDeleteDialogOpen(false);
        setSelectedTeacher(null);
        // Success message is already shown by the hook
      } else {
        toast.error('Failed to delete teacher');
      }
    } catch (error) {
      toast.error('Failed to delete teacher');
    }
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
                    <UserAvatar 
                      user={teacher.user} 
                      size="xl" 
                      fallbackClassName="bg-primary/10 text-primary"
                    />
                    
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
                        {/* {teacher.lastLogin && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Last login {formatDateTime(teacher.lastLogin)}</span>
                          </div>
                        )} */}
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
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteTeacher(teacher)}
                        >
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
                  <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="firstName"
                    value={newTeacher.firstName}
                    onChange={(e) => setNewTeacher(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="lastName"
                    value={newTeacher.lastName}
                    onChange={(e) => setNewTeacher(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  value={newTeacher.email}
                  onChange={(e) => setNewTeacher(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={newTeacher.phoneNumber}
                  onChange={(e) => setNewTeacher(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="Enter phone number (optional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temporaryPassword">Temporary Password <span className="text-red-500">*</span></Label>
                <div className="flex gap-2">
                  <Input
                    id="temporaryPassword"
                    type="password"
                    value={newTeacher.temporaryPassword}
                    onChange={(e) => setNewTeacher(prev => ({ ...prev, temporaryPassword: e.target.value }))}
                    placeholder="Enter temporary password (min 6 characters)"
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
                  <UserAvatar 
                    user={selectedTeacher.user} 
                    size="xl" 
                    fallbackClassName="bg-primary/10 text-primary text-lg"
                  />
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
                  {/* {selectedTeacher.lastLogin && (
                    <div>
                      <Label className="text-sm font-medium">Last Login</Label>
                      <p className="text-sm text-muted-foreground">{formatDateTime(selectedTeacher.lastLogin)}</p>
                    </div>
                  )} */}
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

        {/* Rejection Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Teacher Account</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting {selectedTeacher?.user.firstName} {selectedTeacher?.user.lastName}'s account.
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
                  ? `Are you sure you want to reactivate ${selectedTeacher?.user.firstName} ${selectedTeacher?.user.lastName}'s account?`
                  : `Are you sure you want to suspend ${selectedTeacher?.user.firstName} ${selectedTeacher?.user.lastName}'s account?`
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

        {/* Delete Teacher Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Teacher Account</DialogTitle>
              <DialogDescription>
                Are you sure you want to permanently delete {selectedTeacher?.user.firstName} {selectedTeacher?.user.lastName}'s account? 
                This action cannot be undone and will remove all their data including uploaded documents.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 my-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <h4 className="font-medium text-destructive">Warning</h4>
                  <p className="text-sm text-destructive/80 mt-1">
                    This will permanently delete:
                  </p>
                  <ul className="text-sm text-destructive/80 mt-2 space-y-1">
                    <li>• Teacher account and profile</li>
                    <li>• All uploaded documents</li>
                    <li>• Sharing history and permissions</li>
                    <li>• Activity logs and statistics</li>
                  </ul>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Permanently
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
