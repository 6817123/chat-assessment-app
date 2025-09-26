import { io, Socket } from "socket.io-client";
import type { SocketEvents } from "@/types";

class SocketService {
  private socket: Socket | null = null;
  private readonly url: string;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 5;

  constructor() {
    this.url =
      process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_SOCKET_URL!;
  }

  connect(): Promise<Socket> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve(this.socket);
        return;
      }

      this.socket = io(this.url, {
        transports: ["websocket", "polling"],
        timeout: 10000,
        retries: 3,
      });

      this.socket.on("connect", () => {
        console.log("Connected to server:", this.socket?.id);
        this.reconnectAttempts = 0;
        resolve(this.socket!);
      });

      this.socket.on("disconnect", (reason) => {
        console.log("Disconnected from server:", reason);
        if (reason === "io server disconnect") {
          // Server initiated disconnect, reconnect manually
          this.socket?.connect();
        }
      });

      this.socket.on("reconnect", (attemptNumber) => {
        console.log("Reconnected to server after", attemptNumber, "attempts");
        this.reconnectAttempts = 0;
      });

      this.socket.on("reconnect_attempt", (attemptNumber) => {
        console.log("Attempting to reconnect...", attemptNumber);
        this.reconnectAttempts = attemptNumber;
      });

      this.socket.on("reconnect_failed", () => {
        console.log("Failed to reconnect to server");
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(
            new Error("Failed to connect to server after maximum attempts")
          );
        }
      });

      this.socket.on("connect_error", (error) => {
        console.error("Connection error:", error);
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(error);
        }
      });

      this.socket.on("error", (error) => {
        console.error("Socket error:", error);
      });

      // Set connection timeout
      setTimeout(() => {
        if (!this.socket?.connected) {
          reject(new Error("Connection timeout"));
        }
      }, 10000);
    });
  }

  disconnect(): void {
    if (this.socket) {
      console.log("Disconnecting from server");
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // User events
  joinUser(userData: { userId: string; username: string }): void {
    this.socket?.emit("user:join", userData);
  }

  // Message events
  sendMessage(messageData: {
    sender: string;
    receiver: string;
    text: string;
    messageType?: string;
  }): void {
    this.socket?.emit("message:send", messageData);
  }

  markMessageAsRead(data: { messageId: string; userId: string }): void {
    this.socket?.emit("message:read", data);
  }

  // Typing events
  startTyping(data: {
    conversationId: string;
    userId: string;
    username: string;
  }): void {
    this.socket?.emit("typing:start", data);
  }

  stopTyping(data: { conversationId: string; userId: string }): void {
    this.socket?.emit("typing:stop", data);
  }

  // Conversation events
  joinConversation(conversationId: string): void {
    this.socket?.emit("conversation:join", conversationId);
  }

  leaveConversation(conversationId: string): void {
    this.socket?.emit("conversation:leave", conversationId);
  }

  // Event listeners
  onUserJoined(
    callback: (response: { success: boolean; message: string }) => void
  ): void {
    this.socket?.on("user:joined", callback);
  }

  onUserOnline(
    callback: (user: { userId: string; username: string }) => void
  ): void {
    this.socket?.on("user:online", callback);
  }

  onUserOffline(
    callback: (user: { userId: string; username: string }) => void
  ): void {
    this.socket?.on("user:offline", callback);
  }

  onMessageReceived(callback: (message: any) => void): void {
    this.socket?.on("message:received", callback);
  }

  onMessageRead(
    callback: (data: { messageId: string; userId: string }) => void
  ): void {
    this.socket?.on("message:read", callback);
  }

  onTypingStart(
    callback: (data: { userId: string; username: string }) => void
  ): void {
    this.socket?.on("typing:start", callback);
  }

  onTypingStop(callback: (data: { userId: string }) => void): void {
    this.socket?.on("typing:stop", callback);
  }

  onError(callback: (error: { message: string }) => void): void {
    this.socket?.on("error", callback);
  }

  // Remove event listeners
  off(event: string, callback?: (...args: any[]) => void): void {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }

  // Get connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get socket ID
  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}

// Create singleton instance
export const socketService = new SocketService();
export default socketService;
