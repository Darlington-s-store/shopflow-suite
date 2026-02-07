import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/admin/products/ImageUpload';
import { VariantManager } from '@/components/admin/products/VariantManager';
import { useProductManagement } from '@/contexts/ProductManagementContext';
import { ProductFormData, ProductStatus, ProductImage, ProductVariant } from '@/types/product';
import { toast } from 'sonner';

export default function AddProduct() {
    const navigate = useNavigate();
    const { createProduct, categories, brands, isLoading } = useProductManagement();

    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        categoryId: '',
        subCategoryId: '',
        brandId: '',
        shortDescription: '',
        fullDescription: '',
        tags: [],
        basePrice: 0,
        discountPrice: 0,
        taxEnabled: false,
        stockTracking: true,
        lowStockThreshold: 10,
        status: 'DRAFT',
        variants: [],
        images: [],
    });

    const [productImages, setProductImages] = useState<ProductImage[]>([]);
    const [tagInput, setTagInput] = useState('');

    const handleSubmit = async (e: React.FormEvent, status: ProductStatus = 'DRAFT') => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim()) {
            toast.error('Product name is required');
            return;
        }

        if (!formData.categoryId) {
            toast.error('Please select a category');
            return;
        }

        if (productImages.length === 0) {
            toast.error('Please upload at least one product image');
            return;
        }

        if (formData.variants.length === 0 && !formData.basePrice) {
            toast.error('Please add variants or set a base price');
            return;
        }

        // Convert ProductImage[] to File[]
        const imageFiles = productImages.map(img => img.file).filter(Boolean) as File[];

        const dataToSubmit: ProductFormData = {
            ...formData,
            status,
            images: imageFiles,
            existingImages: productImages,
        };

        const result = await createProduct(dataToSubmit);

        if (result.success) {
            toast.success(`Product ${status === 'PUBLISHED' ? 'published' : 'saved as draft'} successfully!`);
            navigate('/admin/products');
        }
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData({
                ...formData,
                tags: [...formData.tags, tagInput.trim()],
            });
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(t => t !== tag),
        });
    };

    const mainCategories = categories.filter(c => !c.parentId);
    const subCategories = categories.filter(c => c.parentId === formData.categoryId);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/admin/products')}
                                className="gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Add New Product</h1>
                                <p className="text-sm text-slate-500">Create a new product with variants and images</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={(e) => handleSubmit(e, 'DRAFT')}
                                disabled={isLoading}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Save Draft
                            </Button>
                            <Button
                                type="button"
                                onClick={(e) => handleSubmit(e, 'PUBLISHED')}
                                disabled={isLoading}
                                className="bg-orange-600 hover:bg-orange-700"
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                Publish Product
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>Enter the main product details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Product Name *</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g., iPhone 15 Pro Max"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="shortDescription">Short Description *</Label>
                                    <Textarea
                                        id="shortDescription"
                                        placeholder="Brief product description (1-2 sentences)"
                                        value={formData.shortDescription}
                                        onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                                        rows={2}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="fullDescription">Full Description *</Label>
                                    <Textarea
                                        id="fullDescription"
                                        placeholder="Detailed product description, features, specifications..."
                                        value={formData.fullDescription}
                                        onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                                        rows={6}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tags">Tags</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="tags"
                                            placeholder="Add tags (e.g., smartphone, 5G)"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                        />
                                        <Button type="button" onClick={handleAddTag} variant="outline">
                                            Add
                                        </Button>
                                    </div>
                                    {formData.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {formData.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                                                >
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveTag(tag)}
                                                        className="hover:text-orange-900"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Product Images */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Product Images</CardTitle>
                                <CardDescription>Upload high-quality product images</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ImageUpload
                                    images={productImages}
                                    onImagesChange={setProductImages}
                                    maxImages={10}
                                    maxSizeMB={5}
                                />
                            </CardContent>
                        </Card>

                        {/* Pricing */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Pricing</CardTitle>
                                <CardDescription>Set base price or use variant pricing</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="basePrice">Base Price (GHS)</Label>
                                        <Input
                                            id="basePrice"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={formData.basePrice || ''}
                                            onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                                        />
                                        <p className="text-xs text-slate-500">Leave empty if using variant pricing</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="discountPrice">Discount Price (GHS)</Label>
                                        <Input
                                            id="discountPrice"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={formData.discountPrice || ''}
                                            onChange={(e) => setFormData({ ...formData, discountPrice: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                    <div>
                                        <Label htmlFor="taxEnabled" className="text-sm font-medium">Include Tax/VAT</Label>
                                        <p className="text-xs text-slate-500">Enable if price includes tax</p>
                                    </div>
                                    <Switch
                                        id="taxEnabled"
                                        checked={formData.taxEnabled}
                                        onCheckedChange={(checked) => setFormData({ ...formData, taxEnabled: checked })}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Product Variants */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Product Variants</CardTitle>
                                <CardDescription>Add color and storage options with individual pricing</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <VariantManager
                                    variants={formData.variants}
                                    onVariantsChange={(variants) => setFormData({ ...formData, variants })}
                                    productName={formData.name}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Category & Brand */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Organization</CardTitle>
                                <CardDescription>Categorize your product</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category *</Label>
                                    <Select
                                        value={formData.categoryId}
                                        onValueChange={(value) => setFormData({ ...formData, categoryId: value, subCategoryId: '' })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {mainCategories.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {subCategories.length > 0 && (
                                    <div className="space-y-2">
                                        <Label htmlFor="subCategory">Sub-Category</Label>
                                        <Select
                                            value={formData.subCategoryId}
                                            onValueChange={(value) => setFormData({ ...formData, subCategoryId: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select sub-category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {subCategories.map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.id}>
                                                        {cat.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="brand">Brand</Label>
                                    <Select
                                        value={formData.brandId}
                                        onValueChange={(value) => setFormData({ ...formData, brandId: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select brand" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {brands.map((brand) => (
                                                <SelectItem key={brand.id} value={brand.id}>
                                                    {brand.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Inventory */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Inventory</CardTitle>
                                <CardDescription>Manage stock levels</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                    <div>
                                        <Label htmlFor="stockTracking" className="text-sm font-medium">Track Stock</Label>
                                        <p className="text-xs text-slate-500">Monitor inventory levels</p>
                                    </div>
                                    <Switch
                                        id="stockTracking"
                                        checked={formData.stockTracking}
                                        onCheckedChange={(checked) => setFormData({ ...formData, stockTracking: checked })}
                                    />
                                </div>

                                {formData.stockTracking && (
                                    <div className="space-y-2">
                                        <Label htmlFor="lowStockThreshold">Low Stock Alert</Label>
                                        <Input
                                            id="lowStockThreshold"
                                            type="number"
                                            placeholder="10"
                                            value={formData.lowStockThreshold}
                                            onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) || 10 })}
                                        />
                                        <p className="text-xs text-slate-500">Alert when stock falls below this number</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Product Status</CardTitle>
                                <CardDescription>Control visibility</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData({ ...formData, status: value as ProductStatus })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DRAFT">Draft (Not visible)</SelectItem>
                                        <SelectItem value="PUBLISHED">Published (Live)</SelectItem>
                                        <SelectItem value="HIDDEN">Hidden (Temporarily)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
}
