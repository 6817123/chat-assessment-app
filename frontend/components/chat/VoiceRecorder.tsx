'use client'

import { useLanguage } from '@/contexts/SimpleLanguageContext'
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder'
import { WaveformVisualizer } from '@/components/WaveformVisualizer'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'

interface VoiceRecorderProps {
  onRecordingComplete?: (audioBlob: Blob, duration: number) => void
  onCancel?: () => void
  className?: string
}

export function VoiceRecorder({ 
  onRecordingComplete, 
  onCancel, 
  className 
}: VoiceRecorderProps) {
  const { t, direction } = useLanguage()
  const {
    recordingState,
    audioBlob,
    audioUrl,
    audioStream,
    duration,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    clearRecording,
    error
  } = useVoiceRecorder()

  // Handle recording completion
  useEffect(() => {
    if (recordingState === 'stopped' && audioBlob && onRecordingComplete) {
      onRecordingComplete(audioBlob, duration)
    }
  }, [recordingState, audioBlob, duration, onRecordingComplete])

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    clearRecording()
    startRecording()
  }

  const handleCancel = () => {
    clearRecording()
    onCancel?.()
  }

  return (
    <div className={cn(
      'flex flex-col space-y-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg',
      className
    )}>
      {error && (
        <div className="text-red-500 text-sm text-center mb-2">
          {error}
        </div>
      )}

      {/* Recording Status */}
      <div className={cn(
        'flex items-center justify-center gap-3',
        direction === 'rtl' && 'flex-row-reverse'
      )}>
        {recordingState === 'recording' && (
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        )}
        {recordingState === 'paused' && (
          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
        )}
        {recordingState === 'stopped' && audioUrl && (
          <div className="w-3 h-3 bg-green-500 rounded-full" />
        )}
        
        <span className={cn(
          'text-lg font-mono tabular-nums',
          recordingState === 'recording' && 'text-red-500',
          recordingState === 'paused' && 'text-yellow-500',
          recordingState === 'stopped' && 'text-green-500'
        )}>
          {formatDuration(duration)}
        </span>
      </div>

              {/* Recording Waveform Visualization */}
        {(recordingState === 'recording' || recordingState === 'paused') && audioStream && (
          <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
            <WaveformVisualizer 
              audioStream={audioStream}
              isRecording={recordingState === 'recording'}
            />
          </div>
        )}

        {/* Audio Preview */}
      {recordingState === 'stopped' && audioUrl && (
        <div className="flex justify-center">
          <audio 
            controls 
            src={audioUrl}
            className="w-full max-w-sm"
            preload="metadata"
          >
            {t('voice.audioNotSupported')}
          </audio>
        </div>
      )}

      {/* Control Buttons */}
      <div className={cn(
        'flex items-center justify-center gap-3',
        direction === 'rtl' && 'flex-row-reverse'
      )}>
        {recordingState === 'idle' && (
          <>
            <Button
              onClick={handleStart}
              variant="primary"
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <svg className={cn(
                'w-5 h-5',
                direction === 'rtl' ? 'ml-2' : 'mr-2'
              )} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
              </svg>
              {t('voice.startRecording')}
            </Button>
            
            {onCancel && (
              <Button
                onClick={handleCancel}
                variant="secondary"
                size="sm"
              >
                {t('common.cancel')}
              </Button>
            )}
          </>
        )}

        {recordingState === 'recording' && (
          <>
            <Button
              onClick={pauseRecording}
              variant="secondary"
              size="sm"
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              <svg className={cn(
                'w-5 h-5',
                direction === 'rtl' ? 'ml-2' : 'mr-2'
              )} fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
              {t('voice.pause')}
            </Button>
            
            <Button
              onClick={stopRecording}
              variant="primary"
              size="sm"
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              <svg className={cn(
                'w-5 h-5',
                direction === 'rtl' ? 'ml-2' : 'mr-2'
              )} fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h12v12H6z"/>
              </svg>
              {t('voice.stop')}
            </Button>
          </>
        )}

        {recordingState === 'paused' && (
          <>
            <Button
              onClick={resumeRecording}
              variant="primary"
              size="sm"
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <svg className={cn(
                'w-5 h-5',
                direction === 'rtl' ? 'ml-2' : 'mr-2'
              )} fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              {t('voice.resume')}
            </Button>
            
            <Button
              onClick={stopRecording}
              variant="secondary"
              size="sm"
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              <svg className={cn(
                'w-5 h-5',
                direction === 'rtl' ? 'ml-2' : 'mr-2'
              )} fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h12v12H6z"/>
              </svg>
              {t('voice.stop')}
            </Button>
          </>
        )}

        {recordingState === 'stopped' && (
          <>
            <Button
              onClick={handleStart}
              variant="secondary"
              size="sm"
            >
              <svg className={cn(
                'w-5 h-5',
                direction === 'rtl' ? 'ml-2' : 'mr-2'
              )} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
              </svg>
              {t('voice.recordAgain')}
            </Button>
            
            <Button
              onClick={handleCancel}
              variant="secondary"
              size="sm"
            >
              {t('common.cancel')}
            </Button>
          </>
        )}
      </div>

      {/* Status Text */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        {recordingState === 'idle' && t('voice.readyToRecord')}
        {recordingState === 'recording' && t('voice.recording')}
        {recordingState === 'paused' && t('voice.paused')}
        {recordingState === 'stopped' && t('voice.recordingComplete')}
      </div>
    </div>
  )
}