import React, { useState, useEffect } from 'react';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface GoogleMapsStatus {
  loaded: boolean;
  error: string | null;
  apiKey: boolean;
  geocoderReady: boolean;
}

export const GoogleMapsStatus: React.FC = () => {
  const [status, setStatus] = useState<GoogleMapsStatus>({
    loaded: false,
    error: null,
    apiKey: false,
    geocoderReady: false
  });

  useEffect(() => {
    const checkGoogleMapsStatus = () => {
      try {
        // Verificar se window.google existe
        const hasGoogle = typeof window !== 'undefined' && window.google;
        
        // Verificar se google.maps existe
        const hasMaps = hasGoogle && window.google.maps;
        
        // Verificar se Geocoder está disponível
        const hasGeocoder = hasMaps && window.google.maps.Geocoder;
        
        // Verificar se há API key (indiretamente)
        const hasApiKey = hasMaps && window.google.maps.version;

        setStatus({
          loaded: Boolean(hasMaps),
          error: null,
          apiKey: Boolean(hasApiKey),
          geocoderReady: Boolean(hasGeocoder)
        });

        if (hasMaps) {
          console.log('✅ Google Maps carregado:', {
            version: window.google.maps.version,
            geocoder: Boolean(hasGeocoder)
          });
        }

      } catch (error) {
        setStatus({
          loaded: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          apiKey: false,
          geocoderReady: false
        });
      }
    };

    // Verificar imediatamente
    checkGoogleMapsStatus();

    // Verificar periodicamente
    const interval = setInterval(checkGoogleMapsStatus, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (isReady: boolean, isLoading = false) => {
    if (isLoading) return <Clock className="w-3 h-3 animate-spin" />;
    return isReady ? 
      <CheckCircle className="w-3 h-3 text-green-600" /> : 
      <XCircle className="w-3 h-3 text-red-600" />;
  };

  const getStatusVariant = (isReady: boolean): "default" | "secondary" | "destructive" | "outline" => {
    return isReady ? "secondary" : "destructive";
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <span className="text-lg">🗺️</span>
          Status Google Maps API
        </CardTitle>
        <CardDescription>
          Verificação em tempo real da disponibilidade do Google Maps
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Google Maps API */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Google Maps API:</span>
          <Badge variant={getStatusVariant(status.loaded)} className="flex items-center gap-1">
            {getStatusIcon(status.loaded, !status.loaded && !status.error)}
            {status.loaded ? 'Carregado' : status.error ? 'Erro' : 'Carregando...'}
          </Badge>
        </div>

        {/* API Key */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">API Key:</span>
          <Badge variant={getStatusVariant(status.apiKey)} className="flex items-center gap-1">
            {getStatusIcon(status.apiKey)}
            {status.apiKey ? 'Configurada' : 'Ausente'}
          </Badge>
        </div>

        {/* Geocoder */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Geocoder:</span>
          <Badge variant={getStatusVariant(status.geocoderReady)} className="flex items-center gap-1">
            {getStatusIcon(status.geocoderReady)}
            {status.geocoderReady ? 'Pronto' : 'Indisponível'}
          </Badge>
        </div>

        {/* Versão */}
        {status.loaded && typeof window !== 'undefined' && window.google?.maps?.version && (
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Versão:</span>
            <span>{window.google.maps.version}</span>
          </div>
        )}

        {/* Erro */}
        {status.error && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            <div className="flex items-center gap-1 font-medium">
              <AlertTriangle className="w-3 h-3" />
              Erro detectado:
            </div>
            <div className="mt-1">{status.error}</div>
          </div>
        )}

        {/* Status Geral */}
        <div className="pt-2 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Status Geral:</span>
            <Badge 
              variant={status.loaded && status.geocoderReady ? "default" : "destructive"}
              className="flex items-center gap-1"
            >
              {status.loaded && status.geocoderReady ? (
                <>
                  <CheckCircle className="w-3 h-3" />
                  Pronto para Teste
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3" />
                  Não Pronto
                </>
              )}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleMapsStatus; 