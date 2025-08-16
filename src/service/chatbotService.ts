// services/chatbot-service.ts
/**
 * Chatbot API Service
 * Service for interacting with the AI-powered shopping assistant chatbot API.
 * Provides methods for chat interactions, file uploads, conversation management,
 * and feedback submission with comprehensive error handling.
 */

import { httpClient } from '../utils/http-client';
import { API_CONFIG } from '@/config/api';
// import type { AxiosRequestConfig } from 'axios';

// ===== TYPE DEFINITIONS =====

export interface UserLocation {
  country: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface ChatMessage {
  message: string;
  message_type: 'text' | 'image' | 'voice' | 'file';
  session_id?: string;
  language?: string;
  enable_tts?: boolean;
  user_location?: UserLocation;
}

export interface SearchResults {
  local: {
    products: Array<{
      id: number;
      name: string;
      price: number;
      formatted_price: string;
      url: string;
    }>;
    services: Array<any>;
    total: number;
  };
  external: {
    products: Array<{
      title: string;
      url: string;
      price: string;
      source: string;
    }>;
    services: Array<any>;
    total: number;
  };
}

export interface SuggestedAction {
  action: string;
  label: string;
  description: string;
}

export interface ChatResponse {
  success: boolean;
  message_id: string;
  session_id: string;
  response: string;
  message_type: string;
  metadata: {
    processing_time: number;
    search_strategy: string;
    confidence_score: number;
    services_used: string[];
    has_external_results: boolean;
  };
  search_results?: SearchResults;
  suggested_actions?: SuggestedAction[];
  timestamp: string;
}

export interface ImageAnalysisResponse {
  success: boolean;
  image_analysis: Record<string, any>;
  message: string;
}

export interface VoiceTranscriptionResponse {
  success: boolean;
  transcription: {
    text: string;
    confidence: number;
    language: string;
  };
  audio_info: {
    duration: number;
    format: string;
    quality: string;
  };
}

export interface ConversationMessage {
  id: string;
  chat_session: string;
  session_info: Record<string, any>;
  message_type: string;
  sender_type: string;
  content: string;
  image?: string;
  voice_file?: string;
  attachment?: string;
  attachments?: Array<{
    type: string;
    url: string;
    filename: string;
  }>;
  search_mode: string;
  response_time: number;
  confidence_score: number;
  search_results_count: number;
  context_data: Record<string, any>;
  intent_detected?: string;
  has_search_results: boolean;
  feedback_summary: Record<string, any>;
  is_active: boolean;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  id: string;
  session_id: string;
  user: number;
  user_display: string;
  title: string;
  status: string;
  user_preferences: Record<string, any>;
  search_context: Record<string, any>;
  location_context: Record<string, any>;
  messages_count: number;
  last_message: Record<string, any>;
  duration: number;
  created_at: string;
  updated_at: string;
  last_activity: string;
}

export interface ConversationHistoryResponse {
  success: boolean;
  session: ChatSession;
  messages: ConversationMessage[];
  pagination: {
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

export interface FeedbackSubmission {
  message_id: string;
  feedback_type: 'thumbs_up' | 'thumbs_down' | 'rating' | 'comment';
  rating?: number;
  comment?: string;
  accuracy_rating?: number;
  helpfulness_rating?: number;
  speed_rating?: number;
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
  feedback_id: string;
  created: boolean;
}

export interface SystemStatus {
  status: string;
  timestamp: string;
  version: string;
  daily_stats: {
    sessions_today: number;
    messages_today: number;
    active_sessions: number;
  };
  configuration: Record<string, any>;
}

export interface HealthCheck {
  status: string;
  service: string;
  timestamp: string;
  version: string;
  services: {
    database: string;
    cache: string;
    local_search: string;
    web_search: string;
  };
}

export interface ApiError {
  success: false;
  error: string;
  error_code: string;
  details: Record<string, any>;
  timestamp: string;
}

// ===== CHATBOT SERVICE CLASS =====

/**
 * Main chatbot service class
 * Provides methods for all chatbot API interactions
 */
export class ChatbotService {
//   private readonly baseEndpoint = '/chatbot/api';

  /**
   * Initialize the chatbot service and CSRF token
   */
  async initialize(): Promise<void> {
    try {
      await httpClient.initializeCSRF();
      console.log('Chatbot service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize chatbot service:', error);
      throw error;
    }
  }

  // ===== CHAT METHODS =====

  /**
   * Get API information
   * @returns Promise resolving to API information
   */
  async getApiInfo(): Promise<{
    success: boolean;
    message: string;
    endpoints: Record<string, any>;
    version: string;
  }> {
    try {
      const response = await httpClient.get(API_CONFIG.ENDPOINTS.CHATBOT.MAIN);
      return response;
    } catch (error) {
      console.error('Failed to get API info:', error);
      throw error;
    }
  }

  /**
   * Send a message to the chatbot
   * @param message - Chat message data
   * @returns Promise resolving to chatbot response
   */
  async sendMessage(message: ChatMessage): Promise<ChatResponse> {
    try {
      console.log('Sending message to chatbot:', { 
        type: message.message_type, 
        sessionId: message.session_id,
        hasLocation: !!message.user_location 
      });

      const response = await httpClient.post<ChatResponse>(
       API_CONFIG.ENDPOINTS.CHATBOT.MAIN ,
        message
      );

      console.log('Chatbot response received:', {
        messageId: response.message_id,
        processingTime: response.metadata?.processing_time,
        strategy: response.metadata?.search_strategy,
        confidence: response.metadata?.confidence_score
      });

      return response;
    } catch (error) {
      console.error('Failed to send message to chatbot:', error);
      throw error;
    }
  }

  /**
   * Send a text message to the chatbot
   * @param text - Message text
   * @param options - Additional options
   * @returns Promise resolving to chatbot response
   */
  async sendTextMessage(
    text: string,
    options: {
      session_id?: string;
      language?: string;
      enable_tts?: boolean;
      user_location?: UserLocation;
    } = {}
  ): Promise<ChatResponse> {
    const message: ChatMessage = {
      message: text,
      message_type: 'text',
      ...options,
    };

    return this.sendMessage(message);
  }

  // ===== FILE UPLOAD METHODS =====

  /**
   * Upload an image for analysis and product search
   * @param imageFile - Image file to analyze
   * @param contextMessage - Optional context message
   * @returns Promise resolving to image analysis results
   */
  async uploadImage(
    imageFile: File,
    contextMessage?: string
  ): Promise<ImageAnalysisResponse> {
    try {
      // Validate image file
      this.validateImageFile(imageFile);

      console.log('Uploading image for analysis:', {
        filename: imageFile.name,
        size: imageFile.size,
        type: imageFile.type,
        hasContext: !!contextMessage
      });

      const formData = new FormData();
      formData.append('image', imageFile);
      if (contextMessage) {
        formData.append('message', contextMessage);
      }

      const response = await httpClient.post<ImageAnalysisResponse>(
       API_CONFIG.ENDPOINTS.CHATBOT.FILE_UPLOADS,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Image analysis completed successfully');
      return response;
    } catch (error) {
      console.error('Failed to upload image:', error);
      throw error;
    }
  }

  /**
   * Upload a voice note for transcription
   * @param voiceFile - Voice file to transcribe
   * @param language - Expected language (optional, auto-detected if not provided)
   * @returns Promise resolving to transcription results
   */
  async uploadVoice(
    voiceFile: File,
    language?: string
  ): Promise<VoiceTranscriptionResponse> {
    try {
      // Validate voice file
      this.validateVoiceFile(voiceFile);

      console.log('Uploading voice note for transcription:', {
        filename: voiceFile.name,
        size: voiceFile.size,
        type: voiceFile.type,
        language: language || 'auto-detect'
      });

      const formData = new FormData();
      formData.append('voice', voiceFile);
      if (language) {
        formData.append('language', language);
      }

      const response = await httpClient.post<VoiceTranscriptionResponse>(
        API_CONFIG.ENDPOINTS.CHATBOT.VOICE_NOTE,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Voice transcription completed:', {
        text: response.transcription.text.substring(0, 100),
        confidence: response.transcription.confidence,
        language: response.transcription.language,
        duration: response.audio_info.duration
      });

      return response;
    } catch (error) {
      console.error('Failed to upload voice note:', error);
      throw error;
    }
  }

  // ===== CONVERSATION MANAGEMENT =====

  /**
   * Get conversation history for a specific session
   * @param sessionId - Chat session ID
   * @param page - Page number for pagination
   * @param pageSize - Number of messages per page
   * @returns Promise resolving to conversation history
   */
  async getConversationHistory(
    sessionId: string,
    page: number = 1,
    pageSize: number = 50
  ): Promise<ConversationHistoryResponse> {
    try {
      console.log('Fetching conversation history:', {
        sessionId,
        page,
        pageSize
      });

      const response = await httpClient.get<ConversationHistoryResponse>(
        `${API_CONFIG.ENDPOINTS.CHATBOT.CONVERSATIONS}/${sessionId}/`,
        {
          params: {
            page,
            page_size: pageSize,
          },
        }
      );

      console.log('Conversation history retrieved:', {
        sessionId: response.session.session_id,
        messagesCount: response.messages.length,
        totalCount: response.pagination.total_count,
        totalPages: response.pagination.total_pages
      });

      return response;
    } catch (error) {
      console.error('Failed to get conversation history:', error);
      throw error;
    }
  }

  /**
   * Get conversation history with advanced filtering
   * @param sessionId - Chat session ID
   * @param options - Filtering and pagination options
   * @returns Promise resolving to filtered conversation history
   */
  async getFilteredConversationHistory(
    sessionId: string,
    options: {
      page?: number;
      pageSize?: number;
      messageType?: string;
      senderType?: 'user' | 'bot';
      hasSearchResults?: boolean;
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<ConversationHistoryResponse> {
    try {
      const queryParams: Record<string, any> = {
        page: options.page || 1,
        page_size: options.pageSize || 50,
      };

      // Add optional filters
      if (options.messageType) queryParams.message_type = options.messageType;
      if (options.senderType) queryParams.sender_type = options.senderType;
      if (options.hasSearchResults !== undefined) {
        queryParams.has_search_results = options.hasSearchResults;
      }
      if (options.startDate) queryParams.start_date = options.startDate;
      if (options.endDate) queryParams.end_date = options.endDate;

      console.log('Fetching filtered conversation history:', {
        sessionId,
        filters: queryParams
      });

      const response = await httpClient.get<ConversationHistoryResponse>(
        `${API_CONFIG.ENDPOINTS.CHATBOT.CONVERSATIONS}/${sessionId}/`,
        { params: queryParams }
      );

      return response;
    } catch (error) {
      console.error('Failed to get filtered conversation history:', error);
      throw error;
    }
  }

  // ===== FEEDBACK METHODS =====

  /**
   * Submit feedback for a bot response
   * @param feedback - Feedback data
   * @returns Promise resolving to feedback submission result
   */
  async submitFeedback(feedback: FeedbackSubmission): Promise<FeedbackResponse> {
    try {
      console.log('Submitting feedback:', {
        messageId: feedback.message_id,
        type: feedback.feedback_type,
        rating: feedback.rating,
        hasComment: !!feedback.comment
      });

      const response = await httpClient.post<FeedbackResponse>(
        API_CONFIG.ENDPOINTS.CHATBOT.FEEDBACK,
        feedback
      );

      console.log('Feedback submitted successfully:', {
        feedbackId: response.feedback_id,
        created: response.created
      });

      return response;
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      throw error;
    }
  }

  /**
   * Submit quick thumbs up/down feedback
   * @param messageId - Message ID to provide feedback for
   * @param isPositive - True for thumbs up, false for thumbs down
   * @returns Promise resolving to feedback submission result
   */
  async submitQuickFeedback(
    messageId: string,
    isPositive: boolean
  ): Promise<FeedbackResponse> {
    const feedback: FeedbackSubmission = {
      message_id: messageId,
      feedback_type: isPositive ? 'thumbs_up' : 'thumbs_down',
    };

    return this.submitFeedback(feedback);
  }

  /**
   * Submit detailed rating feedback
   * @param messageId - Message ID to provide feedback for
   * @param ratings - Rating scores for different categories
   * @param comment - Optional comment
   * @returns Promise resolving to feedback submission result
   */
  async submitRatingFeedback(
    messageId: string,
    ratings: {
      overall?: number;
      accuracy?: number;
      helpfulness?: number;
      speed?: number;
    },
    comment?: string
  ): Promise<FeedbackResponse> {
    const feedback: FeedbackSubmission = {
      message_id: messageId,
      feedback_type: 'rating',
      rating: ratings.overall,
      accuracy_rating: ratings.accuracy,
      helpfulness_rating: ratings.helpfulness,
      speed_rating: ratings.speed,
      comment,
    };

    return this.submitFeedback(feedback);
  }

  // ===== SYSTEM STATUS METHODS =====

  /**
   * Get chatbot system status and daily statistics
   * @returns Promise resolving to system status
   */
  async getSystemStatus(): Promise<SystemStatus> {
    try {
      console.log('Fetching system status...');

      const response = await httpClient.get<SystemStatus>(
       API_CONFIG.ENDPOINTS.CHATBOT.STATUS
      );

      console.log('System status retrieved:', {
        status: response.status,
        sessionsToday: response.daily_stats.sessions_today,
        messagesToday: response.daily_stats.messages_today,
        activeSessions: response.daily_stats.active_sessions
      });

      return response;
    } catch (error) {
      console.error('Failed to get system status:', error);
      throw error;
    }
  }

  /**
   * Perform health check
   * @returns Promise resolving to health check results
   */
  async getHealthCheck(): Promise<HealthCheck> {
    try {
      console.log('Performing health check...');

      const response = await httpClient.get<HealthCheck>(
        API_CONFIG.ENDPOINTS.CHATBOT.HEALTH
      );

      console.log('Health check completed:', {
        status: response.status,
        services: response.services
      });

      return response;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Generate a new session ID
   * @returns A new UUID for session management
   */
  generateSessionId(): string {
    return crypto.randomUUID();
  }

  /**
   * Validate image file before upload
   * @param file - Image file to validate
   * @throws Error if file is invalid
   */
  private validateImageFile(file: File): void {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/bmp'
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        `Invalid image type: ${file.type}. Supported formats: JPEG, PNG, GIF, WebP, BMP`
      );
    }

    if (file.size > maxSize) {
      throw new Error(`Image too large: ${file.size} bytes. Maximum size: ${maxSize} bytes (10MB)`);
    }
  }

  /**
   * Validate voice file before upload
   * @param file - Voice file to validate
   * @throws Error if file is invalid
   */
  private validateVoiceFile(file: File): void {
    const maxSize = 25 * 1024 * 1024; // 25MB
    const allowedTypes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'audio/webm',
      'audio/mp4',
      'audio/m4a',
      'audio/flac'
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        `Invalid voice file type: ${file.type}. Supported formats: MP3, WAV, OGG, WebM, MP4, M4A, FLAC`
      );
    }

    if (file.size > maxSize) {
      throw new Error(`Voice file too large: ${file.size} bytes. Maximum size: ${maxSize} bytes (25MB)`);
    }
  }

  /**
   * Format error message from API error response
   * @param error - Error object
   * @returns Formatted error message
   */
  // private formatErrorMessage(error: any): string {
  //   if (error.response?.data) {
  //     const apiError = error.response.data as ApiError;
  //     return apiError.error || 'An unexpected error occurred';
  //   }
  //   return error.message || 'Network error occurred';
  // }
}

// ===== SINGLETON EXPORT =====

/**
 * Singleton instance of the chatbot service
 * Use this for all chatbot API interactions
 */
export const chatbotService = new ChatbotService();

// ===== CONVENIENCE FUNCTIONS =====

/**
 * Quick function to send a text message
 * @param text - Message text
 * @param sessionId - Optional session ID
 * @param userLocation - Optional user location
 * @returns Promise resolving to chatbot response
 */
export const sendQuickMessage = async (
  text: string,
  sessionId?: string,
  userLocation?: UserLocation
): Promise<ChatResponse> => {
  return chatbotService.sendTextMessage(text, {
    session_id: sessionId,
    user_location: userLocation,
  });
};

/**
 * Quick function to get conversation history
 * @param sessionId - Chat session ID
 * @param page - Page number (default: 1)
 * @returns Promise resolving to conversation history
 */
export const getQuickHistory = async (
  sessionId: string,
  page: number = 1
): Promise<ConversationHistoryResponse> => {
  return chatbotService.getConversationHistory(sessionId, page);
};

/**
 * Quick function to submit thumbs up feedback
 * @param messageId - Message ID
 * @returns Promise resolving to feedback result
 */
export const thumbsUp = async (messageId: string): Promise<FeedbackResponse> => {
  return chatbotService.submitQuickFeedback(messageId, true);
};

/**
 * Quick function to submit thumbs down feedback
 * @param messageId - Message ID
 * @returns Promise resolving to feedback result
 */
export const thumbsDown = async (messageId: string): Promise<FeedbackResponse> => {
  return chatbotService.submitQuickFeedback(messageId, false);
};

// Export types for external use
// export type {
//   ChatMessage,
//   ChatResponse,
//   SearchResults,
//   SuggestedAction,
//   ConversationHistoryResponse,
//   ConversationMessage,
//   ChatSession,
//   FeedbackSubmission,
//   FeedbackResponse,
//   ImageAnalysisResponse,
//   VoiceTranscriptionResponse,
//   SystemStatus,
//   HealthCheck,
//   UserLocation,
//   ApiError,
// };