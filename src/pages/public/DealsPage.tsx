import { Link } from 'react-router-dom';
import { Flame, Clock, Percent, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/products/ProductCard';
import { useProductManagement } from '@/contexts/ProductManagementContext';

export default function DealsPage() {
    const { products } = useProductManagement();

    // Filter products with discounts (where discountPrice exists and is less than price)
    const discountedProducts = products.filter(p =>
        (p.status === 'PUBLISHED' || p.status === 'ACTIVE') &&
        p.variants.some(v => v.discountPrice && v.discountPrice < v.price)
    );

    // Simulate flash sale with highly discounted items (e.g. > 20% off) or just top discounted
    const flashSaleProducts = discountedProducts.slice(0, 4);

    // Simulate best sellers
    const bestSellers = products.filter(p => p.status === 'PUBLISHED' || p.status === 'ACTIVE').slice(0, 4);

    // Calculate remaining time for flash sale (demo)
    const flashSaleEnd = new Date();
    flashSaleEnd.setHours(flashSaleEnd.getHours() + 5);
    flashSaleEnd.setMinutes(flashSaleEnd.getMinutes() + 32);

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
            {/* Hero Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white py-16">
                <div className="absolute inset-0 bg-grid-white/10" />
                <div className="container relative z-10">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Flame className="h-8 w-8 animate-pulse" />
                            <Badge variant="secondary" className="bg-white/20 text-white border-0">
                                Limited Time Only
                            </Badge>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                            Hot Deals & Flash Sales
                        </h1>
                        <p className="text-lg opacity-90 mb-6">
                            Don't miss out on our biggest discounts! Save up to 40% on selected items.
                        </p>
                        <div className="flex gap-3">
                            <Button size="lg" variant="secondary" className="gap-2">
                                Shop All Deals <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            </div>

            <div className="container py-12 space-y-12">
                {/* Flash Sale Section */}
                {flashSaleProducts.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                                    <Flame className="h-6 w-6 text-red-500" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">Flash Sale</h2>
                                    <p className="text-muted-foreground">Hurry! These deals won't last long</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-red-500" />
                                <span className="text-muted-foreground">Ends in:</span>
                                <div className="flex gap-1">
                                    <Badge variant="secondary" className="font-mono">05</Badge>
                                    <span>:</span>
                                    <Badge variant="secondary" className="font-mono">32</Badge>
                                    <span>:</span>
                                    <Badge variant="secondary" className="font-mono">15</Badge>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {flashSaleProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Discounted Products */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                <Percent className="h-6 w-6 text-green-500" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Price Drops</h2>
                                <p className="text-muted-foreground">Products with reduced prices</p>
                            </div>
                        </div>
                        <Button variant="outline" asChild>
                            <Link to="/products?filter=sale">View All</Link>
                        </Button>
                    </div>
                    {discountedProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {discountedProducts.slice(0, 8).map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Percent className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium">No discounted products right now</h3>
                                <p className="text-muted-foreground">Check back soon for amazing deals!</p>
                            </CardContent>
                        </Card>
                    )}
                </section>

                {/* Deal of the Day */}
                <section>
                    <Card className="overflow-hidden bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
                        <CardContent className="p-0">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="p-8 flex flex-col justify-center">
                                    <Badge className="w-fit mb-4 gap-1">
                                        <Sparkles className="h-3 w-3" /> Deal of the Day
                                    </Badge>
                                    <h2 className="text-3xl font-bold mb-2">
                                        {products[0]?.name || 'Featured Product'}
                                    </h2>
                                    <p className="text-muted-foreground mb-4">
                                        {products[0]?.shortDescription?.slice(0, 150)}...
                                    </p>
                                    <div className="flex items-center gap-4 mb-6">
                                        <span className="text-3xl font-bold text-primary">
                                            GH₵{(products[0]?.variants[0]?.discountPrice || products[0]?.variants[0]?.price || 0).toLocaleString()}
                                        </span>
                                        {products[0]?.variants[0]?.discountPrice && (
                                            <span className="text-xl text-muted-foreground line-through">
                                                GH₵{(products[0]?.variants[0]?.price || 0).toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                    <Button size="lg" className="w-fit gap-2" asChild>
                                        <Link to={`/product/${products[0]?.slug}`}>
                                            Shop Now <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                                <div className="bg-muted flex items-center justify-center p-8">
                                    <img
                                        src={products[0]?.images[0]?.url}
                                        alt={products[0]?.name}
                                        className="max-h-80 object-contain"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Best Sellers */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                                <Sparkles className="h-6 w-6 text-yellow-500" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Best Sellers</h2>
                                <p className="text-muted-foreground">Our most popular products</p>
                            </div>
                        </div>
                        <Button variant="outline" asChild>
                            <Link to="/products?filter=bestseller">View All</Link>
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {bestSellers.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </section>

                {/* Newsletter CTA */}
                <section>
                    <Card className="bg-gradient-to-r from-primary to-accent text-primary-foreground overflow-hidden">
                        <CardContent className="p-8 text-center relative">
                            <div className="absolute inset-0 bg-grid-white/10" />
                            <div className="relative z-10">
                                <h2 className="text-2xl font-bold mb-2">Never Miss a Deal</h2>
                                <p className="opacity-90 mb-6 max-w-md mx-auto">
                                    Subscribe to our newsletter and be the first to know about exclusive discounts and flash sales.
                                </p>
                                <div className="flex gap-3 max-w-md mx-auto">
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        className="flex-1 px-4 py-2 rounded-lg bg-white/20 placeholder:text-white/60 text-white border border-white/30 focus:outline-none focus:border-white"
                                    />
                                    <Button variant="secondary">Subscribe</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </div>
    );
}
