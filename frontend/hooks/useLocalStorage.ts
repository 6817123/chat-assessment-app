import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, defaultValue: T) {
  // Initialize state with default value
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue
    
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return defaultValue
    }
  })

  // Update localStorage when value changes
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, value])

  return [value, setValue] as const
}

export function useSessionStorage<T>(key: string, defaultValue: T) {
  // Initialize state with default value
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue
    
    try {
      const item = sessionStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error)
      return defaultValue
    }
  })

  // Update sessionStorage when value changes
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      sessionStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn(`Error setting sessionStorage key "${key}":`, error)
    }
  }, [key, value])

  return [value, setValue] as const
}