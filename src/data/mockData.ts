import { Category, Brand, Product, User, Order, Review, Delivery, StoreSettings } from '@/types';

// Store Settings
export const storeSettings: StoreSettings = {
  name: 'TechMart',
  email: 'support@techmart.com',
  phone: '+234 800 123 4567',
  address: '123 Tech Street, Lagos, Nigeria',
  currency: 'NGN',
  currencySymbol: '₦',
  taxRate: 7.5,
  vatNumber: 'VAT-123456789',
  shippingFee: 2500,
  freeShippingThreshold: 100000,
};

// Categories
export const categories: Category[] = [
  {
    id: 'cat-1',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Latest electronics and gadgets',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
    createdAt: '2024-01-01',
    children: [
      {
        id: 'cat-1-1',
        name: 'Laptops',
        slug: 'laptops',
        parentId: 'cat-1',
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
        createdAt: '2024-01-01',
      },
      {
        id: 'cat-1-2',
        name: 'Phones',
        slug: 'phones',
        parentId: 'cat-1',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
        createdAt: '2024-01-01',
        children: [
          {
            id: 'cat-1-2-1',
            name: 'Apple',
            slug: 'apple-phones',
            parentId: 'cat-1-2',
            createdAt: '2024-01-01',
          },
          {
            id: 'cat-1-2-2',
            name: 'Android',
            slug: 'android-phones',
            parentId: 'cat-1-2',
            createdAt: '2024-01-01',
          },
        ],
      },
      {
        id: 'cat-1-3',
        name: 'Accessories',
        slug: 'accessories',
        parentId: 'cat-1',
        image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400',
        createdAt: '2024-01-01',
      },
      {
        id: 'cat-1-4',
        name: 'Home Appliances',
        slug: 'home-appliances',
        parentId: 'cat-1',
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
        createdAt: '2024-01-01',
      },
    ],
  },
];

