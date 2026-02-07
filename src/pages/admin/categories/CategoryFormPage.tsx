import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProductManagement } from '@/contexts/ProductManagementContext';
import { toast } from 'sonner';

export default function CategoryFormPage() {
    const navigate = useNavigate();
    const { categoryId } = useParams<{ categoryId: string }>();
    const { categories, createCategory, updateCategory } = useProductManagement();

    const isEditing = !!categoryId;
    const existingCategory = isEditing ? categories.find(c => c.id === categoryId) : null;

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        icon: '',
        isActive: true,
        displayOrder: 0,
    });

    useEffect(() => {
        if (existingCategory) {
            setFormData({
                name: existingCategory.name,
                slug: existingCategory.slug,
                description: existingCategory.description || '',
                icon: existingCategory.icon || '',
                isActive: existingCategory.isActive,
                displayOrder: existingCategory.displayOrder || 0,
            });
        }
    }, [existingCategory]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Category name is required');
            return;
        }

        // Check for duplicate names (excluding current category if editing)
        const duplicate = categories.find(c =>
            c.name.toLowerCase() === formData.name.toLowerCase() &&
            (!isEditing || c.id !== categoryId)
        );

        if (duplicate) {
            toast.error('A category with this name already exists');
            return;
        }

        if (isEditing && categoryId) {
            const result = await updateCategory(categoryId, {
                ...formData,
                sortOrder: formData.displayOrder,
            });
            if (result.success) {
                toast.success('Category updated successfully');
                navigate('/admin/categories');
            }
        } else {
            const result = await createCategory({
                ...formData,
                parentId: undefined, // This is a parent category
                sortOrder: formData.displayOrder,
            });
            if (result.success) {
                toast.success('Category created successfully');
                navigate('/admin/categories');
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4">
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
                                    {isEditing ? 'Edit Category' : 'Add Category'}
                                </h1>
                                <p className="text-sm text-slate-500">
                                    {isEditing ? existingCategory?.name : 'Create a new parent category'}
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={handleSubmit}
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {isEditing ? 'Update' : 'Create'} Category
                        </Button>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-6 py-8">
                <div className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>Category details and identification</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Category Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    placeholder="e.g., Electronics, Fashion, Home & Garden"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug (URL-friendly)</Label>
                                <Input
                                    id="slug"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="auto-generated-from-name"
                                />
                                <p className="text-xs text-slate-500">
                                    Auto-generated from name. Edit if needed.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of this category..."
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="icon">Icon/Emoji</Label>
                                <Input
                                    id="icon"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    placeholder="📦 (paste emoji or icon)"
                                    maxLength={10}
                                />
                                <p className="text-xs text-slate-500">
                                    Use an emoji or short icon text (e.g., 📱, 👕, 🏠)
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Settings</CardTitle>
                            <CardDescription>Category visibility and ordering</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                <div>
                                    <Label htmlFor="isActive" className="text-sm font-medium">Active Status</Label>
                                    <p className="text-xs text-slate-500">
                                        Inactive categories are hidden from customers
                                    </p>
                                </div>
                                <Switch
                                    id="isActive"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
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
                                <p className="text-xs text-slate-500">
                                    Lower numbers appear first. Use 0 for default ordering.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/admin/categories')}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {isEditing ? 'Update' : 'Create'} Category
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
