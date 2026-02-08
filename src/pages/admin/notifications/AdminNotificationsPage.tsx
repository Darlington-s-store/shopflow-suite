import { useState, useEffect } from 'react';
import { Bell, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

export function AdminNotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const response = await fetch(`${apiUrl}/admin/notifications`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications || []);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
            toast({ title: 'Error', description: 'Failed to load notifications', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            const response = await fetch(`${apiUrl}/admin/notifications/${notificationId}/read`, {
                method: 'PUT',
                credentials: 'include'
            });
            if (response.ok) {
                loadNotifications();
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to mark as read', variant: 'destructive' });
        }
    };

    const handleDelete = async (notificationId: string) => {
        try {
            const response = await fetch(`${apiUrl}/admin/notifications/${notificationId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (response.ok) {
                setNotifications(notifications.filter(n => n.id !== notificationId));
                toast({ title: 'Success', description: 'Notification deleted' });
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete notification', variant: 'destructive' });
        }
    };

    if (loading) return <div className="p-6">Loading...</div>;

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Notifications</h1>
                <span className="text-sm text-slate-600">{unreadCount} unread</span>
            </div>

            <div className="space-y-3">
                {notifications.length === 0 ? (
                    <Card className="border-slate-200">
                        <CardContent className="p-8 text-center">
                            <Bell className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">No notifications</p>
                        </CardContent>
                    </Card>
                ) : (
                    notifications.map(notif => (
                        <Card key={notif.id} className={`border-slate-200 ${!notif.isRead ? 'bg-orange-50 border-orange-200' : ''}`}>
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    <Bell className="h-5 w-5 text-orange-600 mt-1 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-slate-900">{notif.title}</h3>
                                        <p className="text-sm text-slate-600 mt-1">{notif.message}</p>
                                        <p className="text-xs text-slate-500 mt-2">{new Date(notif.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {!notif.isRead && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleMarkAsRead(notif.id)}
                                                className="text-orange-600 hover:bg-orange-100"
                                            >
                                                <Check className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(notif.id)}
                                            className="text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
