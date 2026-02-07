import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Product } from '@/types/product';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, calculateDiscount, cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact';
}

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  // Logic for new Product type
  const primaryImage = product.images.find(img => img.isFeatured) || product.images[0];

  // Find active variants
  const activeVariants = product.variants.filter(v => v.status === 'ACTIVE');
  const defaultVariant = activeVariants[0];

  // Calculate prices
  // In the new model: 
  // - price is the regular price
  // - discountPrice is the sale price (if exists)
  const prices = activeVariants.map(v => v.discountPrice || v.price);
  const lowestPrice = prices.length > 0 ? Math.min(...prices) : (product.basePrice || 0);

  // High price for "compare at" (checking if any variant has a discount)
  // If a variant has a discountPrice, then its 'price' is the old price.
  const comparePrices = activeVariants
    .filter(v => v.discountPrice)
    .map(v => v.price);

  const highestCompareAt = comparePrices.length > 0 ? Math.max(...comparePrices) : 0;

  // Only show discount if we actually have a lower price than the compare price
  const discount = highestCompareAt > lowestPrice
    ? calculateDiscount(lowestPrice, highestCompareAt)
    : 0;

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (defaultVariant) {
      addToCart({
        productId: product.id,
        variantId: defaultVariant.id,
        quantity: 1,
      }).then(() => {
        toast.success('Added to cart', {
          description: `${product.name} has been added to your cart.`,
        });
      }).catch(() => {
        toast.error('Failed to add to cart');
      });
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product.id);
      toast.success('Added to wishlist');
    }
  };

  return (
    <Link to={`/product/${product.slug}`}>
      <Card className={cn(
        "group overflow-hidden card-hover border-0 shadow-soft transition-all duration-300 hover:shadow-medium",
        variant === 'compact' && "shadow-none border"
      )}>
        <div className="relative aspect-product bg-muted overflow-hidden rounded-lg">
          {/* Product Image with overlay */}
          <div className="relative w-full h-full bg-gradient-to-b from-transparent to-black/5">
            <img
              src={primaryImage?.url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {discount > 0 && (
              <Badge className="font-bold text-white bg-accent hover:bg-accent/90 shadow-md">
                <span>−{discount}%</span>
              </Badge>
            )}
          </div>

          {/* Wishlist Button - Always visible */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <Button
              size="icon"
              className={cn(
                "h-10 w-10 rounded-full shadow-md transition-all duration-200",
                inWishlist 
                  ? "bg-accent text-white hover:bg-accent/90" 
                  : "bg-white/90 text-accent hover:bg-white shadow-lg"
              )}
              onClick={handleWishlist}
            >
              <Heart className={cn("h-5 w-5", inWishlist && "fill-current")} />
            </Button>
          </div>

          {/* Quick Add Button - Appears on hover */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
            <Button
              className="w-full bg-accent hover:bg-accent/90 text-white font-semibold shadow-lg"
              onClick={handleAddToCart}
              disabled={!defaultVariant}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>

        <CardContent className={cn("p-3 md:p-4", variant === 'compact' && "p-2")}>
          {/* Brand */}
          {product.brandId && (
            <p className="text-xs text-accent font-bold mb-1 uppercase tracking-widest">
              Featured
            </p>
          )}

          {/* Name */}
          <h3 className={cn(
            "font-bold line-clamp-2 group-hover:text-accent transition-colors duration-200",
            variant === 'compact' ? "text-xs" : "text-sm md:text-base"
          )}>
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-2">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i}
                  className={cn(
                    "h-3.5 w-3.5",
                    i < 4 ? "fill-accent text-accent" : "text-muted-foreground"
                  )}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-muted-foreground">(12)</span>
          </div>

          {/* Price Section */}
          <div className="mt-2 space-y-1">
            <div className="flex items-baseline gap-2">
              <span className={cn(
                "font-bold text-accent text-lg",
                variant === 'compact' ? "text-base" : "text-lg"
              )}>
                {formatCurrency(lowestPrice)}
              </span>
              {highestCompareAt > lowestPrice && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatCurrency(highestCompareAt)}
                </span>
              )}
            </div>

            {/* Variants indicator */}
            {activeVariants.length > 1 && (
              <p className="text-xs text-muted-foreground font-medium">
                {activeVariants.length} options
              </p>
            )}
          </div>

          {/* Stock status indicator */}
          {activeVariants.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-xs font-medium text-green-700">In Stock</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
