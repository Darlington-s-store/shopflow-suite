import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Upload, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { chatbotAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface ChatMessage {
  id?: number;
  message: string;
  message_type: 'USER' | 'BOT' | 'ADMIN';
  created_at?: string;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated } = useAuth();

  // Load conversation on first open
  useEffect(() => {
    if (isOpen && isAuthenticated && messages.length === 0) {
      loadConversation();
    }
  }, [isOpen, isAuthenticated]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversation = async () => {
    try {
      const response = await chatbotAPI.getConversation();
      if (response.success) {
        setMessages(response.messages || []);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() && !selectedImage) return;

    setIsLoading(true);
    try {
      const response = await chatbotAPI.sendMessage(input, selectedImage || undefined);
      
      // Add user message
      setMessages(prev => [...prev, {
        message: input,
        message_type: 'USER',
        created_at: new Date().toISOString()
      }]);

      // Add bot response
      if (response.success) {
        setMessages(prev => [...prev, {
          message: response.message,
          message_type: 'BOT',
          created_at: new Date().toISOString()
        }]);
      }

      setInput('');
      setSelectedImage(null);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  // Chatbot available for all users (authenticated and guests)

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 p-3 bg-accent text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <Card className="w-96 h-96 flex flex-col bg-white shadow-2xl rounded-lg border border-primary/20">
          {/* Header */}
          <div className="bg-gradient-to-r from-accent to-accent/80 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div>
              <h3 className="font-semibold">ShopFlow Assistant</h3>
              <p className="text-xs opacity-90">Always here to help</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => setIsMinimized(true)}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Hi! I'm here to help. Ask me anything about products, orders, or deliveries.
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.message_type === 'USER' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.message_type === 'USER'
                          ? 'bg-accent text-white'
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <p className="text-sm break-words">{msg.message}</p>
                      <p className="text-xs opacity-60 mt-1">
                        {msg.created_at ? new Date(msg.created_at).toLocaleTimeString() : ''}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Image preview */}
          {selectedImage && (
            <div className="px-4 py-2 border-t bg-muted/50 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{selectedImage.name}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Input */}
          <div className="border-t p-3 bg-white rounded-b-lg space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                disabled={isLoading}
                className="text-sm"
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Upload className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={sendMessage}
                disabled={isLoading || (!input.trim() && !selectedImage)}
                className="bg-accent hover:bg-accent/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-accent hover:bg-accent/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          size="lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}

export default Chatbot;
