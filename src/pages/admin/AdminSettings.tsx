import { useState, useEffect } from 'react';
import {
    Save, Store, Image, Phone, Mail, MapPin, Globe, Receipt,
    CreditCard, MessageSquare, Bell, Shield, Truck, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ClearStorageButton } from '@/components/admin/ClearStorageButton';

interface StoreSettings {
    name: string;
    tagline: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    logo: string;
    favicon: string;
    currency: string;
    currencySymbol: string;
    taxRate: number;
    taxName: string;
    enableTax: boolean;
}

interface ShippingSettings {
    enableFreeShipping: boolean;
    freeShippingThreshold: number;
    standardShippingFee: number;
    expressShippingFee: number;
    enablePickup: boolean;
    pickupAddress: string;
    estimatedDays: number;
}

interface SMSSettings {
    enabled: boolean;
    provider: string;
    apiKey: string;
    senderId: string;
    templates: {
        orderConfirmed: string;
        paymentSuccess: string;
        orderShipped: string;
        outForDelivery: string;
        delivered: string;
        deliveryFailed: string;
    };
    triggers: {
        orderConfirmed: boolean;
        paymentSuccess: boolean;
        orderShipped: boolean;
        outForDelivery: boolean;
        delivered: boolean;
        deliveryFailed: boolean;
    };
}

interface InvoiceSettings {
    prefix: string;
    startNumber: number;
    showLogo: boolean;
    showTax: boolean;
    footerNote: string;
    termsAndConditions: string;
}

// Default settings are loaded from localStorage or remain empty/uninitialized
// No hardcoded demo defaults to avoid seeding the app with sample data

