import { useState } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ProductVariant, VariantStatus } from '@/types/product';
import { toast } from 'sonner';

interface VariantManagerProps {
    variants: ProductVariant[];
    onVariantsChange: (variants: ProductVariant[]) => void;
    productName: string;
}

export function VariantManager({ variants, onVariantsChange, productName }: VariantManagerProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<ProductVariant>>({
        color: '',
        storage: '',
        price: 0,
        discountPrice: 0,
        stock: 0,
        status: 'ACTIVE',
    });

    const generateSKU = (color?: string, storage?: string) => {
        const prefix = productName.substring(0, 3).toUpperCase();
        const colorCode = color?.substring(0, 2).toUpperCase() || 'XX';
        const storageCode = storage?.replace(/[^0-9]/g, '') || '00';
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}-${colorCode}${storageCode}-${random}`;
    };

    const handleAddVariant = () => {
        if (!formData.color || !formData.storage || !formData.price) {
            toast.error('Please fill in all required fields');
            return;
        }

        const newVariant: ProductVariant = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            sku: formData.sku || generateSKU(formData.color, formData.storage),
            color: formData.color,
            storage: formData.storage,
            price: formData.price || 0,
            discountPrice: formData.discountPrice,
            stock: formData.stock || 0,
            status: formData.status || 'ACTIVE',
        };

        onVariantsChange([...variants, newVariant]);
        setFormData({
            color: '',
            storage: '',
            price: 0,
            discountPrice: 0,
            stock: 0,
            status: 'ACTIVE',
        });
        setIsAdding(false);
        toast.success('Variant added successfully');
    };

    const handleUpdateVariant = () => {
        if (!editingId) return;

        const updatedVariants = variants.map(v =>
            v.id === editingId ? { ...v, ...formData } : v
        );

        onVariantsChange(updatedVariants);
        setEditingId(null);
        setFormData({
            color: '',
            storage: '',
            price: 0,
            discountPrice: 0,
            stock: 0,
            status: 'ACTIVE',
        });
        toast.success('Variant updated successfully');
    };

    const handleDeleteVariant = (id: string) => {
        onVariantsChange(variants.filter(v => v.id !== id));
        toast.success('Variant deleted');
    };

    const startEdit = (variant: ProductVariant) => {
        setEditingId(variant.id);
        setFormData(variant);
        setIsAdding(false);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setIsAdding(false);
        setFormData({
            color: '',
            storage: '',
            price: 0,
            discountPrice: 0,
            stock: 0,
            status: 'ACTIVE',
        });
    };

    const getStatusBadge = (status: VariantStatus) => {
        const styles = {
            ACTIVE: 'bg-green-100 text-green-700 border-green-200',
            DISABLED: 'bg-slate-100 text-slate-700 border-slate-200',
            OUT_OF_STOCK: 'bg-red-100 text-red-700 border-red-200',
        };
        return styles[status] || 'bg-green-100 text-green-700 border-green-200';
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">Product Variants</h3>
                    <p className="text-sm text-slate-500">Add color and storage options with individual pricing</p>
                </div>
                {!isAdding && !editingId && (
                    <Button
                        type="button"
                        onClick={() => setIsAdding(true)}
                        className="bg-orange-600 hover:bg-orange-700"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Variant
                    </Button>
                )}
            </div>

            {/* Add/Edit Form */}
            {(isAdding || editingId) && (
                <div className="border border-slate-200 rounded-lg p-6 bg-slate-50">
                    <h4 className="font-medium text-slate-900 mb-4">
                        {editingId ? 'Edit Variant' : 'Add New Variant'}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="color">Color *</Label>
                            <Input
                                id="color"
                                placeholder="e.g., Black, Silver, Blue"
                                value={formData.color || ''}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                className="bg-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="storage">Storage *</Label>
                            <Input
                                id="storage"
                                placeholder="e.g., 64GB, 128GB, 256GB"
                                value={formData.storage || ''}
                                onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                                className="bg-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price">Price (GHS) *</Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.price || ''}
                                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                className="bg-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="discountPrice">Discount Price (GHS)</Label>
                            <Input
                                id="discountPrice"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.discountPrice || ''}
                                onChange={(e) => setFormData({ ...formData, discountPrice: parseFloat(e.target.value) || undefined })}
                                className="bg-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="stock">Stock Quantity *</Label>
                            <Input
                                id="stock"
                                type="number"
                                placeholder="0"
                                value={formData.stock || ''}
                                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                                className="bg-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status || 'ACTIVE'}
                                onValueChange={(value) => setFormData({ ...formData, status: value as VariantStatus })}
                            >
                                <SelectTrigger className="bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="DISABLED">Disabled</SelectItem>
                                    <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="sku">SKU (Auto-generated)</Label>
                            <Input
                                id="sku"
                                placeholder="Will be auto-generated"
                                value={formData.sku || generateSKU(formData.color, formData.storage)}
                                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                className="bg-white font-mono text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <Button
                            type="button"
                            onClick={editingId ? handleUpdateVariant : handleAddVariant}
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            {editingId ? 'Update Variant' : 'Add Variant'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={cancelEdit}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            {/* Variants List */}
            {variants.length > 0 ? (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">SKU</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Color</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Storage</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Price</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Stock</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Status</th>
                                    <th className="text-right px-4 py-3 text-sm font-medium text-slate-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                                {variants.map((variant) => (
                                    <tr key={variant.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm font-mono text-slate-600">{variant.sku}</td>
                                        <td className="px-4 py-3 text-sm text-slate-900">{variant.color}</td>
                                        <td className="px-4 py-3 text-sm text-slate-900">{variant.storage}</td>
                                        <td className="px-4 py-3 text-sm text-slate-900">
                                            <div className="flex flex-col">
                                                <span className="font-medium">GHS {(Number(variant.price) || 0).toFixed(2)}</span>
                                                {variant.discountPrice && (
                                                    <span className="text-xs text-green-600">
                                                        Sale: GHS {(Number(variant.discountPrice) || 0).toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-900">
                                            <span className={variant.stock <= 10 ? 'text-red-600 font-medium' : ''}>
                                                {variant.stock}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant="outline" className={getStatusBadge(variant.status)}>
                                                {variant.status?.replace('_', ' ') || 'Active'}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => startEdit(variant)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDeleteVariant(variant.id)}
                                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 border border-dashed border-slate-300 rounded-lg bg-slate-50">
                    <p className="text-sm text-slate-500">No variants added yet</p>
                    <p className="text-xs text-slate-400 mt-1">Click "Add Variant" to create color and storage options</p>
                </div>
            )}

            {variants.length > 0 && (
                <div className="flex items-center gap-4 text-sm text-slate-600 bg-slate-50 p-4 rounded-lg">
                    <div>
                        <span className="font-medium">Total Variants:</span> {variants.length}
                    </div>
                    <div>
                        <span className="font-medium">Total Stock:</span> {variants.reduce((sum, v) => sum + v.stock, 0)}
                    </div>
                    <div>
                        <span className="font-medium">Price Range:</span> GHS {Math.min(...variants.map(v => v.price)).toFixed(2)} - GHS {Math.max(...variants.map(v => v.price)).toFixed(2)}
                    </div>
                </div>
            )}
        </div>
    );
}
