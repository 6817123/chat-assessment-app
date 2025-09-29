export type {
  Message,
  Attachment,
  Conversation,
  ChatState,
  Settings,
  LanguageState,
  ThemeState,
  Translations,
  FileUploadState,
  AssistantResponse,
} from "@/lib/types";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  count?: number;
}
