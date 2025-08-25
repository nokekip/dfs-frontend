import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
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

interface DocumentFile {
  id: string;
  title: string;
  fileName: string;
  category: string;
  class?: string;
  subject?: string;
  uploadDate: string;
  fileSize: string;
  fileType: string;
  isShared: boolean;
}

interface Category {
  id: string;
  name: string;
  requiresClassSubject: boolean;
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [uploadForm, setUploadForm] = useState({
    title: '',
    file: null as File | null,
    category: '',
    class: '',
    subject: ''
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentFiles, setRecentFiles] = useState<DocumentFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Mock data - in real app, this would come from Django REST API
  useEffect(() => {
    // Simulate API calls
    setCategories([
      { id: '1', name: 'Lesson Plans', requiresClassSubject: true },
      { id: '2', name: 'Assessment Reports', requiresClassSubject: true },
      { id: '3', name: 'Student Records', requiresClassSubject: true },
      { id: '4', name: 'Administrative Forms', requiresClassSubject: false },
      { id: '5', name: 'Professional Development', requiresClassSubject: false },
      { id: '6', name: 'Meeting Minutes', requiresClassSubject: false }
    ]);

    setRecentFiles([
      {
        id: '1',
        title: 'Mathematics Lesson Plan - Week 5',
        fileName: 'math_lesson_week5.pdf',
        category: 'Lesson Plans',
        class: 'Grade 5',
        subject: 'Mathematics',
        uploadDate: '2024-01-15',
        fileSize: '2.3 MB',
        fileType: 'PDF',
        isShared: false
      },
      {
        id: '2',
        title: 'Science Assessment Report',
        fileName: 'science_assessment_q1.docx',
        category: 'Assessment Reports',
        class: 'Grade 6',
        subject: 'Science',
        uploadDate: '2024-01-14',
        fileSize: '1.8 MB',
        fileType: 'DOCX',
        isShared: true
      },
      {
        id: '3',
        title: 'Staff Meeting Minutes - January',
        fileName: 'staff_meeting_jan2024.pdf',
        category: 'Meeting Minutes',
        uploadDate: '2024-01-12',
        fileSize: '956 KB',
        fileType: 'PDF',
        isShared: false
      },
      {
        id: '4',
        title: 'Student Progress Report Template',
        fileName: 'progress_report_template.xlsx',
        category: 'Administrative Forms',
        uploadDate: '2024-01-10',
        fileSize: '432 KB',
        fileType: 'XLSX',
        isShared: true
      },
      {
        id: '5',
        title: 'English Lesson Plan - Grammar',
        fileName: 'english_grammar_lesson.pdf',
        category: 'Lesson Plans',
        class: 'Grade 4',
        subject: 'English',
        uploadDate: '2024-01-08',
        fileSize: '1.2 MB',
        fileType: 'PDF',
        isShared: false
      }
    ]);
  }, []);

  const selectedCategory = categories.find(cat => cat.id === uploadForm.category);
  const storageUsed = 245; // MB
  const storageTotal = 1024; // MB (1GB)
  const storagePercentage = (storageUsed / storageTotal) * 100;

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.file || !uploadForm.title || !uploadForm.category) return;

    setIsUploading(true);
    try {
      // Simulate API upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reset form
      setUploadForm({
        title: '',
        file: null,
        category: '',
        class: '',
        subject: ''
      });
      
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
      
      // In real app, refetch recent files here
    } catch (error) {
      console.error('Upload failed:', error);
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

  const handleView = (file: DocumentFile) => {
    // In real app, this would open document in preview modal or new tab
    console.log('Viewing:', file.fileName);
    window.open(`/preview/${file.id}`, '_blank');
  };

  const handleDownload = (file: DocumentFile) => {
    // In real app, this would trigger actual download
    console.log('Downloading:', file.fileName);
    // Simulate download
    const link = document.createElement('a');
    link.href = '#';
    link.download = file.fileName;
    link.click();
    toast.success('Download Started', {
      description: `${file.fileName} is being downloaded`
    });
  };

  const handleShare = (file: DocumentFile) => {
    // In real app, this would open share dialog
    console.log('Sharing:', file.fileName);
    toast.info('Share Document', {
      description: `Sharing options for "${file.title}" - feature will be enhanced soon`
    });
    // For now, just toggle share status
    setRecentFiles(prev => prev.map(f =>
      f.id === file.id ? { ...f, isShared: !f.isShared } : f
    ));
  };

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
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                +3 from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{storageUsed} MB</div>
              <div className="mt-2 space-y-1">
                <Progress value={storagePercentage} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {storageUsed} MB of {storageTotal} MB used
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
              <div className="text-2xl font-bold">8</div>
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
                    accept=".pdf,.docx,.xlsx,.pptx,.jpg,.png"
                    onChange={handleFileChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Supported formats: PDF, DOCX, XLSX, PPTX, JPG, PNG (Max 10MB)
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
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCategory?.requiresClassSubject && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="class">Class</Label>
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
                      <Label htmlFor="subject">Subject</Label>
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

                {uploadSuccess && (
                  <Alert className="bg-success/10 border-success/20">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <AlertDescription className="text-success-foreground">
                      Document uploaded successfully!
                    </AlertDescription>
                  </Alert>
                )}

                <Button type="submit" disabled={isUploading} className="w-full">
                  {isUploading ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
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
                {recentFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        {getFileIcon(file.fileType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {file.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{file.category}</span>
                          {file.class && file.subject && (
                            <>
                              <span>•</span>
                              <span>{file.class} - {file.subject}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>{formatDate(file.uploadDate)}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {file.fileType}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {file.fileSize}
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
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
