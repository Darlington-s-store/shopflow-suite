import { useState } from 'react';
import { Plus, MapPin, Edit2, Trash2, Check, Home, Building2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Address } from '@/types';

const ghanaRegions = [
    'Greater Accra', 'Ashanti', 'Western', 'Central', 'Eastern',
    'Northern', 'Volta', 'Upper East', 'Upper West', 'Bono',
    'Bono East', 'Ahafo', 'Western North', 'Oti', 'North East', 'Savannah'
];

export default function UserAddresses() {
    const { user, addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAuth();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [deletingAddress, setDeletingAddress] = useState<Address | null>(null);

    const [form, setForm] = useState({
        label: 'Home',
        fullName: '',
        phone: '',
        street: '',
        city: '',
        state: 'Greater Accra',
        country: 'Ghana',
        postalCode: '',
        isDefault: false,
    });

    const openAddDialog = () => {
        setEditingAddress(null);
        setForm({
            label: 'Home',
            fullName: user ? `${user.firstName} ${user.lastName}` : '',
            phone: user?.phone || '',
            street: '',
            city: '',
            state: 'Greater Accra',
            country: 'Ghana',
            postalCode: '',
            isDefault: addresses.length === 0,
        });
        setDialogOpen(true);
    };

    const openEditDialog = (address: Address) => {
        setEditingAddress(address);
        setForm({
            label: address.label,
            fullName: address.fullName,
            phone: address.phone,
            street: address.street,
            city: address.city,
            state: address.state,
            country: address.country,
            postalCode: address.postalCode,
            isDefault: address.isDefault,
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!form.fullName || !form.phone || !form.street || !form.city) {
            toast.error('Please fill in all required fields');
            return;
        }

        const payload = {
            label: form.label,
            fullName: form.fullName,
            phone: form.phone,
            street: form.street,
            city: form.city,
            state: form.state,
            country: form.country,
            postalCode: form.postalCode,
            isDefault: form.isDefault
        };

        try {
            let res;
            if (editingAddress) {
                res = await updateAddress(editingAddress.id, payload);
            } else {
                res = await addAddress(payload);
            }

            if (res.success) {
                toast.success(editingAddress ? 'Address updated' : 'Address added');
                setDialogOpen(false);
            } else {
                toast.error(res.error || 'Operation failed');
            }
        } catch (error) {
            console.error('Save address error:', error);
            toast.error('An error occurred');
        }
    };

    const handleDelete = async () => {
        if (!deletingAddress) return;

        try {
            const res = await deleteAddress(deletingAddress.id);

            if (res.success) {
                toast.success('Address deleted');
                setDeleteDialogOpen(false);
                setDeletingAddress(null);
            } else {
                toast.error(res.error || 'Failed to delete address');
            }
        } catch (error) {
            console.error('Delete address error:', error);
            toast.error('An error occurred');
        }
    };

    const setAsDefault = async (address: Address) => {
        try {
            await setDefaultAddress(address.id);
            toast.success('Default address updated');
        } catch (error) {
            console.error('Set default error:', error);
            toast.error('Failed to update default address');
        }
    };

    const getLabelIcon = (label: string) => {
        switch (label.toLowerCase()) {
            case 'home': return Home;
            case 'office': return Building2;
            default: return MapPin;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">My Addresses</h1>
                    <p className="text-muted-foreground">Manage your delivery addresses</p>
                </div>
                <Button onClick={openAddDialog} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Address
                </Button>
            </div>

            {addresses.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No addresses yet</h3>
                        <p className="text-muted-foreground mb-4">Add a delivery address to get started</p>
                        <Button onClick={openAddDialog}>Add Your First Address</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {addresses.map(address => {
                        const LabelIcon = getLabelIcon(address.label);
                        return (
                            <Card key={address.id} className={`relative ${address.isDefault ? 'border-primary ring-1 ring-primary/20' : ''}`}>
                                {address.isDefault && (
                                    <Badge className="absolute top-3 right-3 gap-1">
                                        <Star className="h-3 w-3" /> Default
                                    </Badge>
                                )}
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <LabelIcon className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold mb-1">{address.label}</h3>
                                            <p className="font-medium">{address.fullName}</p>
                                            <p className="text-sm text-muted-foreground">{address.phone}</p>
                                            <p className="text-sm text-muted-foreground mt-2">{address.street}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {address.city}, {address.state}
                                            </p>
                                            <p className="text-sm text-muted-foreground">{address.country}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-4 pt-4 border-t">
                                        <Button variant="outline" size="sm" onClick={() => openEditDialog(address)} className="gap-1">
                                            <Edit2 className="h-3 w-3" /> Edit
                                        </Button>
                                        {!address.isDefault && (
                                            <Button variant="outline" size="sm" onClick={() => setAsDefault(address)} className="gap-1">
                                                <Check className="h-3 w-3" /> Set Default
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => { setDeletingAddress(address); setDeleteDialogOpen(true); }}
                                            className="gap-1 text-destructive hover:text-destructive ml-auto"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Label</Label>
                            <Select value={form.label} onValueChange={(v) => setForm(f => ({ ...f, label: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Home">Home</SelectItem>
                                    <SelectItem value="Office">Office</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Full Name *</Label>
                                <Input value={form.fullName} onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone *</Label>
                                <Input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+233 XX XXX XXXX" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Street Address *</Label>
                            <Input value={form.street} onChange={(e) => setForm(f => ({ ...f, street: e.target.value }))} placeholder="123 Main Street" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>City *</Label>
                                <Input value={form.city} onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Accra" />
                            </div>
                            <div className="space-y-2">
                                <Label>Region *</Label>
                                <Select value={form.state} onValueChange={(v) => setForm(f => ({ ...f, state: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {ghanaRegions.map(r => (
                                            <SelectItem key={r} value={r}>{r}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isDefault"
                                checked={form.isDefault}
                                onChange={(e) => setForm(f => ({ ...f, isDefault: e.target.checked }))}
                                className="rounded border-gray-300"
                            />
                            <Label htmlFor="isDefault" className="font-normal cursor-pointer">Set as default address</Label>
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>{editingAddress ? 'Update' : 'Add'} Address</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Address</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this address? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}


