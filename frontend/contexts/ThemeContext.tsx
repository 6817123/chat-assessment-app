'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ThemeState } from '@/lib/types'
import { getSettings, updateSetting } from '@/lib/storage'

interface ThemeContextType extends ThemeState {
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ThemeState>(() => {
    const settings = getSettings()
    return {
      theme: settings.theme,
      resolvedTheme: 'light' // Will be updated after mount
    }
  })

  // Function to get system theme preference
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  }

  // Function to resolve the actual theme based on setting
  const resolveTheme = (theme: 'light' | 'dark' | 'system'): 'light' | 'dark' => {
    if (theme === 'system') {
      return getSystemTheme()
    }
    return theme
  }

  // Update resolved theme
  const updateResolvedTheme = (theme: 'light' | 'dark' | 'system') => {
    const resolved = resolveTheme(theme)
    setState(prev => ({
      ...prev,
      theme,
      resolvedTheme: resolved
    }))
    
    // Apply theme to document
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      root.classList.remove('light', 'dark')
      root.classList.add(resolved)
      root.style.colorScheme = resolved
    }
  }

  // Listen to system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (state.theme === 'system') {
        updateResolvedTheme('system')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    
    // Initial theme application
    updateResolvedTheme(state.theme)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [state.theme])

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    updateSetting('theme', theme)
    updateResolvedTheme(theme)
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('themeChanged'))
  }

  const toggleTheme = () => {
    // Toggle between dark and light only for better UX in header
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
  }

  const value: ThemeContextType = {
    ...state,
    setTheme,
    toggleTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}