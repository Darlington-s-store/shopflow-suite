import { RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function ReturnPolicy() {
    const lastUpdated = 'February 1, 2026';

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
            {/* Hero */}
            <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground py-16">
                <div className="container text-center">
                    <RotateCcw className="h-12 w-12 mx-auto mb-4" />
                    <h1 className="text-4xl font-bold mb-4">Return & Refund Policy</h1>
                    <p className="text-lg opacity-90">Last updated: {lastUpdated}</p>
                </div>
            </div>

            <div className="container py-12">
                <Card className="max-w-4xl mx-auto">
                    <CardContent className="p-8 prose prose-slate dark:prose-invert max-w-none">
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">Our Satisfaction Guarantee</h2>
                            <p className="text-muted-foreground">
                                At ShopFlow, we want you to be completely satisfied with your purchase. If for any reason
                                you are not happy with your order, we offer a hassle-free return and refund policy. Please
                                read the following terms carefully.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">Return Window</h2>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li><strong>7 Days:</strong> You have 7 days from the date of delivery to request a return.</li>
                                <li><strong>Starting Point:</strong> The return period starts from the day you receive your order.</li>
                                <li><strong>Notification:</strong> Contact our customer service within the return window to initiate a return.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">Items Eligible for Return</h2>
                            <p className="text-muted-foreground mb-4">To be eligible for a return, your item must be:</p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>In the same condition that you received it</li>
                                <li>Unused and in its original packaging</li>
                                <li>Accompanied by the original receipt or proof of purchase</li>
                                <li>Complete with all accessories, manuals, and free gifts (if any)</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">Non-Returnable Items</h2>
                            <p className="text-muted-foreground mb-4">The following items cannot be returned for hygiene and safety reasons:</p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Earphones and headphones (once opened)</li>
                                <li>Undergarments and intimate apparel</li>
                                <li>Perishable goods</li>
                                <li>Gift cards</li>
                                <li>Downloadable software products</li>
                                <li>Items marked as "Final Sale" or "Non-Returnable"</li>
                                <li>Customized or personalized items</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">Damaged or Defective Items</h2>
                            <p className="text-muted-foreground">
                                If you receive a damaged or defective item, please contact us within 48 hours of delivery
                                with photos of the damage. We will arrange for a replacement or full refund at no extra
                                cost to you. Damaged items must be reported via email or phone with clear images of the
                                product and packaging.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">How to Request a Return</h2>
                            <ol className="list-decimal pl-6 text-muted-foreground space-y-3">
                                <li>
                                    <strong>Contact Us:</strong> Email support@shopflow.com or call +233 24 123 4567 with your
                                    order number and reason for return.
                                </li>
                                <li>
                                    <strong>Get Approval:</strong> Our team will review your request and provide a Return
                                    Authorization (RA) number within 24-48 hours.
                                </li>
                                <li>
                                    <strong>Pack the Item:</strong> Securely pack the item in its original packaging with all
                                    accessories included.
                                </li>
                                <li>
                                    <strong>Ship or Drop-off:</strong> You can ship the item to our return center or drop it
                                    off at our store in Osu, Accra.
                                </li>
                                <li>
                                    <strong>Inspection:</strong> Once received, we will inspect the item within 3 business days.
                                </li>
                            </ol>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">Refund Process</h2>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li><strong>Approval:</strong> Once your return is approved, we will process your refund.</li>
                                <li><strong>Method:</strong> Refunds will be credited to the original payment method used.</li>
                                <li><strong>Timeline:</strong> Refunds are processed within 5-7 business days after approval.</li>
                                <li><strong>Bank Processing:</strong> Your bank may take additional 1-5 days to credit your account.</li>
                                <li><strong>Mobile Money:</strong> MoMo refunds are typically faster, within 24-48 hours.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">Return Shipping Costs</h2>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li><strong>Defective/Wrong Items:</strong> We cover all return shipping costs.</li>
                                <li><strong>Change of Mind:</strong> Customer pays return shipping costs (may be deducted from refund).</li>
                                <li><strong>Free Return Pickup:</strong> Available in Greater Accra for orders above GH₵1,000.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">Exchanges</h2>
                            <p className="text-muted-foreground">
                                If you wish to exchange an item for a different size, color, or model, please initiate a
                                return and place a new order for the desired item. This ensures the fastest processing time.
                                For exchanges of defective items, contact our support team for assistance.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">Partial Refunds</h2>
                            <p className="text-muted-foreground mb-4">Partial refunds may be issued in the following cases:</p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Items showing obvious signs of use</li>
                                <li>Items not in original packaging</li>
                                <li>Items missing parts or accessories</li>
                                <li>Items returned after the 7-day window (at our discretion)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                            <p className="text-muted-foreground">
                                If you have questions about our return policy, please contact us:
                            </p>
                            <div className="mt-4 p-4 bg-muted rounded-lg">
                                <p className="font-medium">ShopFlow Customer Service</p>
                                <p className="text-muted-foreground">Email: returns@shopflow.com</p>
                                <p className="text-muted-foreground">Phone: +233 24 123 4567</p>
                                <p className="text-muted-foreground">WhatsApp: +233 50 987 6543</p>
                                <p className="text-muted-foreground mt-2">Hours: Monday - Saturday, 9am - 6pm</p>
                            </div>
                        </section>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
