// Frontend API Client for Backend Communication
import axios, { AxiosResponse } from "axios";

// Fix environment variable handling with fallback
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://chat-assessment-app-production.up.railway.app"
    : "http://localhost:4000");

console.log("🔧 API_BASE_URL set to:", API_BASE_URL);
console.log("🔧 NODE_ENV:", process.env.NODE_ENV);
console.log(
  "🔧 NEXT_PUBLIC_API_URL from env:",
  process.env.NEXT_PUBLIC_API_URL
);

// Add production warning
if (
  process.env.NODE_ENV === "production" &&
  API_BASE_URL.includes("localhost")
) {
  console.error("❌ PRODUCTION ERROR: API_BASE_URL still points to localhost!");
}

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`, // Add /api prefix
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptors for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(
      `✅ API Success: ${response.config.method?.toUpperCase()} ${
        response.config.baseURL
      }${response.config.url}`
    );
    return response;
  },
  (error) => {
    console.error(
      `❌ API Error: ${error.config?.method?.toUpperCase()} ${
        error.config?.baseURL
      }${error.config?.url}`
    );
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Types matching backend
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
  messageCount?: number; // Add message count from backend
  lastMessage?: BackendMessage;
}

export interface BackendMessage {
  id: string;
  text: string;
  sender: "user" | "assistant";
  type: "text" | "image" | "audio" | "file";
  timestamp: string;
  attachments?: BackendAttachment[];
}

export interface BackendAttachment {
  id: string;
  name: string;
  type: "image" | "audio" | "file";
  url: string;
  size: number;
  mimeType: string;
}

// API Client
export const chatApiClient = {
  // Conversations
  async getConversations(userId?: string): Promise<ConversationSummary[]> {
    const url = userId
      ? `/chat/conversations?userId=${userId}`
      : "/chat/conversations";
    const response = await api.get(url);
    // Handle both direct data and wrapped response
    const conversations = response.data.success
      ? response.data.data
      : response.data;
    console.log("API getConversations response:", conversations);
    return conversations || [];
  },

  async getConversationMessages(
    conversationId: string
  ): Promise<BackendMessage[]> {
    const response = await api.get(
      `/chat/messages?conversationId=${conversationId}`
    );
    // Backend returns { success, data: { items, nextCursor } }
    const data = response.data.success ? response.data.data : response.data;
    return data.items || data || [];
  },

  async createConversation(title?: string): Promise<BackendConversation> {
    // If no title provided, get one from the /title endpoint
    if (!title) {
      try {
        const titleResponse = await import("./api").then((module) =>
          module.getTitleFromEndpoint()
        );
        title = titleResponse.title;
      } catch (error) {
        console.error("Failed to get title from endpoint:", error);
        title = "New Chat"; // fallback
      }
    }

    const response = await api.post("/chat/conversations", { title });
    return response.data.success ? response.data.data : response.data;
  },

  async getConversation(id: string): Promise<BackendConversation> {
    const response = await api.get(`/chat/conversations/${id}`);
    return response.data.success ? response.data.data : response.data;
  },

  async deleteConversation(id: string): Promise<void> {
    try {
      const response = await api.delete(`/chat/conversations/${id}`);

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to delete conversation"
        );
      }

      console.log(`✅ Conversation ${id} deleted successfully`);
    } catch (error) {
      console.error("❌ Error deleting conversation:", error);
      throw error;
    }
  },

  // Messages
  async getMessages(
    conversationId: string,
    limit: number = 50,
    cursor?: string
  ) {
    const params = new URLSearchParams({
      conversationId,
      limit: limit.toString(),
    });
    if (cursor) params.set("cursor", cursor);

    const response = await api.get(`/chat/messages?${params}`);
    return response.data.data; // { items: Message[], nextCursor?: string }
  },

  // Send message (text)
  async sendTextMessage(
    conversationId: string,
    text: string
  ): Promise<{
    userMessage: BackendMessage;
    assistantMessage: BackendMessage;
  }> {
    try {
      const response = await api.post("/chat", {
        text,
        conversationId,
      });

      console.log("sendTextMessage raw response:", response.data); // Debug log

      if (!response.data.success) {
        throw new Error(response.data.message || "Server returned error");
      }

      // Validate response structure
      if (
        !response.data.data?.userMessage ||
        !response.data.data?.assistantMessage
      ) {
        console.error("Invalid response structure:", response.data);
        throw new Error("Invalid response structure from server");
      }

      // Backend returns { success, data: { userMessage, assistantMessage }, message }
      return response.data.data;
    } catch (error: any) {
      console.error("sendTextMessage error:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
      throw error;
    }
  },

  // Send message with file
  async sendFileMessage(
    conversationId: string,
    text: string,
    file: File
  ): Promise<{
    userMessage: BackendMessage;
    assistantMessage: BackendMessage;
  }> {
    try {
      const formData = new FormData();
      formData.append("text", text);
      formData.append("conversationId", conversationId);
      formData.append("files", file);

      const response = await api.post("/chat", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("sendFileMessage raw response:", response.data); // Debug log

      if (!response.data.success) {
        throw new Error(response.data.message || "Server returned error");
      }

      // Validate response structure
      if (
        !response.data.data?.userMessage ||
        !response.data.data?.assistantMessage
      ) {
        console.error("Invalid response structure:", response.data);
        throw new Error("Invalid response structure from server");
      }

      // Backend returns { success, data: { userMessage, assistantMessage }, message }
      return response.data.data;
    } catch (error: any) {
      console.error("sendFileMessage error:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
      throw error;
    }
  },

  // Utility endpoints
  async getRandomTitle(): Promise<{ title: string }> {
    const response = await api.get("/chat/title");
    return response.data;
  },

  async getThinking(): Promise<{ thinking: string }> {
    const response = await api.get("/chat/thinking");
    return response.data;
  },

  async healthCheck(): Promise<{ status: string }> {
    const response = await api.get("/health");
    return response.data;
  },
};

export default chatApiClient;
