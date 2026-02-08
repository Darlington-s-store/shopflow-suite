import { useState } from 'react';
import { Search, Eye, Truck, CheckCircle, Clock, Package, Bell, ShieldCheck, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useOrders } from '@/contexts/OrderContext';
import { Order, OrderStatus, DeliveryStatus } from '@/types';
import { toast } from 'sonner';

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
    PENDING_PAYMENT: { label: 'Pending Payment', color: 'bg-yellow-100 text-yellow-700 border-0' },
    PENDING_CONFIRMATION: { label: 'Awaiting Confirmation', color: 'bg-orange-100 text-orange-700 border-0' },
    CONFIRMED: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700 border-0' },
    PAID: { label: 'Paid', color: 'bg-blue-100 text-blue-700 border-0' },
    PROCESSING: { label: 'Processing', color: 'bg-blue-100 text-blue-700 border-0' },
    PACKED: { label: 'Packed', color: 'bg-indigo-100 text-indigo-700 border-0' },
    ASSIGNED_TO_DELIVERY: { label: 'Assigned', color: 'bg-purple-100 text-purple-700 border-0' },
    OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: 'bg-orange-100 text-orange-700 border-0' },
    DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-700 border-0' },
    DELIVERY_FAILED: { label: 'Failed', color: 'bg-red-100 text-red-700 border-0' },
    CANCELLED: { label: 'Cancelled', color: 'bg-slate-100 text-slate-700 border-0' },
    REFUNDED: { label: 'Refunded', color: 'bg-slate-100 text-slate-700 border-0' },
};

// Simple ID interface for riders to avoid deep type dependency issues if User type varies
interface RiderUser {
    id: string;
    role: string;
    firstName: string;
    lastName: string;
}

interface AdminNotification {
    id: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    type?: string;
    orderId?: string;
}

export default function AdminOrders() {
    const { allOrders, updateOrderStatus, deliveries, assignDelivery } = useOrders();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showNotifications, setShowNotifications] = useState(false);

    // Notifications
    const notifications: AdminNotification[] = [];
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markNotificationsRead = () => {
        const updated = notifications.map(n => ({ ...n, isRead: true }));
        localStorage.setItem('techmart_admin_notifications', JSON.stringify(updated));
        // Force re-render not handled here without context, but local state update would be better.
        // For now relying on re-mount or simple toggle.
    };

    // Get riders
    const users: RiderUser[] = [];
    const riders = users.filter(u => u.role === 'DELIVERY_AGENT');

    const filteredOrders = allOrders
        .filter(order => {
            const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const stats = {
        total: allOrders.length,
        pending: allOrders.filter(o => ['PENDING_PAYMENT', 'PAID', 'PROCESSING'].includes(o.status)).length,
        shipping: allOrders.filter(o => ['ASSIGNED_TO_DELIVERY', 'OUT_FOR_DELIVERY'].includes(o.status)).length,
        completed: allOrders.filter(o => o.status === 'DELIVERED').length,
    };

    const handleStatusUpdate = (orderId: string, status: OrderStatus) => {
        updateOrderStatus(orderId, status);
        toast.success(`Order status updated to ${statusConfig[status].label}`);
        setSelectedOrder(null);
    };

    // Helper to render delivery section
    const renderDeliverySection = () => {
        if (!selectedOrder) return null;

        const delivery = deliveries.find(d => d.orderId === selectedOrder.id);
        if (!delivery) return null;

        const assignedRider = delivery.agentId ? riders.find(r => r.id === delivery.agentId) : null;

        return (
            <div>
                <h4 className="font-medium mb-3 text-slate-500">Delivery Status</h4>

                {assignedRider ? (
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                        <div>
                            <span className="text-sm text-slate-500">Assigned Rider</span>
                            <p className="font-medium text-slate-900 flex items-center gap-2">
                                <Truck className="h-4 w-4" />
                                {assignedRider.firstName} {assignedRider.lastName}
                            </p>
                        </div>
                        <Badge className={
                            delivery.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                delivery.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                                    'bg-blue-100 text-blue-700'
                        }>
                            {delivery.status}
                        </Badge>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-sm text-slate-500">Assign a rider for this order:</p>
                        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-2">
                            {riders.length === 0 ? (
                                <p className="text-slate-500 italic text-sm">No riders available. Add them in Staff settings.</p>
                            ) : (
                                riders.map(rider => {
                                    const activeDeliveries = deliveries.filter(d =>
                                        d.agentId === rider.id &&
                                        ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'].includes(d.status)
                                    ).length;

                                    return (
                                        <Button
                                            key={rider.id}
                                            variant="outline"
                                            className="justify-between w-full border-slate-200 hover:bg-slate-50 text-slate-900 group"
                                            onClick={() => {
                                                assignDelivery(selectedOrder.id, rider.id);
                                                toast.success(`Assigned to ${rider.firstName}`);
                                                setSelectedOrder(null);
                                            }}
                                        >
                                            <span className="flex items-center gap-2">
                                                <Truck className="h-4 w-4 text-slate-400 group-hover:text-orange-600 transition-colors" />
                                                {rider.firstName} {rider.lastName}
                                            </span>
                                            <Badge variant="secondary" className={`${activeDeliveries === 0 ? 'bg-green-100 text-green-700' :
                                                activeDeliveries < 3 ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {activeDeliveries} Active
                                            </Badge>
                                        </Button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
                    <p className="text-slate-500">Manage and track all orders</p>
                </div>
                <Button variant="outline" size="icon" className="relative border-slate-200 hover:bg-slate-50" onClick={() => {
                    setShowNotifications(true);
                    markNotificationsRead();
                }}>
                    <Bell className="h-5 w-5 text-slate-500" />
                    {unreadCount > 0 && <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />}
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Package className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                            <p className="text-sm text-slate-500">Total</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                            <Clock className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
                            <p className="text-sm text-slate-500">Pending</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
                            <Truck className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{stats.shipping}</p>
                            <p className="text-sm text-slate-500">Shipping</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{stats.completed}</p>
                            <p className="text-sm text-slate-500">Completed</p>
                        </div>
                    </CardContent>
                </Card>
            </div >

            {/* Filters */}
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-slate-50 border-slate-200 text-slate-900"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[200px] bg-slate-50 border-slate-200 text-slate-900">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            {Object.entries(statusConfig).map(([key, { label }]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Orders Table */}
            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Order</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Date</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Items</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Total</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-4">
                                        <p className="font-medium text-slate-900">{order.orderNumber}</p>
                                    </td>
                                    <td className="px-4 py-4 text-slate-500">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-4 text-slate-500">{order.items.length} items</td>
                                    <td className="px-4 py-4 text-slate-900 font-medium">GH₵{order.total.toLocaleString()}</td>
                                    <td className="px-4 py-4">
                                        <Badge variant="outline" className={statusConfig[order.status].color}>
                                            {statusConfig[order.status].label}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-4">
                                        <Button size="sm" variant="ghost" className="text-slate-500 hover:text-slate-900" onClick={() => setSelectedOrder(order)}>
                                            <Eye className="h-4 w-4 mr-1" /> View
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Order Detail Dialog */}
            <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
                <DialogContent className="max-w-2xl bg-white border-slate-200 text-slate-900 max-h-[90vh] overflow-y-auto">
                    {selectedOrder && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-3 text-slate-900">
                                    {selectedOrder.orderNumber}
                                    <Badge variant="outline" className={statusConfig[selectedOrder.status].color}>
                                        {statusConfig[selectedOrder.status].label}
                                    </Badge>
                                </DialogTitle>
                            </DialogHeader>

                            {(selectedOrder.status === 'PENDING_CONFIRMATION' || selectedOrder.status === 'PAID') && (
                                <div className="mt-4 p-4 bg-orange-50 border border-orange-100 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                                            <ShieldCheck className="h-5 w-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">Order Pending Confirmation</p>
                                            <p className="text-sm text-slate-500">Review details and confirm to process.</p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => handleStatusUpdate(selectedOrder.id, 'CONFIRMED')}
                                        className="bg-orange-600 hover:bg-orange-700 text-white"
                                    >
                                        Confirm Order
                                    </Button>
                                </div>
                            )}
                            <div className="space-y-6 mt-4">
                                {/* Items */}
                                <div>
                                    <h4 className="font-medium mb-3 text-slate-500">Items</h4>
                                    <div className="space-y-2">
                                        {selectedOrder.items.map((item) => (
                                            <div key={item.id} className="flex justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                                                <div>
                                                    <p className="font-medium text-slate-900">{item.productName}</p>
                                                    <p className="text-sm text-slate-500">{item.variantName} × {item.quantity}</p>
                                                </div>
                                                <p className="font-medium text-slate-900">GH₵{(item.price * item.quantity).toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Separator className="bg-slate-200" />

                                {renderDeliverySection()}

                                <Separator className="bg-slate-200" />

                                {/* Summary */}
                                <div className="space-y-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Subtotal</span>
                                        <span className="text-slate-900">GH₵{selectedOrder.subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Delivery</span>
                                        <span className="text-slate-900">GH₵{selectedOrder.deliveryFee.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-200">
                                        <span className="text-slate-900">Total</span>
                                        <span className="text-orange-600">GH₵{selectedOrder.total.toLocaleString()}</span>
                                    </div>
                                    <div className="pt-4 flex justify-end">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2 border-slate-200"
                                            onClick={() => window.open(`/order-confirmation/${selectedOrder.id}`, '_blank')}
                                        >
                                            <Printer className="h-4 w-4" />
                                            Print Receipt
                                        </Button>
                                    </div>
                                </div>
                                {/* Update Status */}
                                <div>
                                    <h4 className="font-medium mb-3 text-slate-500">Manual Status Update</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {['PROCESSING', 'PACKED', 'DELIVERED', 'CANCELLED'].map((status) => (
                                            <Button
                                                key={status}
                                                size="sm"
                                                variant={selectedOrder.status === status ? 'default' : 'outline'}
                                                className={selectedOrder.status === status ? 'bg-slate-900 text-white' : 'border-slate-200 text-slate-600'}
                                                onClick={() => handleStatusUpdate(selectedOrder.id, status as OrderStatus)}
                                            >
                                                {statusConfig[status as OrderStatus].label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
            <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
                <DialogContent className="max-w-md bg-white border-slate-200 text-slate-900">
                    <DialogHeader>
                        <DialogTitle>Notifications</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto mt-2">
                        {notifications.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>No notifications</p>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div key={n.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                                    <p className="font-medium text-slate-900">{n.title}</p>
                                    <p className="text-sm text-slate-500">{n.message}</p>
                                    <p className="text-xs text-slate-400 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                                </div>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
}
