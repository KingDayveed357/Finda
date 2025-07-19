// import { useState, useRef, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import { MessageCircle, Send, Bot, User, Sparkles, X, ExternalLink, Star, Truck, Clock } from 'lucide-react';

// // Type definitions
// interface PriceRange {
//   min?: number;
//   max?: number;
// }

// interface Listing {
//   id: string;
//   title: string;
//   description: string;
//   price: number | PriceRange;
//   rating: number;
//   category: string;
//   images: string[];
//   tags: string[];
// }

// interface ExternalProduct {
//   id: string;
//   title: string;
//   price: number | PriceRange;
//   rating: number;
//   platform: keyof typeof externalPlatforms;
//   image: string;
//   estimatedDelivery?: string;
// }

// interface ExternalPlatform {
//   name: string;
//   logo: string;
// }

// interface ProductComparison {
//   localAdvantages: string[];
//   externalAdvantages: string[];
// }

// interface UserIntent {
//   isComparison: boolean;
//   isPriceQuery: boolean;
//   isProductSearch: boolean;
//   isRecommendation: boolean;
//   category?: string;
//   priceRange?: PriceRange;
// }

// interface Message {
//   id: string;
//   text: string;
//   isBot: boolean;
//   timestamp: Date;
//   suggestions?: string[];
//   recommendations?: Listing[];
//   externalProducts?: ExternalProduct[];
//   comparison?: ProductComparison;
//   followUpQuestions?: string[];
// }

// // Mock data for demonstration
// const mockListings: Listing[] = [
//   {
//     id: '1',
//     title: 'Smartphone XYZ',
//     description: 'Latest smartphone with great features',
//     price: 299,
//     rating: 4.5,
//     category: 'electronics',
//     images: ['https://via.placeholder.com/150'],
//     tags: ['phone', 'smartphone', 'mobile']
//   },
//   {
//     id: '2',
//     title: 'Laptop ABC',
//     description: 'High-performance laptop for work',
//     price: { min: 599, max: 899 },
//     rating: 4.7,
//     category: 'electronics',
//     images: ['https://via.placeholder.com/150'],
//     tags: ['laptop', 'computer', 'work']
//   }
// ];

// const externalPlatforms: Record<string, ExternalPlatform> = {
//   jumia: { name: 'Jumia', logo: '🛒' },
//   amazon: { name: 'Amazon', logo: '📦' },
//   aliexpress: { name: 'AliExpress', logo: '🏪' }
// };

// const searchExternalProducts = async (_query: string, _category?: string): Promise<ExternalProduct[]> => {
//   // Mock external products
//   return [
//     {
//       id: 'ext1',
//       title: 'External Product 1',
//       price: 199,
//       rating: 4.2,
//       platform: 'jumia',
//       image: 'https://via.placeholder.com/150',
//       estimatedDelivery: '3-5 days'
//     },
//     {
//       id: 'ext2',
//       title: 'External Product 2',
//       price: 249,
//       rating: 4.6,
//       platform: 'amazon',
//       image: 'https://via.placeholder.com/150',
//       estimatedDelivery: '5-7 days'
//     }
//   ];
// };

// const generateProductComparison = (_local: Listing[], _external: ExternalProduct[]): ProductComparison => {
//   return {
//     localAdvantages: ['Faster delivery', 'Local support', 'No customs fees'],
//     externalAdvantages: ['Lower prices', 'Wider selection', 'International brands']
//   };
// };

// const AIChatbot = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState<Message[]>([
//     {
//       id: '1',
//       text: "Hello! I'm your AI shopping assistant for Finda. I can help you find the perfect products from both local vendors and popular platforms like Jumia, AliExpress, and Amazon. What are you looking for today?",
//       isBot: true,
//       timestamp: new Date(),
//       suggestions: [
//         "Find electronics under $200",
//         "Compare local vs online prices",
//         "Show me trending products",
//         "Help me choose between options"
//       ]
//     }
//   ]);
//   const [inputText, setInputText] = useState('');
//   const [isTyping, setIsTyping] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const analyzeUserIntent = (message: string): UserIntent => {
//     const lowerMessage = message.toLowerCase();
    
