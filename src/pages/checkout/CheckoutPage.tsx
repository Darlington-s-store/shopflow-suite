import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, CreditCard, Building, Smartphone, Plus, Check, MapPin, Receipt, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { formatCurrency, cn } from '@/lib/utils';
import { Address } from '@/types';
import { toast } from 'sonner';
import { usePaystackPayment } from 'react-paystack';

// Paystack Public Key - Replace with your actual key from Paystack Dashboard
const PAYSTACK_PUBLIC_KEY = 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, items, clearCart } = useCart();
  const { user, addresses, addAddress } = useAuth();
  const { createOrder, processPayment } = useOrders();

  const [step, setStep] = useState<'address' | 'review' | 'payment'>('address');
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.find(a => a.isDefault)?.id || addresses[0]?.id || ''
  );
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: '',
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
  });

  // Calculate total in kobo/pesewas for Paystack (amount * 100)
  const paystackConfig = {
    reference: (new Date()).getTime().toString(),
    email: user?.email || 'customer@example.com',
    amount: Math.ceil(cart.total * 100), // Paystack expects amount in lowest currency unit
    publicKey: PAYSTACK_PUBLIC_KEY,
    currency: 'GHS',
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  // Region/City data
  const regionCities: Record<string, string[]> = {
    'Greater Accra': ['Accra', 'Tema', 'Madina', 'Dome', 'Kasoa', 'Nungua', 'Teshie', 'Ga Mashie'],
    'Ashanti': ['Kumasi', 'Obuasi', 'Ejisu', 'Mampong', 'Konongo', 'Bekwai'],
    'Western': ['Sekondi-Takoradi', 'Tarkwa', 'Axim', 'Prestea', 'Elubo'],
    'Eastern': ['Koforidua', 'Akropong', 'Begoro', 'Nkawkaw', 'Mpraeso', 'Kibi'],
    'Central': ['Cape Coast', 'Elmina', 'Winneba', 'Kasoa', 'Swedru', 'Saltpond'],
    'Northern': ['Tamale', 'Yendi', 'Savelugu', 'Gushegu', 'Salaga'],
    'Upper East': ['Bolgatanga', 'Bawku', 'Navrongo', 'Paga'],
    'Upper West': ['Wa', 'Tumu', 'Lawra', 'Jirapa'],
    'Volta': ['Ho', 'Keta', 'Hohoe', 'Kpando', 'Sogakope'],
    'Bono': ['Sunyani', 'Berekum', 'Dormaa Ahenkro', 'Techiman'],
    'Bono East': ['Techiman', 'Atebubu', 'Kintampo', 'Yeji'],
    'Ahafo': ['Goaso', 'Kukuom', 'Hwidiem', 'Acherensua'],
    'Oti': ['Dambai', 'Kete Krachi', 'Nkwanta', 'Jasikan'],
    'North East': ['Nalerigu', 'Walewale', 'Gambaga'],
    'Savannah': ['Damongo', 'Bole', 'Salaga', 'Buipe'],
    'Western North': ['Sefwi Wiawso', 'Bibiani', 'Juaboso', 'Enchi'],
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);

  const handleAddAddress = async () => {
    if (!newAddress.fullName || !newAddress.phone || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.country) {
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
      country: '',
      postalCode: '',
    });
    toast.success('Address added successfully');
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSuccess = async (reference: any) => {
    if (!selectedAddress) return;

    setIsProcessing(true);
    try {
      // 1. Create Order
      const order = await createOrder(selectedAddress, paymentMethod);

      // 2. Process Payment (Record Success)
      // Pass the actual reference from Paystack
      await processPayment(order.id, reference.reference);

      toast.success('Order placed and payment successful!');
      navigate(`/order-confirmation/${order.id}`);
    } catch (error) {
      console.error("Order processing error:", error);
      toast.error('Payment successful but failed to create order. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  const onClose = () => {
    toast.info('Payment cancelled');
    setIsProcessing(false);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    if (!acceptedTerms) {
      toast.error('Please accept the Terms and Conditions');
      return;
    }

    setIsProcessing(true);

    if (paymentMethod === 'card' || paymentMethod === 'mobile') {
      // Trigger Paystack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initializePayment({ onSuccess: onSuccess as any, onClose });
    } else {
      // Bank Transfer (Manual)
      try {
        const order = await createOrder(selectedAddress, paymentMethod);
        toast.success('Order placed successfully! Please complete the bank transfer.');
        navigate(`/order-confirmation/${order.id}`);
      } catch (error) {
        toast.error('Failed to place order');
        setIsProcessing(false);
      }
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
                            placeholder="+233 24 123 4567"
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
                            <Label>Region/State *</Label>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              value={newAddress.state}
                              onChange={(e) => {
                                setNewAddress(prev => ({ ...prev, state: e.target.value, city: '' }));
                              }}
                            >
                              <option value="">Select Region</option>
                              {Object.keys(regionCities).map((region) => (
                                <option key={region} value={region}>{region}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label>City *</Label>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              value={newAddress.city}
                              onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                              disabled={!newAddress.state}
                            >
                              <option value="">Select City</option>
                              {newAddress.state && regionCities[newAddress.state]?.map((city) => (
                                <option key={city} value={city}>{city}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Country *</Label>
                          <Input
                            placeholder="Ghana"
                            value={newAddress.country}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, country: e.target.value }))}
                          />
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

            {/* Review Step - NEW */}
            {(step === 'review' || step === 'payment') && (
              <Card>
                <CardHeader className="flex flex-row items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                    step === 'review' ? "bg-accent text-accent-foreground" :
                      step === 'payment' ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {step === 'payment' ? <Check className="h-4 w-4" /> : '2'}
                  </div>
                  <CardTitle>Review Order</CardTitle>
                </CardHeader>

                {step === 'review' && (
                  <CardContent className="space-y-6">
                    {/* Review Items */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm">Items</h3>
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="w-12 h-12 rounded bg-muted shrink-0 overflow-hidden">
                            <img src={item.product.images[0]?.url} alt={item.product.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.product.name}</p>
                            <p className="text-xs text-muted-foreground">{item.quantity} x {formatCurrency(item.variant.price)}</p>
                          </div>
                          <p className="text-sm font-medium">{formatCurrency(item.variant.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>



                  </CardContent>
                )}

                {step === 'review' && (
                  <CardFooter className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep('address')}>Back</Button>
                    <Button className="flex-1" onClick={() => {
                      setStep('payment');
                    }}>Continue to Payment</Button>
                  </CardFooter>
                )}
              </Card>
            )}

            {/* Payment Method */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                  step === 'payment' ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {'3'}
                </div>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              {step === 'payment' && (
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg mb-4">
                    <h3 className="font-medium mb-2">Order Summary</h3>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Total Amount:</span>
                      <span className="font-bold">{formatCurrency(cart.total)}</span>
                    </div>
                  </div>

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
                        <p className="text-sm text-muted-foreground">Pay with Paystack (Visa, Mastercard, Verve)</p>
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
                        <p className="text-sm text-muted-foreground">MTN MoMo, Vodafone Cash, AirtelTigo</p>
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
                        <p className="text-sm text-muted-foreground">Direct bank deposit</p>
                      </Label>
                    </div>
                  </RadioGroup>

                  <Separator className="my-4" />

                  {/* Terms and Conditions - Moved to Payment Step */}
                  <div className="flex items-start space-x-2 rounded-md border p-4 bg-background">
                    <Checkbox id="terms-payment" checked={acceptedTerms} onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)} />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="terms-payment"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Accept terms and conditions
                      </label>
                      <p className="text-sm text-muted-foreground">
                        By placing this order, you agree to our <Link to="/terms" className="underline text-foreground">Terms of Service</Link> and <Link to="/privacy" className="underline text-foreground">Privacy Policy</Link>.
                      </p>
                    </div>
                  </div>
                </CardContent>
              )}
              {step === 'payment' && (
                <CardFooter className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep('review')} disabled={isProcessing}>
                    Back
                  </Button>
                  <Button className="flex-1" onClick={handlePlaceOrder} disabled={isProcessing}>
                    {isProcessing ? 'Processing Payment...' : `Pay ${formatCurrency(cart.total)}`}
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
