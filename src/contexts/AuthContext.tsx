import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Address, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isDeliveryAgent: boolean;
  addresses: Address[];
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  addAddress: (address: Omit<Address, 'id' | 'userId'>) => Promise<{ success: boolean; error?: string }>;
  updateAddress: (id: string, address: Partial<Address>) => Promise<{ success: boolean; error?: string }>;
  deleteAddress: (id: string) => Promise<{ success: boolean; error?: string }>;
  setDefaultAddress: (id: string) => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Session is stored in an HttpOnly cookie; do not persist token in localStorage


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Attempt to load profile from server via cookie-based session
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/profile`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          // Load addresses if user is authenticated
          const addressRes = await fetch(`${API_BASE_URL}/user/addresses`, { credentials: 'include' });
          if (addressRes.ok) {
            const addressData = await addressRes.json();
            setAddresses(addressData.addresses);
          }
        }
      } catch (err) {
        console.error('Profile load error:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/profile`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      console.error('Profile load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        if (data.token) {
          setToken(data.token);
        }
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  };

  const adminLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        if (data.token) {
          setToken(data.token);
        }
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone
        })
      });

      const responseData = await res.json();
      if (responseData.success) {
        setUser(responseData.user);
        if (responseData.token) {
          setToken(responseData.token);
        }
        return { success: true };
      } else {
        return { success: false, error: responseData.error };
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    // Clear server-side cookie and local session
    fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => { });
    setUser(null);
    setAddresses([]);
    setToken(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const responseData = await res.json();
      if (responseData.success) {
        setUser(responseData.user);
      }
    } catch (error) {
      console.error('Update profile error:', error);
    }
  };

  const addAddress = async (address: Omit<Address, 'id' | 'userId'>): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE_URL}/user/addresses`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address)
      });

      const responseData = await res.json();
      if (responseData.success) {
        // Reload addresses
        loadAddresses();
        return { success: true };
      } else {
        return { success: false, error: responseData.error };
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Add address error:', error);
      return { success: false, error: message };
    }
  };

  const loadAddresses = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/user/addresses`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses);
      }
    } catch (error) {
      console.error('Load addresses error:', error);
    }
  };

  const updateAddress = async (id: string, address: Partial<Address>): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE_URL}/user/addresses/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        loadAddresses();
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to update address' };
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Update address error:', error);
      return { success: false, error: message };
    }
  };

  const deleteAddress = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE_URL}/user/addresses/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await res.json();

      if (res.ok && data.success) {
        loadAddresses();
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to delete address' };
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Delete address error:', error);
      return { success: false, error: message };
    }
  };

  const setDefaultAddress = async (id: string) => {
    await updateAddress(id, { isDefault: true });
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN',
    isDeliveryAgent: user?.role === 'DELIVERY_AGENT',
    addresses,
    token,
    login,
    adminLogin,
    register,
    logout,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
