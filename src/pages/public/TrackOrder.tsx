import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, ArrowRight, Clock, Truck, CheckCircle, XCircle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StoreLayout } from '@/components/layout/StoreLayout';
import { toast } from 'sonner';
import { useOrders } from '@/contexts/OrderContext';

const statusSteps = [
    { key: 'PENDING_PAYMENT', label: 'Pending', icon: Clock },
    { key: 'PAID', label: 'Paid', icon: CheckCircle },
    { key: 'PROCESSING', label: 'Processing', icon: Package },
    { key: 'PACKED', label: 'Packed', icon: Package },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
];

const statusColors: Record<string, string> = {
    PENDING_PAYMENT: 'bg-yellow-500',
    PAID: 'bg-blue-500',
    PROCESSING: 'bg-blue-500',
    PACKED: 'bg-indigo-500',
    ASSIGNED_TO_DELIVERY: 'bg-purple-500',
    OUT_FOR_DELIVERY: 'bg-orange-500',
    DELIVERED: 'bg-green-500',
    DELIVERY_FAILED: 'bg-red-500',
    CANCELLED: 'bg-gray-500',
    REFUNDED: 'bg-gray-500',
};

export default function TrackOrder() {
    const navigate = useNavigate();
    const { allOrders } = useOrders();
    const [searchQuery, setSearchQuery] = useState('');
    const [trackedOrder, setTrackedOrder] = useState<typeof allOrders[0] | null>(null);
    const [notFound, setNotFound] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            toast.error('Please enter an order number');
            return;
        }

        const order = allOrders.find(o =>
            o.orderNumber.toLowerCase() === searchQuery.toLowerCase().trim() ||
            o.id === searchQuery.trim()
        );

        if (order) {
            setTrackedOrder(order);
            setNotFound(false);
        } else {
            setTrackedOrder(null);
            setNotFound(true);
        }
    };

    const getStatusIndex = (status: string) => {
        const index = statusSteps.findIndex(s => s.key === status);
        if (status === 'CANCELLED' || status === 'REFUNDED' || status === 'DELIVERY_FAILED') return -1;
        return index;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('en-GH', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
            <div className="container py-12">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                            <Package className="h-8 w-8 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
                        <p className="text-muted-foreground">
                            Enter your order number to see the latest status
                        </p>
                    </div>

                    {/* Search Form */}
                    <Card className="mb-8">
                        <CardContent className="p-6">
                            <form onSubmit={handleSearch} className="flex gap-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Enter order number (e.g., ORD-20260201-001)"
                                        className="pl-10 h-12"
                                    />
                                </div>
                                <Button type="submit" size="lg" className="gap-2">
                                    Track <ArrowRight className="h-4 w-4" />
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Not Found */}
                    {notFound && (
                        <Card className="border-destructive/50">
                            <CardContent className="p-8 text-center">
                                <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">Order Not Found</h3>
                                <p className="text-muted-foreground mb-4">
                                    We couldn't find an order with that number. Please check and try again.
                                </p>
                                <Button variant="outline" onClick={() => navigate('/dashboard/orders')}>
                                    View My Orders
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Order Details */}
                    {trackedOrder && (
                        <div className="space-y-6">
                            {/* Order Summary */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>{trackedOrder.orderNumber}</CardTitle>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Placed on {formatDate(trackedOrder.createdAt)}
                                            </p>
                                        </div>
                                        <Badge className={`${statusColors[trackedOrder.status]} text-white`}>
                                            {trackedOrder.status.replace(/_/g, ' ')}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {/* Progress Timeline */}
                                    {getStatusIndex(trackedOrder.status) >= 0 ? (
                                        <div className="relative">
                                            <div className="flex justify-between mb-8">
                                                {statusSteps.map((step, index) => {
                                                    const currentIndex = getStatusIndex(trackedOrder.status);
                                                    const isCompleted = index <= currentIndex;
                                                    const isCurrent = index === currentIndex;
                                                    const StepIcon = step.icon;

                                                    return (
                                                        <div key={step.key} className="flex flex-col items-center relative z-10">
                                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${isCompleted
                                                                    ? 'bg-primary text-primary-foreground'
                                                                    : 'bg-muted text-muted-foreground'
                                                                } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}>
                                                                <StepIcon className="h-5 w-5" />
                                                            </div>
                                                            <span className={`text-xs mt-2 ${isCompleted ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                                                {step.label}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            {/* Progress Bar */}
                                            <div className="absolute top-5 left-5 right-5 h-0.5 bg-muted -z-0">
                                                <div
                                                    className="h-full bg-primary transition-all duration-500"
                                                    style={{ width: `${(getStatusIndex(trackedOrder.status) / (statusSteps.length - 1)) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
                                            <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                                            <p className="font-medium text-destructive">
                                                Order {trackedOrder.status.replace(/_/g, ' ').toLowerCase()}
                                            </p>
                                        </div>
                                    )}

                                    {/* Delivery Address */}
                                    <div className="mt-6 pt-6 border-t">
                                        <div className="flex items-start gap-3">
                                            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="font-medium">Delivery Address</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {trackedOrder.shippingAddress.fullName}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {trackedOrder.shippingAddress.street}, {trackedOrder.shippingAddress.city}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {trackedOrder.shippingAddress.state}, {trackedOrder.shippingAddress.country}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Order Items */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Order Items</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {trackedOrder.items.map((item, index) => (
                                            <div key={index} className="flex items-center gap-4">
                                                <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden">
                                                    {item.image && (
                                                        <img src={item.image} alt="" className="h-full w-full object-cover" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium">{item.productName}</p>
                                                    {item.variantName && (
                                                        <p className="text-sm text-muted-foreground">{item.variantName}</p>
                                                    )}
                                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="font-semibold">GH₵{(item.price * item.quantity).toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-6 pt-4 border-t space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span>GH₵{trackedOrder.subtotal.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Delivery Fee</span>
                                            <span>{trackedOrder.deliveryFee === 0 ? 'Free' : `GH₵${trackedOrder.deliveryFee}`}</span>
                                        </div>
                                        <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                                            <span>Total</span>
                                            <span>GH₵{trackedOrder.total.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Actions */}
                            <div className="flex gap-3 justify-center">
                                <Button variant="outline" onClick={() => navigate('/dashboard/orders')}>
                                    View All Orders
                                </Button>
                                <Button onClick={() => navigate('/products')}>
                                    Continue Shopping
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Tips */}
                    {!trackedOrder && !notFound && (
                        <Card className="bg-muted/30">
                            <CardContent className="p-6">
                                <h3 className="font-medium mb-3">Tips for tracking your order:</h3>
                                <ul className="text-sm text-muted-foreground space-y-2">
                                    <li>• Your order number is in the format: ORD-YYYYMMDD-XXX</li>
                                    <li>• You can find it in your order confirmation email or SMS</li>
                                    <li>• If you're logged in, you can also track orders from your dashboard</li>
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
