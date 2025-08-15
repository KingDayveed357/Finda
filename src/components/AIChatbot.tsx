// import { useState, useRef, useEffect, useCallback } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import { 
//   MessageCircle, 
//   Send, 
//   Bot, 
//   User, 
//   Sparkles, 
//   X, 
//   ExternalLink, 
//   Star, 
//   Truck, 
//   Clock, 
//   AlertCircle, 
//   RefreshCw, 
//   LogIn, 
//   UserPlus,
//   WifiOff
// } from 'lucide-react';
// import { useChatbot } from '../hooks/useChatbot';
// import { useRetry } from '../hooks/useRetry';
// import type { Message } from '../types/';
// import { externalPlatforms } from '../types/';
// import { ErrorBoundary } from './ErrorBoundary';

// const AIChatbot = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [inputText, setInputText] = useState('');
//   const [isOnline, setIsOnline] = useState(navigator.onLine);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
  
//   const { 
//     messages, 
//     isLoading, 
//     error, 
//     sendMessage, 
//     clearMessages, 
//     checkAvailability,
//     isAuthenticated 
//   } = useChatbot();
  
//   const { retry, retryCount, isRetrying, resetRetry } = useRetry();

//   // Track online/offline status
//   useEffect(() => {
//     const handleOnline = () => setIsOnline(true);
//     const handleOffline = () => setIsOnline(false);

//     window.addEventListener('online', handleOnline);
//     window.addEventListener('offline', handleOffline);

//     return () => {
//       window.removeEventListener('online', handleOnline);
//       window.removeEventListener('offline', handleOffline);
//     };
//   }, []);

//   // Auto-scroll to bottom when messages change
//   const scrollToBottom = useCallback(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, []);

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, scrollToBottom]);

//   // Focus input when chat opens
//   useEffect(() => {
//     if (isOpen) {
//       // Small delay to ensure the component is fully rendered
//       setTimeout(() => {
//         const inputElement = document.querySelector('input[placeholder*="Ask me about"]') as HTMLInputElement;
//         inputElement?.focus();
//       }, 100);
//     }
//   }, [isOpen]);

//   const handleSendMessage = async (text?: string) => {
//     const messageText = text || inputText.trim();
//     if (!messageText || isLoading || isRetrying) return;

//     // Check if online
//     if (!isOnline) {
//       console.warn('Cannot send message while offline');
//       return;
//     }

//     setInputText('');
    
