import { useState, useEffect } from 'react';
import { Lightbulb, Plus, Edit2, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface ChatbotMessage {
    id: string;
    userId: string;
    userEmail: string;
    message: string;
    messageType: string;
    aiResponse: string;
    imageUrl?: string;
    createdAt: string;
}

export function AdminChatbotPage() {
    const [messages, setMessages] = useState<ChatbotMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState<ChatbotMessage | null>(null);
    const [responseText, setResponseText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        loadChatbotMessages();
    }, []);

    const loadChatbotMessages = async () => {
        try {
            const response = await fetch(`${apiUrl}/admin/chatbot`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setMessages(data.messages || []);
            }
        } catch (error) {
            console.error('Error loading chatbot messages:', error);
            toast({ title: 'Error', description: 'Failed to load chatbot messages', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateResponse = async () => {
        if (!selectedMessage || !responseText.trim()) return;
        try {
            const response = await fetch(`${apiUrl}/admin/chatbot/${selectedMessage.id}/response`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ response: responseText })
            });
            if (response.ok) {
                toast({ title: 'Success', description: 'Response updated' });
                loadChatbotMessages();
                setResponseText('');
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update response', variant: 'destructive' });
        }
    };

    const handleDelete = async (messageId: string) => {
        if (!confirm('Delete this message?')) return;
        try {
            const response = await fetch(`${apiUrl}/admin/chatbot/${messageId}`, {
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
        m.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Chatbot Management</h1>

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
                                onClick={() => { setSelectedMessage(msg); setResponseText(msg.aiResponse || ''); }}
                                className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedMessage?.id === msg.id ? 'bg-orange-50 border-orange-200' : 'border-slate-200 hover:bg-slate-50'}`}
                            >
                                <div className="flex items-start gap-2">
                                    <Lightbulb className="h-4 w-4 mt-1 text-orange-600 shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-slate-900 truncate text-sm">{msg.userEmail}</p>
                                        <p className="text-xs text-slate-500 truncate">{msg.message}</p>
                                    </div>
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
                                    <h2 className="text-xl font-semibold text-slate-900">User: {selectedMessage.userEmail}</h2>
                                    <p className="text-sm text-slate-500 mt-1">{new Date(selectedMessage.createdAt).toLocaleString()}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-900">User Message</label>
                                    <div className="mt-2 bg-slate-50 p-4 rounded-lg">
                                        <p className="text-slate-700">{selectedMessage.message}</p>
                                        {selectedMessage.imageUrl && (
                                            <img src={selectedMessage.imageUrl} alt="User uploaded" className="mt-3 max-h-48 rounded" />
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-900">Your Response</label>
                                    <textarea
                                        value={responseText}
                                        onChange={(e) => setResponseText(e.target.value)}
                                        placeholder="Type your response..."
                                        className="w-full mt-2 p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
                                        rows={4}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleUpdateResponse} className="bg-orange-600 hover:bg-orange-700">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Update Response
                                    </Button>
                                    <Button variant="outline" onClick={() => handleDelete(selectedMessage.id)} className="text-red-600">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="text-center py-12 text-slate-500">
                            Select a chatbot message to manage
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
