import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useProductManagement } from '@/contexts/ProductManagementContext';
import { toast } from 'sonner';

export default function BrandFormPage() {
    const navigate = useNavigate();
    const { brandId } = useParams<{ brandId: string }>();
    const { categories, brands, createBrand, updateBrand } = useProductManagement();

    const isEditing = !!brandId;
    const existingBrand = isEditing ? brands.find(b => b.id === brandId) : null;

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        logoUrl: '',
        isActive: true,
        categoryIds: [] as string[],
    });

    // Get parent categories and sub-categories
    const parentCategories = categories.filter(c => !c.parentId);
    const subCategories = categories.filter(c => c.parentId);

    useEffect(() => {
        if (existingBrand) {
            setFormData({
                name: existingBrand.name,
                slug: existingBrand.slug,
                description: existingBrand.description || '',
                logoUrl: existingBrand.logoUrl || '',
                isActive: existingBrand.isActive,
                categoryIds: existingBrand.categoryIds || [],
            });
        }
    }, [existingBrand]);

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

    const handleCategoryToggle = (categoryId: string, checked: boolean) => {
        if (checked) {
            setFormData({
                ...formData,
                categoryIds: [...formData.categoryIds, categoryId],
            });
        } else {
            setFormData({
                ...formData,
                categoryIds: formData.categoryIds.filter(id => id !== categoryId),
            });
        }
    };

    const handleParentCategoryToggle = (parentId: string, checked: boolean) => {
        const parentSubCats = subCategories
            .filter(sub => sub.parentId === parentId)
            .map(sub => sub.id);

        if (checked) {
            // Add all sub-categories of this parent
            const newCategoryIds = [...new Set([...formData.categoryIds, ...parentSubCats])];
            setFormData({
                ...formData,
                categoryIds: newCategoryIds,
            });
        } else {
            // Remove all sub-categories of this parent
            setFormData({
                ...formData,
                categoryIds: formData.categoryIds.filter(id => !parentSubCats.includes(id)),
            });
        }
    };

    const isParentCategoryChecked = (parentId: string) => {
        const parentSubCats = subCategories
            .filter(sub => sub.parentId === parentId)
            .map(sub => sub.id);

        return parentSubCats.length > 0 && parentSubCats.every(id => formData.categoryIds.includes(id));
    };

    const isParentCategoryIndeterminate = (parentId: string) => {
        const parentSubCats = subCategories
            .filter(sub => sub.parentId === parentId)
            .map(sub => sub.id);

        const checkedCount = parentSubCats.filter(id => formData.categoryIds.includes(id)).length;
        return checkedCount > 0 && checkedCount < parentSubCats.length;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Brand name is required');
            return;
        }

        if (formData.categoryIds.length === 0) {
            toast.error('Please select at least one sub-category');
            return;
        }

        // Check for duplicate names (excluding current brand if editing)
        const duplicate = brands.find(b =>
            b.name.toLowerCase() === formData.name.toLowerCase() &&
            (!isEditing || b.id !== brandId)
        );

        if (duplicate) {
            toast.error('A brand with this name already exists');
            return;
        }

        if (isEditing && brandId) {
            const result = await updateBrand(brandId, formData);
            if (result.success) {
                toast.success('Brand updated successfully');
                navigate('/admin/brands');
            }
        } else {
            const result = await createBrand(formData);
            if (result.success) {
                toast.success('Brand created successfully');
                navigate('/admin/brands');
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
                                onClick={() => navigate('/admin/brands')}
                                className="gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">
                                    {isEditing ? 'Edit Brand' : 'Add Brand'}
                                </h1>
                                <p className="text-sm text-slate-500">
                                    {isEditing ? existingBrand?.name : 'Create a new brand'}
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={handleSubmit}
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {isEditing ? 'Update' : 'Create'} Brand
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
                            <CardDescription>Brand details and identification</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Brand Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    placeholder="e.g., Apple, Samsung, Nike"
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
                                    placeholder="Brief description of this brand..."
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="logoUrl">Logo URL (optional)</Label>
                                <Input
                                    id="logoUrl"
                                    value={formData.logoUrl}
                                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                                    placeholder="https://example.com/logo.png"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Category Assignment */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Sub-Category Assignment *</CardTitle>
                            <CardDescription>
                                Select which sub-categories this brand belongs to (e.g., Lenovo → Laptops)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {parentCategories.map(parentCat => {
                                    const parentSubCats = subCategories.filter(sub => sub.parentId === parentCat.id);

                                    if (parentSubCats.length === 0) return null;

                                    return (
                                        <div key={parentCat.id} className="space-y-3">
                                            {/* Parent Category Header */}
                                            <div className="flex items-center gap-3 p-3 bg-slate-100 rounded-lg">
                                                <Checkbox
                                                    id={`parent-${parentCat.id}`}
                                                    checked={isParentCategoryChecked(parentCat.id)}
                                                    onCheckedChange={(checked) => handleParentCategoryToggle(parentCat.id, checked as boolean)}
                                                    className={isParentCategoryIndeterminate(parentCat.id) ? 'data-[state=checked]:bg-orange-600' : ''}
                                                />
                                                <Label
                                                    htmlFor={`parent-${parentCat.id}`}
                                                    className="text-base font-semibold text-slate-900 cursor-pointer flex items-center gap-2"
                                                >
                                                    <span>{parentCat.icon || '📦'}</span>
                                                    {parentCat.name}
                                                    <span className="text-xs text-slate-500 font-normal">
                                                        (Select all)
                                                    </span>
                                                </Label>
                                            </div>

                                            {/* Sub-Categories */}
                                            <div className="ml-8 space-y-2">
                                                {parentSubCats.map(subCat => (
                                                    <div key={subCat.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded">
                                                        <Checkbox
                                                            id={`sub-${subCat.id}`}
                                                            checked={formData.categoryIds.includes(subCat.id)}
                                                            onCheckedChange={(checked) => handleCategoryToggle(subCat.id, checked as boolean)}
                                                        />
                                                        <Label
                                                            htmlFor={`sub-${subCat.id}`}
                                                            className="text-sm text-slate-700 cursor-pointer flex-1"
                                                        >
                                                            {subCat.name}
                                                            {subCat.description && (
                                                                <span className="text-xs text-slate-500 ml-2">
                                                                    - {subCat.description}
                                                                </span>
                                                            )}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}

                                {subCategories.length === 0 && (
                                    <div className="text-center py-8">
                                        <Tag className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                                        <p className="text-slate-500 mb-2">No sub-categories available</p>
                                        <p className="text-sm text-slate-400">
                                            Please create categories and sub-categories first
                                        </p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => navigate('/admin/categories')}
                                            className="mt-4"
                                        >
                                            Go to Categories
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {formData.categoryIds.length > 0 && (
                                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-900">
                                        <strong>{formData.categoryIds.length}</strong> sub-{formData.categoryIds.length === 1 ? 'category' : 'categories'} selected
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Settings</CardTitle>
                            <CardDescription>Brand visibility and status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                <div>
                                    <Label htmlFor="isActive" className="text-sm font-medium">Active Status</Label>
                                    <p className="text-xs text-slate-500">
                                        Inactive brands are hidden from customers
                                    </p>
                                </div>
                                <Switch
                                    id="isActive"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/admin/brands')}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {isEditing ? 'Update' : 'Create'} Brand
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
