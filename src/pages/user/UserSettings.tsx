import { useState, useEffect } from 'react';
import { Bell, Mail, Shield, Eye, EyeOff, Key, Smartphone, Moon, Sun, Globe, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationSettings {
    orderUpdates: boolean;
    promotions: boolean;
    newsletter: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
}

interface PrivacySettings {
    showProfile: boolean;
    showOrders: boolean;
    allowReviewsPublic: boolean;
}

interface Settings {
    notifications: NotificationSettings;
    privacy: PrivacySettings;
    language: string;
    theme: 'light' | 'dark' | 'system';
    currency: string;
}

export default function UserSettings() {
    const { user, token } = useAuth();
    const [settings, setSettings] = useState<Settings>({
        notifications: {
            orderUpdates: true,
            promotions: true,
            newsletter: false,
            smsNotifications: true,
            pushNotifications: false,
        },
        privacy: {
            showProfile: true,
            showOrders: false,
            allowReviewsPublic: true,
        },
        language: 'en',
        theme: 'system',
        currency: 'GHS',
    });

    const [passwordDialog, setPasswordDialog] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    // TODO: replace with API call to fetch user settings


    const saveSettings = (newSettings: Settings) => {
        setSettings(newSettings);
        localStorage.setItem('shopflow_user_settings', JSON.stringify(newSettings));
        toast.success('Settings saved');
    };

    const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
        saveSettings({
            ...settings,
            notifications: { ...settings.notifications, [key]: value }
        });
    };

    const handlePrivacyChange = (key: keyof PrivacySettings, value: boolean) => {
        saveSettings({
            ...settings,
            privacy: { ...settings.privacy, [key]: value }
        });
    };

    const handleThemeChange = (theme: Settings['theme']) => {
        saveSettings({ ...settings, theme });
        // In a real app, you'd apply the theme here
    };

    const handleLanguageChange = (language: string) => {
        saveSettings({ ...settings, language });
    };

    const handlePasswordChange = async () => {
        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            toast.error('Please fill in all fields');
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        if (passwordForm.newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const res = await fetch(`${apiUrl}/auth/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                toast.success('Password changed successfully');
                setPasswordDialog(false);
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                toast.error(data.error || 'Failed to change password');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your account preferences</p>
            </div>

            {/* Notification Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" /> Notifications
                    </CardTitle>
                    <CardDescription>Choose how you want to receive updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Order Updates</Label>
                            <p className="text-sm text-muted-foreground">Receive notifications about your order status</p>
                        </div>
                        <Switch
                            checked={settings.notifications.orderUpdates}
                            onCheckedChange={(v) => handleNotificationChange('orderUpdates', v)}
                        />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Promotions & Deals</Label>
                            <p className="text-sm text-muted-foreground">Get notified about sales and special offers</p>
                        </div>
                        <Switch
                            checked={settings.notifications.promotions}
                            onCheckedChange={(v) => handleNotificationChange('promotions', v)}
                        />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Newsletter</Label>
                            <p className="text-sm text-muted-foreground">Weekly updates about new products</p>
                        </div>
                        <Switch
                            checked={settings.notifications.newsletter}
                            onCheckedChange={(v) => handleNotificationChange('newsletter', v)}
                        />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <Smartphone className="h-4 w-4" />
                                <Label>SMS Notifications</Label>
                            </div>
                            <p className="text-sm text-muted-foreground">Receive updates via SMS</p>
                        </div>
                        <Switch
                            checked={settings.notifications.smsNotifications}
                            onCheckedChange={(v) => handleNotificationChange('smsNotifications', v)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" /> Privacy
                    </CardTitle>
                    <CardDescription>Control your privacy settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Public Profile</Label>
                            <p className="text-sm text-muted-foreground">Allow others to see your profile</p>
                        </div>
                        <Switch
                            checked={settings.privacy.showProfile}
                            onCheckedChange={(v) => handlePrivacyChange('showProfile', v)}
                        />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Public Reviews</Label>
                            <p className="text-sm text-muted-foreground">Show your reviews with your name</p>
                        </div>
                        <Switch
                            checked={settings.privacy.allowReviewsPublic}
                            onCheckedChange={(v) => handlePrivacyChange('allowReviewsPublic', v)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Security */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" /> Security
                    </CardTitle>
                    <CardDescription>Manage your security settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="space-y-0.5">
                            <Label>Password</Label>
                            <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
                        </div>
                        <Button variant="outline" onClick={() => setPasswordDialog(true)}>
                            Change Password
                        </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="space-y-0.5">
                            <Label>Two-Factor Authentication</Label>
                            <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                        </div>
                        <Button variant="outline" disabled>
                            Coming Soon
                        </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="space-y-0.5">
                            <Label>Active Sessions</Label>
                            <p className="text-sm text-muted-foreground">Manage devices logged into your account</p>
                        </div>
                        <Button variant="outline" disabled>
                            View Sessions
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" /> Preferences
                    </CardTitle>
                    <CardDescription>Customize your experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Theme</Label>
                            <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                        </div>
                        <Select value={settings.theme} onValueChange={(v: Settings['theme']) => handleThemeChange(v)}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">
                                    <div className="flex items-center gap-2">
                                        <Sun className="h-4 w-4" /> Light
                                    </div>
                                </SelectItem>
                                <SelectItem value="dark">
                                    <div className="flex items-center gap-2">
                                        <Moon className="h-4 w-4" /> Dark
                                    </div>
                                </SelectItem>
                                <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Language</Label>
                            <p className="text-sm text-muted-foreground">Select your preferred language</p>
                        </div>
                        <Select value={settings.language} onValueChange={handleLanguageChange}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="tw">Twi</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Currency</Label>
                            <p className="text-sm text-muted-foreground">Display prices in your currency</p>
                        </div>
                        <Select value={settings.currency} onValueChange={(v) => saveSettings({ ...settings, currency: v })}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="GHS">GH₵ (Cedi)</SelectItem>
                                <SelectItem value="USD">$ (Dollar)</SelectItem>
                                <SelectItem value="EUR">€ (Euro)</SelectItem>
                                <SelectItem value="GBP">£ (Pound)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>Irreversible actions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/5">
                        <div className="space-y-0.5">
                            <Label>Delete Account</Label>
                            <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                        </div>
                        <Button variant="destructive" disabled>
                            Delete Account
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Password Dialog */}
            <Dialog open={passwordDialog} onOpenChange={setPasswordDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Current Password</Label>
                            <div className="relative">
                                <Input
                                    type={showPasswords.current ? 'text' : 'password'}
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0"
                                    onClick={() => setShowPasswords(s => ({ ...s, current: !s.current }))}
                                >
                                    {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>New Password</Label>
                            <div className="relative">
                                <Input
                                    type={showPasswords.new ? 'text' : 'password'}
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0"
                                    onClick={() => setShowPasswords(s => ({ ...s, new: !s.new }))}
                                >
                                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Confirm New Password</Label>
                            <div className="relative">
                                <Input
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0"
                                    onClick={() => setShowPasswords(s => ({ ...s, confirm: !s.confirm }))}
                                >
                                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setPasswordDialog(false)}>Cancel</Button>
                        <Button onClick={handlePasswordChange}>Change Password</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
