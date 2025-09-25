'use client'

import { LanguageProvider } from './SimpleLanguageContext'
import { SettingsProvider } from './SettingsContext'
import { ChatProvider } from './NewChatContext'
import { ThemeProvider } from './ThemeContext'
import { ToastProvider } from './ToastContext'
import { TTSProvider } from './TTSContext'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SettingsProvider>
      <LanguageProvider>
        <ToastProvider>
          <TTSProvider>
            <ThemeProvider>
              <ChatProvider>
                {children}
              </ChatProvider>
            </ThemeProvider>
          </TTSProvider>
        </ToastProvider>
      </LanguageProvider>
    </SettingsProvider>
  )
}