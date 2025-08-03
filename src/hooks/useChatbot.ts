import { useState, useCallback, useEffect, useRef } from 'react';
import { tokenManager } from '../utils/token-manager';
import { authEvents } from './useAuth';
import { chatbotService } from '@/service/chatbotService';
import type { Message } from '../types';

export const useChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authState, setAuthState] = useState(() => tokenManager.isAuthenticated());
  
  // Use ref to track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  // Enhanced auth check with API validation
  const validateAuthState = useCallback(async (): Promise<boolean> => {
    try {
      // First check local token existence
      const hasToken = tokenManager.isAuthenticated();
      if (!hasToken) return false;

      // Validate token with a lightweight API call
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${tokenManager.getToken()}`
        }
      });

      const isValid = response.ok;
      if (!isValid) {
        // Clear invalid token
        tokenManager.clearToken();
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
        { label: "Log In", action: "navigate", payload: "/auth/login" },
        { label: "Sign Up", action: "navigate", payload: "/auth/signup" },
        { label: "Learn More", action: "navigate", payload: "/about" }
      ]
    };
    
    setMessages([initialMessage]);
    setError(null);
  }, [validateAuthState]);

  // Enhanced auth state listener
  useEffect(() => {
    isMountedRef.current = true;
    initializeMessages();
    
    // Listen for custom auth events from tokenManager
    const handleAuthStateChange = async (event: Event) => {
      const customEvent = event as CustomEvent;
      if (isMountedRef.current) {
        console.log('Auth state changed via custom event:', customEvent.detail);
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

    // Listen for custom events from tokenManager
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
          { label: "Log In", action: "navigate", payload: "/auth/login" },
          { label: "Sign Up", action: "navigate", payload: "/auth/signup" }
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
      // Use chatbotService with safe method that includes error handling
      const result = await chatbotService.sendMessageSafe(messageText);
      
      if (!isMountedRef.current) return;
      
      if (result.success && result.response) {
        // Parse the bot response to extract structured data
        const botMessage = parseBotResponse(result.response.reply);
        setMessages(prev => [...prev, botMessage]);
      } else {
        // Handle service-level errors
        throw new Error(result.error || 'Unknown error occurred');
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      
      let botResponseText = "I'm sorry, I encountered an error while processing your request.";
      let actionButtons: Array<{ label: string; action: string; payload?: any }> = [
        { label: "Try Again", action: "retry" },
        { label: "Contact Support", action: "navigate", payload: "/support" }
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
          { label: "Log In", action: "navigate", payload: "/auth/login" },
          { label: "Sign Up", action: "navigate", payload: "/auth/signup" }
        ];
        
        // Update auth state immediately
        setAuthState(false);
        
        // Clear any stale tokens
        tokenManager.clearToken();
        
        // Reinitialize messages after a short delay
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
    
    try {
      // Clear chat history on the server
      await chatbotService.clearAllHistory();
    } catch (error) {
      console.warn('Failed to clear server chat history:', error);
      // Continue with local clearing even if server clear fails
    }
    
    await initializeMessages();
    setError(null);
  }, [initializeMessages]);

  // Method to refresh chatbot state when user logs in/out
  const refreshChatbotState = useCallback(async () => {
    if (!isMountedRef.current) return;
    await initializeMessages();
  }, [initializeMessages]);

  // Check chatbot availability
  const checkAvailability = useCallback(async (): Promise<boolean> => {
    try {
      return await chatbotService.isAvailable();
    } catch (error) {
      console.error('Failed to check chatbot availability:', error);
      return false;
    }
  }, []);

  // Get chatbot status
  const getChatbotStatus = useCallback(async () => {
    try {
      return await chatbotService.getChatbotStatus();
    } catch (error) {
      console.error('Failed to get chatbot status:', error);
      return null;
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    refreshChatbotState,
    checkAvailability,
    getChatbotStatus,
    isAuthenticated: authState
  };
};