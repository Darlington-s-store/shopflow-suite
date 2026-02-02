import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Clock, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProductCard } from '@/components/products/ProductCard';
import { products, categories, brands } from '@/data/mockData';

const Index = () => {
  const featuredProducts = products.filter(p => p.isFeatured && p.isActive).slice(0, 4);
  const allProducts = products.filter(p => p.isActive).slice(0, 8);
  const mainCategories = categories[0]?.children || [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1920')] bg-cover bg-center opacity-10" />
        <div className="container relative py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Latest Tech,
                <span className="text-accent block">Best Prices</span>
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/80 max-w-md">
                Discover the newest electronics and gadgets at unbeatable prices. Quality guaranteed.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/category/phones">
                    Shop Phones
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 hover:bg-primary-foreground/10" asChild>
                  <Link to="/deals">
                    View Deals
                  </Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600"
                alt="Featured Product"
                className="rounded-2xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-secondary py-8 border-b">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over ₦100,000' },
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {mainCategories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="group relative aspect-square rounded-xl overflow-hidden"
              >
                <img
                  src={category.image || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400'}
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
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
