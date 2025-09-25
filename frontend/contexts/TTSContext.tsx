'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useTTS } from '@/hooks/useTTS'

interface TTSContextType {
  speak: (text: string) => Promise<void>
  stop: () => void
  cancel: () => void
  isSpeaking: boolean
  isSupported: boolean
  error: string | null
}

const TTSContext = createContext<TTSContextType | undefined>(undefined)

export function TTSProvider({ children }: { children: ReactNode }) {
  const ttsHook = useTTS()

  return (
    <TTSContext.Provider value={ttsHook}>
      {children}
    </TTSContext.Provider>
  )
}

export function useTTSContext() {
  const context = useContext(TTSContext)
  if (!context) {
    throw new Error('useTTSContext must be used within a TTSProvider')
  }
  return context
}