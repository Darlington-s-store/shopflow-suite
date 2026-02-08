import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Package, ShoppingCart, Users, BarChart3,
    Truck, Settings, LogOut, ChevronRight, Bell, Menu, X,
    Box, DollarSign, TrendingUp, Star, FolderTree, MessageSquare, CreditCard,
    UserCog, Tag, Zap, MessageCircle, Megaphone, Lightbulb, Globe, FileText, Image as ImageIcon
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { AdminTopBar } from '@/components/admin/AdminTopBar';

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Categories', href: '/admin/categories', icon: FolderTree },
    { name: 'Brands', href: '/admin/brands', icon: Tag },
    { name: 'Deals', href: '/admin/deals', icon: Megaphone },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Reviews', href: '/admin/reviews', icon: Star },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard },
    { name: 'Delivery', href: '/admin/delivery', icon: Truck },
    { name: 'Messages', href: '/admin/messages', icon: MessageCircle },
    { name: 'Notifications', href: '/admin/notifications', icon: Bell },
    { name: 'Chatbot', href: '/admin/chatbot', icon: Lightbulb },
    { name: 'Staff', href: '/admin/staff', icon: UserCog },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Website Content', href: '/admin/website-content', icon: Globe },
    { name: 'Pages & FAQs', href: '/admin/pages', icon: FileText },
    { name: 'Media & Banners', href: '/admin/media', icon: ImageIcon },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const { allOrders } = useOrders();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const pendingOrders = allOrders.filter(o =>
        ['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'PENDING_CONFIRMATION'].includes(o.status)
    ).length;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isMainDashboard = location.pathname === '/admin';

    return (
        <div className="min-h-screen bg-slate-100">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-orange-600 border-r border-orange-500 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full text-white">
                    {/* Logo */}
                    <div className="h-16 px-6 flex items-center justify-between border-b border-orange-500 bg-orange-700/20">
                        <Link to="/admin" className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
                                <span className="text-orange-600 font-bold text-lg">S</span>
                            </div>
                            <span className="text-xl font-bold text-white">ShopFlow</span>
                        </Link>
                        <Button variant="ghost" size="icon" className="lg:hidden text-white" onClick={() => setSidebarOpen(false)}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-400">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href ||
                                (item.href !== '/admin' && location.pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                                        ? 'bg-white text-orange-600 shadow-md'
                                        : 'text-orange-100 hover:bg-orange-700/50 hover:text-white'
                                        }`}
                                >
                                    <item.icon className={`h-5 w-5 ${isActive ? 'text-orange-600' : 'text-orange-200 group-hover:text-white'}`} />
                                    <span className="font-medium">{item.name}</span>
                                    {item.name === 'Orders' && pendingOrders > 0 && (
                                        <Badge className="ml-auto bg-white text-orange-600 hover:bg-orange-100">
                                            {pendingOrders}
                                        </Badge>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer / Meta */}
                    <div className="p-4 border-t border-orange-500 text-xs text-orange-200 text-center">
                        <p>Version 1.0.0</p>
                        <p>&copy; 2026 ShopFlow</p>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content Wrapper */}
            <div className="lg:pl-72 flex flex-col min-h-screen transition-all duration-300">
                <AdminTopBar onSidebarOpen={() => setSidebarOpen(true)} />

                <main className="flex-1 p-6 lg:p-8 bg-slate-50">
                    {isMainDashboard ? <AdminOverview /> : <Outlet />}
                </main>
            </div>
        </div>
    );
}

function AdminOverview() {
    const { allOrders } = useOrders();
    const navigate = useNavigate();

    const totalRevenue = allOrders
        .filter(o => o.payment?.status === 'SUCCESS')
        .reduce((sum, o) => sum + o.total, 0);

    const stats = [
        { label: 'Total Revenue', value: `GH₵${(totalRevenue / 1000000).toFixed(1)}M`, icon: DollarSign, color: 'bg-orange-100 text-orange-600', change: '+12.5%' },
        { label: 'Total Orders', value: allOrders.length.toString(), icon: ShoppingCart, color: 'bg-blue-100 text-blue-600', change: '+8.2%' },
        { label: 'Pending Orders', value: allOrders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status)).length.toString(), icon: Package, color: 'bg-yellow-100 text-yellow-600', change: '-3.1%' },
        { label: 'Completed', value: allOrders.filter(o => o.status === 'DELIVERED').length.toString(), icon: TrendingUp, color: 'bg-green-100 text-green-600', change: '+15.3%' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
                <p className="text-slate-500">Welcome back! Here's what's happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                {stats.map((stat, i) => (
                    <Card key={i} className="group relative bg-white border border-slate-100 hover:border-orange-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                        <div className={`absolute top-0 right-0 w-24 h-24 ${stat.color.split(' ')[0]} opacity-10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500`}></div>
                        <CardContent className="p-6 relative">
                            <div className="flex items-start justify-between">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                        <h3 className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">{stat.value}</h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                            {stat.change.startsWith('+') ? <TrendingUp className="h-3 w-3" /> : <TrendingUp className="h-3 w-3 rotate-180" />}
                                            {stat.change}
                                        </span>
                                        <span className="text-xs text-slate-400">vs last month</span>
                                    </div>
                                </div>
                                <div className={`h-12 w-12 rounded-xl ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Orders */}
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-slate-900">Recent Orders</h2>
                        <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50" onClick={() => navigate('/admin/orders')}>
                            View All
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {allOrders.slice(-5).reverse().map((order) => (
                            <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 shrink-0 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                                        <Package className="h-5 w-5 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">{order.orderNumber}</p>
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <span>{order.items.length} items</span>
                                            <span>•</span>
                                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between sm:block sm:text-right">
                                    <p className="font-semibold text-slate-900">GH₵{order.total.toLocaleString()}</p>
                                    <Badge variant="outline" className={`text-xs border-0 ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                            'bg-orange-100 text-orange-700'
                                        }`}>{order.status.replace(/_/g, ' ')}</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
