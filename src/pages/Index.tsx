import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Clock, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProductCard } from '@/components/products/ProductCard';
import { useProductManagement } from '@/contexts/ProductManagementContext';

const Index = () => {
  const { products, categories, brands } = useProductManagement();

  const publishedProducts = products.filter(p => p.status === 'PUBLISHED' || p.status === 'ACTIVE');
  const featuredProducts = publishedProducts.slice(0, 4);
  const allProducts = publishedProducts.slice(0, 8);
  const mainCategories = categories.filter(c => !c.parentId).slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-40 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl opacity-40 animate-pulse" />
          <div className="absolute bottom-0 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl opacity-40 animate-pulse" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-30" />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-white/5" />

        <div className="container relative z-10 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-full w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                <span className="text-sm text-orange-300">🔥 New Arrivals Every Week</span>
              </div>

              {/* Main heading */}
              <div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight mb-4">
                  Experience Tech Like Never Before
                </h1>
                <div className="h-1.5 w-24 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full" />
              </div>

              {/* Subheading */}
              <p className="text-lg md:text-xl text-slate-300 max-w-lg leading-relaxed">
                Discover the latest electronics and gadgets curated just for you. Premium quality, unbeatable prices, and guaranteed authenticity.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-orange-500/50 transition-all duration-300" asChild>
                  <Link to="/category/phones">
                    Start Shopping
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-700/50 backdrop-blur-sm" asChild>
                  <Link to="/deals">
                    View Hot Deals
                  </Link>
                </Button>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-6 pt-4 border-t border-slate-700 mt-8">
                <div>
                  <p className="text-2xl font-bold text-orange-400">50K+</p>
                  <p className="text-sm text-slate-400">Happy Customers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-400">4.9★</p>
                  <p className="text-sm text-slate-400">Average Rating</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-400">24/7</p>
                  <p className="text-sm text-slate-400">Customer Support</p>
                </div>
              </div>
            </div>

            {/* Right side - Product showcase */}
            <div className="hidden md:flex items-center justify-center relative">
              <div className="relative w-full h-96">
                {/* Floating cards background */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl transform rotate-12 backdrop-blur-sm border border-blue-400/20" />
                <div className="absolute bottom-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl transform -rotate-6 backdrop-blur-sm border border-purple-400/20" />
                
                {/* Main product image */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative z-10">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/30 to-pink-500/30 blur-3xl rounded-full" />
                    <img
                      src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"
                      alt="Featured Product"
                      className="relative w-80 h-80 object-cover rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>

                {/* Badge overlay */}
                <div className="absolute top-10 right-10 z-20 px-4 py-2 bg-red-500 text-white rounded-full font-bold shadow-lg animate-bounce">
                  Save 40%
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-secondary py-8 border-b">
        <div className="container">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over GH₵1,000' },
              { icon: Shield, title: 'Secure Payment', desc: '100% secure checkout' },
              { icon: Clock, title: 'Fast Delivery', desc: '2-5 business days' },
              { icon: CreditCard, title: 'Easy Returns', desc: '30-day return policy' },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-accent/10">
                  <feature.icon className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Shop by Category</h2>
              <p className="text-muted-foreground mt-1">Browse our wide range of products</p>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/categories">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 md:gap-3 lg:gap-4">
            {mainCategories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="group relative aspect-square rounded-xl overflow-hidden"
              >
                <img
                  src={category.imageUrl || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400'}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-semibold text-lg">{category.name}</h3>
                  <p className="text-white/70 text-sm mt-1 group-hover:text-accent transition-colors">
                    Shop now →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 md:py-16 bg-muted/50">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Featured Products</h2>
              <p className="text-muted-foreground mt-1">Hand-picked just for you</p>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/products">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 md:gap-3 lg:gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Banner */}
      <section className="py-12 md:py-16">
        <div className="container">
          <Card className="overflow-hidden bg-gradient-to-r from-accent to-accent/80 border-0">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2 items-center">
                <div className="p-8 md:p-12">
                  <span className="text-accent-foreground/80 font-medium">Limited Time Offer</span>
                  <h3 className="text-3xl md:text-4xl font-bold text-accent-foreground mt-2">
                    Up to 30% Off on iPhones
                  </h3>
                  <p className="text-accent-foreground/80 mt-3">
                    Get the latest iPhone at amazing discounts. Offer valid while stocks last.
                  </p>
                  <Button variant="secondary" size="lg" className="mt-6" asChild>
                    <Link to="/category/apple-phones">
                      Shop Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
                <div className="hidden md:block relative h-64">
                  <img
                    src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600"
                    alt="iPhone Promo"
                    className="absolute inset-0 w-full h-full object-contain p-8"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* All Products */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Explore Our Products</h2>
              <p className="text-muted-foreground mt-1">Discover what we have in store</p>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/products">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 md:gap-3 lg:gap-4">
            {allProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="py-12 md:py-16 bg-muted/50">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Trusted Brands</h2>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {brands.slice(0, 6).map((brand) => (
              <Link
                key={brand.id}
                to={`/brand/${brand.slug}`}
                className="text-2xl font-bold text-muted-foreground/50 hover:text-foreground transition-colors"
              >
                {brand.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
