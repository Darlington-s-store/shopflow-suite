import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product, ProductVariant, Cart } from '@/types';
import { products as mockProducts, storeSettings } from '@/data/mockData';

interface CartContextType {
  cart: Cart;
  items: CartItem[];
  itemCount: number;
  addToCart: (productId: string, variantId: string, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string, variantId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'techmart_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem(STORAGE_KEY);
    if (savedCart) {
      const parsedItems = JSON.parse(savedCart);
      // Rehydrate with current product data
      const hydratedItems = parsedItems.map((item: any) => {
        const product = mockProducts.find(p => p.id === item.productId);
        const variant = product?.variants.find(v => v.id === item.variantId);
        if (product && variant) {
          return { ...item, product, variant };
        }
        return null;
      }).filter(Boolean);
      setItems(hydratedItems);
    }
  }, []);

  useEffect(() => {
    // Save only essential data to localStorage
    const itemsToSave = items.map(({ id, productId, variantId, quantity }) => ({
      id, productId, variantId, quantity
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(itemsToSave));
  }, [items]);

  const calculateCart = (): Cart => {
    const subtotal = items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
    const deliveryFee = subtotal >= (storeSettings.freeShippingThreshold || Infinity) ? 0 : storeSettings.shippingFee;
    const tax = subtotal * (storeSettings.taxRate / 100);
    const total = subtotal + deliveryFee + tax;

    return { items, subtotal, deliveryFee, tax, total };
  };

  const addToCart = (productId: string, variantId: string, quantity = 1) => {
    const product = mockProducts.find(p => p.id === productId);
    const variant = product?.variants.find(v => v.id === variantId);

    if (!product || !variant) return;

    setItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.productId === productId && item.variantId === variantId
      );

      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      const newItem: CartItem = {
        id: `cart-${Date.now()}`,
        productId,
        variantId,
        quantity,
        product,
        variant,
      };

      return [...prev, newItem];
    });
  };

  const removeFromCart = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(itemId);
      return;
    }

    setItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const isInCart = (productId: string, variantId: string) => {
    return items.some(item => item.productId === productId && item.variantId === variantId);
  };

  const value: CartContextType = {
    cart: calculateCart(),
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
