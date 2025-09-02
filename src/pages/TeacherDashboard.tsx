import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDocuments } from '../hooks/useDocuments';
import { useCategories } from '../hooks/useCategories';
import { useSystemSettings } from '../hooks/useSystemSettings';
import { useDashboard } from '../hooks/useDashboard';
import Layout from '../components/Layout';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorBoundary';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';
import { 
  FolderOpen, 
  HardDrive, 
  Share, 
  Upload, 
  FileText, 
  Download, 
  Eye, 
  Trash2,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus
} from 'lucide-react';
import type { DocumentCategory } from '../services/types';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { 
    documents, 
    isLoading: documentsLoading, 
    error: documentsError, 
    uploadDocument, 
    deleteDocument,
    shareDocument,
    fetchDocuments 
  } = useDocuments();
  const { 
    categories, 
    isLoading: categoriesLoading, 
    error: categoriesError, 
    fetchCategories 
  } = useCategories();
  const { 
    settings,
    isLoading: settingsLoading,
    error: settingsError,
    fetchSettings
  } = useSystemSettings();
  const { 
    stats, 
    isLoading: statsLoading, 
    error: statsError, 
    fetchDashboardStats 
  } = useDashboard('teacher');

  const [uploadForm, setUploadForm] = useState({
    title: '',
    file: null as File | null,
    category: '',
    class: '',
    subject: ''
  });
  const [isUploading, setIsUploading] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchCategories();
    fetchDocuments();
    fetchDashboardStats();
    fetchSettings();
  }, [fetchCategories, fetchDocuments, fetchDashboardStats, fetchSettings]);

  const selectedCategory = categories.find(cat => cat.id.toString() === uploadForm.category);
  const recentFiles = documents.slice(0, 5); // Show 5 most recent documents

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.file || !uploadForm.title || !uploadForm.category) return;

    setIsUploading(true);
    try {
      await uploadDocument({
        title: uploadForm.title,
        file: uploadForm.file,
        categoryId: uploadForm.category,
        classLevel: uploadForm.class || undefined,
        subject: uploadForm.subject || undefined,
      });
      
      // Reset form
      setUploadForm({
        title: '',
        file: null,
        category: '',
        class: '',
        subject: ''
      });
      
      toast.success('Document Uploaded', {
        description: 'Your document has been uploaded successfully'
      });
      
      // Refresh data
      fetchDocuments();
      fetchDashboardStats();
    } catch (error) {
      toast.error('Upload Failed', {
        description: 'Failed to upload document. Please try again.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setUploadForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Get file extension
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      // Check file type if settings are available
      if (settings && settings.allowed_file_types) {
        if (!fileExtension || !settings.allowed_file_types.includes(fileExtension)) {
          toast.error('Invalid file type', {
            description: `Please select a file with one of these extensions: ${settings.allowed_file_types.join(', ')}`
          });
          e.target.value = '';
          return;
        }
      }
      
      // Check file size if settings are available
      if (settings && settings.max_file_size) {
        if (file.size > settings.max_file_size) {
          toast.error('File too large', {
            description: `File size must be less than ${(settings.max_file_size / (1024 * 1024)).toFixed(0)}MB`
          });
          e.target.value = '';
          return;
        }
      } else if (file.size > 10 * 1024 * 1024) { // Default 10MB limit
        toast.error('File too large', {
          description: 'File size must be less than 10MB'
        });
        e.target.value = '';
        return;
      }

      setUploadForm(prev => ({
        ...prev,
        file,
        title: prev.title || file.name.split('.').slice(0, -1).join('.')
      }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFileIcon = (fileType: string) => {
    return <FileText className="h-4 w-4" />;
  };

  const handleView = (file: any) => {
    // In real app, this would open document in preview modal or new tab
    toast.info('Opening Preview', {
      description: `Opening ${file.fileName} in preview`
    });
    window.open(`/preview/${file.id}`, '_blank');
  };

  const handleDownload = (file: any) => {
    // In real app, this would trigger actual download
    toast.success('Download Started', {
      description: `Downloading ${file.fileName}`
    });
    // Simulate download
    const link = document.createElement('a');
    link.href = '#';
    link.download = file.fileName;
    link.click();
    toast.success('Download Started', {
      description: `${file.fileName} is being downloaded`
    });
  };

  const handleShare = async (file: any) => {
    try {
      await shareDocument(file.id, true);
      toast.success('Document Shared', {
        description: `"${file.title}" has been shared successfully`
      });
      fetchDocuments(); // Refresh list
    } catch (error) {
      toast.error('Share Failed', {
        description: 'Failed to share document. Please try again.'
      });
    }
  };

  // Loading state
  if (documentsLoading || categoriesLoading || statsLoading || settingsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loading text="Loading dashboard..." />
        </div>
      </Layout>
    );
  }

  // Error state
  if (documentsError || categoriesError || statsError || settingsError) {
    return (
      <Layout>
        <ErrorMessage message={documentsError || categoriesError || statsError || 'Unknown error'} />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-muted-foreground">
            Manage your teaching documents and resources efficiently
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Files</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats as any)?.documentsUploaded || 0}</div>
              <p className="text-xs text-muted-foreground">
                Your uploaded documents
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">245 MB</div>
              <div className="mt-2 space-y-1">
                <Progress value={24} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  245 MB of 1024 MB used
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shared Files</CardTitle>
              <Share className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats as any)?.documentsShared || 0}</div>
              <p className="text-xs text-muted-foreground">
                Files shared with colleagues
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upload Document Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Document
              </CardTitle>
              <CardDescription>
                Add new documents to your digital filing system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Document Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter document title"
                    value={uploadForm.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">Select File</Label>
                  <Input
                    id="file"
                    type="file"
                    accept={settings?.allowed_file_types?.map(type => `.${type}`).join(',') || '.pdf,.docx,.xlsx,.pptx,.jpg,.png'}
                    onChange={handleFileChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    {settings ? (
                      <>
                        Supported formats: {settings.allowed_file_types?.join(', ').toUpperCase() || 'PDF, DOCX, XLSX, PPTX, JPG, PNG'} 
                        (Max {settings.max_file_size ? `${(settings.max_file_size / (1024 * 1024)).toFixed(0)}MB` : '10MB'})
                      </>
                    ) : (
                      'Supported formats: PDF, DOCX, XLSX, PPTX, JPG, PNG (Max 10MB)'
                    )}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={uploadForm.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCategory && (
                    <p className="text-xs text-muted-foreground">
                      {selectedCategory.requiresClassSubject 
                        ? 'This category requires class and subject information'
                        : 'No additional requirements for this category'
                      }
                    </p>
                  )}
                </div>

                {selectedCategory?.requiresClassSubject && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="class">Class *</Label>
                      <Select value={uploadForm.class} onValueChange={(value) => handleInputChange('class', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="grade-1">Grade 1</SelectItem>
                          <SelectItem value="grade-2">Grade 2</SelectItem>
                          <SelectItem value="grade-3">Grade 3</SelectItem>
                          <SelectItem value="grade-4">Grade 4</SelectItem>
                          <SelectItem value="grade-5">Grade 5</SelectItem>
                          <SelectItem value="grade-6">Grade 6</SelectItem>
                          <SelectItem value="grade-7">Grade 7</SelectItem>
                          <SelectItem value="grade-8">Grade 8</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Select value={uploadForm.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mathematics">Mathematics</SelectItem>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="science">Science</SelectItem>
                          <SelectItem value="social-studies">Social Studies</SelectItem>
                          <SelectItem value="kiswahili">Kiswahili</SelectItem>
                          <SelectItem value="religious-education">Religious Education</SelectItem>
                          <SelectItem value="physical-education">Physical Education</SelectItem>
                          <SelectItem value="creative-arts">Creative Arts</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {uploadForm.file && (
                  <Alert className="bg-info/10 border-info/20">
                    <FileText className="h-4 w-4 text-info" />
                    <AlertDescription className="text-info-foreground">
                      Selected file: {uploadForm.file.name} ({(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB)
                    </AlertDescription>
                  </Alert>
                )}

                <Button type="submit" disabled={isUploading} className="w-full">
                  {isUploading ? (
                    <>
                      <Loading size="sm" className="mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Upload Document
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Recent Files */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Files
              </CardTitle>
              <CardDescription>
                Your 5 most recently uploaded documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentFiles.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No documents uploaded yet</p>
                    <p className="text-sm text-muted-foreground">Upload your first document to get started</p>
                  </div>
                ) : (
                  recentFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          {getFileIcon(file.fileType || 'PDF')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {file.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{file.category?.name || 'Uncategorized'}</span>
                            {file.classLevel && file.subject && (
                              <>
                                <span>•</span>
                                <span>{file.classLevel} - {file.subject}</span>
                              </>
                            )}
                            <span>•</span>
                            <span>{formatDate(file.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {file.fileType || 'PDF'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {((file.fileSize || 0) / 1024 / 1024).toFixed(2)} MB
                            </span>
                            {file.isShared && (
                              <Badge variant="secondary" className="text-xs">
                                <Share className="h-3 w-3 mr-1" />
                                Shared
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleView(file)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDownload(file)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleShare(file)}>
                          <Share className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
