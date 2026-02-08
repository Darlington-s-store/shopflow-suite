// Product Management Types with Manual Image Upload Support

export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'HIDDEN' | 'ARCHIVED';
export type VariantStatus = 'ACTIVE' | 'DISABLED' | 'OUT_OF_STOCK';

export interface ProductImage {
    id: string;
    url: string;
    file?: File; // For upload preview
    sortOrder: number;
    isFeatured: boolean;
    variantId?: string; // Optional: link to specific color variant
    createdAt: Date;
}

export interface ProductVariant {
    id: string;
    sku: string;
    color?: string;
    storage?: string;
    price: number;
    discountPrice?: number;
    stock: number;
    status: VariantStatus;
    images?: string[]; // Image IDs for this variant
}

export interface Product {
    id: string;
    name: string;
    slug: string;

    // Category & Brand
    categoryId: string;
    subCategoryId?: string;
    brandId?: string;

    // Descriptions
    shortDescription: string;
    fullDescription: string;
    tags?: string[];

    // Pricing
    basePrice?: number; // Optional if using variants only
    discountPrice?: number;
    taxEnabled: boolean;

    // Inventory
    stockTracking: boolean;
    lowStockThreshold: number;
    totalStock?: number; // Sum of all variant stocks

    // Images
    images: ProductImage[];
    featuredImageId?: string;

    // Variants
    variants: ProductVariant[];

    // Status & Metadata
    status: ProductStatus;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;

    // SEO (optional)
    metaTitle?: string;
    metaDescription?: string;
}

export type CategoryStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
export type CategoryDisplayLocation = 'HOMEPAGE' | 'NAVIGATION' | 'FOOTER';

export interface CategorySEO {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    parentId?: string;
    imageUrl?: string;
    image?: string; // alias for imageUrl
    icon?: string;
    bannerImage?: string;
    displayOrder: number;
    sortOrder: number;
    status?: CategoryStatus;
    isActive: boolean;
    isFeatured?: boolean;
    isTrending?: boolean;
    displayLocations?: CategoryDisplayLocation[];
    seo?: CategorySEO;
    children?: Category[];
    productCount?: number;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

export type BrandStatus = 'ACTIVE' | 'INACTIVE';

export interface Brand {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logoUrl?: string;
    logo?: string; // alias for logoUrl
    categoryIds?: string[];
    status?: BrandStatus;
    isActive: boolean;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

// Form types for product creation/editing
export interface ProductFormData {
    name: string;
    categoryId: string;
    subCategoryId?: string;
    brandId?: string;
    shortDescription: string;
    fullDescription: string;
    tags: string[];
    basePrice?: number;
    discountPrice?: number;
    taxEnabled: boolean;
    stockTracking: boolean;
    lowStockThreshold: number;
    status: ProductStatus;
    variants: ProductVariant[];
    images: File[];
    existingImages?: ProductImage[];
}

// Filters for product listing
export interface ProductFilters {
    search?: string;
    categoryId?: string;
    subCategoryId?: string;
    brandId?: string;
    status?: ProductStatus;
    stockStatus?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
    priceRange?: { min: number; max: number };
    sortBy?: 'name' | 'price' | 'stock' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}

// Bulk operations
export interface BulkProductUpdate {
    productIds: string[];
    updates: {
        status?: ProductStatus;
        categoryId?: string;
        brandId?: string;
        priceAdjustment?: { type: 'PERCENTAGE' | 'FIXED'; value: number };
        stockAdjustment?: { type: 'SET' | 'ADD' | 'SUBTRACT'; value: number };
    };
}
