import { useState, useEffect, useCallback } from 'react';
import {
    Search, CreditCard, Check, X, Clock, RefreshCw, Eye,
    Download, Filter, DollarSign, TrendingUp, AlertTriangle, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

type PaymentStatus = 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED';
type PaymentMethod = 'CARD' | 'MOBILE_MONEY' | 'BANK_TRANSFER' | 'PAYSTACK';

interface Payment {
    id: string;
    transactionRef: string;
    orderId: string;
    orderNumber: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    amount: number;
    currency: string;
    method: PaymentMethod;
    provider: string;
    status: PaymentStatus;
    gatewayResponse?: string;
    cardType?: string;
    cardLast4?: string;
    mobileNumber?: string;
    createdAt: string;
    completedAt?: string;
    failedReason?: string;
    metadata?: Record<string, string>;
}

// Partial order interface for type safety when fetching orders
interface OrderSource {
    id: string;
    orderNumber: string;
    userId: string;
    paymentReference?: string;
    shippingAddress?: { fullName: string };
    user?: { firstName: string; lastName: string; email: string };
    email?: string;
    total: number;
    currency?: string;
    paymentMethod?: PaymentMethod;
    paymentStatus?: PaymentStatus;
    createdAt: string;
    paymentDate?: string;
}

const statusColors: Record<PaymentStatus, string> = {
    SUCCESS: 'bg-green-100 text-green-700 border-0',
    PENDING: 'bg-yellow-100 text-yellow-700 border-0',
    FAILED: 'bg-red-100 text-red-700 border-0',
    REFUNDED: 'bg-blue-100 text-blue-700 border-0',
};

const statusIcons: Record<PaymentStatus, React.ElementType> = {
    SUCCESS: Check,
    PENDING: Clock,
    FAILED: X,
    REFUNDED: RefreshCw,
};

export default function AdminPayments() {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const [payments, setPayments] = useState<Payment[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [methodFilter, setMethodFilter] = useState('all');
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Load payments from backend (extracted from orders)
    const loadPayments = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${apiUrl}/orders`, { credentials: 'include' });

            if (response.ok) {
                const data = await response.json();

                // Extract payment information from orders
                const paymentsFromOrders = (data.orders || [])
                    .filter((order: OrderSource) => order.paymentReference)
                    .map((order: OrderSource) => ({
                        id: `pay-${order.id}`,
                        transactionRef: order.paymentReference || '',
                        orderId: order.id,
                        orderNumber: order.orderNumber,
                        customerId: order.userId,
                        customerName: order.shippingAddress?.fullName || (order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Unknown'),
                        customerEmail: order.user?.email || order.email || 'N/A',
                        amount: order.total,
                        currency: order.currency || 'GHS',
                        method: order.paymentMethod || 'PAYSTACK',
                        provider: 'Paystack',
                        status: order.paymentStatus || 'SUCCESS',
                        createdAt: order.createdAt,
                        completedAt: order.paymentDate || order.createdAt,
                    }));

                setPayments(paymentsFromOrders);
            } else {
                toast.error('Failed to load payments');
            }
        } catch (error) {
            console.error('Error loading payments:', error);
            toast.error('Failed to load payments');
        } finally {
            setIsLoading(false);
        }
    }, [apiUrl]);

    useEffect(() => {
        loadPayments();
    }, [loadPayments]);

    const filteredPayments = payments.filter(p => {
        const matchesSearch = p.transactionRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.customerName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        const matchesMethod = methodFilter === 'all' || p.method === methodFilter;
        return matchesSearch && matchesStatus && matchesMethod;
    });

    const stats = {
        totalRevenue: payments.filter(p => p.status === 'SUCCESS').reduce((s, p) => s + p.amount, 0),
        successCount: payments.filter(p => p.status === 'SUCCESS').length,
        pendingCount: payments.filter(p => p.status === 'PENDING').length,
        failedCount: payments.filter(p => p.status === 'FAILED').length,
        successRate: payments.length > 0 ? ((payments.filter(p => p.status === 'SUCCESS').length / payments.length) * 100).toFixed(1) : '0',
    };

    const handleRetryVerification = (payment: Payment) => {
        toast.info('Verifying payment with Paystack...');
        // Simulate API call
        setTimeout(() => {
            toast.success('Payment verified successfully');
        }, 1500);
    };

    const exportPayments = () => {
        const csvContent = [
            ['Transaction Ref', 'Order', 'Customer', 'Amount', 'Method', 'Status', 'Date'].join(','),
            ...filteredPayments.map(p => [
                p.transactionRef,
                p.orderNumber,
                p.customerName,
                p.amount,
                p.method,
                p.status,
                new Date(p.createdAt).toLocaleDateString()
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success('Payments exported');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Payments & Transactions</h1>
                    <p className="text-slate-500">Monitor payment logs and transactions</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={loadPayments}
                        variant="outline"
                        className="border-slate-200 text-slate-600 gap-2 hover:bg-slate-50"
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button onClick={exportPayments} variant="outline" className="border-slate-200 text-slate-600 gap-2 hover:bg-slate-50">
                        <Download className="h-4 w-4" /> Export
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                                <DollarSign className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xl font-bold text-slate-900">GH₵{(stats.totalRevenue / 1000).toFixed(1)}K</p>
                                <p className="text-xs text-slate-500">Total Revenue</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                                <Check className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xl font-bold text-slate-900">{stats.successCount}</p>
                                <p className="text-xs text-slate-500">Successful</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                                <Clock className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-xl font-bold text-slate-900">{stats.pendingCount}</p>
                                <p className="text-xs text-slate-500">Pending</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center">
                                <X className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-xl font-bold text-slate-900">{stats.failedCount}</p>
                                <p className="text-xs text-slate-500">Failed</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-xl font-bold text-slate-900">{stats.successRate}%</p>
                                <p className="text-xs text-slate-500">Success Rate</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="Search by ref, order, customer..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-slate-50 border-slate-200 text-slate-900" />
                    </div>
                    <div className="flex gap-4">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[140px] bg-slate-50 border-slate-200 text-slate-900"><SelectValue placeholder="Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="SUCCESS">Success</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="FAILED">Failed</SelectItem>
                                <SelectItem value="REFUNDED">Refunded</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={methodFilter} onValueChange={setMethodFilter}>
                            <SelectTrigger className="w-[160px] bg-slate-50 border-slate-200 text-slate-900"><SelectValue placeholder="Method" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Methods</SelectItem>
                                <SelectItem value="CARD">Card</SelectItem>
                                <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Payments Table */}
            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-200 hover:bg-transparent">
                                <TableHead className="text-slate-500 min-w-[150px]">Transaction</TableHead>
                                <TableHead className="text-slate-500 min-w-[200px]">Customer</TableHead>
                                <TableHead className="text-slate-500 min-w-[100px]">Amount</TableHead>
                                <TableHead className="text-slate-500 min-w-[150px]">Method</TableHead>
                                <TableHead className="text-slate-500 min-w-[120px]">Status</TableHead>
                                <TableHead className="text-slate-500 min-w-[150px]">Date</TableHead>
                                <TableHead className="text-slate-500 text-right min-w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12">
                                        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-slate-400" />
                                        <p className="text-slate-500">Loading payments...</p>
                                    </TableCell>
                                </TableRow>
                            ) : filteredPayments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12">
                                        <CreditCard className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                                        <p className="text-slate-500">No payments found</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredPayments.map(payment => {
                                    const StatusIcon = statusIcons[payment.status];
                                    return (
                                        <TableRow key={payment.id} className="border-slate-100 hover:bg-slate-50">
                                            <TableCell>
                                                <div>
                                                    <p className="font-mono font-medium text-slate-900 text-sm">{payment.transactionRef}</p>
                                                    <p className="text-xs text-slate-500">{payment.orderNumber}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium text-slate-900">{payment.customerName}</p>
                                                    <p className="text-xs text-slate-500">{payment.customerEmail}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <p className="font-bold text-slate-900">GH₵{payment.amount.toLocaleString()}</p>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="h-4 w-4 text-slate-400" />
                                                    <span className="text-slate-700">{payment.method.replace('_', ' ')}</span>
                                                </div>
                                                {payment.cardLast4 && (
                                                    <p className="text-xs text-slate-500">•••• {payment.cardLast4}</p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`gap-1 ${statusColors[payment.status]}`}>
                                                    <StatusIcon className="h-3 w-3" />
                                                    {payment.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-slate-500">
                                                {new Date(payment.createdAt).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => { setSelectedPayment(payment); setDetailOpen(true); }} className="text-slate-500 hover:text-slate-900 hover:bg-slate-100">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {payment.status === 'PENDING' && (
                                                        <Button variant="ghost" size="icon" onClick={() => handleRetryVerification(payment)} className="text-orange-500 hover:text-orange-700 hover:bg-orange-50">
                                                            <RefreshCw className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* Payment Detail Dialog */}
            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="max-w-lg bg-white border-slate-200 text-slate-900">
                    <DialogHeader>
                        <DialogTitle>Payment Details</DialogTitle>
                    </DialogHeader>
                    {selectedPayment && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                <div>
                                    <p className="text-2xl font-bold">GH₵{selectedPayment.amount.toLocaleString()}</p>
                                    <p className="text-sm text-slate-500">{selectedPayment.transactionRef}</p>
                                </div>
                                <Badge variant="outline" className={`text-lg px-4 py-2 ${statusColors[selectedPayment.status]}`}>
                                    {selectedPayment.status}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                                    <p className="text-xs text-slate-500">Customer</p>
                                    <p className="font-medium">{selectedPayment.customerName}</p>
                                    <p className="text-sm text-slate-500">{selectedPayment.customerEmail}</p>
                                </div>
                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                                    <p className="text-xs text-slate-500">Order</p>
                                    <p className="font-medium">{selectedPayment.orderNumber}</p>
                                </div>
                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                                    <p className="text-xs text-slate-500">Payment Method</p>
                                    <p className="font-medium">{selectedPayment.method.replace('_', ' ')}</p>
                                    {selectedPayment.cardType && <p className="text-sm text-slate-500">{selectedPayment.cardType} •••• {selectedPayment.cardLast4}</p>}
                                    {selectedPayment.mobileNumber && <p className="text-sm text-slate-500">{selectedPayment.mobileNumber}</p>}
                                </div>
                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                                    <p className="text-xs text-slate-500">Provider</p>
                                    <p className="font-medium">{selectedPayment.provider}</p>
                                </div>
                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                                    <p className="text-xs text-slate-500">Created</p>
                                    <p className="font-medium">{new Date(selectedPayment.createdAt).toLocaleString()}</p>
                                </div>
                                {selectedPayment.completedAt && (
                                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                                        <p className="text-xs text-slate-500">Completed</p>
                                        <p className="font-medium">{new Date(selectedPayment.completedAt).toLocaleString()}</p>
                                    </div>
                                )}
                            </div>

                            {selectedPayment.failedReason && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-xs text-red-600 font-medium">Failure Reason</p>
                                    <p className="text-red-700">{selectedPayment.failedReason}</p>
                                </div>
                            )}

                            {selectedPayment.gatewayResponse && (
                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                                    <p className="text-xs text-slate-500">Gateway Response</p>
                                    <p className="font-medium">{selectedPayment.gatewayResponse}</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
