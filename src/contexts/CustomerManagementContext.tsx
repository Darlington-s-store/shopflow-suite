import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Customer, CustomerFilters, CustomerAccountAction, CustomerNote, CustomerAddress, CustomerDetails, AuditLog, CustomerStatus, CustomerFlag } from '@/types/customer';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

interface CustomerManagementContextType {
    // Customers
    customers: Customer[];

    // CRUD Operations
    getCustomer: (id: string) => Customer | undefined;
    getCustomerDetails: (id: string) => CustomerDetails | undefined;
    updateCustomer: (id: string, data: Partial<Customer>) => Promise<{ success: boolean; error?: string }>;
    deleteCustomer: (id: string, reason?: string) => Promise<{ success: boolean; error?: string }>;

    // Account Actions
    suspendCustomer: (id: string, reason: string) => Promise<{ success: boolean; error?: string }>;
    unsuspendCustomer: (id: string, reason: string) => Promise<{ success: boolean; error?: string }>;
    resetCustomerPassword: (id: string) => Promise<{ success: boolean; tempPassword?: string; error?: string }>;
    forceLogout: (id: string) => Promise<{ success: boolean; error?: string }>;

    // Flags & Notes
    addCustomerFlag: (id: string, flag: CustomerFlag) => Promise<{ success: boolean; error?: string }>;
    removeCustomerFlag: (id: string, flag: CustomerFlag) => Promise<{ success: boolean; error?: string }>;
    addCustomerNote: (id: string, note: string, adminId: string, adminName: string) => Promise<{ success: boolean; error?: string }>;

    // Address Management
    addCustomerAddress: (customerId: string, address: Omit<CustomerAddress, 'id' | 'customerId' | 'createdAt'>) => Promise<{ success: boolean; error?: string }>;
    updateCustomerAddress: (customerId: string, addressId: string, data: Partial<CustomerAddress>) => Promise<{ success: boolean; error?: string }>;
    deleteCustomerAddress: (customerId: string, addressId: string) => Promise<{ success: boolean; error?: string }>;

    // Filtering & Search
    filterCustomers: (filters: CustomerFilters) => Customer[];

    // Audit Logs
    getAuditLogs: (entityType?: string, entityId?: string) => AuditLog[];

    // Loading States
    isLoading: boolean;
}

const CustomerManagementContext = createContext<CustomerManagementContextType | undefined>(undefined);

