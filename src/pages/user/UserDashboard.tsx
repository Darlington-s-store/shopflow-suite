import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Heart,
    Star,
    User,
    MapPin,
    Settings,
    LogOut,
    ChevronRight,
    Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useReviews } from '@/contexts/ReviewContext';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Orders', href: '/dashboard/orders', icon: Package },
    { name: 'Wishlist', href: '/dashboard/wishlist', icon: Heart },
    { name: 'My Reviews', href: '/dashboard/reviews', icon: Star },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'Addresses', href: '/dashboard/addresses', icon: MapPin },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function UserDashboard() {
    const { user, logout } = useAuth();
    const { orders } = useOrders();
    const { items: wishlistItems } = useWishlist();
    const { getUserReviews } = useReviews();
    const location = useLocation();
    const navigate = useNavigate();

    const reviews = getUserReviews();
    const pendingOrders = orders.filter(o =>
        !['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(o.status)
    ).length;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Check if we're on the main dashboard page
    const isMainDashboard = location.pathname === '/dashboard';

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="lg:w-72 shrink-0">
                        <Card className="sticky top-24 overflow-hidden border-slate-200 bg-white shadow-sm">
                            {/* User Profile Section */}
                            <div className="relative">
                                <div className="h-20 bg-gradient-to-r from-orange-600 to-orange-500" />
                                <div className="px-6 pb-6">
                                    <div className="relative -mt-10 flex flex-col items-center">
                                        <Avatar className="h-20 w-20 border-4 border-white shadow-md">
                                            <AvatarImage src={user?.avatar} />
                                            <AvatarFallback className="text-lg bg-orange-100 text-orange-600">
                                                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <h2 className="mt-4 text-lg font-bold text-slate-900">
                                            {user?.firstName} {user?.lastName}
                                        </h2>
                                        <p className="text-sm text-slate-500">{user?.email}</p>
                                        <Badge variant="secondary" className="mt-2 bg-orange-100 text-orange-700 hover:bg-orange-200 border-0">
                                            Customer
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-slate-100" />

                            {/* Quick Stats */}
                            <CardContent className="p-4">
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                                        <p className="text-xl font-bold text-slate-900">{orders.length}</p>
                                        <p className="text-xs text-slate-500">Orders</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                                        <p className="text-xl font-bold text-slate-900">{wishlistItems.length}</p>
                                        <p className="text-xs text-slate-500">Wishlist</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                                        <p className="text-xl font-bold text-slate-900">{reviews.length}</p>
                                        <p className="text-xs text-slate-500">Reviews</p>
                                    </div>
                                </div>
                            </CardContent>

                            <Separator className="bg-slate-100" />

                            {/* Navigation */}
                            <nav className="p-3 space-y-1">
                                {navigation.map((item) => {
                                    const isActive = location.pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                                                ? 'bg-orange-50 text-orange-600 font-medium'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                }`}
                                        >
                                            <item.icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActive ? 'text-orange-600' : 'text-slate-400 group-hover:text-slate-600'
                                                }`} />
                                            <span>{item.name}</span>
                                            {item.name === 'My Orders' && pendingOrders > 0 && (
                                                <Badge
                                                    className={`ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs ${isActive ? 'bg-orange-200 text-orange-800' : 'bg-slate-100 text-slate-600'}`}
                                                >
                                                    {pendingOrders}
                                                </Badge>
                                            )}
                                            <ChevronRight className={`h-4 w-4 ml-auto transition-transform ${isActive ? 'translate-x-1 text-orange-400' : 'opacity-0 group-hover:opacity-100 text-slate-400 group-hover:translate-x-1'
                                                }`} />
                                        </Link>
                                    );
                                })}

                                <Separator className="my-2 bg-slate-100" />

                                <Button
                                    variant="ghost"
                                    onClick={handleLogout}
                                    className="w-full justify-start gap-3 px-4 py-3 text-slate-600 hover:text-red-600 hover:bg-red-50"
                                >
                                    <LogOut className="h-5 w-5" />
                                    <span className="font-medium">Logout</span>
                                </Button>
                            </nav>
                        </Card>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        {isMainDashboard ? <DashboardOverview /> : <Outlet />}
                    </main>
                </div>
            </div>
        </div>
    );
}

