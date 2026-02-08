import { useState, useEffect, useCallback } from 'react';
import { Bell, Package, CreditCard, Truck, Star, Trash2, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

type NotificationType = 'ORDER' | 'PAYMENT' | 'DELIVERY' | 'REVIEW' | 'PROMO';

interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    orderId?: string;
    link?: string;
}

const typeIcons: Record<NotificationType, React.ElementType> = {
    ORDER: Package,
    PAYMENT: CreditCard,
    DELIVERY: Truck,
    REVIEW: Star,
    PROMO: Bell,
};

const typeColors: Record<NotificationType, string> = {
    ORDER: 'bg-blue-500/20 text-blue-500',
    PAYMENT: 'bg-green-500/20 text-green-500',
    DELIVERY: 'bg-purple-500/20 text-purple-500',
    REVIEW: 'bg-yellow-500/20 text-yellow-500',
    PROMO: 'bg-accent/20 text-accent',
};

export default function UserNotifications() {
    const { token } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const loadNotifications = useCallback(async () => {
        if (!token) return;
        try {
            const res = await fetch(`${apiUrl}/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    const mapped = data.notifications.map((n: Notification) => ({
                        ...n,
                        link: n.orderId ? `/dashboard/orders/${n.orderId}` : undefined
                    }));
                    setNotifications(mapped);
                }
            }
        } catch (error) {
            console.error('Expected load notifications error:', error);
        }
    }, [token, apiUrl]);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    // Derived state
    const unreadCount = notifications.filter(n => !n.isRead).length;
    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.isRead)
        : notifications;

    const markAsRead = async (id: string) => {
        try {
            await fetch(`${apiUrl}/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Optimistic update
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            toast.error('Failed to update notification');
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch(`${apiUrl}/notifications/read-all`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success('All notifications marked as read');
        } catch (error) {
            toast.error('Failed to update notifications');
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            await fetch(`${apiUrl}/notifications/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(prev => prev.filter(n => n.id !== id));
            toast.success('Notification deleted');
        } catch (error) {
            toast.error('Failed to delete notification');
        }
    };

    const clearAll = async () => {
        try {
            await fetch(`${apiUrl}/notifications`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications([]);
            toast.success('All notifications cleared');
        } catch (error) {
            toast.error('Failed to clear notifications');
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            if (hours === 0) {
                const minutes = Math.floor(diff / (1000 * 60));
                return `${minutes}m ago`;
            }
            return `${hours}h ago`;
        }
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Notifications</h1>
                    <p className="text-muted-foreground">Stay updated on your orders and promotions</p>
                </div>
                {unreadCount > 0 && (
                    <Badge variant="secondary">{unreadCount} unread</Badge>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex gap-2">
                    <Button
                        variant={filter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('all')}
                    >
                        All ({notifications.length})
                    </Button>
                    <Button
                        variant={filter === 'unread' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('unread')}
                    >
                        Unread ({unreadCount})
                    </Button>
                </div>
                <div className="flex gap-2">
                    {unreadCount > 0 && (
                        <Button variant="outline" size="sm" onClick={markAllAsRead}>
                            <CheckCheck className="h-4 w-4 mr-1" /> Mark all read
                        </Button>
                    )}
                    {notifications.length > 0 && (
                        <Button variant="outline" size="sm" onClick={clearAll} className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4 mr-1" /> Clear all
                        </Button>
                    )}
                </div>
            </div>

            {/* Notifications List */}
            {filteredNotifications.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No notifications</h3>
                        <p className="text-muted-foreground">
                            {filter === 'unread' ? "You've read all your notifications" : "You don't have any notifications yet"}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredNotifications.map(notification => {
                        const Icon = typeIcons[notification.type] || Bell;
                        return (
                            <Card
                                key={notification.id}
                                className={`transition-colors ${!notification.isRead ? 'border-primary/30 bg-primary/5' : ''}`}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${typeColors[notification.type] || 'bg-gray-100'}`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h4 className={`font-medium ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                        {notification.title}
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground mt-0.5">{notification.message}</p>
                                                </div>
                                                <p className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {formatDate(notification.createdAt)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 mt-3">
                                                {!notification.isRead && (
                                                    <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                                                        <Check className="h-3 w-3 mr-1" /> Mark read
                                                    </Button>
                                                )}
                                                {notification.link && (
                                                    <Button variant="outline" size="sm" asChild>
                                                        <a href={notification.link}>View</a>
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-muted-foreground hover:text-destructive ml-auto"
                                                    onClick={() => deleteNotification(notification.id)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
