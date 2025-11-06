/**
 * Vapi Multi-Language Configuration
 *
 * Maps i18n language codes to Vapi-specific settings for each language:
 * - Deepgram transcriber language code
 * - ElevenLabs voice ID
 * - Language display name
 *
 * Note: Voice IDs are placeholders for non-English languages and should be
 * updated with optimal ElevenLabs voice IDs after testing.
 */

export interface VapiLanguageConfig {
  deepgramCode: string;
  elevenLabsVoiceId: string;
  displayName: string;
}

export const VAPI_LANGUAGE_CONFIG: Record<string, VapiLanguageConfig> = {
  en: {
    deepgramCode: 'en',
    elevenLabsVoiceId: 'sarah', // Warm, friendly female voice
    displayName: 'English',
  },
  es: {
    deepgramCode: 'es',
    // TODO: Research and update with optimal Spanish voice ID from ElevenLabs
    // Options: Native Spanish voice or multilingual voice
    // Recommended: Test voices for Latin American vs. Spain accent preferences
    elevenLabsVoiceId: 'sarah', // Placeholder - multilingual voices can handle Spanish
    displayName: 'Español',
  },
  ja: {
    deepgramCode: 'ja',
    // TODO: Research and update with optimal Japanese voice ID from ElevenLabs
    // Recommended: Native Japanese voice for best quality and cultural appropriateness
    elevenLabsVoiceId: 'sarah', // Placeholder - needs Japanese voice
    displayName: '日本語',
  },
  zh: {
    deepgramCode: 'zh',
    // TODO: Research and update with optimal Chinese voice ID from ElevenLabs
    // Note: Specify Mandarin (zh-CN) vs. Cantonese if needed
    // Recommended: Native Chinese voice
    elevenLabsVoiceId: 'sarah', // Placeholder - needs Chinese voice
    displayName: '中文',
  },
};

/**
 * Get language configuration for Vapi assistant
 * Falls back to English if language is not supported
 */
export function getVapiLanguageConfig(languageCode: string): VapiLanguageConfig {
  return VAPI_LANGUAGE_CONFIG[languageCode] || VAPI_LANGUAGE_CONFIG['en'];
}
