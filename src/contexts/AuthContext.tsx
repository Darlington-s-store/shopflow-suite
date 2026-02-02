import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Address, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isDeliveryAgent: boolean;
  addresses: Address[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  addAddress: (address: Omit<Address, 'id' | 'userId'>) => Promise<void>;
  updateAddress: (id: string, address: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
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

const STORAGE_KEY = 'techmart_auth';
const USERS_KEY = 'techmart_users';
const ADDRESSES_KEY = 'techmart_addresses';

// Default admin credentials
const DEFAULT_ADMIN = {
  id: 'admin-1',
  email: 'admin@techmart.com',
  password: 'admin123',
  phone: '+234 800 000 0001',
  firstName: 'Admin',
  lastName: 'User',
  role: 'SUPER_ADMIN' as UserRole,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isActive: true,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize default admin if not exists
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const adminExists = users.some((u: any) => u.email === DEFAULT_ADMIN.email);
    if (!adminExists) {
      users.push(DEFAULT_ADMIN);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    // Load authenticated user
    const savedAuth = localStorage.getItem(STORAGE_KEY);
    if (savedAuth) {
      const { userId } = JSON.parse(savedAuth);
      const allUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      const foundUser = allUsers.find((u: User) => u.id === userId);
      if (foundUser) {
        const { password, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        loadAddresses(userId);
      }
    }
    setIsLoading(false);
  }, []);

  const loadAddresses = (userId: string) => {
    const allAddresses = JSON.parse(localStorage.getItem(ADDRESSES_KEY) || '[]');
    setAddresses(allAddresses.filter((a: Address) => a.userId === userId));
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const foundUser = users.find((u: any) => u.email === email && u.password === password);

    if (!foundUser) {
      return { success: false, error: 'Invalid email or password' };
    }

    if (!foundUser.isActive) {
      return { success: false, error: 'Account is disabled' };
    }

    if (foundUser.role !== 'CUSTOMER') {
      return { success: false, error: 'Please use admin login for staff accounts' };
    }

    const { password: _, ...userWithoutPassword } = foundUser;
    setUser(userWithoutPassword);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ userId: foundUser.id }));
    loadAddresses(foundUser.id);

    return { success: true };
  };

  const adminLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const foundUser = users.find((u: any) => u.email === email && u.password === password);

    if (!foundUser) {
      return { success: false, error: 'Invalid email or password' };
    }

    if (!foundUser.isActive) {
      return { success: false, error: 'Account is disabled' };
    }

    if (foundUser.role === 'CUSTOMER') {
      return { success: false, error: 'Access denied. Admin credentials required.' };
    }

    const { password: _, ...userWithoutPassword } = foundUser;
    setUser(userWithoutPassword);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ userId: foundUser.id }));

    return { success: true };
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    if (users.some((u: any) => u.email === data.email)) {
      return { success: false, error: 'Email already registered' };
    }

    const newUser = {
      id: `user-${Date.now()}`,
      email: data.email,
      password: data.password,
      phone: data.phone,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'CUSTOMER' as UserRole,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ userId: newUser.id }));

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setAddresses([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const index = users.findIndex((u: any) => u.id === user.id);
    
    if (index !== -1) {
      users[index] = { ...users[index], ...data, updatedAt: new Date().toISOString() };
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      
      const { password: _, ...userWithoutPassword } = users[index];
      setUser(userWithoutPassword);
    }
  };

  const addAddress = async (address: Omit<Address, 'id' | 'userId'>) => {
    if (!user) return;

    const allAddresses = JSON.parse(localStorage.getItem(ADDRESSES_KEY) || '[]');
    
    // If this is the first address or marked as default, unset other defaults
    if (address.isDefault || allAddresses.filter((a: Address) => a.userId === user.id).length === 0) {
      allAddresses.forEach((a: Address) => {
        if (a.userId === user.id) a.isDefault = false;
      });
    }

    const newAddress: Address = {
      ...address,
      id: `addr-${Date.now()}`,
      userId: user.id,
      isDefault: address.isDefault || allAddresses.filter((a: Address) => a.userId === user.id).length === 0,
    };

    allAddresses.push(newAddress);
    localStorage.setItem(ADDRESSES_KEY, JSON.stringify(allAddresses));
    loadAddresses(user.id);
  };

  const updateAddress = async (id: string, address: Partial<Address>) => {
    if (!user) return;

    const allAddresses = JSON.parse(localStorage.getItem(ADDRESSES_KEY) || '[]');
    const index = allAddresses.findIndex((a: Address) => a.id === id && a.userId === user.id);
    
    if (index !== -1) {
      allAddresses[index] = { ...allAddresses[index], ...address };
      localStorage.setItem(ADDRESSES_KEY, JSON.stringify(allAddresses));
      loadAddresses(user.id);
    }
  };

  const deleteAddress = async (id: string) => {
    if (!user) return;

    const allAddresses = JSON.parse(localStorage.getItem(ADDRESSES_KEY) || '[]');
    const filtered = allAddresses.filter((a: Address) => !(a.id === id && a.userId === user.id));
    localStorage.setItem(ADDRESSES_KEY, JSON.stringify(filtered));
    loadAddresses(user.id);
  };

  const setDefaultAddress = async (id: string) => {
    if (!user) return;

    const allAddresses = JSON.parse(localStorage.getItem(ADDRESSES_KEY) || '[]');
    allAddresses.forEach((a: Address) => {
      if (a.userId === user.id) {
        a.isDefault = a.id === id;
      }
    });
    localStorage.setItem(ADDRESSES_KEY, JSON.stringify(allAddresses));
    loadAddresses(user.id);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN',
    isDeliveryAgent: user?.role === 'DELIVERY_AGENT',
    addresses,
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
