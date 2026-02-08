import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Product, ProductFormData, ProductFilters, ProductImage, ProductVariant, BulkProductUpdate } from '@/types/product';
import { Category, Brand } from '@/types/product';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

interface ProductManagementContextType {
    // Products
    products: Product[];
    categories: Category[];
    brands: Brand[];

    // CRUD Operations
    createProduct: (data: ProductFormData) => Promise<{ success: boolean; productId?: string; error?: string }>;
    updateProduct: (id: string, data: Partial<ProductFormData>) => Promise<{ success: boolean; error?: string }>;
    deleteProduct: (id: string) => Promise<{ success: boolean; error?: string }>;
    getProduct: (id: string) => Product | undefined;

    // Image Management
    uploadImages: (files: File[]) => Promise<{ success: boolean; images?: ProductImage[]; error?: string }>;
    deleteImage: (imageId: string) => Promise<{ success: boolean; error?: string }>;
    reorderImages: (productId: string, imageIds: string[]) => Promise<{ success: boolean; error?: string }>;
    setFeaturedImage: (productId: string, imageId: string) => Promise<{ success: boolean; error?: string }>;

    // Variant Management
    addVariant: (productId: string, variant: Omit<ProductVariant, 'id'>) => Promise<{ success: boolean; variantId?: string; error?: string }>;
    updateVariant: (productId: string, variantId: string, data: Partial<ProductVariant>) => Promise<{ success: boolean; error?: string }>;
    deleteVariant: (productId: string, variantId: string) => Promise<{ success: boolean; error?: string }>;
    bulkUpdateVariants: (productId: string, updates: Array<{ variantId: string; data: Partial<ProductVariant> }>) => Promise<{ success: boolean; error?: string }>;

    // Category & Brand Management
    createCategory: (data: Omit<Category, 'id'>) => Promise<{ success: boolean; categoryId?: string; error?: string }>;
    updateCategory: (id: string, data: Partial<Category>) => Promise<{ success: boolean; error?: string }>;
    deleteCategory: (id: string) => Promise<{ success: boolean; error?: string }>;

    createBrand: (data: Omit<Brand, 'id'>) => Promise<{ success: boolean; brandId?: string; error?: string }>;
    updateBrand: (id: string, data: Partial<Brand>) => Promise<{ success: boolean; error?: string }>;
    deleteBrand: (id: string) => Promise<{ success: boolean; error?: string }>;

    // Bulk Operations
    bulkUpdateProducts: (update: BulkProductUpdate) => Promise<{ success: boolean; updatedCount?: number; error?: string }>;

    // Filtering & Search
    filterProducts: (filters: ProductFilters) => Product[];

    // Loading States
    isLoading: boolean;
}

const ProductManagementContext = createContext<ProductManagementContextType | undefined>(undefined);

