'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface WaveformVisualizerProps {
  audioStream?: MediaStream
  isRecording?: boolean
  className?: string
}

export function WaveformVisualizer({ 
  audioStream, 
  isRecording = false, 
  className 
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const analyzerRef = useRef<AnalyserNode | undefined>(undefined)
  const dataArrayRef = useRef<Uint8Array | undefined>(undefined)

  useEffect(() => {
    if (!audioStream || !isRecording) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      // Draw flat line when not recording
      drawFlatLine()
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const source = audioContext.createMediaStreamSource(audioStream)
    const analyzer = audioContext.createAnalyser()
    
    analyzer.fftSize = 256
    const bufferLength = analyzer.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    
    analyzerRef.current = analyzer
    dataArrayRef.current = dataArray
    
    source.connect(analyzer)
    
    const draw = () => {
      if (!canvas || !analyzer || !dataArray) return
      
      analyzer.getByteFrequencyData(dataArray)
      
      const canvasCtx = canvas.getContext('2d')
      if (!canvasCtx) return

      const { width, height } = canvas
      
      canvasCtx.clearRect(0, 0, width, height)
      
      const barWidth = width / bufferLength * 2.5
      let barHeight
      let x = 0
      
      const gradient = canvasCtx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, '#3b82f6')
      gradient.addColorStop(1, '#1d4ed8')
      
      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * height * 0.8
        
        canvasCtx.fillStyle = gradient
        canvasCtx.fillRect(x, height - barHeight, barWidth, barHeight)
        
        x += barWidth + 1
      }
      
      animationFrameRef.current = requestAnimationFrame(draw)
    }
    
    draw()
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      audioContext.close()
    }
  }, [audioStream, isRecording])

  const drawFlatLine = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const canvasCtx = canvas.getContext('2d')
    if (!canvasCtx) return

    const { width, height } = canvas
    
    canvasCtx.clearRect(0, 0, width, height)
    
    canvasCtx.strokeStyle = '#6b7280'
    canvasCtx.lineWidth = 2
    canvasCtx.beginPath()
    canvasCtx.moveTo(0, height / 2)
    canvasCtx.lineTo(width, height / 2)
    canvasCtx.stroke()
  }

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={60}
      className={cn(
        'w-full h-15 bg-gray-50 dark:bg-gray-800 rounded-lg',
        className
      )}
    />
  )
}