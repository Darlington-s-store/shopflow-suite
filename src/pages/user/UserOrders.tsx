import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Package,
    Search,
    Filter,
    ChevronRight,
    Truck,
    CheckCircle,
    Clock,
    XCircle,
    Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useOrders } from '@/contexts/OrderContext';
import { Order, OrderStatus } from '@/types';

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: typeof Clock }> = {
    PENDING_PAYMENT: { label: 'Pending Payment', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30', icon: Clock },
    PENDING_CONFIRMATION: { label: 'Awaiting Confirmation', color: 'bg-orange-500/10 text-orange-600 border-orange-500/30', icon: Clock },
    CONFIRMED: { label: 'Confirmed', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30', icon: CheckCircle },
    PAID: { label: 'Paid', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30', icon: CheckCircle },
    PROCESSING: { label: 'Processing', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30', icon: Package },
    PACKED: { label: 'Packed', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30', icon: Package },
    ASSIGNED_TO_DELIVERY: { label: 'Assigned to Rider', color: 'bg-purple-500/10 text-purple-600 border-purple-500/30', icon: Truck },
    OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: 'bg-orange-500/10 text-orange-600 border-orange-500/30', icon: Truck },
    DELIVERED: { label: 'Delivered', color: 'bg-green-500/10 text-green-600 border-green-500/30', icon: CheckCircle },
    DELIVERY_FAILED: { label: 'Delivery Failed', color: 'bg-red-500/10 text-red-600 border-red-500/30', icon: XCircle },
    CANCELLED: { label: 'Cancelled', color: 'bg-gray-500/10 text-gray-600 border-gray-500/30', icon: XCircle },
    REFUNDED: { label: 'Refunded', color: 'bg-gray-500/10 text-gray-600 border-gray-500/30', icon: XCircle },
};

export default function UserOrders() {
    const { orders } = useOrders();
    const navigate = useNavigate();
    const { orderId } = useParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // Effect to handle deep linking via URL parameters
    useEffect(() => {
        if (orderId && orders.length > 0) {
            const foundOrder = orders.find(o => o.id === orderId || o.orderNumber === orderId);
            if (foundOrder) {
                setSelectedOrder(foundOrder);
            }
        }
    }, [orderId, orders]);

    // Handle dialog closing to clear URL if needed
    const handleDialogChange = (open: boolean) => {
        if (!open) {
            setSelectedOrder(null);
            // If we were on a specific order URL, navigate back to list to keep URL clean
            if (orderId) {
                navigate('/dashboard/orders');
            }
        }
    };

    const filteredOrders = orders
        .filter(order => {
            const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.items.some(item => item.productName.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const stats = {
        total: orders.length,
        pending: orders.filter(o => ['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'PACKED'].includes(o.status)).length,
        shipping: orders.filter(o => ['ASSIGNED_TO_DELIVERY', 'OUT_FOR_DELIVERY'].includes(o.status)).length,
        completed: orders.filter(o => o.status === 'DELIVERED').length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">My Orders</h1>
                <p className="text-muted-foreground">Track and manage your orders</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-soft bg-card/80">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Package className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.total}</p>
                            <p className="text-sm text-muted-foreground">Total Orders</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-soft bg-card/80">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                            <Clock className="h-6 w-6 text-yellow-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.pending}</p>
                            <p className="text-sm text-muted-foreground">Pending</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-soft bg-card/80">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                            <Truck className="h-6 w-6 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.shipping}</p>
                            <p className="text-sm text-muted-foreground">In Transit</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-soft bg-card/80">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.completed}</p>
                            <p className="text-sm text-muted-foreground">Completed</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-soft bg-card/80">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search orders..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Orders</SelectItem>
                                {Object.entries(statusConfig).map(([key, { label }]) => (
                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Orders List */}
            <Card className="border-0 shadow-soft bg-card/80">
                <CardContent className="p-0">
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-16">
                            <Package className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                            <h3 className="text-lg font-medium mb-2">No orders found</h3>
                            <p className="text-muted-foreground mb-4">
                                {orders.length === 0
                                    ? "You haven't placed any orders yet"
                                    : "No orders match your search criteria"}
                            </p>
                            <Button onClick={() => navigate('/products')}>
                                Start Shopping
                            </Button>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {filteredOrders.map((order) => {
                                const config = statusConfig[order.status];
                                const StatusIcon = config.icon;
                                return (
                                    <div
                                        key={order.id}
                                        className="p-4 md:p-6 hover:bg-muted/30 transition-colors cursor-pointer group"
                                        onClick={() => setSelectedOrder(order)}
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                                            {/* Order Info */}
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center">
                                                    {order.items[0]?.image ? (
                                                        <img
                                                            src={order.items[0].image}
                                                            alt={order.items[0].productName}
                                                            className="w-full h-full object-cover rounded-xl"
                                                        />
                                                    ) : (
                                                        <Package className="h-8 w-8 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-semibold">{order.orderNumber}</span>
                                                        <Badge variant="outline" className={config.color}>
                                                            <StatusIcon className="h-3 w-3 mr-1" />
                                                            {config.label}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {order.items.length} item(s) • Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground line-clamp-1">
                                                        {order.items.map(item => item.productName).join(', ')}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Price & Actions */}
                                            <div className="flex items-center justify-between md:flex-col md:items-end gap-2">
                                                <p className="text-lg font-bold">
                                                    GH₵{order.total.toLocaleString()}
                                                </p>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="gap-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedOrder(order);
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    View Details
                                                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Order Details Dialog */}
            <Dialog open={!!selectedOrder} onOpenChange={handleDialogChange}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    {selectedOrder && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-3">
                                    <span>Order {selectedOrder.orderNumber}</span>
                                    <Badge variant="outline" className={statusConfig[selectedOrder.status].color}>
                                        {statusConfig[selectedOrder.status].label}
                                    </Badge>
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-6 mt-4">
                                {/* Order Timeline */}
                                <div className="space-y-3">
                                    <h4 className="font-medium">Order Timeline</h4>
                                    <div className="flex items-center gap-2">
                                        <div className={`h-3 w-3 rounded-full ${['PAID', 'PROCESSING', 'PACKED', 'ASSIGNED_TO_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(selectedOrder.status)
                                            ? 'bg-green-500' : 'bg-muted'
                                            }`} />
                                        <div className={`flex-1 h-1 ${['PROCESSING', 'PACKED', 'ASSIGNED_TO_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(selectedOrder.status)
                                            ? 'bg-green-500' : 'bg-muted'
                                            }`} />
                                        <div className={`h-3 w-3 rounded-full ${['PACKED', 'ASSIGNED_TO_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(selectedOrder.status)
                                            ? 'bg-green-500' : 'bg-muted'
                                            }`} />
                                        <div className={`flex-1 h-1 ${['ASSIGNED_TO_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(selectedOrder.status)
                                            ? 'bg-green-500' : 'bg-muted'
                                            }`} />
                                        <div className={`h-3 w-3 rounded-full ${['OUT_FOR_DELIVERY', 'DELIVERED'].includes(selectedOrder.status)
                                            ? 'bg-green-500' : 'bg-muted'
                                            }`} />
                                        <div className={`flex-1 h-1 ${selectedOrder.status === 'DELIVERED' ? 'bg-green-500' : 'bg-muted'
                                            }`} />
                                        <div className={`h-3 w-3 rounded-full ${selectedOrder.status === 'DELIVERED' ? 'bg-green-500' : 'bg-muted'
                                            }`} />
                                    </div>
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Confirmed</span>
                                        <span>Packed</span>
                                        <span>Shipped</span>
                                        <span>Delivered</span>
                                    </div>
                                </div>

                                <Separator />

                                {/* Items */}
                                <div className="space-y-3">
                                    <h4 className="font-medium">Items ({selectedOrder.items.length})</h4>
                                    <div className="space-y-3">
                                        {selectedOrder.items.map((item) => (
                                            <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                                                <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden">
                                                    {item.image ? (
                                                        <img
                                                            src={item.image}
                                                            alt={item.productName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Package className="h-6 w-6 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium">{item.productName}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {item.variantName} • Qty: {item.quantity}
                                                    </p>
                                                </div>
                                                <p className="font-semibold">
                                                    GH₵{(item.price * item.quantity).toLocaleString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Separator />

                                {/* Shipping Address */}
                                <div className="space-y-2">
                                    <h4 className="font-medium">Shipping Address</h4>
                                    <div className="p-3 rounded-lg bg-muted/50">
                                        <p className="font-medium">{selectedOrder.shippingAddress.fullName}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedOrder.shippingAddress.state}, {selectedOrder.shippingAddress.country}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Phone: {selectedOrder.shippingAddress.phone}
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                {/* Order Summary */}
                                <div className="space-y-2">
                                    <h4 className="font-medium">Order Summary</h4>
                                    <div className="space-y-2 p-3 rounded-lg bg-muted/50">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span>GH₵{selectedOrder.subtotal.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Delivery Fee</span>
                                            <span>GH₵{selectedOrder.deliveryFee.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Tax</span>
                                            <span>GH₵{selectedOrder.tax.toLocaleString()}</span>
                                        </div>
                                        <Separator className="my-2" />
                                        <div className="flex justify-between font-semibold">
                                            <span>Total</span>
                                            <span className="text-primary">GH₵{selectedOrder.total.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Info */}
                                {selectedOrder.payment && (
                                    <>
                                        <Separator />
                                        <div className="space-y-2">
                                            <h4 className="font-medium">Payment Information</h4>
                                            <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Method</span>
                                                    <span>{selectedOrder.payment.method}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Status</span>
                                                    <Badge variant="outline" className={
                                                        selectedOrder.payment.status === 'SUCCESS'
                                                            ? 'bg-green-500/10 text-green-600'
                                                            : 'bg-yellow-500/10 text-yellow-600'
                                                    }>
                                                        {selectedOrder.payment.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Reference</span>
                                                    <span className="font-mono text-xs">{selectedOrder.payment.reference}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
