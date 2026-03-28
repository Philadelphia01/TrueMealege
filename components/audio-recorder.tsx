"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, Pause, Play, RotateCcw, Upload } from "lucide-react"

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void
  maxDuration?: number // in seconds
  disabled?: boolean
}

export function AudioRecorder({
  onRecordingComplete,
  maxDuration = 30,
  disabled = false,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [analyzerData, setAnalyzerData] = useState<number[]>(new Array(32).fill(0))

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const analyzerRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      if (audioContextRef.current) audioContextRef.current.close()
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  // Auto-stop at max duration
  useEffect(() => {
    if (duration >= maxDuration && isRecording) {
      stopRecording()
    }
  }, [duration, maxDuration, isRecording])

  const updateAnalyzer = useCallback(() => {
    if (!analyzerRef.current || !isRecording || isPaused) return

    const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount)
    analyzerRef.current.getByteFrequencyData(dataArray)

    // Sample 32 frequency bands
    const bands = 32
    const step = Math.floor(dataArray.length / bands)
    const newData = []
    for (let i = 0; i < bands; i++) {
      const value = dataArray[i * step] / 255
      newData.push(value)
    }
    setAnalyzerData(newData)

    animationRef.current = requestAnimationFrame(updateAnalyzer)
  }, [isRecording, isPaused])

  const startRecording = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      })

      // Set up audio analyzer
      audioContextRef.current = new AudioContext()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      analyzerRef.current = audioContextRef.current.createAnalyser()
      analyzerRef.current.fftSize = 256
      source.connect(analyzerRef.current)

      // Set up media recorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4",
      })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType,
        })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start(100) // Collect data every 100ms
      setIsRecording(true)
      setDuration(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1)
      }, 1000)

      // Start analyzer animation
      animationRef.current = requestAnimationFrame(updateAnalyzer)
    } catch (err) {
      console.error("Error accessing microphone:", err)
      setError("Could not access microphone. Please grant permission and try again.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }

      setAnalyzerData(new Array(32).fill(0))
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        timerRef.current = setInterval(() => {
          setDuration((d) => d + 1)
        }, 1000)
        animationRef.current = requestAnimationFrame(updateAnalyzer)
      } else {
        mediaRecorderRef.current.pause()
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
          animationRef.current = null
        }
      }
      setIsPaused(!isPaused)
    }
  }

  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioBlob(null)
    setAudioUrl(null)
    setDuration(0)
    setAnalyzerData(new Array(32).fill(0))
  }

  const handleSubmit = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob, duration)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {error && (
        <div className="w-full rounded-lg bg-destructive/10 p-3 text-center text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Waveform Visualizer */}
      <div className="flex h-24 w-full items-center justify-center gap-1 rounded-xl bg-muted/50 px-4">
        {analyzerData.map((value, index) => (
          <div
            key={index}
            className="w-1.5 rounded-full bg-[#4CAF50] transition-all duration-75"
            style={{
              height: `${Math.max(4, value * 80)}px`,
              opacity: isRecording && !isPaused ? 0.5 + value * 0.5 : 0.3,
            }}
          />
        ))}
      </div>

      {/* Timer */}
      <div className="text-center">
        <span className="text-4xl font-mono font-bold text-foreground">
          {formatTime(duration)}
        </span>
        <span className="text-lg text-muted-foreground"> / {formatTime(maxDuration)}</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-[#4CAF50] transition-all duration-1000"
          style={{ width: `${(duration / maxDuration) * 100}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {!isRecording && !audioBlob && (
          <Button
            onClick={startRecording}
            disabled={disabled}
            size="lg"
            className="h-16 w-16 rounded-full bg-[#E53E3E] hover:bg-[#C53030] text-white"
          >
            <Mic className="h-8 w-8" />
          </Button>
        )}

        {isRecording && (
          <>
            <Button
              onClick={pauseRecording}
              variant="outline"
              size="lg"
              className="h-14 w-14 rounded-full"
            >
              {isPaused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
            </Button>
            <Button
              onClick={stopRecording}
              size="lg"
              className="h-16 w-16 rounded-full bg-[#E53E3E] hover:bg-[#C53030] text-white"
            >
              <Square className="h-6 w-6" />
            </Button>
          </>
        )}

        {audioBlob && !isRecording && (
          <>
            <Button
              onClick={resetRecording}
              variant="outline"
              size="lg"
              className="h-14 w-14 rounded-full"
            >
              <RotateCcw className="h-6 w-6" />
            </Button>
            <Button
              onClick={handleSubmit}
              size="lg"
              className="h-16 gap-2 rounded-full bg-[#4CAF50] hover:bg-[#43A047] text-white px-8"
            >
              <Upload className="h-5 w-5" />
              Analyze
            </Button>
          </>
        )}
      </div>

      {/* Audio Preview */}
      {audioUrl && (
        <audio controls src={audioUrl} className="w-full max-w-xs" />
      )}

      {/* Instructions */}
      <p className="text-center text-sm text-muted-foreground">
        {isRecording
          ? isPaused
            ? "Recording paused. Tap play to continue."
            : "Recording... Position phone near the engine."
          : audioBlob
          ? "Review your recording and tap Analyze to continue."
          : "Tap the microphone to start recording the engine sound."}
      </p>
    </div>
  )
}
