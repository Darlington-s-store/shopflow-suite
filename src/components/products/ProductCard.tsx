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
        "group overflow-hidden card-hover border-0 shadow-soft",
        variant === 'compact' && "shadow-none border"
      )}>
        <div className="relative aspect-product bg-muted overflow-hidden">
          <img
            src={primaryImage?.url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {discount > 0 && (
              <Badge variant="destructive" className="font-semibold">
                -{discount}%
              </Badge>
            )}
            {/* 'isFeatured' is missing from Product type, assuming false or could be added later */}
          </div>

          {/* Actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="secondary"
              className={cn(
                "h-9 w-9 rounded-full shadow-md",
                inWishlist && "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              )}
              onClick={handleWishlist}
            >
              <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
            </Button>
          </div>

          {/* Quick add */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleAddToCart}
              disabled={!defaultVariant}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>

        <CardContent className={cn("p-2 md:p-3", variant === 'compact' && "p-2")}>
          {/* Brand */}
          {product.brandId && (
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
              {/* Fallback brand name logic since we only have ID here ideally would fetch name */}
              Brand
            </p>
          )}

          {/* Name */}
          <h3 className={cn(
            "font-semibold line-clamp-2 group-hover:text-accent transition-colors",
            variant === 'compact' ? "text-xs" : "text-sm"
          )}>
            {product.name}
          </h3>

          {/* Rating - Placeholder */}
          <div className="flex items-center gap-1 mt-2">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span className="text-sm font-medium">4.5</span>
            <span className="text-sm text-muted-foreground">(0)</span>
          </div>

          {/* Price */}
          <div className="mt-1 flex items-baseline gap-2">
            <span className={cn(
              "font-bold",
              variant === 'compact' ? "text-sm" : "text-base"
            )}>
              {formatCurrency(lowestPrice)}
            </span>
            {highestCompareAt > lowestPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatCurrency(highestCompareAt)}
              </span>
            )}
          </div>

          {/* Variants indicator */}
          {activeVariants.length > 1 && (
            <p className="text-xs text-muted-foreground mt-2">
              {activeVariants.length} options available
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
