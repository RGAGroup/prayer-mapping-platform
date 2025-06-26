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

  // Variante apenas ícone
  if (variant === 'icon-only') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={`p-2 ${className}`}>
            <Globe className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5 text-sm font-semibold text-gray-700 border-b">
            {t('languages.selectLanguage')}
          </div>
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{lang.flag}</span>
                <div>
                  <div className="font-medium">{lang.nativeName}</div>
                  <div className="text-xs text-gray-500">{lang.name}</div>
                </div>
              </div>
              {currentLanguage === lang.code && (
                <Check className="w-4 h-4 text-blue-600" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Variante compacta
  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={`gap-2 ${className}`}>
            <span className="text-lg">{currentLangInfo.flag}</span>
            <span className="hidden sm:inline">{currentLangInfo.code.toUpperCase()}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5 text-sm font-semibold text-gray-700 border-b">
            {t('languages.selectLanguage')}
          </div>
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{lang.flag}</span>
                <div>
                  <div className="font-medium">{lang.nativeName}</div>
                  <div className="text-xs text-gray-500">{lang.name}</div>
                </div>
              </div>
              {currentLanguage === lang.code && (
                <Check className="w-4 h-4 text-blue-600" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Variante padrão (completa)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={`gap-2 ${className}`}>
          <Globe className="w-4 h-4" />
          <span className="text-lg">{currentLangInfo.flag}</span>
          {showLabel && (
            <>
              <span className="hidden sm:inline">{currentLangInfo.nativeName}</span>
              <span className="sm:hidden">{currentLangInfo.code.toUpperCase()}</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-3 py-2 border-b">
          <div className="font-semibold text-gray-800">{t('languages.selectLanguage')}</div>
          <div className="text-xs text-gray-500">
            {t('languages.currentLanguage')}: {currentLangInfo.nativeName}
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className="flex items-center justify-between cursor-pointer p-3 hover:bg-blue-50"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{lang.flag}</span>
                <div>
                  <div className="font-medium text-gray-800">{lang.nativeName}</div>
                  <div className="text-sm text-gray-500">{lang.name}</div>
                </div>
              </div>
              {currentLanguage === lang.code && (
                <div className="flex items-center gap-1 text-blue-600">
                  <Check className="w-4 h-4" />
                  <span className="text-xs font-medium">Atual</span>
                </div>
              )}
            </DropdownMenuItem>
          ))}
        </div>
        <div className="px-3 py-2 border-t bg-gray-50">
          <div className="text-xs text-gray-500 text-center">
            🌍 Sistema de Oração Global
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 