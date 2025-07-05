import React from 'react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Globe, Check } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { SupportedLanguage } from '../contexts/LanguageContext';

interface LanguageSelectorProps {
  variant?: 'default' | 'compact' | 'icon-only';
  showLabel?: boolean;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'default',
  showLabel = true,
  className = '',
}) => {
  const { t, currentLanguage, changeLanguage, languages, getLanguageInfo } = useTranslation();

  const currentLangInfo = getLanguageInfo(currentLanguage);

  const handleLanguageChange = async (language: SupportedLanguage) => {
    await changeLanguage(language);
    
    // Mostrar notificação de mudança de idioma
    console.log(`🌍 ${t('languages.languageChanged', { language: getLanguageInfo(language).nativeName })}`);
  };

  // Variante apenas ícone - iOS Style
  if (variant === 'icon-only') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`w-10 h-10 rounded-ios-md bg-ios-gray6/50 dark:bg-ios-dark-bg3/50 backdrop-blur-ios border border-ios-gray5/30 dark:border-ios-dark-bg4/30 hover:bg-ios-gray6 dark:hover:bg-ios-dark-bg3 transition-all duration-200 hover:scale-105 active:scale-95 ${className}`}
          >
            <Globe className="w-5 h-5 text-ios-gray dark:text-ios-dark-text2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-64 bg-white/95 dark:bg-ios-dark-bg2/95 backdrop-blur-ios border border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl shadow-ios-xl"
        >
          <div className="px-4 py-3 border-b border-ios-gray5/20 dark:border-ios-dark-bg4/20">
            <div className="font-semibold text-gray-900 dark:text-ios-dark-text">
              {t('languages.selectLanguage')}
            </div>
          </div>
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className="flex items-center justify-between cursor-pointer p-4 hover:bg-ios-gray6/50 dark:hover:bg-ios-dark-bg3/50 transition-colors duration-200 rounded-ios-md mx-2 my-1"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{lang.flag}</span>
                <div>
                  <div className="font-medium text-gray-900 dark:text-ios-dark-text">{lang.nativeName}</div>
                  <div className="text-xs text-ios-gray dark:text-ios-dark-text3">{lang.name}</div>
                </div>
              </div>
              {currentLanguage === lang.code && (
                <div className="w-6 h-6 rounded-full bg-ios-blue flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Variante compacta - iOS Style
  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost"
            size="sm" 
            className={`gap-2 bg-ios-gray6/50 dark:bg-ios-dark-bg3/50 backdrop-blur-ios border border-ios-gray5/30 dark:border-ios-dark-bg4/30 hover:bg-ios-gray6 dark:hover:bg-ios-dark-bg3 rounded-ios-md transition-all duration-200 hover:scale-105 active:scale-95 ${className}`}
          >
            <span className="text-lg">{currentLangInfo.flag}</span>
            <span className="hidden sm:inline font-medium text-gray-900 dark:text-ios-dark-text">
              {currentLangInfo.code.toUpperCase()}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-64 bg-white/95 dark:bg-ios-dark-bg2/95 backdrop-blur-ios border border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl shadow-ios-xl"
        >
          <div className="px-4 py-3 border-b border-ios-gray5/20 dark:border-ios-dark-bg4/20">
            <div className="font-semibold text-gray-900 dark:text-ios-dark-text">
              {t('languages.selectLanguage')}
            </div>
          </div>
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className="flex items-center justify-between cursor-pointer p-4 hover:bg-ios-gray6/50 dark:hover:bg-ios-dark-bg3/50 transition-colors duration-200 rounded-ios-md mx-2 my-1"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{lang.flag}</span>
                <div>
                  <div className="font-medium text-gray-900 dark:text-ios-dark-text">{lang.nativeName}</div>
                  <div className="text-xs text-ios-gray dark:text-ios-dark-text3">{lang.name}</div>
                </div>
              </div>
              {currentLanguage === lang.code && (
                <div className="w-6 h-6 rounded-full bg-ios-blue flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Variante padrão (completa) - iOS Style
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost"
          className={`gap-3 bg-ios-gray6/50 dark:bg-ios-dark-bg3/50 backdrop-blur-ios border border-ios-gray5/30 dark:border-ios-dark-bg4/30 hover:bg-ios-gray6 dark:hover:bg-ios-dark-bg3 rounded-ios-lg transition-all duration-200 hover:scale-105 active:scale-95 px-4 py-2 ${className}`}
        >
          <div className="w-6 h-6 rounded-ios-sm bg-ios-blue/10 flex items-center justify-center">
            <Globe className="w-4 h-4 text-ios-blue" />
          </div>
          <span className="text-xl">{currentLangInfo.flag}</span>
          {showLabel && (
            <>
              <span className="hidden sm:inline font-medium text-gray-900 dark:text-ios-dark-text">
                {currentLangInfo.nativeName}
              </span>
              <span className="sm:hidden font-medium text-gray-900 dark:text-ios-dark-text">
                {currentLangInfo.code.toUpperCase()}
              </span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-72 bg-white/95 dark:bg-ios-dark-bg2/95 backdrop-blur-ios border border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl shadow-ios-xl"
      >
        <div className="px-4 py-4 border-b border-ios-gray5/20 dark:border-ios-dark-bg4/20">
          <div className="font-bold text-gray-900 dark:text-ios-dark-text text-lg">
            {t('languages.selectLanguage')}
          </div>
          <div className="text-sm text-ios-gray dark:text-ios-dark-text3 mt-1">
            {t('languages.currentLanguage')}: {currentLangInfo.nativeName}
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto p-2">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className="flex items-center justify-between cursor-pointer p-4 hover:bg-ios-gray6/50 dark:hover:bg-ios-dark-bg3/50 transition-colors duration-200 rounded-ios-lg mx-1 my-1"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{lang.flag}</span>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-ios-dark-text">{lang.nativeName}</div>
                  <div className="text-sm text-ios-gray dark:text-ios-dark-text3">{lang.name}</div>
                </div>
              </div>
              {currentLanguage === lang.code && (
                <div className="flex items-center gap-2 bg-ios-blue/10 px-3 py-1 rounded-ios-md">
                  <div className="w-5 h-5 rounded-full bg-ios-blue flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-ios-blue">Atual</span>
                </div>
              )}
            </DropdownMenuItem>
          ))}
        </div>
        <div className="px-4 py-3 border-t border-ios-gray5/20 dark:border-ios-dark-bg4/20 bg-ios-gray6/30 dark:bg-ios-dark-bg3/30 rounded-b-ios-xl">
          <div className="text-xs text-ios-gray dark:text-ios-dark-text3 text-center font-medium">
            🌍 Sistema de Oração Global
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 