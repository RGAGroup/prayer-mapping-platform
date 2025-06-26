import { useEffect, useState } from 'react';
import { useLanguage, SupportedLanguage } from '../contexts/LanguageContext';

// Importações diretas dos arquivos de tradução
import ptTranslations from '../locales/pt.json';
import enTranslations from '../locales/en.json';
import esTranslations from '../locales/es.json';
import frTranslations from '../locales/fr.json';
import deTranslations from '../locales/de.json';

type TranslationData = Record<string, any>;

// Mapeamento estático das traduções
const translationsMap: Record<SupportedLanguage, TranslationData> = {
  pt: ptTranslations,
  en: enTranslations,
  es: esTranslations,
  fr: frTranslations,
  de: deTranslations,
  // Para idiomas ainda não implementados, usar português como fallback
  zh: ptTranslations,
  ar: ptTranslations,
  ru: ptTranslations,
  hi: ptTranslations,
  ja: ptTranslations,
};

export const useTranslation = () => {
  const { currentLanguage, setLanguage, isRTL, languages, getLanguageInfo } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [translations, setTranslations] = useState<TranslationData>(ptTranslations);

  // Carregar traduções quando o idioma mudar
  useEffect(() => {
    const loadTranslations = () => {
      setIsLoading(true);
      try {
        const translationData = translationsMap[currentLanguage] || ptTranslations;
        setTranslations(translationData);
        console.log(`🌍 Translations loaded for ${currentLanguage}:`, Object.keys(translationData));
      } catch (error) {
        console.error('Failed to load translations:', error);
        setTranslations(ptTranslations);
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [currentLanguage]);

  // Função de tradução melhorada
  const t = (key: string, params?: Record<string, string | number>): string => {
    if (!key) {
      console.warn('Translation key is empty');
      return '';
    }

    // Dividir a chave por pontos para navegar no objeto
    const keys = key.split('.');
    let value: any = translations;

    // Navegar pelo objeto de traduções
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Se não encontrar, tentar no fallback português
        const fallbackKeys = key.split('.');
        let fallbackValue: any = ptTranslations;
        
        for (const fk of fallbackKeys) {
          if (fallbackValue && typeof fallbackValue === 'object' && fk in fallbackValue) {
            fallbackValue = fallbackValue[fk];
          } else {
            console.warn(`Translation key not found: ${key}`);
            return key;
          }
        }
        
        value = fallbackValue;
        break;
      }
    }

    // Se o valor final não for string, retornar a chave
    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string: ${key}`, value);
      return key;
    }

    let translation = value;

    // Substituir parâmetros se fornecidos
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        const placeholder = `{{${paramKey}}}`;
        translation = translation.replace(new RegExp(placeholder, 'g'), String(paramValue));
      });
    }

    return translation;
  };

  // Função para mudar idioma
  const changeLanguage = async (language: SupportedLanguage) => {
    setLanguage(language);
    // A mudança será aplicada pelo useEffect
  };

  // Função para obter tradução com fallback
  const tWithFallback = (key: string, fallback: string, params?: Record<string, string | number>): string => {
    const translation = t(key, params);
    return translation === key ? fallback : translation;
  };

  // Função para pluralização simples
  const tPlural = (key: string, count: number, params?: Record<string, string | number>): string => {
    const pluralKey = count === 1 ? `${key}.singular` : `${key}.plural`;
    const finalParams = { ...params, count };
    
    const translation = t(pluralKey, finalParams);
    if (translation === pluralKey) {
      // Fallback para a chave base se não encontrar plural
      return t(key, finalParams);
    }
    
    return translation;
  };

  return {
    t,
    tWithFallback,
    tPlural,
    currentLanguage,
    changeLanguage,
    isLoading,
    isRTL,
    languages,
    getLanguageInfo,
  };
}; 