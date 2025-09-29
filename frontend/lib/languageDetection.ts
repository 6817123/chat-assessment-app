export type DetectedLanguage = "ar" | "en";

/**
 * Detect language of a given text
 * @param text The text to analyze
 * @returns 'ar' for Arabic, 'en' for English
 */
export function detectLanguage(text: string): DetectedLanguage {
  if (!text || !text.trim()) {
    return "en";
  }

  const trimmedText = text.trim();

  const arabicPattern =
    /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;
  const arabicMatches = trimmedText.match(arabicPattern) || [];
  const arabicCharCount = arabicMatches.length;

  const englishPattern = /[a-zA-Z]/g;
  const englishMatches = trimmedText.match(englishPattern) || [];
  const englishCharCount = englishMatches.length;

  if (arabicCharCount === 0 && englishCharCount === 0) {
    return "en";
  }

  if (arabicCharCount > 0 && englishCharCount > 0) {
    return arabicCharCount >= englishCharCount ? "ar" : "en";
  }

  if (arabicCharCount > 0) {
    return "ar";
  }

  return "en";
}

/**
 * Get appropriate voice language code and locale based on detected language
 * @param detectedLang The detected language
 * @returns Object with lang code and locale
 */
export function getVoiceConfig(detectedLang: DetectedLanguage): {
  langCode: string;
  locale: string;
} {
  if (detectedLang === "ar") {
    return {
      langCode: "ar",
      locale: "ar-SA",
    };
  }

  return {
    langCode: "en",
    locale: "en-US",
  };
}

/**
 * Find the best voice for a detected language from available voices
 * @param voices Available speech synthesis voices
 * @param detectedLang Detected language
 * @returns Best matching voice or null if none found
 */
export function findBestVoice(
  voices: SpeechSynthesisVoice[],
  detectedLang: DetectedLanguage
): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;

  const { langCode } = getVoiceConfig(detectedLang);

  let bestVoice = voices.find((voice) =>
    voice.lang.toLowerCase().startsWith(langCode)
  );

  if (!bestVoice) {
    if (detectedLang === "ar") {
      bestVoice = voices.find(
        (voice) =>
          voice.lang.includes("ar-") ||
          voice.name.toLowerCase().includes("arabic") ||
          voice.name.toLowerCase().includes("عرب")
      );
    } else {
      bestVoice = voices.find(
        (voice) =>
          voice.lang.includes("en-") ||
          voice.default ||
          voice.name.toLowerCase().includes("english")
      );
    }
  }

  return bestVoice || voices[0] || null;
}