//     try {
//       await retry(() => sendMessage(messageText));
//     } catch (error) {
//       console.error('Failed to send message after retries:', error);
//       // The error will be handled by the useChatbot hook and displayed in the UI
//     }
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   const handleActionButton = async (action: string, payload?: any) => {
//     switch (action) {
//       case 'navigate':
//         if (payload) {
//           window.location.href = payload;
//         }
//         break;
//       case 'retry':
//         // Retry the last user message
//         const lastUserMessage = messages.slice().reverse().find(msg => !msg.isBot);
//         if (lastUserMessage) {
//           await handleSendMessage(lastUserMessage.text);
//         }
//         break;
//       case 'clear':
//         await clearMessages();
//         resetRetry(); // Reset retry state when clearing
//         break;
//       case 'check-status':
//         const isAvailable = await checkAvailability();
//         // You could show a toast or update UI based on availability
//         console.log('Chatbot availability:', isAvailable);
//         break;
//       default:
//         console.warn('Unknown action:', action);
//     }
//   };

//   const formatPrice = (price: number | { min?: number; max?: number }): string => {
//     if (typeof price === 'number') {
//       return `₦${price.toLocaleString()}`;
//     }
//     if (price.min && price.max) {
//       return `₦${price.min.toLocaleString()}-₦${price.max.toLocaleString()}`;
//     }
//     if (price.max) {
//       return `Up to ₦${price.max.toLocaleString()}`;
//     }
//     return `From ₦${price.min?.toLocaleString() || 0}`;
//   };

//   const MessageComponent = ({ message }: { message: Message }) => (
//     <div className="space-y-2 md:space-y-3">
//       <div className={`flex items-start gap-2 ${message.isBot ? '' : 'flex-row-reverse'}`}>
//         <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center shrink-0 ${
//           message.isBot ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
//         }`}>
//           {message.isBot ? <Bot className="h-3 w-3 md:h-4 md:w-4" /> : <User className="h-3 w-3 md:h-4 md:w-4" />}
//         </div>
//         <div className={`flex-1 max-w-[calc(100%-3rem)] md:max-w-[80%] p-2 md:p-3 rounded-lg break-words ${
//           message.isBot 
//             ? 'bg-gray-100 text-gray-900' 
//             : 'bg-blue-600 text-white'
//         }`}>
//           <p className="text-xs md:text-sm leading-relaxed break-words whitespace-pre-wrap">
//             {message.text}
//           </p>
          
//           {message.error && (
//             <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2">
//               <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
//               <span className="text-xs text-red-600">{message.error}</span>
//               {retryCount > 0 && (
//                 <Badge variant="outline" className="text-xs text-red-600">
//                   Retry {retryCount}/3
//                 </Badge>
//               )}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Action Buttons */}
//       {message.actionButtons && message.actionButtons.length > 0 && (
//         <div className="ml-8 md:ml-10 flex flex-wrap gap-2 overflow-hidden">
//           {message.actionButtons.map((button, index) => (
//             <Button
//               key={index}
//               variant={button.action === 'navigate' ? 'default' : 'outline'}
//               size="sm"
//               className={`text-xs py-1 px-3 h-8 shrink-0 ${
//                 button.label === 'Log In' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
//                 button.label === 'Sign Up' ? 'bg-green-600 hover:bg-green-700 text-white' :
//                 ''
//               }`}
//               onClick={() => handleActionButton(button.action, button.payload)}
//               disabled={isLoading || isRetrying}
//             >
//               {button.label === 'Log In' && <LogIn className="h-3 w-3 mr-1" />}
//               {button.label === 'Sign Up' && <UserPlus className="h-3 w-3 mr-1" />}
//               {button.label === 'Try Again' && <RefreshCw className="h-3 w-3 mr-1" />}
//               {button.label}
//             </Button>
//           ))}
//         </div>
//       )}

//       {/* Local Products */}
//       {message.recommendations && message.recommendations.length > 0 && (
//         <div className="ml-8 md:ml-10 space-y-2 overflow-hidden">
//           <p className="text-xs font-medium text-gray-600 flex items-center gap-1">
//             <Truck className="h-3 w-3 shrink-0" />
//             Local Vendors
//           </p>
//           <div className="space-y-1 md:space-y-2">
//             {message.recommendations.map((listing) => (
//               <div key={listing.id} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg text-xs md:text-sm border border-green-100 overflow-hidden">
//                 <img 
//                   src={listing.images[0]} 
//                   alt={listing.title} 
//                   className="w-6 h-6 md:w-8 md:h-8 rounded object-cover shrink-0"
//                   onError={(e) => {
//                     const target = e.target as HTMLImageElement;
//                     target.src = 'https://via.placeholder.com/32?text=IMG';
//                   }}
//                 />
//                 <div className="flex-1 min-w-0 overflow-hidden">
//                   <p className="font-medium text-green-800 truncate">{listing.title}</p>
//                   <div className="flex items-center gap-1 text-green-600 flex-wrap">
//                     <span className="text-xs shrink-0">{formatPrice(listing.price)}</span>
//                     <Star className="h-3 w-3 fill-current shrink-0" />
//                     <span className="text-xs shrink-0">{listing.rating}</span>
//                   </div>
//                   {listing.link && (
//                     <a 
//                       href={listing.link}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-xs text-green-600 hover:underline flex items-center gap-1 mt-1"
//                     >
//                       View Details <ExternalLink className="h-3 w-3" />
//                     </a>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* External Products */}
//       {message.externalProducts && message.externalProducts.length > 0 && (
//         <div className="ml-8 md:ml-10 space-y-2 overflow-hidden">
//           <p className="text-xs font-medium text-gray-600 flex items-center gap-1">
//             <ExternalLink className="h-3 w-3 shrink-0" />
//             External Platforms
//           </p>
//           <div className="space-y-1 md:space-y-2">
//             {message.externalProducts.map((product) => (
//               <div key={product.id} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg text-xs md:text-sm border border-blue-100 overflow-hidden">
//                 <img 
//                   src={product.image} 
//                   alt={product.title} 
//                   className="w-6 h-6 md:w-8 md:h-8 rounded object-cover shrink-0"
//                   onError={(e) => {
//                     const target = e.target as HTMLImageElement;
//                     target.src = 'https://via.placeholder.com/32?text=IMG';
//                   }}
//                 />
//                 <div className="flex-1 min-w-0 overflow-hidden">
//                   <p className="font-medium text-blue-800 truncate">{product.title}</p>
//                   <div className="flex items-center gap-1 md:gap-2 text-blue-600 text-xs flex-wrap">
//                     <span className="shrink-0">{formatPrice(product.price)}</span>
//                     <Badge variant="outline" className="text-xs px-1 py-0 hidden md:inline-flex shrink-0">
//                       {externalPlatforms[product.platform]?.logo} {externalPlatforms[product.platform]?.name}
//                     </Badge>
//                     <div className="flex items-center gap-1 shrink-0">
//                       <Star className="h-3 w-3 fill-current" />
//                       <span>{product.rating}</span>
//                     </div>
//                     {product.estimatedDelivery && (
//                       <div className="flex items-center gap-1 shrink-0">
//                         <Clock className="h-3 w-3" />
//                         <span className="hidden md:inline">{product.estimatedDelivery}</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Follow-up Questions */}
//       {message.followUpQuestions && message.followUpQuestions.length > 0 && (
//         <div className="ml-8 md:ml-10 overflow-hidden">
//           <p className="text-xs font-medium text-gray-600 mb-2">I can also help with:</p>
//           <div className="flex flex-wrap gap-1 overflow-hidden">
//             {message.followUpQuestions.map((question, index) => (
//               <Badge
//                 key={index}
//                 variant="outline"
//                 className="cursor-pointer hover:bg-purple-50 text-xs py-1 px-2 shrink-0"
//                 onClick={() => handleSendMessage(question)}
//               >
//                 {question}
//               </Badge>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Suggestions */}
//       {message.suggestions && message.suggestions.length > 0 && (
//         <div className="ml-8 md:ml-10 flex flex-wrap gap-1 md:gap-2 overflow-hidden">
//           {message.suggestions.map((suggestion, index) => (
//             <Badge
//               key={index}
//               variant="outline"
//               className="cursor-pointer hover:bg-blue-50 text-xs py-1 px-2 shrink-0"
//               onClick={() => handleSendMessage(suggestion)}
//             >
//               {suggestion}
//             </Badge>
//           ))}
//         </div>
//       )}
//     </div>
//   );

//   // Floating chat button
//   if (!isOpen) {
//     return (
//       <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
//         <Button
//           onClick={() => setIsOpen(true)}
//           className="rounded-full w-12 h-12 md:w-14 md:h-14 bg-blue-600 hover:bg-blue-700 shadow-lg relative"
//           disabled={!isOnline}
//         >
//           <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
//           {!isOnline && (
//             <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
//               <WifiOff className="h-2 w-2 text-white" />
//             </div>
//           )}
//           {error && (
//             <div className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
//               <AlertCircle className="h-2 w-2 text-white" />
//             </div>
//           )}
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <ErrorBoundary>
//       <div className="fixed inset-0 md:inset-auto md:bottom-4 md:right-4 md:top-4 md:left-auto z-50 md:w-96 md:max-w-[calc(100vw-2rem)] flex flex-col overflow-hidden">
//         <Card className="flex-1 flex flex-col shadow-xl md:max-h-[calc(100vh-2rem)] bg-white overflow-hidden">
//           <CardHeader className="pb-3 shrink-0">
//             <div className="flex items-center justify-between">
//               <CardTitle className="flex items-center gap-2 text-base md:text-lg">
//                 <Bot className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
//                 AI Shopping Assistant
//                 <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-yellow-500" />
//                 {!isOnline && <WifiOff className="h-4 w-4 text-red-500" />}
//                 {error && <AlertCircle className="h-4 w-4 text-red-500" />}
//                 {!isAuthenticated && <Badge variant="outline" className="text-xs">Guest</Badge>}
//               </CardTitle>
//               <div className="flex items-center gap-2">
//                 {error && (
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={clearMessages}
//                     className="h-8 w-8 p-0 text-red-600"
//                     title="Clear and retry"
//                     disabled={isLoading || isRetrying}
//                   >
//                     <RefreshCw className="h-4 w-4" />
//                   </Button>
//                 )}
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={() => setIsOpen(false)}
//                   className="h-8 w-8 p-0"
//                 >
//                   <X className="h-4 w-4" />
//                 </Button>
//               </div>
//             </div>
            
//             {/* Status indicators */}
//             {(!isOnline || error) && (
//               <div className="flex items-center gap-2 text-xs text-gray-600">
//                 {!isOnline && (
//                   <div className="flex items-center gap-1 text-red-600">
//                     <WifiOff className="h-3 w-3" />
//                     <span>Offline</span>
//                   </div>
//                 )}
//                 {error && (
//                   <div className="flex items-center gap-1 text-red-600">
//                     <AlertCircle className="h-3 w-3" />
//                     <span>Error occurred</span>
//                   </div>
//                 )}
//               </div>
//             )}
//           </CardHeader>
          
//           <CardContent className="flex-1 flex flex-col p-0 min-h-0 overflow-hidden">
//             {/* Messages Container */}
//             <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-4 space-y-3 md:space-y-4 min-h-0">
//               {messages.map((message) => (
//                 <MessageComponent key={message.id} message={message} />
//               ))}

//               {/* Loading indicator */}
//               {(isLoading || isRetrying) && (
//                 <div className="flex items-center gap-2">
//                   <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
//                     <Bot className="h-3 w-3 md:h-4 md:w-4" />
//                   </div>
//                   <div className="bg-gray-100 p-2 md:p-3 rounded-lg">
//                     <div className="flex items-center space-x-1">
//                       <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-500 rounded-full animate-bounce"></div>
//                       <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
//                       <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
//                       {isRetrying && (
//                         <span className="ml-2 text-xs text-gray-500">
//                           Retrying... ({retryCount}/3)
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               )}
              
