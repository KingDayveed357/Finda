import { useState, useCallback, useEffect, useRef } from 'react';
import { apiClient } from '../utils/api';
import { authEvents } from './useAuth';
import type { Message } from '../types';

export const useChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authState, setAuthState] = useState(() => apiClient.isAuthenticated());
  
  // Use ref to track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  // Enhanced auth check with API validation
  const validateAuthState = useCallback(async (): Promise<boolean> => {
    try {
      // First check local token existence
      const hasToken = apiClient.isAuthenticated();
      if (!hasToken) return false;

      // Validate token with a lightweight API call
      // You can replace this with your actual auth validation endpoint
      const response = await fetch('/api/auth/validate', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // or however you store the token
        }
      });

      const isValid = response.ok;
      if (!isValid) {
        // Clear invalid token
        localStorage.removeItem('token'); // Adjust based on your storage method
      }
      
      return isValid;
    } catch (error) {
      console.error('Auth validation failed:', error);
      return false;
    }
  }, []);

  // Initialize messages based on auth status
  const initializeMessages = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    // Validate auth state with API
    const isAuth = await validateAuthState();
    
    // Update local auth state
    setAuthState(isAuth);
    
    const initialMessage: Message = {
      id: '1',
      text: isAuth 
        ? "Hello! I'm your AI shopping assistant for Finda. I can help you find the perfect products from both local vendors and popular platforms like Jumia, AliExpress, and Amazon. What are you looking for today?"
        : "Hello! To use the AI shopping assistant, please log in to your account first. Once you're logged in, I can help you find products, compare prices, and get personalized recommendations!",
      isBot: true,
      timestamp: new Date(),
      suggestions: isAuth 
        ? [
            "Find electronics under ₦50,000",
            "Compare local vs online prices",
            "Show me trending products",
            "Help me choose between options"
          ]
        : [],
      actionButtons: isAuth ? [] : [
        { text: "Log In", action: "navigate", url: "/auth/login" },
        { text: "Sign Up", action: "navigate", url: "/auth/signup" },
        { text: "Learn More", action: "navigate", url: "/about" }
      ]
    };
    
    setMessages([initialMessage]);
    setError(null); // Clear any previous errors when reinitializing
  }, [validateAuthState]);

  // Enhanced auth state listener with more robust checking
  useEffect(() => {
    isMountedRef.current = true;
    initializeMessages();
    
    // Listen for custom auth events from apiClient - Fixed event listener types
    const handleAuthStateChange = async (event: Event) => {
      const customEvent = event as CustomEvent;
      if (isMountedRef.current) {
        console.log('Auth state changed via custom event:', customEvent.detail);
        // Add a delay to ensure auth state is fully updated
        setTimeout(async () => {
          if (isMountedRef.current) {
            await initializeMessages();
          }
        }, 200);
      }
    };

    const handleTokenCleared = async (event: Event) => {
      const customEvent = event as CustomEvent;
      if (isMountedRef.current) {
        console.log('Token cleared via custom event:', customEvent.detail);
        setAuthState(false);
        setTimeout(async () => {
          if (isMountedRef.current) {
            await initializeMessages();
          }
        }, 200);
      }
    };
    
    // Listen for auth events from useAuth hook
    const unsubscribeAuthEvents = authEvents.subscribe(async () => {
      if (isMountedRef.current) {
        setTimeout(async () => {
          if (isMountedRef.current) {
            await initializeMessages();
          }
        }, 200);
      }
    });

    // Listen for custom events from apiClient
    window.addEventListener('auth-state-changed', handleAuthStateChange);
    window.addEventListener('auth-token-cleared', handleTokenCleared);
    
    // Also listen for storage events (for cross-tab auth sync)
    const handleStorageChange = async (e: StorageEvent) => {
      if (e.key === 'token' && isMountedRef.current) {
        setTimeout(async () => {
          if (isMountedRef.current) {
            await initializeMessages();
          }
        }, 200);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      isMountedRef.current = false;
      unsubscribeAuthEvents();
      window.removeEventListener('auth-state-changed', handleAuthStateChange);
      window.removeEventListener('auth-token-cleared', handleTokenCleared);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [initializeMessages]);

  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || !isMountedRef.current) return;

    // Double-check authentication with API validation before sending
    const isCurrentlyAuth = await validateAuthState();
    
    if (!isCurrentlyAuth) {
      if (!isMountedRef.current) return;
      
      // Update auth state immediately
      setAuthState(false);
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Your session has expired or you're not logged in. Please log in to your account to use the AI shopping assistant. Once you're authenticated, I'll be able to help you find products and compare prices!",
        isBot: true,
        timestamp: new Date(),
        error: "Authentication required",
        actionButtons: [
          { text: "Log In", action: "navigate", url: "/auth/login" },
          { text: "Sign Up", action: "navigate", url: "/auth/signup" }
        ]
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Reinitialize messages to show login prompt
      setTimeout(async () => {
        if (isMountedRef.current) {
          await initializeMessages();
        }
      }, 3000);
      
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isBot: false,
      timestamp: new Date()
    };

    if (!isMountedRef.current) return;
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.sendChatbotMessage(messageText);
      
      if (!isMountedRef.current) return;
      
      // Parse the bot response to extract structured data
      const botMessage = parseBotResponse(response.reply);
      
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      if (!isMountedRef.current) return;
      
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      
      let botResponseText = "I'm sorry, I encountered an error while processing your request.";
      let actionButtons: Array<{ text: string; action: string; url?: string }> = [
        { text: "Try Again", action: "retry" },
        { text: "Contact Support", action: "navigate", url: "/support" }
      ];

      // Handle specific authentication errors
      if (errorMessage.includes('session has expired') || 
          errorMessage.includes('log in again') || 
          errorMessage.includes('Authentication') || 
          errorMessage.includes('credentials') || 
          errorMessage.includes('401') || 
          errorMessage.includes('403') || 
          errorMessage.includes('Forbidden')) {
        
        botResponseText = "Your session has expired or you don't have permission to access this feature. Please log in again to continue using the AI shopping assistant.";
        actionButtons = [
          { text: "Log In", action: "navigate", url: "/auth/login" },
          { text: "Sign Up", action: "navigate", url: "/auth/signup" }
        ];
        
        // Update auth state immediately
        setAuthState(false);
        
        // Clear any stale tokens
        localStorage.removeItem('token'); // Adjust based on your storage method
        
        // Reinitialize messages after a short delay to ensure auth state is updated
        setTimeout(async () => {
          if (isMountedRef.current) {
            await initializeMessages();
          }
        }, 2000);
      }
      
      // Add error message to chat
      const errorBotMessage: Message = {
        id: Date.now().toString(),
        text: botResponseText,
        isBot: true,
        timestamp: new Date(),
        error: errorMessage,
        actionButtons: actionButtons
      };
      
      setMessages(prev => [...prev, errorBotMessage]);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [validateAuthState]);

  const parseBotResponse = (reply: string): Message => {
    const message: Message = {
      id: Date.now().toString(),
      text: reply,
      isBot: true,
      timestamp: new Date(),
      recommendations: [],
      externalProducts: [],
      suggestions: []
    };

    // Parse products from the reply
    const productLinks = reply.match(/Link: (https?:\/\/[^\s]+)/g);
    if (productLinks) {
      // Extract product information from the reply
      const productMatches = reply.match(/- (.+?) — (₦[\d,]+)/g);
      if (productMatches) {
        message.recommendations = productMatches.map((match, index) => {
          const [, title, price] = match.match(/- (.+?) — (₦[\d,]+)/) || [];
          return {
            id: `product-${index}`,
            title: title || 'Product',
            description: '',
            price: parsePrice(price),
            rating: 4.5,
            category: 'general',
            images: ['https://via.placeholder.com/150'],
            tags: [],
            link: productLinks[index]?.replace('Link: ', '')
          };
        });
      }
    }

    // Add contextual suggestions based on the reply
    if (reply.includes('external stores')) {
      message.suggestions = ['Show external options', 'Compare prices', 'Check delivery times'];
    } else if (reply.includes('found')) {
      message.suggestions = ['Show more details', 'Compare similar products', 'Check reviews'];
    } else {
      message.suggestions = ['Browse categories', 'Search products', 'Get recommendations'];
    }

    // Add follow-up questions
    if (message.recommendations && message.recommendations.length > 0) {
      message.followUpQuestions = [
        'Would you like more details about any of these products?',
        'Should I search for similar items in different price ranges?'
      ];
    }

    return message;
  };

  const parsePrice = (priceStr: string): number => {
    return parseInt(priceStr.replace(/[₦,]/g, '')) || 0;
  };

  const clearMessages = useCallback(async () => {
    if (!isMountedRef.current) return;
    await initializeMessages();
    setError(null);
  }, [initializeMessages]);

  // Method to refresh chatbot state when user logs in/out
  const refreshChatbotState = useCallback(async () => {
    if (!isMountedRef.current) return;
    await initializeMessages();
  }, [initializeMessages]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    refreshChatbotState,
    isAuthenticated: authState // Use local auth state instead of calling apiClient directly
  };
};