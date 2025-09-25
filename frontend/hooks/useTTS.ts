"use client";

import { useEffect, useState } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { useLanguage } from "@/contexts/SimpleLanguageContext";

export interface TTSOptions {
  voice?: SpeechSynthesisVoice;
  rate?: number;
  pitch?: number;
  volume?: number;
}

interface UseTTSReturn {
  speak: (text: string, options?: TTSOptions) => Promise<void>;
  stop: () => void;
  cancel: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  error: string | null;
}

export function useTTS(): UseTTSReturn {
  const { settings } = useSettings();
  const { language } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    // Load voices immediately
    loadVoices();

    // Some browsers load voices asynchronously
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [isSupported]);

  const getPreferredVoice = (): SpeechSynthesisVoice | null => {
    if (voices.length === 0) return null;

    // Try to find a voice that matches the current language
    const languageCode = language === "ar" ? "ar" : "en";

    // First, look for exact language match
    let preferredVoice = voices.find((voice) =>
      voice.lang.toLowerCase().startsWith(languageCode)
    );

    // If no exact match, try to find default voice for language
    if (!preferredVoice && language === "ar") {
      preferredVoice = voices.find(
        (voice) =>
          voice.lang.includes("ar-") ||
          voice.name.toLowerCase().includes("arabic")
      );
    }

    if (!preferredVoice && language === "en") {
      preferredVoice = voices.find(
        (voice) => voice.lang.includes("en-") || voice.default
      );
    }

    // Fallback to first available voice
    return preferredVoice || voices[0] || null;
  };

  const speak = async (
    text: string,
    options: TTSOptions = {}
  ): Promise<void> => {
    if (!isSupported) {
      setError("Speech synthesis is not supported in this browser");
      return Promise.reject(new Error("Speech synthesis not supported"));
    }

    if (!settings.features.enableTTS) {
      return Promise.resolve();
    }

    if (!text.trim()) {
      return Promise.resolve();
    }

    // Wait for voices to load if they haven't loaded yet
    await waitForVoices();

    return new Promise((resolve, reject) => {
      try {
        // Cancel any ongoing speech first and wait a bit
        speechSynthesis.cancel();

        // Small delay to ensure cancellation is processed
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(text);

          // Set voice
          const voice = options.voice || getPreferredVoice();
          if (voice) {
            utterance.voice = voice;
          }

          // Set speech parameters
          utterance.rate = options.rate ?? 0.9; // Slightly slower for better clarity
          utterance.pitch = options.pitch ?? 1.0;
          utterance.volume = options.volume ?? 0.8;

          // Set language based on current app language
          utterance.lang = language === "ar" ? "ar-SA" : "en-US";

          // Track if speech ended normally
          let hasEnded = false;

          // Event listeners
          utterance.onstart = () => {
            setIsSpeaking(true);
            setError(null);
          };

          utterance.onend = () => {
            if (!hasEnded) {
              hasEnded = true;
              setIsSpeaking(false);
              resolve();
            }
          };

          utterance.onerror = (event) => {
            if (!hasEnded) {
              hasEnded = true;
              setIsSpeaking(false);

              // Don't treat certain errors as serious - they're normal when user cancels or switches
              if (event.error === "canceled" || event.error === "not-allowed") {
                resolve(); // Resolve normally for these "soft" errors
                return;
              }

              // For interrupted or synthesis-failed errors, try to resume
              if (
                event.error === "interrupted" ||
                event.error === "synthesis-failed"
              ) {
                console.log(
                  "TTS interrupted, will retry automatically on next message"
                );
                resolve(); // Don't show error for interruptions
                return;
              }

              // Only treat serious errors as actual errors
              const errorMessage = `Speech synthesis error: ${event.error}`;
              setError(errorMessage);
              reject(new Error(errorMessage));
            }
          };

          utterance.onpause = () => {
            setIsSpeaking(false);
          };

          utterance.onresume = () => {
            setIsSpeaking(true);
          };

          // Start speaking
          speechSynthesis.speak(utterance);

          // Fallback timeout - if speech hasn't started in 10 seconds, resolve
          setTimeout(() => {
            if (!hasEnded && !speechSynthesis.speaking) {
              hasEnded = true;
              setIsSpeaking(false);
              resolve();
            }
          }, 10000);
        }, 100); // 100ms delay after cancel
      } catch (err) {
        setIsSpeaking(false);
        const errorMessage =
          err instanceof Error ? err.message : "Unknown TTS error";
        setError(errorMessage);
        reject(new Error(errorMessage));
      }
    });
  };

  // Helper function to wait for voices to load
  const waitForVoices = (): Promise<void> => {
    return new Promise((resolve) => {
      if (speechSynthesis.getVoices().length > 0) {
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        resolve(); // Resolve anyway after 2 seconds
      }, 2000);

      speechSynthesis.onvoiceschanged = () => {
        clearTimeout(timeout);
        resolve();
      };
    });
  };

  const stop = () => {
    if (!isSupported) return;

    speechSynthesis.pause();
    setIsSpeaking(false);
  };

  const cancel = () => {
    if (!isSupported) return;

    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return {
    speak,
    stop,
    cancel,
    isSpeaking,
    isSupported,
    voices,
    error,
  };
}
