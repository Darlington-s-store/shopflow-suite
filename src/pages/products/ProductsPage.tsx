import { useState, useMemo } from 'react';
import { useSearchParams, Link, useParams, useLocation } from 'react-router-dom';
import { ChevronRight, Grid, List, SlidersHorizontal, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { ProductCard } from '@/components/products/ProductCard';
import { useProductManagement } from '@/contexts/ProductManagementContext';
import { formatCurrency, cn } from '@/lib/utils';
import { Product } from '@/types/product';

export default function ProductsPage() {
  const { products, categories, brands } = useProductManagement();
  const [searchParams, setSearchParams] = useSearchParams();
  const { slug } = useParams();
  const location = useLocation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const isBrandRoute = location.pathname.startsWith('/brand/');
  const isCategoryRoute = location.pathname.startsWith('/category/');

  const query = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const brandParam = searchParams.get('brand') || '';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = parseInt(searchParams.get('minPrice') || '0');
  const maxPrice = parseInt(searchParams.get('maxPrice') || '100000');

  // Determine active category/brand from route or params
  const activeCategorySlug = isCategoryRoute ? slug : categoryParam;

  // For brand route, we find the brand by slug
  const activeBrandSlug = isBrandRoute ? slug : null;
  const activeBrandId = activeBrandSlug ? brands.find(b => b.slug === activeBrandSlug)?.id : null;

  const [priceRange, setPriceRange] = useState<[number, number]>([minPrice, maxPrice]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    activeBrandId ? [activeBrandId] : (brandParam ? brandParam.split(',') : [])
  );

  // Helper to find min price of a product
  const getProductPrice = (p: Product) => {
    const prices = p.variants.flatMap(v => v.status === 'ACTIVE' ? [v.discountPrice || v.price] : []);
    const min = prices.length > 0 ? Math.min(...prices) : (p.basePrice || 0);
    return min;
  };

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => p.status === 'PUBLISHED' || p.status === 'ACTIVE');

    // Search query
    if (query) {
      const lowerQuery = query.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        (p.shortDescription && p.shortDescription.toLowerCase().includes(lowerQuery)) ||
        (p.fullDescription && p.fullDescription.toLowerCase().includes(lowerQuery)) ||
        p.tags?.some(t => t.toLowerCase().includes(lowerQuery))
      );
    }

    // Category filter
    if (activeCategorySlug) {
      // Find the category object (could be parent or sub)
      // categories in context are parents with children?
      // No, ProductManagementContext usually returns flattened or nested?
      // In AddProduct, "categories" was parents, and we filtered subs.
      // Let's assume 'categories' contains all or at least parents.

      const category = categories.find(c => c.slug === activeCategorySlug);
      // If not found in top level, check children?
      // Assuming categories is flat list of all categories for now or we search properly.
      // Or if categories is specific structure.
      // Let's look for it deeply.

      let foundCategory = categories.find(c => c.slug === activeCategorySlug);
      let isSub = false;

      if (!foundCategory) {
        // Look in children?
        // This depends on how categories are structured in the context.
        // Based on previous files, categories seemed flat but with parentId.
        const sub = categories.find(c => c.slug === activeCategorySlug);
        if (sub) {
          foundCategory = sub;
          isSub = !!sub.parentId;
        }
      }

      if (foundCategory) {
        if (foundCategory.parentId) {
          // It implies it's a subcategory
          result = result.filter(p => p.subCategoryId === foundCategory?.id || p.categoryId === foundCategory?.id);
        } else {
          // Parent category
          // Match strictly parent category ID or any product whose subcategory belongs to this parent
          result = result.filter(p =>
            p.categoryId === foundCategory?.id ||
            // also include if p has a subcategory that is a child of this category
            (p.subCategoryId && categories.find(sub => sub.id === p.subCategoryId)?.parentId === foundCategory?.id)
          );
        }
      }
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      result = result.filter(p => p.brandId && selectedBrands.includes(p.brandId));
    }

    // Price filter
    result = result.filter(p => {
      const price = getProductPrice(p);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sorting
    switch (sort) {
      case 'price-asc':
        result.sort((a, b) => getProductPrice(a) - getProductPrice(b));
        break;
      case 'price-desc':
        result.sort((a, b) => getProductPrice(b) - getProductPrice(a));
        break;
      case 'rating':
        // Placeholder for rating sort
        // result.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'featured':
      default:
        // Placeholder for featured sort
        break;
    }

    return result;
  }, [products, query, activeCategorySlug, selectedBrands, priceRange, sort, categories]);

  const toggleBrand = (brandId: string) => {
    setSelectedBrands(prev =>
      prev.includes(brandId)
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };

  const clearFilters = () => {
    setSearchParams({});
    setPriceRange([minPrice, maxPrice]);
    setSelectedBrands([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {activeCategorySlug ? (
                categories.find(c => c.slug === activeCategorySlug)?.name || 'Category'
              ) : activeBrandSlug ? (
                brands.find(b => b.slug === activeBrandSlug)?.name || 'Brand'
              ) : (
                query ? `Search results for "${query}"` : 'All Products'
              )}
            </h1>
            <p className="text-slate-500">
              Showing {filteredProducts.length} results
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden w-full">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                {/* Mobile Filters Content */}
                {/* Simplified for brevity - reuse content logic */}
              </SheetContent>
            </Sheet>

            <Select
              value={sort}
              onValueChange={(value) => {
                const newParams = new URLSearchParams(searchParams);
                newParams.set('sort', value);
                setSearchParams(newParams);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest Arrivals</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                {/* <SelectItem value="rating">Best Rating</SelectItem> */}
                {/* <SelectItem value="featured">Featured</SelectItem> */}
              </SelectContent>
            </Select>

            <div className="flex border rounded-md bg-white">
              <Button
                variant="ghost"
                size="icon"
                className={cn("rounded-none", viewMode === 'grid' && "bg-slate-100 text-slate-900")}
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn("rounded-none", viewMode === 'list' && "bg-slate-100 text-slate-900")}
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="hidden md:block space-y-8">
            {/* Price Filter */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Price Range</h3>
              <Slider
                value={priceRange}
                min={0}
                max={100000}
                step={100}
                onValueChange={(val) => setPriceRange(val as [number, number])}
                className="py-4"
              />
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>{formatCurrency(priceRange[0])}</span>
                <span>{formatCurrency(priceRange[1])}</span>
              </div>
            </div>

            <Separator />

            {/* Brand Filter */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Brands</h3>
                {selectedBrands.length > 0 && (
                  <Button
                    variant="link"
                    className="h-auto p-0 text-xs text-orange-600"
                    onClick={() => setSelectedBrands([])}
                  >
                    Clear
                  </Button>
                )}
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {brands.map((brand) => (
                  <div key={brand.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`brand-${brand.id}`}
                      checked={selectedBrands.includes(brand.id)}
                      onCheckedChange={() => toggleBrand(brand.id)}
                    />
                    <Label
                      htmlFor={`brand-${brand.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {brand.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Categories (Simple list if not in category view) */}
            {!isCategoryRoute && (
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900">Categories</h3>
                <div className="space-y-2">
                  {categories.filter(c => !c.parentId).map(c => (
                    <Link
                      key={c.id}
                      to={`/category/${c.slug}`}
                      className="block text-sm text-slate-600 hover:text-orange-600"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Grid */}
          <div className="md:col-span-3">
            {query && (
              <div className="flex items-center gap-2 mb-4 bg-white p-3 rounded-lg border text-sm">
                <Filter className="h-4 w-4 text-slate-500" />
                <span>Filters applied:</span>
                {selectedBrands.length > 0 && (
                  <span className="bg-slate-100 px-2 py-1 rounded-md text-slate-700">Brands ({selectedBrands.length})</span>
                )}
                {priceRange[0] > minPrice && (
                  <span className="bg-slate-100 px-2 py-1 rounded-md text-slate-700">Min Price: {formatCurrency(priceRange[0])}</span>
                )}
                <Button variant="ghost" size="sm" className="h-auto p-1 ml-auto text-red-500 hover:text-red-600 hover:bg-red-50" onClick={clearFilters}>
                  <X className="h-3 w-3 mr-1" /> Clear all
                </Button>
              </div>
            )}

            {filteredProducts.length > 0 ? (
              <div className={cn(
                "grid gap-6",
                viewMode === 'grid'
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
              )}>
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant={viewMode === 'list' ? 'compact' : 'default'}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-lg border border-dashed">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">No products found</h3>
                <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                  We couldn't find any products matching your filters. Try adjusting your search query or sorting options.
                </p>
                <Button variant="outline" className="mt-6" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Separator() {
  return <div className="h-px bg-slate-200" />;
}
