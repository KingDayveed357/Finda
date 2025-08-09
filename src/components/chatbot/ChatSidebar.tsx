import { useState } from "react";
import { Heart, MessageSquare, Clock, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ChatHistory {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
}

interface FavoriteItem {
  id: string;
  title: string;
  type: 'product' | 'service';
  price?: string;
  location?: string;
  rating?: number;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onSelectChat?: (chatId: string) => void;
  onRemoveFavorite?: (itemId: string) => void;
}

export const ChatSidebar = ({ 
  isOpen, 
  onToggle, 
  onSelectChat,
  onRemoveFavorite 
}: ChatSidebarProps) => {
  const [activeTab, setActiveTab] = useState<'history' | 'favorites'>('history');

  // Mock data - in real app this would come from props or API
  const chatHistory: ChatHistory[] = [
    {
      id: '1',
      title: 'iPhone 12 Pro search',
      lastMessage: 'Found 5 options under $350',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
      messageCount: 8
    },
    {
      id: '2', 
      title: 'Web designer freelancers',
      lastMessage: 'Here are the top-rated designers...',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      messageCount: 12
    },
    {
      id: '3',
      title: 'Gaming laptop under $1000',
      lastMessage: 'I found several good options',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      messageCount: 15
    }
  ];

  const favoriteItems: FavoriteItem[] = [
    {
      id: '1',
      title: 'iPhone 12 Pro 128GB',
      type: 'product',
      price: '$320',
      location: 'Lagos',
      rating: 4.5
    },
    {
      id: '2',
      title: 'Sarah M. - UI/UX Designer',
      type: 'service',
      price: '$45/hr',
      location: 'Remote',
      rating: 4.9
    },
    {
      id: '3',
      title: 'MacBook Air M2',
      type: 'product', 
      price: '$950',
      location: 'Abuja',
      rating: 4.7
    }
  ];

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (!isOpen) {
    return (
      <div className="w-12 border-r bg-background flex flex-col items-center py-4 space-y-4 h-full">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8"
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          <Heart className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-80 border-r bg-background flex flex-col h-full md:h-auto">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg">Chat Assistant</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          <Button
            variant={activeTab === 'history' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('history')}
            className="flex-1 text-xs"
          >
            <Clock className="h-3 w-3 mr-1" />
            History
          </Button>
          <Button
            variant={activeTab === 'favorites' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('favorites')}
            className="flex-1 text-xs"
          >
            <Heart className="h-3 w-3 mr-1" />
            Favorites
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        {activeTab === 'history' ? (
          <div className="p-4 space-y-3">
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                className="p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => onSelectChat?.(chat.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm line-clamp-1">{chat.title}</h4>
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(chat.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {chat.lastMessage}
                </p>
                <Badge variant="secondary" className="text-xs">
                  {chat.messageCount} messages
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {favoriteItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm line-clamp-1 mb-1">{item.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge 
                        variant={item.type === 'product' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {item.type}
                      </Badge>
                      {item.price && <span>{item.price}</span>}
                      {item.location && <span>• {item.location}</span>}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onRemoveFavorite?.(item.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                {item.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-warning text-warning" />
                    <span className="text-xs text-muted-foreground">{item.rating}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button variant="outline" size="sm" className="w-full text-xs">
          Clear {activeTab === 'history' ? 'History' : 'Favorites'}
        </Button>
      </div>
    </div>
  );
};