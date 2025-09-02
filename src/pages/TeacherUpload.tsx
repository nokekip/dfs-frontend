import { useState, useRef, useCallback, useEffect } from 'react';
import Layout from '../components/Layout';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Textarea } from '../components/ui/textarea';
import { 
  Upload, 
  X, 
  FileText, 
  Image, 
  File, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Trash2,
  Eye,
  Download,
  Clock,
  Paperclip,
  Info
} from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { useDocuments } from '../hooks/useDocuments';
import { useSystemSettings } from '../hooks/useSystemSettings';

interface UploadFile {
  id: string;
  file: File;
  title: string;
  description: string;
  category: string;
  class: string;
  subject: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export default function TeacherUpload() {
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { settings, isLoading: settingsLoading } = useSystemSettings();
  const { uploadDocument } = useDocuments();
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get allowed file types and max file size from system settings
  const allowedFileTypes = settings?.allowedFileTypes || ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png'];
  const maxFileSize = (settings?.maxFileSize || 10) * 1024 * 1024; // Convert MB to bytes

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return <Image className="h-6 w-6" />;
    if (fileType.includes('pdf')) return <FileText className="h-6 w-6" />;
    return <File className="h-6 w-6" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeFromExtension = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    return extension;
  };

  const validateFile = (file: File): string | null => {
    const fileExtension = getFileTypeFromExtension(file.name);
    
    if (!allowedFileTypes.includes(fileExtension)) {
      return `Invalid file type. Allowed types: ${allowedFileTypes.join(', ').toUpperCase()}`;
    }

    if (file.size > maxFileSize) {
      return `File size exceeds ${settings?.maxFileSize || 10}MB limit.`;
    }

    return null;
  };

  const addFiles = useCallback((files: FileList | File[]) => {
    const newFiles: UploadFile[] = [];
    let errorCount = 0;
    let successCount = 0;

    Array.from(files).forEach((file) => {
      const error = validateFile(file);

      if (error) {
        errorCount++;
      } else {
        successCount++;
      }

      newFiles.push({
        id: Math.random().toString(36).substr(2, 9),
        file,
        title: file.name.split('.').slice(0, -1).join('.'),
        description: '',
        category: '',
        class: '',
        subject: '',
        progress: 0,
        status: error ? 'error' : 'pending',
        error
      });
    });

    setUploadFiles(prev => [...prev, ...newFiles]);

    // Show toast notifications
    if (successCount > 0) {
      toast.success('Files Added', {
        description: `${successCount} file${successCount > 1 ? 's' : ''} added successfully`
      });
    }

    if (errorCount > 0) {
      toast.error('Invalid Files', {
        description: `${errorCount} file${errorCount > 1 ? 's' : ''} could not be added due to validation errors`
      });
    }
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      addFiles(e.target.files);
    }
  };

