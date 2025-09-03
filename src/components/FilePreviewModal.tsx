import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { X, Download, ZoomIn, ZoomOut, RotateCw, Maximize } from 'lucide-react';
import { toast } from 'sonner';
import { config } from '../lib/config';
import { apiClient } from '../services/api';

interface FilePreviewModalProps {
  file: {
    id: string;
    title: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    filePath: string;
    description?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function FilePreviewModal({ file, isOpen, onClose }: FilePreviewModalProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [previewError, setPreviewError] = useState<string>('');

  useEffect(() => {
    if (file && isOpen) {
      loadPreview();
      // Reset zoom and rotation for new file
      setZoom(100);
      setRotation(0);
    }
    
    // Cleanup blob URL when modal closes or file changes
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [file, isOpen]);

  const loadPreview = async () => {
    if (!file) return;
    
    setIsLoading(true);
    setPreviewError('');
    
    try {
      const url = await apiClient.previewDocument(file.id);
      setPreviewUrl(url);
    } catch (error) {
      console.error('Failed to load preview:', error);
      setPreviewError('Failed to load preview');
      toast.error('Failed to load preview');
    } finally {
      setIsLoading(false);
    }
  };

  if (!file) return null;

  const isImage = (fileType: string) => {
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    return imageTypes.includes(fileType.toLowerCase());
  };

  const isPDF = (fileType: string) => {
    return fileType.toLowerCase() === 'pdf';
  };

  const isPreviewable = (fileType: string) => {
    return isImage(fileType) || isPDF(fileType);
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

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setPreviewError('Failed to load image');
    toast.error('Failed to load image preview');
  };

  const handleDownload = async () => {
    if (!file) return;
    
    try {
      await apiClient.downloadDocument(file.id);
      toast.success('Download Started', {
        description: `${file.fileName} is being downloaded`
      });
    } catch (error) {
      toast.error('Download Failed', {
        description: 'Failed to download file. Please try again.'
      });
    }
  };

  const handleCloseModal = () => {
    // Clean up blob URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
    setZoom(100);
    setRotation(0);
    setPreviewError('');
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="max-w-6xl h-[95vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold">{file.title}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {file.fileName} • {file.fileType.toUpperCase()} • {formatFileSize(file.fileSize)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isImage(file.fileType) && previewUrl && (
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
              <Button variant="ghost" size="sm" onClick={handleCloseModal}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col overflow-hidden">
          {file.description && (
            <div className="flex-shrink-0 p-4 bg-muted/50 rounded-lg mb-4">
              <p className="text-sm text-muted-foreground">{file.description}</p>
            </div>
          )}

          <div className="flex-1 flex items-center justify-center overflow-auto bg-muted/20 rounded-lg">
            {isLoading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading preview...</p>
              </div>
            ) : previewError ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground mb-4">
                  <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Preview failed</h3>
                <p className="text-sm text-muted-foreground mb-4">{previewError}</p>
                <Button onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download to view
                </Button>
              </div>
            ) : !isPreviewable(file.fileType) ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground mb-4">
                  <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Preview not available</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This file type ({file.fileType.toUpperCase()}) cannot be previewed in the browser.
                </p>
                <Button onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download to view
                </Button>
              </div>
            ) : isPDF(file.fileType) ? (
              <div className="w-full h-full">
                <iframe
                  src={previewUrl}
                  className="w-full h-full border-0 rounded"
                  title={file.title}
                />
              </div>
            ) : isImage(file.fileType) ? (
              <div className="relative w-full h-full flex items-center justify-center overflow-auto">
                <img
                  src={previewUrl}
                  alt={file.title}
                  className="max-w-full max-h-full object-contain transition-transform duration-200"
                  style={{
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    transformOrigin: 'center center'
                  }}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
