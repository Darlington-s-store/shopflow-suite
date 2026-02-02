import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronRight, Grid, List, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { ProductCard } from '@/components/products/ProductCard';
import { products, brands, categories } from '@/data/mockData';
import { formatCurrency, cn } from '@/lib/utils';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const brand = searchParams.get('brand') || '';
  const sort = searchParams.get('sort') || 'featured';
  const minPrice = parseInt(searchParams.get('minPrice') || '0');
  const maxPrice = parseInt(searchParams.get('maxPrice') || '2500000');

  const [priceRange, setPriceRange] = useState<[number, number]>([minPrice, maxPrice]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(brand ? brand.split(',') : []);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => p.isActive);

    // Search query
    if (query) {
      const lowerQuery = query.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.tags?.some(t => t.toLowerCase().includes(lowerQuery))
      );
    }

    // Category filter
    if (category) {
      result = result.filter(p => {
        const cat = categories[0]?.children?.find(c => c.slug === category);
        if (cat) {
          return p.categoryId === cat.id || p.categoryId.startsWith(cat.id);
        }
        return true;
      });
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      result = result.filter(p => p.brandId && selectedBrands.includes(p.brandId));
    }

    // Price filter
    result = result.filter(p => {
      const minVariantPrice = Math.min(...p.variants.map(v => v.price));
      return minVariantPrice >= priceRange[0] && minVariantPrice <= priceRange[1];
    });

    // Sorting
    switch (sort) {
      case 'price-asc':
        result.sort((a, b) => Math.min(...a.variants.map(v => v.price)) - Math.min(...b.variants.map(v => v.price)));
        break;
      case 'price-desc':
        result.sort((a, b) => Math.min(...b.variants.map(v => v.price)) - Math.min(...a.variants.map(v => v.price)));
        break;
      case 'rating':
        result.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return result;
  }, [query, category, selectedBrands, priceRange, sort]);

  const handleBrandToggle = (brandId: string) => {
    setSelectedBrands(prev => 
      prev.includes(brandId) 
        ? prev.filter(b => b !== brandId)
        : [...prev, brandId]
    );
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);
    if (selectedBrands.length > 0) {
      params.set('brand', selectedBrands.join(','));
    } else {
      params.delete('brand');
    }
    params.set('minPrice', priceRange[0].toString());
    params.set('maxPrice', priceRange[1].toString());
    setSearchParams(params);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSelectedBrands([]);
    setPriceRange([0, 2500000]);
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (sort !== 'featured') params.set('sort', sort);
    setSearchParams(params);
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          <Link
            to="/products"
            className={cn(
              "block text-sm hover:text-accent transition-colors",
              !category && "text-accent font-medium"
            )}
          >
            All Products
          </Link>
          {categories[0]?.children?.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className={cn(
                "block text-sm hover:text-accent transition-colors",
                category === cat.slug && "text-accent font-medium"
              )}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div>
        <h3 className="font-semibold mb-3">Brands</h3>
        <div className="space-y-2">
          {brands.map((b) => (
            <div key={b.id} className="flex items-center gap-2">
              <Checkbox
                id={b.id}
                checked={selectedBrands.includes(b.id)}
                onCheckedChange={() => handleBrandToggle(b.id)}
              />
              <Label htmlFor={b.id} className="text-sm cursor-pointer">
                {b.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <Slider
          value={priceRange}
          onValueChange={(value) => setPriceRange(value as [number, number])}
          min={0}
          max={2500000}
          step={10000}
          className="mb-4"
        />
        <div className="flex items-center gap-2 text-sm">
          <span>{formatCurrency(priceRange[0])}</span>
          <span>-</span>
          <span>{formatCurrency(priceRange[1])}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={applyFilters} className="flex-1">Apply</Button>
        <Button variant="outline" onClick={clearFilters}>Clear</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-muted/50 py-3">
        <div className="container">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Products</span>
            {query && (
              <>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground">Search: "{query}"</span>
              </>
            )}
          </nav>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <FilterSidebar />
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold">
                  {query ? `Search Results for "${query}"` : 'All Products'}
                </h1>
                <p className="text-muted-foreground">
                  {filteredProducts.length} products found
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Mobile Filter */}
                <Sheet open={showFilters} onOpenChange={setShowFilters}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterSidebar />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Sort */}
                <Select 
                  value={sort} 
                  onValueChange={(value) => {
                    const params = new URLSearchParams(searchParams);
                    params.set('sort', value);
                    setSearchParams(params);
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Toggle */}
                <div className="hidden sm:flex border rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "p-2 transition-colors",
                      viewMode === 'grid' ? "bg-muted" : "hover:bg-muted/50"
                    )}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "p-2 transition-colors",
                      viewMode === 'list' ? "bg-muted" : "hover:bg-muted/50"
                    )}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {(selectedBrands.length > 0 || minPrice > 0 || maxPrice < 2500000) && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {selectedBrands.map((brandId) => {
                  const brandName = brands.find(b => b.id === brandId)?.name;
                  return (
                    <button
                      key={brandId}
                      onClick={() => handleBrandToggle(brandId)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10 text-accent text-sm"
                    >
                      {brandName}
                      <X className="h-3 w-3" />
                    </button>
                  );
                })}
                <button
                  onClick={clearFilters}
                  className="text-sm text-destructive hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className={cn(
                "grid gap-4 md:gap-6",
                viewMode === 'grid' ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1"
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
              <div className="text-center py-16">
                <p className="text-xl font-medium mb-2">No products found</p>
                <p className="text-muted-foreground mb-6">Try adjusting your search or filter criteria</p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
