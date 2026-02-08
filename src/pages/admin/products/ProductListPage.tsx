import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, MoreVertical, Edit2, Trash2, Eye, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useProductManagement } from '@/contexts/ProductManagementContext';
import { ProductStatus } from '@/types/product';
import { toast } from 'sonner';

export default function ProductListPage() {
    const navigate = useNavigate();
    const { products, filterProducts, deleteProduct, categories, brands } = useProductManagement();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<ProductStatus | 'ALL'>('ALL');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [brandFilter, setBrandFilter] = useState('ALL');
    const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');

    const filteredProducts = filterProducts({
        search: searchTerm,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        categoryId: categoryFilter === 'ALL' ? undefined : categoryFilter,
        brandId: brandFilter === 'ALL' ? undefined : brandFilter,
        stockStatus: stockFilter === 'ALL' ? undefined : stockFilter,
    });

    const handleDelete = async (productId: string, productName: string) => {
        if (confirm(`Are you sure you want to delete "${productName}"?`)) {
            const result = await deleteProduct(productId);
            if (result.success) {
                toast.success('Product deleted successfully');
            }
        }
    };

    const getStatusBadge = (status: ProductStatus) => {
        const styles = {
            DRAFT: 'bg-slate-100 text-slate-700 border-slate-200',
            PUBLISHED: 'bg-green-100 text-green-700 border-green-200',
            HIDDEN: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            ARCHIVED: 'bg-red-100 text-red-700 border-red-200',
        };
        return styles[status];
    };

    const getStockStatus = (product: typeof products[0]) => {
        const totalStock = product.totalStock || 0;
        if (totalStock === 0) return { label: 'Out of Stock', color: 'text-red-600' };
        if (totalStock <= product.lowStockThreshold) return { label: 'Low Stock', color: 'text-yellow-600' };
        return { label: 'In Stock', color: 'text-green-600' };
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Products</h1>
                            <p className="text-sm text-slate-500 mt-1">Manage your product catalog</p>
                        </div>
                        <Button
                            onClick={() => navigate('/admin/products/add')}
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Product
                        </Button>
                    </div>

                    {/* Filters */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="md:col-span-2 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ProductStatus | 'ALL')}>
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Status</SelectItem>
                                <SelectItem value="DRAFT">Draft</SelectItem>
                                <SelectItem value="PUBLISHED">Published</SelectItem>
                                <SelectItem value="HIDDEN">Hidden</SelectItem>
                                <SelectItem value="ARCHIVED">Archived</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Categories</SelectItem>
                                {categories?.filter(c => !c.parentId).map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={stockFilter} onValueChange={(value) => setStockFilter(value as typeof stockFilter)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Stock" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Stock</SelectItem>
                                <SelectItem value="IN_STOCK">In Stock</SelectItem>
                                <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
                                <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    {/* Stats Bar */}
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <p className="text-sm text-slate-600">
                            Showing <span className="font-medium text-slate-900">{filteredProducts?.length || 0}</span> of{' '}
                            <span className="font-medium text-slate-900">{products?.length || 0}</span> products
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                            <span className="text-slate-600">
                                Published: <span className="font-medium text-green-600">
                                    {products?.filter(p => p.status === 'PUBLISHED').length || 0}
                                </span>
                            </span>
                            <span className="text-slate-600">
                                Draft: <span className="font-medium text-slate-600">
                                    {products?.filter(p => p.status === 'DRAFT').length || 0}
                                </span>
                            </span>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                                        Stock
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                                        Variants
                                    </th>
                                    <th className="text-right px-6 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Filter className="h-12 w-12 text-slate-300" />
                                                <p className="text-slate-500">No products found</p>
                                                <p className="text-sm text-slate-400">Try adjusting your filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map((product) => {
                                        const category = categories?.find(c => c.id === product.categoryId);
                                        const stockStatus = getStockStatus(product);
                                        const featuredImage = product.images?.find(img => img.isFeatured) || product.images?.[0];

                                        return (
                                            <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {featuredImage ? (
                                                            <img
                                                                src={featuredImage.url}
                                                                alt={product.name}
                                                                className="h-12 w-12 rounded-lg object-cover border border-slate-200"
                                                            />
                                                        ) : (
                                                            <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center">
                                                                <span className="text-slate-400 text-xs">No image</span>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-medium text-slate-900">{product.name}</p>
                                                            <p className="text-sm text-slate-500 line-clamp-1">{product.shortDescription}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {category?.name || 'Uncategorized'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        {product.variants?.length > 0 ? (
                                                            <>
                                                                <span className="text-sm font-medium text-slate-900">
                                                                    GHS {Math.min(...product.variants.map(v => v.price)).toFixed(2)}
                                                                </span>
                                                                <span className="text-xs text-slate-500">
                                                                    - GHS {Math.max(...product.variants.map(v => v.price)).toFixed(2)}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="text-sm font-medium text-slate-900">
                                                                GHS {product.basePrice?.toFixed(2) || '0.00'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-sm font-medium ${stockStatus.color}`}>
                                                        {product.totalStock || 0}
                                                    </span>
                                                    <p className="text-xs text-slate-500">{stockStatus.label}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant="outline" className={getStatusBadge(product.status)}>
                                                        {product.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {product.variants?.length || 0} variant{product.variants?.length !== 1 ? 's' : ''}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => navigate(`/admin/products/edit/${product.id}`)}>
                                                                <Edit2 className="h-4 w-4 mr-2" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => navigate(`/products/${product.slug}`)}>
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                View
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => toast.info('Duplicate feature coming soon')}>
                                                                <Copy className="h-4 w-4 mr-2" />
                                                                Duplicate
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(product.id, product.name)}
                                                                className="text-red-600 focus:text-red-600"
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
