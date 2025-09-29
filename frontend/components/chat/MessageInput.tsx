'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useLanguage } from '@/contexts/SimpleLanguageContext'
import { useSettings } from '@/contexts/SettingsContext'
import { useChat } from '@/contexts/NewChatContext'
import { useToast } from '@/contexts/ToastContext'
import { AttachmentPreview } from './AttachmentPreview'
import { VoiceRecorder } from './VoiceRecorder'
import { validateFile, generatePreview, getFileType } from '@/lib/utils'
import type { Attachment } from '@/lib/types'
import { generateId } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function MessageInput() {
  const { t, direction } = useLanguage()
  const { settings } = useSettings()
  const { sendMessage, isThinking } = useChat()
  const { addToast } = useToast()
  const [message, setMessage] = useState('')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = useCallback(async () => {
    if ((!message.trim() && attachments.length === 0) || isThinking) return

    await sendMessage(message.trim(), attachments)
    setMessage('')
    setAttachments([])
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [message, attachments, sendMessage, isThinking])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    
    // Auto-resize textarea
    const textarea = e.target
    textarea.style.height = 'auto'
    const maxHeight = 120 
    textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px'
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'scroll' : 'hidden'
  }

  const handleFileSelect = useCallback(async (files: FileList | File[]) => {
    const newAttachments: Attachment[] = []
    const errors: string[] = []

    const fileArray = Array.from(files)

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i]
      const validation = validateFile(file)
      
      if (!validation.valid) {
        errors.push(`${file.name}: ${validation.error}`)
        continue
      }

      try {
        const preview = await generatePreview(file)
        const attachment: Attachment = {
          id: generateId(),
          name: file.name,
          type: getFileType(file),
          url: URL.createObjectURL(file),
          size: file.size,
          mimeType: file.type,
          preview,
          file 
        }

        newAttachments.push(attachment)
      } catch (error) {
        errors.push(`${file.name}: Failed to process file`)
      }
    }

    if (errors.length > 0) {
      addToast({
        type: 'error',
        title: t('error.fileUpload'),
        message: errors.slice(0, 3).join('\n') + (errors.length > 3 ? `\n+${errors.length - 3} more...` : ''),
        duration: 8000
      })
    }

    if (newAttachments.length > 0) {
      setAttachments(prev => [...prev, ...newAttachments])
      
      addToast({
        type: 'success',
        title: t('success.filesAdded'),
        message: `${newAttachments.length} file(s) added successfully`,
        duration: 3000
      })
    }
  }, [addToast, t])

  useEffect(() => {
    const handleFilesDrop = (event: CustomEvent) => {
      const files = event.detail.files as File[]
      if (files && files.length > 0) {
        handleFileSelect(files)
      }
    }

    document.addEventListener('filesDrop', handleFilesDrop as EventListener)
    return () => {
      document.removeEventListener('filesDrop', handleFilesDrop as EventListener)
    }
  }, [handleFileSelect])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files)
      e.target.value = '' 
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id))
  }

  const handleVoiceRecordingComplete = useCallback((audioBlob: Blob, duration: number) => {
    const audioUrl = URL.createObjectURL(audioBlob)
    const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, { type: audioBlob.type })
    const audioAttachment: Attachment = {
      id: generateId(),
      name: `Voice Message ${new Date().toLocaleTimeString()}.webm`,
      type: 'audio',
      url: audioUrl,
      size: audioBlob.size,
      mimeType: audioBlob.type,
      file: audioFile
    }
    
    setAttachments(prev => [...prev, audioAttachment])
    setShowVoiceRecorder(false)
  }, [])

  const handleVoiceRecorderCancel = useCallback(() => {
    setShowVoiceRecorder(false)
  }, [])

  const toggleVoiceRecorder = () => {
    setShowVoiceRecorder(!showVoiceRecorder)
  }

  const isEmpty = !message.trim() && attachments.length === 0

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mb-2 sm:mb-3 flex flex-wrap gap-1 sm:gap-2 max-h-24 sm:max-h-32 overflow-y-auto">
          {attachments.map((attachment) => (
            <AttachmentPreview
              key={attachment.id}
              attachment={attachment}
              onRemove={() => removeAttachment(attachment.id)}
            />
          ))}
        </div>
      )}

      {/* Input Area */}
      <div
        className={cn(
          'relative flex items-end gap-1 sm:gap-2 p-2 sm:p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl sm:rounded-2xl transition-colors',
          direction === 'rtl' && 'flex-row-reverse',
          isDragOver && 'border-blue-400 bg-blue-50 dark:bg-blue-900/10',
          'focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* File Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0"
          aria-label={t('input.attachFile')}
          disabled={isThinking}
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
          </svg>
        </button>

        {/* Voice Recording Button */}
        {settings.features.enableAudio && (
          <button
            type="button"
            onClick={toggleVoiceRecorder}
            className={cn(
              "p-1.5 sm:p-2 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0",
              showVoiceRecorder 
                ? "text-red-500 hover:text-red-600" 
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            )}
            aria-label={t('voice.record')}
            disabled={isThinking}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
            </svg>
          </button>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,audio/*,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleTextareaChange}
          onKeyPress={handleKeyPress}
          placeholder={t('input.placeholder')}
          className={cn(
            'flex-1 resize-none border-none outline-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 min-h-[20px] sm:min-h-[24px] max-h-[80px] sm:max-h-[120px] text-sm sm:text-base leading-tight sm:leading-normal',
            direction === 'rtl' && 'text-right'
          )}
          rows={1}
          disabled={isThinking}
          style={{ scrollbarWidth: 'thin' }}
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isEmpty || isThinking}
          className={cn(
            'p-1.5 sm:p-2 rounded-lg transition-all duration-200 flex-shrink-0',
            isEmpty || isThinking
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:scale-105 transform'
          )}
          aria-label={t('input.send')}
        >
          {isThinking ? (
            <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          ) : (
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          )}
        </button>
      </div>

      {/* Drag and Drop Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-400 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-sm">
          <div className="text-blue-600 dark:text-blue-400 text-center p-4">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
            </svg>
            <p className="text-xs sm:text-sm font-medium">{t('input.dropFiles')}</p>
          </div>
        </div>
      )}

      {/* Voice Recorder Modal */}
      {settings.features.enableAudio && showVoiceRecorder && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl sm:rounded-2xl p-2 sm:p-4">
          <VoiceRecorder
            onRecordingComplete={handleVoiceRecordingComplete}
            onCancel={handleVoiceRecorderCancel}
            className="w-full max-w-xs sm:max-w-md"
          />
        </div>
      )}
    </div>
  )
}