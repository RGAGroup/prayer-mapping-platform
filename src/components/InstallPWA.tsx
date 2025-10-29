import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPWA = () => {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Detectar se já está instalado
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Listener para o evento beforeinstallprompt (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Mostrar prompt após 10 segundos (para não ser intrusivo)
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 10000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listener para quando o app for instalado
    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA instalado com sucesso!');
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Mostrar o prompt de instalação
    deferredPrompt.prompt();

    // Aguardar a escolha do usuário
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`Usuário ${outcome === 'accepted' ? 'aceitou' : 'recusou'} a instalação`);

    if (outcome === 'accepted') {
      setShowInstallPrompt(false);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Guardar no localStorage para não mostrar novamente por 7 dias
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Não mostrar se já está instalado
  if (isStandalone) return null;

  // Verificar se foi dispensado recentemente
  const dismissedTime = localStorage.getItem('pwa-install-dismissed');
  if (dismissedTime) {
    const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
    if (daysSinceDismissed < 7) return null;
  }

  // Prompt para iOS (manual)
  if (isIOS && showInstallPrompt) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-black/80 to-transparent backdrop-blur-md">
        <Card className="bg-white/95 dark:bg-ios-dark-bg2/95 border-ios-gray5/30 dark:border-ios-dark-bg4/30 rounded-ios-xl shadow-ios-2xl">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-ios-lg flex items-center justify-center">
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-ios-dark-text">
                    {t('pwa.install.title')}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-ios-dark-text3">
                    {t('pwa.install.subtitle')}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-ios-lg p-3 space-y-2">
              <p className="text-xs text-blue-900 dark:text-blue-200 font-medium">
                {t('pwa.install.iosInstructions')}
              </p>
              <ol className="text-xs text-blue-800 dark:text-blue-300 space-y-1 ml-4 list-decimal">
                <li>{t('pwa.install.iosStep1')}</li>
                <li>{t('pwa.install.iosStep2')}</li>
                <li>{t('pwa.install.iosStep3')}</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prompt para Android/Desktop (automático)
  if (deferredPrompt && showInstallPrompt) {
    return (
      <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-50">
        <Card className="bg-white/95 dark:bg-ios-dark-bg2/95 backdrop-blur-md border-ios-gray5/30 dark:border-ios-dark-bg4/30 rounded-ios-xl shadow-ios-2xl">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-ios-lg flex items-center justify-center">
                  <Download className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-ios-dark-text">
                    {t('pwa.install.title')}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-ios-dark-text3">
                    {t('pwa.install.subtitle')}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-ios-dark-text3">
                <Monitor className="h-4 w-4" />
                <span>{t('pwa.install.benefit1')}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-ios-dark-text3">
                <Smartphone className="h-4 w-4" />
                <span>{t('pwa.install.benefit2')}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-ios-dark-text3">
                <Download className="h-4 w-4" />
                <span>{t('pwa.install.benefit3')}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleInstallClick}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {t('pwa.install.installButton')}
              </Button>
              <Button
                variant="outline"
                onClick={handleDismiss}
                className="flex-1"
              >
                {t('pwa.install.laterButton')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default InstallPWA;

