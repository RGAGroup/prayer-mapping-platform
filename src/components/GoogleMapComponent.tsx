import { useState, useEffect } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import { useLocations } from '@/hooks/useLocations';
import MapComponent from './map/MapComponent';
import MapLoading from './map/MapLoading';
import MapError from './map/MapError';
import ApiKeyInput from './map/ApiKeyInput';
import MapLegend from './map/MapLegend';
import GlobalActivity from './map/GlobalActivity';
import ApiKeyReset from './map/ApiKeyReset';
import { useMobile } from '@/hooks/use-mobile';
import { AlertCircle, Wifi, WifiOff, Smartphone, Signal } from 'lucide-react';

interface GoogleMapComponentProps {
  onLocationSelect: (location: any) => void;
}

const GoogleMapComponent = ({ onLocationSelect }: GoogleMapComponentProps) => {
  const { data: locations = [], isLoading, error } = useLocations();
  const { isMobile, isMobileDevice, screenWidth } = useMobile();
  
  // API key atualizada para suportar o domínio atalaia.global
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiInput, setShowApiInput] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [mapReady, setMapReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Detectar status da internet
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Inicializar API key com fallback e validação
  useEffect(() => {
    console.log('🗺️ Inicializando Google Maps para mobile:', { 
      isMobile, 
      isMobileDevice, 
      screenWidth,
      isOnline 
    });

    const savedApiKey = localStorage.getItem('google-maps-api-key');
    
    if (savedApiKey && savedApiKey.length > 20) {
      console.log('🔑 Usando API key salva');
      setApiKey(savedApiKey);
      setMapError(null);
    } else {
      // Solicitar nova API key devido a problemas CORS
      console.log('⚠️ API key padrão com problemas CORS - solicitando nova configuração');
      setShowApiInput(true);
      setMapError('API key precisa ser configurada para o domínio atalaia.global');
    }
    
  }, [isMobile, isMobileDevice, screenWidth, isOnline]);

  // Simular progresso de carregamento para mobile
  useEffect(() => {
    if (isLoading || !mapReady) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) return prev; // Não passar de 90% até estar realmente pronto
          return prev + Math.random() * 10;
        });
      }, 500);

      return () => clearInterval(interval);
    } else {
      setLoadingProgress(100);
    }
  }, [isLoading, mapReady]);

  const handleApiKeySubmit = (newApiKey: string) => {
    console.log('🔑 Nova API key configurada para mobile');
    localStorage.setItem('google-maps-api-key', newApiKey);
    setApiKey(newApiKey);
    setShowApiInput(false);
    setMapError(null);
    setMapReady(false);
    setLoadingProgress(0);
  };

  const handleApiKeyReset = () => {
    console.log('🔄 Resetando API key no mobile');
    localStorage.removeItem('google-maps-api-key');
    setShowApiInput(true);
    setMapError(null);
    setMapReady(false);
  };

  const handleMapReady = () => {
    console.log('✅ Google Maps pronto para mobile');
    setMapReady(true);
    setLoadingProgress(100);
  };

  const handleMapError = (errorMessage: string) => {
    console.error('❌ Erro no Google Maps mobile:', errorMessage);
    setMapError(errorMessage);
    setMapReady(false);
  };

  // Componente de loading otimizado para mobile
  const MobileMapLoading = () => (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="text-center px-4">
        <div className="mb-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
            <div className={`absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin`}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              {isMobile ? (
                <Smartphone className="h-8 w-8 text-blue-600" />
              ) : (
                <Signal className="h-8 w-8 text-blue-600" />
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className={`${isMobile ? 'text-base' : 'text-lg'} text-gray-800 font-medium`}>
            Carregando mapa global...
          </p>
          
          <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>
            {loadingProgress < 30 ? 'Conectando...' : 
             loadingProgress < 60 ? 'Carregando dados...' : 
             loadingProgress < 90 ? 'Preparando mapa...' : 'Quase pronto...'}
          </p>
          
          {isMobile && (
            <div className="flex items-center justify-center gap-2 mt-4">
              {isOnline ? (
                <><Wifi className="h-4 w-4 text-green-600" /><span className="text-xs text-green-600">Online</span></>
              ) : (
                <><WifiOff className="h-4 w-4 text-red-600" /><span className="text-xs text-red-600">Offline</span></>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Componente de erro otimizado para mobile com informações sobre CORS
  const MobileMapError = () => (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
      <div className={`text-center ${isMobile ? 'max-w-xs' : 'max-w-md'}`}>
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
        </div>
        
        <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-red-800 mb-2`}>
          Configuração do Mapa Necessária
        </h3>
        
        <div className="space-y-2 text-red-700">
          <p className={`${isMobile ? 'text-sm' : 'text-base'}`}>
            {!isOnline ? 'Verifique sua conexão com a internet' : 
             'A API key do Google Maps precisa ser configurada para este domínio'}
          </p>
          
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-amber-700`}>
              <strong>🔧 Solução:</strong> Configure uma nova API key do Google Maps que permita o domínio "atalaia.global"
            </p>
          </div>
          
          {isMobile && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600">
                💡 <strong>Dica:</strong> Clique em "Configurar API" abaixo para resolver este problema
              </p>
            </div>
          )}
        </div>
        
        <div className="mt-6 space-y-2">
          <button
            onClick={handleApiKeyReset}
            className={`w-full ${isMobile ? 'py-2 text-sm' : 'py-3 text-base'} bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors`}
          >
            Configurar API Key
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className={`w-full ${isMobile ? 'py-2 text-sm' : 'py-3 text-base'} bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors`}
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    </div>
  );

  // Verificar se está offline
  if (!isOnline) {
    return <MobileMapError />;
  }

  // Verificar se há erro nos dados
  if (error) {
    return <MobileMapError />;
  }

  // Verificar se está carregando
  if (isLoading || !mapReady) {
    return <MobileMapLoading />;
  }

  // Verificar se precisa configurar API key
  if (showApiInput || !apiKey) {
    return <ApiKeyInput onApiKeySubmit={handleApiKeySubmit} />;
  }

  // Verificar se há erro no mapa
  if (mapError) {
    return <MobileMapError />;
  }

  return (
    <div className="relative h-screen w-full">
      <Wrapper 
        apiKey={apiKey} 
        version="beta" 
        libraries={["marker", "geometry", "places"]}
        render={(status) => {
          if (status === 'FAILURE') {
            handleMapError('Falha ao carregar Google Maps API - verifique a API key');
            return <MobileMapError />;
          }
          if (status === 'LOADING') {
            return <MobileMapLoading />;
          }
          return <div>Carregando mapa...</div>;
        }}
      >
        <MapComponent 
          locations={locations} 
          onLocationSelect={onLocationSelect}
        />
      </Wrapper>

      {/* Componentes da UI - adaptados para mobile */}
      {!isMobile && <MapLegend />}
      <GlobalActivity locations={locations} />
      <ApiKeyReset onReset={handleApiKeyReset} />
      
      {/* Indicador de status para mobile */}
      {isMobile && (
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 shadow-lg">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <><Wifi className="h-3 w-3 text-green-600" /><span className="text-xs text-green-600">Online</span></>
              ) : (
                <><WifiOff className="h-3 w-3 text-red-600" /><span className="text-xs text-red-600">Offline</span></>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMapComponent;
