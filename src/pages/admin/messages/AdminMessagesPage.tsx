import { useState, useEffect } from 'react';
import { MessageCircle, Send, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface Message {
    id: string;
    senderId: string;
    senderName: string;
    senderEmail: string;
    subject: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export function AdminMessagesPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [replyText, setReplyText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        try {
            const response = await fetch(`${apiUrl}/admin/messages`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setMessages(data.messages || []);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
            toast({ title: 'Error', description: 'Failed to load messages', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleSendReply = async () => {
        if (!selectedMessage || !replyText.trim()) return;
        try {
            const response = await fetch(`${apiUrl}/admin/messages/${selectedMessage.id}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ replyMessage: replyText })
            });
            if (response.ok) {
                toast({ title: 'Success', description: 'Reply sent successfully' });
                setReplyText('');
                loadMessages();
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to send reply', variant: 'destructive' });
        }
    };

    const handleDelete = async (messageId: string) => {
        if (!confirm('Delete this message?')) return;
        try {
            const response = await fetch(`${apiUrl}/admin/messages/${messageId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (response.ok) {
                setMessages(messages.filter(m => m.id !== messageId));
                setSelectedMessage(null);
                toast({ title: 'Success', description: 'Message deleted' });
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete message', variant: 'destructive' });
        }
    };

    const filteredMessages = messages.filter(m =>
        m.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.senderEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Customer Messages</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <Input
                            placeholder="Search messages..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {filteredMessages.map(msg => (
                            <button
                                key={msg.id}
                                onClick={() => setSelectedMessage(msg)}
                                className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedMessage?.id === msg.id ? 'bg-orange-50 border-orange-200' : 'border-slate-200 hover:bg-slate-50'}`}
                            >
                                <div className="flex items-start gap-2">
                                    <MessageCircle className="h-4 w-4 mt-1 text-orange-600 shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-slate-900 truncate text-sm">{msg.senderEmail}</p>
                                        <p className="text-xs text-slate-500 truncate">{msg.subject}</p>
                                    </div>
                                    {!msg.isRead && <div className="h-2 w-2 rounded-full bg-orange-600 shrink-0 mt-2" />}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-2">
                    {selectedMessage ? (
                        <Card className="border-slate-200">
                            <CardContent className="p-6 space-y-4">
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900">{selectedMessage.subject}</h2>
                                    <p className="text-sm text-slate-500 mt-1">{selectedMessage.senderEmail}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-lg">
                                    <p className="text-slate-700">{selectedMessage.message}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" className="text-red-600" onClick={() => handleDelete(selectedMessage.id)}>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </Button>
                                </div>
                                <div className="border-t pt-4">
                                    <label className="text-sm font-medium text-slate-900">Send Reply</label>
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Type your reply..."
                                        className="w-full mt-2 p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
                                        rows={4}
                                    />
                                    <Button onClick={handleSendReply} className="mt-2 bg-orange-600 hover:bg-orange-700">
                                        <Send className="h-4 w-4 mr-2" />
                                        Send Reply
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="text-center py-12 text-slate-500">
                            Select a message to view and reply
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
