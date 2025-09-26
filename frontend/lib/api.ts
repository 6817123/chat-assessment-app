import axios from "axios";
import type { ApiResponse, User, Message } from "@/types";

// Force port 4000 - Backend runs on port 4000
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL!;
console.log("🔧 API_BASE_URL (api.ts) set to:", API_BASE_URL);

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error("API Response Error:", error.response?.data || error.message);

    // Log more details about the error
    if (error.code) {
      console.error("Error code:", error.code);
    }

    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    } else if (error.request) {
      console.error("No response received. Request:", error.request);
      console.error(
        "Possible causes: Server not running, network issues, or CORS problems"
      );
    } else {
      console.error("Request setup error:", error.message);
    }

    return Promise.reject(error);
  }
);

export const userApi = {
  // Get all users
  getUsers: async (): Promise<ApiResponse<User[]>> => {
    const response = await api.get("/users");
    return response.data;
  },

  // Get user by ID
  getUser: async (id: string): Promise<ApiResponse<User>> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Create new user
  createUser: async (userData: {
    username: string;
    email: string;
    displayName: string;
    avatar?: string;
  }): Promise<ApiResponse<User>> => {
    const response = await api.post("/users", userData);
    return response.data;
  },

  // Update user online status
  updateUserStatus: async (
    id: string,
    isOnline: boolean
  ): Promise<ApiResponse<User>> => {
    const response = await api.put(`/users/${id}/status`, { isOnline });
    return response.data;
  },
};

export const messageApi = {
  // Get messages for a conversation
  getConversationMessages: async (
    conversationId: string,
    limit: number = 50,
    skip: number = 0
  ): Promise<ApiResponse<Message[]>> => {
    const response = await api.get(`/messages/${conversationId}`, {
      params: { limit, skip },
    });
    return response.data;
  },

  // Send new message
  sendMessage: async (messageData: {
    sender: string;
    receiver: string;
    text: string;
    messageType?: string;
  }): Promise<ApiResponse<Message>> => {
    const response = await api.post("/messages", messageData);
    return response.data;
  },

  // Mark message as read
  markMessageAsRead: async (
    messageId: string
  ): Promise<ApiResponse<Message>> => {
    const response = await api.put(`/messages/${messageId}/read`);
    return response.data;
  },

  // Edit message
  editMessage: async (
    messageId: string,
    text: string
  ): Promise<ApiResponse<Message>> => {
    const response = await api.put(`/messages/${messageId}`, { text });
    return response.data;
  },

  // Delete message
  deleteMessage: async (messageId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  },

  // Get user conversations
  getUserConversations: async (userId: string) => {
    const response = await api.get(`/messages/conversations/${userId}`);
    return response.data;
  },
};

// Chat API (Assessment Requirements)
export const chatApi = {
  // Send message to /chat endpoint (echoes back with attachments)
  sendMessage: async (
    text: string,
    files?: File[],
    conversationId?: string
  ): Promise<ApiResponse<any>> => {
    const formData = new FormData();

    if (text) {
      formData.append("text", text);
    }

    if (conversationId) {
      formData.append("conversationId", conversationId);
    }

    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("files", file);
      });
    }

    const response = await api.post("/chat", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Get random chat title
  getChatTitle: async (): Promise<{ title: string }> => {
    const response = await api.get("/chat/title");
    return response.data;
  },

  // Get conversations
  getConversations: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get("/chat/conversations");
    return response.data;
  },

  // Get specific conversation
  getConversation: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/chat/conversations/${id}`);
    return response.data;
  },

  // Create new conversation
  createConversation: async (title?: string): Promise<ApiResponse<any>> => {
    const response = await api.post("/chat/conversations", { title });
    return response.data;
  },

  // Get random thinking text
  getThinkingText: async (): Promise<{ thinking: string }> => {
    const response = await api.get("/chat/thinking");
    return response.data;
  },
};

// Health check
export const healthCheck = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  } catch (error) {
    console.error("Health check failed:", error);
    return { success: false, message: "Backend server is not reachable" };
  }
};

// Get title from /title endpoint (as per assessment requirements)
export const getTitleFromEndpoint = async (): Promise<{ title: string }> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/title`);
    return response.data;
  } catch (error) {
    console.error("Failed to get title from /title endpoint:", error);
    return { title: "General Discussion" }; // fallback
  }
};

// Generate conversation ID
export const generateConversationId = (
  userId1: string,
  userId2: string
): string => {
  const sortedIds = [userId1, userId2].sort();
  return sortedIds.join("_");
};

export default api;
