"use client";

import { useEffect, useState } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { useLanguage } from "@/contexts/SimpleLanguageContext";
import {
  detectLanguage,
  getVoiceConfig,
  findBestVoice,
} from "@/lib/languageDetection";

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

    loadVoices();

    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [isSupported]);

  const getPreferredVoiceForText = (
    text: string
  ): SpeechSynthesisVoice | null => {
    if (voices.length === 0) return null;

    const detectedLang = detectLanguage(text);

    return findBestVoice(voices, detectedLang);
  };

  const getPreferredVoice = (): SpeechSynthesisVoice | null => {
    if (voices.length === 0) return null;

    const languageCode = language === "ar" ? "ar" : "en";

    let preferredVoice = voices.find((voice) =>
      voice.lang.toLowerCase().startsWith(languageCode)
    );

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

    await waitForVoices();

    return new Promise((resolve, reject) => {
      try {
        speechSynthesis.cancel();

        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(text);

          const detectedLang = detectLanguage(text);
          const voiceConfig = getVoiceConfig(detectedLang);

          const voice = options.voice || getPreferredVoiceForText(text);
          if (voice) {
            utterance.voice = voice;
          }

          utterance.rate = options.rate ?? 0.9;
          utterance.pitch = options.pitch ?? 1.0;
          utterance.volume = options.volume ?? 0.8;

          utterance.lang = voiceConfig.locale;

          let hasEnded = false;

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

              if (event.error === "canceled" || event.error === "not-allowed") {
                resolve();
                return;
              }

              if (
                event.error === "interrupted" ||
                event.error === "synthesis-failed"
              ) {
                resolve();
                return;
              }

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

          speechSynthesis.speak(utterance);

          setTimeout(() => {
            if (!hasEnded && !speechSynthesis.speaking) {
              hasEnded = true;
              setIsSpeaking(false);
              resolve();
            }
          }, 10000);
        }, 100);
      } catch (err) {
        setIsSpeaking(false);
        const errorMessage =
          err instanceof Error ? err.message : "Unknown TTS error";
        setError(errorMessage);
        reject(new Error(errorMessage));
      }
    });
  };

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