//     return {
//       isComparison: lowerMessage.includes('compare') || lowerMessage.includes('vs') || lowerMessage.includes('better'),
//       isPriceQuery: lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('budget') || lowerMessage.includes('cheap') || lowerMessage.includes('expensive'),
//       isProductSearch: lowerMessage.includes('find') || lowerMessage.includes('looking for') || lowerMessage.includes('need') || lowerMessage.includes('want'),
//       isRecommendation: lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('best') || lowerMessage.includes('should i'),
//       category: extractCategory(lowerMessage),
//       priceRange: extractPriceRange(lowerMessage)
//     };
//   };

//   const extractCategory = (message: string): string | undefined => {
//     const categories = ['electronics', 'fashion', 'home', 'services', 'automotive', 'health', 'sports'];
//     return categories.find(cat => message.includes(cat));
//   };

//   const extractPriceRange = (message: string): PriceRange | undefined => {
//     const priceMatch = message.match(/\$(\d+)(?:\s*-\s*\$?(\d+))?/);
//     if (priceMatch) {
//       const min = parseInt(priceMatch[1]);
//       const max = priceMatch[2] ? parseInt(priceMatch[2]) : undefined;
//       return max ? { min, max } : { max: min };
//     }
    
//     if (message.includes('under') || message.includes('below')) {
//       const underMatch = message.match(/(?:under|below)\s*\$?(\d+)/);
//       if (underMatch) return { max: parseInt(underMatch[1]) };
//     }
    
//     return undefined;
//   };

//   const generateFollowUpQuestions = (intent: UserIntent, hasResults: boolean): string[] => {
//     const questions: string[] = [];
    
//     if (hasResults) {
//       if (intent.isPriceQuery) {
//         questions.push("Would you like to see more budget-friendly options?");
//         questions.push("Should I include shipping costs in the comparison?");
//       }
//       if (intent.isProductSearch) {
//         questions.push("Do you have any specific brand preferences?");
//         questions.push("Would you like to see customer reviews for these products?");
//       }
//       if (!intent.isComparison) {
//         questions.push("Would you like me to compare local vs online options?");
//       }
//     } else {
//       questions.push("Could you be more specific about what you're looking for?");
//       questions.push("What's your budget range for this purchase?");
//       questions.push("Do you prefer local vendors or don't mind international shipping?");
//     }
    
//     return questions.slice(0, 2);
//   };

//   const formatPrice = (price: number | PriceRange): string => {
//     if (typeof price === 'number') {
//       return `$${price}`;
//     }
//     return `$${price.min}-$${price.max}`;
//   };

//   const generateBotResponse = async (userMessage: string): Promise<Message> => {
//     await new Promise(resolve => setTimeout(resolve, 1500));

//     const intent = analyzeUserIntent(userMessage);
//     let response = '';
//     let suggestions: string[] = [];
//     let recommendations: Listing[] = [];
//     let externalProducts: ExternalProduct[] = [];
//     let comparison: ProductComparison | undefined;

//     try {
//       // Search local products
//       if (intent.isProductSearch || intent.category) {
//         recommendations = mockListings.filter(listing => {
//           const matchesCategory = !intent.category || listing.category === intent.category;
//           const matchesPrice = !intent.priceRange || (
//             typeof listing.price === 'number' 
//               ? (!intent.priceRange.max || listing.price <= intent.priceRange.max) &&
//                 (!intent.priceRange.min || listing.price >= intent.priceRange.min)
//               : (!intent.priceRange.max || listing.price.min! <= intent.priceRange.max)
//           );
//           const matchesQuery = listing.title.toLowerCase().includes(userMessage.toLowerCase()) ||
//                               listing.description.toLowerCase().includes(userMessage.toLowerCase()) ||
//                               listing.tags.some(tag => userMessage.toLowerCase().includes(tag.toLowerCase()));
          
//           return matchesCategory && matchesPrice && (matchesQuery || intent.category);
//         }).slice(0, 3);

//         // Search external products
//         externalProducts = await searchExternalProducts(userMessage, intent.category);
//       }