// Brands
export const brands: Brand[] = [
  { id: 'brand-1', name: 'Apple', slug: 'apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
  { id: 'brand-2', name: 'Samsung', slug: 'samsung' },
  { id: 'brand-3', name: 'HP', slug: 'hp' },
  { id: 'brand-4', name: 'Lenovo', slug: 'lenovo' },
  { id: 'brand-5', name: 'Dell', slug: 'dell' },
  { id: 'brand-6', name: 'Google', slug: 'google' },
  { id: 'brand-7', name: 'OnePlus', slug: 'oneplus' },
  { id: 'brand-8', name: 'Tecno', slug: 'tecno' },
  { id: 'brand-9', name: 'Infinix', slug: 'infinix' },
];

// Products
export const products: Product[] = [
  {
    id: 'prod-1',
    name: 'iPhone 15 Pro Max',
    slug: 'iphone-15-pro-max',
    description: 'The most powerful iPhone ever with titanium design, A17 Pro chip, and advanced camera system. Experience the future of mobile technology with groundbreaking features.',
    shortDescription: 'Titanium design. A17 Pro chip. Revolutionary camera.',
    categoryId: 'cat-1-2-1',
    brandId: 'brand-1',
    images: [
      { id: 'img-1', url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800', alt: 'iPhone 15 Pro Max', isPrimary: true, order: 0 },
      { id: 'img-2', url: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800', alt: 'iPhone 15 Pro Max Side', isPrimary: false, order: 1 },
      { id: 'img-3', url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800', alt: 'iPhone 15 Pro Max Back', isPrimary: false, order: 2 },
    ],
    variants: [
      { id: 'var-1-1', productId: 'prod-1', sku: 'IP15PM-256-NAT', color: 'Natural Titanium', colorCode: '#A8A9AD', storage: '256GB', price: 899000, compareAtPrice: 950000, stock: 15, isActive: true },
      { id: 'var-1-2', productId: 'prod-1', sku: 'IP15PM-512-NAT', color: 'Natural Titanium', colorCode: '#A8A9AD', storage: '512GB', price: 1099000, stock: 10, isActive: true },
      { id: 'var-1-3', productId: 'prod-1', sku: 'IP15PM-1TB-NAT', color: 'Natural Titanium', colorCode: '#A8A9AD', storage: '1TB', price: 1299000, stock: 5, isActive: true },
      { id: 'var-1-4', productId: 'prod-1', sku: 'IP15PM-256-BLU', color: 'Blue Titanium', colorCode: '#394E6A', storage: '256GB', price: 899000, stock: 12, isActive: true },
      { id: 'var-1-5', productId: 'prod-1', sku: 'IP15PM-512-BLU', color: 'Blue Titanium', colorCode: '#394E6A', storage: '512GB', price: 1099000, stock: 8, isActive: true },
      { id: 'var-1-6', productId: 'prod-1', sku: 'IP15PM-256-BLK', color: 'Black Titanium', colorCode: '#3C3C3C', storage: '256GB', price: 899000, stock: 20, isActive: true },
    ],
    specs: [
      { label: 'Display', value: '6.7-inch Super Retina XDR display' },
      { label: 'Chip', value: 'A17 Pro chip' },
      { label: 'Camera', value: '48MP Main, 12MP Ultra Wide, 12MP Telephoto' },
      { label: 'Battery', value: 'Up to 29 hours video playback' },
      { label: 'Face ID', value: 'Yes' },
      { label: 'Water Resistance', value: 'IP68' },
    ],
    warranty: '1 Year Apple Warranty',
    isFeatured: true,
    isActive: true,
    averageRating: 4.8,
    reviewCount: 124,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: 'prod-2',
    name: 'MacBook Pro 16"',
    slug: 'macbook-pro-16',
    description: 'Supercharged by M3 Pro or M3 Max, MacBook Pro delivers exceptional performance for demanding workflows. With stunning Liquid Retina XDR display and all-day battery life.',
    shortDescription: 'M3 Pro chip. Liquid Retina XDR display.',
    categoryId: 'cat-1-1',
    brandId: 'brand-1',
    images: [
      { id: 'img-4', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', alt: 'MacBook Pro 16', isPrimary: true, order: 0 },
      { id: 'img-5', url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800', alt: 'MacBook Pro Side', isPrimary: false, order: 1 },
    ],
    variants: [
      { id: 'var-2-1', productId: 'prod-2', sku: 'MBP16-512-SLV', color: 'Silver', colorCode: '#E3E4E5', storage: '512GB', price: 1899000, stock: 8, isActive: true },
      { id: 'var-2-2', productId: 'prod-2', sku: 'MBP16-1TB-SLV', color: 'Silver', colorCode: '#E3E4E5', storage: '1TB', price: 2199000, stock: 5, isActive: true },
      { id: 'var-2-3', productId: 'prod-2', sku: 'MBP16-512-SPC', color: 'Space Black', colorCode: '#2E2E2E', storage: '512GB', price: 1899000, stock: 10, isActive: true },
      { id: 'var-2-4', productId: 'prod-2', sku: 'MBP16-1TB-SPC', color: 'Space Black', colorCode: '#2E2E2E', storage: '1TB', price: 2199000, stock: 6, isActive: true },
    ],
    specs: [
      { label: 'Display', value: '16.2-inch Liquid Retina XDR' },
      { label: 'Chip', value: 'Apple M3 Pro' },
      { label: 'Memory', value: '18GB unified memory' },
      { label: 'Battery', value: 'Up to 22 hours' },
      { label: 'Ports', value: '3x Thunderbolt 4, HDMI, SD card, MagSafe 3' },
    ],
    warranty: '1 Year Apple Warranty',
    isFeatured: true,
    isActive: true,
    averageRating: 4.9,
    reviewCount: 89,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10',
  },
  {
    id: 'prod-3',
    name: 'Samsung Galaxy S24 Ultra',
    slug: 'samsung-galaxy-s24-ultra',
    description: 'Meet Galaxy S24 Ultra, the ultimate form of Galaxy Ultra with Galaxy AI. It\'s the most powerful Galaxy smartphone yet, with pro-grade camera and titanium frame.',
    shortDescription: 'Galaxy AI. Titanium frame. 200MP camera.',
    categoryId: 'cat-1-2-2',
    brandId: 'brand-2',
    images: [
      { id: 'img-6', url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800', alt: 'Samsung Galaxy S24 Ultra', isPrimary: true, order: 0 },
      { id: 'img-7', url: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=800', alt: 'Samsung Galaxy S24 Ultra Back', isPrimary: false, order: 1 },
    ],
    variants: [
      { id: 'var-3-1', productId: 'prod-3', sku: 'S24U-256-BLK', color: 'Titanium Black', colorCode: '#1A1A1A', storage: '256GB', price: 749000, stock: 20, isActive: true },
      { id: 'var-3-2', productId: 'prod-3', sku: 'S24U-512-BLK', color: 'Titanium Black', colorCode: '#1A1A1A', storage: '512GB', price: 849000, stock: 15, isActive: true },
      { id: 'var-3-3', productId: 'prod-3', sku: 'S24U-256-GRY', color: 'Titanium Gray', colorCode: '#6B6B6B', storage: '256GB', price: 749000, stock: 18, isActive: true },
      { id: 'var-3-4', productId: 'prod-3', sku: 'S24U-256-VIO', color: 'Titanium Violet', colorCode: '#9B7EDE', storage: '256GB', price: 749000, stock: 12, isActive: true },
    ],
    specs: [
      { label: 'Display', value: '6.8-inch Dynamic AMOLED 2X' },
      { label: 'Processor', value: 'Snapdragon 8 Gen 3' },
      { label: 'Camera', value: '200MP Main, 50MP Periscope Telephoto' },
      { label: 'Battery', value: '5000mAh with 45W charging' },
      { label: 'S Pen', value: 'Included' },
    ],
    warranty: '1 Year Samsung Warranty',
    isFeatured: true,
    isActive: true,
    averageRating: 4.7,
    reviewCount: 156,
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20',
  },
  {
    id: 'prod-4',
    name: 'Dell XPS 15',
    slug: 'dell-xps-15',
    description: 'The Dell XPS 15 combines stunning 4K OLED display with powerful Intel Core processors for the ultimate creative and productivity experience.',
    shortDescription: '4K OLED. Intel Core i7. Premium build.',
    categoryId: 'cat-1-1',
    brandId: 'brand-5',
    images: [
      { id: 'img-8', url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800', alt: 'Dell XPS 15', isPrimary: true, order: 0 },
    ],
    variants: [
      { id: 'var-4-1', productId: 'prod-4', sku: 'XPS15-512-SLV', color: 'Platinum Silver', colorCode: '#C0C0C0', storage: '512GB', price: 1299000, stock: 10, isActive: true },
      { id: 'var-4-2', productId: 'prod-4', sku: 'XPS15-1TB-SLV', color: 'Platinum Silver', colorCode: '#C0C0C0', storage: '1TB', price: 1499000, stock: 7, isActive: true },
    ],
    specs: [
      { label: 'Display', value: '15.6-inch 4K OLED' },
      { label: 'Processor', value: 'Intel Core i7-13700H' },
      { label: 'Memory', value: '16GB DDR5' },
      { label: 'Graphics', value: 'NVIDIA GeForce RTX 4050' },
    ],
    warranty: '1 Year Dell Warranty',
    isFeatured: false,
    isActive: true,
    averageRating: 4.6,
    reviewCount: 67,
    createdAt: '2024-01-12',
    updatedAt: '2024-01-12',
  },
  {
    id: 'prod-5',
    name: 'AirPods Pro 2nd Gen',
    slug: 'airpods-pro-2',
    description: 'AirPods Pro feature up to 2x more Active Noise Cancellation, Adaptive Transparency, and Personalized Spatial Audio with dynamic head tracking.',
    shortDescription: 'Active Noise Cancellation. Spatial Audio.',
    categoryId: 'cat-1-3',
    brandId: 'brand-1',
    images: [
      { id: 'img-9', url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800', alt: 'AirPods Pro', isPrimary: true, order: 0 },
    ],
    variants: [
      { id: 'var-5-1', productId: 'prod-5', sku: 'APP2-WHT', color: 'White', colorCode: '#FFFFFF', price: 189000, stock: 50, isActive: true },
    ],
    specs: [
      { label: 'Chip', value: 'Apple H2' },
      { label: 'Active Noise Cancellation', value: 'Yes' },
      { label: 'Battery Life', value: 'Up to 6 hours (30 hours with case)' },
      { label: 'Connectivity', value: 'Bluetooth 5.3' },
    ],
    warranty: '1 Year Apple Warranty',
    isFeatured: true,
    isActive: true,
    averageRating: 4.8,
    reviewCount: 203,
    createdAt: '2024-01-08',
    updatedAt: '2024-01-08',
  },
  {
    id: 'prod-6',
    name: 'Google Pixel 8 Pro',
    slug: 'google-pixel-8-pro',
    description: 'Google Pixel 8 Pro with Google Tensor G3, the most advanced Pixel camera, and AI-powered features that adapt to you.',
    shortDescription: 'Google Tensor G3. AI-powered camera.',
    categoryId: 'cat-1-2-2',
    brandId: 'brand-6',
    images: [
      { id: 'img-10', url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800', alt: 'Google Pixel 8 Pro', isPrimary: true, order: 0 },
    ],
    variants: [
      { id: 'var-6-1', productId: 'prod-6', sku: 'PX8P-128-OBS', color: 'Obsidian', colorCode: '#1C1C1C', storage: '128GB', price: 549000, stock: 25, isActive: true },
      { id: 'var-6-2', productId: 'prod-6', sku: 'PX8P-256-OBS', color: 'Obsidian', colorCode: '#1C1C1C', storage: '256GB', price: 599000, stock: 20, isActive: true },
      { id: 'var-6-3', productId: 'prod-6', sku: 'PX8P-128-BAY', color: 'Bay', colorCode: '#7BAEDC', storage: '128GB', price: 549000, stock: 15, isActive: true },
    ],
    specs: [
      { label: 'Display', value: '6.7-inch LTPO OLED' },
      { label: 'Processor', value: 'Google Tensor G3' },
      { label: 'Camera', value: '50MP Main with Super Res Zoom' },
      { label: 'Battery', value: '5050mAh' },
    ],
    warranty: '2 Year Google Warranty',
    isFeatured: false,
    isActive: true,
    averageRating: 4.5,
    reviewCount: 89,
    createdAt: '2024-01-18',
    updatedAt: '2024-01-18',
  },
  {
    id: 'prod-7',
    name: 'USB-C Fast Charger 65W',
    slug: 'usb-c-fast-charger-65w',
    description: 'Universal 65W USB-C fast charger compatible with laptops, tablets, and smartphones. GaN technology for compact size.',
    shortDescription: '65W GaN charger. Universal compatibility.',
    categoryId: 'cat-1-3',
    images: [
      { id: 'img-11', url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800', alt: 'USB-C Charger', isPrimary: true, order: 0 },
    ],
    variants: [
      { id: 'var-7-1', productId: 'prod-7', sku: 'CHG65-WHT', color: 'White', colorCode: '#FFFFFF', price: 15000, stock: 100, isActive: true },
      { id: 'var-7-2', productId: 'prod-7', sku: 'CHG65-BLK', color: 'Black', colorCode: '#000000', price: 15000, stock: 80, isActive: true },
    ],
    specs: [
      { label: 'Power Output', value: '65W' },
      { label: 'Ports', value: '1x USB-C PD' },
      { label: 'Technology', value: 'GaN (Gallium Nitride)' },
    ],
    warranty: '6 Months Warranty',
    isFeatured: false,
    isActive: true,
    averageRating: 4.4,
    reviewCount: 45,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-05',
  },
  {
    id: 'prod-8',
    name: 'Lenovo ThinkPad X1 Carbon',
    slug: 'lenovo-thinkpad-x1-carbon',
    description: 'The legendary ThinkPad X1 Carbon combines business-class performance with ultralight portability. Features Intel vPro and enterprise security.',
    shortDescription: 'Business laptop. Intel vPro. 14" display.',
    categoryId: 'cat-1-1',
    brandId: 'brand-4',
    images: [
      { id: 'img-12', url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800', alt: 'ThinkPad X1 Carbon', isPrimary: true, order: 0 },
    ],
    variants: [
      { id: 'var-8-1', productId: 'prod-8', sku: 'X1C-256-BLK', color: 'Black', colorCode: '#000000', storage: '256GB', price: 1099000, stock: 12, isActive: true },
      { id: 'var-8-2', productId: 'prod-8', sku: 'X1C-512-BLK', color: 'Black', colorCode: '#000000', storage: '512GB', price: 1299000, stock: 8, isActive: true },
    ],
    specs: [
      { label: 'Display', value: '14-inch 2.8K OLED' },
      { label: 'Processor', value: 'Intel Core i7-1365U vPro' },
      { label: 'Memory', value: '16GB LPDDR5' },
      { label: 'Weight', value: '1.12 kg' },
    ],
    warranty: '3 Year Lenovo Warranty',
    isFeatured: false,
    isActive: true,
    averageRating: 4.7,
    reviewCount: 52,
    createdAt: '2024-01-14',
    updatedAt: '2024-01-14',
  },
];

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-admin',
    email: 'admin@techmart.com',
    phone: '+234 800 000 0001',
    firstName: 'Admin',
    lastName: 'User',
    role: 'SUPER_ADMIN',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    isActive: true,
  },
  {
    id: 'user-delivery',
    email: 'delivery@techmart.com',
    phone: '+234 800 000 0002',
    firstName: 'John',
    lastName: 'Rider',
    role: 'DELIVERY_AGENT',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    isActive: true,
  },
];

// Mock Reviews
export const mockReviews: Review[] = [
  {
    id: 'rev-1',
    productId: 'prod-1',
    userId: 'user-1',
    userName: 'John D.',
    rating: 5,
    title: 'Best phone ever!',
    comment: 'The iPhone 15 Pro Max exceeded all my expectations. The camera is incredible and the titanium design feels premium.',
    status: 'APPROVED',
    isVerifiedPurchase: true,
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20',
  },
  {
    id: 'rev-2',
    productId: 'prod-1',
    userId: 'user-2',
    userName: 'Sarah M.',
    rating: 4,
    title: 'Great but expensive',
    comment: 'Amazing phone with top-notch features. Only wish it was a bit more affordable.',
    status: 'APPROVED',
    isVerifiedPurchase: true,
    createdAt: '2024-01-22',
    updatedAt: '2024-01-22',
  },
  {
    id: 'rev-3',
    productId: 'prod-2',
    userId: 'user-3',
    userName: 'Mike R.',
    rating: 5,
    title: 'Perfect for developers',
    comment: 'The M3 Pro chip handles everything I throw at it. Best laptop for software development.',
    status: 'APPROVED',
    isVerifiedPurchase: true,
    createdAt: '2024-01-25',
    updatedAt: '2024-01-25',
  },
];

// Helper function to generate order number
export const generateOrderNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `ORD-${year}-${random}`;
};

// Helper function to generate invoice number
export const generateInvoiceNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `INV-${year}-${random}`;
};
