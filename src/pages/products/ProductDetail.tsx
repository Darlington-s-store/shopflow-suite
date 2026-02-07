import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Star, Heart, ShoppingCart, Truck, Shield, Check, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ProductCard } from '@/components/products/ProductCard';
import { useProductManagement } from '@/contexts/ProductManagementContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useReviews } from '@/contexts/ReviewContext';
import { useOrders } from '@/contexts/OrderContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, calculateDiscount, formatDate, cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ProductImage } from '@/types/product';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { products, brands } = useProductManagement();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { getProductReviews, canReviewProduct, submitReview } = useReviews();
  const { orders } = useOrders(); // 2. Find order containing product - get orders
  const { user } = useAuth();

  // Find product by slug and ensure it's active or published
  const product = products.find(p => p.slug === slug && (p.status === 'PUBLISHED' || p.status === 'ACTIVE'));
  const brand = product?.brandId ? brands.find(b => b.id === product.brandId) : null;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<string | null>(null);

  // Get unique colors and storages
  const colors = useMemo(() => {
    if (!product) return [];
    const uniqueColors = new Map<string, { color: string; colorCode?: string }>();
    product.variants
      .filter(v => v.status === 'ACTIVE' && v.color)
      .forEach(v => {
        if (v.color && !uniqueColors.has(v.color)) {
          // Assuming color codes might be stored elsewhere or just using color name for now
          // If colorCode is needed, it should be added to the Variant type or derived
          uniqueColors.set(v.color, { color: v.color });
        }
      });
    return Array.from(uniqueColors.values());
  }, [product]);

  const storages = useMemo(() => {
    if (!product) return [];
    const availableVariants = product.variants.filter(v =>
      v.status === 'ACTIVE' && (!selectedColor || v.color === selectedColor)
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
      v.status === 'ACTIVE' &&
      (!selectedColor || v.color === selectedColor) &&
      (!selectedStorage || v.storage === selectedStorage)
    ) || product.variants.find(v => v.status === 'ACTIVE');
  }, [product, selectedColor, selectedStorage]);

  // Fetch all reviews to show the user's own pending reviews immediately
  const allProductReviews = product ? getProductReviews(product.id, false) : [];
  const reviews = allProductReviews.filter(r =>
    r.status === 'APPROVED' || (user && r.userId === user.id)
  );

  // Related products logic
  const relatedProducts = products.filter(p =>
    p.id !== product?.id &&
    p.categoryId === product?.categoryId &&
    (p.status === 'PUBLISHED' || p.status === 'ACTIVE')
  ).slice(0, 4);

  const inWishlist = product ? isInWishlist(product.id) : false;

  // Calculate discount
  // Note: variant has price and discountPrice. discountPrice is usually the SALE price.
  // So if discountPrice exists and is < price, then price is the "compareAt" price.
  // Wait, looking at the type: price: number; discountPrice?: number;
  // Usually discountPrice is the lower price.
  const currentPrice = selectedVariant?.discountPrice || selectedVariant?.price || 0;
  const originalPrice = selectedVariant?.discountPrice ? selectedVariant.price : 0;

  const discountPercentage = selectedVariant && selectedVariant.discountPrice
    ? Math.round(((selectedVariant.price - selectedVariant.discountPrice) / selectedVariant.price) * 100)
    : 0;

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
      addToCart({
        productId: product.id,
        variantId: selectedVariant.id,
        quantity
      });
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

  // Sort images (featured first)
  const sortedImages = [...product.images].sort((a, b) => {
    if (a.isFeatured) return -1;
    if (b.isFeatured) return 1;
    return a.sortOrder - b.sortOrder;
  });

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
                  src={sortedImages[selectedImageIndex]?.url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {sortedImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {sortedImages.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImageIndex(i)}
                      className={cn(
                        "shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors",
                        i === selectedImageIndex ? "border-accent" : "border-transparent"
                      )}
                    >
                      <img src={img.url} alt={product.name} className="w-full h-full object-cover" />
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

              {/* Rating - Using mock data for now/placeholder since types miss it */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-5 w-5",
                        i < 4 // Placeholder rating
                          ? "fill-accent text-accent"
                          : "text-muted"
                      )}
                    />
                  ))}
                </div>
                <span className="font-medium">4.5</span>
                <span className="text-muted-foreground">({reviews.length} reviews)</span>
              </div>

              {/* Price */}
              {selectedVariant && (
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold">
                    {formatCurrency(currentPrice)}
                  </span>
                  {originalPrice > 0 && (
                    <span className="text-xl text-muted-foreground line-through">
                      {formatCurrency(originalPrice)}
                    </span>
                  )}
                  {discountPercentage > 0 && (
                    <Badge variant="destructive" className="text-sm">
                      Save {discountPercentage}%
                    </Badge>
                  )}
                </div>
              )}

              <p className="text-muted-foreground">{product.shortDescription || product.fullDescription}</p>

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
                        {/* Placeholder for checkmark logic */}
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
                        v.status === 'ACTIVE' && v.color === selectedColor && v.storage === storage
                      );
                      const displayPrice = variant?.discountPrice || variant?.price;

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
                              {formatCurrency(displayPrice || 0)}
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
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
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

              {/* Features - Placeholder */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="h-5 w-5 text-accent" />
                  <span>Free shipping on all orders</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-5 w-5 text-accent" />
                  <span>Warranty included</span>
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
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent pb-3"
              >
                Reviews ({reviews.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6 prose max-w-none">
                  <p className="text-muted-foreground leading-relaxed">{product.fullDescription || product.shortDescription}</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  {/* Review Submission Form */}
                  {user ? (
                    canReviewProduct(product.id) ? (
                      <div className="mb-8 p-6 bg-slate-50 rounded-lg border border-slate-200">
                        <h3 className="text-lg font-bold mb-4">Write a Review</h3>
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const rating = Number(formData.get('rating'));
                            const title = formData.get('title') as string;
                            const comment = formData.get('comment') as string;

                            if (rating < 1) {
                              toast.error("Please select a rating");
                              return;
                            }

                            try {
                              // Find strictly delivered/paid order for verification
                              const relevantOrder = orders.find(o =>
                                o.items.some(item => item.productId === product.id) &&
                                (o.status === 'DELIVERED' || o.payment?.status === 'SUCCESS')
                              );

                              await submitReview({
                                productId: product.id,
                                rating,
                                title,
                                comment,
                                orderId: relevantOrder?.id
                              });
                              toast.success("Review submitted for approval!");
                              // Reset form or re-render is automatic via context update
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            } catch (err: any) {
                              toast.error(err.message || 'Failed to submit review');
                            }
                          }}
                          className="space-y-4"
                        >
                          <div>
                            <label className="block text-sm font-medium mb-1">Rating</label>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <label key={star} className="cursor-pointer">
                                  <input type="radio" name="rating" value={star} className="peer sr-only" />
                                  <Star className="h-6 w-6 text-slate-300 peer-checked:fill-orange-500 peer-checked:text-orange-500 hover:text-orange-400 peer-hover:text-orange-400 transition-colors" />
                                </label>
                              ))}
                            </div>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label htmlFor="title" className="text-sm font-medium">Title</label>
                              <Input id="title" name="title" placeholder="Summary of your experience" required />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="comment" className="text-sm font-medium">Review</label>
                            <textarea
                              id="comment"
                              name="comment"
                              rows={4}
                              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              placeholder="Tell us what you liked or disliked..."
                              required
                            />
                          </div>
                          <Button type="submit" className="bg-orange-600 hover:bg-orange-700">Submit Review</Button>
                        </form>
                      </div>
                    ) : (
                      <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-md">
                        You have already reviewed this product.
                      </div>
                    )
                  ) : (
                    <div className="mb-8 p-6 bg-slate-50 rounded-lg text-center">
                      <p className="mb-4 text-muted-foreground">Please log in to write a review.</p>
                      <Button asChild variant="outline">
                        <Link to="/login">Log In</Link>
                      </Button>
                    </div>
                  )}

                  <Separator className="mb-6" />

                  {reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b pb-6 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{review.userName}</span>
                              {review.status === 'PENDING' && (
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200">
                                  Pending Approval
                                </Badge>
                              )}
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
