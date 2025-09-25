'use client'

import { useLanguage } from '@/contexts/SimpleLanguageContext'
import { formatFileSize, getFileIconType } from '@/lib/utils'
import type { Attachment } from '@/lib/types'
import { cn } from '@/lib/utils'

interface AttachmentPreviewProps {
  attachment: Attachment
  isUser?: boolean
  onRemove?: () => void
}

export function AttachmentPreview({ attachment, isUser = false, onRemove }: AttachmentPreviewProps) {
  const { t } = useLanguage()

  const handleDownload = () => {
    if (attachment.url) {
      const link = document.createElement('a')
      link.href = attachment.url
      link.download = attachment.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const renderPreview = () => {
    if (attachment.type === 'image' && attachment.preview) {
      return (
        <div className="relative group">
          <img
            src={attachment.preview}
            alt={attachment.name}
            className="max-w-48 max-h-32 rounded-lg object-cover cursor-pointer transition-transform group-hover:scale-105"
            onClick={handleDownload}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
            <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
          </div>
        </div>
      )
    }

    // Audio preview with controls
    if (attachment.type === 'audio') {
      return (
        <div className={cn(
          'flex flex-col space-y-2 p-3 rounded-lg border max-w-xs',
          isUser
            ? 'border-blue-300/30 bg-blue-400/20'
            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'
        )}>
          <div className="flex items-center space-x-3">
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              isUser
                ? 'bg-blue-300/30'
                : 'bg-gray-100 dark:bg-gray-600'
            )}>
              {(() => {
                const iconData = getFileIconType(attachment)
                return (
                  <svg className={cn('w-6 h-6', iconData.color)} fill="currentColor" viewBox="0 0 24 24">
                    <path d={iconData.path}/>
                  </svg>
                )
              })()}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-sm font-medium truncate',
                isUser
                  ? 'text-blue-100'
                  : 'text-gray-900 dark:text-gray-100'
              )}>
                {attachment.name}
              </p>
              <p className={cn(
                'text-xs opacity-70',
                isUser
                  ? 'text-blue-100'
                  : 'text-gray-500 dark:text-gray-400'
              )}>
                {formatFileSize(attachment.size)}
              </p>
            </div>
          </div>
          
          {/* Audio Player */}
          <audio 
            controls 
            src={attachment.url}
            className="w-full h-8"
            preload="metadata"
            style={{
              filter: isUser ? 'invert(1) sepia(1) saturate(0) hue-rotate(180deg)' : 'none'
            }}
          >
            {t('voice.audioNotSupported')}
          </audio>
        </div>
      )
    }

    // File preview for documents
    return (
      <div
        className={cn(
          'flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors',
          isUser
            ? 'border-blue-300/30 bg-blue-400/20 hover:bg-blue-400/30'
            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
        )}
        onClick={handleDownload}
      >
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center',
          isUser
            ? 'bg-blue-300/30'
            : 'bg-gray-100 dark:bg-gray-600'
        )}>
          {(() => {
            const iconData = getFileIconType(attachment)
            return (
              <svg className={cn('w-6 h-6', iconData.color)} fill="currentColor" viewBox="0 0 24 24">
                <path d={iconData.path}/>
              </svg>
            )
          })()}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-sm font-medium truncate',
            isUser
              ? 'text-blue-100'
              : 'text-gray-900 dark:text-gray-100'
          )}>
            {attachment.name}
          </p>
          <p className={cn(
            'text-xs opacity-70',
            isUser
              ? 'text-blue-100'
              : 'text-gray-500 dark:text-gray-400'
          )}>
            {formatFileSize(attachment.size)}
          </p>
        </div>

        <svg className={cn(
          'w-5 h-5',
          isUser
            ? 'text-blue-100'
            : 'text-gray-400 dark:text-gray-500'
        )} fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
        </svg>
      </div>
    )
  }

  return (
    <div className="relative">
      {renderPreview()}
      
      {/* Remove button for message input */}
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
          aria-label={t('attachment.remove')}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      )}
    </div>
  )
}