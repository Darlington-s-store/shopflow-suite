import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MoreVertical, Edit2, Trash2, Eye, GripVertical, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useProductManagement } from '@/contexts/ProductManagementContext';
import { toast } from 'sonner';

export default function AdminCategoriesPage() {
    const navigate = useNavigate();
    const { categories, createCategory, updateCategory, deleteCategory } = useProductManagement();

    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<typeof categories[0] | null>(null);

    // Get only parent categories (no parentId)
    const parentCategories = categories.filter(c => !c.parentId);

    const filteredCategories = parentCategories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleToggleStatus = async (categoryId: string, currentStatus: boolean) => {
        const result = await updateCategory(categoryId, { isActive: !currentStatus });
        if (result.success) {
            toast.success(currentStatus ? 'Category deactivated' : 'Category activated');
        }
    };

    const handleDelete = async (categoryId: string, categoryName: string) => {
        // Check if category has sub-categories
        const hasSubCategories = categories.some(c => c.parentId === categoryId);

        if (hasSubCategories) {
            toast.error('Cannot delete category with sub-categories. Delete sub-categories first.');
            return;
        }

        if (confirm(`Are you sure you want to delete "${categoryName}"?`)) {
            const result = await deleteCategory(categoryId);
            if (result.success) {
                toast.success('Category deleted');
            }
        }
    };

    const getSubCategoryCount = (categoryId: string) => {
        return categories.filter(c => c.parentId === categoryId).length;
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
                            <p className="text-sm text-slate-500 mt-1">Manage product categories and organization</p>
                        </div>
                        <Button
                            onClick={() => navigate('/admin/categories/add')}
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Category
                        </Button>
                    </div>

                    {/* Search */}
                    <div className="mt-6">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search categories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories Grid */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCategories.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <p className="text-slate-500">No categories found</p>
                            <Button
                                onClick={() => navigate('/admin/categories/add')}
                                variant="outline"
                                className="mt-4"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create First Category
                            </Button>
                        </div>
                    ) : (
                        filteredCategories.map((category) => {
                            const subCategoryCount = getSubCategoryCount(category.id);

                            return (
                                <Card key={category.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                                                    <span className="text-2xl">{category.icon || '📦'}</span>
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg">{category.name}</CardTitle>
                                                    <CardDescription className="text-xs">
                                                        {category.slug}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => navigate(`/admin/categories/edit/${category.id}`)}>
                                                        <Edit2 className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => navigate(`/admin/categories/${category.id}/subcategories`)}>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Manage Sub-categories
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleToggleStatus(category.id, category.isActive)}>
                                                        <Power className="h-4 w-4 mr-2" />
                                                        {category.isActive ? 'Deactivate' : 'Activate'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(category.id, category.name)}
                                                        className="text-red-600 focus:text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {category.description && (
                                                <p className="text-sm text-slate-600 line-clamp-2">
                                                    {category.description}
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className={category.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-700 border-slate-200'}>
                                                        {category.isActive ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </div>
                                                <div className="text-sm text-slate-500">
                                                    {subCategoryCount} sub-{subCategoryCount === 1 ? 'category' : 'categories'}
                                                </div>
                                            </div>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => navigate(`/admin/categories/${category.id}/subcategories`)}
                                            >
                                                Manage Sub-categories
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
