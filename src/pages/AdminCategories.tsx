import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
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
  DialogTrigger,
} from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  FolderOpen,
  Shield,
  FileText,
  CheckCircle,
  AlertTriangle,
  Save,
  X
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
  requiresClassSubject: boolean;
  documentsCount: number;
  isActive: boolean;
  createdDate: string;
  lastModified: string;
}

interface CategoryFormData {
  name: string;
  description: string;
  requiresClassSubject: boolean;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    requiresClassSubject: false
  });

  // Mock data - in real app, this would come from Django REST API
  useEffect(() => {
    const mockCategories: Category[] = [
      {
        id: '1',
        name: 'Lesson Plans',
        description: 'Teaching plans and curriculum materials for daily lessons',
        requiresClassSubject: true,
        documentsCount: 45,
        isActive: true,
        createdDate: '2024-01-01',
        lastModified: '2024-01-15'
      },
      {
        id: '2',
        name: 'Assessment Reports',
        description: 'Student assessment results and progress reports',
        requiresClassSubject: true,
        documentsCount: 32,
        isActive: true,
        createdDate: '2024-01-01',
        lastModified: '2024-01-12'
      },
      {
        id: '3',
        name: 'Student Records',
        description: 'Individual student files and academic records',
        requiresClassSubject: true,
        documentsCount: 28,
        isActive: true,
        createdDate: '2024-01-01',
        lastModified: '2024-01-10'
      },
      {
        id: '4',
        name: 'Administrative Forms',
        description: 'School administrative documents and forms',
        requiresClassSubject: false,
        documentsCount: 15,
        isActive: true,
        createdDate: '2024-01-01',
        lastModified: '2024-01-08'
      },
      {
        id: '5',
        name: 'Professional Development',
        description: 'Training materials and professional growth documents',
        requiresClassSubject: false,
        documentsCount: 12,
        isActive: true,
        createdDate: '2024-01-01',
        lastModified: '2024-01-05'
      },
      {
        id: '6',
        name: 'Meeting Minutes',
        description: 'Records of staff meetings and conferences',
        requiresClassSubject: false,
        documentsCount: 8,
        isActive: true,
        createdDate: '2024-01-01',
        lastModified: '2024-01-03'
      },
      {
        id: '7',
        name: 'Curriculum Materials',
        description: 'Subject-specific teaching resources and materials',
        requiresClassSubject: true,
        documentsCount: 18,
        isActive: true,
        createdDate: '2024-01-02',
        lastModified: '2024-01-14'
      },
      {
        id: '8',
        name: 'Parent Communication',
        description: 'Letters and communications with parents',
        requiresClassSubject: false,
        documentsCount: 5,
        isActive: false,
        createdDate: '2024-01-03',
        lastModified: '2024-01-03'
      }
    ];
    setCategories(mockCategories);
    setFilteredCategories(mockCategories);
  }, []);

  // Filter categories based on search
  useEffect(() => {
    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [categories, searchQuery]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const showSuccess = (message: string) => {
    setActionSuccess(message);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const showError = (message: string) => {
    setActionError(message);
    setTimeout(() => setActionError(''), 3000);
  };

  const handleAddCategory = () => {
    if (!formData.name.trim()) {
      showError('Category name is required');
      return;
    }

    const newCategory: Category = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      documentsCount: 0,
      isActive: true,
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    setCategories(prev => [...prev, newCategory]);
    setAddDialogOpen(false);
    setFormData({ name: '', description: '', requiresClassSubject: false });
    showSuccess('Category created successfully!');
  };

  const handleEditCategory = () => {
    if (!selectedCategory || !formData.name.trim()) {
      showError('Category name is required');
      return;
    }

    setCategories(prev => prev.map(category =>
      category.id === selectedCategory.id
        ? { ...category, ...formData, lastModified: new Date().toISOString() }
        : category
    ));

    setEditDialogOpen(false);
    setSelectedCategory(null);
    setFormData({ name: '', description: '', requiresClassSubject: false });
    showSuccess('Category updated successfully!');
  };

  const handleDeleteCategory = () => {
    if (!selectedCategory) return;

    if (selectedCategory.documentsCount > 0) {
      showError('Cannot delete category with existing documents');
      setDeleteDialogOpen(false);
      setSelectedCategory(null);
      return;
    }

    setCategories(prev => prev.filter(category => category.id !== selectedCategory.id));
    setDeleteDialogOpen(false);
    setSelectedCategory(null);
    showSuccess('Category deleted successfully!');
  };

  const handleToggleActive = (category: Category) => {
    if (!category.isActive && category.documentsCount > 0) {
      showError('Cannot deactivate category with existing documents');
      return;
    }

    setCategories(prev => prev.map(cat =>
      cat.id === category.id
        ? { ...cat, isActive: !cat.isActive, lastModified: new Date().toISOString() }
        : cat
    ));

    showSuccess(`Category ${category.isActive ? 'deactivated' : 'activated'} successfully!`);
  };

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      requiresClassSubject: category.requiresClassSubject
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (category: Category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const activeCategories = categories.filter(c => c.isActive).length;
  const totalDocuments = categories.reduce((sum, cat) => sum + cat.documentsCount, 0);
  const categoriesWithClassSubject = categories.filter(c => c.requiresClassSubject).length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Category Management</h1>
            <p className="text-muted-foreground">
              Organize document types and their requirements
            </p>
          </div>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        {/* Success/Error Messages */}
        {actionSuccess && (
          <Alert className="bg-success/10 border-success/20">
            <CheckCircle className="h-4 w-4 text-success" />
            <AlertDescription className="text-success-foreground">
              {actionSuccess}
            </AlertDescription>
          </Alert>
        )}

        {actionError && (
          <Alert className="bg-destructive/10 border-destructive/20">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              {actionError}
            </AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{categories.length}</div>
              <p className="text-xs text-muted-foreground">Total Categories</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-success">{activeCategories}</div>
              <p className="text-xs text-muted-foreground">Active Categories</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{totalDocuments}</div>
              <p className="text-xs text-muted-foreground">Total Documents</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{categoriesWithClassSubject}</div>
              <p className="text-xs text-muted-foreground">Require Class/Subject</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((category) => (
            <Card key={category.id} className={`hover:shadow-md transition-shadow ${!category.isActive ? 'opacity-60' : ''}`}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold line-clamp-1">{category.name}</h3>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(category)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(category)}>
                          {category.isActive ? (
                            <>
                              <X className="h-4 w-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => openDeleteDialog(category)}
                          className="text-destructive"
                          disabled={category.documentsCount > 0}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {category.description || 'No description provided'}
                  </p>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={category.isActive ? "default" : "secondary"}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {category.requiresClassSubject && (
                      <Badge variant="outline" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Class/Subject Required
                      </Badge>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>{category.documentsCount} documents</span>
                    </div>
                    <span>Modified {formatDate(category.lastModified)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Category Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>
                Create a new document category with the following details
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter category name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this category is used for"
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="requiresClassSubject">Requires Class & Subject</Label>
                  <p className="text-sm text-muted-foreground">
                    Documents in this category must specify a class and subject
                  </p>
                </div>
                <Switch
                  id="requiresClassSubject"
                  checked={formData.requiresClassSubject}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requiresClassSubject: checked }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCategory}>
                <Save className="h-4 w-4 mr-2" />
                Create Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Category Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>
                Update the category details
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Category Name</Label>
                <Input
                  id="editName"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter category name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this category is used for"
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="editRequiresClassSubject">Requires Class & Subject</Label>
                  <p className="text-sm text-muted-foreground">
                    Documents in this category must specify a class and subject
                  </p>
                </div>
                <Switch
                  id="editRequiresClassSubject"
                  checked={formData.requiresClassSubject}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requiresClassSubject: checked }))}
                />
              </div>
              {selectedCategory && selectedCategory.documentsCount > 0 && (
                <Alert className="bg-warning/10 border-warning/20">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <AlertDescription className="text-warning-foreground">
                    This category has {selectedCategory.documentsCount} existing documents. 
                    Changing requirements may affect existing documents.
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditCategory}>
                <Save className="h-4 w-4 mr-2" />
                Update Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Category Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Category</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedCategory?.name}"? 
                {selectedCategory?.documentsCount === 0 
                  ? " This action cannot be undone."
                  : ` This category has ${selectedCategory?.documentsCount} documents and cannot be deleted.`
                }
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteCategory}
                disabled={selectedCategory?.documentsCount ? selectedCategory.documentsCount > 0 : false}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
