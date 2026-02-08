import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Printer, Download, ArrowLeft, Check, Store, Phone, Mail,
    MapPin, Calendar, CreditCard, User, Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/types';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';

interface ReceiptViewerProps {
    order: Order;
    onClose?: () => void;
}

export default function ReceiptViewer({ order, onClose }: ReceiptViewerProps) {
    const navigate = useNavigate();
    const receiptRef = useRef<HTMLDivElement>(null);

    const storeInfo = {
        name: 'ShopFlow Electronics',
        address: '123 Tech Street, Osu',
        city: 'Accra, Ghana',
        phone: '+233 24 123 4567',
        email: 'support@shopflow.com',
        website: 'www.shopflow.com',
    };

    const invoiceNumber = `INV-${new Date(order.createdAt).getFullYear()}-${order.orderNumber.split('-').pop()}`;

    const handlePrint = useReactToPrint({
        contentRef: receiptRef,
        documentTitle: `Receipt-${order.orderNumber}`,
    });

    const handleDownloadPDF = () => {
        // In a real app, this would generate a PDF using a library like jsPDF
        toast.info('PDF download feature - In a real app, this would generate a PDF');
        handlePrint();
    };

    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = order.deliveryFee || 0;
    const tax = order.tax || 0;
    const total = order.total;

    return (
        <div className="min-h-screen bg-slate-900 p-4 lg:p-8">
            {/* Actions Bar */}
            <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between">
                <Button
                    variant="ghost"
                    className="text-slate-300 gap-2"
                    onClick={onClose || (() => navigate(-1))}
                >
                    <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-slate-600 text-slate-300 gap-2" onClick={() => handlePrint()}>
                        <Printer className="h-4 w-4" /> Print
                    </Button>
                    <Button className="gap-2" onClick={handleDownloadPDF}>
                        <Download className="h-4 w-4" /> Download PDF
                    </Button>
                </div>
            </div>

            {/* Receipt */}
            <div className="max-w-3xl mx-auto">
                <Card className="bg-white text-slate-900 shadow-xl">
                    <CardContent className="p-8" ref={receiptRef}>
                        {/* Header */}
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                                        <Store className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-slate-900">{storeInfo.name}</h1>
                                        <p className="text-sm text-slate-500">Receipt / Invoice</p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg mb-2">
                                    <Check className="h-5 w-5" />
                                    <span className="font-semibold">PAID</span>
                                </div>
                                <p className="text-sm text-slate-500">Invoice No: <strong>{invoiceNumber}</strong></p>
                            </div>
                        </div>

                        <Separator className="mb-6" />

                        {/* Store & Customer Info */}
                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-500 uppercase mb-2">From</h3>
                                <p className="font-semibold text-slate-900">{storeInfo.name}</p>
                                <p className="text-sm text-slate-600">{storeInfo.address}</p>
                                <p className="text-sm text-slate-600">{storeInfo.city}</p>
                                <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                                    <Phone className="h-3 w-3" /> {storeInfo.phone}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Mail className="h-3 w-3" /> {storeInfo.email}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-500 uppercase mb-2">Bill To</h3>
                                <p className="font-semibold text-slate-900">
                                    {order.shippingAddress.fullName}
                                </p>
                                <p className="text-sm text-slate-600">{order.shippingAddress.street}</p>
                                <p className="text-sm text-slate-600">
                                    {order.shippingAddress.city}, {order.shippingAddress.state}
                                </p>
                                <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                                    <Phone className="h-3 w-3" /> {order.shippingAddress.phone}
                                </div>
                            </div>
                        </div>

                        {/* Order Info */}
                        <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-slate-50 rounded-lg">
                            <div>
                                <p className="text-xs text-slate-500 uppercase">Order Number</p>
                                <p className="font-semibold">{order.orderNumber}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase">Order Date</p>
                                <p className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase">Payment Method</p>
                                <p className="font-semibold">{order.payment?.method || 'Card'}</p>
                            </div>
                        </div>

                        {/* Items Table */}
                        <table className="w-full mb-8">
                            <thead>
                                <tr className="border-b-2 border-slate-200">
                                    <th className="text-left py-3 text-sm font-semibold text-slate-600">Item</th>
                                    <th className="text-center py-3 text-sm font-semibold text-slate-600">Qty</th>
                                    <th className="text-right py-3 text-sm font-semibold text-slate-600">Price</th>
                                    <th className="text-right py-3 text-sm font-semibold text-slate-600">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item, index) => (
                                    <tr key={index} className="border-b border-slate-100">
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={item.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                                                <div>
                                                    <p className="font-medium text-slate-900">{item.productName}</p>
                                                    {item.variantName && (
                                                        <p className="text-sm text-slate-500">{item.variantName}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 text-center text-slate-600">{item.quantity}</td>
                                        <td className="py-4 text-right text-slate-600">GH₵{item.price.toLocaleString()}</td>
                                        <td className="py-4 text-right font-medium text-slate-900">GH₵{(item.price * item.quantity).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Totals */}
                        <div className="flex justify-end mb-8">
                            <div className="w-72 space-y-2">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal</span>
                                    <span>GH₵{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Shipping</span>
                                    <span>{shipping === 0 ? 'Free' : `GH₵${shipping.toLocaleString()}`}</span>
                                </div>
                                {tax > 0 && (
                                    <div className="flex justify-between text-slate-600">
                                        <span>VAT (12.5%)</span>
                                        <span>GH₵{tax.toLocaleString()}</span>
                                    </div>
                                )}
                                <Separator />
                                <div className="flex justify-between text-lg font-bold text-slate-900">
                                    <span>Total</span>
                                    <span>GH₵{total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Info */}
                        {order.payment && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-8">
                                <div className="flex items-center gap-2 text-green-700 mb-2">
                                    <CreditCard className="h-5 w-5" />
                                    <span className="font-semibold">Payment Received</span>
                                </div>
                                <p className="text-sm text-green-600">
                                    Transaction Reference: {order.payment.reference || 'N/A'}
                                </p>
                                <p className="text-sm text-green-600">
                                    Payment Date: {new Date(order.payment.createdAt || order.createdAt).toLocaleString()}
                                </p>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="text-center pt-6 border-t border-slate-200">
                            <p className="text-slate-600 mb-2">Thank you for your business!</p>
                            <p className="text-sm text-slate-500">
                                For any questions, please contact us at {storeInfo.email}
                            </p>
                            <p className="text-xs text-slate-400 mt-4">
                                This is a computer-generated receipt and does not require a signature.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Export a simple receipt dialog component
export function ReceiptDialog({ order, open, onClose }: { order: Order | null; open: boolean; onClose: () => void }) {
    if (!order || !open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/80 overflow-y-auto">
            <ReceiptViewer order={order} onClose={onClose} />
        </div>
    );
}
