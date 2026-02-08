import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function ContactUs() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.subject || !form.message) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSubmitting(false);

        toast.success('Message sent successfully! We\'ll get back to you soon.');
        setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    };

    const contactInfo = [
        {
            icon: MapPin,
            title: 'Visit Us',
            lines: ['123 Tech Street, Osu', 'Accra, Ghana'],
        },
        {
            icon: Phone,
            title: 'Call Us',
            lines: ['+233 24 123 4567', '+233 50 987 6543'],
        },
        {
            icon: Mail,
            title: 'Email Us',
            lines: ['support@shopflow.com', 'sales@shopflow.com'],
        },
        {
            icon: Clock,
            title: 'Business Hours',
            lines: ['Monday - Friday: 9am - 6pm', 'Saturday: 10am - 4pm'],
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground py-16">
                <div className="container text-center">
                    <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
                    <p className="text-lg opacity-90 max-w-xl mx-auto">
                        Have a question about our products or services? We're here to help!
                    </p>
                </div>
            </div>

            <div className="container py-12">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Contact Info */}
                    <div className="space-y-6">
                        {contactInfo.map((item, index) => (
                            <Card key={index} className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                            <item.icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-1">{item.title}</h3>
                                            {item.lines.map((line, i) => (
                                                <p key={i} className="text-sm text-muted-foreground">{line}</p>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Map placeholder */}
                        <Card className="overflow-hidden">
                            <div className="aspect-video bg-muted flex items-center justify-center">
                                <div className="text-center text-muted-foreground">
                                    <MapPin className="h-8 w-8 mx-auto mb-2" />
                                    <p className="text-sm">Interactive map coming soon</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5" />
                                    Send us a Message
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Your Name *</Label>
                                            <Input
                                                id="name"
                                                value={form.name}
                                                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={form.email}
                                                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                value={form.phone}
                                                onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                                                placeholder="+233 XX XXX XXXX"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="subject">Subject *</Label>
                                            <Select value={form.subject} onValueChange={(v) => setForm(f => ({ ...f, subject: v }))}>
                                                <SelectTrigger id="subject">
                                                    <SelectValue placeholder="Select a subject" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="general">General Inquiry</SelectItem>
                                                    <SelectItem value="order">Order Support</SelectItem>
                                                    <SelectItem value="product">Product Question</SelectItem>
                                                    <SelectItem value="returns">Returns & Refunds</SelectItem>
                                                    <SelectItem value="partnership">Business Partnership</SelectItem>
                                                    <SelectItem value="feedback">Feedback</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="message">Your Message *</Label>
                                        <Textarea
                                            id="message"
                                            value={form.message}
                                            onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                                            placeholder="How can we help you?"
                                            rows={6}
                                        />
                                    </div>

                                    <Button type="submit" size="lg" className="w-full gap-2" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>Sending...</>
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4" /> Send Message
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* FAQ Tease */}
                        <Card className="mt-6 bg-muted/30">
                            <CardContent className="p-6">
                                <h3 className="font-semibold mb-2">Looking for quick answers?</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Check our frequently asked questions for instant help with common queries.
                                </p>
                                <Button variant="outline" asChild>
                                    <a href="/faq">View FAQ</a>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
