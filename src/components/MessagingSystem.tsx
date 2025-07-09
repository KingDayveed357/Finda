import  { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Calendar, Phone, Video, MoreVertical } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: Date;
  isRead: boolean;
  type: 'text' | 'booking' | 'system';
}

interface Conversation {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorAvatar: string;
  listingTitle: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
}

const MessagingSystem = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [conversations] = useState<Conversation[]>([
    {
      id: '1',
      vendorId: 'v1',
      vendorName: 'Creative Studios Inc',
      vendorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      listingTitle: 'Professional Logo Design Service',
      lastMessage: 'I can definitely help you with your logo design project!',
      lastMessageTime: new Date(Date.now() - 5 * 60 * 1000),
      unreadCount: 2,
      isOnline: true
    },
    {
      id: '2',
      vendorId: 'v2',
      vendorName: 'TechGear Pro',
      vendorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      listingTitle: 'Wireless Bluetooth Headphones',
      lastMessage: 'The headphones are still available. Would you like to proceed?',
      lastMessageTime: new Date(Date.now() - 30 * 60 * 1000),
      unreadCount: 0,
      isOnline: false
    },
    {
      id: '3',
      vendorId: 'v3',
      vendorName: 'Marketing Pros',
      vendorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      listingTitle: 'Digital Marketing Consultation',
      lastMessage: 'Thanks for your interest! Let me know when you\'d like to schedule a call.',
      lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      unreadCount: 1,
      isOnline: true
    }
  ]);

  const [messages, setMessages] = useState<Record<string, Message[]>>({
    '1': [
      {
        id: '1',
        senderId: 'v1',
        senderName: 'Creative Studios Inc',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        text: 'Hi! Thanks for your interest in our logo design service. I\'d love to help you create an amazing logo for your brand.',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        isRead: true,
        type: 'text'
      },
      {
        id: '2',
        senderId: 'current-user',
        senderName: 'You',
        senderAvatar: '',
        text: 'That sounds great! I\'m looking for a modern, minimalist design for my tech startup.',
        timestamp: new Date(Date.now() - 8 * 60 * 1000),
        isRead: true,
        type: 'text'
      },
      {
        id: '3',
        senderId: 'v1',
        senderName: 'Creative Studios Inc',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        text: 'Perfect! I specialize in modern tech logos. Would you like to schedule a consultation to discuss your vision?',
        timestamp: new Date(Date.now() - 6 * 60 * 1000),
        isRead: true,
        type: 'text'
      },
      {
        id: '4',
        senderId: 'v1',
        senderName: 'Creative Studios Inc',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        text: 'I can definitely help you with your logo design project!',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        isRead: false,
        type: 'text'
      }
    ]
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedConversation]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: 'current-user',
      senderName: 'You',
      senderAvatar: '',
      text: newMessage,
      timestamp: new Date(),
      isRead: true,
      type: 'text'
    };

    setMessages(prev => ({
      ...prev,
      [selectedConversation]: [...(prev[selectedConversation] || []), message]
    }));

    setNewMessage('');

    // Simulate vendor response
    setTimeout(() => {
      const vendorResponse: Message = {
        id: (Date.now() + 1).toString(),
        senderId: conversations.find(c => c.id === selectedConversation)?.vendorId || '',
        senderName: conversations.find(c => c.id === selectedConversation)?.vendorName || '',
        senderAvatar: conversations.find(c => c.id === selectedConversation)?.vendorAvatar || '',
        text: 'Thanks for your message! I\'ll get back to you shortly.',
        timestamp: new Date(),
        isRead: false,
        type: 'text'
      };

      setMessages(prev => ({
        ...prev,
        [selectedConversation]: [...(prev[selectedConversation] || []), vendorResponse]
      }));
    }, 2000);
  };

  const handleScheduleBooking = (conversationId: string) => {
    const bookingMessage: Message = {
      id: Date.now().toString(),
      senderId: 'system',
      senderName: 'System',
      senderAvatar: '',
      text: 'Booking request sent! The vendor will confirm your appointment shortly.',
      timestamp: new Date(),
      isRead: true,
      type: 'booking'
    };

    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), bookingMessage]
    }));
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const selectedConv = conversations.find(c => c.id === selectedConversation);
  const conversationMessages = selectedConversation ? messages[selectedConversation] || [] : [];

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden">
      {/* Conversations List */}
      <div className="w-1/3 border-r bg-gray-50">
        <div className="p-4 border-b bg-white">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Messages
          </h3>
        </div>
        <div className="overflow-y-auto h-full">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation.id)}
              className={`p-4 border-b cursor-pointer hover:bg-white transition-colors ${
                selectedConversation === conversation.id ? 'bg-white border-l-4 border-l-blue-600' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={conversation.vendorAvatar} alt={conversation.vendorName} />
                    <AvatarFallback>{conversation.vendorName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {conversation.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm truncate">{conversation.vendorName}</h4>
                    <span className="text-xs text-gray-500">{formatTime(conversation.lastMessageTime)}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1 truncate">{conversation.listingTitle}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700 truncate">{conversation.lastMessage}</p>
                    {conversation.unreadCount > 0 && (
                      <Badge className="bg-blue-600 text-white text-xs">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedConv.vendorAvatar} alt={selectedConv.vendorName} />
                    <AvatarFallback>{selectedConv.vendorName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {selectedConv.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <h4 className="font-medium">{selectedConv.vendorName}</h4>
                  <p className="text-sm text-gray-600">{selectedConv.listingTitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleScheduleBooking(selectedConv.id)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
                <Button variant="outline" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {conversationMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.senderId === 'current-user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  {message.senderId !== 'current-user' && message.senderId !== 'system' && (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={message.senderAvatar} alt={message.senderName} />
                      <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-[70%] ${message.senderId === 'current-user' ? 'text-right' : ''}`}>
                    <div
                      className={`p-3 rounded-lg ${
                        message.senderId === 'current-user'
                          ? 'bg-blue-600 text-white'
                          : message.type === 'system'
                          ? 'bg-gray-100 text-gray-700 italic'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {formatTime(message.timestamp)}
                      </span>
                      {message.senderId === 'current-user' && (
                        <span className="text-xs text-gray-500">
                          {message.isRead ? 'Read' : 'Sent'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-center gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingSystem;