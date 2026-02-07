import { useState, useEffect, useCallback } from 'react';
import { Search, Truck, Package, MapPin, Clock, CheckCircle, XCircle, User, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useOrders } from '@/contexts/OrderContext';
import { useAuth } from '@/contexts/AuthContext';
import { Delivery, DeliveryStatus } from '@/types';
import { toast } from 'sonner';

const statusConfig: Record<DeliveryStatus, { label: string; color: string }> = {
    PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    ASSIGNED: { label: 'Assigned', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    PICKED_UP: { label: 'Picked Up', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    IN_TRANSIT: { label: 'In Transit', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-700 border-green-200' },
    FAILED: { label: 'Failed', color: 'bg-red-100 text-red-700 border-red-200' },
};

interface Rider {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
}

export default function AdminDelivery() {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const { token } = useAuth();
    const { deliveries, allOrders, updateDeliveryStatus, assignDelivery } = useOrders();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
    const [riders, setRiders] = useState<Rider[]>([]);
    const [isLoadingRiders, setIsLoadingRiders] = useState(false);

    // Load riders from backend
    const loadRiders = useCallback(async () => {
        setIsLoadingRiders(true);
        try {
            const response = await fetch(`${apiUrl}/admin/delivery-agents`, {
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                // Response directly contains delivery agents
                setRiders(data.customers || []);
            } else {
                toast.error('Failed to load riders');
            }
        } catch (error) {
            console.error('Error loading riders:', error);
            toast.error('Failed to load riders');
        } finally {
            setIsLoadingRiders(false);
        }
    }, [apiUrl, token]);

    useEffect(() => {
        loadRiders();
    }, [loadRiders]);

    const filteredDeliveries = deliveries
        .filter(d => {
            const order = allOrders.find(o => o.id === d.orderId);
            const matchesSearch = order?.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) || false;
            const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const stats = {
        total: deliveries.length,
        pending: deliveries.filter(d => d.status === 'PENDING').length,
        inTransit: deliveries.filter(d => ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'].includes(d.status)).length,
        completed: deliveries.filter(d => d.status === 'DELIVERED').length,
    };

    const handleStatusUpdate = (deliveryId: string, status: DeliveryStatus) => {
        updateDeliveryStatus(deliveryId, status);
        toast.success(`Delivery status updated to ${statusConfig[status].label}`);
        setSelectedDelivery(null);
    };

    const handleAssignRider = (orderId: string, riderId: string) => {
        assignDelivery(orderId, riderId);
        toast.success('Rider assigned successfully');
        setSelectedDelivery(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Delivery Management</h1>
                    <p className="text-slate-500">Track and manage deliveries</p>
                </div>
                <Button
                    onClick={loadRiders}
                    variant="outline"
                    className="gap-2 border-slate-200 text-slate-600 hover:bg-slate-50"
                    disabled={isLoadingRiders}
                >
                    <RefreshCw className={`h-4 w-4 ${isLoadingRiders ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Truck className="h-6 w-6 text-blue-600" />
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
                            <p className="text-2xl font-bold text-slate-900">{stats.inTransit}</p>
                            <p className="text-sm text-slate-500">In Transit</p>
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
            </div>

            {/* Filters */}
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by order number..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-slate-50 border-slate-200 text-slate-900"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[200px] bg-slate-50 border-slate-200 text-slate-900">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 text-slate-900">
                            <SelectItem value="all">All Status</SelectItem>
                            {Object.entries(statusConfig).map(([key, { label }]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Deliveries List */}
            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    {filteredDeliveries.length === 0 ? (
                        <div className="py-16 text-center">
                            <Truck className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                            <p className="text-slate-500">No deliveries found</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {filteredDeliveries.map((delivery) => {
                                const order = allOrders.find(o => o.id === delivery.orderId);
                                const rider = riders.find((r: { id: string }) => r.id === delivery.agentId);
                                return (
                                    <div
                                        key={delivery.id}
                                        className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                                        onClick={() => setSelectedDelivery(delivery)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center">
                                                    <Package className="h-6 w-6 text-slate-500" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{order?.orderNumber || 'Unknown'}</p>
                                                    <p className="text-sm text-slate-500">
                                                        {order?.shippingAddress?.city}, {order?.shippingAddress?.state}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {rider && (
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <User className="h-4 w-4" />
                                                        <span className="text-sm">{(rider as { firstName: string; lastName: string }).firstName} {(rider as { firstName: string; lastName: string }).lastName}</span>
                                                    </div>
                                                )}
                                                <Badge variant="outline" className={statusConfig[delivery.status].color}>
                                                    {statusConfig[delivery.status].label}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delivery Detail Dialog */}
            <Dialog open={!!selectedDelivery} onOpenChange={() => setSelectedDelivery(null)}>
                <DialogContent className="max-w-lg bg-white border-slate-200 text-slate-900">
                    {selectedDelivery && (() => {
                        const order = allOrders.find(o => o.id === selectedDelivery.orderId);
                        return (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-3">
                                        Delivery for {order?.orderNumber}
                                        <Badge variant="outline" className={statusConfig[selectedDelivery.status].color}>
                                            {statusConfig[selectedDelivery.status].label}
                                        </Badge>
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-6 mt-4">
                                    {/* Shipping Address */}
                                    {order && (
                                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <MapPin className="h-4 w-4 text-slate-500" />
                                                <span className="font-medium text-slate-900">Delivery Address</span>
                                            </div>
                                            <p className="text-slate-700">{order.shippingAddress.fullName}</p>
                                            <p className="text-sm text-slate-500">
                                                {order.shippingAddress.street}, {order.shippingAddress.city}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {order.shippingAddress.state}, {order.shippingAddress.country}
                                            </p>
                                            <p className="text-sm text-slate-500 mt-1">{order.shippingAddress.phone}</p>
                                        </div>
                                    )}

                                    {/* Assign Rider */}
                                    {selectedDelivery.status === 'PENDING' && (
                                        <div>
                                            <h4 className="font-medium mb-2 text-slate-900">Assign Rider</h4>
                                            <div className="space-y-2">
                                                {riders.length === 0 ? (
                                                    <p className="text-slate-500 text-sm">No riders available</p>
                                                ) : (
                                                    riders.map((r: { id: string; firstName: string; lastName: string }) => {
                                                        const activeDeliveries = deliveries.filter(d =>
                                                            d.agentId === r.id &&
                                                            ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'].includes(d.status)
                                                        ).length;

                                                        return (
                                                            <Button
                                                                key={r.id}
                                                                variant="outline"
                                                                className="w-full justify-between border-slate-200 bg-white hover:bg-slate-50 group hover:border-orange-500 text-slate-700"
                                                                onClick={() => handleAssignRider(selectedDelivery.orderId, r.id)}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <User className="h-4 w-4 text-slate-500 group-hover:text-orange-600" />
                                                                    <span>{r.firstName} {r.lastName}</span>
                                                                </div>
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

                                    <Separator className="bg-slate-100" />

                                    {/* Update Status */}
                                    <div>
                                        <h4 className="font-medium mb-2 text-slate-900">Update Status</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.entries(statusConfig).map(([key, { label }]) => (
                                                <Button
                                                    key={key}
                                                    size="sm"
                                                    variant={selectedDelivery.status === key ? 'default' : 'outline'}
                                                    className={selectedDelivery.status === key ? 'bg-orange-600 hover:bg-orange-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}
                                                    onClick={() => handleStatusUpdate(selectedDelivery.id, key as DeliveryStatus)}
                                                >
                                                    {label}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    {selectedDelivery.updates.length > 0 && (
                                        <div>
                                            <h4 className="font-medium mb-3 text-slate-900">Timeline</h4>
                                            <div className="space-y-3">
                                                {selectedDelivery.updates.map((update, i) => (
                                                    <div key={update.id} className="flex gap-3">
                                                        <div className="flex flex-col items-center">
                                                            <div className="h-3 w-3 rounded-full bg-orange-600" />
                                                            {i < selectedDelivery.updates.length - 1 && <div className="flex-1 w-0.5 bg-slate-200" />}
                                                        </div>
                                                        <div className="pb-4">
                                                            <p className="font-medium text-sm text-slate-900">{statusConfig[update.status]?.label || update.status}</p>
                                                            {update.note && <p className="text-sm text-slate-500">{update.note}</p>}
                                                            <p className="text-xs text-slate-400 mt-1">
                                                                {new Date(update.timestamp).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        );
                    })()}
                </DialogContent>
            </Dialog>
        </div>
    );
}
