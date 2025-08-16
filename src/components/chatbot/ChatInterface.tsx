import { useState, useRef, useEffect } from "react";
import { Send, Mic, Scan, Camera, Upload, Zap, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChatSidebar } from "@/components/chatbot/ChatSidebar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { chatbotService } from "@/service/chatbotService";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  facepile?: { label: string; action: string }[];
  searchResults?: any;
  suggestedActions?: Array<{ action: string; label: string; description: string }>;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  onVoiceMessage: () => void;
  onImageUpload: () => void;
  onToggleSidebar: () => void;
  onFacepileAction?: (action: string) => void;
  sidebarOpen: boolean;
  isLoading?: boolean;
  sessionId: string;
}

export const ChatInterface = ({ 
  messages, 
  onSendMessage, 
  onVoiceMessage, 
  onImageUpload,
  onToggleSidebar,
  onFacepileAction,
  sidebarOpen,
  isLoading = false,
  sessionId
}: ChatInterfaceProps) => {
  const [inputValue, setInputValue] = useState("");
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversation history when component mounts
  useEffect(() => {
    const loadConversationHistory = async () => {
      try {
        const history = await chatbotService.getConversationHistory(sessionId);
        if (history.success) {
          setConversationHistory(history.messages.slice(0, 10)); // Show last 10 conversations
        }
      } catch (error) {
        console.error('Failed to load conversation history:', error);
      }
    };

    if (sessionId) {
      loadConversationHistory();
    }
  }, [sessionId]);

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue("");
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  const handleSelectChat = async (chatId: string) => {
    try {
      console.log('Loading chat:', chatId);
      // In a real implementation, you would load the specific conversation
      const history = await chatbotService.getConversationHistory(chatId);
      if (history.success) {
        toast.success(`Loaded conversation: ${history.session.title || 'Untitled'}`);
      }
    } catch (error) {
      console.error('Failed to load chat:', error);
      toast.error('Failed to load conversation');
    }
  };

  const handleRemoveFavorite = (itemId: string) => {
    setFavorites(prev => prev.filter(item => item.id !== itemId));
    toast.success('Removed from favorites');
  };

  const handleNewChat = () => {
    const newSessionId = chatbotService.generateSessionId();
    console.log('Starting new chat with session:', newSessionId);
    toast.success('Started new conversation');
    // In real app, you would update the session ID and clear current messages
  };

  const handleLensAction = (action: 'camera' | 'upload') => {
    if (action === 'camera') {
      // For camera, we'll treat it the same as upload for now
      onImageUpload();
    } else {
      onImageUpload();
    }
  };

  const handleFacepileClick = (action: string) => {
    if (onFacepileAction) {
      onFacepileAction(action);
    }
  };

  const handleFeedback = async (messageId: string, isPositive: boolean) => {
    try {
      await chatbotService.submitQuickFeedback(messageId, isPositive);
      toast.success(`Feedback submitted: ${isPositive ? 'Helpful' : 'Not helpful'}`);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast.error('Failed to submit feedback');
    }
  };

  // Quick message suggestions
  const quickSuggestions = [
    "Find iPhone 12 Pro under $350 in Lagos",
    "Best freelance web developers",
    "Gaming laptops under $1000",
    "Latest Samsung Galaxy phones"
  ];

  return (
    <div className="flex h-full relative">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={onToggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'fixed lg:relative inset-y-0 left-0' : 'hidden lg:block'} z-50 lg:z-auto`}>
        <ChatSidebar
          isOpen={sidebarOpen}
          onToggle={onToggleSidebar}
          onSelectChat={handleSelectChat}
          onRemoveFavorite={handleRemoveFavorite}
          onNewChat={handleNewChat}
          conversationHistory={conversationHistory}
          favorites={favorites}
        />
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary to-primary-glow flex items-center justify-center">
                <Zap className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Start Your Discovery</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Type naturally! Try "Need a used iPhone 12 Pro under $350, shipping to Lagos" 
                or upload an image to find similar products.
              </p>
              
              {/* Quick Suggestions */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Try these examples:</p>
                <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                  {quickSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => onSendMessage(suggestion)}
                      disabled={isLoading}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex w-full",
                  message.type === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] md:max-w-[70%] p-3 rounded-2xl",
                    message.type === 'user'
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-card border shadow-soft"
                  )}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  
                  {/* Search Results Summary for AI responses */}
                  {message.type === 'assistant' && message.searchResults && (
                    <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-3 w-3" />
                        <span>
                          Found {(message.searchResults.local?.total || 0) + (message.searchResults.external?.total || 0)} results
                        </span>
                        {message.searchResults.local?.total > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {message.searchResults.local.total} local
                          </Badge>
                        )}
                        {message.searchResults.external?.total > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {message.searchResults.external.total} external
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Suggested Actions for AI responses */}
                  {message.type === 'assistant' && message.facepile && (
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                      {message.facepile.map((item, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs hover:bg-primary hover:text-primary-foreground"
                          onClick={() => handleFacepileClick(item.action)}
                          disabled={isLoading}
                        >
                          {item.label}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  {/* Feedback buttons for AI responses */}
                  {message.type === 'assistant' && !isLoading && (
                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <div className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-green-100"
                          onClick={() => handleFeedback(message.id, true)}
                          title="Helpful"
                        >
                          👍
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-red-100"
                          onClick={() => handleFeedback(message.id, false)}
                          title="Not helpful"
                        >
                          👎
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Timestamp for user messages */}
                  {message.type === 'user' && (
                    <div className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-card border shadow-soft p-3 rounded-2xl max-w-[70%]">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-muted-foreground">AI is searching across multiple sources...</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Auto-scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-background">
          <div className="flex items-end space-x-2">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                placeholder="Ask anything... 'iPhone 12 Pro under $350 to Lagos' or 'Best freelance web designers'"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  adjustTextareaHeight();
                }}
                onKeyPress={handleKeyPress}
                className="min-h-[40px] max-h-[120px] resize-none pr-20 text-sm"
                rows={1}
                disabled={isLoading}
              />
              
              {/* Attachment Icons */}
              <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      disabled={isLoading}
                      title="Upload image to find similar products"
                    >
                      <Scan className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => handleLensAction('camera')}>
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleLensAction('upload')}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={onVoiceMessage}
                  disabled={isLoading}
                  title="Record voice message"
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="h-10 w-10 rounded-full p-0"
              title="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Voice & Image supported
              </Badge>
              {isLoading && (
                <Badge variant="outline" className="text-xs animate-pulse">
                  Processing...
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};