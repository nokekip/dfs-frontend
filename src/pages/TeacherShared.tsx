import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ShareDialog from '../components/ShareDialog';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
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
  Download, 
  Eye, 
  Share, 
  MoreHorizontal,
  FileText,
  Image,
  File,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  Copy,
  Mail,
  UserPlus,
  Trash2
} from 'lucide-react';
import { useDocuments } from '../hooks/useDocuments';
import { useAuth } from '../contexts/AuthContext';
import { useCategories } from '../hooks/useCategories';

export default function TeacherShared() {
  const { user } = useAuth();
  const { documents, isLoading, shareDocument, revokeShare } = useDocuments();
  const { categories } = useCategories();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);

  // Filter documents shared with me and shared by me
  const sharedWithMe = documents.filter(doc => 
    doc.sharedWith?.includes(user?.id || '') && doc.teacher?.user?.id !== user?.id
  );
  
  const mySharedFiles = documents.filter(doc => 
    doc.teacher?.user?.id === user?.id && doc.sharedWith && doc.sharedWith.length > 0
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image') || fileType === 'JPG' || fileType === 'PNG') {
      return <Image className="h-5 w-5 text-blue-500" />;
    }
    if (fileType === 'PDF') {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDownload = (document: any) => {
    toast.success('Download Started', {
      description: `Downloading ${document.file_name || document.title}`
    });
    // In real app, this would trigger actual download
  };

  const handlePreview = (document: any) => {
    toast.info('Opening Preview', {
      description: `Opening ${document.file_name || document.title} in preview`
    });
    // In real app, this would open document in preview modal or new tab
    window.open(`/preview/${document.id}`, '_blank');
  };

  const handleRequestAccess = (document: any) => {
    // In real app, this would send a request to the document owner
    toast.success('Access Request Sent', {
      description: `Access request sent for ${document.title}`
    });
  };

  const handleShareMore = (document: any) => {
    setSelectedDocument(document);
    setShareDialogOpen(true);
  };

  const handleShareSubmit = async (shareData: any) => {
    if (selectedDocument) {
      try {
        await shareDocument(selectedDocument.id, shareData);
        
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
        toast.error('Failed to share document');
      }
    }
  };

  const handleRevokeAccess = (document: any) => {
    setSelectedDocument(document);
    setRevokeDialogOpen(true);
  };

  const confirmRevoke = async () => {
    if (selectedDocument) {
      try {
        await revokeShare(selectedDocument.id);
        setRevokeDialogOpen(false);
        setSelectedDocument(null);
        toast.success('Sharing stopped successfully');
      } catch (error) {
        toast.error('Failed to stop sharing');
      }
    }
  };

  const filteredSharedWithMe = sharedWithMe.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category.id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredMyShared = mySharedFiles.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category.id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Unknown Category';
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Shared Files</h1>
          <p className="text-muted-foreground">
            Collaborate with colleagues by sharing and accessing documents
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{sharedWithMe.length}</div>
              <p className="text-xs text-muted-foreground">Files Shared With Me</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{mySharedFiles.length}</div>
              <p className="text-xs text-muted-foreground">Files I've Shared</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {mySharedFiles.reduce((sum, doc) => sum + (doc.sharedWith?.length || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">Total Collaborators</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {mySharedFiles.reduce((sum, doc) => sum + (doc.downloadCount || 0), 0)}
              </div>
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
                  placeholder="Search shared files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Shared Content */}
        <Tabs defaultValue="shared-with-me" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="shared-with-me">
              Shared With Me ({filteredSharedWithMe.length})
            </TabsTrigger>
            <TabsTrigger value="my-shared">
              My Shared Files ({filteredMyShared.length})
            </TabsTrigger>
          </TabsList>

          {/* Files Shared With Me */}
          <TabsContent value="shared-with-me" className="space-y-4">
            {filteredSharedWithMe.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No shared files found</h3>
                  <p className="text-muted-foreground">
                    Files shared by your colleagues will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredSharedWithMe.map((document) => (
                  <Card key={document.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* File Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getFileIcon(document.fileType)}
                            <Badge variant="outline" className="text-xs">
                              {document.fileType}
                            </Badge>
                          </div>
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
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* File Details */}
                        <div>
                          <h3 className="font-medium line-clamp-2 mb-1">{document.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {document.description || document.fileName}
                          </p>
                        </div>

                        {/* Shared By */}
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {document.teacher.user.firstName[0]}{document.teacher.user.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-sm">
                            <p className="font-medium">{document.teacher.user.firstName} {document.teacher.user.lastName}</p>
                            <p className="text-muted-foreground text-xs">
                              Shared {formatDate(document.sharedAt || document.createdAt)}
                            </p>
                          </div>
                        </div>

                        {/* Category and Class/Subject */}
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-xs">
                            {document.category.name}
                          </Badge>
                          {document.classLevel && document.subject && (
                            <Badge variant="outline" className="text-xs">
                              {document.classLevel} - {document.subject}
                            </Badge>
                          )}
                        </div>

                        {/* File Info */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatFileSize(document.fileSize)}</span>
                          <span>{document.downloadCount} downloads</span>
                        </div>

                        {/* Access Status */}
                        <div className="flex items-center gap-2 text-xs text-success">
                          <CheckCircle className="h-3 w-3" />
                          <span>Access granted</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Shared Files */}
          <TabsContent value="my-shared" className="space-y-4">
            {filteredMyShared.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Share className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No shared files yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Share your documents with colleagues to collaborate and help each other
                  </p>
                  <Button asChild>
                    <a href="/teacher/documents">
                      <Share className="h-4 w-4 mr-2" />
                      Share a Document
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredMyShared.map((document) => (
                  <Card key={document.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* File Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getFileIcon(document.fileType)}
                            <Badge variant="outline" className="text-xs">
                              {document.fileType}
                            </Badge>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleShareMore(document)}>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Share with More
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Share Link
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownload(document)}>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePreview(document)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleRevokeAccess(document)}
                                className="text-destructive"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Stop Sharing
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* File Details */}
                        <div>
                          <h3 className="font-medium line-clamp-2 mb-1">{document.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {document.description || document.fileName}
                          </p>
                        </div>

                        {/* Category and Class/Subject */}
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-xs">
                            {document.category.name}
                          </Badge>
                          {document.classLevel && document.subject && (
                            <Badge variant="outline" className="text-xs">
                              {document.classLevel} - {document.subject}
                            </Badge>
                          )}
                        </div>

                        {/* Shared With */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Shared with {document.sharedWith.length} teacher{document.sharedWith.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Shared {formatDate(document.sharedAt || document.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 text-center p-2 bg-muted/50 rounded-lg">
                          <div>
                            <div className="text-lg font-semibold">{document.sharedWith.length}</div>
                            <div className="text-xs text-muted-foreground">Shared</div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold">{document.downloadCount}</div>
                            <div className="text-xs text-muted-foreground">Downloads</div>
                          </div>
                        </div>

                        {/* File Info */}
                        <div className="text-xs text-muted-foreground text-center">
                          {formatFileSize(document.fileSize)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Enhanced Share Dialog */}
        <ShareDialog
          document={selectedDocument}
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          onShare={handleShareSubmit}
        />

        {/* Revoke Access Dialog */}
        <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Stop Sharing Document</DialogTitle>
              <DialogDescription>
                Are you sure you want to stop sharing "{selectedDocument?.title}"? 
                All teachers who currently have access will lose access to this document.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRevokeDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmRevoke}>
                <XCircle className="h-4 w-4 mr-2" />
                Stop Sharing
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
