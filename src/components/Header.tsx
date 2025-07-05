import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Shield, LogOut, Bell, Settings, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LanguageSelector } from './LanguageSelector';
import { useTranslation } from '@/hooks/useTranslation';
import { useState, useEffect } from 'react';

interface HeaderProps {
  onAuthClick: () => void;
  isAuthenticated: boolean;
}

const Header = ({ onAuthClick }: HeaderProps) => {
  const { isAuthenticated, userProfile, signOut } = useAuth();
  const { t } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Verificar modo escuro do sistema/localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-ios-dark-bg2/80 backdrop-blur-ios border-b border-ios-gray5/50 dark:border-ios-dark-bg4/50 transition-all duration-300 ease-ios">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo e Título */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-ios-lg bg-gradient-to-br from-ios-blue to-ios-indigo shadow-ios-md flex items-center justify-center transform transition-transform duration-200 hover:scale-105 active:scale-95">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-ios-green rounded-full border-2 border-white dark:border-ios-dark-bg2 animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-ios-dark-text tracking-tight">
                {t('map.title')}
              </h1>
              <p className="text-sm text-ios-gray dark:text-ios-dark-text3 font-medium">
                Rede mundial de oração estratégica
              </p>
            </div>
          </div>

          {/* Seção Central - Status Global */}
          <div className="hidden lg:flex items-center space-x-6">
            <div className="bg-ios-gray6/50 dark:bg-ios-dark-bg3/50 backdrop-blur-ios rounded-ios-lg px-4 py-2 border border-ios-gray5/30 dark:border-ios-dark-bg4/30">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-ios-green rounded-full animate-pulse shadow-ios-sm"></div>
                  <span className="text-sm font-medium text-ios-gray dark:text-ios-dark-text2">
                    1.247 intercessores
                  </span>
                </div>
                <div className="w-px h-4 bg-ios-gray4 dark:bg-ios-dark-bg4"></div>
                <Badge className="bg-ios-blue/10 text-ios-blue border-ios-blue/20 font-medium">
                  Movimento Global
                </Badge>
              </div>
            </div>
          </div>

          {/* Seção Direita - Controles */}
          <div className="flex items-center space-x-3">
            {/* Seletor de Idiomas */}
            <div className="hidden md:block">
              <LanguageSelector variant="compact" />
            </div>

            {/* Toggle Modo Escuro */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="relative w-10 h-10 rounded-ios-md bg-ios-gray6/50 dark:bg-ios-dark-bg3/50 backdrop-blur-ios border border-ios-gray5/30 dark:border-ios-dark-bg4/30 hover:bg-ios-gray6 dark:hover:bg-ios-dark-bg3 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-ios-yellow transition-transform duration-200 rotate-0" />
              ) : (
                <Moon className="w-5 h-5 text-ios-indigo transition-transform duration-200 rotate-0" />
              )}
            </Button>

            {/* Notificações */}
            <Button
              variant="ghost"
              size="sm"
              className="relative w-10 h-10 rounded-ios-md bg-ios-gray6/50 dark:bg-ios-dark-bg3/50 backdrop-blur-ios border border-ios-gray5/30 dark:border-ios-dark-bg4/30 hover:bg-ios-gray6 dark:hover:bg-ios-dark-bg3 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Bell className="w-5 h-5 text-ios-gray dark:text-ios-dark-text2" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-ios-red rounded-full border border-white dark:border-ios-dark-bg2"></div>
            </Button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {/* Admin Button */}
                {userProfile?.role === 'admin' && (
                  <Link to="/admin">
                    <Button 
                      variant="ghost"
                      size="sm" 
                      className="bg-ios-orange/10 hover:bg-ios-orange/20 text-ios-orange border border-ios-orange/20 rounded-ios-md font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      {t('navigation.admin')}
                    </Button>
                  </Link>
                )}

                {/* User Profile */}
                <div className="flex items-center space-x-3 bg-ios-gray6/50 dark:bg-ios-dark-bg3/50 backdrop-blur-ios rounded-ios-lg px-3 py-2 border border-ios-gray5/30 dark:border-ios-dark-bg4/30">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-gray-900 dark:text-ios-dark-text">
                      {userProfile?.display_name || t('spiritualPopup.intercessors')}
                    </p>
                    <p className="text-xs text-ios-gray dark:text-ios-dark-text3 font-medium">
                      {userProfile?.role === 'admin' ? 'Administrador' : 
                       userProfile?.role === 'moderator' ? 'Moderador' : 'Vigia Ativo'}
                    </p>
                  </div>
                  
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-9 h-9 rounded-ios-md bg-gradient-to-br from-ios-blue to-ios-purple shadow-ios-md flex items-center justify-center text-white text-sm font-bold">
                      {userProfile?.display_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-ios-green rounded-full border-2 border-white dark:border-ios-dark-bg2"></div>
                  </div>

                  {/* Logout Button */}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleSignOut}
                    className="w-8 h-8 rounded-ios-md hover:bg-ios-red/10 hover:text-ios-red transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                onClick={onAuthClick}
                className="bg-gradient-to-r from-ios-blue to-ios-indigo hover:from-ios-blue/90 hover:to-ios-indigo/90 text-white border-0 rounded-ios-lg px-6 py-2.5 font-semibold shadow-ios-md transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-ios-lg"
              >
                {t('auth.login')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
