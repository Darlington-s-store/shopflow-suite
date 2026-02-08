import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface Deal {
    id: string;
    productId: string;
    title: string;
    discountPercentage: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
}

export function AdminDealsPage() {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        loadDeals();
    }, []);

    const loadDeals = async () => {
        try {
            const response = await fetch(`${apiUrl}/deals`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setDeals(data.deals || []);
            }
        } catch (error) {
            console.error('Error loading deals:', error);
            toast({ title: 'Error', description: 'Failed to load deals', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (dealId: string) => {
        if (!confirm('Delete this deal?')) return;
        try {
            const response = await fetch(`${apiUrl}/deals/${dealId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (response.ok) {
                setDeals(deals.filter(d => d.id !== dealId));
                toast({ title: 'Success', description: 'Deal deleted successfully' });
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete deal', variant: 'destructive' });
        }
    };

    const filteredDeals = deals.filter(d =>
        d.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Deals Management</h1>
                <Button className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="h-4 w-4 mr-2" />
                    New Deal
                </Button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                    placeholder="Search deals..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid gap-4">
                {filteredDeals.map(deal => (
                    <Card key={deal.id} className="border-slate-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-slate-900">{deal.title}</h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        {deal.discountPercentage}% Discount • {new Date(deal.startDate).toLocaleDateString()} to {new Date(deal.endDate).toLocaleDateString()}
                                    </p>
                                    <div className="mt-2">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${deal.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                                            {deal.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm">
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleDelete(deal.id)} className="text-red-600 hover:bg-red-50">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
