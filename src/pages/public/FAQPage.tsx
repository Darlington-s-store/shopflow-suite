import { useState } from 'react';
import { ChevronDown, Search, HelpCircle, Package, Truck, CreditCard, RotateCcw, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQCategory {
    name: string;
    icon: React.ElementType;
    items: FAQItem[];
}

const faqData: FAQCategory[] = [
    {
        name: 'Orders & Shipping',
        icon: Package,
        items: [
            {
                question: 'How do I track my order?',
                answer: 'You can track your order by visiting our Track Order page and entering your order number. Alternatively, log in to your account and go to "My Orders" to see real-time updates on all your orders.'
            },
            {
                question: 'How long does delivery take?',
                answer: 'Delivery times vary by location. Within Accra, orders are typically delivered within 24-48 hours. Other regions in Ghana may take 3-5 business days. You will receive an estimated delivery date at checkout.'
            },
            {
                question: 'Do you offer free shipping?',
                answer: 'Yes! We offer free shipping on all orders over GH₵1,000. Orders below this amount have a flat shipping fee based on your location.'
            },
            {
                question: 'Can I change my delivery address?',
                answer: 'You can change your delivery address before your order is shipped. Contact our support team immediately if you need to make changes. Once the order is out for delivery, address changes may not be possible.'
            }
        ]
    },
    {
        name: 'Delivery',
        icon: Truck,
        items: [
            {
                question: 'What areas do you deliver to?',
                answer: 'We deliver to all 16 regions across Ghana. Same-day delivery is available in Greater Accra. For other regions, we partner with reliable courier services to ensure your products arrive safely.'
            },
            {
                question: 'What if I\'m not home during delivery?',
                answer: 'Our delivery agents will call you before arrival. If you\'re not available, you can reschedule the delivery or authorize someone else to receive the package on your behalf.'
            },
            {
                question: 'Do you offer express delivery?',
                answer: 'Yes, express delivery is available for select locations in Greater Accra. Choose the express option at checkout for same-day or next-day delivery (additional fees apply).'
            }
        ]
    },
    {
        name: 'Payment',
        icon: CreditCard,
        items: [
            {
                question: 'What payment methods do you accept?',
                answer: 'We accept Mobile Money (MTN, Vodafone, AirtelTigo), bank transfers, debit/credit cards (Visa, Mastercard), and cash on delivery for select areas.'
            },
            {
                question: 'Is my payment information secure?',
                answer: 'Absolutely! We use industry-standard SSL encryption and partner with Paystack, a PCI-DSS compliant payment processor, to ensure your payment details are always protected.'
            },
            {
                question: 'Can I pay on delivery?',
                answer: 'Cash on Delivery (COD) is available in Greater Accra for orders under GH₵5,000. Please have the exact amount ready as our delivery agents may not carry change.'
            },
            {
                question: 'I was charged but my order wasn\'t confirmed?',
                answer: 'If you were charged but didn\'t receive an order confirmation, please wait 15 minutes and check your email (including spam folder). If still unresolved, contact our support team with your transaction reference.'
            }
        ]
    },
    {
        name: 'Returns & Refunds',
        icon: RotateCcw,
        items: [
            {
                question: 'What is your return policy?',
                answer: 'We offer a 7-day return policy for most products. Items must be unused, in original packaging, and accompanied by the receipt. Some products like earphones and underwear are non-returnable for hygiene reasons.'
            },
            {
                question: 'How do I request a refund?',
                answer: 'To request a refund, go to your order history, select the order, and click "Request Refund." Our team will review your request within 24-48 hours and process eligible refunds within 5-7 business days.'
            },
            {
                question: 'When will I receive my refund?',
                answer: 'Refunds are processed within 5-7 business days after approval. The time to reflect in your account depends on your bank or mobile money provider (usually 1-3 additional days).'
            }
        ]
    },
    {
        name: 'Product & Warranty',
        icon: Shield,
        items: [
            {
                question: 'Are your products genuine?',
                answer: 'Yes! We only sell 100% genuine products sourced directly from authorized distributors. All electronics come with official manufacturer warranty.'
            },
            {
                question: 'What warranty do your products have?',
                answer: 'Warranty varies by product and manufacturer. Most electronics have 1-year manufacturer warranty. Check the product page for specific warranty information.'
            },
            {
                question: 'How do I claim warranty?',
                answer: 'To claim warranty, contact our support team with your order number and describe the issue. We\'ll guide you through the warranty claim process and arrange for repair or replacement if applicable.'
            }
        ]
    }
];

export default function FAQPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [openItems, setOpenItems] = useState<string[]>([]);

    const toggleItem = (id: string) => {
        setOpenItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const filteredFAQ = faqData.map(category => ({
        ...category,
        items: category.items.filter(item =>
            item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(category => category.items.length > 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
            {/* Hero */}
            <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground py-16">
                <div className="container text-center">
                    <HelpCircle className="h-12 w-12 mx-auto mb-4" />
                    <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
                    <p className="text-lg opacity-90 max-w-xl mx-auto mb-8">
                        Find answers to common questions about orders, shipping, payments, and more.
                    </p>
                    <div className="max-w-md mx-auto relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for answers..."
                            className="pl-10 h-12 bg-white text-foreground"
                        />
                    </div>
                </div>
            </div>

            <div className="container py-12">
                {filteredFAQ.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">No results found</h3>
                            <p className="text-muted-foreground">
                                Try a different search term or browse our categories below.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-8">
                        {filteredFAQ.map((category) => (
                            <Card key={category.name}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <category.icon className="h-5 w-5 text-primary" />
                                        </div>
                                        {category.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {category.items.map((item, index) => {
                                        const itemId = `${category.name}-${index}`;
                                        const isOpen = openItems.includes(itemId);

                                        return (
                                            <Collapsible key={itemId} open={isOpen} onOpenChange={() => toggleItem(itemId)}>
                                                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 rounded-lg hover:bg-muted transition-colors text-left">
                                                    <span className="font-medium pr-4">{item.question}</span>
                                                    <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                                </CollapsibleTrigger>
                                                <CollapsibleContent className="px-4 pb-4">
                                                    <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                                                </CollapsibleContent>
                                            </Collapsible>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Still Need Help */}
                <Card className="mt-12 bg-muted/30">
                    <CardContent className="p-8 text-center">
                        <HelpCircle className="h-10 w-10 text-primary mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
                        <p className="text-muted-foreground mb-4">
                            Can't find what you're looking for? Our support team is here to help.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <a href="/contact" className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                                Contact Support
                            </a>
                            <a href="tel:+233241234567" className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                                Call Us: +233 24 123 4567
                            </a>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
