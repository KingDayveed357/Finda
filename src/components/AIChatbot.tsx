import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Bot, User, Sparkles, X } from 'lucide-react';

// Mock data for demonstrations
const mockListings = [
  {
    id: '1',
    title: 'Wireless Bluetooth Headphones',
    price: 299,
    category: 'electronics',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop'],
    isService: false
  },
  {
    id: '2',
    title: 'Professional Web Design',
    price: { min: 500, max: 2000 },
    category: 'services',
    images: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&h=100&fit=crop'],
    isService: true
  },
  {
    id: '3',
    title: 'Gaming Laptop',
    price: 1200,
    category: 'electronics',
    images: ['https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=100&h=100&fit=crop'],
    isService: false
  },
  {
    id: '4',
    title: 'Digital Marketing Service',
    price: { min: 300, max: 1500 },
    category: 'services',
    images: ['https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=100&h=100&fit=crop'],
    isService: true
  },
  {
    id: '5',
    title: 'Smart Watch',
    price: 199,
    category: 'electronics',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop'],
    isService: false
  }
];

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  suggestions?: string[];
  recommendations?: typeof mockListings;
}

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your AI assistant for Finda. I can help you discover products, find services, compare vendors, and answer any questions about our marketplace. What are you looking for today?",
      isBot: true,
      timestamp: new Date(),
      suggestions: [
        "Find electronics under $500",
        "Show me top-rated services",
        "Compare local vendors",
        "Help me choose a category"
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generateBotResponse = async (userMessage: string): Promise<Message> => {
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    const lowerMessage = userMessage.toLowerCase();
    let response = '';
    let suggestions: string[] = [];
    let recommendations: typeof mockListings = [];

    if (lowerMessage.includes('electronics') || lowerMessage.includes('tech')) {
      response = "I found some great electronics for you! Here are some top-rated options that match your criteria:";
      recommendations = mockListings.filter(l => l.category === 'electronics').slice(0, 3);
      suggestions = ["Show more electronics", "Find electronics under $200", "Compare these products"];
    } else if (lowerMessage.includes('service') || lowerMessage.includes('services')) {
      response = "Here are some highly-rated services available in your area:";
      recommendations = mockListings.filter(l => l.isService).slice(0, 3);
      suggestions = ["Find local services", "Compare service providers", "Book a consultation"];
    } else if (lowerMessage.includes('compare') || lowerMessage.includes('vendor')) {
      response = "I can help you compare vendors! Here's what I found based on ratings, pricing, and reviews:";
      recommendations = mockListings.slice(0, 3);
      suggestions = ["Show vendor ratings", "Compare prices", "Check availability"];
    } else if (lowerMessage.includes('price') || lowerMessage.includes('budget') || lowerMessage.includes('$')) {
      response = "I understand you're looking for budget-friendly options. Here are some great deals:";
      recommendations = mockListings.filter(l => {
        const price = typeof l.price === 'number' ? l.price : l.price.min;
        return price < 500;
      }).slice(0, 3);
      suggestions = ["Show more deals", "Set price alerts", "Find discounts"];
    } else {
      response = "I'd be happy to help you with that! Here are some popular options from our marketplace:";
      recommendations = mockListings.slice(0, 3);
      suggestions = ["Browse all categories", "Find local vendors", "See trending products"];
    }

    return {
      id: Date.now().toString(),
      text: response,
      isBot: true,
      timestamp: new Date(),
      suggestions,
      recommendations
    };
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const botResponse = await generateBotResponse(messageText);
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error generating bot response:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "I'm sorry, I encountered an error. Please try again!",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px]">
      <Card className="h-full flex flex-col shadow-xl">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bot className="h-5 w-5 text-blue-600" />
              AI Assistant
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            style={{ maxHeight: 'calc(100% - 80px)' }}
          >
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                <div className={`flex items-start gap-2 ${message.isBot ? '' : 'flex-row-reverse'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.isBot ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {message.isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    message.isBot 
                      ? 'bg-gray-100 text-gray-900' 
                      : 'bg-blue-600 text-white'
                  }`}>
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>

                {message.recommendations && message.recommendations.length > 0 && (
                  <div className="ml-10 space-y-2">
                    {message.recommendations.map((listing) => (
                      <div key={listing.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-sm">
                        <img src={listing.images[0]} alt={listing.title} className="w-8 h-8 rounded object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{listing.title}</p>
                          <p className="text-gray-600">{typeof listing.price === 'number' ? `$${listing.price}` : `$${listing.price.min}-$${listing.price.max}`}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="ml-10 flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:bg-blue-50 text-xs"
                        onClick={() => handleSendMessage(suggestion)}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t flex-shrink-0">
            <div className="flex items-center gap-2">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask me anything..."
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button 
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isTyping}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIChatbot;