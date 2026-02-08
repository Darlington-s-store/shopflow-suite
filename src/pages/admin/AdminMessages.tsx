import { useState, useEffect, useCallback } from 'react';
import { Search, Mail, Trash2, Eye, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Message {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'READ' | 'UNREAD' | 'ARCHIVED';
    created_at: string;
}

const statusColors: Record<string, string> = {
    READ: 'bg-green-100 text-green-700 border-0',
    UNREAD: 'bg-blue-100 text-blue-700 border-0',
    ARCHIVED: 'bg-slate-100 text-slate-700 border-0',
};

export default function AdminMessages() {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const [messages, setMessages] = useState<Message[]>([]);
    const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const loadMessages = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${apiUrl}/messages`, {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setMessages(data.messages || []);
            } else {
                toast.error('Failed to load messages');
            }
        } catch (error) {
            console.error('Error loading messages:', error);
            toast.error('Failed to load messages');
        } finally {
            setIsLoading(false);
        }
    }, [apiUrl]);

    useEffect(() => {
        loadMessages();
    }, [loadMessages]);

    useEffect(() => {
        if (!searchQuery) {
            setFilteredMessages(messages);
        } else {
            const query = searchQuery.toLowerCase();
            setFilteredMessages(messages.filter(m =>
                m.name.toLowerCase().includes(query) ||
                m.email.toLowerCase().includes(query) ||
                m.subject.toLowerCase().includes(query)
            ));
        }
    }, [messages, searchQuery]);

    const handleMarkAsRead = async (message: Message) => {
        try {
            const response = await fetch(`${apiUrl}/messages/${message.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status: 'READ' }),
            });

            if (response.ok) {
                await loadMessages();
                toast.success('Marked as read');
                if (selectedMessage?.id === message.id) {
                    setSelectedMessage(prev => prev ? { ...prev, status: 'READ' } : null);
                }
            } else {
                toast.error('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating message:', error);
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (message: Message) => {
        if (!confirm('Are you sure you want to delete this message?')) return;

        try {
            const response = await fetch(`${apiUrl}/messages/${message.id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                await loadMessages();
                toast.success('Message deleted');
                setDetailOpen(false);
            } else {
                toast.error('Failed to delete message');
            }
        } catch (error) {
            console.error('Error deleting message:', error);
            toast.error('Failed to delete message');
        }
    };

    const openDetail = (message: Message) => {
        setSelectedMessage(message);
        setDetailOpen(true);
        if (message.status === 'UNREAD') {
            handleMarkAsRead(message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
                    <p className="text-slate-500">View and manage contact form inquiries</p>
                </div>
                <Button onClick={loadMessages} variant="outline" className="gap-2" disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search messages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-slate-50 border-slate-200 text-slate-900"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-200 hover:bg-transparent">
                                <TableHead className="text-slate-500 min-w-[200px]">Sender</TableHead>
                                <TableHead className="text-slate-500 min-w-[250px]">Subject</TableHead>
                                <TableHead className="text-slate-500 min-w-[100px]">Status</TableHead>
                                <TableHead className="text-slate-500 min-w-[150px]">Date</TableHead>
                                <TableHead className="text-slate-500 text-right w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" /> Loading...
                                    </TableCell>
                                </TableRow>
                            ) : filteredMessages.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">No messages found</TableCell>
                                </TableRow>
                            ) : (
                                filteredMessages.map(msg => (
                                    <TableRow key={msg.id} className="border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => openDetail(msg)}>
                                        <TableCell>
                                            <div className="font-medium text-slate-900">{msg.name}</div>
                                            <div className="text-xs text-slate-500">{msg.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-slate-900">{msg.subject}</div>
                                            <div className="text-xs text-slate-500 truncate max-w-[300px]">{msg.message}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={statusColors[msg.status] || 'bg-slate-100'}>
                                                {msg.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-slate-500 text-sm">
                                            {new Date(msg.created_at).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(msg)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="max-w-md bg-white border-slate-200 text-slate-900">
                    <DialogHeader>
                        <DialogTitle>Message Details</DialogTitle>
                    </DialogHeader>
                    {selectedMessage && (
                        <div className="space-y-4">
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                                <div className="flex justify-between">
                                    <span className="font-bold text-slate-900">{selectedMessage.name}</span>
                                    <span className="text-xs text-slate-500">{new Date(selectedMessage.created_at).toLocaleString()}</span>
                                </div>
                                <div className="text-sm text-blue-600">{selectedMessage.email}</div>
                            </div>
                            <div>
                                <h3 className="font-medium text-slate-900 mb-1">Subject: {selectedMessage.subject}</h3>
                                <div className="p-4 bg-white border border-slate-200 rounded-lg text-slate-700 whitespace-pre-wrap h-[200px] overflow-y-auto">
                                    {selectedMessage.message}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="destructive" onClick={() => handleDelete(selectedMessage)}>Delete</Button>
                                <Button variant="outline" onClick={() => setDetailOpen(false)}>Close</Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
