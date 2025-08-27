import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ShareDialog from '../components/ShareDialog';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { useDocuments } from '../hooks/useDocuments';
import { Document } from '../services/types';
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
  FolderOpen,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  Upload,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface DocumentFile {
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
  lastModified: string;
}

type ViewMode = 'grid' | 'list';
type SortField = 'title' | 'uploadDate' | 'fileSize' | 'category';
type SortDirection = 'asc' | 'desc';

export default function TeacherDocuments() {
  const { documents, shareDocument, deleteDocument } = useDocuments();
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('uploadDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  // Filter and sort documents
  useEffect(() => {
    let filtered = documents.filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           doc.fileName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || doc.category.name === selectedCategory;
      const matchesClass = selectedClass === 'all' || doc.classLevel === selectedClass;
      const matchesSubject = selectedSubject === 'all' || doc.subject === selectedSubject;

      return matchesSearch && matchesCategory && matchesClass && matchesSubject;
    });

    // Sort documents
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'uploadDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortField === 'fileSize') {
        // fileSize is a number in Document interface
        aValue = aValue;
        bValue = bValue;
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredDocuments(filtered);
  }, [documents, searchQuery, selectedCategory, selectedClass, selectedSubject, sortField, sortDirection]);

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image') || fileType === 'JPG' || fileType === 'PNG') {
      return <Image className="h-6 w-6 text-blue-500" />;
    }
    if (fileType === 'PDF') {
      return <FileText className="h-6 w-6 text-red-500" />;
    }
    return <File className="h-6 w-6 text-gray-500" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDownload = (doc: Document) => {
    // In real app, this would trigger actual download
    toast.success('Download Started', {
      description: `Downloading ${doc.fileName}`
    });

    // Simulate download
    const link = window.document.createElement('a');
    link.href = '#'; // In real app, this would be the actual file URL
    link.download = doc.fileName;
    link.click();

    toast.success('Download Started', {
      description: `${doc.fileName} is being downloaded`
    });
  };

  const handlePreview = (document: Document) => {
    // In real app, this would open document in preview modal or new tab
    toast.info('Opening Preview', {
      description: `Opening ${document.fileName} in preview`
    });
    window.open(`/preview/${document.id}`, '_blank');
  };

  const handleShare = (document: Document) => {
    setSelectedDocument(document);
    setShareDialogOpen(true);
  };

  const handleUnshare = async (document: Document) => {
    try {
      await shareDocument(document.id, false);
      toast.success('Document Unshared', {
        description: `"${document.title}" is now private.`,
      });
    } catch (error) {
      toast.error('Failed to unshare document');
    }
  };

  const handleDelete = (document: Document) => {
    setSelectedDocument(document);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedDocument) {
      try {
        await deleteDocument(selectedDocument.id);
        setDeleteDialogOpen(false);
        setSelectedDocument(null);
        toast.success('File Deleted', {
          description: `${selectedDocument.fileName} has been deleted`
        });
      } catch (error) {
        toast.error('Delete Failed', {
          description: 'Failed to delete the document'
        });
      }
    }
  };

  const handleShareSubmit = async (shareData: any) => {
    if (selectedDocument) {
      // In real app, this would call the share API
      toast.success('Document Shared', {
        description: `${selectedDocument.fileName} has been shared successfully`
      });

      try {
        // Call the hook's shareDocument function to update the document status
        const isShared = shareData.isPublic || shareData.emails.length > 0;
        await shareDocument(selectedDocument.id, isShared);

        // Show custom success message with details
        let message = `Document "${selectedDocument.title}" shared successfully!`;

        if (shareData.isPublic) {
          message += `\nPublic link: ${shareData.publicLink}`;
        }

        if (shareData.emails.length > 0) {
          message += `\nShared with: ${shareData.emails.join(', ')}`;
        }

        toast.success('Document Shared Successfully', {
          description: shareData.isPublic
            ? `Public link created and ${shareData.emails.length > 0 ? `shared with ${shareData.emails.length} people` : 'ready to share'}`
            : `Shared with ${shareData.emails.join(', ')}`
        });
        
        setSelectedDocument(null);
      } catch (error) {
        toast.error('Share Failed', {
          description: 'Failed to share the document. Please try again.'
        });
      }
    }
  };

  const categories = Array.from(new Set(documents.map(doc => doc.category.name)));
  const classes = Array.from(new Set(documents.map(doc => doc.classLevel).filter(Boolean)));
  const subjects = Array.from(new Set(documents.map(doc => doc.subject).filter(Boolean)));

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Documents</h1>
            <p className="text-muted-foreground">
              Manage and organize your uploaded documents
            </p>
          </div>
          <Button asChild>
            <a href="/teacher/upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload New
            </a>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{documents.length}</div>
              <p className="text-xs text-muted-foreground">Total Documents</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {documents.filter(doc => doc.isShared).length}
              </div>
              <p className="text-xs text-muted-foreground">Shared Documents</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {documents.reduce((sum, doc) => sum + doc.downloadCount, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Total Downloads</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{categories.length}</div>
              <p className="text-xs text-muted-foreground">Categories Used</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2 flex-wrap">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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

                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map(cls => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* View Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Display */}
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No documents found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedCategory !== 'all' || selectedClass !== 'all' || selectedSubject !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'Upload your first document to get started'
                }
              </p>
              <Button asChild>
                <a href="/teacher/upload">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </a>
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments.map((document) => (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    {getFileIcon(document.fileType)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDownload(document)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePreview(document)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        {document.isShared ? (
                          <DropdownMenuItem onClick={() => handleUnshare(document)}>
                            <Share className="h-4 w-4 mr-2" />
                            Unshare
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleShare(document)}>
                            <Share className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(document)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium line-clamp-2">{document.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {document.description || document.fileName}
                    </p>
                    
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">
                        {document.category.name}
                      </Badge>
                      {document.classLevel && document.subject && (
                        <Badge variant="secondary" className="text-xs">
                          {document.classLevel} - {document.subject}
                        </Badge>
                      )}
                      {document.isShared && (
                        <Badge className="text-xs bg-blue-100 text-blue-700">
                          <Share className="h-3 w-3 mr-1" />
                          Shared
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatFileSize(document.fileSize)}</span>
                      <span>{formatDate(document.createdAt)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{document.downloadCount} downloads</span>
                      <span>{document.fileType}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="p-4 font-medium">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('title')}
                          className="h-auto p-0 font-medium"
                        >
                          Document
                          {sortField === 'title' && (
                            sortDirection === 'asc' ? <SortAsc className="h-4 w-4 ml-1" /> : <SortDesc className="h-4 w-4 ml-1" />
                          )}
                        </Button>
                      </th>
                      <th className="p-4 font-medium">Category</th>
                      <th className="p-4 font-medium">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('fileSize')}
                          className="h-auto p-0 font-medium"
                        >
                          Size
                          {sortField === 'fileSize' && (
                            sortDirection === 'asc' ? <SortAsc className="h-4 w-4 ml-1" /> : <SortDesc className="h-4 w-4 ml-1" />
                          )}
                        </Button>
                      </th>
                      <th className="p-4 font-medium">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('uploadDate')}
                          className="h-auto p-0 font-medium"
                        >
                          Upload Date
                          {sortField === 'uploadDate' && (
                            sortDirection === 'asc' ? <SortAsc className="h-4 w-4 ml-1" /> : <SortDesc className="h-4 w-4 ml-1" />
                          )}
                        </Button>
                      </th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.map((document) => (
                      <tr key={document.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {getFileIcon(document.fileType)}
                            <div>
                              <p className="font-medium">{document.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {document.fileName}
                              </p>
                              {document.classLevel && document.subject && (
                                <p className="text-xs text-muted-foreground">
                                  {document.classLevel} - {document.subject}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{document.category.name}</Badge>
                        </td>
                        <td className="p-4 text-sm">{formatFileSize(document.fileSize)}</td>
                        <td className="p-4 text-sm">{formatDate(document.createdAt)}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {document.isShared && (
                              <Badge className="text-xs bg-blue-100 text-blue-700">
                                <Share className="h-3 w-3 mr-1" />
                                Shared
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {document.downloadCount} downloads
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleDownload(document)}>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePreview(document)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleShare(document)}>
                                <Share className="h-4 w-4 mr-2" />
                                {document.isShared ? 'Unshare' : 'Share'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDelete(document)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

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
              <Button variant="destructive" onClick={confirmDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Enhanced Share Dialog */}
        <ShareDialog
          document={selectedDocument}
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          onShare={handleShareSubmit}
        />
      </div>
    </Layout>
  );
}
