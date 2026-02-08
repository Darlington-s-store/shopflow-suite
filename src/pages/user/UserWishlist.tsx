import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

export default function UserWishlist() {
    const { products, removeFromWishlist, clearWishlist } = useWishlist();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const handleAddToCart = (product: typeof products[0]) => {
        if (product.variants[0]) {
            addToCart(product.id, product.variants[0].id, 1);
            toast.success(`${product.name} added to cart!`);
        }
    };

    const handleRemove = (productId: string, productName: string) => {
        removeFromWishlist(productId);
        toast.success(`${productName} removed from wishlist`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">My Wishlist</h1>
                    <p className="text-muted-foreground">
                        {products.length} item{products.length !== 1 ? 's' : ''} saved
                    </p>
                </div>
                {products.length > 0 && (
                    <Button
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                            clearWishlist();
                            toast.success('Wishlist cleared');
                        }}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear All
                    </Button>
                )}
            </div>

            {/* Product Grid */}
            {products.length === 0 ? (
                <Card className="border-0 shadow-soft bg-card/80">
                    <CardContent className="py-16 text-center">
                        <Heart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                        <h3 className="text-lg font-medium mb-2">Your wishlist is empty</h3>
                        <p className="text-muted-foreground mb-4">
                            Browse our products and save your favorites here
                        </p>
                        <Button onClick={() => navigate('/products')}>
                            Explore Products
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => {
                        const primaryVariant = product.variants[0];
                        const hasDiscount = primaryVariant?.compareAtPrice && primaryVariant.compareAtPrice > primaryVariant.price;
                        const discountPercent = hasDiscount
                            ? Math.round((1 - primaryVariant.price / primaryVariant.compareAtPrice!) * 100)
                            : 0;

                        return (
                            <Card
                                key={product.id}
                                className="group overflow-hidden border-0 shadow-soft bg-card/80 hover:shadow-lg transition-all duration-300"
                            >
                                <div className="relative aspect-square overflow-hidden bg-muted">
                                    <img
                                        src={product.images[0]?.url}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onClick={() => navigate(`/product/${product.slug}`)}
                                        style={{ cursor: 'pointer' }}
                                    />

                                    {hasDiscount && (
                                        <Badge className="absolute top-3 left-3 bg-destructive">
                                            -{discountPercent}%
                                        </Badge>
                                    )}

                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleRemove(product.id, product.name)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>

                                    {primaryVariant?.stock === 0 && (
                                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                            <Badge variant="secondary" className="text-lg py-2 px-4">
                                                Out of Stock
                                            </Badge>
                                        </div>
                                    )}
                                </div>

                                <CardContent className="p-4 space-y-3">
                                    <div>
                                        <h3
                                            className="font-semibold line-clamp-1 cursor-pointer hover:text-primary transition-colors"
                                            onClick={() => navigate(`/product/${product.slug}`)}
                                        >
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                            {product.shortDescription || product.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {[...Array(5)].map((_, i) => (
                                            <svg
                                                key={i}
                                                className={`h-4 w-4 ${i < Math.floor(product.averageRating)
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-muted stroke-muted-foreground'
                                                    }`}
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                            </svg>
                                        ))}
                                        <span className="text-sm text-muted-foreground">
                                            ({product.reviewCount})
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-lg font-bold text-primary">
                                                GH₵{primaryVariant?.price.toLocaleString()}
                                            </p>
                                            {hasDiscount && (
                                                <p className="text-sm text-muted-foreground line-through">
                                                    GH₵{primaryVariant?.compareAtPrice?.toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            size="sm"
                                            disabled={!primaryVariant || primaryVariant.stock === 0}
                                            onClick={() => handleAddToCart(product)}
                                        >
                                            <ShoppingCart className="h-4 w-4 mr-2" />
                                            Add to Cart
                                        </Button>
                                    </div>

                                    {primaryVariant && primaryVariant.stock > 0 && primaryVariant.stock <= 5 && (
                                        <p className="text-sm text-orange-500 flex items-center gap-1">
                                            <Package className="h-4 w-4" />
                                            Only {primaryVariant.stock} left in stock
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
