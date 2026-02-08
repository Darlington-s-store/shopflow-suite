import { Link } from 'react-router-dom';
import { Users, Award, Target, Heart, Truck, Shield, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const stats = [
    { label: 'Happy Customers', value: '50K+' },
    { label: 'Products Sold', value: '200K+' },
    { label: 'Delivery Cities', value: '100+' },
    { label: 'Years in Business', value: '5+' },
];

const values = [
    {
        icon: Award,
        title: 'Quality First',
        description: 'We only sell 100% genuine products from authorized distributors and brands.'
    },
    {
        icon: Heart,
        title: 'Customer Love',
        description: 'Your satisfaction is our priority. We go above and beyond to serve you better.'
    },
    {
        icon: Truck,
        title: 'Fast Delivery',
        description: 'Same-day delivery in Accra and nationwide shipping to all 16 regions.'
    },
    {
        icon: Shield,
        title: 'Secure Shopping',
        description: 'Your data and payments are protected with industry-standard encryption.'
    },
];

const team = [
    { name: 'Kwame Asante', role: 'Founder & CEO', image: '/placeholder-team-1.jpg' },
    { name: 'Ama Mensah', role: 'Head of Operations', image: '/placeholder-team-2.jpg' },
    { name: 'Kofi Adjei', role: 'Tech Lead', image: '/placeholder-team-3.jpg' },
    { name: 'Akua Boateng', role: 'Customer Success', image: '/placeholder-team-4.jpg' },
];

export default function AboutUs() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-primary to-accent text-primary-foreground py-20">
                <div className="absolute inset-0 bg-grid-white/10" />
                <div className="container relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                            About ShopFlow
                        </h1>
                        <p className="text-lg opacity-90 mb-8">
                            We're on a mission to make quality electronics accessible to everyone in Ghana.
                            Since 2021, we've been serving customers with genuine products, competitive prices,
                            and exceptional service.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Button size="lg" variant="secondary" asChild>
                                <Link to="/products">Shop Now</Link>
                            </Button>
                            <Button size="lg" variant="outline" className="border-white/30 hover:bg-white/10" asChild>
                                <Link to="/contact">Contact Us</Link>
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
            </div>

            {/* Stats */}
            <div className="container -mt-12 relative z-20">
                <Card className="shadow-xl">
                    <CardContent className="p-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            {stats.map((stat, index) => (
                                <div key={index}>
                                    <p className="text-3xl lg:text-4xl font-bold text-primary mb-1">{stat.value}</p>
                                    <p className="text-muted-foreground">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="container py-16 space-y-20">
                {/* Our Story */}
                <section className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                        <div className="space-y-4 text-muted-foreground">
                            <p>
                                ShopFlow was born out of a simple frustration: finding genuine electronics
                                in Ghana shouldn't be so difficult. Our founder, Kwame Asante, experienced
                                firsthand the challenges of buying tech products – from inflated prices to
                                counterfeit goods.
                            </p>
                            <p>
                                In 2021, we set out to change that. Starting from a small shop in Osu,
                                we've grown into one of Ghana's most trusted online electronics retailers.
                                Today, we serve thousands of customers across all 16 regions.
                            </p>
                            <p>
                                Our success is built on three pillars: authenticity, affordability, and
                                accessibility. Every product we sell is 100% genuine, competitively priced,
                                and delivered right to your doorstep.
                            </p>
                        </div>
                    </div>
                    <div className="bg-muted rounded-2xl aspect-video flex items-center justify-center">
                        <Target className="h-24 w-24 text-muted-foreground/30" />
                    </div>
                </section>

                {/* Our Values */}
                <section>
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Our Values</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            These core values guide everything we do at ShopFlow
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((value, index) => (
                            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                        <value.icon className="h-7 w-7 text-primary" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                                    <p className="text-sm text-muted-foreground">{value.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Why Choose Us */}
                <section className="bg-muted/30 -mx-4 px-4 py-16 rounded-3xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Why Choose ShopFlow?</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                                <Shield className="h-6 w-6 text-green-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">100% Genuine Products</h3>
                                <p className="text-sm text-muted-foreground">
                                    All products come with official warranty and are sourced from authorized distributors.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                <Truck className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Nationwide Delivery</h3>
                                <p className="text-sm text-muted-foreground">
                                    We deliver to all 16 regions with same-day delivery in Greater Accra.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                                <Clock className="h-6 w-6 text-purple-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">24/7 Support</h3>
                                <p className="text-sm text-muted-foreground">
                                    Our customer support team is always ready to help you with any questions.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Team */}
                <section>
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            The passionate people behind ShopFlow
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {team.map((member, index) => (
                            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="aspect-square bg-muted flex items-center justify-center">
                                    <Users className="h-16 w-16 text-muted-foreground/30" />
                                </div>
                                <CardContent className="p-4 text-center">
                                    <h3 className="font-semibold">{member.name}</h3>
                                    <p className="text-sm text-muted-foreground">{member.role}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section>
                    <Card className="bg-gradient-to-r from-primary to-accent text-primary-foreground overflow-hidden">
                        <CardContent className="p-12 text-center relative">
                            <div className="absolute inset-0 bg-grid-white/10" />
                            <div className="relative z-10">
                                <Star className="h-12 w-12 mx-auto mb-4" />
                                <h2 className="text-3xl font-bold mb-4">Ready to Shop?</h2>
                                <p className="opacity-90 mb-6 max-w-md mx-auto">
                                    Join thousands of satisfied customers and experience the ShopFlow difference.
                                </p>
                                <Button size="lg" variant="secondary" asChild>
                                    <Link to="/products">Browse Products</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </div>
    );
}
