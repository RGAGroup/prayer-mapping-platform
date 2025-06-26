import { useEffect, useState } from 'react';
import { useLanguage, SupportedLanguage } from '../contexts/LanguageContext';

type TranslationData = Record<string, any>;

// Cache das traduções carregadas
const translationCache: Record<SupportedLanguage, TranslationData> = {} as any;

export const useTranslation = () => {
  const { currentLanguage, setLanguage, isRTL, languages, getLanguageInfo } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [translations, setTranslations] = useState<TranslationData>({});

  // Função para carregar traduções
  const loadTranslations = async (language: SupportedLanguage) => {
    // Se já está no cache, usar
    if (translationCache[language]) {
      setTranslations(translationCache[language]);
      return;
    }

    setIsLoading(true);
    try {
      // Importação dinâmica do arquivo JSON
      const translationModule = await import(`../locales/${language}.json`);
      const translationData = translationModule.default || translationModule;
      
      // Armazenar no cache
      translationCache[language] = translationData;
      setTranslations(translationData);
    } catch (error) {
      console.warn(`Failed to load translations for ${language}, falling back to Portuguese`, error);
      
      // Fallback para português se falhar
      if (language !== 'pt') {
        try {
          const fallbackModule = await import(`../locales/pt.json`);
          const fallbackData = fallbackModule.default || fallbackModule;
          translationCache[language] = fallbackData;
          setTranslations(fallbackData);
        } catch (fallbackError) {
          console.error('Failed to load fallback translations', fallbackError);
          setTranslations({});
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar traduções quando o idioma mudar
  useEffect(() => {
    loadTranslations(currentLanguage);
  }, [currentLanguage]);

  // Função de tradução melhorada
  const t = (key: string, params?: Record<string, string | number>): string => {
    // Dividir a chave por pontos para navegar no objeto
    const keys = key.split('.');
    let value: any = translations;

    // Navegar pelo objeto de traduções
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Se não encontrar, retornar a chave original
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    // Se o valor final não for string, retornar a chave
    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string: ${key}`);
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
    await loadTranslations(language);
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