export interface BackendAttachment {
  id: string;
  name: string;
  type: "image" | "audio" | "file";
  url: string;
  size: number;
  mimeType: string;
}

export interface BackendMessage {
  id: string;
  text: string;
  sender: "user" | "assistant";
  type: "text" | "image" | "audio" | "file";
  timestamp: string;
  attachments?: BackendAttachment[];
}

export interface BackendConversation {
  id: string;
  title: string;
  created: string;
  messages: BackendMessage[];
}

export interface ConversationSummary {
  id: string;
  title: string;
  created: string;
  messageCount?: number;
  lastMessage?: BackendMessage;
}

export interface PaginatedMessages {
  items: BackendMessage[];
  nextCursor: string | null;
}

export interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorEnvelope {
  success: false;
  message: string;
  error?: string;
}

export type ApiEnvelope<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope;