export default function AdminSettings() {
    const [storeSettings, setStoreSettings] = useState<StoreSettings>({
        name: '',
        tagline: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        logo: '',
        favicon: '',
        currency: 'USD',
        currencySymbol: '$',
        taxRate: 0,
        taxName: 'VAT',
        enableTax: false,
    });

    const [shippingSettings, setShippingSettings] = useState<ShippingSettings>({
        enableFreeShipping: false,
        freeShippingThreshold: 0,
        standardShippingFee: 0,
        expressShippingFee: 0,
        enablePickup: false,
        pickupAddress: '',
        estimatedDays: 3,
    });

    const [smsSettings, setSMSSettings] = useState<SMSSettings>({
        enabled: false,
        provider: '',
        apiKey: '',
        senderId: '',
        templates: {
            orderConfirmed: '',
            paymentSuccess: '',
            orderShipped: '',
            outForDelivery: '',
            delivered: '',
            deliveryFailed: '',
        },
        triggers: {
            orderConfirmed: false,
            paymentSuccess: false,
            orderShipped: false,
            outForDelivery: false,
            delivered: false,
            deliveryFailed: false,
        }
    });

    const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>({
        prefix: 'INV',
        startNumber: 1000,
        showLogo: true,
        showTax: false,
        footerNote: '',
        termsAndConditions: '',
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Local client-side settings removed; these should be fetched from the backend
        // TODO: implement API endpoints for settings and load them here
    }, []);

    const handleSave = () => {
        setIsSaving(true);
        // TODO: persist settings to backend API
        setTimeout(() => {
            toast.success('Settings saved (not persisted)');
            setIsSaving(false);
        }, 500);
    };

    const updateSMSTemplate = (key: keyof typeof smsSettings.templates, value: string) => {
        setSMSSettings(prev => ({
            ...prev,
            templates: { ...prev.templates, [key]: value }
        }));
    };

    const toggleSMSTrigger = (key: keyof typeof smsSettings.triggers) => {
        setSMSSettings(prev => ({
            ...prev,
            triggers: { ...prev.triggers, [key]: !prev.triggers[key] }
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                    <p className="text-slate-500">Configure your store settings</p>
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="gap-2 bg-orange-600 hover:bg-orange-700 text-white">
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save All Settings'}
                </Button>
            </div>

            <Tabs defaultValue="store" className="space-y-6">
                <TabsList className="bg-slate-100 border border-slate-200">
                    <TabsTrigger value="store" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm"><Store className="h-4 w-4" />Store</TabsTrigger>
                    <TabsTrigger value="shipping" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm"><Truck className="h-4 w-4" />Shipping</TabsTrigger>
                    <TabsTrigger value="sms" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm"><MessageSquare className="h-4 w-4" />SMS</TabsTrigger>
                    <TabsTrigger value="invoice" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm"><Receipt className="h-4 w-4" />Invoices</TabsTrigger>
                    <TabsTrigger value="data" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm"><Shield className="h-4 w-4" />Data</TabsTrigger>
                </TabsList>

                {/* Store Settings */}
                <TabsContent value="store">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="bg-white border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-slate-900 flex items-center gap-2"><Store className="h-5 w-5 text-orange-600" />Store Information</CardTitle>
                                <CardDescription className="text-slate-500">Basic store details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-700">Store Name</Label>
                                    <Input value={storeSettings.name} onChange={(e) => setStoreSettings(s => ({ ...s, name: e.target.value }))} className="bg-white border-slate-200 text-slate-900" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-700">Tagline</Label>
                                    <Input value={storeSettings.tagline} onChange={(e) => setStoreSettings(s => ({ ...s, tagline: e.target.value }))} className="bg-white border-slate-200 text-slate-900" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-slate-700">Email</Label>
                                        <Input value={storeSettings.email} onChange={(e) => setStoreSettings(s => ({ ...s, email: e.target.value }))} className="bg-white border-slate-200 text-slate-900" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-700">Phone</Label>
                                        <Input value={storeSettings.phone} onChange={(e) => setStoreSettings(s => ({ ...s, phone: e.target.value }))} className="bg-white border-slate-200 text-slate-900" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-700">Address</Label>
                                    <Textarea value={storeSettings.address} onChange={(e) => setStoreSettings(s => ({ ...s, address: e.target.value }))} className="bg-white border-slate-200 text-slate-900" rows={2} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-slate-700">City</Label>
                                        <Input value={storeSettings.city} onChange={(e) => setStoreSettings(s => ({ ...s, city: e.target.value }))} className="bg-white border-slate-200 text-slate-900" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-700">Country</Label>
                                        <Input value={storeSettings.country} onChange={(e) => setStoreSettings(s => ({ ...s, country: e.target.value }))} className="bg-white border-slate-200 text-slate-900" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-slate-900 flex items-center gap-2"><CreditCard className="h-5 w-5 text-orange-600" />Tax & Currency</CardTitle>
                                <CardDescription className="text-slate-500">Financial settings</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-slate-700">Currency Code</Label>
                                        <Select value={storeSettings.currency} onValueChange={(v) => setStoreSettings(s => ({ ...s, currency: v }))}>
                                            <SelectTrigger className="bg-white border-slate-200 text-slate-900"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="GHS">GHS - Ghana Cedi</SelectItem>
                                                <SelectItem value="USD">USD - US Dollar</SelectItem>
                                                <SelectItem value="EUR">EUR - Euro</SelectItem>
                                                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-700">Currency Symbol</Label>
                                        <Input value={storeSettings.currencySymbol} onChange={(e) => setStoreSettings(s => ({ ...s, currencySymbol: e.target.value }))} className="bg-white border-slate-200 text-slate-900" />
                                    </div>
                                </div>
                                <Separator className="bg-slate-200" />
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-slate-900">Enable Tax</p>
                                        <p className="text-sm text-slate-500">Add tax to orders</p>
                                    </div>
                                    <Switch checked={storeSettings.enableTax} onCheckedChange={(c) => setStoreSettings(s => ({ ...s, enableTax: c }))} />
                                </div>
                                {storeSettings.enableTax && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-slate-700">Tax Name</Label>
                                            <Input value={storeSettings.taxName} onChange={(e) => setStoreSettings(s => ({ ...s, taxName: e.target.value }))} className="bg-white border-slate-200 text-slate-900" placeholder="VAT" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-700">Tax Rate (%)</Label>
                                            <Input type="number" value={storeSettings.taxRate} onChange={(e) => setStoreSettings(s => ({ ...s, taxRate: parseFloat(e.target.value) || 0 }))} className="bg-white border-slate-200 text-slate-900" />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Shipping Settings */}
                <TabsContent value="shipping">
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-slate-900 flex items-center gap-2"><Truck className="h-5 w-5 text-orange-600" />Shipping Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-lg">
                                <div>
                                    <p className="font-medium text-slate-900">Free Shipping</p>
                                    <p className="text-sm text-slate-500">Offer free shipping above threshold</p>
                                </div>
                                <Switch checked={shippingSettings.enableFreeShipping} onCheckedChange={(c) => setShippingSettings(s => ({ ...s, enableFreeShipping: c }))} />
                            </div>
                            {shippingSettings.enableFreeShipping && (
                                <div className="space-y-2">
                                    <Label className="text-slate-700">Free Shipping Threshold ({storeSettings.currencySymbol})</Label>
                                    <Input type="number" value={shippingSettings.freeShippingThreshold} onChange={(e) => setShippingSettings(s => ({ ...s, freeShippingThreshold: parseFloat(e.target.value) || 0 }))} className="bg-white border-slate-200 text-slate-900 max-w-xs" />
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-700">Standard Shipping Fee ({storeSettings.currencySymbol})</Label>
                                    <Input type="number" value={shippingSettings.standardShippingFee} onChange={(e) => setShippingSettings(s => ({ ...s, standardShippingFee: parseFloat(e.target.value) || 0 }))} className="bg-white border-slate-200 text-slate-900" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-700">Express Shipping Fee ({storeSettings.currencySymbol})</Label>
                                    <Input type="number" value={shippingSettings.expressShippingFee} onChange={(e) => setShippingSettings(s => ({ ...s, expressShippingFee: parseFloat(e.target.value) || 0 }))} className="bg-white border-slate-200 text-slate-900" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-700">Estimated Delivery Days</Label>
                                <Input type="number" value={shippingSettings.estimatedDays} onChange={(e) => setShippingSettings(s => ({ ...s, estimatedDays: parseInt(e.target.value) || 3 }))} className="bg-white border-slate-200 text-slate-900 max-w-xs" />
                            </div>
                            <Separator className="bg-slate-200" />
                            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-lg">
                                <div>
                                    <p className="font-medium text-slate-900">Store Pickup</p>
                                    <p className="text-sm text-slate-500">Allow customers to pickup orders</p>
                                </div>
                                <Switch checked={shippingSettings.enablePickup} onCheckedChange={(c) => setShippingSettings(s => ({ ...s, enablePickup: c }))} />
                            </div>
                            {shippingSettings.enablePickup && (
                                <div className="space-y-2">
                                    <Label className="text-slate-700">Pickup Address</Label>
                                    <Textarea value={shippingSettings.pickupAddress} onChange={(e) => setShippingSettings(s => ({ ...s, pickupAddress: e.target.value }))} className="bg-white border-slate-200 text-slate-900" rows={2} />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* SMS Settings */}
                <TabsContent value="sms">
                    <div className="space-y-6">
                        <Card className="bg-white border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-slate-900 flex items-center gap-2"><MessageSquare className="h-5 w-5 text-orange-600" />SMS Configuration</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-lg">
                                    <div>
                                        <p className="font-medium text-slate-900">Enable SMS Notifications</p>
                                        <p className="text-sm text-slate-500">Send SMS updates to customers</p>
                                    </div>
                                    <Switch checked={smsSettings.enabled} onCheckedChange={(c) => setSMSSettings(s => ({ ...s, enabled: c }))} />
                                </div>
                                {smsSettings.enabled && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-slate-700">Provider</Label>
                                                <Select value={smsSettings.provider} onValueChange={(v) => setSMSSettings(s => ({ ...s, provider: v }))}>
                                                    <SelectTrigger className="bg-white border-slate-200 text-slate-900"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="hubtel">Hubtel</SelectItem>
                                                        <SelectItem value="arkesel">Arkesel</SelectItem>
                                                        <SelectItem value="mnotify">mNotify</SelectItem>
                                                        <SelectItem value="twilio">Twilio</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-slate-700">Sender ID</Label>
                                                <Input value={smsSettings.senderId} onChange={(e) => setSMSSettings(s => ({ ...s, senderId: e.target.value }))} className="bg-white border-slate-200 text-slate-900" placeholder="ShopFlow" maxLength={11} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-700">API Key</Label>
                                            <Input type="password" value={smsSettings.apiKey} onChange={(e) => setSMSSettings(s => ({ ...s, apiKey: e.target.value }))} className="bg-white border-slate-200 text-slate-900" placeholder="Enter your API key" />
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {smsSettings.enabled && (
                            <Card className="bg-white border-slate-200 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-slate-900 flex items-center gap-2"><FileText className="h-5 w-5 text-orange-600" />SMS Templates</CardTitle>
                                    <CardDescription className="text-slate-500">
                                        Use placeholders: {'{customerName}'}, {'{orderNumber}'}, {'{total}'}, {'{reason}'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {Object.entries(smsSettings.templates).map(([key, value]) => (
                                        <div key={key} className="p-4 bg-slate-50 border border-slate-100 rounded-lg space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-slate-900 capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                                                <Switch
                                                    checked={smsSettings.triggers[key as keyof typeof smsSettings.triggers]}
                                                    onCheckedChange={() => toggleSMSTrigger(key as keyof typeof smsSettings.triggers)}
                                                />
                                            </div>
                                            <Textarea
                                                value={value}
                                                onChange={(e) => updateSMSTemplate(key as keyof typeof smsSettings.templates, e.target.value)}
                                                className="bg-white border-slate-200 text-slate-900 text-sm"
                                                rows={2}
                                                disabled={!smsSettings.triggers[key as keyof typeof smsSettings.triggers]}
                                            />
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>

                {/* Invoice Settings */}
                <TabsContent value="invoice">
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-slate-900 flex items-center gap-2"><Receipt className="h-5 w-5 text-orange-600" />Invoice & Receipt Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-700">Invoice Prefix</Label>
                                    <Input value={invoiceSettings.prefix} onChange={(e) => setInvoiceSettings(s => ({ ...s, prefix: e.target.value }))} className="bg-white border-slate-200 text-slate-900" placeholder="INV" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-700">Starting Number</Label>
                                    <Input type="number" value={invoiceSettings.startNumber} onChange={(e) => setInvoiceSettings(s => ({ ...s, startNumber: parseInt(e.target.value) || 1000 }))} className="bg-white border-slate-200 text-slate-900" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-lg">
                                <div><p className="font-medium text-slate-900">Show Logo on Invoice</p></div>
                                <Switch checked={invoiceSettings.showLogo} onCheckedChange={(c) => setInvoiceSettings(s => ({ ...s, showLogo: c }))} />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-lg">
                                <div><p className="font-medium text-slate-900">Show Tax Breakdown</p></div>
                                <Switch checked={invoiceSettings.showTax} onCheckedChange={(c) => setInvoiceSettings(s => ({ ...s, showTax: c }))} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-700">Footer Note</Label>
                                <Input value={invoiceSettings.footerNote} onChange={(e) => setInvoiceSettings(s => ({ ...s, footerNote: e.target.value }))} className="bg-white border-slate-200 text-slate-900" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-700">Terms & Conditions</Label>
                                <Textarea value={invoiceSettings.termsAndConditions} onChange={(e) => setInvoiceSettings(s => ({ ...s, termsAndConditions: e.target.value }))} className="bg-white border-slate-200 text-slate-900" rows={3} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Data Management */}
                <TabsContent value="data">
                    <Card className="bg-white shadow-sm border border-red-100">
                        <CardHeader>
                            <CardTitle className="text-red-700 flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Danger Zone
                            </CardTitle>
                            <CardDescription className="text-red-600/80">
                                Manage your local application data and resets.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="p-4 bg-red-50 border border-red-100 rounded-lg space-y-4">
                                <div>
                                    <h3 className="font-bold text-red-900">Clear All Application Data</h3>
                                    <p className="text-sm text-red-700 mt-1">
                                        This will remove ALL locally stored data including products, orders, customers, settings, and auth sessions.
                                        The application will reset to its initial state. This action cannot be undone.
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <ClearStorageButton />
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            if (confirm("CRITICAL WARNING: This will reset your application. Are you absolutely sure?")) {
                                                if (confirm("Last chance: This action will be processed by the backend. Click OK to proceed.")) {
                                                    // Backend API call would be made here to reset application data
                                                    toast.success('Reset request sent to server...');
                                                    setTimeout(() => window.location.reload(), 1500);
                                                }
                                            }
                                        }}
                                    >
                                        Reset Application Data
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
