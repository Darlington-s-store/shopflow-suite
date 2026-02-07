import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MoreVertical, Eye, Ban, CheckCircle, Mail, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useCustomerManagement } from '@/contexts/CustomerManagementContext';
import { CustomerStatus, CustomerFlag } from '@/types/customer';
import { toast } from 'sonner';

export default function CustomerListPage() {
    const navigate = useNavigate();
    const {
        customers,
        filterCustomers,
        suspendCustomer,
        unsuspendCustomer,
        resetCustomerPassword,
        addCustomerFlag,
        removeCustomerFlag,
    } = useCustomerManagement();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<CustomerStatus | 'ALL'>('ALL');
    const [flagFilter, setFlagFilter] = useState<CustomerFlag | 'ALL'>('ALL');
    const [sortBy, setSortBy] = useState<'name' | 'totalOrders' | 'totalSpent' | 'createdAt'>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const filteredCustomers = filterCustomers({
        search: searchTerm,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        flags: flagFilter === 'ALL' ? undefined : [flagFilter],
        sortBy,
        sortOrder,
    });

    const handleSuspend = async (customerId: string, customerName: string) => {
        const reason = prompt(`Enter reason for suspending ${customerName}:`);
        if (reason) {
            const result = await suspendCustomer(customerId, reason);
            if (result.success) {
                toast.success('Customer suspended');
            }
        }
    };

    const handleUnsuspend = async (customerId: string, customerName: string) => {
        const reason = prompt(`Enter reason for unsuspending ${customerName}:`);
        if (reason) {
            const result = await unsuspendCustomer(customerId, reason);
            if (result.success) {
                toast.success('Customer account activated');
            }
        }
    };

    const handleResetPassword = async (customerId: string, customerEmail: string) => {
        if (confirm(`Send password reset link to ${customerEmail}?`)) {
            const result = await resetCustomerPassword(customerId);
            if (result.success) {
                toast.success('Password reset link sent');
            }
        }
    };

    const getStatusBadge = (status: CustomerStatus) => {
        const styles = {
            ACTIVE: 'bg-green-100 text-green-700 border-green-200',
            SUSPENDED: 'bg-red-100 text-red-700 border-red-200',
            DELETED: 'bg-slate-100 text-slate-700 border-slate-200',
        };
        return styles[status];
    };

    const getFlagBadge = (flag: CustomerFlag) => {
        const styles = {
            HIGH_RISK: 'bg-red-100 text-red-700 border-red-200',
            FREQUENT_RETURNS: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            VIP: 'bg-purple-100 text-purple-700 border-purple-200',
            BLOCKED_COD: 'bg-orange-100 text-orange-700 border-orange-200',
        };
        return styles[flag];
    };

    const getFlagLabel = (flag: CustomerFlag) => {
        const labels = {
            HIGH_RISK: 'High Risk',
            FREQUENT_RETURNS: 'Frequent Returns',
            VIP: 'VIP',
            BLOCKED_COD: 'COD Blocked',
        };
        return labels[flag];
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
                            <p className="text-sm text-slate-500 mt-1">Manage customer accounts and permissions</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="md:col-span-2 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by name, email, or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as CustomerStatus | 'ALL')}>
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Status</SelectItem>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                                <SelectItem value="DELETED">Deleted</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={flagFilter} onValueChange={(value) => setFlagFilter(value as CustomerFlag | 'ALL')}>
                            <SelectTrigger>
                                <SelectValue placeholder="Flags" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Flags</SelectItem>
                                <SelectItem value="HIGH_RISK">High Risk</SelectItem>
                                <SelectItem value="FREQUENT_RETURNS">Frequent Returns</SelectItem>
                                <SelectItem value="VIP">VIP</SelectItem>
                                <SelectItem value="BLOCKED_COD">COD Blocked</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sort By" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="name">Name</SelectItem>
                                <SelectItem value="totalOrders">Total Orders</SelectItem>
                                <SelectItem value="totalSpent">Total Spent</SelectItem>
                                <SelectItem value="createdAt">Join Date</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Customers Table */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    {/* Stats Bar */}
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <p className="text-sm text-slate-600">
                            Showing <span className="font-medium text-slate-900">{filteredCustomers.length}</span> of{' '}
                            <span className="font-medium text-slate-900">{customers.length}</span> customers
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                            <span className="text-slate-600">
                                Active: <span className="font-medium text-green-600">
                                    {customers.filter(c => c.status === 'ACTIVE').length}
                                </span>
                            </span>
                            <span className="text-slate-600">
                                Suspended: <span className="font-medium text-red-600">
                                    {customers.filter(c => c.status === 'SUSPENDED').length}
                                </span>
                            </span>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                                        Orders
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                                        Total Spent
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                                        Flags
                                    </th>
                                    <th className="text-right px-6 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                                {filteredCustomers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Filter className="h-12 w-12 text-slate-300" />
                                                <p className="text-slate-500">No customers found</p>
                                                <p className="text-sm text-slate-400">Try adjusting your filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCustomers.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                                                        <span className="text-orange-600 font-medium text-sm">
                                                            {customer.firstName[0]}{customer.lastName[0]}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">
                                                            {customer.firstName} {customer.lastName}
                                                        </p>
                                                        <p className="text-sm text-slate-500">
                                                            Joined {new Date(customer.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-sm text-slate-900">{customer.email}</p>
                                                    <p className="text-sm text-slate-500">{customer.phone}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-slate-900">{customer.totalOrders}</span>
                                                    <span className="text-xs text-slate-500">
                                                        {customer.successfulDeliveries} successful
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-slate-900">
                                                    GHS {customer.totalSpent.toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className={getStatusBadge(customer.status)}>
                                                    {customer.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {customer.flags.length === 0 ? (
                                                        <span className="text-xs text-slate-400">None</span>
                                                    ) : (
                                                        customer.flags.map((flag) => (
                                                            <Badge
                                                                key={flag}
                                                                variant="outline"
                                                                className={`${getFlagBadge(flag)} text-xs`}
                                                            >
                                                                {getFlagLabel(flag)}
                                                            </Badge>
                                                        ))
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => navigate(`/admin/customers/${customer.id}`)}>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        {customer.status === 'ACTIVE' ? (
                                                            <DropdownMenuItem
                                                                onClick={() => handleSuspend(customer.id, `${customer.firstName} ${customer.lastName}`)}
                                                                className="text-red-600 focus:text-red-600"
                                                            >
                                                                <Ban className="h-4 w-4 mr-2" />
                                                                Suspend Account
                                                            </DropdownMenuItem>
                                                        ) : customer.status === 'SUSPENDED' ? (
                                                            <DropdownMenuItem
                                                                onClick={() => handleUnsuspend(customer.id, `${customer.firstName} ${customer.lastName}`)}
                                                                className="text-green-600 focus:text-green-600"
                                                            >
                                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                                Activate Account
                                                            </DropdownMenuItem>
                                                        ) : null}
                                                        <DropdownMenuItem onClick={() => handleResetPassword(customer.id, customer.email)}>
                                                            <Mail className="h-4 w-4 mr-2" />
                                                            Reset Password
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
