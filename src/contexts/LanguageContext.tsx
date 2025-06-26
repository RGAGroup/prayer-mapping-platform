import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Tipos para o sistema de idiomas
export type SupportedLanguage = 'pt' | 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ar' | 'ru' | 'hi' | 'ja';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
}

// Idiomas suportados
export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
];

// Interface do contexto
interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isRTL: boolean;
  languages: LanguageInfo[];
  getLanguageInfo: (code: SupportedLanguage) => LanguageInfo;
}

// Context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider Props
interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: SupportedLanguage;
}

// Hook personalizado
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Provider Component
export const LanguageProvider: React.FC<LanguageProviderProps> = ({ 
  children, 
  defaultLanguage = 'pt' 
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(() => {
    // Tentar recuperar do localStorage
    const saved = localStorage.getItem('prayer-mapping-language');
    if (saved && SUPPORTED_LANGUAGES.find(lang => lang.code === saved)) {
      return saved as SupportedLanguage;
    }
    
    // Detectar idioma do navegador
    const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
    if (SUPPORTED_LANGUAGES.find(lang => lang.code === browserLang)) {
      return browserLang;
    }
    
    return defaultLanguage;
  });

  // Salvar no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('prayer-mapping-language', currentLanguage);
    
    // Aplicar direção RTL se necessário
    const langInfo = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage);
    document.documentElement.dir = langInfo?.rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  const setLanguage = (language: SupportedLanguage) => {
    setCurrentLanguage(language);
  };

  const getLanguageInfo = (code: SupportedLanguage): LanguageInfo => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code) || SUPPORTED_LANGUAGES[0];
  };

  const isRTL = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage)?.rtl || false;

  // Função de tradução básica (o hook useTranslation tem a versão completa)
  const t = (key: string, params?: Record<string, string | number>): string => {
    // Esta é uma versão simplificada - o useTranslation tem a implementação completa
    let translation = key;
    
    // Substituir parâmetros se fornecidos
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        translation = translation.replace(`{{${paramKey}}}`, String(value));
      });
    }
    
    return translation;
  };

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    t,
    isRTL,
    languages: SUPPORTED_LANGUAGES,
    getLanguageInfo,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}; 