import { Truck, Clock, MapPin, Package, Shield, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const deliveryZones = [
    { region: 'Greater Accra', standard: '1-2 days', express: 'Same day', standardFee: 15, expressFee: 35 },
    { region: 'Ashanti', standard: '2-3 days', express: 'Next day', standardFee: 25, expressFee: 50 },
    { region: 'Western', standard: '3-4 days', express: '2 days', standardFee: 30, expressFee: 60 },
    { region: 'Central', standard: '2-3 days', express: 'Next day', standardFee: 25, expressFee: 50 },
    { region: 'Eastern', standard: '2-3 days', express: 'Next day', standardFee: 25, expressFee: 50 },
    { region: 'Volta', standard: '3-4 days', express: '2 days', standardFee: 30, expressFee: 60 },
    { region: 'Northern', standard: '4-5 days', express: '3 days', standardFee: 40, expressFee: 80 },
    { region: 'Upper East', standard: '5-6 days', express: '3-4 days', standardFee: 45, expressFee: 90 },
    { region: 'Upper West', standard: '5-6 days', express: '3-4 days', standardFee: 45, expressFee: 90 },
    { region: 'Bono', standard: '3-4 days', express: '2 days', standardFee: 35, expressFee: 70 },
];

export default function ShippingInfo() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
            {/* Hero */}
            <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground py-16">
                <div className="container text-center">
                    <Truck className="h-12 w-12 mx-auto mb-4" />
                    <h1 className="text-4xl font-bold mb-4">Shipping Information</h1>
                    <p className="text-lg opacity-90 max-w-xl mx-auto">
                        Fast, reliable delivery across all 16 regions of Ghana
                    </p>
                </div>
            </div>

            <div className="container py-12 space-y-12">
                {/* Highlights */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="text-center hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                                <Truck className="h-7 w-7 text-blue-500" />
                            </div>
                            <h3 className="font-semibold mb-2">Nationwide Delivery</h3>
                            <p className="text-sm text-muted-foreground">We deliver to all 16 regions in Ghana</p>
                        </CardContent>
                    </Card>
                    <Card className="text-center hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="h-14 w-14 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                                <Clock className="h-7 w-7 text-green-500" />
                            </div>
                            <h3 className="font-semibold mb-2">Same-Day Delivery</h3>
                            <p className="text-sm text-muted-foreground">Available in Greater Accra</p>
                        </CardContent>
                    </Card>
                    <Card className="text-center hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="h-14 w-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
                                <Package className="h-7 w-7 text-orange-500" />
                            </div>
                            <h3 className="font-semibold mb-2">Free Shipping</h3>
                            <p className="text-sm text-muted-foreground">On orders above GH₵1,000</p>
                        </CardContent>
                    </Card>
                    <Card className="text-center hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="h-14 w-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                                <Shield className="h-7 w-7 text-purple-500" />
                            </div>
                            <h3 className="font-semibold mb-2">Secure Packaging</h3>
                            <p className="text-sm text-muted-foreground">Protected and insured shipments</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Delivery Zones */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" /> Delivery Zones & Fees
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Region</TableHead>
                                    <TableHead>Standard Delivery</TableHead>
                                    <TableHead>Standard Fee</TableHead>
                                    <TableHead>Express Delivery</TableHead>
                                    <TableHead>Express Fee</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {deliveryZones.map((zone) => (
                                    <TableRow key={zone.region}>
                                        <TableCell className="font-medium">{zone.region}</TableCell>
                                        <TableCell>{zone.standard}</TableCell>
                                        <TableCell>GH₵{zone.standardFee}</TableCell>
                                        <TableCell>{zone.express}</TableCell>
                                        <TableCell>GH₵{zone.expressFee}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <p className="text-sm text-muted-foreground mt-4">
                            * Delivery times are estimates and may vary based on order volume and location accessibility.
                        </p>
                    </CardContent>
                </Card>

                {/* Shipping Options */}
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Standard Shipping</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                Our standard shipping option is perfect for non-urgent orders. Your package will be
                                delivered within the timeframe shown above.
                            </p>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>• Tracking number provided via SMS/Email</li>
                                <li>• Delivery confirmation signature required</li>
                                <li>• Package insurance up to GH₵5,000</li>
                                <li>• Monday to Saturday delivery</li>
                            </ul>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Express Shipping</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                Need it fast? Our express shipping ensures priority handling and the quickest
                                delivery times available.
                            </p>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>• Same-day delivery in Accra (orders before 12pm)</li>
                                <li>• Priority handling and dispatch</li>
                                <li>• Real-time tracking updates</li>
                                <li>• Package insurance up to GH₵10,000</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Store Pickup */}
                <Card>
                    <CardHeader>
                        <CardTitle>Store Pickup</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            Prefer to pick up your order? Choose store pickup at checkout for a completely free option.
                        </p>
                        <div className="grid md:grid-cols-2 gap-6 mt-4">
                            <div className="p-4 bg-muted rounded-lg">
                                <h4 className="font-semibold mb-2">Pickup Location</h4>
                                <p className="text-sm text-muted-foreground">ShopFlow Store</p>
                                <p className="text-sm text-muted-foreground">123 Tech Street, Osu</p>
                                <p className="text-sm text-muted-foreground">Accra, Ghana</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                                <h4 className="font-semibold mb-2">Pickup Hours</h4>
                                <p className="text-sm text-muted-foreground">Monday - Friday: 9am - 7pm</p>
                                <p className="text-sm text-muted-foreground">Saturday: 10am - 5pm</p>
                                <p className="text-sm text-muted-foreground">Sunday: Closed</p>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            <strong>Note:</strong> Please wait for the "Ready for Pickup" confirmation before visiting the store.
                            Bring a valid ID and your order confirmation.
                        </p>
                    </CardContent>
                </Card>

                {/* FAQ */}
                <Card>
                    <CardHeader>
                        <CardTitle>Shipping FAQs</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h4 className="font-semibold mb-2">How do I track my order?</h4>
                            <p className="text-sm text-muted-foreground">
                                Once your order is shipped, you'll receive an SMS with a tracking link. You can also
                                track your order in your account under "My Orders" or use our Track Order page.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">What if I'm not home during delivery?</h4>
                            <p className="text-sm text-muted-foreground">
                                Our delivery agent will call you before arriving. If you're not available, you can
                                reschedule delivery or authorize someone else to receive the package.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Do you deliver to PO Boxes?</h4>
                            <p className="text-sm text-muted-foreground">
                                We currently only deliver to physical addresses. PO Box delivery is not available.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">What's the cut-off time for same-day delivery?</h4>
                            <p className="text-sm text-muted-foreground">
                                For same-day delivery in Greater Accra, orders must be placed and paid for before 12pm.
                                Orders after this time will be delivered the next day.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Contact */}
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-8 text-center">
                        <Phone className="h-10 w-10 text-primary mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Need Help with Shipping?</h3>
                        <p className="text-muted-foreground mb-4">
                            Our customer support team is ready to assist you with any shipping questions.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <a href="tel:+233241234567" className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 text-sm font-medium">
                                Call +233 24 123 4567
                            </a>
                            <a href="/contact" className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-6 text-sm font-medium">
                                Contact Us
                            </a>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
