
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ApiKeyInputProps {
  onApiKeySubmit: (apiKey: string) => void;
}

const ApiKeyInput = ({ onApiKeySubmit }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState<string>('');

  const handleSubmit = () => {
    if (apiKey.trim()) {
      onApiKeySubmit(apiKey);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg p-6 max-w-md mx-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">Configurar Google Maps</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Para usar o mapa, você precisa inserir sua chave da API do Google Maps.
          <br />
          <a 
            href="https://developers.google.com/maps/documentation/javascript/get-api-key" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Obter chave da API aqui
          </a>
        </p>
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Inserir chave da API do Google Maps"
          className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground mb-4"
        />
        <Button onClick={handleSubmit} className="w-full">
          Ativar Mapa
        </Button>
      </div>
    </div>
  );
};

export default ApiKeyInput;
