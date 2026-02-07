import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Package, Truck, MapPin, Phone, Check, X, Clock, Navigation,
    User, Calendar, ChevronRight, LogOut, Menu, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

type DeliveryStatus = 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED';

interface DeliveryJob {
    id: string;
    orderId: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    pickupAddress: string;
    deliveryAddress: string;
    items: Array<{ name: string; quantity: number }>;
    total: number;
    status: DeliveryStatus;
    notes?: string;
    assignedAt: string;
    estimatedDelivery?: string;
    proofOfDelivery?: string;
}

const statusColors: Record<DeliveryStatus, string> = {
    ASSIGNED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    PICKED_UP: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    IN_TRANSIT: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    DELIVERED: 'bg-green-500/20 text-green-400 border-green-500/30',
    FAILED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function RiderDashboard() {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const navigate = useNavigate();
    const { user, logout, token } = useAuth();
    const [deliveries, setDeliveries] = useState<DeliveryJob[]>([]);
    const [selectedDelivery, setSelectedDelivery] = useState<DeliveryJob | null>(null);
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
    const [failedDialogOpen, setFailedDialogOpen] = useState(false);
    const [failedReason, setFailedReason] = useState('');
    const [filter, setFilter] = useState<'active' | 'completed'>('active');
    const [isLoading, setIsLoading] = useState(false);

    // Load deliveries from backend
    const loadDeliveries = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${apiUrl}/deliveries/agent/active`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setDeliveries(data.deliveries || []);
            } else {
                toast.error('Failed to load deliveries');
            }
        } catch (error) {
            console.error('Error loading deliveries:', error);
            toast.error('Failed to load deliveries');
        } finally {
            setIsLoading(false);
        }
    }, [apiUrl, token]);

    useEffect(() => {
        loadDeliveries();
    }, [loadDeliveries]);

    const activeDeliveries = deliveries.filter(d => !['DELIVERED', 'FAILED'].includes(d.status));
    const completedDeliveries = deliveries.filter(d => ['DELIVERED', 'FAILED'].includes(d.status));
    const filteredDeliveries = filter === 'active' ? activeDeliveries : completedDeliveries;

    const updateStatus = async (delivery: DeliveryJob, newStatus: DeliveryStatus) => {
        try {
            const response = await fetch(`${apiUrl}/deliveries/${delivery.id}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                await loadDeliveries();
                toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
                setUpdateDialogOpen(false);
            } else {
                toast.error('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const markFailed = async () => {
        if (!selectedDelivery || !failedReason) return;

        try {
            const response = await fetch(`${apiUrl}/deliveries/${selectedDelivery.id}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'FAILED',
                    notes: failedReason
                }),
            });

            if (response.ok) {
                await loadDeliveries();
                toast.error('Delivery marked as failed');
                setFailedDialogOpen(false);
                setSelectedDelivery(null);
                setFailedReason('');
            } else {
                toast.error('Failed to update status');
            }
        } catch (error) {
            console.error('Error marking as failed:', error);
            toast.error('Failed to update status');
        }
    };

    const handleCall = (phone: string) => {
        window.location.href = `tel:${phone.replace(/\s/g, '')}`;
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getNextAction = (status: DeliveryStatus): { label: string; nextStatus: DeliveryStatus } | null => {
        switch (status) {
            case 'ASSIGNED': return { label: 'Mark as Picked Up', nextStatus: 'PICKED_UP' };
            case 'PICKED_UP': return { label: 'Start Delivery', nextStatus: 'IN_TRANSIT' };
            case 'IN_TRANSIT': return { label: 'Mark as Delivered', nextStatus: 'DELIVERED' };
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="sticky top-0 bg-slate-800/95 backdrop-blur border-b border-slate-700 z-50">
                <div className="px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <Truck className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">Rider Portal</h1>
                            <p className="text-xs text-slate-400">{user?.firstName} {user?.lastName}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={loadDeliveries}
                            disabled={isLoading}
                            className="text-slate-400"
                        >
                            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-400">
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="p-4 pb-24 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <Card className="bg-blue-500/10 border-blue-500/20">
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-blue-400">{activeDeliveries.length}</p>
                            <p className="text-xs text-blue-400/80">Active</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-500/10 border-green-500/20">
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-green-400">
                                {deliveries.filter(d => d.status === 'DELIVERED').length}
                            </p>
                            <p className="text-xs text-green-400/80">Delivered</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-red-500/10 border-red-500/20">
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-red-400">
                                {deliveries.filter(d => d.status === 'FAILED').length}
                            </p>
                            <p className="text-xs text-red-400/80">Failed</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2">
                    <Button
                        variant={filter === 'active' ? 'default' : 'outline'}
                        onClick={() => setFilter('active')}
                        className={filter !== 'active' ? 'border-slate-600 text-slate-300' : ''}
                    >
                        Active ({activeDeliveries.length})
                    </Button>
                    <Button
                        variant={filter === 'completed' ? 'default' : 'outline'}
                        onClick={() => setFilter('completed')}
                        className={filter !== 'completed' ? 'border-slate-600 text-slate-300' : ''}
                    >
                        Completed ({completedDeliveries.length})
                    </Button>
                </div>

                {/* Deliveries List */}
                <div className="space-y-4">
                    {isLoading ? (
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardContent className="p-8 text-center">
                                <RefreshCw className="h-12 w-12 text-slate-600 mx-auto mb-3 animate-spin" />
                                <p className="text-slate-400">Loading deliveries...</p>
                            </CardContent>
                        </Card>
                    ) : filteredDeliveries.length === 0 ? (
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardContent className="p-8 text-center">
                                <Truck className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-400">No {filter} deliveries</p>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredDeliveries.map(delivery => {
                            const nextAction = getNextAction(delivery.status);
                            return (
                                <Card key={delivery.id} className="bg-slate-800/50 border-slate-700 overflow-hidden">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <p className="font-semibold text-white">{delivery.orderNumber}</p>
                                                <p className="text-sm text-slate-400">{delivery.customerName}</p>
                                            </div>
                                            <Badge variant="outline" className={statusColors[delivery.status]}>
                                                {delivery.status.replace('_', ' ')}
                                            </Badge>
                                        </div>

                                        <div className="space-y-2 text-sm mb-4">
                                            <div className="flex items-start gap-2">
                                                <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                <div>
                                                    <p className="text-slate-500 text-xs">Deliver to:</p>
                                                    <p className="text-slate-300">{delivery.deliveryAddress}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Package className="h-4 w-4 text-slate-400" />
                                                <p className="text-slate-300">{delivery.items.length} item(s) • GH₵{delivery.total.toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 border-slate-600 text-slate-300"
                                                onClick={() => handleCall(delivery.customerPhone)}
                                            >
                                                <Phone className="h-4 w-4 mr-1" /> Call
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 border-slate-600 text-slate-300"
                                                onClick={() => { setSelectedDelivery(delivery); setUpdateDialogOpen(true); }}
                                            >
                                                <Navigation className="h-4 w-4 mr-1" /> Details
                                            </Button>
                                            {nextAction && (
                                                <Button
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => updateStatus(delivery, nextAction.nextStatus)}
                                                >
                                                    <Check className="h-4 w-4 mr-1" /> {nextAction.label.split(' ').pop()}
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            </main>

            {/* Delivery Detail Dialog */}
            <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Delivery Details</DialogTitle>
                    </DialogHeader>
                    {selectedDelivery && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="font-semibold text-lg">{selectedDelivery.orderNumber}</p>
                                <Badge variant="outline" className={statusColors[selectedDelivery.status]}>
                                    {selectedDelivery.status.replace('_', ' ')}
                                </Badge>
                            </div>

                            <div className="space-y-3">
                                <div className="p-3 bg-slate-700/50 rounded-lg">
                                    <p className="text-xs text-slate-400 mb-1">Customer</p>
                                    <p className="font-medium">{selectedDelivery.customerName}</p>
                                    <button
                                        className="text-sm text-primary flex items-center gap-1 mt-1"
                                        onClick={() => handleCall(selectedDelivery.customerPhone)}
                                    >
                                        <Phone className="h-3 w-3" /> {selectedDelivery.customerPhone}
                                    </button>
                                </div>

                                <div className="p-3 bg-slate-700/50 rounded-lg">
                                    <p className="text-xs text-slate-400 mb-1">Pickup Location</p>
                                    <p className="text-sm">{selectedDelivery.pickupAddress}</p>
                                </div>

                                <div className="p-3 bg-slate-700/50 rounded-lg">
                                    <p className="text-xs text-slate-400 mb-1">Delivery Address</p>
                                    <p className="text-sm">{selectedDelivery.deliveryAddress}</p>
                                </div>

                                <div className="p-3 bg-slate-700/50 rounded-lg">
                                    <p className="text-xs text-slate-400 mb-1">Items</p>
                                    {selectedDelivery.items.map((item, i) => (
                                        <p key={i} className="text-sm">{item.quantity}x {item.name}</p>
                                    ))}
                                    <p className="font-semibold mt-2">Total: GH₵{selectedDelivery.total.toLocaleString()}</p>
                                </div>

                                {selectedDelivery.notes && (
                                    <div className="p-3 bg-slate-700/50 rounded-lg">
                                        <p className="text-xs text-slate-400 mb-1">Notes</p>
                                        <p className="text-sm">{selectedDelivery.notes}</p>
                                    </div>
                                )}
                            </div>

                            {getNextAction(selectedDelivery.status) && (
                                <div className="flex gap-2 pt-4">
                                    <Button
                                        className="flex-1"
                                        onClick={() => updateStatus(selectedDelivery, getNextAction(selectedDelivery.status)!.nextStatus)}
                                    >
                                        <Check className="h-4 w-4 mr-2" /> {getNextAction(selectedDelivery.status)!.label}
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => { setUpdateDialogOpen(false); setFailedDialogOpen(true); }}
                                    >
                                        <X className="h-4 w-4 mr-2" /> Failed
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Failed Reason Dialog */}
            <Dialog open={failedDialogOpen} onOpenChange={setFailedDialogOpen}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle>Mark Delivery as Failed</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Please provide a reason for the failed delivery
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Reason</Label>
                            <Textarea
                                value={failedReason}
                                onChange={(e) => setFailedReason(e.target.value)}
                                className="bg-slate-700 border-slate-600"
                                placeholder="e.g., Customer not available, Wrong address..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setFailedDialogOpen(false)} className="border-slate-600">Cancel</Button>
                        <Button variant="destructive" onClick={markFailed} disabled={!failedReason}>Mark as Failed</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
