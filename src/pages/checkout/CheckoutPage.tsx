import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, CreditCard, Building, Smartphone, Plus, Check, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { formatCurrency, cn } from '@/lib/utils';
import { Address } from '@/types';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, items } = useCart();
  const { user, addresses, addAddress } = useAuth();
  const { createOrder, processPayment } = useOrders();

  const [step, setStep] = useState<'address' | 'payment' | 'processing'>('address');
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.find(a => a.isDefault)?.id || addresses[0]?.id || ''
  );
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: '',
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    country: 'Nigeria',
    postalCode: '',
  });

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);

  const handleAddAddress = async () => {
    if (!newAddress.fullName || !newAddress.phone || !newAddress.street || !newAddress.city || !newAddress.state) {
      toast.error('Please fill in all required fields');
      return;
    }

    await addAddress({
      ...newAddress,
      isDefault: addresses.length === 0,
    });
    setShowAddAddress(false);
    setNewAddress({
      label: '',
      fullName: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      country: 'Nigeria',
      postalCode: '',
    });
    toast.success('Address added successfully');
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    setIsProcessing(true);
    setStep('processing');

    try {
      const order = await createOrder(selectedAddress, paymentMethod);
      
      // Process payment
      const paymentResult = await processPayment(order.id);

      if (paymentResult.success) {
        toast.success('Order placed successfully!');
        navigate(`/order-confirmation/${order.id}`);
      } else {
        toast.error('Payment failed. Please try again.');
        setStep('payment');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      setStep('payment');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Breadcrumb */}
      <div className="bg-background border-b py-3">
        <div className="container">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/cart" className="hover:text-foreground">Cart</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Checkout</span>
          </nav>
        </div>
      </div>

      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                    step === 'address' ? "bg-accent text-accent-foreground" : "bg-success text-success-foreground"
                  )}>
                    {step === 'address' ? '1' : <Check className="h-4 w-4" />}
                  </div>
                  <CardTitle>Delivery Address</CardTitle>
                </div>
                {step !== 'address' && (
                  <Button variant="ghost" size="sm" onClick={() => setStep('address')}>
                    Change
                  </Button>
                )}
              </CardHeader>
              {step === 'address' && (
                <CardContent className="space-y-4">
                  {addresses.length > 0 ? (
                    <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className={cn(
                            "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
                            selectedAddressId === addr.id ? "border-accent bg-accent/5" : "border-border"
                          )}
                          onClick={() => setSelectedAddressId(addr.id)}
                        >
                          <RadioGroupItem value={addr.id} id={addr.id} className="mt-1" />
                          <Label htmlFor={addr.id} className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{addr.fullName}</span>
                              {addr.label && (
                                <span className="text-xs bg-muted px-2 py-0.5 rounded">{addr.label}</span>
                              )}
                              {addr.isDefault && (
                                <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded">Default</span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{addr.phone}</p>
                            <p className="text-sm text-muted-foreground">
                              {addr.street}, {addr.city}, {addr.state}
                            </p>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No addresses saved. Add one to continue.</p>
                    </div>
                  )}

                  <Dialog open={showAddAddress} onOpenChange={setShowAddAddress}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Address
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add New Address</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Label (optional)</Label>
                            <Input
                              placeholder="Home, Office, etc."
                              value={newAddress.label}
                              onChange={(e) => setNewAddress(prev => ({ ...prev, label: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Full Name *</Label>
                            <Input
                              placeholder="John Doe"
                              value={newAddress.fullName}
                              onChange={(e) => setNewAddress(prev => ({ ...prev, fullName: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Phone Number *</Label>
                          <Input
                            placeholder="+234 800 000 0000"
                            value={newAddress.phone}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Street Address *</Label>
                          <Input
                            placeholder="123 Main Street"
                            value={newAddress.street}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>City *</Label>
                            <Input
                              placeholder="Lagos"
                              value={newAddress.city}
                              onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>State *</Label>
                            <Input
                              placeholder="Lagos"
                              value={newAddress.state}
                              onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                            />
                          </div>
                        </div>
                        <Button className="w-full" onClick={handleAddAddress}>
                          Save Address
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              )}
              {step === 'address' && selectedAddress && (
                <CardFooter>
                  <Button className="w-full" onClick={() => setStep('payment')}>
                    Continue to Payment
                  </Button>
                </CardFooter>
              )}
              {step !== 'address' && selectedAddress && (
                <CardContent>
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{selectedAddress.fullName}</p>
                      <p className="text-muted-foreground">
                        {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state}
                      </p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                  step === 'payment' ? "bg-accent text-accent-foreground" : 
                  step === 'processing' ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {step === 'processing' ? <Check className="h-4 w-4" /> : '2'}
                </div>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              {(step === 'payment' || step === 'processing') && (
                <CardContent className="space-y-4">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} disabled={isProcessing}>
                    <div
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg border cursor-pointer",
                        paymentMethod === 'card' ? "border-accent bg-accent/5" : "border-border"
                      )}
                      onClick={() => !isProcessing && setPaymentMethod('card')}
                    >
                      <RadioGroupItem value="card" id="card" />
                      <CreditCard className="h-5 w-5" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer">
                        <span className="font-medium">Card Payment</span>
                        <p className="text-sm text-muted-foreground">Pay with Paystack</p>
                      </Label>
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg border cursor-pointer",
                        paymentMethod === 'transfer' ? "border-accent bg-accent/5" : "border-border"
                      )}
                      onClick={() => !isProcessing && setPaymentMethod('transfer')}
                    >
                      <RadioGroupItem value="transfer" id="transfer" />
                      <Building className="h-5 w-5" />
                      <Label htmlFor="transfer" className="flex-1 cursor-pointer">
                        <span className="font-medium">Bank Transfer</span>
                        <p className="text-sm text-muted-foreground">Pay via bank transfer</p>
                      </Label>
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg border cursor-pointer",
                        paymentMethod === 'mobile' ? "border-accent bg-accent/5" : "border-border"
                      )}
                      onClick={() => !isProcessing && setPaymentMethod('mobile')}
                    >
                      <RadioGroupItem value="mobile" id="mobile" />
                      <Smartphone className="h-5 w-5" />
                      <Label htmlFor="mobile" className="flex-1 cursor-pointer">
                        <span className="font-medium">Mobile Money</span>
                        <p className="text-sm text-muted-foreground">Pay with mobile money</p>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              )}
              {step === 'payment' && (
                <CardFooter className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep('address')}>
                    Back
                  </Button>
                  <Button className="flex-1" onClick={handlePlaceOrder} disabled={isProcessing}>
                    {isProcessing ? 'Processing...' : `Pay ${formatCurrency(cart.total)}`}
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                      <img
                        src={item.product.images[0]?.url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {[item.variant.color, item.variant.storage].filter(Boolean).join(' / ')}
                      </p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-medium text-sm">
                      {formatCurrency(item.variant.price * item.quantity)}
                    </span>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(cart.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{cart.deliveryFee === 0 ? 'Free' : formatCurrency(cart.deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (7.5%)</span>
                    <span>{formatCurrency(cart.tax)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(cart.total)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
