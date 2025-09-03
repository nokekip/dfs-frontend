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
import { useDocuments } from '../hooks/useDocuments';
import { useCategories } from '../hooks/useCategories';
import { useTeachers } from '../hooks/useTeachers';
import { toast } from 'sonner';
import { getFileIconWithColor, formatFileSize } from '../lib/fileUtils';

export default function AdminDocuments() {
  const { documents, isLoading, deleteDocument, flagDocument, archiveDocument } = useDocuments();
  const { categories } = useCategories();
  const { teachers } = useTeachers();
  const [filteredDocuments, setFilteredDocuments] = useState(documents);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [uploaderFilter, setUploaderFilter] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Initialize filtered documents when documents change
  useEffect(() => {
    setFilteredDocuments(documents);
  }, [documents]);

  // Filter documents
  useEffect(() => {
    let filtered = documents.filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || doc.category?.id === categoryFilter;
      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
      const matchesUploader = uploaderFilter === 'all' || doc.teacher?.id === uploaderFilter;

      return matchesSearch && matchesCategory && matchesStatus && matchesUploader;
    });

    setFilteredDocuments(filtered);
  }, [documents, searchQuery, categoryFilter, statusFilter, uploaderFilter]);

  const getFileTypeDisplay = (fileType: string) => {
    if (!fileType) return 'File';
    
    const type = fileType.toLowerCase();
    
    // Handle file extensions (from backend file_type field)
    if (type === 'pdf') return 'PDF';
    if (type === 'doc' || type === 'docx') return 'DOCX';
    if (type === 'xls' || type === 'xlsx') return 'XLSX';
    if (type === 'ppt' || type === 'pptx') return 'PPTX';
    if (type === 'txt') return 'TXT';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(type)) return 'Image';
    
    // Handle MIME types (fallback)
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('document') || type.includes('word')) return 'DOCX';
    if (type.includes('sheet') || type.includes('excel')) return 'XLSX';
    if (type.includes('presentation') || type.includes('powerpoint')) return 'PPTX';
    if (type.includes('image')) return 'Image';
    if (type.includes('text')) return 'TXT';
    
    // Return the extension or type as uppercase
    return type.split('/').pop()?.toUpperCase() || fileType.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Invalid Date';
    try {
      return new Date(dateString).toLocaleDateString('en-KE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success/10 text-success border-success/20">Active</Badge>;
      case 'flagged':
        return <Badge variant="destructive">Flagged</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="outline">{status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown'}</Badge>;
    }
  };

  const getCategoryName = (document: any) => {
    return document.category?.name || 'Unknown Category';
  };

  const getTeacherName = (document: any) => {
    if (document.teacher?.user) {
      return `${document.teacher.user.firstName} ${document.teacher.user.lastName}`;
    }
    return 'Unknown Teacher';
  };

  const handleViewDocument = (document: any) => {
    setSelectedDocument(document);
    setViewDialogOpen(true);
  };

  const handleDeleteDocument = async () => {
    if (selectedDocument) {
      try {
        await deleteDocument(selectedDocument.id);
        setDeleteDialogOpen(false);
        setSelectedDocument(null);
        toast.success('Document deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete document');
      }
    }
  };

  const handleFlagDocument = async (document: any) => {
    const success = await flagDocument(document.id);
    if (!success) {
      toast.error('Failed to update document status');
    }
  };

  const handleArchiveDocument = async (document: any) => {
    const success = await archiveDocument(document.id);
    if (!success) {
      toast.error('Failed to update document status');
    }
  };

  const activeDocuments = documents.filter(d => d.status === 'active').length;
  const flaggedDocuments = documents.filter(d => d.status === 'flagged').length;
  const archivedDocuments = documents.filter(d => d.status === 'archived').length;
  const totalDownloads = documents.reduce((sum, doc) => sum + (doc.downloadCount || 0), 0);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Document Management</h1>
            <p className="text-muted-foreground">
              Monitor and manage all documents in the system
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-success">{activeDocuments}</div>
              <p className="text-xs text-muted-foreground">Active Documents</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-destructive">{flaggedDocuments}</div>
              <p className="text-xs text-muted-foreground">Flagged Documents</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-muted-foreground">{archivedDocuments}</div>
              <p className="text-xs text-muted-foreground">Archived Documents</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{totalDownloads}</div>
              <p className="text-xs text-muted-foreground">Total Downloads</p>
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
                  placeholder="Search documents by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
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
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Uploader" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Uploaders</SelectItem>
                  {teachers.map(teacher => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.user.firstName} {teacher.user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle>Documents ({filteredDocuments.length})</CardTitle>
            <CardDescription>
              All documents uploaded by teachers in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredDocuments.map((document) => (
                <div
                  key={document.id}
                  className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {getFileIconWithColor(document.fileType)}
                      <Badge variant="outline" className="text-xs">
                        {getFileTypeDisplay(document.fileType)}
                      </Badge>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{document.title}</h3>
                        {getStatusBadge(document.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span className="truncate">{getTeacherName(document)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(document.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Archive className="h-3 w-3" />
                          <span>{getCategoryName(document)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          <span>{document.downloadCount || 0} downloads</span>
                        </div>
                      </div>
                      
                      {document.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {document.description}
                        </p>
                      )}
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
                        <DropdownMenuItem onClick={() => handleViewDocument(document)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
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

        {/* View Document Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Document Details</DialogTitle>
            </DialogHeader>
            {selectedDocument && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {getFileIconWithColor(selectedDocument.fileType, 'h-8 w-8')}
                  <div>
                    <h3 className="text-lg font-semibold">{selectedDocument.title}</h3>
                    <p className="text-muted-foreground">{selectedDocument.fileName}</p>
                    {getStatusBadge(selectedDocument.status)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <p className="text-sm text-muted-foreground">{getCategoryName(selectedDocument)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">File Type</label>
                    <p className="text-sm text-muted-foreground">{getFileTypeDisplay(selectedDocument.fileType)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">File Size</label>
                    <p className="text-sm text-muted-foreground">{formatFileSize(selectedDocument.fileSize)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Uploaded By</label>
                    <p className="text-sm text-muted-foreground">{getTeacherName(selectedDocument)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Upload Date</label>
                    <p className="text-sm text-muted-foreground">{formatDate(selectedDocument.createdAt)}</p>
                  </div>
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
                Are you sure you want to delete "{selectedDocument?.title}"? This action cannot be undone.
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
