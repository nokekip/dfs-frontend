import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ShareDialog from '../components/ShareDialog';
import FilePreviewModal from '../components/FilePreviewModal';
import { apiClient } from '../services/api';
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
import { useDocumentShares } from '../hooks/useDocumentShares';
import { useAuth } from '../contexts/AuthContext';
import { useCategories } from '../hooks/useCategories';
import { formatFileSize, getFileIconWithColor } from '../lib/fileUtils';

export default function TeacherShared() {
  const { user } = useAuth();
  const { shares, sharedWithMe, mySharedFiles, isLoading, refresh } = useDocumentShares();
  const { categories } = useCategories();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Filter functions for search and category
  const filteredSharedWithMe = sharedWithMe.filter(share => {
    const matchesSearch = share.document_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         share.shared_by_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         share.document_description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || share.document_category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredMyShared = mySharedFiles.filter(share => {
    const matchesSearch = share.document_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         share.shared_with_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         share.document_description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || share.document_category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDownload = async (document: any) => {
    try {
      await apiClient.downloadDocument(document.id);
      toast.success('Download Started', {
        description: `${document.fileName || document.title} is being downloaded`
      });
    } catch (error) {
      toast.error('Download Failed', {
        description: 'Failed to download file. Please try again.'
      });
    }
  };

  const handlePreview = (document: any) => {
    setPreviewFile(document);
    setIsPreviewOpen(true);
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

  const handleCopyShareLink = async (document: any, share: any) => {
    // Check if this document has a public share link
    if (share.share_type === 'public' && share.public_url) {
      const fullUrl = `${window.location.origin}${share.public_url}`;
      try {
        await navigator.clipboard.writeText(fullUrl);
        toast.success('Link Copied', {
          description: 'Public share link copied to clipboard'
        });
      } catch (error) {
        toast.error('Failed to copy link', {
          description: 'Please try again'
        });
      }
    } else {
      toast.error('No public link available', {
        description: 'This document is not publicly shared'
      });
    }
  };

  const handleShareSubmit = async (shareData: any) => {
    if (selectedDocument) {
      try {
        // Use the document share API
        await apiClient.shareDocument(selectedDocument.id, shareData);
        
        let message = `Document "${selectedDocument.title}" shared successfully!`;
        
        if (shareData.isPublic) {
          message += `\nPublic link: ${shareData.publicLink}`;
        }

        if (shareData.emails && shareData.emails.length > 0) {
          message += `\nShared with: ${shareData.emails.join(', ')}`;
        }

        toast.success('Document Shared Successfully', {
          description: shareData.isPublic
            ? `Public link created and ${shareData.emails?.length > 0 ? `shared with ${shareData.emails.length} people` : 'ready to share'}`
            : `Shared with ${shareData.emails?.join(', ') || 'selected users'}`
        });
        
        // Refresh the shares list
        refresh();
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
        await apiClient.unshareDocument(selectedDocument.id);
        setRevokeDialogOpen(false);
        setSelectedDocument(null);
        // Refresh the shares list
        refresh();
        toast.success('Sharing stopped successfully');
      } catch (error) {
        toast.error('Failed to stop sharing');
      }
    }
  };

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
              <div className="text-2xl font-bold">{filteredSharedWithMe.length}</div>
              <p className="text-xs text-muted-foreground">Files Shared With Me</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{filteredMyShared.length}</div>
              <p className="text-xs text-muted-foreground">Files I've Shared</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {mySharedFiles.length}
              </div>
              <p className="text-xs text-muted-foreground">Total Collaborators</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {mySharedFiles.reduce((sum, share) => sum + (share.documentDetails?.downloadCount || 0), 0)}
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
                {filteredSharedWithMe.map((share) => {
                  const document = share.documentDetails;
                  if (!document) return null;
                  
                  return (
                    <Card key={share.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* File Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {getFileIconWithColor(share.document_file_type || 'unknown')}
                              <Badge variant="outline" className="text-xs">
                                {share.document_file_type || 'unknown'}
                              </Badge>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {share.can_download && (
                                  <DropdownMenuItem onClick={() => handleDownload(share)}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                  </DropdownMenuItem>
                                )}
                                {share.can_view && (
                                  <DropdownMenuItem onClick={() => handlePreview(share)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Preview
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* File Details */}
                          <div>
                            <h3 className="font-medium line-clamp-2 mb-1">{share.document_title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {share.document_description || share.document_file_name}
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
                              <p className="font-medium">{share.shared_by_name || `${document.teacher.user.firstName} ${document.teacher.user.lastName}`}</p>
                              <p className="text-muted-foreground text-xs">
                                Shared {formatDate(share.shared_at)}
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
                  );
                })}
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
                {filteredMyShared.map((share) => {
                  const document = share.documentDetails;
                  if (!document) return null;
                  
                  return (
                    <Card key={share.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* File Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {getFileIconWithColor(share.document_file_type || 'unknown')}
                              <Badge variant="outline" className="text-xs">
                                {share.document_file_type || 'unknown'}
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
                                {share.share_type === 'public' && share.public_url ? (
                                  <DropdownMenuItem onClick={() => handleCopyShareLink(document, share)}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy Public Link
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => handleShareMore(document)}>
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Create Public Link
                                  </DropdownMenuItem>
                                )}
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
                            <h3 className="font-medium line-clamp-2 mb-1">{share.document_title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {share.document_description || share.document_file_name}
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
                                {share.share_type === 'public' 
                                  ? 'Shared publicly' 
                                  : `Shared with ${share.shared_with_name || 'Private'}`
                                }
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Shared {formatDate(share.shared_at)}
                              </span>
                            </div>
                            {share.share_type === 'public' && (
                              <div className="flex items-center gap-2 text-sm">
                                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground text-xs">
                                  Public link available
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-2 gap-4 text-center p-2 bg-muted/50 rounded-lg">
                            <div>
                              <div className="text-lg font-semibold">1</div>
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
                  );
                })}
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

        {/* File Preview Modal */}
        <FilePreviewModal
          file={previewFile}
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false);
            setPreviewFile(null);
          }}
        />
      </div>
    </Layout>
  );
}
