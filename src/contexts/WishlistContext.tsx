import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WishlistItem, Product } from '@/types';
import { products as mockProducts } from '@/data/mockData';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  items: WishlistItem[];
  products: Product[];
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = 'techmart_wishlist';

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    if (user) {
      const savedWishlist = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
      if (savedWishlist) {
        setItems(JSON.parse(savedWishlist));
      } else {
        setItems([]);
      }
    } else {
      // Guest wishlist
      const savedWishlist = localStorage.getItem(`${STORAGE_KEY}_guest`);
      if (savedWishlist) {
        setItems(JSON.parse(savedWishlist));
      }
    }
  }, [user]);

  useEffect(() => {
    const key = user ? `${STORAGE_KEY}_${user.id}` : `${STORAGE_KEY}_guest`;
    localStorage.setItem(key, JSON.stringify(items));
  }, [items, user]);

  const products = items
    .map(item => mockProducts.find(p => p.id === item.productId))
    .filter(Boolean) as Product[];

  const addToWishlist = (productId: string) => {
    if (isInWishlist(productId)) return;

    const newItem: WishlistItem = {
      id: `wish-${Date.now()}`,
      userId: user?.id || 'guest',
      productId,
      addedAt: new Date().toISOString(),
    };

    setItems(prev => [...prev, newItem]);
  };

  const removeFromWishlist = (productId: string) => {
    setItems(prev => prev.filter(item => item.productId !== productId));
  };

  const isInWishlist = (productId: string) => {
    return items.some(item => item.productId === productId);
  };

  const clearWishlist = () => {
    setItems([]);
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

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