//       // Generate response based on intent and results
//       if (intent.isComparison && recommendations.length > 0 && externalProducts.length > 0) {
//         response = "I found options from both local vendors and external platforms. Here's what I recommend:";
//         comparison = generateProductComparison(recommendations, externalProducts);
//         suggestions = ["Show more local options", "Find cheaper alternatives", "Check delivery times"];
//       } else if (intent.isPriceQuery) {
//         const hasLocal = recommendations.length > 0;
//         const hasExternal = externalProducts.length > 0;
        
//         if (hasLocal && hasExternal) {
//           response = `I found ${recommendations.length} local option(s) and ${externalProducts.length} external option(s) in your price range. Local vendors offer faster delivery, while external platforms often have lower prices.`;
//         } else if (hasLocal) {
//           response = `I found ${recommendations.length} local option(s) that match your budget. These offer fast delivery and local support.`;
//         } else if (hasExternal) {
//           response = `I found ${externalProducts.length} option(s) from external platforms that fit your budget. These might take longer to deliver but offer good value.`;
//         } else {
//           response = "I couldn't find exact matches in your price range, but here are some close alternatives:";
//           recommendations = mockListings.slice(0, 2);
//           externalProducts = await searchExternalProducts("popular products");
//         }
//         suggestions = ["Expand price range", "Show premium options", "Find discounts"];
//       } else if (intent.isRecommendation) {
//         response = "Based on your preferences, here are my top recommendations combining quality, price, and reliability:";
//         suggestions = ["Tell me more about top pick", "Show similar products", "Compare features"];
//       } else if (recommendations.length > 0 || externalProducts.length > 0) {
//         response = `Great! I found ${recommendations.length + externalProducts.length} option(s) for you. I've included both local vendors (faster delivery, local support) and external platforms (competitive prices, wider selection).`;
//         suggestions = ["Compare prices", "Check reviews", "Show delivery options"];
//       } else {
//         response = "I understand you're looking for products, but I need a bit more information to give you the best recommendations.";
//         suggestions = ["Browse popular categories", "Tell me your budget", "Show trending items"];
//       }

//       const followUpQuestions = generateFollowUpQuestions(intent, recommendations.length > 0 || externalProducts.length > 0);

//       return {
//         id: Date.now().toString(),
//         text: response,
//         isBot: true,
//         timestamp: new Date(),
//         suggestions,
//         recommendations,
//         externalProducts,
//         comparison,
//         followUpQuestions
//       };

//     } catch (error) {
//       console.error('Error generating enhanced bot response:', error);
//       return {
//         id: Date.now().toString(),
//         text: "I'm sorry, I encountered an issue while searching for products. Let me try a different approach - what specific type of product are you interested in?",
//         isBot: true,
//         timestamp: new Date(),
//         suggestions: ["Electronics", "Fashion", "Home & Garden", "Services"]
//       };
//     }
//   };

//   const handleSendMessage = async (text?: string) => {
//     const messageText = text || inputText.trim();
//     if (!messageText) return;

//     const userMessage: Message = {
//       id: Date.now().toString(),
//       text: messageText,
//       isBot: false,
//       timestamp: new Date()
//     };

//     setMessages(prev => [...prev, userMessage]);
//     setInputText('');
//     setIsTyping(true);

//     try {
//       const botResponse = await generateBotResponse(messageText);
//       setMessages(prev => [...prev, botResponse]);
//     } catch (error) {
//       console.error('Error generating bot response:', error);
//       const errorMessage: Message = {
//         id: Date.now().toString(),
//         text: "I'm sorry, I encountered an error. Please try rephrasing your question!",
//         isBot: true,
//         timestamp: new Date()
//       };
//       setMessages(prev => [...prev, errorMessage]);
//     } finally {
//       setIsTyping(false);
//     }
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   if (!isOpen) {
//     return (
//       <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
//         <Button
//           onClick={() => setIsOpen(true)}
//           className="rounded-full w-12 h-12 md:w-14 md:h-14 bg-blue-600 hover:bg-blue-700 shadow-lg"
//         >
//           <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <div className="fixed inset-0 md:inset-auto md:bottom-4 md:right-4 md:top-4 md:left-auto z-50 md:w-96 md:max-w-[calc(100vw-2rem)] flex flex-col overflow-hidden">
//       <Card className="flex-1 flex flex-col shadow-xl md:max-h-[calc(100vh-2rem)] bg-white overflow-hidden">
//         <CardHeader className="pb-3 shrink-0">
//           <div className="flex items-center justify-between">
//             <CardTitle className="flex items-center gap-2 text-base md:text-lg">
//               <Bot className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
//               AI Shopping Assistant
//               <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-yellow-500" />
//             </CardTitle>
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => setIsOpen(false)}
//               className="h-8 w-8 p-0"
//             >
//               <X className="h-4 w-4" />
//             </Button>
//           </div>
//         </CardHeader>
        
