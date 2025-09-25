'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import type { ChatState, Conversation, Message, Attachment } from '@/lib/types'
import { generateId, generateConversationTitle } from '@/lib/utils'
import { generateAssistantResponse } from '@/lib/assistant'
import { 
  getConversations, 
  saveConversation, 
  deleteConversation as deleteStoredConversation,
  getActiveConversationId,
  setActiveConversationId
} from '@/lib/storage'

interface ChatContextType extends ChatState {
  // Conversation actions
  startNewConversation: () => string
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
  | { type: 'ADD_MESSAGE'; payload: { conversationId: string; message: Message } }
  | { type: 'SET_IS_OPEN'; payload: boolean }
  | { type: 'SET_IS_THINKING'; payload: boolean }
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
      return { ...state, conversations: [action.payload, ...state.conversations] }
    
    case 'UPDATE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.id ? action.payload : conv
        )
      }
    
    case 'DELETE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.filter(conv => conv.id !== action.payload),
        activeConversationId: state.activeConversationId === action.payload ? null : state.activeConversationId
      }
    
    case 'SET_ACTIVE_CONVERSATION':
      return { ...state, activeConversationId: action.payload }
    
    case 'ADD_MESSAGE':
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.conversationId
            ? { ...conv, messages: [...conv.messages, action.payload.message], updatedAt: new Date() }
            : conv
        )
      }
    
    case 'SET_IS_OPEN':
      return { ...state, isOpen: action.payload }
    
    case 'SET_IS_THINKING':
      return { ...state, isThinking: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    
    default:
      return state
  }
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState)

  // Load conversations on mount
  useEffect(() => {
    const loadedConversations = getConversations()
    dispatch({ type: 'SET_CONVERSATIONS', payload: loadedConversations })
    
    const activeId = getActiveConversationId()
    if (activeId) {
      dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: activeId })
    }
  }, [])

  // Start a new conversation
  const startNewConversation = useCallback((): string => {
    const newConversation: Conversation = {
      id: generateId(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    dispatch({ type: 'ADD_CONVERSATION', payload: newConversation })
    dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: newConversation.id })
    setActiveConversationId(newConversation.id)
    saveConversation(newConversation)
    
    return newConversation.id
  }, [])

  // Select a conversation
  const selectConversation = useCallback((conversationId: string | null) => {
    dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conversationId })
    if (conversationId) {
      setActiveConversationId(conversationId)
    }
  }, [])

  // Delete a conversation
  const deleteConversation = useCallback((conversationId: string) => {
    dispatch({ type: 'DELETE_CONVERSATION', payload: conversationId })
    deleteStoredConversation(conversationId)
  }, [])

  // Send a message
  const sendMessage = useCallback(async (content: string, attachments?: Attachment[]) => {
    if (!content.trim() && (!attachments || attachments.length === 0)) return

    let conversationId = state.activeConversationId

    // Create new conversation if none is active
    if (!conversationId) {
      conversationId = startNewConversation()
    }

    const conversation = state.conversations.find(c => c.id === conversationId)
    if (!conversation) return

    try {
      // Create user message
      const userMessage: Message = {
        id: generateId(),
        content: content.trim(),
        sender: 'user',
        timestamp: new Date(),
        attachments
      }

      // Add user message
      dispatch({ 
        type: 'ADD_MESSAGE', 
        payload: { conversationId, message: userMessage } 
      })

      // Update conversation title if this is the first message
      if (conversation.messages.length === 0 && content.trim()) {
        const title = generateConversationTitle(content.trim())
        const updatedConversation = { ...conversation, title }
        dispatch({ type: 'UPDATE_CONVERSATION', payload: updatedConversation })
        saveConversation(updatedConversation)
      } else {
        saveConversation({
          ...conversation,
          messages: [...conversation.messages, userMessage],
          updatedAt: new Date()
        })
      }

      // Show thinking indicator
      dispatch({ type: 'SET_IS_THINKING', payload: true })

      // Generate assistant response using the message object
      const response = await generateAssistantResponse(userMessage)
      
      dispatch({ type: 'SET_IS_THINKING', payload: false })

      // Create assistant message
      const assistantMessage: Message = {
        id: generateId(),
        content: response.content,
        sender: 'assistant',
        timestamp: new Date()
      }

      // Add assistant message
      dispatch({ 
        type: 'ADD_MESSAGE', 
        payload: { conversationId, message: assistantMessage } 
      })

      // Save updated conversation
      const finalConversation = state.conversations.find(c => c.id === conversationId)
      if (finalConversation) {
        const updatedConversation = {
          ...finalConversation,
          messages: [...finalConversation.messages, userMessage, assistantMessage],
          updatedAt: new Date()
        }
        saveConversation(updatedConversation)
      }

    } catch (error) {
      dispatch({ type: 'SET_IS_THINKING', payload: false })
      dispatch({ type: 'SET_ERROR', payload: 'Failed to send message. Please try again.' })
      console.error('Send message error:', error)
    }
  }, [state.activeConversationId, state.conversations, startNewConversation])

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
    clearError,
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