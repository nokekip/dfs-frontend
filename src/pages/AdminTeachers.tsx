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
  School,
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
  Play
} from 'lucide-react';

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  school: string;
  employeeId: string;
  status: 'active' | 'pending' | 'suspended' | 'rejected';
  joinDate: string;
  lastLogin?: string;
  documentsCount: number;
  approvalDate?: string;
  approvedBy?: string;
  rejectionReason?: string;
  subjects: string[];
  bio?: string;
}

interface NewTeacherData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  school: string;
  employeeId: string;
  subjects: string[];
  temporaryPassword: string;
}

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
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
  const [actionSuccess, setActionSuccess] = useState('');

  const [newTeacher, setNewTeacher] = useState<NewTeacherData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    school: '',
    employeeId: '',
    subjects: [],
    temporaryPassword: ''
  });

  // Mock data - in real app, this would come from Django REST API
  useEffect(() => {
    const mockTeachers: Teacher[] = [
      {
        id: '1',
        firstName: 'Jane',
        lastName: 'Mwangi',
        email: 'jane.mwangi@school.co.ke',
        phoneNumber: '+254 712 345 678',
        school: 'Nairobi Primary School',
        employeeId: 'TSC/12345/2023',
        status: 'active',
        joinDate: '2024-01-15',
        lastLogin: '2024-01-20T08:30:00Z',
        documentsCount: 24,
        approvalDate: '2024-01-15',
        approvedBy: 'Admin User',
        subjects: ['Mathematics', 'Science'],
        bio: 'Experienced mathematics teacher with focus on primary education'
      },
      {
        id: '2',
        firstName: 'John',
        lastName: 'Kiprotich',
        email: 'john.kiprotich@school.co.ke',
        phoneNumber: '+254 720 987 654',
        school: 'Nairobi Primary School',
        employeeId: 'TSC/12346/2023',
        status: 'active',
        joinDate: '2024-01-10',
        lastLogin: '2024-01-19T16:45:00Z',
        documentsCount: 18,
        approvalDate: '2024-01-10',
        approvedBy: 'Admin User',
        subjects: ['English', 'Social Studies'],
        bio: 'Passionate about language arts and social studies curriculum'
      },
      {
        id: '3',
        firstName: 'Mary',
        lastName: 'Ochieng',
        email: 'mary.ochieng@school.co.ke',
        phoneNumber: '+254 731 456 789',
        school: 'Nairobi Primary School',
        employeeId: 'TSC/12347/2023',
        status: 'pending',
        joinDate: '2024-01-20',
        documentsCount: 0,
        subjects: ['Science', 'Physical Education'],
        bio: 'New teacher specializing in science and physical education'
      },
      {
        id: '4',
        firstName: 'David',
        lastName: 'Mwema',
        email: 'david.mwema@school.co.ke',
        phoneNumber: '+254 745 321 098',
        school: 'Nairobi Primary School',
        employeeId: 'TSC/12348/2023',
        status: 'suspended',
        joinDate: '2024-01-05',
        lastLogin: '2024-01-18T12:15:00Z',
        documentsCount: 12,
        approvalDate: '2024-01-05',
        approvedBy: 'Admin User',
        subjects: ['Kiswahili', 'Creative Arts']
      },
      {
        id: '5',
        firstName: 'Sarah',
        lastName: 'Wanjiku',
        email: 'sarah.wanjiku@school.co.ke',
        phoneNumber: '+254 756 654 321',
        school: 'Nairobi Primary School',
        employeeId: 'TSC/12349/2023',
        status: 'rejected',
        joinDate: '2024-01-18',
        documentsCount: 0,
        rejectionReason: 'Incomplete documentation provided',
        subjects: ['Mathematics']
      }
    ];
    setTeachers(mockTeachers);
    setFilteredTeachers(mockTeachers);
  }, []);

  // Filter teachers based on search and status
  useEffect(() => {
    let filtered = teachers.filter(teacher => {
      const matchesSearch = teacher.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           teacher.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           teacher.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
      
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

  const confirmApproval = () => {
    if (selectedTeacher) {
      setTeachers(prev => prev.map(teacher => 
        teacher.id === selectedTeacher.id 
          ? { ...teacher, status: 'active', approvalDate: new Date().toISOString(), approvedBy: 'Admin User' }
          : teacher
      ));
      setApproveDialogOpen(false);
      setSelectedTeacher(null);
      setActionSuccess('Teacher approved successfully!');
      setTimeout(() => setActionSuccess(''), 3000);
    }
  };

  const handleRejectTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setRejectDialogOpen(true);
  };

  const confirmRejection = () => {
    if (selectedTeacher && rejectionReason.trim()) {
      setTeachers(prev => prev.map(teacher => 
        teacher.id === selectedTeacher.id 
          ? { ...teacher, status: 'rejected', rejectionReason }
          : teacher
      ));
      setRejectDialogOpen(false);
      setSelectedTeacher(null);
      setRejectionReason('');
      setActionSuccess('Teacher account rejected');
      setTimeout(() => setActionSuccess(''), 3000);
    }
  };

  const handleSuspendTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setSuspendDialogOpen(true);
  };

  const confirmSuspension = () => {
    if (selectedTeacher) {
      const newStatus = selectedTeacher.status === 'suspended' ? 'active' : 'suspended';
      setTeachers(prev => prev.map(teacher => 
        teacher.id === selectedTeacher.id 
          ? { ...teacher, status: newStatus }
          : teacher
      ));
      setSuspendDialogOpen(false);
      setSelectedTeacher(null);
      setSuspensionReason('');
      setActionSuccess(`Teacher ${newStatus === 'suspended' ? 'suspended' : 'reactivated'} successfully!`);
      setTimeout(() => setActionSuccess(''), 3000);
    }
  };

  const handleAddTeacher = () => {
    const newTeacherData: Teacher = {
      id: Math.random().toString(36).substr(2, 9),
      ...newTeacher,
      status: 'active',
      joinDate: new Date().toISOString(),
      documentsCount: 0,
      approvalDate: new Date().toISOString(),
      approvedBy: 'Admin User'
    };

    setTeachers(prev => [...prev, newTeacherData]);
    setAddTeacherDialogOpen(false);
    setNewTeacher({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      school: '',
      employeeId: '',
      subjects: [],
      temporaryPassword: ''
    });
    setActionSuccess('Teacher added successfully!');
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const generatePassword = () => {
    const password = Math.random().toString(36).slice(-10);
    setNewTeacher(prev => ({ ...prev, temporaryPassword: password }));
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
        {actionSuccess && (
          <Alert className="bg-success/10 border-success/20">
            <CheckCircle className="h-4 w-4 text-success" />
            <AlertDescription className="text-success-foreground">
              {actionSuccess}
            </AlertDescription>
          </Alert>
        )}

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
                  placeholder="Search teachers by name, email, or TSC number..."
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
            <div className="space-y-4">
              {filteredTeachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {teacher.firstName[0]}{teacher.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">
                          {teacher.firstName} {teacher.lastName}
                        </h3>
                        {getStatusBadge(teacher.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{teacher.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{teacher.phoneNumber}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <School className="h-3 w-3" />
                          <span className="truncate">{teacher.employeeId}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          <span>{teacher.documentsCount} documents</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Joined {formatDate(teacher.joinDate)}</span>
                        </div>
                        {teacher.lastLogin && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Last login {formatDateTime(teacher.lastLogin)}</span>
                          </div>
                        )}
                      </div>
                      
                      {teacher.subjects.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {teacher.subjects.map((subject, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {teacher.status === 'pending' && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => handleApproveTeacher(teacher)}
                          className="bg-success hover:bg-success/90"
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleRejectTeacher(teacher)}
                        >
                          <UserX className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={newTeacher.phoneNumber}
                    onChange={(e) => setNewTeacher(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeId">TSC Number</Label>
                  <Input
                    id="employeeId"
                    value={newTeacher.employeeId}
                    onChange={(e) => setNewTeacher(prev => ({ ...prev, employeeId: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="school">School</Label>
                <Input
                  id="school"
                  value={newTeacher.school}
                  onChange={(e) => setNewTeacher(prev => ({ ...prev, school: e.target.value }))}
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
                      {selectedTeacher.firstName[0]}{selectedTeacher.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {selectedTeacher.firstName} {selectedTeacher.lastName}
                    </h3>
                    <p className="text-muted-foreground">{selectedTeacher.email}</p>
                    {getStatusBadge(selectedTeacher.status)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Phone Number</Label>
                    <p className="text-sm text-muted-foreground">{selectedTeacher.phoneNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">TSC Number</Label>
                    <p className="text-sm text-muted-foreground">{selectedTeacher.employeeId}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">School</Label>
                    <p className="text-sm text-muted-foreground">{selectedTeacher.school}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Documents</Label>
                    <p className="text-sm text-muted-foreground">{selectedTeacher.documentsCount} uploaded</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Join Date</Label>
                    <p className="text-sm text-muted-foreground">{formatDate(selectedTeacher.joinDate)}</p>
                  </div>
                  {selectedTeacher.lastLogin && (
                    <div>
                      <Label className="text-sm font-medium">Last Login</Label>
                      <p className="text-sm text-muted-foreground">{formatDateTime(selectedTeacher.lastLogin)}</p>
                    </div>
                  )}
                </div>

                {selectedTeacher.subjects.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Teaching Subjects</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedTeacher.subjects.map((subject, index) => (
                        <Badge key={index} variant="outline">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

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
                Are you sure you want to approve the account for {selectedTeacher?.firstName} {selectedTeacher?.lastName}? 
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
                Please provide a reason for rejecting {selectedTeacher?.firstName} {selectedTeacher?.lastName}'s account.
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
                  ? `Are you sure you want to reactivate ${selectedTeacher?.firstName} ${selectedTeacher?.lastName}'s account?`
                  : `Are you sure you want to suspend ${selectedTeacher?.firstName} ${selectedTeacher?.lastName}'s account?`
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
