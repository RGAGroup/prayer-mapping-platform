import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMobile } from '@/hooks/use-mobile';
import { Key, ExternalLink, Smartphone, Wifi, AlertCircle } from 'lucide-react';

interface ApiKeyInputProps {
  onApiKeySubmit: (apiKey: string) => void;
}

const ApiKeyInput = ({ onApiKeySubmit }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState<string>('');
  const { isMobile } = useMobile();

  const handleSubmit = () => {
    if (apiKey.trim()) {
      onApiKeySubmit(apiKey);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className={`bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg p-6 ${isMobile ? 'max-w-sm mx-4' : 'max-w-md mx-4'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Key className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-foreground`}>
              Configurar Google Maps
            </h3>
            {isMobile && (
              <div className="flex items-center gap-1 mt-1">
                <Smartphone className="h-3 w-3 text-blue-500" />
                <span className="text-xs text-blue-500">Modo Mobile</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-amber-700 font-medium`}>
                  API Key necessária
                </p>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-amber-600 mt-1`}>
                  Para usar o mapa, você precisa inserir sua chave da API do Google Maps.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-foreground`}>
              Chave da API:
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Inserir chave da API do Google Maps"
              className={`w-full px-3 ${isMobile ? 'py-2 text-sm' : 'py-3 text-base'} bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              autoComplete="off"
            />
          </div>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleSubmit} 
              className={`w-full ${isMobile ? 'h-10 text-sm' : 'h-12 text-base'} bg-blue-600 hover:bg-blue-700 text-white`}
              disabled={!apiKey.trim()}
            >
              <div className="flex items-center justify-center gap-2">
                <Wifi className="h-4 w-4" />
                Ativar Mapa
              </div>
            </Button>
            
            <a 
              href="https://developers.google.com/maps/documentation/javascript/get-api-key" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`w-full ${isMobile ? 'py-2 text-sm' : 'py-3 text-base'} bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium transition-colors flex items-center justify-center gap-2`}
            >
              <ExternalLink className="h-4 w-4" />
              Obter chave da API
            </a>
          </div>
          
          {isMobile && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                💡 <strong>Dica para mobile:</strong> A chave da API é necessária para carregar o mapa no seu dispositivo.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiKeyInput;
