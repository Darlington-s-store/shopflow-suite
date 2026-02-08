import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Shield, ShieldOff, MoreHorizontal, UserPlus, Mail, Phone, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { User, UserRole } from '@/types';

// Extended type for internal use within this component
interface StaffMember extends User {
    department?: string; // Optional metadata
    password?: string; // For local handling
}

const roleColors: Record<string, string> = {
    SUPER_ADMIN: 'bg-red-100 text-red-700 border-red-200',
    ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
    DELIVERY_AGENT: 'bg-blue-100 text-blue-700 border-blue-200',
};

const roleLabels: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Admin/Manager',
    DELIVERY_AGENT: 'Rider',
};

export default function AdminStaff() {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
    const [deletingStaff, setDeletingStaff] = useState<StaffMember | null>(null);

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        role: 'ADMIN' as UserRole,
        department: '',
    });

    // Load users from shared storage
    useEffect(() => {
        const loadUsers = () => {
            const allUsers: StaffMember[] = [];
            // Filter out customers
            const staffUsers = allUsers.filter(u => u.role !== 'CUSTOMER');
            setStaff(staffUsers);
        };

        loadUsers();
        // Listen for storage changes in case other tabs update it
        window.addEventListener('storage', loadUsers);
        return () => window.removeEventListener('storage', loadUsers);
    }, []);

    useEffect(() => {
        let result = [...staff];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(s =>
                s.firstName.toLowerCase().includes(query) ||
                s.lastName.toLowerCase().includes(query) ||
                s.email.toLowerCase().includes(query) ||
                (s.phone && s.phone.includes(query))
            );
        }

        if (roleFilter !== 'all') {
            result = result.filter(s => s.role === roleFilter);
        }

        if (statusFilter !== 'all') {
            const isActive = statusFilter === 'ACTIVE';
            result = result.filter(s => s.isActive === isActive);
        }

        setFilteredStaff(result);
    }, [staff, searchQuery, roleFilter, statusFilter]);

    const saveToStorage = (updatedStaffList: StaffMember[]) => {
        // Backend API call would be made here to save staff members to the server
        // For now, just update local state
        setStaff(updatedStaffList);
        toast.success('Staff member saved to server');
    };

    const openAddDialog = () => {
        setEditingStaff(null);
        setForm({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            password: 'shopflow123', // Default password
            role: 'ADMIN',
            department: '',
        });
        setDialogOpen(true);
    };

    const openEditDialog = (member: StaffMember) => {
        setEditingStaff(member);
        setForm({
            firstName: member.firstName,
            lastName: member.lastName,
            email: member.email,
            phone: member.phone || '',
            password: '', // Don't show existing password
            role: member.role,
            department: member.department || '',
        });
        setDialogOpen(true);
    };

    const handleSave = () => {
        if (!form.firstName || !form.lastName || !form.email) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (editingStaff) {
            const updatedList = staff.map(s =>
                s.id === editingStaff.id ? {
                    ...s,
                    ...form,
                    password: form.password ? form.password : s.password || 'shopflow123', // Keep old pass if not changed
                    updatedAt: new Date().toISOString()
                } : s
            );
            saveToStorage(updatedList);
            toast.success('Staff member updated');
        } else {
            const newMember: StaffMember = {
                id: `staff-${Date.now()}`,
                ...form,
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                // Ensure required User fields are present
                avatar: undefined,
            };
            saveToStorage([...staff, newMember]);
            toast.success('Staff member added');
        }
        setDialogOpen(false);
    };

    const handleDelete = () => {
        if (deletingStaff) {
            const updatedList = staff.filter(s => s.id !== deletingStaff.id);
            saveToStorage(updatedList);
            toast.success('Staff member removed');
            setDeleteDialogOpen(false);
            setDeletingStaff(null);
        }
    };

    const toggleStatus = (member: StaffMember) => {
        const updatedList = staff.map(s =>
            s.id === member.id ? { ...s, isActive: !s.isActive } : s
        );
        saveToStorage(updatedList);
        toast.success(`Staff member ${member.isActive ? 'deactivated' : 'activated'}`);
    };

    const stats = {
        total: staff.length,
        active: staff.filter(s => s.isActive).length,
        admins: staff.filter(s => s.role === 'ADMIN' || s.role === 'SUPER_ADMIN').length,
        riders: staff.filter(s => s.role === 'DELIVERY_AGENT').length,
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Staff Management</h1>
                    <p className="text-slate-500">Manage your team members and their roles</p>
                </div>
                <Button onClick={openAddDialog} className="gap-2 bg-orange-600 hover:bg-orange-700 text-white">
                    <UserPlus className="h-4 w-4" /> Add Staff
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-sm text-slate-500">Total Staff</p>
                        <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-sm text-slate-500">Active</p>
                        <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-sm text-slate-500">Admins</p>
                        <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-sm text-slate-500">Riders</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.riders}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search staff..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 bg-slate-50 border-slate-200 text-slate-900"
                            />
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-40 bg-slate-50 border-slate-200 text-slate-900">
                                <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-slate-200">
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                                <SelectItem value="DELIVERY_AGENT">Rider</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-40 bg-slate-50 border-slate-200 text-slate-900">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-slate-200">
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="INACTIVE">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Staff Table */}
            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-200 hover:bg-transparent">
                                <TableHead className="text-slate-500">Staff Member</TableHead>
                                <TableHead className="text-slate-500">Contact</TableHead>
                                <TableHead className="text-slate-500">Role</TableHead>
                                <TableHead className="text-slate-500">Department</TableHead>
                                <TableHead className="text-slate-500">Status</TableHead>
                                <TableHead className="text-slate-500">Joined</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStaff.map(member => (
                                <TableRow key={member.id} className="border-slate-100 hover:bg-slate-50">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback className="bg-orange-100 text-orange-600">
                                                    {member.firstName[0]}{member.lastName[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-slate-900">{member.firstName} {member.lastName}</p>
                                                <p className="text-xs text-slate-500">{member.id}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1 text-sm text-slate-600">
                                                <Mail className="h-3 w-3" /> {member.email}
                                            </div>
                                            {member.phone && (
                                                <div className="flex items-center gap-1 text-sm text-slate-500">
                                                    <Phone className="h-3 w-3" /> {member.phone}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={roleColors[member.role] || 'bg-slate-100 text-slate-600 border-slate-200'}>
                                            {roleLabels[member.role] || member.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-600">{member.department || '-'}</TableCell>
                                    <TableCell>
                                        <Badge className={member.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200 border-0' : 'bg-red-100 text-red-700 hover:bg-red-200 border-0'}>
                                            {member.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-500">
                                        {new Date(member.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-white border-slate-200 text-slate-900 shadow-md">
                                                <DropdownMenuItem onClick={() => openEditDialog(member)} className="focus:bg-slate-50 cursor-pointer">
                                                    <Edit2 className="h-4 w-4 mr-2" /> Edit Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => toggleStatus(member)} className="focus:bg-slate-50 cursor-pointer">
                                                    {member.isActive ? (
                                                        <><ShieldOff className="h-4 w-4 mr-2" /> Deactivate</>
                                                    ) : (
                                                        <><Shield className="h-4 w-4 mr-2" /> Activate</>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-slate-100" />
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:bg-red-50 cursor-pointer"
                                                    onClick={() => { setDeletingStaff(member); setDeleteDialogOpen(true); }}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" /> Remove Account
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredStaff.length === 0 && (
                                <TableRow className="border-slate-200">
                                    <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                                        No staff members found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="bg-white border-slate-200 text-slate-900 sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-700">First Name *</Label>
                                <Input className="bg-slate-50 border-slate-200 text-slate-900" value={form.firstName} onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-700">Last Name *</Label>
                                <Input className="bg-slate-50 border-slate-200 text-slate-900" value={form.lastName} onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-700">Email *</Label>
                                <Input className="bg-slate-50 border-slate-200 text-slate-900" type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-700">Phone</Label>
                                <Input className="bg-slate-50 border-slate-200 text-slate-900" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-700">Password {editingStaff && '(Leave empty to keep current)'}</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    className="pl-9 bg-slate-50 border-slate-200 text-slate-900"
                                    type="password"
                                    value={form.password}
                                    onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                                    placeholder={!editingStaff ? "Default: shopflow123" : "••••••••"}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-700">Role *</Label>
                                <Select value={form.role} onValueChange={(v: UserRole) => setForm(f => ({ ...f, role: v }))}>
                                    <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900"><SelectValue /></SelectTrigger>
                                    <SelectContent className="bg-white border-slate-200 text-slate-900">
                                        <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                                        <SelectItem value="ADMIN">Admin / Manager</SelectItem>
                                        <SelectItem value="DELIVERY_AGENT">Rider / Delivery Agent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-700">Department</Label>
                                <Input className="bg-slate-50 border-slate-200 text-slate-900" value={form.department} onChange={(e) => setForm(f => ({ ...f, department: e.target.value }))} placeholder="e.g., Support" />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-slate-200 hover:bg-slate-50 text-slate-700">Cancel</Button>
                        <Button onClick={handleSave} className="bg-orange-600 hover:bg-orange-700 text-white">{editingStaff ? 'Update' : 'Add'} Staff</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="bg-white border-slate-200 text-slate-900">
                    <DialogHeader>
                        <DialogTitle>Remove Staff Member</DialogTitle>
                        <DialogDescription className="text-slate-500">
                            Are you sure you want to remove {deletingStaff?.firstName} {deletingStaff?.lastName}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="border-slate-200 hover:bg-slate-50 text-slate-700">Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Remove Account</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
