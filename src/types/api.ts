// src/types/api.ts

export interface ApiError {
  detail: string;
}

export interface ChatbotRequest {
  message: string;
}

export interface ChatbotResponse {
  reply: string;
}