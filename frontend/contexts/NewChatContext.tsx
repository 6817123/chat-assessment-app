'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import type { ChatState, Conversation, Message, Attachment } from '@/lib/types'
import { generateId } from '@/lib/utils'
import { chatApiClient } from '@/lib/chatApi'
import { useLanguage } from './SimpleLanguageContext'

interface ChatContextType extends ChatState {
  // Conversation actions
  startNewConversation: () => Promise<string>
  selectConversation: (conversationId: string | null) => void
  deleteConversation: (conversationId: string) => void
  
  // Message actions
  sendMessage: (content: string, attachments?: Attachment[]) => Promise<void>
  
  // Chat window actions
  openChat: () => void
  closeChat: () => void
  toggleChat: () => void
  
  // Utility
  clearError: () => void
}

type ChatAction =
  | { type: 'SET_CONVERSATIONS'; payload: Conversation[] }
  | { type: 'ADD_CONVERSATION'; payload: Conversation }
  | { type: 'UPDATE_CONVERSATION'; payload: Conversation }
  | { type: 'DELETE_CONVERSATION'; payload: string }
  | { type: 'SET_ACTIVE_CONVERSATION'; payload: string | null }
  | { type: 'SET_IS_OPEN'; payload: boolean }
  | { type: 'SET_IS_THINKING'; payload: boolean }
  | { type: 'ADD_MESSAGE'; payload: { conversationId: string; message: Message } }
  | { type: 'SET_ERROR'; payload: string | null }