  const updateFileData = (id: string, field: keyof UploadFile, value: string) => {
    setUploadFiles(prev => prev.map(file => 
      file.id === id ? { ...file, [field]: value } : file
    ));
  };

  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(file => file.id !== id));
  };

  const uploadFile = async (fileData: UploadFile) => {
    if (!fileData.title || !fileData.category) return;

    setUploadFiles(prev => prev.map(file => 
      file.id === fileData.id ? { ...file, status: 'uploading', progress: 0 } : file
    ));

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadFiles(prev => prev.map(file => {
          if (file.id === fileData.id && file.status === 'uploading') {
            const newProgress = Math.min(file.progress + Math.random() * 30, 90);
            return { ...file, progress: newProgress };
          }
          return file;
        }));
      }, 200);

      // Create document object for upload
      const documentData = {
        title: fileData.title,
        description: fileData.description,
        categoryId: fileData.category,
        classLevel: fileData.class || undefined,
        subject: fileData.subject || undefined,
        file: fileData.file
      };

      // Upload through our API
      await uploadDocument(documentData);

      // Complete the progress
      clearInterval(progressInterval);
      setUploadFiles(prev => prev.map(file => 
        file.id === fileData.id ? { ...file, progress: 100, status: 'completed' } : file
      ));

      toast.success('Upload Complete', {
        description: `${fileData.title} has been uploaded successfully`
      });
    } catch (error) {
      setUploadFiles(prev => prev.map(file => 
        file.id === fileData.id ? { 
          ...file, 
          status: 'error', 
          error: 'Upload failed. Please try again.' 
        } : file
      ));

      toast.error('Upload Failed', {
        description: `Failed to upload ${fileData.title}`
      });
    }
  };

  const uploadAllFiles = async () => {
    const pendingFiles = uploadFiles.filter(file =>
      file.status === 'pending' && file.title && file.category
    );

    if (pendingFiles.length === 0) {
      toast.warning('No Files Ready', {
        description: 'Please complete all required fields before uploading'
      });
      return;
    }

    toast.info('Upload Started', {
      description: `Starting upload of ${pendingFiles.length} file${pendingFiles.length > 1 ? 's' : ''}`
    });

    for (const file of pendingFiles) {
      await uploadFile(file);
      // Small delay between uploads
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  const getSelectedCategory = (categoryId: string) => {
    return categories.find(cat => cat.id.toString() === categoryId);
  };

  const canUploadFile = (file: UploadFile) => {
    const category = getSelectedCategory(file.category);
    return file.title && file.category && file.status !== 'error' && 
                      (!category?.requires_class_subject || (file.class && file.subject));
  };

  const readyToUploadCount = uploadFiles.filter(canUploadFile).length;
  const completedCount = uploadFiles.filter(file => file.status === 'completed').length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Upload Documents</h1>
            <p className="text-muted-foreground">
              Add new documents to your digital filing system
            </p>
          </div>
          {uploadFiles.length > 0 && (
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {readyToUploadCount} ready • {completedCount} completed
              </div>
              <Button 
                onClick={uploadAllFiles}
                disabled={readyToUploadCount === 0}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload All ({readyToUploadCount})
              </Button>
            </div>
          )}
        </div>

        {/* System Settings Loading */}
        {settingsLoading && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Loading system settings...
            </AlertDescription>
          </Alert>
        )}

        {/* File Type Information */}
        {settings && (
          <Alert className="bg-info/10 border-info/20">
            <Info className="h-4 w-4 text-info" />
            <AlertDescription className="text-info-foreground">
              <strong>Allowed file types:</strong> {allowedFileTypes.join(', ').toUpperCase()} • 
              <strong> Max file size:</strong> {settings.maxFileSize}MB
            </AlertDescription>
          </Alert>
        )}

        {/* Upload Area */}
        <Card>
          <CardContent className="p-6">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <Paperclip className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Drop files here or click to browse</h3>
                <p className="text-muted-foreground mt-1">
                  Support for {allowedFileTypes.join(', ').toUpperCase()} (Max {settings?.maxFileSize || 10}MB each)
                </p>
              </div>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => fileInputRef.current?.click()}
                disabled={settingsLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Select Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={allowedFileTypes.map(type => `.${type}`).join(',')}
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>

        {/* File List */}
        {uploadFiles.length > 0 && (
          <div className="space-y-4">
            {uploadFiles.map((fileData) => {
              const category = getSelectedCategory(fileData.category);
              const canUpload = canUploadFile(fileData);

              return (
                <Card key={fileData.id}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* File Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {getFileIcon(fileData.file.type)}
                          <div>
                            <p className="font-medium">{fileData.file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatFileSize(fileData.file.size)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {fileData.status === 'completed' && (
                            <Badge className="bg-success/10 text-success border-success/20">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Uploaded
                            </Badge>
                          )}
                          {fileData.status === 'error' && (
                            <Badge variant="destructive">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Error
                            </Badge>
                          )}
                          {fileData.status === 'uploading' && (
                            <Badge variant="outline">
                              <Clock className="h-3 w-3 mr-1" />
                              Uploading...
                            </Badge>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeFile(fileData.id)}
                            disabled={fileData.status === 'uploading'}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Error Message */}
                      {fileData.error && (
                        <Alert className="bg-destructive/10 border-destructive/20">
                          <AlertCircle className="h-4 w-4 text-destructive" />
                          <AlertDescription className="text-destructive">
                            {fileData.error}
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Progress Bar */}
                      {fileData.status === 'uploading' && (
                        <div className="space-y-2">
                          <Progress value={fileData.progress} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            Uploading... {Math.round(fileData.progress)}%
                          </p>
                        </div>
                      )}

                      {/* File Details Form */}
                      {fileData.status !== 'error' && (
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Document Title *</Label>
                            <Input
                              value={fileData.title}
                              onChange={(e) => updateFileData(fileData.id, 'title', e.target.value)}
                              placeholder="Enter document title"
                              disabled={fileData.status === 'uploading' || fileData.status === 'completed'}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Category *</Label>
                            <Select
                              value={fileData.category}
                              onValueChange={(value) => updateFileData(fileData.id, 'category', value)}
                              disabled={fileData.status === 'uploading' || fileData.status === 'completed'}
                            >
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
                          </div>

                                                    {category?.requires_class_subject && (
                            <>
                              <div className="space-y-2">
                                <Label>Class *</Label>
                                <Select
                                  value={fileData.class}
                                  onValueChange={(value) => updateFileData(fileData.id, 'class', value)}
                                  disabled={fileData.status === 'uploading' || fileData.status === 'completed'}
                                >
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
                                <Label>Subject *</Label>
                                <Select
                                  value={fileData.subject}
                                  onValueChange={(value) => updateFileData(fileData.id, 'subject', value)}
                                  disabled={fileData.status === 'uploading' || fileData.status === 'completed'}
                                >
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
                            </>
                          )}

                          <div className="space-y-2 md:col-span-2">
                            <Label>Description (Optional)</Label>
                            <Textarea
                              value={fileData.description}
                              onChange={(e) => updateFileData(fileData.id, 'description', e.target.value)}
                              placeholder="Add a brief description of this document"
                              rows={2}
                              disabled={fileData.status === 'uploading' || fileData.status === 'completed'}
                            />
                          </div>
                        </div>
                      )}

                      {/* Upload Button */}
                      {fileData.status === 'pending' && (
                        <div className="flex justify-end">
                          <Button
                            onClick={() => uploadFile(fileData)}
                            disabled={!canUpload}
                            className="gap-2"
                          >
                            <Upload className="h-4 w-4" />
                            Upload Document
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Upload Tips & Categories Info */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">File Requirements</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Maximum file size: {settings?.maxFileSize || 10}MB</li>
                    <li>• Supported formats: {allowedFileTypes.join(', ').toUpperCase()}</li>
                    <li>• Use descriptive file names</li>
                    <li>• Ensure files are not corrupted</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Organization Tips</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Choose the most appropriate category</li>
                    <li>• Add detailed descriptions for better searchability</li>
                    <li>• Consider sharing useful documents with colleagues</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Document Categories</CardTitle>
              <CardDescription>
                Understanding category requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoriesLoading ? (
                  <p className="text-sm text-muted-foreground">Loading categories...</p>
                ) : (
                  categories.map((category) => (
                    <div key={category.id} className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{category.name}</h4>
                          {category.requires_class_subject && (
                            <Badge variant="outline" className="text-xs">
                              Requires Class & Subject
                            </Badge>
                          )}
                        </div>
                        {category.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {category.description}
                          </p>
                        )}
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
