/**
 * Helper functions for handling multi-language spiritual data
 */

import { SupportedLanguage } from '@/contexts/LanguageContext';

/**
 * Interface for multi-language spiritual data structure
 */
export interface MultiLanguageSpiritualData {
  pt?: {
    sistema_geopolitico_completo?: string;
    alvos_intercessao_completo?: string;
    outras_informacoes_importantes?: string;
  };
  en?: {
    sistema_geopolitico_completo?: string;
    alvos_intercessao_completo?: string;
    outras_informacoes_importantes?: string;
  };
  es?: {
    sistema_geopolitico_completo?: string;
    alvos_intercessao_completo?: string;
    outras_informacoes_importantes?: string;
  };
  // Legacy format (old data without multi-language)
  sistema_geopolitico_completo?: string;
  alvos_intercessao_completo?: string;
  outras_informacoes_importantes?: string;
}

/**
 * Get spiritual data in the specified language with fallback
 * @param data - The spiritual data object (can be multi-language or legacy format)
 * @param language - The desired language code (pt, en, es)
 * @returns The spiritual data in the requested language
 */
export const getSpiritualDataTranslated = (
  data: MultiLanguageSpiritualData | null | undefined,
  language: SupportedLanguage = 'pt'
): {
  sistema_geopolitico_completo: string;
  alvos_intercessao_completo: string;
  outras_informacoes_importantes: string;
} => {
  // Default empty values
  const emptyData = {
    sistema_geopolitico_completo: '',
    alvos_intercessao_completo: '',
    outras_informacoes_importantes: ''
  };

  if (!data) {
    return emptyData;
  }

  // Check if data is in new multi-language format
  const isMultiLanguage = data.pt || data.en || data.es;

  if (isMultiLanguage) {
    // Try to get data in requested language
    const languageData = data[language as 'pt' | 'en' | 'es'];
    
    if (languageData) {
      return {
        sistema_geopolitico_completo: languageData.sistema_geopolitico_completo || '',
        alvos_intercessao_completo: languageData.alvos_intercessao_completo || '',
        outras_informacoes_importantes: languageData.outras_informacoes_importantes || ''
      };
    }

    // Fallback to Portuguese if requested language not available
    if (data.pt) {
      return {
        sistema_geopolitico_completo: data.pt.sistema_geopolitico_completo || '',
        alvos_intercessao_completo: data.pt.alvos_intercessao_completo || '',
        outras_informacoes_importantes: data.pt.outras_informacoes_importantes || ''
      };
    }

    // Fallback to English if Portuguese not available
    if (data.en) {
      return {
        sistema_geopolitico_completo: data.en.sistema_geopolitico_completo || '',
        alvos_intercessao_completo: data.en.alvos_intercessao_completo || '',
        outras_informacoes_importantes: data.en.outras_informacoes_importantes || ''
      };
    }

    // Fallback to Spanish if neither Portuguese nor English available
    if (data.es) {
      return {
        sistema_geopolitico_completo: data.es.sistema_geopolitico_completo || '',
        alvos_intercessao_completo: data.es.alvos_intercessao_completo || '',
        outras_informacoes_importantes: data.es.outras_informacoes_importantes || ''
      };
    }
  }

  // Legacy format (old data) - return as is
  return {
    sistema_geopolitico_completo: data.sistema_geopolitico_completo || '',
    alvos_intercessao_completo: data.alvos_intercessao_completo || '',
    outras_informacoes_importantes: data.outras_informacoes_importantes || ''
  };
};

/**
 * Check if spiritual data is available in a specific language
 * @param data - The spiritual data object
 * @param language - The language code to check
 * @returns True if data is available in the specified language
 */
export const hasLanguageData = (
  data: MultiLanguageSpiritualData | null | undefined,
  language: SupportedLanguage
): boolean => {
  if (!data) return false;
  
  const langData = data[language as 'pt' | 'en' | 'es'];
  return !!(langData && (
    langData.sistema_geopolitico_completo ||
    langData.alvos_intercessao_completo ||
    langData.outras_informacoes_importantes
  ));
};

/**
 * Get available languages for spiritual data
 * @param data - The spiritual data object
 * @returns Array of available language codes
 */
export const getAvailableLanguages = (
  data: MultiLanguageSpiritualData | null | undefined
): SupportedLanguage[] => {
  if (!data) return [];
  
  const languages: SupportedLanguage[] = [];
  
  if (hasLanguageData(data, 'pt')) languages.push('pt');
  if (hasLanguageData(data, 'en')) languages.push('en');
  if (hasLanguageData(data, 'es')) languages.push('es');
  
  // Check for legacy format
  if (languages.length === 0 && (
    data.sistema_geopolitico_completo ||
    data.alvos_intercessao_completo ||
    data.outras_informacoes_importantes
  )) {
    languages.push('pt'); // Assume legacy data is in Portuguese
  }
  
  return languages;
};

/**
 * Format spiritual data for display
 * @param data - The spiritual data in a specific language
 * @returns Formatted sections for display
 */
export const formatSpiritualDataForDisplay = (data: {
  sistema_geopolitico_completo: string;
  alvos_intercessao_completo: string;
  outras_informacoes_importantes: string;
}) => {
  return {
    geopoliticalSystem: data.sistema_geopolitico_completo || 'Informações não disponíveis',
    intercessionTargets: data.alvos_intercessao_completo || 'Alvos não definidos',
    otherInformation: data.outras_informacoes_importantes || 'Sem informações adicionais'
  };
};