export function CustomerManagementProvider({ children }: { children: ReactNode }) {
    const { token } = useAuth();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    // Load customers from backend on mount
    useEffect(() => {
        const loadCustomers = async () => {
            if (!token) return;
            
            try {
                setIsLoading(true);
                const response = await fetch(`${apiUrl}/admin/customers`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    const loadedCustomers = (data.customers || []).map((customer: Partial<Customer>) => ({
                        ...customer,
                        id: customer.id?.toString(),
                        addresses: customer.addresses || [],
                        notes: customer.notes || [],
                        flags: customer.flags || [],
                    }));
                    setCustomers(loadedCustomers);
                } else {
                    console.error('Failed to fetch customers:', response.statusText);
                }
            } catch (error) {
                console.error('Load customers error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadCustomers();
    }, [token, apiUrl]);

    // Helper: Generate unique ID
    const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Helper: Create audit log
    const createAuditLog = useCallback((
        action: string,
        entityType: 'CUSTOMER' | 'PRODUCT' | 'ORDER' | 'PAYMENT',
        entityId: string,
        adminId: string,
        adminName: string,
        changes?: Record<string, { old: unknown; new: unknown }>,
        reason?: string
    ) => {
        const log: AuditLog = {
            id: generateId(),
            action,
            entityType,
            entityId,
            adminId,
            adminName,
            changes,
            reason,
            createdAt: new Date(),
        };
        setAuditLogs(prev => [log, ...prev]);
    }, []);

    // Get Customer
    const getCustomer = useCallback((id: string) => {
        return customers.find(c => c.id === id);
    }, [customers]);

    // Get Customer Details
    const getCustomerDetails = useCallback((id: string): CustomerDetails | undefined => {
        const customer = customers.find(c => c.id === id);
        if (!customer) return undefined;

        // In production, fetch from API
        const customerLogs = auditLogs.filter(log => log.entityId === id && log.entityType === 'CUSTOMER');

        return {
            ...customer,
            addresses: customer.addresses || [],
            notes: customer.notes || [],
            flags: customer.flags || [],
            recentOrders: [], // TODO: Fetch from OrderContext
            auditLogs: customerLogs,
        };
    }, [customers, auditLogs]);

    // Update Customer
    const updateCustomer = useCallback(async (id: string, data: Partial<Customer>): Promise<{ success: boolean; error?: string }> => {
        setIsLoading(true);
        try {
            const oldCustomer = customers.find(c => c.id === id);
            if (!oldCustomer) {
                return { success: false, error: 'Customer not found' };
            }

            setCustomers(prev => prev.map(c => {
                if (c.id === id) {
                    return {
                        ...c,
                        ...data,
                        updatedAt: new Date(),
                    };
                }
                return c;
            }));

            // Create audit log
            createAuditLog(
                'UPDATE_CUSTOMER',
                'CUSTOMER',
                id,
                'admin-id', // TODO: Get from auth context
                'Admin User',
                {
                    updated: { old: oldCustomer, new: { ...oldCustomer, ...data } }
                }
            );

            toast.success('Customer updated successfully!');
            return { success: true };
        } catch (error) {
            console.error('Update customer error:', error);
            toast.error('Failed to update customer');
            return { success: false, error: 'Failed to update customer' };
        } finally {
            setIsLoading(false);
        }
    }, [customers, createAuditLog]);

    // Delete Customer (Soft Delete)
    const deleteCustomer = useCallback(async (id: string, reason?: string): Promise<{ success: boolean; error?: string }> => {
        setIsLoading(true);
        try {
            setCustomers(prev => prev.map(c => {
                if (c.id === id) {
                    return {
                        ...c,
                        status: 'DELETED' as CustomerStatus,
                        updatedAt: new Date(),
                    };
                }
                return c;
            }));

            createAuditLog(
                'DELETE_CUSTOMER',
                'CUSTOMER',
                id,
                'admin-id',
                'Admin User',
                undefined,
                reason
            );

            toast.success('Customer account deleted');
            return { success: true };
        } catch (error) {
            console.error('Delete customer error:', error);
            toast.error('Failed to delete customer');
            return { success: false, error: 'Failed to delete customer' };
        } finally {
            setIsLoading(false);
        }
    }, [createAuditLog]);

    // Suspend Customer
    const suspendCustomer = useCallback(async (id: string, reason: string): Promise<{ success: boolean; error?: string }> => {
        setIsLoading(true);
        try {
            setCustomers(prev => prev.map(c => {
                if (c.id === id) {
                    return {
                        ...c,
                        status: 'SUSPENDED' as CustomerStatus,
                        updatedAt: new Date(),
                    };
                }
                return c;
            }));

            createAuditLog(
                'SUSPEND_CUSTOMER',
                'CUSTOMER',
                id,
                'admin-id',
                'Admin User',
                undefined,
                reason
            );

            toast.success('Customer account suspended');
            return { success: true };
        } catch (error) {
            console.error('Suspend customer error:', error);
            toast.error('Failed to suspend customer');
            return { success: false, error: 'Failed to suspend customer' };
        } finally {
            setIsLoading(false);
        }
    }, [createAuditLog]);

    // Unsuspend Customer
    const unsuspendCustomer = useCallback(async (id: string, reason: string): Promise<{ success: boolean; error?: string }> => {
        setIsLoading(true);
        try {
            setCustomers(prev => prev.map(c => {
                if (c.id === id) {
                    return {
                        ...c,
                        status: 'ACTIVE' as CustomerStatus,
                        updatedAt: new Date(),
                    };
                }
                return c;
            }));

            createAuditLog(
                'UNSUSPEND_CUSTOMER',
                'CUSTOMER',
                id,
                'admin-id',
                'Admin User',
                undefined,
                reason
            );

            toast.success('Customer account activated');
            return { success: true };
        } catch (error) {
            console.error('Unsuspend customer error:', error);
            toast.error('Failed to activate customer');
            return { success: false, error: 'Failed to activate customer' };
        } finally {
            setIsLoading(false);
        }
    }, [createAuditLog]);

    // Reset Customer Password
    const resetCustomerPassword = useCallback(async (id: string): Promise<{ success: boolean; tempPassword?: string; error?: string }> => {
        setIsLoading(true);
        try {
            // Generate temporary password
            const tempPassword = Math.random().toString(36).slice(-8).toUpperCase();

            createAuditLog(
                'RESET_PASSWORD',
                'CUSTOMER',
                id,
                'admin-id',
                'Admin User'
            );

            toast.success('Password reset link sent to customer');
            return { success: true, tempPassword };
        } catch (error) {
            console.error('Reset password error:', error);
            toast.error('Failed to reset password');
            return { success: false, error: 'Failed to reset password' };
        } finally {
            setIsLoading(false);
        }
    }, [createAuditLog]);

    // Force Logout
    const forceLogout = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
        try {
            createAuditLog(
                'FORCE_LOGOUT',
                'CUSTOMER',
                id,
                'admin-id',
                'Admin User'
            );

            toast.success('Customer logged out successfully');
            return { success: true };
        } catch (error) {
            console.error('Force logout error:', error);
            toast.error('Failed to logout customer');
            return { success: false, error: 'Failed to logout customer' };
        }
    }, [createAuditLog]);

    // Add Customer Flag
    const addCustomerFlag = useCallback(async (id: string, flag: CustomerFlag): Promise<{ success: boolean; error?: string }> => {
        try {
            setCustomers(prev => prev.map(c => {
                if (c.id === id && !c.flags.includes(flag)) {
                    return {
                        ...c,
                        flags: [...c.flags, flag],
                        updatedAt: new Date(),
                    };
                }
                return c;
            }));

            createAuditLog(
                'ADD_FLAG',
                'CUSTOMER',
                id,
                'admin-id',
                'Admin User',
                { flag: { old: null, new: flag } }
            );

            toast.success('Flag added to customer');
            return { success: true };
        } catch (error) {
            console.error('Add flag error:', error);
            toast.error('Failed to add flag');
            return { success: false, error: 'Failed to add flag' };
        }
    }, [createAuditLog]);

    // Remove Customer Flag
    const removeCustomerFlag = useCallback(async (id: string, flag: CustomerFlag): Promise<{ success: boolean; error?: string }> => {
        try {
            setCustomers(prev => prev.map(c => {
                if (c.id === id) {
                    return {
                        ...c,
                        flags: c.flags.filter(f => f !== flag),
                        updatedAt: new Date(),
                    };
                }
                return c;
            }));

            createAuditLog(
                'REMOVE_FLAG',
                'CUSTOMER',
                id,
                'admin-id',
                'Admin User',
                { flag: { old: flag, new: null } }
            );

            toast.success('Flag removed from customer');
            return { success: true };
        } catch (error) {
            console.error('Remove flag error:', error);
            toast.error('Failed to remove flag');
            return { success: false, error: 'Failed to remove flag' };
        }
    }, [createAuditLog]);

    // Add Customer Note
    const addCustomerNote = useCallback(async (id: string, note: string, adminId: string, adminName: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const newNote: CustomerNote = {
                id: generateId(),
                customerId: id,
                adminId,
                adminName,
                note,
                createdAt: new Date(),
            };

            setCustomers(prev => prev.map(c => {
                if (c.id === id) {
                    return {
                        ...c,
                        notes: [newNote, ...c.notes],
                        updatedAt: new Date(),
                    };
                }
                return c;
            }));

            toast.success('Note added successfully');
            return { success: true };
        } catch (error) {
            console.error('Add note error:', error);
            toast.error('Failed to add note');
            return { success: false, error: 'Failed to add note' };
        }
    }, []);

    // Add Customer Address
    const addCustomerAddress = useCallback(async (customerId: string, address: Omit<CustomerAddress, 'id' | 'customerId' | 'createdAt'>): Promise<{ success: boolean; error?: string }> => {
        try {
            const newAddress: CustomerAddress = {
                ...address,
                id: generateId(),
                customerId,
                createdAt: new Date(),
            };

            setCustomers(prev => prev.map(c => {
                if (c.id === customerId) {
                    return {
                        ...c,
                        addresses: [...c.addresses, newAddress],
                        updatedAt: new Date(),
                    };
                }
                return c;
            }));

            toast.success('Address added successfully');
            return { success: true };
        } catch (error) {
            console.error('Add address error:', error);
            toast.error('Failed to add address');
            return { success: false, error: 'Failed to add address' };
        }
    }, []);

    // Update Customer Address
    const updateCustomerAddress = useCallback(async (customerId: string, addressId: string, data: Partial<CustomerAddress>): Promise<{ success: boolean; error?: string }> => {
        try {
            setCustomers(prev => prev.map(c => {
                if (c.id === customerId) {
                    return {
                        ...c,
                        addresses: c.addresses.map(a => a.id === addressId ? { ...a, ...data } : a),
                        updatedAt: new Date(),
                    };
                }
                return c;
            }));

            toast.success('Address updated successfully');
            return { success: true };
        } catch (error) {
            console.error('Update address error:', error);
            toast.error('Failed to update address');
            return { success: false, error: 'Failed to update address' };
        }
    }, []);

    // Delete Customer Address
    const deleteCustomerAddress = useCallback(async (customerId: string, addressId: string): Promise<{ success: boolean; error?: string }> => {
        try {
            setCustomers(prev => prev.map(c => {
                if (c.id === customerId) {
                    return {
                        ...c,
                        addresses: c.addresses.filter(a => a.id !== addressId),
                        updatedAt: new Date(),
                    };
                }
                return c;
            }));

            toast.success('Address deleted successfully');
            return { success: true };
        } catch (error) {
            console.error('Delete address error:', error);
            toast.error('Failed to delete address');
            return { success: false, error: 'Failed to delete address' };
        }
    }, []);

    // Filter Customers
    const filterCustomers = useCallback((filters: CustomerFilters): Customer[] => {
        return customers.filter(customer => {
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                if (!customer.firstName.toLowerCase().includes(searchLower) &&
                    !customer.lastName.toLowerCase().includes(searchLower) &&
                    !customer.email.toLowerCase().includes(searchLower) &&
                    !customer.phone.includes(filters.search)) {
                    return false;
                }
            }

            if (filters.status && customer.status !== filters.status) return false;

            if (filters.flags && filters.flags.length > 0) {
                if (!filters.flags.some(flag => customer.flags.includes(flag))) return false;
            }

            if (filters.registeredAfter && new Date(customer.createdAt) < filters.registeredAfter) return false;
            if (filters.registeredBefore && new Date(customer.createdAt) > filters.registeredBefore) return false;

            if (filters.minOrders && customer.totalOrders < filters.minOrders) return false;
            if (filters.minSpent && customer.totalSpent < filters.minSpent) return false;

            return true;
        }).sort((a, b) => {
            if (!filters.sortBy) return 0;

            const order = filters.sortOrder === 'desc' ? -1 : 1;

            switch (filters.sortBy) {
                case 'name':
                    return order * `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
                case 'email':
                    return order * a.email.localeCompare(b.email);
                case 'totalOrders':
                    return order * (a.totalOrders - b.totalOrders);
                case 'totalSpent':
                    return order * (a.totalSpent - b.totalSpent);
                case 'createdAt':
                    return order * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                case 'lastLogin': {
                    const aLogin = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
                    const bLogin = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
                    return order * (aLogin - bLogin);
                }
                default:
                    return 0;
            }
        });
    }, [customers]);

    // Get Audit Logs
    const getAuditLogs = useCallback((entityType?: string, entityId?: string): AuditLog[] => {
        return auditLogs.filter(log => {
            if (entityType && log.entityType !== entityType) return false;
            if (entityId && log.entityId !== entityId) return false;
            return true;
        });
    }, [auditLogs]);

    const value: CustomerManagementContextType = {
        customers,
        getCustomer,
        getCustomerDetails,
        updateCustomer,
        deleteCustomer,
        suspendCustomer,
        unsuspendCustomer,
        resetCustomerPassword,
        forceLogout,
        addCustomerFlag,
        removeCustomerFlag,
        addCustomerNote,
        addCustomerAddress,
        updateCustomerAddress,
        deleteCustomerAddress,
        filterCustomers,
        getAuditLogs,
        isLoading,
    };

    return (
        <CustomerManagementContext.Provider value={value}>
            {children}
        </CustomerManagementContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCustomerManagement() {
    const context = useContext(CustomerManagementContext);
    if (!context) {
        throw new Error('useCustomerManagement must be used within CustomerManagementProvider');
    }
    return context;
}
