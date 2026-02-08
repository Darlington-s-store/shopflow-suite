import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, StopCircle, PlayCircle, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Deal {
    id: string;
    title: string;
    description?: string;
    image_url?: string;
    discount_percentage?: number;
    start_date?: string;
    end_date?: string;
    info?: string;
    is_active: boolean;
    created_at: string;
}

export default function AdminDeals() {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const [deals, setDeals] = useState<Deal[]>([]);
    const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const [form, setForm] = useState({
        title: '',
        description: '',
        image_url: '',
        discount_percentage: 0,
        start_date: '',
        end_date: '',
        info: '',
        is_active: true
    });

    const loadDeals = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${apiUrl}/deals`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setDeals(data.deals || []);
            } else {
                toast.error('Failed to load deals');
            }
        } catch (error) {
            console.error('Error loading deals:', error);
            toast.error('Failed to load deals');
        } finally {
            setIsLoading(false);
        }
    }, [apiUrl]);

    useEffect(() => {
        loadDeals();
    }, [loadDeals]);

    useEffect(() => {
        if (!searchQuery) {
            setFilteredDeals(deals);
        } else {
            const query = searchQuery.toLowerCase();
            setFilteredDeals(deals.filter(d =>
                d.title.toLowerCase().includes(query) ||
                d.description?.toLowerCase().includes(query)
            ));
        }
    }, [deals, searchQuery]);

    const handleSave = async () => {
        if (!form.title) {
            toast.error('Title is required');
            return;
        }

        try {
            const url = editingDeal ? `${apiUrl}/deals/${editingDeal.id}` : `${apiUrl}/deals`;
            const method = editingDeal ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(form)
            });

            if (response.ok) {
                await loadDeals();
                toast.success(editingDeal ? 'Deal updated' : 'Deal created');
                setDialogOpen(false);
            } else {
                toast.error('Failed to save deal');
            }
        } catch (error) {
            console.error('Error saving deal:', error);
            toast.error('Failed to save deal');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this deal?')) return;
        try {
            const response = await fetch(`${apiUrl}/deals/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                await loadDeals();
                toast.success('Deal deleted');
            } else {
                toast.error('Failed to delete deal');
            }
        } catch (error) {
            console.error('Error deleting deal:', error);
            toast.error('Failed to delete deal');
        }
    };

    const toggleActive = async (deal: Deal) => {
        try {
            const response = await fetch(`${apiUrl}/deals/${deal.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ ...deal, is_active: !deal.is_active })
            });

            if (response.ok) {
                await loadDeals();
                toast.success(`Deal ${!deal.is_active ? 'activated' : 'deactivated'}`);
            } else {
                toast.error('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const openDialog = (deal?: Deal) => {
        if (deal) {
            setEditingDeal(deal);
            setForm({
                title: deal.title,
                description: deal.description || '',
                image_url: deal.image_url || '',
                discount_percentage: deal.discount_percentage || 0,
                start_date: deal.start_date || '',
                end_date: deal.end_date || '',
                info: deal.info || '',
                is_active: deal.is_active
            });
        } else {
            setEditingDeal(null);
            setForm({
                title: '',
                description: '',
                image_url: '',
                discount_percentage: 0,
                start_date: '',
                end_date: '',
                info: '',
                is_active: true
            });
        }
        setDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Deals & Offers</h1>
                    <p className="text-slate-500">Manage promotional deals and flash sales</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={loadDeals} variant="outline" className="gap-2" disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                    </Button>
                    <Button onClick={() => openDialog()} className="gap-2 bg-orange-600 hover:bg-orange-700 text-white">
                        <Plus className="h-4 w-4" /> Create Deal
                    </Button>
                </div>
            </div>

            <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search deals..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-slate-50 border-slate-200 text-slate-900"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full py-12 text-center text-slate-500">
                        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" /> Loading deals...
                    </div>
                ) : filteredDeals.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-500">No deals found</div>
                ) : (
                    filteredDeals.map(deal => (
                        <Card key={deal.id} className="overflow-hidden border-slate-200">
                            <div className="h-40 bg-slate-100 relative">
                                {deal.image_url ? (
                                    <img src={deal.image_url} alt={deal.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-400">
                                        <ImageIcon className="h-12 w-12" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2">
                                    <Badge className={deal.is_active ? 'bg-green-500' : 'bg-slate-500'}>
                                        {deal.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </div>
                            <CardContent className="p-4 space-y-3">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{deal.title}</h3>
                                    <p className="text-sm text-slate-500 line-clamp-2">{deal.description}</p>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    {deal.discount_percentage && <Badge variant="secondary" className="bg-orange-100 text-orange-700">{deal.discount_percentage}% OFF</Badge>}
                                </div>
                                <div className="text-xs text-slate-400">
                                    {deal.start_date && new Date(deal.start_date).toLocaleDateString()}
                                    {deal.end_date && ` - ${new Date(deal.end_date).toLocaleDateString()}`}
                                </div>
                                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                    <Button variant="ghost" size="sm" onClick={() => toggleActive(deal)}>
                                        {deal.is_active ? <StopCircle className="h-4 w-4 text-slate-500" /> : <PlayCircle className="h-4 w-4 text-green-600" />}
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => openDialog(deal)}>
                                        <Edit2 className="h-4 w-4 text-blue-600" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(deal.id)} className="text-red-500 hover:text-red-700">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-md bg-white border-slate-200 text-slate-900 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingDeal ? 'Edit Deal' : 'Create Deal'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Title *</Label>
                            <Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Deal Title" />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
                        </div>
                        <div className="space-y-2">
                            <Label>Image URL</Label>
                            <Input value={form.image_url} onChange={(e) => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Discount (%)</Label>
                                <Input type="number" value={form.discount_percentage} onChange={(e) => setForm(f => ({ ...f, discount_percentage: Number(e.target.value) }))} />
                            </div>
                            <div className="space-y-2 flex items-center pt-8 gap-2">
                                <Switch checked={form.is_active} onCheckedChange={(c) => setForm(f => ({ ...f, is_active: c }))} />
                                <span className="text-sm">Active</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Input type="datetime-local" value={form.start_date} onChange={(e) => setForm(f => ({ ...f, start_date: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>End Date</Label>
                                <Input type="datetime-local" value={form.end_date} onChange={(e) => setForm(f => ({ ...f, end_date: e.target.value }))} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} className="bg-orange-600 hover:bg-orange-700 text-white">Save Deal</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
