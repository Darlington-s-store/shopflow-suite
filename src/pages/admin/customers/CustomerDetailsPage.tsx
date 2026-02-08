import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Ban, CheckCircle, Mail, LogOut, Flag, MessageSquare, MapPin, Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useCustomerManagement } from '@/contexts/CustomerManagementContext';
import { CustomerFlag } from '@/types/customer';
import { toast } from 'sonner';

export default function CustomerDetailsPage() {
    const navigate = useNavigate();
    const { customerId } = useParams<{ customerId: string }>();
    const {
        getCustomerDetails,
        suspendCustomer,
        unsuspendCustomer,
        resetCustomerPassword,
        forceLogout,
        addCustomerFlag,
        removeCustomerFlag,
        addCustomerNote,
        getAuditLogs,
    } = useCustomerManagement();

    const customerDetails = customerId ? getCustomerDetails(customerId) : null;
    const [noteText, setNoteText] = useState('');
    const [selectedFlag, setSelectedFlag] = useState<CustomerFlag | ''>('');

    if (!customerDetails) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Customer Not Found</h2>
                    <p className="text-slate-500 mb-4">The customer you're looking for doesn't exist.</p>
                    <Button onClick={() => navigate('/admin/customers')}>
                        Back to Customers
                    </Button>
                </div>
            </div>
        );
    }

    const customer = customerDetails;

    const handleSuspend = async () => {
        const reason = prompt('Enter reason for suspension:');
        if (reason) {
            const result = await suspendCustomer(customer.id, reason);
            if (result.success) {
                toast.success('Customer suspended');
            }
        }
    };

    const handleUnsuspend = async () => {
        const reason = prompt('Enter reason for activation:');
        if (reason) {
            const result = await unsuspendCustomer(customer.id, reason);
            if (result.success) {
                toast.success('Customer activated');
            }
        }
    };

    const handleResetPassword = async () => {
        if (confirm(`Send password reset link to ${customer.email}?`)) {
            const result = await resetCustomerPassword(customer.id);
            if (result.success) {
                toast.success('Password reset link sent');
            }
        }
    };

    const handleForceLogout = async () => {
        if (confirm('Force logout this customer from all devices?')) {
            const result = await forceLogout(customer.id);
            if (result.success) {
                toast.success('Customer logged out');
            }
        }
    };

    const handleAddFlag = async () => {
        if (selectedFlag) {
            const result = await addCustomerFlag(customer.id, selectedFlag);
            if (result.success) {
                setSelectedFlag('');
            }
        }
    };

    const handleRemoveFlag = async (flag: CustomerFlag) => {
        const result = await removeCustomerFlag(customer.id, flag);
        if (result.success) {
            toast.success('Flag removed');
        }
    };

    const handleAddNote = async () => {
        if (noteText.trim()) {
            const result = await addCustomerNote(customer.id, noteText, 'admin-id', 'Admin User');
            if (result.success) {
                setNoteText('');
            }
        }
    };

    const getStatusBadge = () => {
        const styles = {
            ACTIVE: 'bg-green-100 text-green-700 border-green-200',
            SUSPENDED: 'bg-red-100 text-red-700 border-red-200',
            DELETED: 'bg-slate-100 text-slate-700 border-slate-200',
        };
        return styles[customer.status];
    };

    const getFlagBadge = (flag: CustomerFlag) => {
        const styles = {
            HIGH_RISK: 'bg-red-100 text-red-700 border-red-200',
            FREQUENT_RETURNS: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            VIP: 'bg-purple-100 text-purple-700 border-purple-200',
            BLOCKED_COD: 'bg-orange-100 text-orange-700 border-orange-200',
        };
        return styles[flag];
    };

    const getFlagLabel = (flag: CustomerFlag) => {
        const labels = {
            HIGH_RISK: 'High Risk',
            FREQUENT_RETURNS: 'Frequent Returns',
            VIP: 'VIP',
            BLOCKED_COD: 'COD Blocked',
        };
        return labels[flag];
    };

    const availableFlags = (['HIGH_RISK', 'FREQUENT_RETURNS', 'VIP', 'BLOCKED_COD'] as CustomerFlag[])
        .filter(flag => !customer.flags.includes(flag));

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/admin/customers')}
                                className="gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">
                                    {customer.firstName} {customer.lastName}
                                </h1>
                                <p className="text-sm text-slate-500">{customer.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {customer.status === 'ACTIVE' ? (
                                <Button
                                    variant="outline"
                                    onClick={handleSuspend}
                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                >
                                    <Ban className="h-4 w-4 mr-2" />
                                    Suspend Account
                                </Button>
                            ) : customer.status === 'SUSPENDED' ? (
                                <Button
                                    variant="outline"
                                    onClick={handleUnsuspend}
                                    className="text-green-600 border-green-600 hover:bg-green-50"
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Activate Account
                                </Button>
                            ) : null}
                            <Button variant="outline" onClick={handleResetPassword}>
                                <Mail className="h-4 w-4 mr-2" />
                                Reset Password
                            </Button>
                            <Button variant="outline" onClick={handleForceLogout}>
                                <LogOut className="h-4 w-4 mr-2" />
                                Force Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Customer Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Customer Information</CardTitle>
                                <CardDescription>Basic account details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm text-slate-500">Full Name</Label>
                                        <p className="text-sm font-medium text-slate-900">
                                            {customer.firstName} {customer.lastName}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-sm text-slate-500">Status</Label>
                                        <div className="mt-1">
                                            <Badge variant="outline" className={getStatusBadge()}>
                                                {customer.status}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm text-slate-500">Email</Label>
                                        <p className="text-sm font-medium text-slate-900">{customer.email}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm text-slate-500">Phone</Label>
                                        <p className="text-sm font-medium text-slate-900">{customer.phone}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm text-slate-500">Email Verified</Label>
                                        <p className="text-sm font-medium text-slate-900">
                                            {customer.emailVerified ? '✓ Verified' : '✗ Not Verified'}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-sm text-slate-500">Phone Verified</Label>
                                        <p className="text-sm font-medium text-slate-900">
                                            {customer.phoneVerified ? '✓ Verified' : '✗ Not Verified'}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-sm text-slate-500">Joined</Label>
                                        <p className="text-sm font-medium text-slate-900">
                                            {new Date(customer.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-sm text-slate-500">Last Login</Label>
                                        <p className="text-sm font-medium text-slate-900">
                                            {customer.lastLogin ? new Date(customer.lastLogin).toLocaleDateString() : 'Never'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Statistics */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Statistics</CardTitle>
                                <CardDescription>Customer purchase history</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                                        <p className="text-2xl font-bold text-slate-900">{customer.totalOrders}</p>
                                        <p className="text-sm text-slate-500">Total Orders</p>
                                    </div>
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <p className="text-2xl font-bold text-green-600">GHS {customer.totalSpent.toFixed(2)}</p>
                                        <p className="text-sm text-slate-500">Total Spent</p>
                                    </div>
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <p className="text-2xl font-bold text-blue-600">{customer.successfulDeliveries}</p>
                                        <p className="text-sm text-slate-500">Successful</p>
                                    </div>
                                    <div className="text-center p-4 bg-red-50 rounded-lg">
                                        <p className="text-2xl font-bold text-red-600">{customer.failedDeliveries}</p>
                                        <p className="text-sm text-slate-500">Failed</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Orders */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Orders</CardTitle>
                                <CardDescription>Last 5 orders from this customer</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {customer.recentOrders.length === 0 ? (
                                    <p className="text-sm text-slate-500 text-center py-8">No orders yet</p>
                                ) : (
                                    <div className="space-y-3">
                                        {customer.recentOrders.map((order) => (
                                            <div
                                                key={order.id}
                                                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
                                            >
                                                <div>
                                                    <p className="font-medium text-slate-900">#{order.orderNumber}</p>
                                                    <p className="text-sm text-slate-500">
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium text-slate-900">GHS {order.total.toFixed(2)}</p>
                                                    <Badge variant="outline" className="text-xs">
                                                        {order.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Audit Logs */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Audit Logs</CardTitle>
                                <CardDescription>Admin actions on this account</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {customer.auditLogs.length === 0 ? (
                                    <p className="text-sm text-slate-500 text-center py-8">No audit logs</p>
                                ) : (
                                    <div className="space-y-3">
                                        {customer.auditLogs.map((log) => (
                                            <div key={log.id} className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg">
                                                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-orange-600 text-xs">AL</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-slate-900">{log.action}</p>
                                                    <p className="text-sm text-slate-500">
                                                        by {log.adminName} • {new Date(log.createdAt).toLocaleString()}
                                                    </p>
                                                    {log.reason && (
                                                        <p className="text-sm text-slate-600 mt-1">Reason: {log.reason}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Flags */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Customer Flags</CardTitle>
                                <CardDescription>Risk and behavior indicators</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    {customer.flags.length === 0 ? (
                                        <p className="text-sm text-slate-500">No flags</p>
                                    ) : (
                                        customer.flags.map((flag) => (
                                            <div key={flag} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                <Badge variant="outline" className={getFlagBadge(flag)}>
                                                    {getFlagLabel(flag)}
                                                </Badge>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveFlag(flag)}
                                                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {availableFlags.length > 0 && (
                                    <>
                                        <Separator />
                                        <div className="space-y-2">
                                            <Label>Add Flag</Label>
                                            <div className="flex gap-2">
                                                <Select value={selectedFlag} onValueChange={(value) => setSelectedFlag(value as CustomerFlag)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select flag" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableFlags.map((flag) => (
                                                            <SelectItem key={flag} value={flag}>
                                                                {getFlagLabel(flag)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <Button onClick={handleAddFlag} disabled={!selectedFlag} size="sm">
                                                    <Flag className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Admin Notes */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Admin Notes</CardTitle>
                                <CardDescription>Internal notes (customer can't see)</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    {customer.notes.length === 0 ? (
                                        <p className="text-sm text-slate-500">No notes yet</p>
                                    ) : (
                                        customer.notes.map((note) => (
                                            <div key={note.id} className="p-3 bg-slate-50 rounded-lg">
                                                <p className="text-sm text-slate-900">{note.note}</p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {note.adminName} • {new Date(note.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <Label>Add Note</Label>
                                    <Textarea
                                        placeholder="Enter internal note..."
                                        value={noteText}
                                        onChange={(e) => setNoteText(e.target.value)}
                                        rows={3}
                                    />
                                    <Button onClick={handleAddNote} disabled={!noteText.trim()} size="sm" className="w-full">
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        Add Note
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Addresses */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Saved Addresses</CardTitle>
                                <CardDescription>{customer.addresses.length} address(es)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {customer.addresses.length === 0 ? (
                                    <p className="text-sm text-slate-500">No saved addresses</p>
                                ) : (
                                    <div className="space-y-3">
                                        {customer.addresses.map((address) => (
                                            <div key={address.id} className="p-3 border border-slate-200 rounded-lg">
                                                <div className="flex items-start justify-between mb-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        {address.label}
                                                    </Badge>
                                                    {address.isDefault && (
                                                        <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                                                            Default
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm font-medium text-slate-900">{address.fullName}</p>
                                                <p className="text-sm text-slate-600">{address.phone}</p>
                                                <p className="text-sm text-slate-600 mt-1">
                                                    {address.addressLine1}
                                                    {address.addressLine2 && `, ${address.addressLine2}`}
                                                </p>
                                                <p className="text-sm text-slate-600">
                                                    {address.city}, {address.region}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
