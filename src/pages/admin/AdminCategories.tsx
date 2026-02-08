import { useState, useEffect } from 'react';
import {
    Search, Plus, Edit, Trash2, Eye, EyeOff, ChevronRight, ChevronDown,
    FolderTree, Image, Tag, MoreVertical, GripVertical, Star, TrendingUp,
    Home, Menu, ArrowDown, Save, X, Upload, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Category as IndexCategory, CategoryStatus, CategoryDisplayLocation, Brand as IndexBrand, BrandStatus } from '@/types';
import { Category, Brand } from '@/types/product';
import { toast } from 'sonner';
import { useProductManagement } from '@/contexts/ProductManagementContext';

interface CategoryFormData {
    name: string;
    slug: string;
    description: string;
    parentId: string;
    status: CategoryStatus;
    displayOrder: number;
    image: string;
    icon: string;
    bannerImage: string;
    isFeatured: boolean;
    isTrending: boolean;
    displayLocations: CategoryDisplayLocation[];
    metaTitle: string;
    metaDescription: string;
    keywords: string;
}

interface BrandFormData {
    name: string;
    slug: string;
    description: string;
    logo: string;
    categoryIds: string[];
    status: BrandStatus;
}

const defaultCategoryForm: CategoryFormData = {
    name: '',
    slug: '',
    description: '',
    parentId: '',
    status: 'ACTIVE',
    displayOrder: 0,
    image: '',
    icon: '',
    bannerImage: '',
    isFeatured: false,
    isTrending: false,
    displayLocations: [],
    metaTitle: '',
    metaDescription: '',
    keywords: '',
};

const defaultBrandForm: BrandFormData = {
    name: '',
    slug: '',
    description: '',
    logo: '',
    categoryIds: [],
    status: 'ACTIVE',
};

