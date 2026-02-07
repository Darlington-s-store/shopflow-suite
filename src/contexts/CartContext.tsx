import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { CartItem, Cart, Product, ProductVariant } from '@/types';
import { storeSettings } from '@/lib/constants';
import { useAuth } from '@/contexts/AuthContext';

interface CartContextType {
  cart: Cart;
  items: CartItem[];
  itemCount: number;
  addToCart: (item: Omit<CartItem, 'id' | 'product' | 'variant'>, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (productId: string, variantId?: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { token, isAuthenticated } = useAuth();

  const loadCart = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch(`${API_BASE_URL}/user/cart`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();

        interface BackendCartItem {
          id: number;
          product_id: number;
          variant_id: number | null;
          quantity: number;
          product_name: string;
          slug?: string;
          base_price: string | number;
          image_url?: string;
          variant_price?: string | number;
          color?: string;
          storage?: string;
        }

        // Map backend flat structure to nested CartItem structure
        const mappedItems = (data.items || []).map((item: BackendCartItem) => ({
          id: String(item.id),
          productId: String(item.product_id),
          variantId: item.variant_id ? String(item.variant_id) : '',
          quantity: item.quantity,
          product: {
            id: String(item.product_id),
            name: item.product_name,
            slug: item.slug || '',
            basePrice: Number(item.base_price),
            images: item.image_url ? [{ url: item.image_url, isPrimary: true }] : [],
          } as unknown as Product,
          variant: item.variant_id ? {
            id: String(item.variant_id),
            price: Number(item.variant_price),
            color: item.color,
            storage: item.storage
          } as unknown as ProductVariant : undefined
        }));
        setItems(mappedItems);
      }
    } catch (error) {
      console.error('Load cart error:', error);
    }
  }, [token]);

  // Load cart when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    }
  }, [isAuthenticated, loadCart]);

  const calculateCart = (): Cart => {
    const subtotal = items.reduce((sum, item) => {
      const price = item.variant?.price || item.product?.basePrice || 0;
      return sum + price * item.quantity;
    }, 0);

    const deliveryFee = subtotal >= (storeSettings.freeShippingThreshold || Infinity) ? 0 : storeSettings.shippingFee;
    const tax = subtotal * (storeSettings.taxRate / 100);
    const total = subtotal + deliveryFee + tax;

    return { items, subtotal, deliveryFee, tax, total };
  };

  const addToCart = async (item: Omit<CartItem, 'id' | 'product' | 'variant'>, quantity = 1) => {
    if (!isAuthenticated) return;

    try {
      const res = await fetch(`${API_BASE_URL}/user/cart`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...item, quantity })
      });

      if (res.ok) {
        const data = await res.json();
        // Optimistically update local cart with returned item
        const returned = data.item;
        if (returned) {
          const mapped: CartItem = {
            id: String(returned.id),
            productId: String(returned.product_id),
            variantId: returned.variant_id ? String(returned.variant_id) : '',
            quantity: returned.quantity,
            product: {
              id: String(returned.product_id),
              name: returned.product_name || '',
              slug: returned.slug || '',
              basePrice: Number(returned.base_price || 0),
              images: returned.image_url ? [{ url: returned.image_url, isPrimary: true }] : [],
            } as unknown as Product,
            variant: returned.variant_id ? {
              id: String(returned.variant_id),
              price: Number(returned.variant_price || returned.price || 0),
              color: returned.color,
              storage: returned.storage,
            } as unknown as ProductVariant : undefined,
          };

          setItems(prev => {
            // Merge if same product+variant exists
            const existingIndex = prev.findIndex(i => i.productId === mapped.productId && i.variantId === mapped.variantId);
            if (existingIndex > -1) {
              const copy = [...prev];
              copy[existingIndex] = { ...copy[existingIndex], quantity: mapped.quantity };
              return copy;
            }
            return [mapped, ...prev];
          });
        } else {
          // Fallback: reload full cart
          await loadCart();
        }
      }
    } catch (error) {
      console.error('Add to cart error:', error);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!isAuthenticated) return;

    try {
      const res = await fetch(`${API_BASE_URL}/user/cart/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        await loadCart();
      }
    } catch (error) {
      console.error('Remove from cart error:', error);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) {
      await removeFromCart(productId);
      return;
    }

    // Update locally first for better UX
    setItems(prev =>
      prev.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;

    try {
      const res = await fetch(`${API_BASE_URL}/user/cart`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        setItems([]);
      }
    } catch (error) {
      console.error('Clear cart error:', error);
    }
  };

  const isInCart = (productId: string, variantId?: string) => {
    return items.some(item =>
      item.productId === productId &&
      (!variantId || item.variantId === variantId)
    );
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

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
