import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Power, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProductManagement } from '@/contexts/ProductManagementContext';
import { toast } from 'sonner';

export default function AdminBrandsPage() {
    const navigate = useNavigate();
    const { categories, brands, updateBrand, deleteBrand } = useProductManagement();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // Get parent categories and sub-categories
    const parentCategories = categories.filter(c => !c.parentId);
    const subCategories = categories.filter(c => c.parentId);

    // Filter brands
    const filteredBrands = brands.filter(brand => {
        const matchesSearch = brand.name.toLowerCase().includes(searchTerm.toLowerCase());

        if (selectedCategory === 'all') return matchesSearch;

        // Check if brand belongs to selected category or its sub-categories
        const categorySubIds = subCategories
            .filter(sub => sub.parentId === selectedCategory)
            .map(sub => sub.id);

        return matchesSearch && (
            brand.categoryIds?.includes(selectedCategory) ||
            brand.categoryIds?.some(id => categorySubIds.includes(id))
        );
    });

    // Group brands by sub-category
    const brandsBySubCategory = subCategories.reduce((acc, subCat) => {
        acc[subCat.id] = filteredBrands.filter(brand =>
            brand.categoryIds?.includes(subCat.id)
        );
        return acc;
    }, {} as Record<string, typeof brands>);

    // Unassigned brands
    const unassignedBrands = filteredBrands.filter(brand =>
        !brand.categoryIds || brand.categoryIds.length === 0
    );

    const handleToggleStatus = async (brandId: string, currentStatus: boolean) => {
        const result = await updateBrand(brandId, { isActive: !currentStatus });
        if (result.success) {
            toast.success(currentStatus ? 'Brand deactivated' : 'Brand activated');
        }
    };

    const handleDelete = async (brandId: string, brandName: string) => {
        if (confirm(`Are you sure you want to delete "${brandName}"?`)) {
            const result = await deleteBrand(brandId);
            if (result.success) {
                toast.success('Brand deleted');
            }
        }
    };

    const getCategoryName = (categoryId: string) => {
        return categories.find(c => c.id === categoryId)?.name || 'Unknown';
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Brands</h1>
                            <p className="text-sm text-slate-500 mt-1">
                                Manage product brands and their categories
                            </p>
                        </div>
                        <Button
                            onClick={() => navigate('/admin/brands/add')}
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Brand
                        </Button>
                    </div>

                    {/* Filters */}
                    <div className="mt-6 flex gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search brands..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-900"
                        >
                            <option value="all">All Categories</option>
                            {parentCategories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-slate-900">{brands.length}</div>
                            <div className="text-sm text-slate-500">Total Brands</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-green-600">
                                {brands.filter(b => b.isActive).length}
                            </div>
                            <div className="text-sm text-slate-500">Active Brands</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-slate-600">
                                {brands.filter(b => !b.isActive).length}
                            </div>
                            <div className="text-sm text-slate-500">Inactive Brands</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-orange-600">
                                {unassignedBrands.length}
                            </div>
                            <div className="text-sm text-slate-500">Unassigned</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Brands by Sub-Category */}
                {selectedCategory === 'all' ? (
                    // Show all sub-categories
                    <div className="space-y-6">
                        {parentCategories.map(parentCat => {
                            const parentSubCats = subCategories.filter(sub => sub.parentId === parentCat.id);

                            return (
                                <div key={parentCat.id}>
                                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <span>{parentCat.icon || '📦'}</span>
                                        {parentCat.name}
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {parentSubCats.map(subCat => {
                                            const subCatBrands = brandsBySubCategory[subCat.id] || [];

                                            return (
                                                <Card key={subCat.id}>
                                                    <CardHeader>
                                                        <CardTitle className="text-lg flex items-center justify-between">
                                                            <span>{subCat.name}</span>
                                                            <Badge variant="outline">
                                                                {subCatBrands.length}
                                                            </Badge>
                                                        </CardTitle>
                                                        <CardDescription>
                                                            {subCat.description || 'No description'}
                                                        </CardDescription>
                                                    </CardHeader>
                                                    <CardContent>
                                                        {subCatBrands.length === 0 ? (
                                                            <p className="text-sm text-slate-500 italic">
                                                                No brands assigned
                                                            </p>
                                                        ) : (
                                                            <div className="space-y-2">
                                                                {subCatBrands.map(brand => (
                                                                    <div
                                                                        key={brand.id}
                                                                        className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <Tag className="h-4 w-4 text-slate-400" />
                                                                            <span className="text-sm font-medium text-slate-900">
                                                                                {brand.name}
                                                                            </span>
                                                                            <Badge
                                                                                variant="outline"
                                                                                className={brand.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-700'}
                                                                            >
                                                                                {brand.isActive ? 'Active' : 'Inactive'}
                                                                            </Badge>
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => navigate(`/admin/brands/edit/${brand.id}`)}
                                                                            >
                                                                                <Edit2 className="h-3 w-3" />
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => handleToggleStatus(brand.id, brand.isActive)}
                                                                            >
                                                                                <Power className="h-3 w-3" />
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => handleDelete(brand.id, brand.name)}
                                                                                className="text-red-600 hover:text-red-700"
                                                                            >
                                                                                <Trash2 className="h-3 w-3" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Unassigned Brands */}
                        {unassignedBrands.length > 0 && (
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 mb-4">
                                    Unassigned Brands
                                </h2>
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {unassignedBrands.map(brand => (
                                                <div
                                                    key={brand.id}
                                                    className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Tag className="h-4 w-4 text-slate-400" />
                                                        <span className="text-sm font-medium">{brand.name}</span>
                                                        <Badge
                                                            variant="outline"
                                                            className={brand.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-700'}
                                                        >
                                                            {brand.isActive ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => navigate(`/admin/brands/edit/${brand.id}`)}
                                                        >
                                                            <Edit2 className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleToggleStatus(brand.id, brand.isActive)}
                                                        >
                                                            <Power className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(brand.id, brand.name)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                ) : (
                    // Show selected category only
                    <div className="space-y-6">
                        {subCategories
                            .filter(sub => sub.parentId === selectedCategory)
                            .map(subCat => {
                                const subCatBrands = brandsBySubCategory[subCat.id] || [];

                                return (
                                    <Card key={subCat.id}>
                                        <CardHeader>
                                            <CardTitle className="flex items-center justify-between">
                                                <span>{subCat.name}</span>
                                                <Badge variant="outline">{subCatBrands.length} brands</Badge>
                                            </CardTitle>
                                            <CardDescription>
                                                {subCat.description || 'No description'}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {subCatBrands.length === 0 ? (
                                                <div className="text-center py-8">
                                                    <p className="text-slate-500 mb-4">No brands assigned to this sub-category</p>
                                                    <Button
                                                        onClick={() => navigate('/admin/brands/add')}
                                                        variant="outline"
                                                    >
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Add Brand
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {subCatBrands.map(brand => (
                                                        <div
                                                            key={brand.id}
                                                            className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Tag className="h-4 w-4 text-slate-400" />
                                                                <span className="text-sm font-medium">{brand.name}</span>
                                                                <Badge
                                                                    variant="outline"
                                                                    className={brand.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-700'}
                                                                >
                                                                    {brand.isActive ? 'Active' : 'Inactive'}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => navigate(`/admin/brands/edit/${brand.id}`)}
                                                                >
                                                                    <Edit2 className="h-3 w-3" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleToggleStatus(brand.id, brand.isActive)}
                                                                >
                                                                    <Power className="h-3 w-3" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(brand.id, brand.name)}
                                                                    className="text-red-600 hover:text-red-700"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                    </div>
                )}

                {/* Empty State */}
                {filteredBrands.length === 0 && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Tag className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">No brands found</h3>
                            <p className="text-slate-500 mb-4">
                                {searchTerm ? 'Try a different search term' : 'Get started by adding your first brand'}
                            </p>
                            {!searchTerm && (
                                <Button
                                    onClick={() => navigate('/admin/brands/add')}
                                    className="bg-orange-600 hover:bg-orange-700"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add First Brand
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
