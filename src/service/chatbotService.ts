// services/chatbot.service.ts
/**
 * Chatbot Service
 * Handles all chatbot-related API communications including sending messages.
 */

import { httpClient } from '../utils/axios-client';
import { API_CONFIG } from '../config/api';
import type { 
  ChatbotRequest, 
  ChatbotResponse,
  // ApiError 
} from '../types/api';

class ChatbotService {
  async sendMessage(message: string): Promise<ChatbotResponse> {
    try {
      console.log('Sending message to chatbot:', message);

      const request: ChatbotRequest = {
        message: message.trim()
      };

      const response = await httpClient.post<ChatbotResponse>(
        API_CONFIG.ENDPOINTS.CHATBOT,
        request
      );

      console.log('Chatbot response received successfully');
      return response;
    } catch (error) {
      console.error('Failed to send message to chatbot:', error);
      throw error;
    }
  }

  async sendMessageWithRetry(message: string, maxRetries = 2): Promise<ChatbotResponse> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        console.log(`Chatbot message attempt ${attempt}/${maxRetries + 1}`);
        return await this.sendMessage(message);
      } catch (error: any) {
        lastError = error;
        console.warn(`Attempt ${attempt} failed:`, error);

        if (error.message?.includes('session has expired') || error.message?.includes('Access denied')) {
          throw error;
        }

        if (attempt === maxRetries + 1) break;

        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  private validateMessage(message: string): { isValid: boolean; error?: string } {
    if (!message || typeof message !== 'string') {
      return { isValid: false, error: 'Message is required and must be a string' };
    }

    const trimmedMessage = message.trim();

    if (trimmedMessage.length === 0) {
      return { isValid: false, error: 'Message cannot be empty' };
    }

    if (trimmedMessage.length > 1000) {
      return { isValid: false, error: 'Message is too long (maximum 1000 characters)' };
    }

    return { isValid: true };
  }

  async sendValidatedMessage(message: string): Promise<ChatbotResponse> {
    const validation = this.validateMessage(message);

    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    return this.sendMessage(message);
  }

  formatResponse(response: ChatbotResponse): {
    reply: string;
    formattedReply: string;
    timestamp: Date;
  } {
    return {
      reply: response.reply,
      formattedReply: this.formatText(response.reply),
      timestamp: new Date()
    };
  }

  private formatText(text: string): string {
    return text
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  }

  private handleChatbotError(error: any): string {
    if (error.response?.data?.detail) {
      return error.response.data.detail;
    }

    if (error.message?.includes('Network error')) {
      return 'Unable to connect to the chatbot. Please check your internet connection.';
    }

    if (error.message?.includes('timeout')) {
      return 'The chatbot is taking too long to respond. Please try again.';
    }

    if (error.message?.includes('session has expired')) {
      return 'Your session has expired. Please log in again to continue chatting.';
    }

    return 'Sorry, I encountered an error. Please try again.';
  }

  async sendMessageSafe(message: string): Promise<{
    success: boolean;
    response?: ChatbotResponse;
    error?: string;
  }> {
    try {
      const response = await this.sendValidatedMessage(message);
      return {
        success: true,
        response
      };
    } catch (error) {
      const errorMessage = this.handleChatbotError(error);
      console.error('Chatbot service error:', errorMessage);

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.sendMessage('ping');
      return true;
    } catch (error) {
      console.warn('Chatbot availability check failed:', error);
      return false;
    }
  }

  async getChatbotStatus(): Promise<{ status: string; version: string; uptime: number }> {
    try {
      console.log('Checking chatbot status...');

      const response = await httpClient.get<{ 
        status: string; 
        version: string; 
        uptime: number 
      }>('/chatbot/status/');

      console.log('Chatbot status retrieved:', response);
      return response;
    } catch (error) {
      console.error('Failed to get chatbot status:', error);
      throw error;
    }
  }

  async clearAllHistory(): Promise<void> {
    try {
      console.log('Clearing all chat history...');
      await httpClient.delete('/chatbot/history/clear/');
      console.log('All chat history cleared successfully');
    } catch (error) {
      console.error('Failed to clear chat history:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const chatbotService = new ChatbotService();
