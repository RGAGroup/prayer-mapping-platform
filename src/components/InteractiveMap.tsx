
import { useEffect, useRef, useState } from 'react';
import { LocationData } from '@/types/Location';
import { useLocations } from '@/hooks/useLocations';

interface InteractiveMapProps {
  onLocationSelect: (location: LocationData) => void;
}

const InteractiveMap = ({ onLocationSelect }: InteractiveMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mapCenter, setMapCenter] = useState({ x: 50, y: 50 });
  
  // Usar dados reais do Supabase
  const { data: locations = [], isLoading, error } = useLocations();

  const handleLocationClick = (location: LocationData) => {
    onLocationSelect(location);
    console.log('Location selected:', location.name);
  };

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setMapCenter({ x, y });
  };

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.max(0.5, Math.min(4, prev + delta)));
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-celestial-400 mx-auto mb-4"></div>
          <p className="text-lg">Carregando mapa espiritual global...</p>
          <p className="text-sm text-celestial-300 mt-2">Conectando com dados de intercessão</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-red-900 to-slate-800">
        <div className="text-center text-white">
          <p className="text-lg text-red-300 mb-2">Erro ao carregar dados espirituais</p>
          <p className="text-sm">Verifique sua conexão e tente novamente</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Map Background */}
      <div 
        ref={mapRef}
        className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative cursor-crosshair"
        onClick={handleMapClick}
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: `${mapCenter.x}% ${mapCenter.y}%`,
          transition: 'transform 0.3s ease-out'
        }}
      >
        {/* Continents representation */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-32 h-24 bg-green-800 rounded-3xl transform -rotate-12"></div>
          <div className="absolute top-1/3 right-1/4 w-40 h-32 bg-green-700 rounded-3xl transform rotate-6"></div>
          <div className="absolute bottom-1/3 left-1/3 w-36 h-28 bg-green-600 rounded-2xl transform rotate-12"></div>
          <div className="absolute bottom-1/4 right-1/3 w-28 h-20 bg-green-500 rounded-xl transform -rotate-6"></div>
        </div>

        {/* Location Markers */}
        {locations.map((location) => (
          <div
            key={location.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{
              left: `${location.coordinates[0]}%`,
              top: `${location.coordinates[1]}%`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleLocationClick(location);
            }}
          >
            {/* Spiritual Activity Rings */}
            <div className="absolute inset-0 w-8 h-8 rounded-full bg-divine-500/20 animate-ping"></div>
            <div className="absolute inset-0 w-6 h-6 rounded-full bg-celestial-500/30 animate-pulse"></div>
            
            {/* Main Marker */}
            <div className="relative w-4 h-4 bg-gradient-to-r from-celestial-400 to-divine-400 rounded-full divine-glow border-2 border-white group-hover:scale-125 transition-transform">
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>

            {/* Hover Info */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-card/95 backdrop-blur-sm border border-border/50 rounded-lg px-3 py-2 min-w-max z-10">
              <p className="text-sm font-medium text-foreground">{location.name}</p>
              <p className="text-xs text-muted-foreground">{location.intercessorCount} intercessores</p>
              {location.spiritualAlerts.length > 0 && (
                <div className="flex items-center mt-1">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1"></div>
                  <span className="text-xs text-red-400">Alerta ativo</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Spiritual Activity Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Divine Light Streams */}
          <div className="absolute top-1/4 left-1/2 w-0.5 h-32 bg-gradient-to-b from-divine-400/60 to-transparent transform -translate-x-1/2 rotate-45 animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/3 w-0.5 h-24 bg-gradient-to-b from-celestial-400/60 to-transparent transform -translate-x-1/2 -rotate-12 animate-pulse delay-1000"></div>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col space-y-2">
        <div className="bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg p-2">
          <button
            onClick={() => handleZoom(0.2)}
            className="block w-8 h-8 text-foreground hover:text-celestial-400 transition-colors"
          >
            +
          </button>
          <div className="border-t border-border/30 my-1"></div>
          <button
            onClick={() => handleZoom(-0.2)}
            className="block w-8 h-8 text-foreground hover:text-celestial-400 transition-colors"
          >
            −
          </button>
        </div>
        
        <div className="bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg p-2 text-xs text-muted-foreground">
          Zoom: {Math.round(zoomLevel * 100)}%
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg p-4 max-w-xs">
        <h3 className="text-sm font-semibold text-foreground mb-2">Legenda Espiritual</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-celestial-400 to-divine-400 rounded-full divine-glow"></div>
            <span className="text-muted-foreground">Centro de Intercessão Ativo</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-muted-foreground">Movimento Atual do Espírito</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-muted-foreground">Alerta Espiritual</span>
          </div>
        </div>
      </div>

      {/* Global Prayer Activity Feed */}
      <div className="absolute top-4 left-4 z-20 bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg p-3 max-w-sm">
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
          Atividade Global Agora ({locations.length} centros ativos)
        </h3>
        <div className="text-xs text-muted-foreground space-y-1">
          {locations.slice(0, 4).map((location, index) => (
            <p key={location.id}>
              {index === 0 && '🙏'} {index === 1 && '⚡'} {index === 2 && '🔥'} {index === 3 && '📿'} 
              {' '}{location.intercessorCount} intercessores em {location.name}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;
