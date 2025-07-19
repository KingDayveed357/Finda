export interface ChatbotRequest {
  message: string;
}

export interface ChatbotResponse {
  reply: string;
}

export interface ApiError {
  detail: string;
}