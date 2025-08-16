import { useState, useEffect } from "react";
import { Heart, MessageSquare, Clock, Star, Trash2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
// import { chatbotService } from "@/service/chatbotService";

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
  onNewChat?: () => void;
  conversationHistory?: any[];
  favorites?: any[];
}

export const ChatSidebar = ({ 
  isOpen, 
  onToggle, 
  onSelectChat,
  onRemoveFavorite,
  onNewChat,
  conversationHistory = [],
  favorites = []
}: ChatSidebarProps) => {
  const [activeTab, setActiveTab] = useState<'history' | 'favorites'>('history');
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredHistory, setFilteredHistory] = useState<ChatHistory[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<FavoriteItem[]>([]);

  // Convert conversation history from API to ChatHistory format
  useEffect(() => {
    const convertedHistory: ChatHistory[] = conversationHistory.map((conversation) => ({
      id: conversation.id || conversation.session_id,
      title: conversation.content?.substring(0, 50) || 'Untitled Conversation',
      lastMessage: conversation.content || 'No messages',
      timestamp: new Date(conversation.created_at),
      messageCount: conversation.search_results_count || 1
    }));

    // Apply search filter
    const filtered = searchQuery
      ? convertedHistory.filter(chat => 
          chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : convertedHistory;

    setFilteredHistory(filtered);
  }, [conversationHistory, searchQuery]);

  // Convert favorites from API format
  useEffect(() => {
    const convertedFavorites: FavoriteItem[] = favorites.map((fav, index) => ({
      id: fav.id || index.toString(),
      title: fav.title || fav.name || 'Untitled',
      type: fav.type || (fav.price ? 'product' : 'service'),
      price: fav.price || fav.formatted_price,
      location: fav.location,
      rating: fav.rating || (4 + Math.random())
    }));

    // Apply search filter
    const filtered = searchQuery
      ? convertedFavorites.filter(fav => 
          fav.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : convertedFavorites;

    setFilteredFavorites(filtered);
  }, [favorites, searchQuery]);

  const formatTimeAgo = (date: Date) => {
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

  const handleClearAll = async () => {
    try {
      if (activeTab === 'history') {
        // In a real app, you'd call an API to clear history
        console.log('Clearing conversation history...');
      } else {
        // Clear favorites
        favorites.forEach(fav => onRemoveFavorite?.(fav.id));
      }
    } catch (error) {
      console.error(`Failed to clear ${activeTab}:`, error);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  if (!isOpen) {
    return (
      <div className="w-12 border-r bg-background flex flex-col items-center py-4 space-y-4 h-full">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8"
          title="Open chat sidebar"
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setActiveTab('favorites')}
          title="View favorites"
        >
          <Heart className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onNewChat}
          title="New chat"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-80 border-r bg-background flex flex-col h-screen lg:h-auto">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg">Chat Assistant</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8"
            title="Close sidebar"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
        
        {/* New Chat Button */}
        <Button 
          onClick={onNewChat}
          className="w-full mb-3 border-2 bg-transparent h-10 text-black hover:bg-accent" 
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
        
        {/* Search Input */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 h-9 text-sm"
          />
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
            History ({filteredHistory.length})
          </Button>
          <Button
            variant={activeTab === 'favorites' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('favorites')}
            className="flex-1 text-xs"
          >
            <Heart className="h-3 w-3 mr-1" />
            Saved ({filteredFavorites.length})
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        {activeTab === 'history' ? (
          <div className="p-4 space-y-3">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? 'No conversations match your search' : 'No conversation history yet'}
                </p>
                {searchQuery && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSearchQuery("")}
                    className="mt-2"
                  >
                    Clear search
                  </Button>
                )}
              </div>
            ) : (
              filteredHistory.map((chat) => (
                <div
                  key={chat.id}
                  className="p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors group"
                  onClick={() => onSelectChat?.(chat.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm line-clamp-2 flex-1 mr-2">
                      {chat.title}
                    </h4>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTimeAgo(chat.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {chat.lastMessage}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {chat.messageCount} messages
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filteredFavorites.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? 'No favorites match your search' : 'No saved items yet'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {!searchQuery && 'Save products and services you find interesting'}
                </p>
                {searchQuery && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSearchQuery("")}
                    className="mt-2"
                  >
                    Clear search
                  </Button>
                )}
              </div>
            ) : (
              filteredFavorites.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 mr-2">
                      <h4 className="font-medium text-sm line-clamp-2 mb-1">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        <Badge 
                          variant={item.type === 'product' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {item.type}
                        </Badge>
                        {item.price && <span className="font-medium">{item.price}</span>}
                        {item.location && <span>• {item.location}</span>}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={() => onRemoveFavorite?.(item.id)}
                      title="Remove from favorites"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  {item.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-warning text-warning" />
                      <span className="text-xs text-muted-foreground">
                        {item.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t space-y-2">
        {((activeTab === 'history' && filteredHistory.length > 0) || 
          (activeTab === 'favorites' && filteredFavorites.length > 0)) && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs"
            onClick={handleClearAll}
          >
            Clear All {activeTab === 'history' ? 'History' : 'Favorites'}
          </Button>
        )}
        
        {/* Session Info */}
        <div className="text-xs text-muted-foreground text-center">
          Session active • AI-powered search
        </div>
      </div>
    </div>
  );
};