//               <div ref={messagesEndRef} />
//             </div>

//             {/* Input Container */}
//             <div className="p-3 md:p-4 border-t shrink-0">
//               {!isOnline && (
//                 <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-md text-xs text-red-600 flex items-center gap-2">
//                   <WifiOff className="h-3 w-3" />
//                   <span>You're offline. Check your connection to send messages.</span>
//                 </div>
//               )}
              
//               <div className="flex items-center gap-2">
//                 <Input
//                   value={inputText}
//                   onChange={(e) => setInputText(e.target.value)}
//                   placeholder={
//                     !isOnline 
//                       ? "Connect to internet to chat..." 
//                       : !isAuthenticated 
//                         ? "Log in to start chatting..."
//                         : "Ask me about products, prices, or comparisons..."
//                   }
//                   onKeyPress={handleKeyPress}
//                   className="flex-1 text-sm"
//                   disabled={isLoading || isRetrying || !isOnline}
//                   maxLength={1000}
//                 />
//                 <Button 
//                   onClick={() => handleSendMessage()}
//                   disabled={!inputText.trim() || isLoading || isRetrying || !isOnline}
//                   size="sm"
//                   className="shrink-0"
//                 >
//                   {isLoading || isRetrying ? (
//                     <RefreshCw className="h-4 w-4 animate-spin" />
//                   ) : (
//                     <Send className="h-4 w-4" />
//                   )}
//                 </Button>
//               </div>
              
//               {/* Character count for long messages */}
//               {inputText.length > 800 && (
//                 <div className="mt-1 text-xs text-gray-500 text-right">
//                   {inputText.length}/1000 characters
//                 </div>
//               )}
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </ErrorBoundary>
//   );
// };

// export default AIChatbot;



import { MessageCircle } from 'lucide-react';

const AIChatbot = () => {
  const handleClick = () => {
    window.location.href = '/chat';
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={handleClick}
        className="group relative bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50"
        aria-label="Open AI Chatbot"
      >
        <MessageCircle size={28} className="animate-pulse" />
        
        {/* Floating tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Chat with AI Assistant
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
        </div>
        
        {/* Ripple effect */}
        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-active:opacity-20 transition-opacity duration-150"></div>
        
        {/* Notification dot */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-bounce"></div>
      </button>
    </div>
  );
};

export default AIChatbot;