import { Bell, Menu, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface AdminTopBarProps {
    onSidebarOpen: () => void;
}

interface AdminNotification {
    id: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    type?: string;
    orderId?: string;
}

export function AdminTopBar({ onSidebarOpen }: AdminTopBarProps) {
    const { user, logout } = useAuth();
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<AdminNotification[]>([]);

    useEffect(() => {
        const loadNotifications = () => {
            // Notifications no longer stored in localStorage; load from backend when implemented
            setNotifications([]);
        };

        loadNotifications();
        // Poll for notifications every 30s or on specific events if we had a proper event bus
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markNotificationsRead = () => {
        const updated = notifications.map(n => ({ ...n, isRead: true }));
        setNotifications(updated);
        localStorage.setItem('techmart_admin_notifications', JSON.stringify(updated));
    };

    return (
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <Button variant="ghost" size="icon" className="lg:hidden text-slate-900" onClick={onSidebarOpen}>
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open sidebar</span>
            </Button>

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                <form className="relative flex flex-1" action="#" method="GET">
                    <label htmlFor="search-field" className="sr-only">
                        Search
                    </label>
                    <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-slate-400" aria-hidden="true" />
                    <Input
                        id="search-field"
                        className="block h-full w-full border-0 bg-transparent py-0 pl-8 pr-0 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm"
                        placeholder="Search..."
                        type="search"
                        name="search"
                    />
                </form>
                <div className="flex items-center gap-x-4 lg:gap-x-6">
                    {/* Notifications */}
                    <DropdownMenu open={showNotifications} onOpenChange={(open) => {
                        setShowNotifications(open);
                        if (open) markNotificationsRead();
                    }}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-slate-600">
                                <Bell className="h-6 w-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80 bg-white border-slate-200 text-slate-900 shadow-lg">
                            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-100" />
                            <div className="max-h-[60vh] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-slate-500">
                                        No new notifications
                                    </div>
                                ) : (
                                    notifications.slice(0, 5).map(notification => (
                                        <div key={notification.id} className={`p-4 border-b border-slate-100 last:border-0 ${notification.isRead ? 'opacity-70' : ''}`}>
                                            <p className="text-sm font-medium text-slate-900">{notification.title}</p>
                                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{notification.message}</p>
                                            <p className="text-[10px] text-slate-400 mt-2">{new Date(notification.createdAt).toLocaleString()}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="h-6 w-px bg-slate-200" aria-hidden="true" />

                    {/* Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="-m-1.5 flex items-center p-1.5 hover:bg-slate-50 rounded-lg">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user?.avatar} />
                                    <AvatarFallback className="bg-orange-100 text-orange-600 border border-orange-200">
                                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="hidden lg:flex lg:items-center">
                                    <span className="ml-4 text-sm font-semibold leading-6 text-slate-900" aria-hidden="true">
                                        {user?.firstName} {user?.lastName}
                                    </span>
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border-slate-200 text-slate-900 shadow-lg">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-100" />
                            <DropdownMenuItem className="focus:bg-slate-50 cursor-pointer">Profile</DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-slate-50 cursor-pointer">Settings</DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-100" />
                            <DropdownMenuItem className="focus:bg-red-50 focus:text-red-600 text-red-600 cursor-pointer" onClick={logout}>
                                Sign out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
