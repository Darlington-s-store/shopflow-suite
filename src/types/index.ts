// User & Authentication Types
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'DELIVERY_AGENT' | 'CUSTOMER';

export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

// Catalog Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  children?: Category[];
  createdAt: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  color?: string;
  colorCode?: string;
  storage?: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  isActive: boolean;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  categoryId: string;
  brandId?: string;
  images: ProductImage[];
  variants: ProductVariant[];
  specs?: ProductSpec[];
  tags?: string[];
  warranty?: string;
  isFeatured: boolean;
  isActive: boolean;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

// Cart Types
export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  product: Product;
  variant: ProductVariant;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
}

// Order Types
export type OrderStatus = 
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PROCESSING'
  | 'PACKED'
  | 'ASSIGNED_TO_DELIVERY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'DELIVERY_FAILED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'CARD' | 'BANK_TRANSFER' | 'MOBILE_MONEY';

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference: string;
  gatewayResponse?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  status: OrderStatus;
  payment?: Payment;
  shippingAddress: Address;
  billingAddress?: Address;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Delivery Types
export type DeliveryStatus = 
  | 'PENDING'
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'FAILED';

export interface DeliveryUpdate {
  id: string;
  status: DeliveryStatus;
  note?: string;
  location?: string;
  timestamp: string;
  updatedBy: string;
}

export interface Delivery {
  id: string;
  orderId: string;
  agentId?: string;
  status: DeliveryStatus;
  fee: number;
  estimatedDelivery?: string;
  actualDelivery?: string;
  updates: DeliveryUpdate[];
  proofOfDelivery?: string;
  createdAt: string;
}

// Review Types
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  orderId?: string;
  rating: number;
  title?: string;
  comment: string;
  status: ReviewStatus;
  isVerifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
}

// Wishlist
export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  addedAt: string;
}

// Notification Types
export type NotificationType = 
  | 'ORDER_CONFIRMED'
  | 'PAYMENT_SUCCESS'
  | 'ORDER_SHIPPED'
  | 'ORDER_DELIVERED'
  | 'DELIVERY_FAILED'
  | 'REVIEW_APPROVED'
  | 'PROMO';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

// Analytics Types
export interface SalesAnalytics {
  date: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  sales: number;
  revenue: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  pendingOrders: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
}

// Invoice/Receipt
export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  order: Order;
  issuedAt: string;
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storeEmail: string;
  taxRate: number;
  vatNumber?: string;
}

// SMS Template
export interface SMSTemplate {
  id: string;
  name: string;
  event: string;
  template: string;
  isActive: boolean;
  placeholders: string[];
}

// Store Settings
export interface StoreSettings {
  name: string;
  logo?: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  currencySymbol: string;
  taxRate: number;
  vatNumber?: string;
  shippingFee: number;
  freeShippingThreshold?: number;
}
