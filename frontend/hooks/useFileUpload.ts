import { useState, useCallback } from 'react'
import { validateFile, createFilePreview } from '@/lib/utils'
import type { Attachment, FileUploadState } from '@/lib/types'

export function useFileUpload() {
  const [state, setState] = useState<FileUploadState>({
    files: [],
    previews: [],
    uploading: false,
    progress: 0,
    error: null
  })

  // Add files to upload queue
  const addFiles = useCallback(async (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles)
    const validFiles: File[] = []
    const newPreviews: string[] = []

    // Validate each file
    for (const file of fileArray) {
      const validation = validateFile(file)
      if (!validation.valid) {
        setState(prev => ({ ...prev, error: validation.error || 'Invalid file' }))
        continue
      }

      validFiles.push(file)
      
      // Create preview for images
      try {
        const preview = await createFilePreview(file)
        newPreviews.push(preview)
      } catch {
        newPreviews.push('')
      }
    }

    setState(prev => ({
      ...prev,
      files: [...prev.files, ...validFiles],
      previews: [...prev.previews, ...newPreviews],
      error: null
    }))
  }, [])

  // Remove a file from upload queue
  const removeFile = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
      previews: prev.previews.filter((_, i) => i !== index)
    }))
  }, [])

  // Clear all files
  const clearFiles = useCallback(() => {
    setState({
      files: [],
      previews: [],
      uploading: false,
      progress: 0,
      error: null
    })
  }, [])

  // Convert files to attachments (for actual upload)
  const processFiles = useCallback(async (): Promise<Attachment[]> => {
    if (state.files.length === 0) return []

    setState(prev => ({ ...prev, uploading: true, progress: 0 }))

    const attachments: Attachment[] = []

    try {
      for (let i = 0; i < state.files.length; i++) {
        const file = state.files[i]
        const preview = state.previews[i]

        // Create attachment object
        const attachment: Attachment = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type.startsWith('image/') 
            ? 'image' 
            : file.type.startsWith('audio/') 
            ? 'audio' 
            : 'document',
          url: preview || URL.createObjectURL(file),
          size: file.size,
          mimeType: file.type
        }

        attachments.push(attachment)

        // Update progress
        setState(prev => ({ 
          ...prev, 
          progress: Math.round(((i + 1) / state.files.length) * 100) 
        }))
      }

      setState(prev => ({ ...prev, uploading: false, progress: 100 }))
      return attachments

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        uploading: false, 
        error: 'Failed to process files' 
      }))
      throw error
    }
  }, [state.files, state.previews])

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    ...state,
    addFiles,
    removeFile,
    clearFiles,
    processFiles,
    clearError
  }
}