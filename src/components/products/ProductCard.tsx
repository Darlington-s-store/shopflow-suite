import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Product, ProductVariant } from '@/types';
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

  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
  const lowestPrice = Math.min(...product.variants.filter(v => v.isActive).map(v => v.price));
  const highestCompareAt = Math.max(...product.variants.filter(v => v.isActive && v.compareAtPrice).map(v => v.compareAtPrice || 0));
  const discount = calculateDiscount(lowestPrice, highestCompareAt);
  const inWishlist = isInWishlist(product.id);
  const defaultVariant = product.variants.find(v => v.isActive) || product.variants[0];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (defaultVariant) {
      addToCart(product.id, defaultVariant.id);
      toast.success('Added to cart', {
        description: `${product.name} has been added to your cart.`,
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
            alt={primaryImage?.alt || product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {discount && (
              <Badge variant="destructive" className="font-semibold">
                -{discount}%
              </Badge>
            )}
            {product.isFeatured && (
              <Badge className="bg-accent text-accent-foreground">
                Featured
              </Badge>
            )}
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
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>

        <CardContent className={cn("p-4", variant === 'compact' && "p-3")}>
          {/* Brand */}
          {product.brandId && (
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
              {product.brandId.replace('brand-', '').charAt(0).toUpperCase() + product.brandId.replace('brand-', '').slice(1)}
            </p>
          )}

          {/* Name */}
          <h3 className={cn(
            "font-semibold line-clamp-2 group-hover:text-accent transition-colors",
            variant === 'compact' ? "text-sm" : "text-base"
          )}>
            {product.name}
          </h3>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span className="text-sm font-medium">{product.averageRating}</span>
              <span className="text-sm text-muted-foreground">({product.reviewCount})</span>
            </div>
          )}

          {/* Price */}
          <div className="mt-2 flex items-baseline gap-2">
            <span className={cn(
              "font-bold",
              variant === 'compact' ? "text-base" : "text-lg"
            )}>
              {formatCurrency(lowestPrice)}
            </span>
            {highestCompareAt > 0 && (
              <span className="text-sm text-muted-foreground line-through">
                {formatCurrency(highestCompareAt)}
              </span>
            )}
          </div>

          {/* Variants indicator */}
          {product.variants.length > 1 && (
            <p className="text-xs text-muted-foreground mt-2">
              {product.variants.filter(v => v.isActive).length} options available
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