function DashboardOverview() {
    const { user } = useAuth();
    const { orders } = useOrders();
    const { items: wishlistItems, products: wishlistProducts } = useWishlist();
    const { getUserReviews } = useReviews();
    const navigate = useNavigate();

    const reviews = getUserReviews();
    const recentOrders = orders.slice(-5).reverse();
    const pendingOrders = orders.filter(o =>
        !['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(o.status)
    );
    const totalSpent = orders
        .filter(o => o.payment?.status === 'SUCCESS')
        .reduce((sum, o) => sum + o.total, 0);

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            PENDING_PAYMENT: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            PAID: 'bg-blue-100 text-blue-700 border-blue-200',
            PROCESSING: 'bg-blue-100 text-blue-700 border-blue-200',
            PACKED: 'bg-indigo-100 text-indigo-700 border-indigo-200',
            ASSIGNED_TO_DELIVERY: 'bg-purple-100 text-purple-700 border-purple-200',
            OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-700 border-orange-200',
            DELIVERED: 'bg-green-100 text-green-700 border-green-200',
            DELIVERY_FAILED: 'bg-red-100 text-red-700 border-red-200',
            CANCELLED: 'bg-slate-100 text-slate-700 border-slate-200',
            REFUNDED: 'bg-slate-100 text-slate-700 border-slate-200',
        };
        return colors[status] || 'bg-slate-100 text-slate-700 border-slate-200';
    };

    const formatStatus = (status: string) => {
        return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 p-8 text-white shadow-lg">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <div className="relative">
                    <div className="flex items-center gap-3 mb-2">
                        <Bell className="h-5 w-5 animate-pulse text-white/90" />
                        <span className="text-sm font-medium text-white/90">Welcome back!</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-2 text-white">
                        Hello, {user?.firstName}! 👋
                    </h1>
                    <p className="text-white/90 max-w-lg">
                        Here's what's happening with your account today. You have{' '}
                        <span className="font-bold text-white">{pendingOrders.length} pending orders</span> and{' '}
                        <span className="font-bold text-white">{wishlistItems.length} items</span> in your wishlist.
                    </p>
                </div>
                <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
                <div className="absolute -top-10 -right-20 h-32 w-32 rounded-full bg-orange-400/30 blur-2xl" />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="group hover:shadow-md transition-all duration-300 border-slate-200 bg-white shadow-sm overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Total Orders</p>
                                <p className="text-3xl font-bold text-slate-900">{orders.length}</p>
                                <p className="text-xs text-slate-500 mt-1">
                                    {pendingOrders.length} in progress
                                </p>
                            </div>
                            <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Package className="h-7 w-7 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="group hover:shadow-md transition-all duration-300 border-slate-200 bg-white shadow-sm overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Total Spent</p>
                                <p className="text-3xl font-bold text-slate-900">
                                    GH₵{totalSpent >= 1000000 ? (totalSpent / 1000000).toFixed(1) + 'M' : totalSpent >= 1000 ? (totalSpent / 1000).toFixed(0) + 'K' : totalSpent.toFixed(0)}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    This year
                                </p>
                            </div>
                            <div className="h-14 w-14 rounded-2xl bg-green-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span className="text-2xl font-bold text-green-600">GH₵</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="group hover:shadow-md transition-all duration-300 border-slate-200 bg-white shadow-sm overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Wishlist Items</p>
                                <p className="text-3xl font-bold text-slate-900">{wishlistItems.length}</p>
                                <p className="text-xs text-slate-500 mt-1">
                                    Saved products
                                </p>
                            </div>
                            <div className="h-14 w-14 rounded-2xl bg-pink-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Heart className="h-7 w-7 text-pink-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="group hover:shadow-md transition-all duration-300 border-slate-200 bg-white shadow-sm overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Reviews</p>
                                <p className="text-3xl font-bold text-slate-900">{reviews.length}</p>
                                <p className="text-xs text-slate-500 mt-1">
                                    Products reviewed
                                </p>
                            </div>
                            <div className="h-14 w-14 rounded-2xl bg-yellow-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Star className="h-7 w-7 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders */}
            <Card className="border-slate-200 bg-white shadow-sm">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Recent Orders</h2>
                            <p className="text-sm text-slate-500">Your latest purchases</p>
                        </div>
                        <Button variant="outline" onClick={() => navigate('/dashboard/orders')} className="text-slate-600 border-slate-200 hover:bg-slate-50">
                            View All
                        </Button>
                    </div>

                    {recentOrders.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                            <p className="text-slate-500">No orders yet</p>
                            <Button className="mt-4 bg-orange-600 hover:bg-orange-700 text-white" onClick={() => navigate('/products')}>
                                Start Shopping
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentOrders.map((order) => (
                                <div
                                    key={order.id}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors cursor-pointer group"
                                    onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                                >
                                    <div className="h-12 w-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                                        <Package className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-900">{order.orderNumber}</span>
                                            <Badge variant="outline" className={getStatusColor(order.status)}>
                                                {formatStatus(order.status)}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-slate-500">
                                            {order.items.length} item(s) • {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-900">GH₵{order.total.toLocaleString()}</p>
                                        <ChevronRight className="h-4 w-4 text-slate-400 ml-auto group-hover:translate-x-1 group-hover:text-orange-500 transition-all" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Wishlist Preview */}
            {wishlistProducts.length > 0 && (
                <Card className="border-slate-200 bg-white shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Wishlist</h2>
                                <p className="text-sm text-slate-500">Products you've saved</p>
                            </div>
                            <Button variant="outline" onClick={() => navigate('/dashboard/wishlist')} className="text-slate-600 border-slate-200 hover:bg-slate-50">
                                View All
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {wishlistProducts.slice(0, 4).map((product) => (
                                <div
                                    key={product.id}
                                    className="group cursor-pointer"
                                    onClick={() => navigate(`/product/${product.slug}`)}
                                >
                                    <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 mb-3 border border-slate-200">
                                        <img
                                            src={product.images[0]?.url}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <p className="font-medium text-sm text-slate-900 line-clamp-1 group-hover:text-orange-600 transition-colors">{product.name}</p>
                                    <p className="text-sm text-orange-600 font-bold">
                                        GH₵{product.variants[0]?.price.toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
