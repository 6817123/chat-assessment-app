import axios, { AxiosResponse } from "axios";
import type {
  BackendConversation,
  ConversationSummary,
  BackendMessage,
  BackendAttachment,
  PaginatedMessages,
} from "./apiTypes";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://chat-assessment-app-production.up.railway.app"
    : "http://localhost:4000");

if (
  process.env.NODE_ENV === "production" &&
  API_BASE_URL.includes("localhost")
) {
  console.error("❌ PRODUCTION ERROR: API_BASE_URL still points to localhost!");
}

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response: AxiosResponse) => {
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

export const chatApiClient = {
  async getConversations(userId?: string): Promise<ConversationSummary[]> {
    const url = userId
      ? `/chat/conversations?userId=${userId}`
      : "/chat/conversations";
    const response = await api.get(url);
    const conversations = response.data.success
      ? response.data.data
      : response.data;
    return conversations || [];
  },

  async getConversationMessages(
    conversationId: string
  ): Promise<BackendMessage[]> {
    const response = await api.get(
      `/chat/messages?conversationId=${conversationId}`
    );
    const data = response.data.success ? response.data.data : response.data;
    return data.items || data || [];
  },

  async createConversation(title?: string): Promise<BackendConversation> {
    // If no title provided, get one from the /title endpoint
    if (!title) {
      try {
        const resp = await api.get("/chat/title");
        title = resp.data.title || "New Chat";
      } catch (error) {
        console.error("Failed to get title from /chat/title endpoint:", error);
        title = "New Chat";
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
  ): Promise<PaginatedMessages> {
    const params = new URLSearchParams({
      conversationId,
      limit: limit.toString(),
    });
    if (cursor) params.set("cursor", cursor);

    const response = await api.get(`/chat/messages?${params}`);
    return response.data.data;
  },

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

      if (!response.data.success) {
        throw new Error(response.data.message || "Server returned error");
      }

      if (
        !response.data.data?.userMessage ||
        !response.data.data?.assistantMessage
      ) {
        console.error("Invalid response structure:", response.data);
        throw new Error("Invalid response structure from server");
      }

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

      if (!response.data.success) {
        throw new Error(response.data.message || "Server returned error");
      }

      if (
        !response.data.data?.userMessage ||
        !response.data.data?.assistantMessage
      ) {
        console.error("Invalid response structure:", response.data);
        throw new Error("Invalid response structure from server");
      }

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
