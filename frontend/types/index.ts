export interface User {
  _id: string
  username: string
  displayName: string
  email: string
  avatar?: string
  isOnline: boolean
  lastSeen: Date
}

export interface Message {
  _id: string
  sender: User
  receiver: User
  conversationId: string
  text: string
  messageType: 'text' | 'image' | 'file'
  isRead: boolean
  isEdited: boolean
  editedAt?: Date
  createdAt: Date
  updatedAt: Date
  formattedTime?: string
  formattedDate?: string
}

export interface Conversation {
  _id: string
  lastMessage: Message
  messageCount: number
  unreadCount: number
  participants: User[]
}

export interface ChatState {
  currentUser: User | null
  selectedUser: User | null
  users: User[]
  messages: Message[]
  conversations: Conversation[]
  isLoading: boolean
  error: string | null
  isConnected: boolean
  isTyping: boolean
  typingUsers: string[]
}

export interface LanguageState {
  language: 'en' | 'ar'
  direction: 'ltr' | 'rtl'
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
  count?: number
}

export interface SocketEvents {
  'user:join': (userData: { userId: string; username: string }) => void
  'user:joined': (response: { success: boolean; message: string }) => void
  'user:online': (user: { userId: string; username: string }) => void
  'user:offline': (user: { userId: string; username: string }) => void
  'message:send': (messageData: {
    sender: string
    receiver: string
    text: string
    messageType?: string
  }) => void
  'message:received': (message: Message) => void
  'message:read': (data: { messageId: string; userId: string }) => void
  'typing:start': (data: { conversationId: string; userId: string; username: string }) => void
  'typing:stop': (data: { conversationId: string; userId: string }) => void
  'conversation:join': (conversationId: string) => void
  'conversation:leave': (conversationId: string) => void
  error: (error: { message: string }) => void
}