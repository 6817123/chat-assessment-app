/**
 * Language detection utility for determining if text is Arabic or English
 */

export type DetectedLanguage = "ar" | "en";

/**
 * Detect language of a given text
 * @param text The text to analyze
 * @returns 'ar' for Arabic, 'en' for English
 */
export function detectLanguage(text: string): DetectedLanguage {
  if (!text || !text.trim()) {
    return "en"; // Default to English for empty text
  }

  const trimmedText = text.trim();

  // Count Arabic characters (Unicode range for Arabic script)
  const arabicPattern =
    /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;
  const arabicMatches = trimmedText.match(arabicPattern) || [];
  const arabicCharCount = arabicMatches.length;

  // Count English letters
  const englishPattern = /[a-zA-Z]/g;
  const englishMatches = trimmedText.match(englishPattern) || [];
  const englishCharCount = englishMatches.length;

  // If no letters at all, default to English
  if (arabicCharCount === 0 && englishCharCount === 0) {
    return "en";
  }

  // If we have both Arabic and English characters, use the dominant one
  if (arabicCharCount > 0 && englishCharCount > 0) {
    return arabicCharCount >= englishCharCount ? "ar" : "en";
  }

  // If we only have Arabic characters
  if (arabicCharCount > 0) {
    return "ar";
  }

  // If we only have English characters or default case
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
      locale: "ar-SA", // Arabic (Saudi Arabia)
    };
  }

  return {
    langCode: "en",
    locale: "en-US", // English (United States)
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

  // First priority: Exact language match
  let bestVoice = voices.find((voice) =>
    voice.lang.toLowerCase().startsWith(langCode)
  );

  // Second priority: Language-specific searches
  if (!bestVoice) {
    if (detectedLang === "ar") {
      // Look for any Arabic voice
      bestVoice = voices.find(
        (voice) =>
          voice.lang.includes("ar-") ||
          voice.name.toLowerCase().includes("arabic") ||
          voice.name.toLowerCase().includes("عرب")
      );
    } else {
      // Look for any English voice or default voice
      bestVoice = voices.find(
        (voice) =>
          voice.lang.includes("en-") ||
          voice.default ||
          voice.name.toLowerCase().includes("english")
      );
    }
  }

  // Fallback: Return first available voice
  return bestVoice || voices[0] || null;
}
