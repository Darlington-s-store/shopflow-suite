// Customer Account Management Types

export type CustomerStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';
export type CustomerFlag = 'HIGH_RISK' | 'FREQUENT_RETURNS' | 'VIP' | 'BLOCKED_COD';

export interface CustomerAddress {
    id: string;
    customerId: string;
    label: string; // "Home", "Office", etc.
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    region: string;
    postalCode?: string;
    country: string;
    isDefault: boolean;
    createdAt: Date;
}

export interface CustomerNote {
    id: string;
    customerId: string;
    adminId: string;
    adminName: string;
    note: string;
    createdAt: Date;
}

export interface Customer {
    id: string;

    // Basic Info
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar?: string;

    // Account Status
    status: CustomerStatus;
    emailVerified: boolean;
    phoneVerified: boolean;

    // Flags
    flags: CustomerFlag[];

    // Statistics
    totalOrders: number;
    totalSpent: number;
    failedDeliveries: number;
    successfulDeliveries: number;

    // Addresses
    addresses: CustomerAddress[];

    // Notes (Admin only)
    notes: CustomerNote[];

    // Metadata
    createdAt: Date;
    lastLogin?: Date;
    updatedAt: Date;
}

export interface CustomerFilters {
    search?: string; // Name, email, phone
    status?: CustomerStatus;
    flags?: CustomerFlag[];
    registeredAfter?: Date;
    registeredBefore?: Date;
    minOrders?: number;
    minSpent?: number;
    sortBy?: 'name' | 'email' | 'totalOrders' | 'totalSpent' | 'createdAt' | 'lastLogin';
    sortOrder?: 'asc' | 'desc';
}

export interface CustomerAccountAction {
    type: 'SUSPEND' | 'UNSUSPEND' | 'RESET_PASSWORD' | 'FORCE_LOGOUT' | 'UPDATE_INFO' | 'DELETE_ACCOUNT';
    customerId: string;
    adminId: string;
    reason?: string;
    metadata?: Record<string, string | number | boolean>;
}

// Audit Log
export interface AuditLog {
    id: string;
    action: string;
    entityType: 'CUSTOMER' | 'PRODUCT' | 'ORDER' | 'PAYMENT';
    entityId: string;
    adminId: string;
    adminName: string;
    changes?: Record<string, { old: unknown; new: unknown }>;
    reason?: string;
    ipAddress?: string;
    createdAt: Date;
}

// Customer Details View
export interface CustomerDetails extends Customer {
    recentOrders: Array<{
        id: string;
        orderNumber: string;
        total: number;
        status: string;
        createdAt: Date;
    }>;
    auditLogs: AuditLog[];
}
