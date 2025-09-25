// Core types for the chat system
export interface User {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
}

export interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
  attachments?: Attachment[];
  isThinking?: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  type: "image" | "document" | "audio";
  url: string;
  size: number;
  mimeType: string;
  preview?: string; // For image thumbnails
  file?: File; // Original file object for uploading
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  messageCount?: number; // Number of messages from backend
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isOpen: boolean;
  isThinking: boolean;
  error: string | null;
}

export interface Settings {
  language: "en" | "ar";
  theme: "light" | "dark" | "system";
  fontSize: "small" | "medium" | "large";
  features: {
    audio: boolean;
    tts: boolean;
    thinkingIndicator: boolean;
  };
}

export interface LanguageState {
  language: "en" | "ar";
  direction: "ltr" | "rtl";
}

export interface ThemeState {
  theme: "light" | "dark" | "system";
  resolvedTheme: "light" | "dark";
}

// Translation interface
export interface Translations {
  [key: string]: {
    en: string;
    ar: string;
  };
}

// File upload types
export interface FileUploadState {
  files: File[];
  previews: string[];
  uploading: boolean;
  progress: number;
  error: string | null;
}

// API response types
export interface AssistantResponse {
  content: string;
  delay?: number;
  attachments?: Attachment[];
}
