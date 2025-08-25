import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
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
} from '../components/ui/dialog';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Share, 
  Trash2, 
  MoreHorizontal,
  FileText,
  Image,
  File,
  Calendar,
  User,
  CheckCircle,
  AlertTriangle,
  Ban,
  Flag,
  Archive
} from 'lucide-react';

interface Document {
  id: string;
  title: string;
  fileName: string;
  category: string;
  class?: string;
  subject?: string;
  description?: string;
  uploadDate: string;
  fileSize: string;
  fileType: string;
  isShared: boolean;
  downloadCount: number;
  uploader: string;
  uploaderName: string;
  status: 'active' | 'flagged' | 'archived';
  lastAccessed?: string;
}

export default function AdminDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [uploaderFilter, setUploaderFilter] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  // Mock data - in real app, this would come from Django REST API
  useEffect(() => {
    const mockDocuments: Document[] = [
      {
        id: '1',
        title: 'Mathematics Lesson Plan - Week 5',
        fileName: 'math_lesson_week5.pdf',
        category: 'Lesson Plans',
        class: 'Grade 5',
        subject: 'Mathematics',
        description: 'Comprehensive lesson plan covering algebra basics',
        uploadDate: '2024-01-15',
        fileSize: '2.3 MB',
        fileType: 'PDF',
        isShared: false,
        downloadCount: 12,
        uploader: 'teacher1',
        uploaderName: 'Jane Mwangi',
        status: 'active',
        lastAccessed: '2024-01-20T10:30:00Z'
      },
      {
        id: '2',
        title: 'Science Assessment Report',
        fileName: 'science_assessment_q1.docx',
        category: 'Assessment Reports',
        class: 'Grade 6',
        subject: 'Science',
        description: 'First quarter science assessment results and analysis',
        uploadDate: '2024-01-14',
        fileSize: '1.8 MB',
        fileType: 'DOCX',
        isShared: true,
        downloadCount: 8,
        uploader: 'teacher2',
        uploaderName: 'John Kiprotich',
        status: 'active',
        lastAccessed: '2024-01-19T16:45:00Z'
      },
      {
        id: '3',
        title: 'English Literature Study Guide',
        fileName: 'english_lit_guide.pdf',
        category: 'Curriculum Materials',
        class: 'Grade 7',
        subject: 'English',
        description: 'Study guide for analyzing literary works',
        uploadDate: '2024-01-12',
        fileSize: '3.1 MB',
        fileType: 'PDF',
        isShared: false,
        downloadCount: 15,
        uploader: 'teacher3',
        uploaderName: 'Mary Ochieng',
        status: 'flagged',
        lastAccessed: '2024-01-18T12:15:00Z'
      },
      {
        id: '4',
        title: 'Student Progress Report Template',
        fileName: 'progress_report_template.xlsx',
        category: 'Administrative Forms',
        description: 'Standardized template for student progress reporting',
        uploadDate: '2024-01-10',
        fileSize: '432 KB',
        fileType: 'XLSX',
        isShared: true,
        downloadCount: 25,
        uploader: 'teacher1',
        uploaderName: 'Jane Mwangi',
        status: 'active',
        lastAccessed: '2024-01-17T08:30:00Z'
      },
      {
        id: '5',
        title: 'Physics Experiment Results',
        fileName: 'physics_experiments.pptx',
        category: 'Lesson Plans',
        class: 'Grade 8',
        subject: 'Science',
        description: 'Results and analysis of physics experiments conducted',
        uploadDate: '2024-01-08',
        fileSize: '4.2 MB',
        fileType: 'PPTX',
        isShared: false,
        downloadCount: 6,
        uploader: 'teacher4',
        uploaderName: 'David Mwema',
        status: 'archived',
        lastAccessed: '2024-01-15T14:20:00Z'
      }
    ];
    setDocuments(mockDocuments);
    setFilteredDocuments(mockDocuments);
  }, []);

  // Filter documents
  useEffect(() => {
    let filtered = documents.filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           doc.uploaderName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
      const matchesUploader = uploaderFilter === 'all' || doc.uploader === uploaderFilter;

      return matchesSearch && matchesCategory && matchesStatus && matchesUploader;
    });

    setFilteredDocuments(filtered);
  }, [documents, searchQuery, categoryFilter, statusFilter, uploaderFilter]);

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image') || fileType === 'JPG' || fileType === 'PNG') {
      return <Image className="h-5 w-5 text-blue-500" />;
    }
    if (fileType === 'PDF') {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success/10 text-success border-success/20">Active</Badge>;
      case 'flagged':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Flagged</Badge>;
      case 'archived':
        return <Badge variant="secondary">Archived</Badge>;
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

  const handleDownload = (document: Document) => {
    console.log('Downloading:', document.fileName);
    setDocuments(prev => prev.map(doc => 
      doc.id === document.id 
        ? { ...doc, downloadCount: doc.downloadCount + 1 }
        : doc
    ));
  };

  const handleFlagDocument = (document: Document) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === document.id 
        ? { ...doc, status: doc.status === 'flagged' ? 'active' : 'flagged' }
        : doc
    ));
    setActionSuccess(`Document ${document.status === 'flagged' ? 'unflagged' : 'flagged'} successfully!`);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleArchiveDocument = (document: Document) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === document.id 
        ? { ...doc, status: doc.status === 'archived' ? 'active' : 'archived' }
        : doc
    ));
    setActionSuccess(`Document ${document.status === 'archived' ? 'unarchived' : 'archived'} successfully!`);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleDeleteDocument = () => {
    if (selectedDocument) {
      setDocuments(prev => prev.filter(doc => doc.id !== selectedDocument.id));
      setDeleteDialogOpen(false);
      setSelectedDocument(null);
      setActionSuccess('Document deleted successfully!');
      setTimeout(() => setActionSuccess(''), 3000);
    }
  };

  const categories = Array.from(new Set(documents.map(doc => doc.category)));
  const uploaders = Array.from(new Set(documents.map(doc => doc.uploaderName)));
  
  const activeDocuments = documents.filter(d => d.status === 'active').length;
  const flaggedDocuments = documents.filter(d => d.status === 'flagged').length;
  const archivedDocuments = documents.filter(d => d.status === 'archived').length;
  const totalDownloads = documents.reduce((sum, doc) => sum + doc.downloadCount, 0);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">All Documents</h1>
          <p className="text-muted-foreground">
            System-wide document management and monitoring
          </p>
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
              <div className="text-2xl font-bold">{documents.length}</div>
              <p className="text-xs text-muted-foreground">Total Documents</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-success">{activeDocuments}</div>
              <p className="text-xs text-muted-foreground">Active Documents</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-warning">{flaggedDocuments}</div>
              <p className="text-xs text-muted-foreground">Flagged Documents</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{totalDownloads}</div>
              <p className="text-xs text-muted-foreground">Total Downloads</p>
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
                  placeholder="Search documents, descriptions, or uploaders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="flagged">Flagged</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={uploaderFilter} onValueChange={setUploaderFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Uploader" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Uploaders</SelectItem>
                    {uploaders.map(uploader => (
                      <SelectItem key={uploader} value={uploader}>{uploader}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle>Documents ({filteredDocuments.length})</CardTitle>
            <CardDescription>
              Manage all documents uploaded by teachers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredDocuments.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {getFileIcon(document.fileType)}
                    </div>
                    
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{document.title}</h3>
                        {getStatusBadge(document.status)}
                        {document.isShared && (
                          <Badge variant="outline" className="text-xs">
                            <Share className="h-3 w-3 mr-1" />
                            Shared
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {document.description || document.fileName}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{document.uploaderName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(document.uploadDate)}</span>
                        </div>
                        <span>{document.fileSize}</span>
                        <span>{document.downloadCount} downloads</span>
                        {document.class && document.subject && (
                          <span>{document.class} - {document.subject}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedDocument(document);
                            setViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(document)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleFlagDocument(document)}>
                          <Flag className="h-4 w-4 mr-2" />
                          {document.status === 'flagged' ? 'Unflag' : 'Flag'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleArchiveDocument(document)}>
                          <Archive className="h-4 w-4 mr-2" />
                          {document.status === 'archived' ? 'Unarchive' : 'Archive'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedDocument(document);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Document Details Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Document Details</DialogTitle>
            </DialogHeader>
            {selectedDocument && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {getFileIcon(selectedDocument.fileType)}
                  <div>
                    <h3 className="text-lg font-semibold">{selectedDocument.title}</h3>
                    <p className="text-muted-foreground">{selectedDocument.fileName}</p>
                    {getStatusBadge(selectedDocument.status)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <p className="text-sm text-muted-foreground">{selectedDocument.category}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">File Size</label>
                    <p className="text-sm text-muted-foreground">{selectedDocument.fileSize}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Uploaded By</label>
                    <p className="text-sm text-muted-foreground">{selectedDocument.uploaderName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Upload Date</label>
                    <p className="text-sm text-muted-foreground">{formatDate(selectedDocument.uploadDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Downloads</label>
                    <p className="text-sm text-muted-foreground">{selectedDocument.downloadCount}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Shared</label>
                    <p className="text-sm text-muted-foreground">{selectedDocument.isShared ? 'Yes' : 'No'}</p>
                  </div>
                  {selectedDocument.class && selectedDocument.subject && (
                    <>
                      <div>
                        <label className="text-sm font-medium">Class</label>
                        <p className="text-sm text-muted-foreground">{selectedDocument.class}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Subject</label>
                        <p className="text-sm text-muted-foreground">{selectedDocument.subject}</p>
                      </div>
                    </>
                  )}
                  {selectedDocument.lastAccessed && (
                    <div className="col-span-2">
                      <label className="text-sm font-medium">Last Accessed</label>
                      <p className="text-sm text-muted-foreground">{formatDateTime(selectedDocument.lastAccessed)}</p>
                    </div>
                  )}
                </div>

                {selectedDocument.description && (
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <p className="text-sm text-muted-foreground">{selectedDocument.description}</p>
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

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Document</DialogTitle>
              <DialogDescription>
                Are you sure you want to permanently delete "{selectedDocument?.title}"? 
                This action cannot be undone and will remove the document from all teachers' accounts.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteDocument}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Document
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