export default function AdminCategories() {
    // Use ProductManagementContext for backend data
    const {
        categories: contextCategories,
        brands: contextBrands,
        createCategory,
        updateCategory,
        deleteCategory,
        createBrand,
        updateBrand,
        deleteBrand,
        isLoading
    } = useProductManagement();

    const [activeTab, setActiveTab] = useState('categories');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Categories state
    const [categoriesList, setCategoriesList] = useState<Category[]>([]);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [categoryFormOpen, setCategoryFormOpen] = useState(false);
    const [categoryForm, setCategoryForm] = useState<CategoryFormData>(defaultCategoryForm);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

    // Brands state  
    const [brandsList, setBrandsList] = useState<Brand[]>([]);
    const [brandFormOpen, setBrandFormOpen] = useState(false);
    const [brandForm, setBrandForm] = useState<BrandFormData>(defaultBrandForm);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

    // Transform flat categories into tree structure
    const organizeCategoriesIntoTree = (categories: Category[]): Category[] => {
        const categoryMap = new Map<string, Category>();
        const rootCategories: Category[] = [];

        // First pass: create map of all categories
        categories.forEach(cat => {
            categoryMap.set(cat.id, { ...cat, children: [] });
        });

        // Second pass: build tree structure
        categories.forEach(cat => {
            const category = categoryMap.get(cat.id)!;
            if (cat.parentId) {
                const parent = categoryMap.get(cat.parentId);
                if (parent) {
                    parent.children = parent.children || [];
                    parent.children.push(category);
                }
            } else {
                rootCategories.push(category);
            }
        });

        return rootCategories;
    };

    // Sync with context data
    useEffect(() => {
        setCategoriesList(organizeCategoriesIntoTree(contextCategories));
    }, [contextCategories]);

    useEffect(() => {
        setBrandsList(contextBrands);
    }, [contextBrands]);

    // Flatten categories for easier searching
    const flattenCategories = (cats: Category[], parentName = ''): (Category & { level: number; fullPath: string })[] => {
        const result: (Category & { level: number; fullPath: string })[] = [];
        cats.forEach(cat => {
            const fullPath = parentName ? `${parentName} > ${cat.name}` : cat.name;
            result.push({ ...cat, level: parentName ? 1 : 0, fullPath });
            if (cat.children) {
                result.push(...flattenCategories(cat.children, fullPath));
            }
        });
        return result;
    };

    const allCategories = flattenCategories(categoriesList);

    const filteredCategories = allCategories.filter(cat => {
        const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || cat.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const filteredBrands = brandsList.filter(brand => {
        const matchesSearch = brand.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || brand.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Generate slug from name
    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    // Category CRUD operations
    const handleCreateCategory = () => {
        setEditingCategory(null);
        setCategoryForm(defaultCategoryForm);
        setCategoryFormOpen(true);
    };

    const handleEditCategory = (category: Category) => {
        setEditingCategory(category);
        setCategoryForm({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
            parentId: category.parentId || '',
            status: category.status,
            displayOrder: category.displayOrder,
            image: category.image || '',
            icon: category.icon || '',
            bannerImage: category.bannerImage || '',
            isFeatured: category.isFeatured,
            isTrending: category.isTrending,
            displayLocations: category.displayLocations,
            metaTitle: category.seo?.metaTitle || '',
            metaDescription: category.seo?.metaDescription || '',
            keywords: category.seo?.keywords?.join(', ') || '',
        });
        setCategoryFormOpen(true);
    };

    const handleSaveCategory = async () => {
        const categoryData: Partial<Category> = {
            name: categoryForm.name,
            slug: categoryForm.slug || generateSlug(categoryForm.name),
            description: categoryForm.description,
            parentId: categoryForm.parentId || undefined,
            displayOrder: categoryForm.displayOrder,
            sortOrder: categoryForm.displayOrder, // Set both for compatibility
            image: categoryForm.image,
            imageUrl: categoryForm.image, // Also set imageUrl
            icon: categoryForm.icon,
            bannerImage: categoryForm.bannerImage,
            isFeatured: categoryForm.isFeatured,
            isTrending: categoryForm.isTrending,
            displayLocations: categoryForm.displayLocations,
            isActive: categoryForm.status === 'ACTIVE',
            status: categoryForm.status,
            seo: {
                metaTitle: categoryForm.metaTitle,
                metaDescription: categoryForm.metaDescription,
                keywords: categoryForm.keywords.split(',').map(k => k.trim()).filter(Boolean),
            },
        };

        if (editingCategory) {
            // Update existing
            await updateCategory(editingCategory.id, categoryData);
        } else {
            // Create new
            await createCategory(categoryData as Omit<Category, 'id'>);
        }

        setCategoryFormOpen(false);
        setCategoryForm(defaultCategoryForm);
        setEditingCategory(null);
    };

    const updateCategoryInTree = (cats: Category[], updated: Category): Category[] => {
        return cats.map(cat => {
            if (cat.id === updated.id) {
                return { ...updated, children: cat.children };
            }
            if (cat.children) {
                return { ...cat, children: updateCategoryInTree(cat.children, updated) };
            }
            return cat;
        });
    };

    const addChildCategory = (cats: Category[], parentId: string, newCat: Category): Category[] => {
        return cats.map(cat => {
            if (cat.id === parentId) {
                return { ...cat, children: [...(cat.children || []), newCat] };
            }
            if (cat.children) {
                return { ...cat, children: addChildCategory(cat.children, parentId, newCat) };
            }
            return cat;
        });
    };

    const handleDeleteCategory = (category: Category) => {
        const productCount = category.productCount || 0;
        if (productCount > 0) {
            toast.error(`Cannot delete category with ${productCount} products. Please reassign products first.`);
            return;
        }
        setCategoryToDelete(category);
        setDeleteConfirmOpen(true);
    };

    const confirmDeleteCategory = async () => {
        if (categoryToDelete) {
            await deleteCategory(categoryToDelete.id);
            setDeleteConfirmOpen(false);
            setCategoryToDelete(null);
        }
    };

    const deleteCategoryFromTree = (cats: Category[], id: string): Category[] => {
        return cats.filter(cat => cat.id !== id).map(cat => {
            if (cat.children) {
                return { ...cat, children: deleteCategoryFromTree(cat.children, id) };
            }
            return cat;
        });
    };

    const toggleCategoryStatus = async (category: Category) => {
        const newStatus = category.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        await updateCategory(category.id, {
            status: newStatus,
            isActive: newStatus === 'ACTIVE'
        } as Partial<Category>);
    };

    // Brand CRUD operations
    const handleCreateBrand = () => {
        setEditingBrand(null);
        setBrandForm(defaultBrandForm);
        setBrandFormOpen(true);
    };

    const handleEditBrand = (brand: Brand) => {
        setEditingBrand(brand);
        setBrandForm({
            name: brand.name,
            slug: brand.slug,
            description: brand.description || '',
            logo: brand.logo || brand.logoUrl || '',
            categoryIds: brand.categoryIds || [],
            status: brand.status || (brand.isActive ? 'ACTIVE' : 'INACTIVE'),
        });
        setBrandFormOpen(true);
    };

    const handleSaveBrand = async () => {
        const brandData: Partial<Brand> = {
            name: brandForm.name,
            slug: brandForm.slug || generateSlug(brandForm.name),
            description: brandForm.description,
            logo: brandForm.logo,
            logoUrl: brandForm.logo, // Also set logoUrl
            categoryIds: brandForm.categoryIds,
            status: brandForm.status,
            isActive: brandForm.status === 'ACTIVE',
        };

        if (editingBrand) {
            await updateBrand(editingBrand.id, brandData);
        } else {
            await createBrand(brandData as Omit<Brand, 'id'>);
        }

        setBrandFormOpen(false);
        setBrandForm(defaultBrandForm);
        setEditingBrand(null);
    };

    const toggleBrandStatus = async (brand: Brand) => {
        const newStatus = brand.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        await updateBrand(brand.id, {
            status: newStatus,
            isActive: newStatus === 'ACTIVE'
        } as Partial<Brand>);
    };

    const toggleExpand = (catId: string) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(catId)) {
                newSet.delete(catId);
            } else {
                newSet.add(catId);
            }
            return newSet;
        });
    };

    const stats = {
        totalCategories: allCategories.length,
        activeCategories: allCategories.filter(c => c.status === 'ACTIVE').length,
        totalBrands: brandsList.length,
        activeBrands: brandsList.filter(b => b.status === 'ACTIVE').length,
    };

    const renderCategoryTree = (cats: Category[], level = 0) => {
        return cats.map(cat => {
            const hasChildren = cat.children && cat.children.length > 0;
            const isExpanded = expandedCategories.has(cat.id);
            const productCount = cat.productCount || 0;

            return (
                <div key={cat.id}>
                    <div
                        className={`flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group ${level > 0 ? 'ml-6' : ''}`}
                        style={{ marginLeft: level * 24 }}
                    >
                        <div className="flex items-center gap-2 flex-1">
                            {hasChildren ? (
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-slate-900" onClick={() => toggleExpand(cat.id)}>
                                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </Button>
                            ) : (
                                <div className="w-6" />
                            )}

                            <div className="h-10 w-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                                {cat.image ? (
                                    <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center">
                                        <FolderTree className="h-5 w-5 text-slate-400" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="font-medium text-slate-900 truncate">{cat.name}</p>
                                    {cat.isFeatured && <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />}
                                    {cat.isTrending && <TrendingUp className="h-4 w-4 text-green-500" />}
                                </div>
                                <p className="text-xs text-slate-500">{productCount} products • {cat.slug}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className={
                                cat.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border-0' :
                                    cat.status === 'INACTIVE' ? 'bg-yellow-100 text-yellow-700 border-0' :
                                        'bg-slate-100 text-slate-700 border-0'
                            }>
                                {cat.status}
                            </Badge>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-slate-900">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-white border-slate-200 shadow-md">
                                    <DropdownMenuItem onClick={() => handleEditCategory(cat)} className="text-slate-700 focus:bg-slate-50">
                                        <Edit className="h-4 w-4 mr-2" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => toggleCategoryStatus(cat)} className="text-slate-700 focus:bg-slate-50">
                                        {cat.status === 'ACTIVE' ? (
                                            <><EyeOff className="h-4 w-4 mr-2" /> Deactivate</>
                                        ) : (
                                            <><Eye className="h-4 w-4 mr-2" /> Activate</>
                                        )}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-slate-100" />
                                    <DropdownMenuItem onClick={() => handleDeleteCategory(cat)} className="text-red-600 focus:bg-red-50">
                                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {hasChildren && isExpanded && (
                        <div className="border-l border-slate-200 ml-6">
                            {renderCategoryTree(cat.children!, level + 1)}
                        </div>
                    )}
                </div>
            );
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Categories & Brands</h1>
                    <p className="text-slate-500">Manage your product catalog structure</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <FolderTree className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{stats.totalCategories}</p>
                            <p className="text-sm text-slate-500">Categories</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                            <Eye className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{stats.activeCategories}</p>
                            <p className="text-sm text-slate-500">Active</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                            <Tag className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{stats.totalBrands}</p>
                            <p className="text-sm text-slate-500">Brands</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
                            <Tag className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{stats.activeBrands}</p>
                            <p className="text-sm text-slate-500">Active Brands</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="flex items-center justify-between">
                    <TabsList className="bg-slate-100 border border-slate-200">
                        <TabsTrigger value="categories" className="data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm">Categories</TabsTrigger>
                        <TabsTrigger value="brands" className="data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm">Brands</TabsTrigger>
                    </TabsList>

                    <Button onClick={activeTab === 'categories' ? handleCreateCategory : handleCreateBrand} className="gap-2 bg-orange-600 hover:bg-orange-700 text-white">
                        <Plus className="h-4 w-4" />
                        Add {activeTab === 'categories' ? 'Category' : 'Brand'}
                    </Button>
                </div>

                {/* Filters */}
                <Card className="bg-white border-slate-200 shadow-sm mt-4">
                    <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder={`Search ${activeTab}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-slate-50 border-slate-200 text-slate-900"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[150px] bg-slate-50 border-slate-200 text-slate-900">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="INACTIVE">Inactive</SelectItem>
                                {activeTab === 'categories' && <SelectItem value="ARCHIVED">Archived</SelectItem>}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                {/* Categories Tab */}
                <TabsContent value="categories" className="mt-4">
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardContent className="p-4">
                            {searchQuery ? (
                                <div className="space-y-2">
                                    {filteredCategories.map(cat => (
                                        <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-slate-200 overflow-hidden">
                                                    {cat.image ? (
                                                        <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center">
                                                            <FolderTree className="h-5 w-5 text-slate-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{cat.name}</p>
                                                    <p className="text-xs text-slate-500">{cat.fullPath}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className={cat.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border-0' : 'bg-yellow-100 text-yellow-700 border-0'}>
                                                    {cat.status}
                                                </Badge>
                                                <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900" onClick={() => handleEditCategory(cat)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <ScrollArea className="h-[500px]">
                                    {renderCategoryTree(categoriesList)}
                                </ScrollArea>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Brands Tab */}
                <TabsContent value="brands" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredBrands.map(brand => (
                            <Card key={brand.id} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
                                            {brand.logo ? (
                                                <img src={brand.logo} alt={brand.name} className="h-full w-full object-contain p-2" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center">
                                                    <Tag className="h-6 w-6 text-slate-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-medium text-slate-900 truncate">{brand.name}</h3>
                                                <Badge variant="outline" className={brand.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border-0' : 'bg-yellow-100 text-yellow-700 border-0'}>
                                                    {brand.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-slate-500 truncate">{brand.description || 'No description'}</p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {brand.categoryIds?.length || 0} categories
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
                                        <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900" onClick={() => handleEditBrand(brand)}>
                                            <Edit className="h-4 w-4 mr-1" /> Edit
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900" onClick={() => toggleBrandStatus(brand)}>
                                            {brand.status === 'ACTIVE' ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                                            {brand.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Category Form Dialog */}
            <Dialog open={categoryFormOpen} onOpenChange={setCategoryFormOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-slate-200 text-slate-900">
                    <DialogHeader>
                        <DialogTitle className="text-slate-900">{editingCategory ? 'Edit Category' : 'Create Category'}</DialogTitle>
                        <DialogDescription className="text-slate-500">
                            {editingCategory ? 'Update category details' : 'Add a new category to your catalog'}
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="basic" className="mt-4">
                        <TabsList className="bg-slate-100 border border-slate-200">
                            <TabsTrigger value="basic" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Basic Info</TabsTrigger>
                            <TabsTrigger value="display" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Display</TabsTrigger>
                            <TabsTrigger value="seo" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">SEO</TabsTrigger>
                        </TabsList>

                        <TabsContent value="basic" className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-700">Category Name *</Label>
                                    <Input
                                        value={categoryForm.name}
                                        onChange={(e) => {
                                            setCategoryForm(prev => ({
                                                ...prev,
                                                name: e.target.value,
                                                slug: generateSlug(e.target.value),
                                            }));
                                        }}
                                        className="bg-white border-slate-200 text-slate-900"
                                        placeholder="e.g., Laptops"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-700">Slug</Label>
                                    <Input
                                        value={categoryForm.slug}
                                        onChange={(e) => setCategoryForm(prev => ({ ...prev, slug: e.target.value }))}
                                        className="bg-slate-50 border-slate-200 text-slate-600"
                                        placeholder="auto-generated"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700">Parent Category</Label>
                                <Select value={categoryForm.parentId || 'none'} onValueChange={(v) => setCategoryForm(prev => ({ ...prev, parentId: v === 'none' ? '' : v }))}>
                                    <SelectTrigger className="bg-white border-slate-200 text-slate-900">
                                        <SelectValue placeholder="None (Root Category)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None (Root Category)</SelectItem>
                                        {allCategories.filter(c => c.id !== editingCategory?.id).map(cat => (
                                            <SelectItem key={cat.id} value={cat.id}>{cat.fullPath}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700">Description</Label>
                                <Textarea
                                    value={categoryForm.description}
                                    onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                                    className="bg-white border-slate-200 text-slate-900"
                                    placeholder="Category description..."
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-700">Status</Label>
                                    <Select value={categoryForm.status} onValueChange={(v: CategoryStatus) => setCategoryForm(prev => ({ ...prev, status: v }))}>
                                        <SelectTrigger className="bg-white border-slate-200 text-slate-900">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ACTIVE">Active</SelectItem>
                                            <SelectItem value="INACTIVE">Inactive</SelectItem>
                                            <SelectItem value="ARCHIVED">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-700">Display Order</Label>
                                    <Input
                                        type="number"
                                        value={categoryForm.displayOrder}
                                        onChange={(e) => setCategoryForm(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                                        className="bg-white border-slate-200 text-slate-900"
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="display" className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label className="text-slate-700">Category Image URL</Label>
                                <Input
                                    value={categoryForm.image}
                                    onChange={(e) => setCategoryForm(prev => ({ ...prev, image: e.target.value }))}
                                    className="bg-white border-slate-200 text-slate-900"
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700">Banner Image URL</Label>
                                <Input
                                    value={categoryForm.bannerImage}
                                    onChange={(e) => setCategoryForm(prev => ({ ...prev, bannerImage: e.target.value }))}
                                    className="bg-white border-slate-200 text-slate-900"
                                    placeholder="https://..."
                                />
                            </div>

                            <Separator className="bg-slate-200" />

                            <div className="space-y-4">
                                <Label className="text-slate-700">Display Locations</Label>
                                <div className="flex flex-wrap gap-4">
                                    {(['HOMEPAGE', 'NAVIGATION', 'FOOTER'] as CategoryDisplayLocation[]).map(loc => (
                                        <div key={loc} className="flex items-center gap-2">
                                            <Checkbox
                                                checked={categoryForm.displayLocations.includes(loc)}
                                                onCheckedChange={(checked) => {
                                                    setCategoryForm(prev => ({
                                                        ...prev,
                                                        displayLocations: checked
                                                            ? [...prev.displayLocations, loc]
                                                            : prev.displayLocations.filter(l => l !== loc)
                                                    }));
                                                }}
                                                className="border-slate-300"
                                            />
                                            <Label className="font-normal text-slate-700">
                                                {loc === 'HOMEPAGE' ? 'Homepage' : loc === 'NAVIGATION' ? 'Navigation Menu' : 'Footer'}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator className="bg-slate-200" />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                                    <div className="flex items-center gap-2">
                                        <Star className="h-4 w-4 text-yellow-500" />
                                        <Label className="font-normal text-slate-700">Featured Category</Label>
                                    </div>
                                    <Switch
                                        checked={categoryForm.isFeatured}
                                        onCheckedChange={(checked) => setCategoryForm(prev => ({ ...prev, isFeatured: checked }))}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                        <Label className="font-normal text-slate-700">Trending Category</Label>
                                    </div>
                                    <Switch
                                        checked={categoryForm.isTrending}
                                        onCheckedChange={(checked) => setCategoryForm(prev => ({ ...prev, isTrending: checked }))}
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="seo" className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label className="text-slate-700">Meta Title</Label>
                                <Input
                                    value={categoryForm.metaTitle}
                                    onChange={(e) => setCategoryForm(prev => ({ ...prev, metaTitle: e.target.value }))}
                                    className="bg-white border-slate-200 text-slate-900"
                                    placeholder="SEO title for search engines"
                                    maxLength={60}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700">Meta Description</Label>
                                <Textarea
                                    value={categoryForm.metaDescription}
                                    onChange={(e) => setCategoryForm(prev => ({ ...prev, metaDescription: e.target.value }))}
                                    className="bg-white border-slate-200 text-slate-900"
                                    placeholder="SEO description for search engines"
                                    rows={3}
                                    maxLength={160}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700">Keywords (comma-separated)</Label>
                                <Input
                                    value={categoryForm.keywords}
                                    onChange={(e) => setCategoryForm(prev => ({ ...prev, keywords: e.target.value }))}
                                    className="bg-white border-slate-200 text-slate-900"
                                    placeholder="laptop, computer, electronics"
                                />
                            </div>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter className="mt-6">
                        <Button variant="outline" onClick={() => setCategoryFormOpen(false)} className="border-slate-200 text-slate-600 hover:bg-slate-50">
                            Cancel
                        </Button>
                        <Button onClick={handleSaveCategory} disabled={!categoryForm.name} className="bg-orange-600 hover:bg-orange-700 text-white">
                            <Save className="h-4 w-4 mr-2" />
                            {editingCategory ? 'Update' : 'Create'} Category
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Brand Form Dialog */}
            <Dialog open={brandFormOpen} onOpenChange={setBrandFormOpen}>
                <DialogContent className="max-w-lg bg-white border-slate-200 text-slate-900">
                    <DialogHeader>
                        <DialogTitle className="text-slate-900">{editingBrand ? 'Edit Brand' : 'Create Brand'}</DialogTitle>
                        <DialogDescription className="text-slate-500">
                            {editingBrand ? 'Update brand details' : 'Add a new brand to your catalog'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-700">Brand Name *</Label>
                                <Input
                                    value={brandForm.name}
                                    onChange={(e) => {
                                        setBrandForm(prev => ({
                                            ...prev,
                                            name: e.target.value,
                                            slug: generateSlug(e.target.value),
                                        }));
                                    }}
                                    className="bg-white border-slate-200 text-slate-900"
                                    placeholder="e.g., Apple"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-700">Slug</Label>
                                <Input
                                    value={brandForm.slug}
                                    onChange={(e) => setBrandForm(prev => ({ ...prev, slug: e.target.value }))}
                                    className="bg-slate-50 border-slate-200 text-slate-600"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-700">Logo URL</Label>
                            <Input
                                value={brandForm.logo}
                                onChange={(e) => setBrandForm(prev => ({ ...prev, logo: e.target.value }))}
                                className="bg-white border-slate-200 text-slate-900"
                                placeholder="https://..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-700">Description</Label>
                            <Textarea
                                value={brandForm.description}
                                onChange={(e) => setBrandForm(prev => ({ ...prev, description: e.target.value }))}
                                className="bg-white border-slate-200 text-slate-900"
                                rows={2}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-700">Associated Categories</Label>
                            <div className="max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-lg space-y-2 border border-slate-200">
                                {allCategories.map(cat => (
                                    <div key={cat.id} className="flex items-center gap-2">
                                        <Checkbox
                                            checked={brandForm.categoryIds.includes(cat.id)}
                                            onCheckedChange={(checked) => {
                                                setBrandForm(prev => ({
                                                    ...prev,
                                                    categoryIds: checked
                                                        ? [...prev.categoryIds, cat.id]
                                                        : prev.categoryIds.filter(id => id !== cat.id)
                                                }));
                                            }}
                                            className="border-slate-300"
                                        />
                                        <Label className="font-normal text-sm text-slate-700">{cat.fullPath}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-700">Status</Label>
                            <Select value={brandForm.status} onValueChange={(v: BrandStatus) => setBrandForm(prev => ({ ...prev, status: v }))}>
                                <SelectTrigger className="bg-white border-slate-200 text-slate-900">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter className="mt-6">
                        <Button variant="outline" onClick={() => setBrandFormOpen(false)} className="border-slate-200 text-slate-600 hover:bg-slate-50">
                            Cancel
                        </Button>
                        <Button onClick={handleSaveBrand} disabled={!brandForm.name} className="bg-orange-600 hover:bg-orange-700 text-white">
                            <Save className="h-4 w-4 mr-2" />
                            {editingBrand ? 'Update' : 'Create'} Brand
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <DialogContent className="bg-white border-slate-200 text-slate-900">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            Delete Category
                        </DialogTitle>
                        <DialogDescription className="text-slate-500">
                            Are you sure you want to delete "{categoryToDelete?.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} className="border-slate-200 text-slate-600 hover:bg-slate-50">
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDeleteCategory} className="bg-red-600 hover:bg-red-700 text-white">
                            Delete Category
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