//         <CardContent className="flex-1 flex flex-col p-0 min-h-0 overflow-hidden">
//           <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-4 space-y-3 md:space-y-4 min-h-0">
//             {messages.map((message) => (
//               <div key={message.id} className="space-y-2 md:space-y-3">
//                 <div className={`flex items-start gap-2 ${message.isBot ? '' : 'flex-row-reverse'}`}>
//                   <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center shrink-0 ${
//                     message.isBot ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
//                   }`}>
//                     {message.isBot ? <Bot className="h-3 w-3 md:h-4 md:w-4" /> : <User className="h-3 w-3 md:h-4 md:w-4" />}
//                   </div>
//                   <div className={`flex-1 max-w-[calc(100%-3rem)] md:max-w-[80%] p-2 md:p-3 rounded-lg break-words ${
//                     message.isBot 
//                       ? 'bg-gray-100 text-gray-900' 
//                       : 'bg-blue-600 text-white'
//                   }`}>
//                     <p className="text-xs md:text-sm leading-relaxed break-words">{message.text}</p>
//                   </div>
//                 </div>

//                 {/* Local Products */}
//                 {message.recommendations && message.recommendations.length > 0 && (
//                   <div className="ml-8 md:ml-10 space-y-2 overflow-hidden">
//                     <p className="text-xs font-medium text-gray-600 flex items-center gap-1">
//                       <Truck className="h-3 w-3 shrink-0" />
//                       Local Vendors
//                     </p>
//                     <div className="space-y-1 md:space-y-2">
//                       {message.recommendations.map((listing) => (
//                         <div key={listing.id} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg text-xs md:text-sm border border-green-100 overflow-hidden">
//                           <img src={listing.images[0]} alt={listing.title} className="w-6 h-6 md:w-8 md:h-8 rounded object-cover shrink-0" />
//                           <div className="flex-1 min-w-0 overflow-hidden">
//                             <p className="font-medium text-green-800 truncate">{listing.title}</p>
//                             <div className="flex items-center gap-1 text-green-600 flex-wrap">
//                               <span className="text-xs shrink-0">{formatPrice(listing.price)}</span>
//                               <Star className="h-3 w-3 fill-current shrink-0" />
//                               <span className="text-xs shrink-0">{listing.rating}</span>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* External Products */}
//                 {message.externalProducts && message.externalProducts.length > 0 && (
//                   <div className="ml-8 md:ml-10 space-y-2 overflow-hidden">
//                     <p className="text-xs font-medium text-gray-600 flex items-center gap-1">
//                       <ExternalLink className="h-3 w-3 shrink-0" />
//                       External Platforms
//                     </p>
//                     <div className="space-y-1 md:space-y-2">
//                       {message.externalProducts.map((product) => (
//                         <div key={product.id} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg text-xs md:text-sm border border-blue-100 overflow-hidden">
//                           <img src={product.image} alt={product.title} className="w-6 h-6 md:w-8 md:h-8 rounded object-cover shrink-0" />
//                           <div className="flex-1 min-w-0 overflow-hidden">
//                             <p className="font-medium text-blue-800 truncate">{product.title}</p>
//                             <div className="flex items-center gap-1 md:gap-2 text-blue-600 text-xs flex-wrap">
//                               <span className="shrink-0">{formatPrice(product.price)}</span>
//                               <Badge variant="outline" className="text-xs px-1 py-0 hidden md:inline-flex shrink-0">
//                                 {externalPlatforms[product.platform]?.logo} {externalPlatforms[product.platform]?.name}
//                               </Badge>
//                               <div className="flex items-center gap-1 shrink-0">
//                                 <Star className="h-3 w-3 fill-current" />
//                                 <span>{product.rating}</span>
//                               </div>
//                               {product.estimatedDelivery && (
//                                 <div className="flex items-center gap-1 shrink-0">
//                                   <Clock className="h-3 w-3" />
//                                   <span className="hidden md:inline">{product.estimatedDelivery}</span>
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Comparison Summary */}
//                 {message.comparison && (
//                   <div className="ml-8 md:ml-10 p-2 md:p-3 bg-yellow-50 rounded-lg border border-yellow-100 overflow-hidden">
//                     <h4 className="text-xs md:text-sm font-medium text-yellow-800 mb-2">Quick Comparison</h4>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
//                       <div className="overflow-hidden">
//                         <p className="font-medium text-green-700">Local Benefits:</p>
//                         <ul className="text-green-600 space-y-1">
//                           {message.comparison.localAdvantages.slice(0, 2).map((advantage, idx) => (
//                             <li key={idx} className="break-words">• {advantage}</li>
//                           ))}
//                         </ul>
//                       </div>
//                       <div className="overflow-hidden">
//                         <p className="font-medium text-blue-700">External Benefits:</p>
//                         <ul className="text-blue-600 space-y-1">
//                           {message.comparison.externalAdvantages.slice(0, 2).map((advantage, idx) => (
//                             <li key={idx} className="break-words">• {advantage}</li>
//                           ))}
//                         </ul>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Follow-up Questions */}
//                 {message.followUpQuestions && message.followUpQuestions.length > 0 && (
//                   <div className="ml-8 md:ml-10 overflow-hidden">
//                     <p className="text-xs font-medium text-gray-600 mb-2">I can also help with:</p>
//                     <div className="flex flex-wrap gap-1 overflow-hidden">
//                       {message.followUpQuestions.map((question, index) => (
//                         <Badge
//                           key={index}
//                           variant="outline"
//                           className="cursor-pointer hover:bg-purple-50 text-xs py-1 px-2 shrink-0"
//                           onClick={() => handleSendMessage(question)}
//                         >
//                           {question}
//                         </Badge>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Suggestions */}
//                 {message.suggestions && message.suggestions.length > 0 && (
//                   <div className="ml-8 md:ml-10 flex flex-wrap gap-1 md:gap-2 overflow-hidden">
//                     {message.suggestions.map((suggestion, index) => (
//                       <Badge
//                         key={index}
//                         variant="outline"
//                         className="cursor-pointer hover:bg-blue-50 text-xs py-1 px-2 shrink-0"
//                         onClick={() => handleSendMessage(suggestion)}
//                       >
//                         {suggestion}
//                       </Badge>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ))}

//             {isTyping && (
//               <div className="flex items-center gap-2">
//                 <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
//                   <Bot className="h-3 w-3 md:h-4 md:w-4" />
//                 </div>
//                 <div className="bg-gray-100 p-2 md:p-3 rounded-lg">
//                   <div className="flex space-x-1">
//                     <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-500 rounded-full animate-bounce"></div>
//                     <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
//                     <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
//                   </div>
//                 </div>
//               </div>
//             )}
//             <div ref={messagesEndRef} />
//           </div>

//           <div className="p-3 md:p-4 border-t shrink-0">
//             <div className="flex items-center gap-2">
//               <Input
//                 value={inputText}
//                 onChange={(e) => setInputText(e.target.value)}
//                 placeholder="Ask me about products, prices, or comparisons..."
//                 onKeyPress={handleKeyPress}
//                 className="flex-1 text-sm"
//               />
//               <Button 
//                 onClick={() => handleSendMessage()}
//                 disabled={!inputText.trim() || isTyping}
//                 size="sm"
//                 className="shrink-0"
//               >
//                 <Send className="h-4 w-4" />
//               </Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default AIChatbot;