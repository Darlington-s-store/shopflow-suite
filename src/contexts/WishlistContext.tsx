import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WishlistItem } from '@/types';
import { Product } from '@/types/product';
import { useAuth } from './AuthContext';
import { useProductManagement } from '@/contexts/ProductManagementContext';

interface WishlistContextType {
  items: WishlistItem[];
  products: Product[];
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, token, isAuthenticated } = useAuth();
  const { products: allProducts } = useProductManagement();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Load wishlist from backend when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      loadWishlist();
    }
  }, [isAuthenticated, token]);

  const loadWishlist = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${apiUrl}/user/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const wishlistData = Array.isArray(data) ? data : data.wishlist || [];
        setItems(wishlistData);
      }
    } catch (error) {
      console.error('Load wishlist error:', error);
    }
  };

  const products = items
    .map(item => allProducts.find(p => p.id === item.productId))
    .filter(Boolean) as Product[];

  const addToWishlist = async (productId: string) => {
    if (isInWishlist(productId)) return;

    if (!token) {
      // Fallback for guest users (store locally)
      const newItem: WishlistItem = {
        id: `wish-${Date.now()}`,
        userId: 'guest',
        productId,
        addedAt: new Date().toISOString(),
      };
      setItems(prev => [...prev, newItem]);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/user/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        await loadWishlist();
      }
    } catch (error) {
      console.error('Add to wishlist error:', error);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!token) {
      // Fallback for guest users (remove locally)
      setItems(prev => prev.filter(item => item.productId !== productId));
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/user/wishlist/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await loadWishlist();
      }
    } catch (error) {
      console.error('Remove from wishlist error:', error);
    }
  };

  const isInWishlist = (productId: string) => {
    return items.some(item => item.productId === productId);
  };

  const clearWishlist = async () => {
    if (!token) {
      setItems([]);
      return;
    }

    try {
      // Note: You may need to add a backend endpoint for bulk delete
      // For now, delete items individually
      for (const item of items) {
        await fetch(`${apiUrl}/user/wishlist/${item.productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
      setItems([]);
    } catch (error) {
      console.error('Clear wishlist error:', error);
    }
  };

  const value: WishlistContextType = {
    items,
    products,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
