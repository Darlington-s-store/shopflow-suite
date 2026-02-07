import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, Copy, MoreHorizontal, Tag, Percent, Calendar, Clock, Users, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface Coupon {
    id: string;
    code: string;
    type: 'PERCENTAGE' | 'FIXED';
    value: number;
    minOrder: number;
    maxDiscount?: number;
    usageLimit: number;
    usedCount: number;
    startDate: string;
    endDate: string;
    status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
    description?: string;
    createdAt: string;
}

const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700 border-0',
    INACTIVE: 'bg-slate-100 text-slate-700 border-0',
    EXPIRED: 'bg-red-100 text-red-700 border-0',
};

export default function AdminCoupons() {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const [form, setForm] = useState({
        code: '',
        type: 'PERCENTAGE' as Coupon['type'],
        value: 10,
        minOrder: 0,
        maxDiscount: 0,
        usageLimit: 100,
        startDate: '',
        endDate: '',
        description: '',
        isActive: true,
    });

    // Load coupons from backend
    const loadCoupons = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${apiUrl}/coupons`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setCoupons(data.coupons || []);
            } else {
                toast.error('Failed to load coupons');
            }
        } catch (error) {
            console.error('Error loading coupons:', error);
            toast.error('Failed to load coupons');
        } finally {
            setIsLoading(false);
        }
    }, [apiUrl]);

    useEffect(() => {
        loadCoupons();
    }, [loadCoupons]);

    useEffect(() => {
        let result = [...coupons];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(c =>
                c.code.toLowerCase().includes(query) ||
                c.description?.toLowerCase().includes(query)
            );
        }

        if (statusFilter !== 'all') {
            result = result.filter(c => c.status === statusFilter);
        }

        setFilteredCoupons(result);
    }, [coupons, searchQuery, statusFilter]);

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setForm(f => ({ ...f, code }));
    };

    const openAddDialog = () => {
        setEditingCoupon(null);
        const today = new Date().toISOString().split('T')[0];
        const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        setForm({
            code: '',
            type: 'PERCENTAGE',
            value: 10,
            minOrder: 0,
            maxDiscount: 0,
            usageLimit: 100,
            startDate: today,
            endDate: nextMonth,
            description: '',
            isActive: true,
        });
        setDialogOpen(true);
    };

    const openEditDialog = (coupon: Coupon) => {
        setEditingCoupon(coupon);
        setForm({
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            minOrder: coupon.minOrder,
            maxDiscount: coupon.maxDiscount || 0,
            usageLimit: coupon.usageLimit,
            startDate: coupon.startDate,
            endDate: coupon.endDate,
            description: coupon.description || '',
            isActive: coupon.status === 'ACTIVE',
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!form.code || !form.value || !form.endDate) {
            toast.error('Please fill in all required fields');
            return;
        }

        const status = form.isActive
            ? new Date(form.endDate) < new Date() ? 'EXPIRED' : 'ACTIVE'
            : 'INACTIVE';

        const couponData = {
            code: form.code.toUpperCase(),
            type: form.type,
            value: form.value,
            minOrder: form.minOrder,
            maxDiscount: form.maxDiscount || undefined,
            usageLimit: form.usageLimit,
            startDate: form.startDate,
            endDate: form.endDate,
            status,
            description: form.description || undefined,
        };

        try {
            const token = null;
            const url = editingCoupon
                ? `${apiUrl}/coupons/${editingCoupon.id}`
                : `${apiUrl}/coupons`;
            const method = editingCoupon ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(couponData),
            });

            if (response.ok) {
                await loadCoupons();
                toast.success(editingCoupon ? 'Coupon updated' : 'Coupon created');
                setDialogOpen(false);
            } else {
                toast.error('Failed to save coupon');
            }
        } catch (error) {
            console.error('Error saving coupon:', error);
            toast.error('Failed to save coupon');
        }
    };

    const handleDelete = async () => {
        if (!deletingCoupon) return;

        try {
            const response = await fetch(`${apiUrl}/coupons/${deletingCoupon.id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                await loadCoupons();
                toast.success('Coupon deleted');
                setDeleteDialogOpen(false);
                setDeletingCoupon(null);
            } else {
                toast.error('Failed to delete coupon');
            }
        } catch (error) {
            console.error('Error deleting coupon:', error);
            toast.error('Failed to delete coupon');
        }
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success('Coupon code copied!');
    };

    const toggleStatus = async (coupon: Coupon) => {
        const newStatus = coupon.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

        try {
            const response = await fetch(`${apiUrl}/coupons/${coupon.id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...coupon, status: newStatus }),
            });

            if (response.ok) {
                await loadCoupons();
                toast.success(`Coupon ${newStatus.toLowerCase()}`);
            } else {
                toast.error('Failed to update coupon status');
            }
        } catch (error) {
            console.error('Error updating coupon:', error);
            toast.error('Failed to update coupon status');
        }
    };

    const stats = {
        total: coupons.length,
        active: coupons.filter(c => c.status === 'ACTIVE').length,
        totalUsed: coupons.reduce((sum, c) => sum + c.usedCount, 0),
        totalSavings: coupons.reduce((sum, c) => sum + (c.usedCount * (c.type === 'FIXED' ? c.value : 20)), 0),
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Coupons & Promotions</h1>
                    <p className="text-slate-500">Manage discount codes and promotional offers</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={loadCoupons}
                        variant="outline"
                        className="gap-2"
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button onClick={openAddDialog} className="gap-2 bg-orange-600 hover:bg-orange-700 text-white">
                        <Plus className="h-4 w-4" /> Create Coupon
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                                <Tag className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Total Coupons</p>
                                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                                <Percent className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Active</p>
                                <p className="text-2xl font-bold text-slate-900">{stats.active}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Times Used</p>
                                <p className="text-2xl font-bold text-slate-900">{stats.totalUsed}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                                <span className="text-lg font-bold text-yellow-600">GH₵</span>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Total Savings</p>
                                <p className="text-2xl font-bold text-slate-900">{stats.totalSavings.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search coupons..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 bg-slate-50 border-slate-200 text-slate-900"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-40 bg-slate-50 border-slate-200 text-slate-900">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="INACTIVE">Inactive</SelectItem>
                                <SelectItem value="EXPIRED">Expired</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Coupons Table */}
            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-200 hover:bg-transparent">
                                    <TableHead className="text-slate-500 min-w-[150px]">Coupon Code</TableHead>
                                    <TableHead className="text-slate-500 min-w-[150px]">Discount</TableHead>
                                    <TableHead className="text-slate-500 min-w-[150px]">Usage</TableHead>
                                    <TableHead className="text-slate-500 min-w-[200px]">Validity</TableHead>
                                    <TableHead className="text-slate-500 min-w-[100px]">Status</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                                            Loading coupons...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredCoupons.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                                            No coupons found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCoupons.map(coupon => (
                                        <TableRow key={coupon.id} className="border-slate-100 hover:bg-slate-50">
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <code className="px-2 py-1 bg-orange-50 text-orange-700 rounded font-mono text-sm border border-orange-100">
                                                        {coupon.code}
                                                    </code>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-600" onClick={() => copyCode(coupon.code)}>
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                {coupon.description && (
                                                    <p className="text-xs text-slate-500 mt-1">{coupon.description}</p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium text-slate-900">
                                                        {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : `GH₵${coupon.value}`} off
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        Min. order: GH₵{coupon.minOrder}
                                                        {coupon.maxDiscount && ` • Max: GH₵${coupon.maxDiscount}`}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-orange-500 rounded-full"
                                                            style={{ width: `${Math.min(100, (coupon.usedCount / coupon.usageLimit) * 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-slate-600">{coupon.usedCount}/{coupon.usageLimit}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm text-slate-600">
                                                    <Calendar className="h-3 w-3 text-slate-400" />
                                                    {coupon.startDate} - {coupon.endDate}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={statusColors[coupon.status]}>
                                                    {coupon.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-white border-slate-200">
                                                        <DropdownMenuItem onClick={() => copyCode(coupon.code)}>
                                                            <Copy className="h-4 w-4 mr-2" /> Copy Code
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => openEditDialog(coupon)}>
                                                            <Edit2 className="h-4 w-4 mr-2" /> Edit
                                                        </DropdownMenuItem>
                                                        {coupon.status !== 'EXPIRED' && (
                                                            <DropdownMenuItem onClick={() => toggleStatus(coupon)}>
                                                                <Clock className="h-4 w-4 mr-2" />
                                                                {coupon.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator className="bg-slate-100" />
                                                        <DropdownMenuItem
                                                            className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                                            onClick={() => { setDeletingCoupon(coupon); setDeleteDialogOpen(true); }}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-lg bg-white border-slate-200 text-slate-900 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-slate-900">{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-slate-700">Coupon Code *</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={form.code}
                                    onChange={(e) => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                                    placeholder="e.g., SAVE20"
                                    className="font-mono bg-white border-slate-200 text-slate-900"
                                />
                                <Button variant="outline" onClick={generateCode} className="border-slate-200 text-slate-700 hover:bg-slate-50">Generate</Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-700">Discount Type *</Label>
                                <Select value={form.type} onValueChange={(v: Coupon['type']) => setForm(f => ({ ...f, type: v }))}>
                                    <SelectTrigger className="bg-white border-slate-200 text-slate-900"><SelectValue /></SelectTrigger>
                                    <SelectContent className="bg-white border-slate-200 text-slate-900">
                                        <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                                        <SelectItem value="FIXED">Fixed Amount (GH₵)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-700">Discount Value *</Label>
                                <Input
                                    type="number"
                                    value={form.value}
                                    onChange={(e) => setForm(f => ({ ...f, value: Number(e.target.value) }))}
                                    className="bg-white border-slate-200 text-slate-900"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-700">Minimum Order (GH₵)</Label>
                                <Input
                                    type="number"
                                    value={form.minOrder}
                                    onChange={(e) => setForm(f => ({ ...f, minOrder: Number(e.target.value) }))}
                                    className="bg-white border-slate-200 text-slate-900"
                                />
                            </div>
                            {form.type === 'PERCENTAGE' && (
                                <div className="space-y-2">
                                    <Label className="text-slate-700">Max Discount (GH₵)</Label>
                                    <Input
                                        type="number"
                                        value={form.maxDiscount}
                                        onChange={(e) => setForm(f => ({ ...f, maxDiscount: Number(e.target.value) }))}
                                        placeholder="Optional"
                                        className="bg-white border-slate-200 text-slate-900"
                                    />
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label className="text-slate-700">Usage Limit</Label>
                                <Input
                                    type="number"
                                    value={form.usageLimit}
                                    onChange={(e) => setForm(f => ({ ...f, usageLimit: Number(e.target.value) }))}
                                    className="bg-white border-slate-200 text-slate-900"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-700">Start Date</Label>
                                <Input
                                    type="date"
                                    value={form.startDate}
                                    onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))}
                                    className="bg-white border-slate-200 text-slate-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-700">End Date *</Label>
                                <Input
                                    type="date"
                                    value={form.endDate}
                                    onChange={(e) => setForm(f => ({ ...f, endDate: e.target.value }))}
                                    className="bg-white border-slate-200 text-slate-900"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-700">Description</Label>
                            <Input
                                value={form.description}
                                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                                placeholder="Internal note about this coupon"
                                className="bg-white border-slate-200 text-slate-900"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                id="isActive"
                                checked={form.isActive}
                                onCheckedChange={(v) => setForm(f => ({ ...f, isActive: v }))}
                            />
                            <Label htmlFor="isActive" className="text-slate-700">Active</Label>
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-slate-200 text-slate-700 hover:bg-slate-50">Cancel</Button>
                        <Button onClick={handleSave} className="bg-orange-600 hover:bg-orange-700 text-white">{editingCoupon ? 'Update' : 'Create'} Coupon</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="bg-white border-slate-200 text-slate-900">
                    <DialogHeader>
                        <DialogTitle className="text-slate-900">Delete Coupon</DialogTitle>
                        <DialogDescription className="text-slate-500">
                            Are you sure you want to delete coupon "{deletingCoupon?.code}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="border-slate-200 text-slate-700 hover:bg-slate-50">Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