export function ProductManagementProvider({ children }: { children: ReactNode }) {
    const { token } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    // Helper: Generate unique ID
    const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Helper: Transform backend product data to frontend format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformProduct = useCallback((product: any): Product => {
        return {
            ...product,
            id: String(product.id),
            categoryId: product.category_id ? String(product.category_id) : '',
            subCategoryId: product.sub_category_id ? String(product.sub_category_id) : '',
            brandId: product.brand_id ? String(product.brand_id) : '',
            shortDescription: product.short_description || '',
            fullDescription: product.full_description || '',
            basePrice: Number(product.base_price) || 0,
            discountPrice: product.discount_price ? Number(product.discount_price) : undefined,
            taxEnabled: product.tax_enabled || false,
            stockTracking: product.stock_tracking || true,
            totalStock: Number(product.total_stock) || 0,
            lowStockThreshold: Number(product.low_stock_threshold) || 10,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            images: (product.images || []).map((img: any, index: number) => {
                // Convert relative path to absolute URL if needed
                let imageUrl = img.image_url || '';
                if (imageUrl && imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
                    const apiBase = apiUrl.replace('/api', '');
                    imageUrl = `${apiBase}${imageUrl}`;
                }
                return {
                    id: String(img.id),
                    url: imageUrl,
                    sortOrder: img.sort_order || index,
                    isFeatured: img.is_featured || false,
                    createdAt: new Date(img.created_at),
                };
            }),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            variants: (product.variants || []).map((v: any) => ({
                id: String(v.id),
                sku: v.sku,
                color: v.color,
                storage: v.storage,
                price: Number(v.price) || 0,
                discountPrice: v.discount_price ? Number(v.discount_price) : undefined,
                stock: Number(v.stock) || 0,
                status: v.status || 'ACTIVE',
            })),
            createdAt: new Date(product.created_at),
            updatedAt: new Date(product.updated_at),
        };
    }, [apiUrl]);

    // Helper: Generate SKU
    const generateSKU = (productName: string, variant?: { color?: string; storage?: string }) => {
        const prefix = productName.substring(0, 3).toUpperCase();
        const colorCode = variant?.color?.substring(0, 2).toUpperCase() || 'XX';
        const storageCode = variant?.storage?.replace(/[^0-9]/g, '') || '00';
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}-${colorCode}${storageCode}-${random}`;
    };

    // Load data from backend on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);

                const [productsRes, categoriesRes, brandsRes] = await Promise.all([
                    fetch(`${apiUrl}/products`),
                    fetch(`${apiUrl}/products/categories`),
                    fetch(`${apiUrl}/products/brands`)
                ]);

                if (productsRes.ok) {
                    const data = await productsRes.json();
                    const transformedProducts = (data.products || []).map(transformProduct);
                    setProducts(transformedProducts);
                }
                if (categoriesRes.ok) {
                    const data = await categoriesRes.json();
                    const categoryList = (data.categories || []).map((cat: Partial<Category>) => {
                        const raw = cat as unknown as Record<string, unknown>;
                        return {
                            ...cat,
                            id: raw['id'] ? String(raw['id']) : undefined,
                            parentId: raw['parent_id'] ? String(raw['parent_id']) : undefined,
                            isActive: raw['status'] === 'ACTIVE' || raw['isActive'] === true,
                            displayOrder: (raw['display_order'] as number) || (raw['displayOrder'] as number) || 0,
                            sortOrder: (raw['sort_order'] as number) || (raw['sortOrder'] as number) || (raw['display_order'] as number) || (raw['displayOrder'] as number) || 0,
                        } as Category;
                    });
                    setCategories(categoryList);
                }
                if (brandsRes.ok) {
                    const data = await brandsRes.json();
                    const brandList = (data.brands || []).map((brand: Partial<Brand>) => {
                        const raw = brand as unknown as Record<string, unknown>;
                        return {
                            ...brand,
                            id: raw['id'] ? String(raw['id']) : undefined,
                            isActive: raw['status'] === 'ACTIVE' || raw['isActive'] === true,
                        } as Brand;
                    });
                    setBrands(brandList);
                }
            } catch (error) {
                console.error('Failed to load product data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [apiUrl, transformProduct]);

    // Create Product
    const createProduct = useCallback(async (data: ProductFormData): Promise<{ success: boolean; productId?: string; error?: string }> => {
        setIsLoading(true);
        try {
            const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

            // Convert image files to base64
            const imageBase64 = await Promise.all(
                (data.images as File[]).map(file =>
                    new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result as string);
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    })
                )
            );

            const payload = {
                name: data.name,
                slug,
                categoryId: data.categoryId,
                subCategoryId: data.subCategoryId,
                brandId: data.brandId,
                shortDescription: data.shortDescription,
                fullDescription: data.fullDescription,
                tags: data.tags,
                basePrice: data.basePrice,
                discountPrice: data.discountPrice,
                taxEnabled: data.taxEnabled,
                stockTracking: data.stockTracking,
                lowStockThreshold: data.lowStockThreshold,
                status: data.status,
                variants: data.variants.map(v => ({
                    ...v,
                    sku: v.sku || generateSKU(data.name, v),
                })),
                images: imageBase64,
            };

            const response = await fetch(`${apiUrl}/products`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const text = await response.text().catch(() => null);
                console.error('Create product response error body:', text);
                throw new Error('Failed to create product');
            }

            const result = await response.json();
            const newProduct = result.product || result.data;
            const transformedProduct = transformProduct(newProduct);

            setProducts(prev => [...prev, transformedProduct]);
            toast.success('Product created successfully!');
            return { success: true, productId: transformedProduct.id };
        } catch (error) {
            console.error('Create product error:', error);
            toast.error('Failed to create product');
            return { success: false, error: 'Failed to create product' };
        } finally {
            setIsLoading(false);
        }
    }, [apiUrl, transformProduct]);

    // Update Product
    const updateProduct = useCallback(async (id: string, data: Partial<ProductFormData>): Promise<{ success: boolean; error?: string }> => {
        setIsLoading(true);
        try {
            const payload: Record<string, unknown> = {};

            // Process basic fields
            Object.keys(data).forEach(key => {
                if (key !== 'images' && key !== 'existingImages') {
                    payload[key] = (data as Record<string, unknown>)[key];
                }
            });

            // Process new images (Files to Base64)
            if (data.images && Array.isArray(data.images)) {
                const imageFiles = data.images.filter(img => img instanceof File) as File[];
                if (imageFiles.length > 0) {
                    const imageBase64 = await Promise.all(
                        imageFiles.map(file =>
                            new Promise<string>((resolve, reject) => {
                                const reader = new FileReader();
                                reader.onload = () => resolve(reader.result as string);
                                reader.onerror = reject;
                                reader.readAsDataURL(file);
                            })
                        )
                    );
                    payload.images = imageBase64;
                }
            }

            // Pass existing images logic (if backend supports reordering via this field or similar)
            if ('existingImages' in data) {
                // The backend might expect a specific format for existing images or just re-sending urls?
                // Based on backend code, it only inserts NEW images from `images` array (step 60 in productController).
                // It doesn't seem to delete old ones or reorder them based on update payload deeply.
                // However, let's pass it as the frontend expects.
                payload.existingImages = data.existingImages;
            }

            const response = await fetch(`${apiUrl}/products/${id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Failed to update product');
            }

            // Fetch the updated product completely to ensure we have all correct data (including processed images)
            const refreshResponse = await fetch(`${apiUrl}/products/${id}`);
            if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                const freshProduct = transformProduct(refreshData.product || refreshData.data);
                setProducts(prev => prev.map(p => p.id === id ? freshProduct : p));
            } else {
                // Fallback to returned data if refresh fails
                const result = await response.json();
                const updatedProduct = result.product || result.data;
                const transformedProduct = transformProduct(updatedProduct);
                setProducts(prev => prev.map(p => p.id === id ? transformedProduct : p));
            }
            toast.success('Product updated successfully!');
            return { success: true };
        } catch (error) {
            console.error('Update product error:', error);
            toast.error('Failed to update product');
            return { success: false, error: 'Failed to update product' };
        } finally {
            setIsLoading(false);
        }
    }, [apiUrl, transformProduct]);

    // Delete Product
    const deleteProduct = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await fetch(`${apiUrl}/products/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to delete product');
            }

            setProducts(prev => prev.filter(p => p.id !== id));
            toast.success('Product deleted successfully!');
            return { success: true };
        } catch (error) {
            console.error('Delete product error:', error);
            toast.error('Failed to delete product');
            return { success: false, error: 'Failed to delete product' };
        }
    }, [apiUrl]);

    // Get Product
    const getProduct = useCallback((id: string) => {
        return products.find(p => p.id === id);
    }, [products]);

    // Upload Images
    const uploadImages = useCallback(async (files: File[]): Promise<{ success: boolean; images?: ProductImage[]; error?: string }> => {
        try {
            const uploadedImages: ProductImage[] = files.map((file, index) => ({
                id: generateId(),
                url: URL.createObjectURL(file),
                file,
                sortOrder: index,
                isFeatured: false,
                createdAt: new Date(),
            }));

            return { success: true, images: uploadedImages };
        } catch (error) {
            console.error('Upload images error:', error);
            return { success: false, error: 'Failed to upload images' };
        }
    }, []);

    // Delete Image
    const deleteImage = useCallback(async (imageId: string): Promise<{ success: boolean; error?: string }> => {
        try {
            setProducts(prev => prev.map(p => ({
                ...p,
                images: p.images.filter(img => img.id !== imageId),
            })));
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Failed to delete image' };
        }
    }, []);

    // Reorder Images
    const reorderImages = useCallback(async (productId: string, imageIds: string[]): Promise<{ success: boolean; error?: string }> => {
        try {
            setProducts(prev => prev.map(p => {
                if (p.id === productId) {
                    const reorderedImages = imageIds.map((id, index) => {
                        const img = p.images.find(i => i.id === id);
                        return img ? { ...img, sortOrder: index } : null;
                    }).filter(Boolean) as ProductImage[];

                    return { ...p, images: reorderedImages };
                }
                return p;
            }));
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Failed to reorder images' };
        }
    }, []);

    // Set Featured Image
    const setFeaturedImage = useCallback(async (productId: string, imageId: string): Promise<{ success: boolean; error?: string }> => {
        try {
            setProducts(prev => prev.map(p => {
                if (p.id === productId) {
                    return {
                        ...p,
                        featuredImageId: imageId,
                        images: p.images.map(img => ({
                            ...img,
                            isFeatured: img.id === imageId,
                        })),
                    };
                }
                return p;
            }));
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Failed to set featured image' };
        }
    }, []);

    // Add Variant
    const addVariant = useCallback(async (productId: string, variant: Omit<ProductVariant, 'id'>): Promise<{ success: boolean; variantId?: string; error?: string }> => {
        try {
            const variantId = generateId();
            const product = products.find(p => p.id === productId);

            setProducts(prev => prev.map(p => {
                if (p.id === productId) {
                    return {
                        ...p,
                        variants: [...p.variants, {
                            ...variant,
                            id: variantId,
                            sku: variant.sku || generateSKU(product?.name || '', variant),
                        }],
                    };
                }
                return p;
            }));

            toast.success('Variant added successfully!');
            return { success: true, variantId };
        } catch (error) {
            toast.error('Failed to add variant');
            return { success: false, error: 'Failed to add variant' };
        }
    }, [products]);

    // Update Variant
    const updateVariant = useCallback(async (productId: string, variantId: string, data: Partial<ProductVariant>): Promise<{ success: boolean; error?: string }> => {
        try {
            setProducts(prev => prev.map(p => {
                if (p.id === productId) {
                    return {
                        ...p,
                        variants: p.variants.map(v => v.id === variantId ? { ...v, ...data } : v),
                    };
                }
                return p;
            }));
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Failed to update variant' };
        }
    }, []);

    // Delete Variant
    const deleteVariant = useCallback(async (productId: string, variantId: string): Promise<{ success: boolean; error?: string }> => {
        try {
            setProducts(prev => prev.map(p => {
                if (p.id === productId) {
                    return {
                        ...p,
                        variants: p.variants.filter(v => v.id !== variantId),
                    };
                }
                return p;
            }));
            toast.success('Variant deleted successfully!');
            return { success: true };
        } catch (error) {
            toast.error('Failed to delete variant');
            return { success: false, error: 'Failed to delete variant' };
        }
    }, []);

    // Bulk Update Variants
    const bulkUpdateVariants = useCallback(async (productId: string, updates: Array<{ variantId: string; data: Partial<ProductVariant> }>): Promise<{ success: boolean; error?: string }> => {
        try {
            setProducts(prev => prev.map(p => {
                if (p.id === productId) {
                    return {
                        ...p,
                        variants: p.variants.map(v => {
                            const update = updates.find(u => u.variantId === v.id);
                            return update ? { ...v, ...update.data } : v;
                        }),
                    };
                }
                return p;
            }));
            toast.success('Variants updated successfully!');
            return { success: true };
        } catch (error) {
            toast.error('Failed to update variants');
            return { success: false, error: 'Failed to update variants' };
        }
    }, []);

    // Category Management
    const createCategory = useCallback(async (data: Omit<Category, 'id'>): Promise<{ success: boolean; categoryId?: string; error?: string }> => {
        try {
            const response = await fetch(`${apiUrl}/products/categories`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error || 'Failed to create category';
                toast.error(errorMessage);
                return { success: false, error: errorMessage };
            }

            const result = await response.json();
            let newCategory = result.category || result.data;

            // Transform the returned category data
            newCategory = {
                ...newCategory,
                id: newCategory.id?.toString(),
                parentId: newCategory.parent_id ? newCategory.parent_id.toString() : undefined,
                isActive: newCategory.status === 'ACTIVE' || newCategory.isActive === true,
                displayOrder: newCategory.display_order || newCategory.displayOrder || 0,
                sortOrder: newCategory.sort_order || newCategory.sortOrder || newCategory.display_order || newCategory.displayOrder || 0,
            };

            setCategories(prev => [...prev, newCategory]);
            toast.success('Category created successfully!');
            return { success: true, categoryId: newCategory.id };
        } catch (error) {
            console.error('Create category error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to create category';
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, [apiUrl]);

    const updateCategory = useCallback(async (id: string, data: Partial<Category>): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await fetch(`${apiUrl}/products/categories/${id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error || 'Failed to update category';
                toast.error(errorMessage);
                return { success: false, error: errorMessage };
            }

            const result = await response.json();
            let updatedCategory = result.category || result.data;

            // Transform the returned category data
            updatedCategory = {
                ...updatedCategory,
                id: updatedCategory.id?.toString(),
                parentId: updatedCategory.parent_id ? updatedCategory.parent_id.toString() : undefined,
                isActive: updatedCategory.status === 'ACTIVE' || updatedCategory.isActive === true,
                displayOrder: updatedCategory.display_order || updatedCategory.displayOrder || 0,
                sortOrder: updatedCategory.sort_order || updatedCategory.sortOrder || updatedCategory.display_order || updatedCategory.displayOrder || 0,
            };

            setCategories(prev => prev.map(c => c.id === id ? updatedCategory : c));
            toast.success('Category updated successfully!');
            return { success: true };
        } catch (error) {
            console.error('Update category error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to update category';
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, [apiUrl]);

    const deleteCategory = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await fetch(`${apiUrl}/products/categories/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to delete category');
            }

            setCategories(prev => prev.filter(c => c.id !== id));
            toast.success('Category deleted successfully!');
            return { success: true };
        } catch (error) {
            console.error('Delete category error:', error);
            toast.error('Failed to delete category');
            return { success: false, error: 'Failed to delete category' };
        }
    }, [apiUrl]);

    // Brand Management
    const createBrand = useCallback(async (data: Omit<Brand, 'id'>): Promise<{ success: boolean; brandId?: string; error?: string }> => {
        try {
            const response = await fetch(`${apiUrl}/products/brands`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error || 'Failed to create brand';
                toast.error(errorMessage);
                return { success: false, error: errorMessage };
            }

            const result = await response.json();
            let newBrand = result.brand || result.data;

            // Transform the returned brand data
            newBrand = {
                ...newBrand,
                id: newBrand.id?.toString(),
                isActive: newBrand.status === 'ACTIVE' || newBrand.isActive === true,
            };

            setBrands(prev => [...prev, newBrand]);
            toast.success('Brand created successfully!');
            return { success: true, brandId: newBrand.id };
        } catch (error) {
            console.error('Create brand error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to create brand';
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, [apiUrl]);

    const updateBrand = useCallback(async (id: string, data: Partial<Brand>): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await fetch(`${apiUrl}/products/brands/${id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error || 'Failed to update brand';
                toast.error(errorMessage);
                return { success: false, error: errorMessage };
            }

            const result = await response.json();
            let updatedBrand = result.brand || result.data;

            // Transform the returned brand data
            updatedBrand = {
                ...updatedBrand,
                id: updatedBrand.id?.toString(),
                isActive: updatedBrand.status === 'ACTIVE' || updatedBrand.isActive === true,
            };

            setBrands(prev => prev.map(b => b.id === id ? updatedBrand : b));
            toast.success('Brand updated successfully!');
            return { success: true };
        } catch (error) {
            console.error('Update brand error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to update brand';
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, [apiUrl]);

    const deleteBrand = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await fetch(`${apiUrl}/products/brands/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error || 'Failed to delete brand';
                toast.error(errorMessage);
                return { success: false, error: errorMessage };
            }

            setBrands(prev => prev.filter(b => b.id !== id));
            toast.success('Brand deleted successfully!');
            return { success: true };
        } catch (error) {
            console.error('Delete brand error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete brand';
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, [apiUrl]);

    // Bulk Update Products
    const bulkUpdateProducts = useCallback(async (update: BulkProductUpdate): Promise<{ success: boolean; updatedCount?: number; error?: string }> => {
        try {
            let updatedCount = 0;

            setProducts(prev => prev.map(p => {
                if (update.productIds.includes(p.id)) {
                    updatedCount++;
                    return {
                        ...p,
                        ...update.updates,
                        updatedAt: new Date(),
                    };
                }
                return p;
            }));

            toast.success(`${updatedCount} products updated successfully!`);
            return { success: true, updatedCount };
        } catch (error) {
            toast.error('Failed to bulk update products');
            return { success: false, error: 'Failed to bulk update products' };
        }
    }, []);

    // Filter Products
    const filterProducts = useCallback((filters: ProductFilters): Product[] => {
        return products.filter(product => {
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                if (!product.name.toLowerCase().includes(searchLower) &&
                    !product.shortDescription.toLowerCase().includes(searchLower)) {
                    return false;
                }
            }

            if (filters.categoryId && product.categoryId !== filters.categoryId) return false;
            if (filters.subCategoryId && product.subCategoryId !== filters.subCategoryId) return false;
            if (filters.brandId && product.brandId !== filters.brandId) return false;
            if (filters.status && product.status !== filters.status) return false;

            if (filters.stockStatus) {
                const totalStock = product.totalStock || 0;
                if (filters.stockStatus === 'OUT_OF_STOCK' && totalStock > 0) return false;
                if (filters.stockStatus === 'LOW_STOCK' && (totalStock === 0 || totalStock > product.lowStockThreshold)) return false;
                if (filters.stockStatus === 'IN_STOCK' && totalStock <= product.lowStockThreshold) return false;
            }

            if (filters.priceRange) {
                const price = product.basePrice || product.variants[0]?.price || 0;
                if (price < filters.priceRange.min || price > filters.priceRange.max) return false;
            }

            return true;
        });
    }, [products]);

    const value: ProductManagementContextType = {
        products,
        categories,
        brands,
        createProduct,
        updateProduct,
        deleteProduct,
        getProduct,
        uploadImages,
        deleteImage,
        reorderImages,
        setFeaturedImage,
        addVariant,
        updateVariant,
        deleteVariant,
        bulkUpdateVariants,
        createCategory,
        updateCategory,
        deleteCategory,
        createBrand,
        updateBrand,
        deleteBrand,
        bulkUpdateProducts,
        filterProducts,
        isLoading,
    };

    return (
        <ProductManagementContext.Provider value={value}>
            {children}
        </ProductManagementContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProductManagement() {
    const context = useContext(ProductManagementContext);
    if (!context) {
        throw new Error('useProductManagement must be used within ProductManagementProvider');
    }
    return context;
}
