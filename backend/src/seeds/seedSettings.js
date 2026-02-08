import pool from '../db/pool.js';

const defaults = {
  storeSettings: {
    name: 'ShopFlow',
    tagline: 'Your store, simplified',
    email: 'support@shopflow.example',
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
    enableTax: false
  },
  shippingSettings: {
    enableFreeShipping: false,
    freeShippingThreshold: 0,
    standardShippingFee: 5,
    expressShippingFee: 15,
    enablePickup: false,
    pickupAddress: '',
    estimatedDays: 3
  },
  smsSettings: {
    enabled: false,
    provider: 'twilio',
    apiKey: '',
    senderId: 'ShopFlow',
    templates: {
      orderConfirmed: 'Hi {customerName}, your order {orderNumber} is confirmed.',
      paymentSuccess: 'Payment received for order {orderNumber}.',
      orderShipped: 'Your order {orderNumber} has shipped.',
      outForDelivery: 'Your order {orderNumber} is out for delivery.',
      delivered: 'Your order {orderNumber} has been delivered.',
      deliveryFailed: 'Delivery attempt failed for order {orderNumber}.'
    },
    triggers: {
      orderConfirmed: true,
      paymentSuccess: true,
      orderShipped: true,
      outForDelivery: true,
      delivered: true,
      deliveryFailed: true
    }
  },
  invoiceSettings: {
    prefix: 'INV',
    startNumber: 1000,
    showLogo: true,
    showTax: false,
    footerNote: '',
    termsAndConditions: ''
  }
};

async function seed() {
  try {
    for (const [key, value] of Object.entries(defaults)) {
      const str = typeof value === 'string' ? value : JSON.stringify(value);
      await pool.query(
        `INSERT INTO admin_settings (key, value, updated_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
        [key, str]
      );
      console.log(`Seeded setting: ${key}`);
    }
    console.log('✅ Default admin settings seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to seed admin settings:', err.message || err);
    process.exit(1);
  }
}

seed();