const initialState: ChatState = {
  conversations: [],
  activeConversationId: null,
  isOpen: false,
  isThinking: false,
  error: null
}

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload }
    
    case 'ADD_CONVERSATION':
      return { 
        ...state, 
        conversations: [action.payload, ...state.conversations] 
      }
    
    case 'UPDATE_CONVERSATION': {
      const updated = state.conversations.map(conv =>
        conv.id === action.payload.id ? action.payload : conv
      )
      return { ...state, conversations: updated }
    }
    
    case 'DELETE_CONVERSATION': {
      const filtered = state.conversations.filter(conv => conv.id !== action.payload)
      return { 
        ...state, 
        conversations: filtered,
        activeConversationId: state.activeConversationId === action.payload 
          ? null 
          : state.activeConversationId
      }
    }
    
    case 'SET_ACTIVE_CONVERSATION':
      return { ...state, activeConversationId: action.payload }
    
    case 'SET_IS_OPEN':
      return { ...state, isOpen: action.payload }
    
    case 'SET_IS_THINKING':
      return { ...state, isThinking: action.payload }
    
    case 'ADD_MESSAGE': {
      const { conversationId, message } = action.payload
      console.log('ADD_MESSAGE reducer - conversationId:', conversationId, 'message:', message);
      console.log('Current conversations:', state.conversations.map(c => ({ id: c.id, messageCount: c.messages.length })));
      
      const updated = state.conversations.map(conv => {
        if (conv.id === conversationId) {
          const updatedConv = {
            ...conv,
            messages: [...conv.messages, message],
            messageCount: conv.messageCount !== undefined ? conv.messageCount + 1 : conv.messages.length + 1,
            updatedAt: new Date()
          }
          console.log('Updated conversation:', updatedConv.id, 'messages count:', updatedConv.messages.length);
          return updatedConv;
        }
        return conv
      })
      
      // If conversation not found, find it by ID and add message anyway
      const conversationFound = updated.some(c => c.id === conversationId)
      if (!conversationFound) {
        console.log('Conversation not found in existing list, creating temporary conversation for message:', conversationId);
        // Create a temporary conversation to hold the messages
        const tempConversation: Conversation = {
          id: conversationId,
          title: 'New Chat',
          messages: [message],
          messageCount: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        updated.unshift(tempConversation) // Add to beginning of list
      }
      
      console.log('Updated conversations after ADD_MESSAGE:', updated.map(c => ({ id: c.id, messageCount: c.messages.length })));
      return { ...state, conversations: updated }
    }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    
    default:
      return state
  }
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState)
  const { language } = useLanguage()

  // Load conversations and active conversation on mount
  useEffect(() => {
    const loadConversations = async () => {
      try {
        dispatch({ type: 'SET_IS_THINKING', payload: true })
        console.log('Loading conversations...');
        const conversations = await chatApiClient.getConversations()
        console.log('Backend conversations:', conversations);
        
        if (!Array.isArray(conversations)) {
          console.error('Expected conversations array, got:', conversations);
          return;
        }
        
        // Convert backend conversations to frontend format
        const frontendConversations = conversations.map(conv => ({
          id: conv.id,
          title: conv.title,
          messages: [], // Start empty, will load when conversation is selected
          messageCount: conv.messageCount || 0, // Store message count from backend
          createdAt: new Date(conv.created),
          updatedAt: new Date(conv.created)
        }))
        
        dispatch({ type: 'SET_CONVERSATIONS', payload: frontendConversations })
      } catch (error) {
        console.error('Failed to load conversations:', error)
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load conversations' })
      } finally {
        dispatch({ type: 'SET_IS_THINKING', payload: false })
      }
    }

    loadConversations()
  }, [])

  // Get active conversation
  const activeConversation = state.conversations.find(
    conv => conv.id === state.activeConversationId
  )

  // Start a new conversation
  const startNewConversation = useCallback(async (): Promise<string> => {
    try {
      const backendConversation = await chatApiClient.createConversation()
      
      const conversation: Conversation = {
        id: backendConversation.id,
        title: backendConversation.title,
        messages: [],
        messageCount: 0, // New conversation starts with 0 messages
        createdAt: new Date(backendConversation.created),
        updatedAt: new Date(backendConversation.created)
      }

      dispatch({ type: 'ADD_CONVERSATION', payload: conversation })
      dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conversation.id })
      
      return conversation.id
    } catch (error) {
      console.error('Failed to create conversation:', error)
      throw error
    }
  }, [])

  // Select a conversation and load its messages
  const selectConversation = useCallback(async (conversationId: string | null) => {
    dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conversationId })
    
    // Load messages for the selected conversation if it exists and has no messages
    if (conversationId) {
      const conversation = state.conversations.find(c => c.id === conversationId)
      if (conversation && conversation.messages.length === 0) {
        try {
          dispatch({ type: 'SET_IS_THINKING', payload: true })
          const messages = await chatApiClient.getConversationMessages(conversationId)
          
          // Convert to frontend format
          const frontendMessages = messages.map(msg => ({
            id: msg.id,
            text: msg.text,
            sender: msg.sender,
            timestamp: new Date(msg.timestamp),
            attachments: msg.attachments?.map(att => ({
              id: att.id,
              name: att.name,
              type: att.type as 'image' | 'document' | 'audio',
              url: att.url,
              size: att.size,
              mimeType: att.mimeType
            }))
          }))

          // Update the conversation with loaded messages
          const updatedConversation = {
            ...conversation,
            messages: frontendMessages
          }
          
          dispatch({
            type: 'UPDATE_CONVERSATION',
            payload: updatedConversation
          })
        } catch (error) {
          console.error('Failed to load conversation messages:', error)
        } finally {
          dispatch({ type: 'SET_IS_THINKING', payload: false })
        }
      }
    }
  }, [state.conversations])

  // Delete a conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      // Call backend API to delete conversation
      await chatApiClient.deleteConversation(conversationId);
      
      // Remove from local state only after successful API call
      dispatch({ type: 'DELETE_CONVERSATION', payload: conversationId });
      
      // If the deleted conversation was active, clear active conversation
      if (state.activeConversationId === conversationId) {
        dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: null });
      }
      
      console.log(`✅ Conversation ${conversationId} deleted successfully`);
    } catch (error) {
      console.error('❌ Failed to delete conversation:', error);
      // Optionally show user error message here
      throw error; // Re-throw so UI can handle it
    }
  }, [state.activeConversationId])

  // Send a message
  const sendMessage = useCallback(async (content: string, attachments?: Attachment[]) => {
    if (!content.trim() && (!attachments || attachments.length === 0)) return

    let conversationId = state.activeConversationId
    let newConversationCreated = false

    try {
      // Create new conversation if none is active
      if (!conversationId) {
        conversationId = await startNewConversation()
        newConversationCreated = true
        console.log('Created new conversation with ID:', conversationId);
      }

      dispatch({ type: 'SET_IS_THINKING', payload: true })

      // Send message via API
      let apiResponse
      if (attachments && attachments.length > 0) {
        // Send with attachments - for now, just send the first file
        const firstAttachment = attachments[0];
        if (firstAttachment.file) {
          apiResponse = await chatApiClient.sendFileMessage(conversationId, content.trim(), firstAttachment.file);
        } else {
          apiResponse = await chatApiClient.sendTextMessage(conversationId, content.trim());
        }
      } else {
        apiResponse = await chatApiClient.sendTextMessage(conversationId, content.trim())
      }

      // Convert backend messages to frontend format
      console.log('API Response:', apiResponse); // Debug log
      
      if (!apiResponse.userMessage || !apiResponse.assistantMessage) {
        throw new Error('Invalid API response structure');
      }

      const userMessage: Message = {
        id: apiResponse.userMessage.id,
        text: apiResponse.userMessage.text,
        sender: 'user',
        timestamp: new Date(apiResponse.userMessage.timestamp),
        attachments: apiResponse.userMessage.attachments?.map(att => ({
          id: att.id,
          name: att.name,
          type: att.type as 'image' | 'document' | 'audio',
          url: att.url,
          size: att.size,
          mimeType: att.mimeType
        }))
      }

      const assistantMessage: Message = {
        id: apiResponse.assistantMessage.id,
        text: apiResponse.assistantMessage.text,
        sender: 'assistant',
        timestamp: new Date(apiResponse.assistantMessage.timestamp),
        attachments: apiResponse.assistantMessage.attachments?.map(att => ({
          id: att.id,
          name: att.name,
          type: att.type as 'image' | 'document' | 'audio',
          url: att.url,
          size: att.size,
          mimeType: att.mimeType
        }))
      }

      console.log('About to add messages to conversation:', conversationId);
      console.log('New conversation created:', newConversationCreated);

      // Add messages to state using the correct conversationId
      console.log('Adding user message to conversation:', conversationId, userMessage);
      dispatch({ 
        type: 'ADD_MESSAGE', 
        payload: { conversationId: conversationId!, message: userMessage } 
      })
      
      console.log('Adding assistant message to conversation:', conversationId, assistantMessage);
      dispatch({ 
        type: 'ADD_MESSAGE', 
        payload: { conversationId: conversationId!, message: assistantMessage } 
      })

      // Update conversation title if this was a new conversation
      if (newConversationCreated) {
        try {
          const titleResponse = await chatApiClient.getRandomTitle()
          
          // Wait a moment for the state to update, then get the conversation
          setTimeout(() => {
            dispatch({ type: 'UPDATE_CONVERSATION', payload: {
              id: conversationId!,
              title: titleResponse.title,
              messages: [userMessage, assistantMessage],
              messageCount: 2,
              createdAt: new Date(),
              updatedAt: new Date()
            }})
          }, 100)
          
          console.log('Updating conversation title to:', titleResponse.title);
        } catch (titleError) {
          console.error('Failed to get title:', titleError)
        }
      }

    } catch (error: any) {
      console.error('Send message error:', error)
      
      // More detailed error handling
      let errorMessage = 'Failed to send message. Please try again.'
      
      if (error instanceof Error) {
        console.error('Error message:', error.message)
        if (error.message.includes('Network Error')) {
          errorMessage = 'Cannot connect to server. Please check if the backend is running.'
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.'
        } else if (error.message.includes('Invalid API response structure')) {
          errorMessage = 'Server returned invalid response. Please try again.'
        }
      }
      
      // Check if it's a connection error
      if (error?.code === 'ERR_NETWORK' || error?.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to server. Please ensure the backend server is running on port 4000.'
      }
      
      // Check axios error response
      if (error?.response) {
        console.error('Response status:', error.response.status)
        console.error('Response data:', error.response.data)
        if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.'
        } else if (error.response.status === 404) {
          errorMessage = 'API endpoint not found. Please check server configuration.'
        }
      }
      
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
    } finally {
      dispatch({ type: 'SET_IS_THINKING', payload: false })
    }
  }, [state.activeConversationId, startNewConversation])

  // Chat window actions
  const openChat = useCallback(() => {
    dispatch({ type: 'SET_IS_OPEN', payload: true })
  }, [])

  const closeChat = useCallback(() => {
    dispatch({ type: 'SET_IS_OPEN', payload: false })
  }, [])

  const toggleChat = useCallback(() => {
    dispatch({ type: 'SET_IS_OPEN', payload: !state.isOpen })
  }, [state.isOpen])

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null })
  }, [])

  const value: ChatContextType = {
    ...state,
    startNewConversation,
    selectConversation,
    deleteConversation,
    sendMessage,
    openChat,
    closeChat,
    toggleChat,
    clearError
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}