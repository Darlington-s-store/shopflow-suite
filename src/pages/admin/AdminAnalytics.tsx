import { useState, useRef } from 'react';
import { Download, FileSpreadsheet, FileText, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useOrders } from '@/contexts/OrderContext';
import { toast } from 'sonner';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AdminAnalytics() {
    const { allOrders } = useOrders();
    const [dateRange, setDateRange] = useState('30d');
    const chartRef = useRef<HTMLDivElement>(null);

    // Calculate analytics data - only count paid/successful orders
    const paidOrders = allOrders.filter(o => o.payment?.status === 'SUCCESS');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = allOrders.length;
    const paidOrdersCount = paidOrders.length;
    const completedOrders = allOrders.filter(o => o.status === 'DELIVERED').length;
    const avgOrderValue = paidOrdersCount > 0 ? totalRevenue / paidOrdersCount : 0;

    // Generate chart data
    const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        const dateStr = date.toISOString().split('T')[0];
        const dayOrders = allOrders.filter(o => o.createdAt.startsWith(dateStr));
        return {
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            revenue: dayOrders.filter(o => o.payment?.status === 'SUCCESS').reduce((sum, o) => sum + o.total, 0),
            orders: dayOrders.length,
        };
    });

    // Order status distribution
    const statusData = [
        { name: 'Delivered', value: allOrders.filter(o => o.status === 'DELIVERED').length },
        { name: 'Processing', value: allOrders.filter(o => ['PROCESSING', 'PACKED'].includes(o.status)).length },
        { name: 'Shipping', value: allOrders.filter(o => ['ASSIGNED_TO_DELIVERY', 'OUT_FOR_DELIVERY'].includes(o.status)).length },
        { name: 'Pending', value: allOrders.filter(o => o.status === 'PENDING_PAYMENT').length },
        { name: 'Cancelled', value: allOrders.filter(o => o.status === 'CANCELLED').length },
    ].filter(s => s.value > 0);

    // Top products
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    allOrders.forEach(order => {
        order.items.forEach(item => {
            if (!productSales[item.productId]) {
                productSales[item.productId] = { name: item.productName, quantity: 0, revenue: 0 };
            }
            productSales[item.productId].quantity += item.quantity;
            productSales[item.productId].revenue += item.price * item.quantity;
        });
    });
    const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    // Export functions
    const exportToCSV = () => {
        const headers = ['Date', 'Revenue', 'Orders'];
        const rows = last30Days.map(d => [d.date, d.revenue, d.orders]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('CSV exported successfully!');
    };

    const exportToPDF = () => {
        // Create a simple text-based PDF content
        const content = `
SHOPFLOW ANALYTICS REPORT
Generated: ${new Date().toLocaleString()}

SUMMARY
=======
Total Revenue: GH₵${totalRevenue.toLocaleString()}
Total Orders: ${totalOrders}
Completed Orders: ${completedOrders}
Average Order Value: GH₵${avgOrderValue.toLocaleString()}

TOP PRODUCTS
============
${topProducts.map((p, i) => `${i + 1}. ${p.name} - GH₵${p.revenue.toLocaleString()} (${p.quantity} sold)`).join('\n')}

DAILY DATA (Last 30 Days)
=========================
${last30Days.map(d => `${d.date}: GH₵${d.revenue.toLocaleString()} - ${d.orders} orders`).join('\n')}
    `;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Report exported successfully!');
    };

    const stats = [
        { label: 'Total Revenue', value: `GH₵${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, color: 'from-green-500 to-emerald-600', change: '+12.5%', up: true },
        { label: 'Total Orders', value: totalOrders.toString(), icon: ShoppingCart, color: 'from-blue-500 to-indigo-600', change: '+8.2%', up: true },
        { label: 'Avg Order Value', value: `GH₵${avgOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: TrendingUp, color: 'from-purple-500 to-pink-600', change: '+4.1%', up: true },
        { label: 'Completion Rate', value: `${totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(0) : 0}%`, icon: Package, color: 'from-orange-500 to-red-500', change: '-2.3%', up: false },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
                    <p className="text-slate-500">Track your store performance</p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="w-[150px] bg-white border-slate-200 text-slate-900">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 text-slate-900">
                            <SelectItem value="7d">Last 7 days</SelectItem>
                            <SelectItem value="30d">Last 30 days</SelectItem>
                            <SelectItem value="90d">Last 90 days</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" className="gap-2 border-slate-200 text-slate-600 hover:bg-slate-50" onClick={exportToCSV}>
                        <FileSpreadsheet className="h-4 w-4" />
                        Excel
                    </Button>
                    <Button variant="outline" className="gap-2 border-slate-200 text-slate-600 hover:bg-slate-50" onClick={exportToPDF}>
                        <FileText className="h-4 w-4" />
                        PDF
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                {stats.map((stat, i) => (
                    <Card key={i} className="bg-white border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col">
                                <div className="flex items-start justify-between mb-2">
                                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                    <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-sm`}>
                                        <stat.icon className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                                    <div className={`flex items-center gap-1 mt-1 text-sm ${stat.up ? 'text-green-600' : 'text-red-600'}`}>
                                        {stat.up ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                        <span className="font-medium">{stat.change}</span>
                                        <span className="text-slate-400 text-xs ml-1">last 30 days</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" ref={chartRef}>
                {/* Revenue Chart */}
                <Card className="bg-white border-slate-200 shadow-sm lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-slate-900">Revenue Overview</CardTitle>
                        <CardDescription className="text-slate-500">Daily revenue for the last 30 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={last30Days}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} />
                                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} tickFormatter={(v) => `GH₵${v.toLocaleString()}`} width={80} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}
                                        labelStyle={{ color: '#0f172a' }}
                                        formatter={(value: number) => [`GH₵${value.toLocaleString()}`, 'Revenue']}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Orders Chart */}
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-slate-900">Orders Trend</CardTitle>
                        <CardDescription className="text-slate-500">Daily order count</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={last30Days.slice(-14)}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}
                                        labelStyle={{ color: '#0f172a' }}
                                    />
                                    <Bar dataKey="orders" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Order Status Distribution */}
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-slate-900">Order Status</CardTitle>
                        <CardDescription className="text-slate-500">Distribution by status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {statusData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}
                                        labelStyle={{ color: '#0f172a' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-slate-600">{value}</span>} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Products */}
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-slate-900">Top Selling Products</CardTitle>
                    <CardDescription className="text-slate-500">By revenue</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {topProducts.length === 0 ? (
                            <p className="text-center text-slate-500 py-8">No product sales data yet</p>
                        ) : (
                            topProducts.map((product, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className="h-10 w-10 shrink-0 rounded-lg bg-orange-100 flex items-center justify-center text-orange-700 font-bold border border-orange-200">
                                        #{i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-900 truncate">{product.name}</p>
                                        <p className="text-sm text-slate-500">{product.quantity} units sold</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-900">GH₵{product.revenue.toLocaleString()}</p>
                                        <p className="text-xs text-green-600 font-medium">Revenue</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
