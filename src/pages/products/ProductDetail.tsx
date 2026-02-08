import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Star, Heart, ShoppingCart, Truck, Shield, Check, Minus, Plus, Maximize2, Share2, Info } from 'lucide-react';
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
  const navigate = useNavigate();
  const { products, brands } = useProductManagement();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { getProductReviews, canReviewProduct, submitReview } = useReviews();
  const { orders } = useOrders(); // 2. Find order containing product - get orders
  const { user } = useAuth();

  const [isAddingToCart, setIsAddingToCart] = useState(false);

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

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (selectedVariant) {
      setIsAddingToCart(true);
      try {
        await addToCart({
          productId: product.id,
          variantId: selectedVariant.id,
          quantity
        });
        toast.success('Added to cart', {
          description: `${product.name} (${selectedVariant.color || ''} ${selectedVariant.storage || ''}) x${quantity}`,
        });
      } catch (error) {
        toast.error('Failed to add to cart');
      } finally {
        setIsAddingToCart(false);
      }
    }
  };

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

  // ... (rest of the component)

  // ...
  <Button
    size="lg"
    className="flex-1 bg-orange-600 hover:bg-orange-700"
    onClick={handleAddToCart}
    disabled={!selectedVariant || selectedVariant.stock === 0 || isAddingToCart}
  >
    <ShoppingCart className="h-5 w-5 mr-2" />
    {isAddingToCart ? 'Adding...' : 'Add to Cart'}
  </Button>

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

      {/* Product Section - Redesigned */}
      <section className="py-8 bg-white">
        <div className="container">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

            {/* Images Column (Left) */}
            <div className="lg:col-span-7 flex gap-4">
              {/* Thumbnails (Vertical) */}
              <div className="hidden md:flex flex-col gap-3 w-16 h-[500px] overflow-y-auto [&::-webkit-scrollbar]:hidden py-1">
                {sortedImages.map((img, i) => (
                  <button
                    key={img.id}
                    onMouseEnter={() => setSelectedImageIndex(i)}
                    onClick={() => setSelectedImageIndex(i)}
                    className={cn(
                      "w-16 h-16 rounded-md overflow-hidden border-2 transition-all shrink-0",
                      i === selectedImageIndex ? "border-primary ring-1 ring-primary" : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Main Image */}
              <div className="flex-1 relative bg-gray-100 rounded-lg border border-gray-200 h-[400px] lg:h-[500px] flex items-center justify-center overflow-hidden group">
                {/* Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                    <ShoppingCart className="h-3 w-3" />
                    IN {Math.floor((product.id.charCodeAt(0) || 50) / 2)} CARTS
                  </span>
                </div>

                {/* Top Right Actions */}
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-3">
                  <button className="bg-white/90 p-2 rounded-full shadow-sm hover:bg-white transition-colors">
                    <Maximize2 className="h-5 w-5 text-gray-700" />
                  </button>
                  <button className="bg-white/90 p-2 rounded-full shadow-sm hover:bg-white transition-colors" onClick={handleWishlist}>
                    <Heart className={cn("h-5 w-5", inWishlist ? "fill-destructive text-destructive" : "text-gray-700")} />
                  </button>
                </div>

                {/* Navigation Arrows */}
                <button
                  onClick={() => setSelectedImageIndex(prev => prev > 0 ? prev - 1 : sortedImages.length - 1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                >
                  <ChevronLeft className="h-6 w-6 text-gray-800" />
                </button>
                <button
                  onClick={() => setSelectedImageIndex(prev => prev < sortedImages.length - 1 ? prev + 1 : 0)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                >
                  <ChevronRight className="h-6 w-6 text-gray-800" />
                </button>

                <img
                  src={sortedImages[selectedImageIndex]?.url}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>

            {/* Details Column (Right) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Title */}
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">{product.name}</h1>

              {/* Seller Info */}
              <div className="flex items-center flex-wrap gap-2 text-sm pb-4 border-b">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
                  {brand?.name?.substring(0, 2).toUpperCase() || 'SF'}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <Link to="#" className="font-bold text-gray-900 hover:underline decoration-primary decoration-2 underline-offset-2">
                      {brand?.name || 'Verified Seller'}
                    </Link>
                    <span className="text-gray-500">({(product.basePrice * 2).toFixed(0)})</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>98.5% positive</span>
                    <span className="text-gray-300">•</span>
                    <Link to="#" className="hover:underline">Seller's other items</Link>
                    <span className="text-gray-300">•</span>
                    <Link to="#" className="hover:underline">Contact seller</Link>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
              </div>

              {/* Price Section */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatCurrency(currentPrice)}
                  </span>
                  {originalPrice > currentPrice && (
                    <>
                      <span className="text-sm text-gray-500 line-through pl-2">
                        {formatCurrency(originalPrice)}
                      </span>
                      <span className="text-sm text-destructive font-medium">-{discountPercentage}%</span>
                    </>
                  )}
                </div>
                <div className="text-sm text-gray-500">or Best Offer</div>
              </div>

              {/* Condition */}
              <div className="flex items-start gap-8 py-2">
                <span className="text-sm text-gray-500 w-16 shrink-0">Condition:</span>
                <div>
                  <p className="font-bold text-sm text-gray-900 flex items-center gap-1">
                    New (Open Box)
                    <Info className="h-4 w-4 text-gray-400" />
                  </p>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {product.shortDescription || 'Brand new item in original packaging. Fully functional and backed by warranty.'}
                    <button className="text-primary hover:underline ml-1">Read more</button>
                  </p>
                </div>
              </div>

              {/* Variants (Color/Storage) */}
              {(colors.length > 0 || storages.length > 0) && (
                <div className="space-y-3 py-2 border-t border-b border-dashed border-gray-200 bg-gray-50/50 p-3 rounded-md">
                  {colors.length > 0 && (
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500 w-16">Color:</span>
                      <div className="flex gap-2">
                        {colors.map(({ color, colorCode }) => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={cn(
                              "w-8 h-8 rounded-full border-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                              selectedColor === color ? "border-primary" : "border-gray-300"
                            )}
                            style={{ backgroundColor: colorCode || '#eee' }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {storages.length > 0 && (
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500 w-16">Storage:</span>
                      <select
                        className="border border-gray-300 rounded-md text-sm px-2 py-1 bg-white focus:border-primary focus:outline-none"
                        value={selectedStorage || ''}
                        onChange={(e) => setSelectedStorage(e.target.value)}
                      >
                        {storages.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-4 py-2">
                <span className="text-sm text-gray-500 w-16 shrink-0">Quantity:</span>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-16 border border-gray-300 rounded-md px-2 py-1.5 text-center text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                  <div className="text-sm">
                    {selectedVariant?.stock <= 5 ? (
                      <span className="text-destructive font-medium">Last {selectedVariant.stock || 'one'}</span>
                    ) : (
                      <span className="text-destructive font-medium">Limited quantity</span>
                    )}
                    <span className="text-gray-500 mx-1">·</span>
                    <span className="text-gray-600">{100 + (product.id.charCodeAt(0) || 50)} sold</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Stack */}
              <div className="space-y-3 pt-2">
                <Button
                  size="lg"
                  className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 text-lg"
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || selectedVariant.stock === 0 || isAddingToCart}
                >
                  {isAddingToCart ? 'Wait...' : 'Buy It Now'}
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full rounded-full border-primary text-primary hover:bg-primary/5 font-bold h-11"
                    onClick={handleAddToCart}
                    disabled={!selectedVariant || selectedVariant.stock === 0 || isAddingToCart}
                  >
                    Add to cart
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full rounded-full border-primary text-primary hover:bg-primary/5 font-bold h-11"
                  >
                    Make offer
                  </Button>
                </div>

                <div className="pt-2">
                  <Button
                    variant="ghost"
                    className="w-full h-10 border border-gray-300 rounded-sm hover:bg-gray-50 flex items-center justify-center gap-2 text-primary font-medium"
                    onClick={handleWishlist}
                  >
                    <Heart className={cn("h-4 w-4", inWishlist ? "fill-primary" : "")} />
                    {inWishlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                  </Button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mt-4 space-y-3">
                <div className="flex gap-3">
                  <div className="mt-0.5"><Truck className="h-5 w-5 text-gray-600" /></div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Free 4-day shipping</p>
                    <p className="text-xs text-gray-500">Get it by {new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="mt-0.5"><Shield className="h-5 w-5 text-gray-600" /></div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">30-day returns</p>
                    <p className="text-xs text-gray-500">Seller pays return shipping</p>
                  </div>
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
