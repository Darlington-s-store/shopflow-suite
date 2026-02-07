import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, ShoppingCart, Truck, Shield, Clock, Star, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Product {
  id: number;
  name: string;
  slug: string;
  basePrice: number;
  discountPrice?: number;
  shortDescription: string;
  fullDescription: string;
  rating?: number;
  reviewCount?: number;
  images: Array<{ id: number; imageUrl: string; isFeatured: boolean }>;
  variants: Array<{ id: number; color?: string; storage?: string; price: number; stock: number }>;
  categoryId: number;
  brandId: number;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ModernProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // Assuming endpoint returns product by slug or ID
        const res = await fetch(`${API_BASE_URL}/products/${slug}`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setProduct(data.product);
          if (data.product.variants?.length > 0) {
            setSelectedVariant(data.product.variants[0].id);
          }
        }
      } catch (error) {
        toast.error('Failed to load product');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  // Fetch reviews
  useEffect(() => {
    if (product?.id) {
      const fetchReviews = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/reviews/${product.id}`, {
            credentials: 'include'
          });
          if (res.ok) {
            const data = await res.json();
            setReviews(data.reviews || []);
          }
        } catch (error) {
          console.error('Failed to load reviews:', error);
        }
      };

      fetchReviews();
    }
  }, [product?.id]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add to cart');
      return;
    }

    if (!product) return;

    try {
      const res = await fetch(`${API_BASE_URL}/user/cart`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          variantId: selectedVariant || null,
          quantity
        })
      });

      if (res.ok) {
        toast.success('Added to cart');
      } else {
        toast.error('Failed to add to cart');
      }
    } catch (error) {
      toast.error('Error adding to cart');
      console.error(error);
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      toast.error('Please login to wishlist');
      return;
    }

    if (!product) return;

    try {
      const method = isWishlisted ? 'DELETE' : 'POST';
      const url = isWishlisted 
        ? `${API_BASE_URL}/user/wishlist/${product.id}`
        : `${API_BASE_URL}/user/wishlist`;

      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        ...(method === 'POST' && { body: JSON.stringify({ productId: product.id }) })
      });

      if (res.ok) {
        setIsWishlisted(!isWishlisted);
        toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
      }
    } catch (error) {
      toast.error('Error updating wishlist');
      console.error(error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!product) {
    return <div className="flex justify-center items-center min-h-screen">Product not found</div>;
  }

  const selectedVariantData = product.variants?.find(v => v.id === selectedVariant);
  const displayPrice = selectedVariantData?.price || product.basePrice;
  const discount = product.discountPrice ? Math.round(((product.basePrice - product.discountPrice) / product.basePrice) * 100) : 0;
  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Product Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg overflow-hidden border">
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <img
                  src={product.images?.[selectedImageIndex]?.imageUrl || '/placeholder.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden ${
                      selectedImageIndex === idx ? 'border-primary' : 'border-gray-200'
                    }`}
                  >
                    <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Rating */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(Number(avgRating))
                          ? 'fill-primary text-primary'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold">{avgRating}</span>
                <a href="#reviews" className="text-primary underline">
                  ({reviews.length} reviews)
                </a>
              </div>
            </div>

            {/* Price Section */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-end gap-4 mb-2">
                  <span className="text-4xl font-bold text-primary">
                    GHS {displayPrice.toFixed(2)}
                  </span>
                  {product.discountPrice && (
                    <span className="text-xl line-through text-gray-500">
                      GHS {product.basePrice.toFixed(2)}
                    </span>
                  )}
                </div>
                {discount > 0 && (
                  <Badge className="bg-red-500">{discount}% OFF</Badge>
                )}
                <p className="text-sm text-gray-600 mt-3">
                  {selectedVariantData?.stock > 0 ? (
                    <span className="text-green-600 font-semibold">In Stock</span>
                  ) : (
                    <span className="text-red-600 font-semibold">Out of Stock</span>
                  )}
                </p>
              </CardContent>
            </Card>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant.id)}
                      className={`w-full p-3 border-2 rounded-lg text-left transition ${
                        selectedVariant === variant.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">
                          {variant.color && `${variant.color}`}
                          {variant.color && variant.storage && ' - '}
                          {variant.storage && `${variant.storage}`}
                        </span>
                        <span className="text-primary font-bold">
                          GHS {variant.price.toFixed(2)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {variant.stock} in stock
                      </span>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="font-semibold">Quantity:</span>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  −
                </button>
                <span className="px-6 py-2 font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                size="lg"
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={handleAddToCart}
                disabled={selectedVariantData?.stock === 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant={isWishlisted ? 'default' : 'outline'}
                className="px-6"
                onClick={handleToggleWishlist}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="flex flex-col items-center text-center">
                <Truck className="w-6 h-6 text-primary mb-2" />
                <span className="text-sm font-medium">Free Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <Shield className="w-6 h-6 text-primary mb-2" />
                <span className="text-sm font-medium">Secure Payment</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <Clock className="w-6 h-6 text-primary mb-2" />
                <span className="text-sm font-medium">7-Day Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="text-gray-700 mb-4">{product.shortDescription}</p>
              <div className="text-gray-600 whitespace-pre-line">
                {product.fullDescription}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <Card id="reviews">
          <CardHeader>
            <CardTitle>Customer Reviews ({reviews.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="border-b pb-6 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'fill-primary text-primary'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="font-semibold ml-2">{review.userName}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
