import { Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicy() {
    const lastUpdated = 'February 1, 2026';

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
            {/* Hero */}
            <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground py-16">
                <div className="container text-center">
                    <Shield className="h-12 w-12 mx-auto mb-4" />
                    <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
                    <p className="text-lg opacity-90">Last updated: {lastUpdated}</p>
                </div>
            </div>

            <div className="container py-12">
                <Card className="max-w-4xl mx-auto">
                    <CardContent className="p-8 prose prose-slate dark:prose-invert max-w-none">
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
                            <p className="text-muted-foreground">
                                Welcome to ShopFlow ("we," "our," or "us"). We are committed to protecting your personal information
                                and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard
                                your information when you visit our website and use our services.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
                            <p className="text-muted-foreground mb-4">We collect information that you provide directly to us, including:</p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li><strong>Personal Information:</strong> Name, email address, phone number, delivery address</li>
                                <li><strong>Account Information:</strong> Username, password, account preferences</li>
                                <li><strong>Payment Information:</strong> Mobile money number, card details (processed securely by our payment provider)</li>
                                <li><strong>Order Information:</strong> Products purchased, order history, delivery preferences</li>
                                <li><strong>Communication Data:</strong> Customer support inquiries, feedback, reviews</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
                            <p className="text-muted-foreground mb-4">We use your information to:</p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Process and fulfill your orders</li>
                                <li>Send order confirmations, shipping updates, and delivery notifications</li>
                                <li>Communicate with you about products, services, and promotions</li>
                                <li>Provide customer support and respond to inquiries</li>
                                <li>Improve our website, products, and services</li>
                                <li>Detect and prevent fraud and unauthorized access</li>
                                <li>Comply with legal obligations</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">4. Information Sharing</h2>
                            <p className="text-muted-foreground mb-4">We may share your information with:</p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li><strong>Delivery Partners:</strong> To fulfill and deliver your orders</li>
                                <li><strong>Payment Processors:</strong> To process payments securely</li>
                                <li><strong>Service Providers:</strong> Who assist in our business operations</li>
                                <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
                            </ul>
                            <p className="text-muted-foreground mt-4">
                                We do not sell your personal information to third parties for marketing purposes.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">5. Data Security</h2>
                            <p className="text-muted-foreground">
                                We implement appropriate technical and organizational measures to protect your personal information
                                against unauthorized access, alteration, disclosure, or destruction. This includes encryption,
                                secure servers, and regular security assessments. However, no method of transmission over the
                                Internet is 100% secure, and we cannot guarantee absolute security.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">6. Cookies and Tracking</h2>
                            <p className="text-muted-foreground">
                                We use cookies and similar tracking technologies to enhance your browsing experience, analyze
                                website traffic, and personalize content. You can control cookie preferences through your
                                browser settings. Note that disabling cookies may affect some website functionality.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">7. Your Rights</h2>
                            <p className="text-muted-foreground mb-4">You have the right to:</p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Access your personal information</li>
                                <li>Correct inaccurate or incomplete data</li>
                                <li>Request deletion of your data</li>
                                <li>Opt-out of marketing communications</li>
                                <li>Request a copy of your data</li>
                            </ul>
                            <p className="text-muted-foreground mt-4">
                                To exercise these rights, please contact us at privacy@shopflow.com.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">8. Data Retention</h2>
                            <p className="text-muted-foreground">
                                We retain your personal information for as long as necessary to fulfill the purposes outlined
                                in this policy, unless a longer retention period is required by law. Order history and account
                                information are retained for 7 years for legal and accounting purposes.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">9. Updates to This Policy</h2>
                            <p className="text-muted-foreground">
                                We may update this Privacy Policy from time to time. We will notify you of any changes by
                                posting the new policy on this page and updating the "Last Updated" date. We encourage you
                                to review this policy periodically.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">10. Contact Us</h2>
                            <p className="text-muted-foreground">
                                If you have questions about this Privacy Policy or our data practices, please contact us at:
                            </p>
                            <div className="mt-4 p-4 bg-muted rounded-lg">
                                <p className="font-medium">ShopFlow Electronics</p>
                                <p className="text-muted-foreground">123 Tech Street, Osu, Accra, Ghana</p>
                                <p className="text-muted-foreground">Email: privacy@shopflow.com</p>
                                <p className="text-muted-foreground">Phone: +233 24 123 4567</p>
                            </div>
                        </section>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
