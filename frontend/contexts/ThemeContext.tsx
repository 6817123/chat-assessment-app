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
      resolvedTheme: 'light' 
    }
  })

  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  }

  const resolveTheme = (theme: 'light' | 'dark' | 'system'): 'light' | 'dark' => {
    if (theme === 'system') {
      return getSystemTheme()
    }
    return theme
  }

  const updateResolvedTheme = (theme: 'light' | 'dark' | 'system') => {
    const resolved = resolveTheme(theme)
    setState(prev => ({
      ...prev,
      theme,
      resolvedTheme: resolved
    }))
    
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      root.classList.remove('light', 'dark')
      root.classList.add(resolved)
      root.style.colorScheme = resolved
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (state.theme === 'system') {
        updateResolvedTheme('system')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    
    updateResolvedTheme(state.theme)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [state.theme])

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    updateSetting('theme', theme)
    updateResolvedTheme(theme)
    
    window.dispatchEvent(new Event('themeChanged'))
  }

  const toggleTheme = () => {
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