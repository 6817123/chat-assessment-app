import { type ClassValue, clsx } from 'clsx'
import type { Attachment } from './types'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getFileIconType(attachment: Attachment): { type: string; color: string; path: string } {
  const { type, mimeType } = attachment
  
  if (type === 'image') {
    return {
      type: 'image',
      color: 'text-green-500',
      path: 'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'
    }
  }
  
  if (type === 'audio') {
    return {
      type: 'audio',
      color: 'text-purple-500',
      path: 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z'
    }
  }

  // Document types
  if (mimeType?.includes('pdf')) {
    return {
      type: 'pdf',
      color: 'text-red-500',
      path: 'M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v1h-1.5V7h3v1.5z'
    }
  }

  if (mimeType?.includes('word') || mimeType?.includes('document')) {
    return {
      type: 'document',
      color: 'text-blue-500',
      path: 'M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z'
    }
  }

  if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) {
    return {
      type: 'spreadsheet',
      color: 'text-green-600',
      path: 'M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z'
    }
  }

  // Default file
  return {
    type: 'file',
    color: 'text-gray-500',
    path: 'M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z'
  }
}

export function formatTime(date: Date, language: 'en' | 'ar' = 'en'): string {
  return date.toLocaleTimeString(language === 'ar' ? 'ar' : 'en', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: language === 'en'
  })
}

export function formatDate(date: Date, language: 'en' | 'ar' = 'en'): string {
  return date.toLocaleDateString(language === 'ar' ? 'ar' : 'en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function isToday(date: Date): boolean {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

export function isYesterday(date: Date): boolean {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return date.toDateString() === yesterday.toDateString()
}

export function getFileType(file: File): 'image' | 'document' | 'audio' {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('audio/')) return 'audio'
  return 'document'
}

export function createFilePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      resolve('')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function generatePreview(file: File): Promise<string | undefined> {
  if (!file.type.startsWith('image/')) return Promise.resolve(undefined)
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  // Size limit: 10MB
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' }
  }

  // Check file type
  const validTypes = [
    // Images
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    // Documents
    'application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv',
    // Audio
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'
  ]

  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'File type not supported' }
  }

  return { valid: true }
}

export function downloadFile(url: string, filename: string): void {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function generateConversationTitle(firstMessage: string, language: 'en' | 'ar' = 'en'): string {
  const maxLength = 40
  const truncated = firstMessage.length > maxLength 
    ? firstMessage.substring(0, maxLength) + '...' 
    : firstMessage

  const prefix = language === 'ar' ? 'محادثة: ' : 'Chat: '
  return prefix + truncated
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), delay)
    }
  }
}