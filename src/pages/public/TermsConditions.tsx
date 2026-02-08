import { FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function TermsConditions() {
    const lastUpdated = 'February 1, 2026';

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
            {/* Hero */}
            <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground py-16">
                <div className="container text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4" />
                    <h1 className="text-4xl font-bold mb-4">Terms & Conditions</h1>
                    <p className="text-lg opacity-90">Last updated: {lastUpdated}</p>
                </div>
            </div>

            <div className="container py-12">
                <Card className="max-w-4xl mx-auto">
                    <CardContent className="p-8 prose prose-slate dark:prose-invert max-w-none">
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                            <p className="text-muted-foreground">
                                By accessing and using ShopFlow's website and services, you accept and agree to be bound by these
                                Terms and Conditions. If you do not agree to these terms, please do not use our services. These
                                terms apply to all visitors, users, and customers of ShopFlow.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">2. Definitions</h2>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li><strong>"ShopFlow"</strong> refers to ShopFlow Electronics Ltd. and its subsidiaries.</li>
                                <li><strong>"Website"</strong> refers to shopflow.com and all associated subdomains.</li>
                                <li><strong>"User"</strong> refers to any person who accesses or uses our services.</li>
                                <li><strong>"Products"</strong> refers to all items available for purchase on our website.</li>
                                <li><strong>"Order"</strong> refers to a request to purchase products through our website.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">3. Account Registration</h2>
                            <p className="text-muted-foreground mb-4">To make purchases, you must:</p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Be at least 18 years of age</li>
                                <li>Provide accurate and complete registration information</li>
                                <li>Maintain the security of your account credentials</li>
                                <li>Notify us immediately of any unauthorized access</li>
                            </ul>
                            <p className="text-muted-foreground mt-4">
                                You are responsible for all activities that occur under your account.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">4. Products and Pricing</h2>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>All prices are displayed in Ghana Cedis (GH₵) and include applicable taxes unless stated otherwise.</li>
                                <li>We strive to ensure product descriptions and images are accurate, but discrepancies may occur.</li>
                                <li>Prices are subject to change without notice until an order is confirmed.</li>
                                <li>We reserve the right to limit quantities or refuse orders at our discretion.</li>
                                <li>In case of pricing errors, we will notify you and may cancel the order.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">5. Orders and Payment</h2>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>An order is not confirmed until you receive an order confirmation email/SMS.</li>
                                <li>We accept Mobile Money, bank transfers, credit/debit cards, and cash on delivery (select areas).</li>
                                <li>Payment must be completed before order processing (except for COD orders).</li>
                                <li>We reserve the right to cancel orders suspected of fraud.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">6. Shipping and Delivery</h2>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Delivery times are estimates and not guaranteed.</li>
                                <li>Risk of loss passes to you upon delivery to the specified address.</li>
                                <li>You must inspect products upon delivery and report any damage immediately.</li>
                                <li>Multiple delivery attempts may incur additional charges.</li>
                                <li>We are not liable for delays due to circumstances beyond our control.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">7. Returns and Refunds</h2>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Products may be returned within 7 days of delivery for a refund or exchange.</li>
                                <li>Items must be unused, in original packaging, with all accessories and tags.</li>
                                <li>Some products are non-returnable for hygiene reasons (earphones, underwear, etc.).</li>
                                <li>Refunds are processed within 5-7 business days after approval.</li>
                                <li>Shipping costs for returns may be deducted unless the return is due to our error.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">8. Warranty</h2>
                            <p className="text-muted-foreground">
                                All products sold carry manufacturer warranty as specified on the product page. Warranty claims
                                must be submitted with proof of purchase. Warranty does not cover damage from misuse, accidents,
                                or unauthorized repairs.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">9. Intellectual Property</h2>
                            <p className="text-muted-foreground">
                                All content on this website, including text, graphics, logos, images, and software, is the
                                property of ShopFlow or its content suppliers and is protected by intellectual property laws.
                                You may not reproduce, distribute, or create derivative works without written permission.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">10. User Conduct</h2>
                            <p className="text-muted-foreground mb-4">You agree not to:</p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Use the website for any unlawful purpose</li>
                                <li>Attempt to gain unauthorized access to our systems</li>
                                <li>Interfere with the proper functioning of the website</li>
                                <li>Submit false or misleading information</li>
                                <li>Harass or harm other users or our staff</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">11. Limitation of Liability</h2>
                            <p className="text-muted-foreground">
                                To the maximum extent permitted by law, ShopFlow shall not be liable for any indirect, incidental,
                                special, consequential, or punitive damages arising from your use of our services. Our total
                                liability shall not exceed the amount paid by you for the relevant order.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">12. Indemnification</h2>
                            <p className="text-muted-foreground">
                                You agree to indemnify and hold ShopFlow harmless from any claims, damages, losses, or expenses
                                arising from your violation of these terms or your use of our services.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">13. Governing Law</h2>
                            <p className="text-muted-foreground">
                                These terms shall be governed by and construed in accordance with the laws of Ghana. Any disputes
                                shall be subject to the exclusive jurisdiction of the courts of Ghana.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">14. Changes to Terms</h2>
                            <p className="text-muted-foreground">
                                We reserve the right to modify these terms at any time. Changes will be effective upon posting
                                to the website. Continued use of our services after changes constitutes acceptance of the new terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">15. Contact Information</h2>
                            <p className="text-muted-foreground">
                                For questions about these Terms and Conditions, please contact us:
                            </p>
                            <div className="mt-4 p-4 bg-muted rounded-lg">
                                <p className="font-medium">ShopFlow Electronics</p>
                                <p className="text-muted-foreground">123 Tech Street, Osu, Accra, Ghana</p>
                                <p className="text-muted-foreground">Email: legal@shopflow.com</p>
                                <p className="text-muted-foreground">Phone: +233 24 123 4567</p>
                            </div>
                        </section>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
