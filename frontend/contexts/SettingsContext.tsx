'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

// Settings types
export interface AppSettings {
  language: 'en' | 'ar'
  theme: 'light' | 'dark' | 'system'
  fontSize: 'sm' | 'md' | 'lg'
  fontFamily: 'cairo' | 'system' | 'arial' | 'times'
  features: {
    enableAudio: boolean
    enableTTS: boolean
    showThinking: boolean
  }
}

interface SettingsContextType {
  settings: AppSettings
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void
  updateFeatureSetting: <K extends keyof AppSettings['features']>(key: K, value: AppSettings['features'][K]) => void
  resetToDefaults: () => void
  isLoading: boolean
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

// Default settings
const defaultSettings: AppSettings = {
  language: 'en',
  theme: 'system',
  fontSize: 'md',
  fontFamily: 'cairo',
  features: {
    enableAudio: true,
    enableTTS: false,
    showThinking: true
  }
}

// Storage keys
const STORAGE_KEY = 'chat-app-settings'

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY)
      let parsedSettings = defaultSettings
      
      if (savedSettings) {
        parsedSettings = { ...defaultSettings, ...JSON.parse(savedSettings) }
      }
      
      const simpleLanguage = localStorage.getItem('chat-language') as 'en' | 'ar' | null
      if (simpleLanguage && (simpleLanguage === 'en' || simpleLanguage === 'ar')) {
        parsedSettings.language = simpleLanguage
      }
      
      setSettings(parsedSettings)
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const handleLanguageChange = () => {
      const simpleLanguage = localStorage.getItem('chat-language') as 'en' | 'ar' | null
      if (simpleLanguage && (simpleLanguage === 'en' || simpleLanguage === 'ar')) {
        setSettings(prev => ({
          ...prev,
          language: simpleLanguage
        }))
      }
    }

    window.addEventListener('storage', handleLanguageChange)
    
    window.addEventListener('languageChanged', handleLanguageChange)

    return () => {
      window.removeEventListener('storage', handleLanguageChange)
      window.removeEventListener('languageChanged', handleLanguageChange)
    }
  }, [])

  useEffect(() => {
    const handleThemeChange = () => {
      try {
        const themeSettings = localStorage.getItem('chat_settings')
        if (themeSettings) {
          const parsed = JSON.parse(themeSettings)
          if (parsed.theme && ['light', 'dark', 'system'].includes(parsed.theme)) {
            setSettings(prev => ({
              ...prev,
              theme: parsed.theme
            }))
          }
        }
      } catch (error) {
        console.warn('Failed to sync theme from chat_settings:', error)
      }
    }

    window.addEventListener('storage', handleThemeChange)
    
    window.addEventListener('themeChanged', handleThemeChange)

    return () => {
      window.removeEventListener('storage', handleThemeChange)
      window.removeEventListener('themeChanged', handleThemeChange)
    }
  }, [])

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
      } catch (error) {
        console.warn('Failed to save settings to localStorage:', error)
      }
    }
  }, [settings, isLoading])

  useEffect(() => {
    if (!isLoading) {
      applyTheme(settings.theme)
    }
  }, [settings.theme, isLoading])

  useEffect(() => {
    if (!isLoading) {
      applyFontSize(settings.fontSize)
    }
  }, [settings.fontSize, isLoading])

  useEffect(() => {
    if (!isLoading) {
      applyFontFamily(settings.fontFamily)
    }
  }, [settings.fontFamily, isLoading])

  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement
    
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', prefersDark)
    } else {
      root.classList.toggle('dark', theme === 'dark')
    }
  }

  const applyFontSize = (fontSize: 'sm' | 'md' | 'lg') => {
    const body = document.body
    
    body.classList.remove('font-sm', 'font-md', 'font-lg')
    
    body.classList.add(`font-${fontSize}`)
  }

  const applyFontFamily = (fontFamily: 'cairo' | 'system' | 'arial' | 'times') => {
    const body = document.body
    
    body.classList.remove('font-cairo', 'font-system', 'font-arial', 'font-times')
    
    body.classList.add(`font-${fontFamily}`)
  }

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const updateFeatureSetting = <K extends keyof AppSettings['features']>(
    key: K, 
    value: AppSettings['features'][K]
  ) => {
    setSettings(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [key]: value
      }
    }))
  }

  const resetToDefaults = () => {
    setSettings(defaultSettings)
  }

  useEffect(() => {
    if (settings.theme === 'system' && !isLoading) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handleChange = (e: MediaQueryListEvent) => {
        document.documentElement.classList.toggle('dark', e.matches)
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [settings.theme, isLoading])

  const value: SettingsContextType = {
    settings,
    updateSetting,
    updateFeatureSetting,
    resetToDefaults,
    isLoading
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
