import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, Printer, Download, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useOrders } from '@/contexts/OrderContext';
import { formatCurrency, formatDateTime, getOrderStatusLabel } from '@/lib/utils';
import { storeSettings } from '@/lib/constants';

export default function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>();
  const { getOrderById } = useOrders();

  const order = orderId ? getOrderById(orderId) : null;

  if (!order) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
        <Button asChild>
          <Link to="/dashboard/orders">View All Orders</Link>
        </Button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="container py-8 max-w-3xl">
        {/* Success Message - Hide on Print */}
        <div className="text-center mb-8 animate-fade-in no-print">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-success" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for your order. We'll send you a confirmation email shortly.
          </p>
        </div>

        {/* Receipt Container */}
        <Card className="mb-6 print:shadow-none print:border-0">
          {/* Header with Print Buttons - Hide on Print */}
          <CardHeader className="flex flex-row items-center justify-between no-print">
            <CardTitle>Order Details</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print Receipt
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 print:p-8">
            {/* ========== RECEIPT HEADER (Print Only) ========== */}
            <div className="hidden print:block text-center border-b-2 border-black pb-4 mb-6">
              <h1 className="text-3xl font-bold mb-2">{storeSettings.name}</h1>
              <p className="text-sm">{storeSettings.address}</p>
              <p className="text-sm">Tel: {storeSettings.phone}</p>
              <p className="text-sm">Email: {storeSettings.email}</p>
              {storeSettings.vatNumber && (
                <p className="text-sm mt-2">VAT: {storeSettings.vatNumber}</p>
              )}
            </div>

            {/* ========== RECEIPT TITLE (Print Only) ========== */}
            <div className="hidden print:block text-center mb-4">
              <h2 className="text-xl font-bold">SALES RECEIPT</h2>
            </div>

            {/* ========== ORDER INFORMATION ========== */}
            <div className="print:mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm print:text-base">
                <div>
                  <p className="text-muted-foreground print:text-gray-600">Receipt No:</p>
                  <p className="font-semibold print:font-bold">{order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground print:text-gray-600">Date:</p>
                  <p className="font-semibold print:font-bold">{formatDateTime(order.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground print:text-gray-600">Payment Method:</p>
                  <p className="font-semibold print:font-bold capitalize">{order.payment?.method || 'Card'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground print:text-gray-600">Status:</p>
                  <p className="font-semibold print:font-bold text-success">{order.payment?.status || 'Paid'}</p>
                </div>
              </div>
              {order.payment?.reference && (
                <div className="mt-2 text-sm print:text-base">
                  <p className="text-muted-foreground print:text-gray-600">Reference: <span className="font-semibold print:font-bold">{order.payment.reference}</span></p>
                </div>
              )}
            </div>

            <Separator className="print:border-black print:border-t-2" />

            {/* ========== CUSTOMER INFORMATION ========== */}
            <div className="print:mb-6">
              <h3 className="font-semibold mb-2 print:text-lg print:font-bold">CUSTOMER INFORMATION</h3>
              <div className="text-sm print:text-base space-y-1">
                <p className="font-medium print:font-bold">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.phone}</p>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>

            <Separator className="print:border-black print:border-t-2" />

            {/* ========== ITEMS TABLE ========== */}
            <div className="print:mb-6">
              <h3 className="font-semibold mb-3 print:text-lg print:font-bold">ITEMS PURCHASED</h3>

              {/* Table Header */}
              <div className="hidden print:grid print:grid-cols-12 print:gap-2 print:pb-2 print:border-b print:border-black print:font-bold print:text-sm">
                <div className="col-span-5">Item</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-3 text-right">Total</div>
              </div>

              {/* Items List */}
              <div className="space-y-3 print:space-y-2 print:mt-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 print:grid print:grid-cols-12 print:gap-2 print:py-2 print:border-b print:border-gray-300">
                    {/* Product Image - Hide on Print */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0 print:hidden">
                      {item.image && (
                        <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0 print:col-span-5">
                      <p className="font-medium print:font-semibold print:text-sm">{item.productName}</p>
                      <p className="text-sm text-muted-foreground print:text-xs print:text-gray-600">{item.variantName}</p>
                      <p className="text-xs text-muted-foreground print:text-xs print:text-gray-500">SKU: {item.sku}</p>
                    </div>

                    {/* Quantity */}
                    <div className="text-right print:col-span-2 print:text-center print:text-sm">
                      <p className="text-sm text-muted-foreground print:hidden">Qty:</p>
                      <p className="font-medium print:font-semibold">{item.quantity}</p>
                    </div>

                    {/* Unit Price - Print Only */}
                    <div className="hidden print:block print:col-span-2 print:text-right print:text-sm">
                      {formatCurrency(item.price)}
                    </div>

                    {/* Total */}
                    <div className="text-right print:col-span-3 print:text-sm">
                      <p className="font-medium print:font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="print:border-black print:border-t-2" />

            {/* ========== TOTALS ========== */}
            <div className="space-y-2 print:mb-6">
              <div className="flex justify-between text-sm print:text-base">
                <span className="text-muted-foreground print:text-black">Subtotal</span>
                <span className="print:font-semibold">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm print:text-base">
                <span className="text-muted-foreground print:text-black">Shipping Fee</span>
                <span className="print:font-semibold">{order.deliveryFee === 0 ? 'Free' : formatCurrency(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-sm print:text-base">
                <span className="text-muted-foreground print:text-black">Tax</span>
                <span className="print:font-semibold">{formatCurrency(order.tax)}</span>
              </div>
              <Separator className="print:border-black print:my-2" />
              <div className="flex justify-between text-lg font-bold print:text-xl print:pt-2">
                <span>TOTAL</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>

            {/* ========== FOOTER (Print Only) ========== */}
            <div className="hidden print:block text-center text-sm pt-6 mt-6 border-t-2 border-black">
              <p className="font-semibold mb-2">Thank you for shopping with {storeSettings.name}!</p>
              <p className="text-xs">This is a computer-generated receipt.</p>
              <p className="text-xs mt-2">For inquiries, contact us at {storeSettings.phone} or {storeSettings.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps - Hide on Print */}
        <Card className="no-print">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">What's Next?</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <Package className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium">Order Processing</p>
                  <p className="text-sm text-muted-foreground">We're preparing your order for shipment.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <Truck className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium">Delivery</p>
                  <p className="text-sm text-muted-foreground">Estimated delivery in 2-5 business days.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions - Hide on Print */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 no-print">
          <Button asChild className="flex-1">
            <Link to="/dashboard/orders">
              View All Orders
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link to="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
