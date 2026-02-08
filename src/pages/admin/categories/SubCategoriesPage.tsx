import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, Power, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useProductManagement } from '@/contexts/ProductManagementContext';
import { toast } from 'sonner';

export default function SubCategoriesPage() {
    const navigate = useNavigate();
    const { categoryId } = useParams<{ categoryId: string }>();
    const { categories, createCategory, updateCategory, deleteCategory, isLoading } = useProductManagement();

    const parentCategory = categories.find(c => c.id === categoryId);
    const subCategories = categories.filter(c => c.parentId === categoryId);

    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        isActive: true,
        displayOrder: 0,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="mb-4">
                        <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-orange-600 animate-spin mx-auto"></div>
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900">Loading categories...</h2>
                </div>
            </div>
        );
    }

    if (!parentCategory) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Category Not Found</h2>
                    <p className="text-slate-600 mb-4">The category you're looking for doesn't exist.</p>
                    <Button onClick={() => navigate('/admin/categories')}>
                        Back to Categories
                    </Button>
                </div>
            </div>
        );
    }

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleNameChange = (name: string) => {
        setFormData({
            ...formData,
            name,
            slug: generateSlug(name),
        });
    };

    const resetForm = () => {
        setFormData({
            name: '',
            slug: '',
            description: '',
            isActive: true,
            displayOrder: 0,
        });
        setShowAddForm(false);
        setEditingId(null);
    };

    const handleEdit = (subCategory: typeof subCategories[0]) => {
        setFormData({
            name: subCategory.name,
            slug: subCategory.slug,
            description: subCategory.description || '',
            isActive: subCategory.isActive,
            displayOrder: subCategory.displayOrder || 0,
        });
        setEditingId(subCategory.id);
        setShowAddForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Sub-category name is required');
            return;
        }

        // Check for duplicate names under same parent
        const duplicate = subCategories.find(c =>
            c.name.toLowerCase() === formData.name.toLowerCase() &&
            c.id !== editingId
        );

        if (duplicate) {
            toast.error('A sub-category with this name already exists under this category');
            return;
        }

        if (editingId) {
            const result = await updateCategory(editingId, {
                ...formData,
                sortOrder: formData.displayOrder,
            });
            if (result.success) {
                toast.success('Sub-category updated');
                resetForm();
            }
        } else {
            const result = await createCategory({
                ...formData,
                parentId: categoryId,
                sortOrder: formData.displayOrder,
            });
            if (result.success) {
                toast.success('Sub-category created');
                resetForm();
            }
        }
    };

    const handleToggleStatus = async (subCategoryId: string, currentStatus: boolean) => {
        const result = await updateCategory(subCategoryId, { isActive: !currentStatus });
        if (result.success) {
            toast.success(currentStatus ? 'Sub-category deactivated' : 'Sub-category activated');
        }
    };

    const handleDelete = async (subCategoryId: string, subCategoryName: string) => {
        // TODO: Check if sub-category has products
        // For now, just confirm deletion
        if (confirm(`Are you sure you want to delete "${subCategoryName}"?`)) {
            const result = await deleteCategory(subCategoryId);
            if (result.success) {
                toast.success('Sub-category deleted');
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/admin/categories')}
                                className="gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">
                                    {parentCategory.name} - Sub-categories
                                </h1>
                                <p className="text-sm text-slate-500 mt-1">
                                    Manage sub-categories under {parentCategory.name}
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={() => setShowAddForm(true)}
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Sub-category
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sub-categories List */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Sub-categories ({subCategories.length})</CardTitle>
                                <CardDescription>
                                    All sub-categories under {parentCategory.name}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {subCategories.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-slate-500 mb-4">No sub-categories yet</p>
                                        <Button
                                            onClick={() => setShowAddForm(true)}
                                            variant="outline"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add First Sub-category
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {subCategories
                                            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                                            .map((subCategory) => (
                                                <div
                                                    key={subCategory.id}
                                                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
                                                >
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3">
                                                            <h3 className="font-medium text-slate-900">
                                                                {subCategory.name}
                                                            </h3>
                                                            <Badge
                                                                variant="outline"
                                                                className={subCategory.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-700 border-slate-200'}
                                                            >
                                                                {subCategory.isActive ? 'Active' : 'Inactive'}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-slate-500 mt-1">
                                                            {subCategory.slug}
                                                        </p>
                                                        {subCategory.description && (
                                                            <p className="text-sm text-slate-600 mt-2">
                                                                {subCategory.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEdit(subCategory)}
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleToggleStatus(subCategory.id, subCategory.isActive)}
                                                        >
                                                            <Power className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(subCategory.id, subCategory.name)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Add/Edit Form */}
                    {showAddForm && (
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>
                                            {editingId ? 'Edit' : 'Add'} Sub-category
                                        </CardTitle>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={resetForm}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <CardDescription>
                                        Under {parentCategory.name}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Name *</Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => handleNameChange(e.target.value)}
                                                placeholder="e.g., Laptops, Smartphones"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="slug">Slug</Label>
                                            <Input
                                                id="slug"
                                                value={formData.slug}
                                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                                placeholder="auto-generated"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Input
                                                id="description"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="Optional description"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="displayOrder">Display Order</Label>
                                            <Input
                                                id="displayOrder"
                                                type="number"
                                                value={formData.displayOrder}
                                                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                                                placeholder="0"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <Label htmlFor="isActive" className="text-sm">Active</Label>
                                            <Switch
                                                id="isActive"
                                                checked={formData.isActive}
                                                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                            />
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={resetForm}
                                                className="flex-1"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                className="flex-1 bg-orange-600 hover:bg-orange-700"
                                            >
                                                <Save className="h-4 w-4 mr-2" />
                                                {editingId ? 'Update' : 'Create'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
