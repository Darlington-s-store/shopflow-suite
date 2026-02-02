import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Star, Heart, ShoppingCart, Truck, Shield, Check, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ProductCard } from '@/components/products/ProductCard';
import { products, brands } from '@/data/mockData';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useReviews } from '@/contexts/ReviewContext';
import { formatCurrency, calculateDiscount, formatDate, cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { getProductReviews } = useReviews();

  const product = products.find(p => p.slug === slug);
  const brand = product?.brandId ? brands.find(b => b.id === product.brandId) : null;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<string | null>(null);

  // Get unique colors and storages
  const colors = useMemo(() => {
    if (!product) return [];
    const uniqueColors = new Map<string, { color: string; colorCode?: string }>();
    product.variants.filter(v => v.isActive && v.color).forEach(v => {
      if (v.color && !uniqueColors.has(v.color)) {
        uniqueColors.set(v.color, { color: v.color, colorCode: v.colorCode });
      }
    });
    return Array.from(uniqueColors.values());
  }, [product]);

  const storages = useMemo(() => {
    if (!product) return [];
    const availableVariants = product.variants.filter(v => 
      v.isActive && (!selectedColor || v.color === selectedColor)
    );
    const uniqueStorages = [...new Set(availableVariants.map(v => v.storage).filter(Boolean))];
    return uniqueStorages as string[];
  }, [product, selectedColor]);

  // Initialize selections
  useMemo(() => {
    if (colors.length > 0 && !selectedColor) {
      setSelectedColor(colors[0].color);
    }
  }, [colors, selectedColor]);

  useMemo(() => {
    if (storages.length > 0 && !selectedStorage) {
      setSelectedStorage(storages[0]);
    }
  }, [storages, selectedStorage]);

  // Get selected variant
  const selectedVariant = useMemo(() => {
    if (!product) return null;
    return product.variants.find(v => 
      v.isActive && 
      (!selectedColor || v.color === selectedColor) &&
      (!selectedStorage || v.storage === selectedStorage)
    ) || product.variants.find(v => v.isActive);
  }, [product, selectedColor, selectedStorage]);

  const reviews = product ? getProductReviews(product.id) : [];
  const relatedProducts = products.filter(p => 
    p.id !== product?.id && 
    p.categoryId === product?.categoryId &&
    p.isActive
  ).slice(0, 4);

  const inWishlist = product ? isInWishlist(product.id) : false;
  const discount = selectedVariant ? calculateDiscount(selectedVariant.price, selectedVariant.compareAtPrice) : null;

  if (!product) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
        <Button asChild>
          <Link to="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (selectedVariant) {
      addToCart(product.id, selectedVariant.id, quantity);
      toast.success('Added to cart', {
        description: `${product.name} (${selectedVariant.color || ''} ${selectedVariant.storage || ''}) x${quantity}`,
      });
    }
  };

  const handleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product.id);
      toast.success('Added to wishlist');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-muted/50 py-3">
        <div className="container">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/products" className="hover:text-foreground">Products</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Section */}
      <section className="py-8">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-muted rounded-xl overflow-hidden">
                <img
                  src={product.images[selectedImageIndex]?.url}
                  alt={product.images[selectedImageIndex]?.alt || product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImageIndex(i)}
                      className={cn(
                        "shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors",
                        i === selectedImageIndex ? "border-accent" : "border-transparent"
                      )}
                    >
                      <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              {/* Brand & Title */}
              {brand && (
                <Link to={`/brand/${brand.slug}`} className="text-sm text-muted-foreground uppercase tracking-wide hover:text-accent">
                  {brand.name}
                </Link>
              )}
              <h1 className="text-3xl font-bold">{product.name}</h1>

              {/* Rating */}
              {product.reviewCount > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-5 w-5",
                          i < Math.round(product.averageRating)
                            ? "fill-accent text-accent"
                            : "text-muted"
                        )}
                      />
                    ))}
                  </div>
                  <span className="font-medium">{product.averageRating}</span>
                  <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
                </div>
              )}

              {/* Price */}
              {selectedVariant && (
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold">
                    {formatCurrency(selectedVariant.price)}
                  </span>
                  {selectedVariant.compareAtPrice && (
                    <span className="text-xl text-muted-foreground line-through">
                      {formatCurrency(selectedVariant.compareAtPrice)}
                    </span>
                  )}
                  {discount && (
                    <Badge variant="destructive" className="text-sm">
                      Save {discount}%
                    </Badge>
                  )}
                </div>
              )}

              <p className="text-muted-foreground">{product.shortDescription || product.description}</p>

              <Separator />

              {/* Color Selection */}
              {colors.length > 0 && (
                <div className="space-y-3">
                  <p className="font-medium">Color: <span className="text-muted-foreground">{selectedColor}</span></p>
                  <div className="flex gap-3">
                    {colors.map(({ color, colorCode }) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={cn(
                          "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all",
                          selectedColor === color
                            ? "border-accent ring-2 ring-accent/30"
                            : "border-border hover:border-muted-foreground"
                        )}
                        style={{ backgroundColor: colorCode || '#ccc' }}
                        title={color}
                      >
                        {selectedColor === color && (
                          <Check className={cn(
                            "h-5 w-5",
                            colorCode && parseInt(colorCode.replace('#', ''), 16) < 0x888888
                              ? "text-white"
                              : "text-black"
                          )} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Storage Selection */}
              {storages.length > 0 && (
                <div className="space-y-3">
                  <p className="font-medium">Storage</p>
                  <div className="flex flex-wrap gap-3">
                    {storages.map((storage) => {
                      const variant = product.variants.find(v => 
                        v.isActive && v.color === selectedColor && v.storage === storage
                      );
                      return (
                        <button
                          key={storage}
                          onClick={() => setSelectedStorage(storage)}
                          className={cn(
                            "px-4 py-2 rounded-lg border-2 font-medium transition-all",
                            selectedStorage === storage
                              ? "border-accent bg-accent/10 text-accent"
                              : "border-border hover:border-muted-foreground"
                          )}
                        >
                          {storage}
                          {variant && (
                            <span className="block text-xs text-muted-foreground">
                              {formatCurrency(variant.price)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-3">
                <p className="font-medium">Quantity</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-muted transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 hover:bg-muted transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {selectedVariant && (
                    <span className="text-sm text-muted-foreground">
                      {selectedVariant.stock > 0 
                        ? `${selectedVariant.stock} in stock`
                        : 'Out of stock'}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || selectedVariant.stock === 0}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleWishlist}
                  className={cn(inWishlist && "border-destructive text-destructive")}
                >
                  <Heart className={cn("h-5 w-5", inWishlist && "fill-current")} />
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="h-5 w-5 text-accent" />
                  <span>Free shipping over ₦100,000</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-5 w-5 text-accent" />
                  <span>{product.warranty || 'Warranty included'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-8 bg-muted/50">
        <div className="container">
          <Tabs defaultValue="description" className="space-y-6">
            <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-auto p-0 gap-8">
              <TabsTrigger 
                value="description" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent pb-3"
              >
                Description
              </TabsTrigger>
              <TabsTrigger 
                value="specs" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent pb-3"
              >
                Specifications
              </TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent pb-3"
              >
                Reviews ({reviews.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6 prose max-w-none">
                  <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specs" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  {product.specs && product.specs.length > 0 ? (
                    <div className="grid gap-4">
                      {product.specs.map((spec, i) => (
                        <div key={i} className="flex border-b pb-3 last:border-0">
                          <span className="w-1/3 text-muted-foreground">{spec.label}</span>
                          <span className="flex-1 font-medium">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No specifications available.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  {reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b pb-6 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{review.userName}</span>
                              {review.isVerifiedPurchase && (
                                <Badge variant="secondary" className="text-xs">Verified Purchase</Badge>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">{formatDate(review.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-4 w-4",
                                  i < review.rating ? "fill-accent text-accent" : "text-muted"
                                )}
                              />
                            ))}
                          </div>
                          {review.title && <h4 className="font-medium mb-1">{review.title}</h4>}
                          <p className="text-muted-foreground">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No reviews yet. Be the first to review this product!</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-12">
          <div className="container">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
