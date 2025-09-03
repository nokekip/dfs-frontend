import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Document } from '../services/types';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { 
  Download, 
  Eye, 
  FileText, 
  Calendar,
  User,
  Share,
  AlertCircle,
  CheckCircle,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize
} from 'lucide-react';

export default function PublicShare() {
  const { documentId, token } = useParams<{ documentId: string; token: string }>();
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [previewFile, setPreviewFile] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [previewError, setPreviewError] = useState<string>('');
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (documentId && token) {
      loadDocument();
    } else {
      setError('Invalid share link');
      setIsLoading(false);
    }
  }, [documentId, token]);

  const loadDocument = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Call the public_view endpoint
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/documents/documents/${documentId}/public_view/?token=${token}`);
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('This share link is invalid or has expired');
        } else if (response.status === 404) {
          throw new Error('Document not found');
        } else {
          throw new Error('Failed to load document');
        }
      }

      const responseData = await response.json();
      
      // Transform the response to match our Document type
      const transformedDocument: Document = {
        id: responseData.id,
        title: responseData.title,
        description: responseData.description,
        fileName: responseData.file_name,
        fileSize: responseData.file_size,
        fileType: responseData.file_type,
        filePath: responseData.file,
        teacher: {
          id: responseData.teacher.id,
          user: responseData.teacher.user,
          employeeId: responseData.teacher.employee_id,
          firstName: responseData.teacher.first_name,
          lastName: responseData.teacher.last_name,
          email: responseData.teacher.email,
          phone: responseData.teacher.phone,
          department: responseData.teacher.department,
          isApproved: responseData.teacher.is_approved,
          joinedAt: responseData.teacher.joined_at,
          documentsCount: responseData.teacher.documents_count,
          sharedDocumentsCount: responseData.teacher.shared_documents_count,
          totalDownloads: responseData.teacher.total_downloads || 0,
          status: responseData.teacher.status,
          profilePicture: responseData.teacher.profile_picture,
          bio: responseData.teacher.bio,
          specialization: responseData.teacher.specialization,
          experience: responseData.teacher.experience,
          qualifications: responseData.teacher.qualifications,
          createdAt: responseData.teacher.created_at,
          updatedAt: responseData.teacher.updated_at,
        },
        category: responseData.category ? {
          id: responseData.category.id,
          name: responseData.category.name,
          description: responseData.category.description,
          requiresClassSubject: responseData.category.requires_class_subject,
          isActive: responseData.category.is_active,
          documentsCount: responseData.category.documents_count,
          createdAt: responseData.category.created_at,
          updatedAt: responseData.category.updated_at,
        } : null,
        classLevel: responseData.class_level,
        subject: responseData.subject,
        downloadCount: responseData.download_count,
        status: responseData.status,
        isShared: responseData.is_shared,
        sharedAt: responseData.shared_at,
        createdAt: responseData.created_at,
        updatedAt: responseData.updated_at,
      };

      setDocument(transformedDocument);
    } catch (error: any) {
      setError(error.message || 'Failed to load document');
      toast.error('Load Failed', {
        description: error.message || 'Failed to load shared document'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!document || !documentId || !token) return;

    setPreviewFile(document);
    setIsPreviewOpen(true);
    setZoom(100);
    setRotation(0);

    try {
      // For public shares, we can try to load the preview directly via the download endpoint
      // This works for images and PDFs that can be displayed in browser
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/documents/documents/${documentId}/download/?token=${token}`);
      
      if (!response.ok) {
        throw new Error('Preview failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (error) {
      setPreviewError('Failed to load preview');
      toast.error('Preview Failed', {
        description: 'Could not load file preview'
      });
    }
  };

  const handleDownload = async () => {
    if (!document || !documentId || !token) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/documents/documents/${documentId}/download/?token=${token}`);
      
      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Get the file blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.fileName;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      toast.success('Download Started', {
        description: `${document.fileName} is being downloaded`
      });
    } catch (error) {
      toast.error('Download Failed', {
        description: 'Failed to download file. Please try again.'
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isPreviewable = (fileType: string) => {
    const previewableTypes = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    return previewableTypes.includes(fileType.toLowerCase());
  };

  const isImage = (fileType: string) => {
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    return imageTypes.includes(fileType.toLowerCase());
  };

  const isPDF = (fileType: string) => {
    return fileType.toLowerCase() === 'pdf';
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleFitToScreen = () => {
    setZoom(100);
    setRotation(0);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
    setPreviewError('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading shared document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-primary-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
            <CardTitle className="text-destructive">Access Denied</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              This could happen if:
            </p>
            <ul className="text-sm text-muted-foreground text-left space-y-1">
              <li>• The share link has expired</li>
              <li>• The document is no longer shared</li>
              <li>• The link is malformed or invalid</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-primary-100 flex items-center justify-center">
        <p className="text-muted-foreground">Document not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-primary-100">
      {/* Header */}
      <div className="text-center pt-8 pb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-xl mb-4">
          <Share className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Shared Document</h1>
        <p className="text-muted-foreground">This document has been shared with you</p>
      </div>

      {/* Content */}
      <div className="flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-4xl">
          <Card className="shadow-xl border-0">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2 text-foreground">{document.title}</CardTitle>
                  {document.description && (
                    <CardDescription className="text-base mb-4">
                      {document.description}
                    </CardDescription>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>{document.fileName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Size:</span>
                      <span>{formatFileSize(document.fileSize)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Type:</span>
                      <Badge variant="secondary">{document.fileType.toUpperCase()}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          
          <CardContent className="space-y-4">
            {/* File Actions */}
            <div className="flex gap-3">
              {isPreviewable(document.fileType) ? (
                <Button onClick={handlePreview} className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Document
                </Button>
              ) : (
                <Alert className="flex-1">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This file type cannot be previewed in the browser. Download to view.
                  </AlertDescription>
                </Alert>
              )}
              
              <Button onClick={handleDownload} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>

            {/* Document Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <h4 className="font-medium text-foreground mb-2">Shared by</h4>
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{document.teacher.firstName} {document.teacher.lastName}</p>
                    <p className="text-sm text-muted-foreground">{document.teacher.department}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-foreground mb-2">Share Details</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Shared on {formatDate(document.sharedAt || document.createdAt)}</span>
                  </div>
                  {document.category && (
                    <div className="flex items-center gap-2">
                      <span>Category:</span>
                      <Badge variant="outline">{document.category.name}</Badge>
                    </div>
                  )}
                  {document.classLevel && (
                    <div className="flex items-center gap-2">
                      <span>Class:</span>
                      <Badge variant="outline">{document.classLevel}</Badge>
                    </div>
                  )}
                  {document.subject && (
                    <div className="flex items-center gap-2">
                      <span>Subject:</span>
                      <Badge variant="outline">{document.subject}</Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Download Stats */}
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4" />
                <span>Downloaded {document.downloadCount} times</span>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-6">
        <div className="text-xs text-muted-foreground">
          Secured Document Sharing • Ministry of Education, Kenya
        </div>
      </div>

      {/* Public Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={handleClosePreview}>
        <DialogContent className="max-w-6xl h-[95vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-semibold">{document?.title}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {document?.fileName} • {document?.fileType.toUpperCase()} • {document && formatFileSize(document.fileSize)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {document && isImage(document.fileType) && previewUrl && (
                  <>
                    <Button variant="outline" size="sm" onClick={handleZoomOut}>
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium min-w-[60px] text-center">
                      {zoom}%
                    </span>
                    <Button variant="outline" size="sm" onClick={handleZoomIn}>
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleFitToScreen} title="Fit to screen">
                      <Maximize className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleRotate}>
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="ghost" size="sm" onClick={handleClosePreview}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 flex items-center justify-center overflow-auto bg-muted/20 rounded-lg">
              {previewError ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-16 h-16 mx-auto mb-2 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Preview Failed</h3>
                  <p className="text-sm text-muted-foreground mb-4">{previewError}</p>
                  <Button onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download to view
                  </Button>
                </div>
              ) : !previewUrl ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading preview...</p>
                </div>
              ) : document && isPDF(document.fileType) ? (
                <div className="w-full h-full">
                  <iframe
                    src={previewUrl}
                    className="w-full h-full border-0 rounded"
                    title={document.title}
                  />
                </div>
              ) : document && isImage(document.fileType) ? (
                <div className="relative w-full h-full flex items-center justify-center overflow-auto">
                  <img
                    src={previewUrl}
                    alt={document.title}
                    className="max-w-full max-h-full object-contain transition-transform duration-200"
                    style={{
                      transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                      transformOrigin: 'center center'
                    }}
                  />
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-muted-foreground mb-4">
                    <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Preview not available</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    This file type cannot be previewed in the browser.
                  </p>
                  <Button onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download to view
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
