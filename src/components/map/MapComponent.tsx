import { useEffect, useRef, useState } from 'react';
import { LocationData } from '@/types/Location';
import { useHierarchicalData } from '@/hooks/useHierarchicalData';

interface MapComponentProps {
  locations: LocationData[];
  onLocationSelect: (location: LocationData) => void;
}

const MapComponent = ({ locations, onLocationSelect }: MapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [currentZoom, setCurrentZoom] = useState(3);
  const [currentCenter, setCurrentCenter] = useState({ lat: 20, lng: 0 });

  // Hook para dados hierárquicos
  const { hierarchicalData, currentLevel } = useHierarchicalData({
    currentZoom,
    currentCenter
  });

  useEffect(() => {
    if (!mapRef.current) return;

    const newMap = new google.maps.Map(mapRef.current, {
      center: currentCenter,
      zoom: currentZoom,
      minZoom: 2,
      maxZoom: 18,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true
    });

    // Listeners para mudanças de zoom e centro
    newMap.addListener('zoom_changed', () => {
      const zoom = newMap.getZoom() || 3;
      setCurrentZoom(zoom);
    });

    newMap.addListener('center_changed', () => {
      const center = newMap.getCenter();
      if (center) {
        setCurrentCenter({ lat: center.lat(), lng: center.lng() });
      }
    });

    setMap(newMap);
  }, []);

  // Função para determinar que localizações mostrar baseado no nível
  const getLocationsForCurrentLevel = () => {
    if (!hierarchicalData) return locations;

    switch (hierarchicalData.level) {
      case 'world':
        // Mostrar continentes
        return locations.filter(loc => loc.type === 'continent');
      case 'continent':
        // Mostrar países do continente atual + continentes vizinhos
        const currentContinent = hierarchicalData.data;
        if (currentContinent && hierarchicalData.children.length > 0) {
          return [currentContinent, ...hierarchicalData.children];
        }
        // Se não tiver dados específicos, mostrar todos os continentes
        return locations.filter(loc => loc.type === 'continent');
      case 'country':
        // Mostrar estados/regiões do país atual
        const currentCountry = hierarchicalData.data;
        if (currentCountry && hierarchicalData.children.length > 0) {
          return [currentCountry, ...hierarchicalData.children];
        }
        // Se não tiver dados específicos, mostrar países
        return locations.filter(loc => loc.type === 'country');
      case 'state':
        // Mostrar cidades do estado atual
        const currentState = hierarchicalData.data;
        if (currentState && hierarchicalData.children.length > 0) {
          return [currentState, ...hierarchicalData.children];
        }
        // Se não tiver dados específicos, mostrar estados
        return locations.filter(loc => loc.type === 'state');
      case 'city':
        // Mostrar bairros da cidade atual
        const currentCity = hierarchicalData.data;
        if (currentCity && hierarchicalData.children.length > 0) {
          return [currentCity, ...hierarchicalData.children];
        }
        // Se não tiver dados específicos, mostrar cidades
        return locations.filter(loc => loc.type === 'city');
      case 'neighborhood':
        // Mostrar bairros
        return locations.filter(loc => loc.type === 'neighborhood');
      default:
        return locations;
    }
  };

  // Função para obter cor baseada em atividade espiritual
  const getLocationColor = (location: LocationData): string => {
    if (location.spiritualAlerts.some(alert => alert.type === 'revival')) return '#10b981'; // Verde (avivamento)
    if (location.spiritualAlerts.some(alert => alert.type === 'breakthrough')) return '#3b82f6'; // Azul (quebrantamento)
    if (location.spiritualAlerts.some(alert => alert.severity === 'danger')) return '#ef4444'; // Vermelho (alerta)
    if (location.propheticWords.length > 0) return '#f59e0b'; // Dourado (palavra profética)
    return '#8b5cf6'; // Roxo (intercessão padrão)
  };

  // Função para obter tamanho baseado na importância
  const getLocationScale = (location: LocationData): number => {
    let scale = 8;
    
    // Escala baseada no tipo
    switch (location.type) {
      case 'continent': scale = 20; break;
      case 'country': scale = 16; break;
      case 'state': scale = 12; break;
      case 'city': scale = 10; break;
      case 'neighborhood': scale = 8; break;
    }
    
    // Ajustes baseados em atividade
    if (location.intercessorCount > 500) scale += 4;
    else if (location.intercessorCount > 200) scale += 2;
    
    if (location.spiritualAlerts.length > 0) scale += 2;
    if (location.propheticWords.some(word => word.isVerified)) scale += 3;
    
    return Math.min(scale, 24);
  };

  // Função para criar InfoWindow hierárquico
  const createHierarchicalInfoWindow = (location: LocationData): string => {
    const levelIcon = {
      continent: '🌍',
      country: '🏳️',
      state: '🏛️',
      city: '🏙️',
      neighborhood: '🏘️'
    };

    const aggregatedData = hierarchicalData?.aggregatedData;
    
    return `
      <div style="max-width: 320px; padding: 12px; font-family: system-ui;">
        <h3 style="margin: 0 0 8px 0; color: #1e293b; font-size: 16px; font-weight: 600;">
          ${levelIcon[location.type]} ${location.name}
        </h3>
        
        <div style="margin-bottom: 8px; font-size: 12px; color: #64748b;">
          ${location.type === 'continent' ? 'DADOS CONTINENTAIS' : 
            location.type === 'country' ? 'DADOS NACIONAIS' :
            location.type === 'state' ? 'DADOS REGIONAIS' :
            location.type === 'city' ? 'DADOS DA CIDADE' : 'DADOS DO BAIRRO'}
        </div>

        <div style="margin-bottom: 8px; padding: 6px; background: #f1f5f9; border-radius: 4px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px;">
            <div><strong>🙏 ${aggregatedData?.totalIntercessors || location.intercessorCount}</strong> Intercessores</div>
            <div><strong>📜 ${aggregatedData?.totalPropheticWords || location.propheticWords.length}</strong> Palavras Proféticas</div>
            <div><strong>🎯 ${aggregatedData?.totalPrayerTargets || location.prayerTargets.length}</strong> Alvos de Oração</div>
            <div><strong>⚠️ ${aggregatedData?.totalAlerts || location.spiritualAlerts.length}</strong> Alertas Espirituais</div>
          </div>
        </div>

        ${location.propheticWords.length > 0 ? `
          <div style="margin-bottom: 8px; padding: 6px; background: #fef3c7; border-left: 3px solid #f59e0b; border-radius: 4px;">
            <strong style="color: #92400e;">📜 Palavra Profética Ativa:</strong>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #92400e; font-style: italic;">
              "${location.propheticWords[0].content.substring(0, 120)}..."
            </p>
            <p style="margin: 4px 0 0 0; font-size: 10px; color: #92400e;">
              — ${location.propheticWords[0].author}
            </p>
          </div>
        ` : ''}

        ${location.spiritualAlerts.length > 0 ? `
          <div style="margin-bottom: 8px; padding: 6px; background: ${
            location.spiritualAlerts[0].severity === 'danger' ? '#fef2f2' : 
            location.spiritualAlerts[0].severity === 'warning' ? '#fefbf2' : '#f0f9ff'
          }; border-left: 3px solid ${
            location.spiritualAlerts[0].severity === 'danger' ? '#ef4444' : 
            location.spiritualAlerts[0].severity === 'warning' ? '#f59e0b' : '#3b82f6'
          }; border-radius: 4px;">
            <strong style="color: #374151;">⚡ ${location.spiritualAlerts[0].title}</strong>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #6b7280;">
              ${location.spiritualAlerts[0].description.substring(0, 80)}...
            </p>
          </div>
        ` : ''}

        ${location.prayerTargets.length > 0 ? `
          <div style="margin-bottom: 8px;">
            <strong style="color: #374151; font-size: 12px;">🎯 Principais Alvos de Intercessão:</strong>
            <ul style="margin: 4px 0 0 16px; padding: 0; font-size: 11px;">
              ${location.prayerTargets.slice(0, 3).map(target => 
                `<li style="color: #64748b; margin-bottom: 2px;">
                  <span style="color: ${target.urgency === 'critical' ? '#ef4444' : target.urgency === 'high' ? '#f59e0b' : '#6b7280'};">●</span>
                  ${target.title}
                </li>`
              ).join('')}
            </ul>
          </div>
        ` : ''}

        <div style="margin-top: 12px; text-align: center;">
          <button style="background: linear-gradient(to right, #8b5cf6, #3b82f6); color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; margin-right: 4px;">
            🙏 Interceder por ${location.name}
          </button>
          <button style="background: #f1f5f9; color: #374151; border: 1px solid #d1d5db; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer;">
            📖 Ver Todos os Dados
          </button>
        </div>

        <div style="margin-top: 8px; text-align: center; font-size: 10px; color: #9ca3af;">
          ${location.type === 'continent' ? 'Faça zoom para ver países' :
            location.type === 'country' ? 'Faça zoom para ver regiões' :
            location.type === 'state' ? 'Faça zoom para ver cidades' :
            location.type === 'city' ? 'Faça zoom para ver bairros' : 'Nível máximo de zoom'}
        </div>
      </div>
    `;
  };

  useEffect(() => {
    if (!map) return;

    console.log('MapComponent: Updating markers');
    console.log('- All locations:', locations.length);
    console.log('- Hierarchical data:', hierarchicalData);
    console.log('- Current zoom:', currentZoom);
    console.log('- Current level:', currentLevel);

    // Limpar marcadores existentes
    markers.forEach(marker => marker.setMap(null));

    const currentLocations = getLocationsForCurrentLevel();
    console.log('- Current level locations:', currentLocations.length);
    
    const newMarkers: google.maps.Marker[] = [];

    currentLocations.forEach((location) => {
      console.log(`Creating marker for: ${location.name} (${location.type})`);
      
      const marker = new google.maps.Marker({
        position: { lat: location.coordinates[1], lng: location.coordinates[0] },
        map: map,
        title: location.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: getLocationColor(location),
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: getLocationScale(location)
        },
        zIndex: location.type === 'continent' ? 100 : 
                location.type === 'country' ? 90 :
                location.type === 'state' ? 80 :
                location.type === 'city' ? 70 : 60
      });

      const infoWindow = new google.maps.InfoWindow({
        content: createHierarchicalInfoWindow(location)
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      // Listener para o botão "Ver Todos os Dados"
      (window as any).viewLocationDetails = (locationId: string) => {
        const selectedLocation = currentLocations.find(loc => loc.id === locationId);
        if (selectedLocation) {
          onLocationSelect(selectedLocation);
          infoWindow.close();
        }
      };

      newMarkers.push(marker);
    });

    console.log('- Created markers:', newMarkers.length);
    setMarkers(newMarkers);
  }, [map, locations, hierarchicalData, currentZoom, onLocationSelect]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Indicador de Nível Hierárquico */}
      <div className="absolute top-4 left-4 z-10 bg-white/80 dark:bg-ios-dark-bg2/80 backdrop-blur-sm text-gray-900 dark:text-ios-dark-text px-4 py-2 rounded-ios-lg border border-ios-gray5/30 dark:border-ios-dark-bg4/30">
        <div className="text-xs opacity-70">Nível Atual:</div>
        <div className="text-sm font-semibold">
          {currentLevel === 'world' && '🌍 Mundial'}
          {currentLevel === 'continent' && '🌎 Continental'}
          {currentLevel === 'country' && '🏳️ Nacional'}
          {currentLevel === 'state' && '🏛️ Regional'}
          {currentLevel === 'city' && '🏙️ Cidade'}
          {currentLevel === 'neighborhood' && '🏘️ Bairro'}
        </div>
        <div className="text-xs opacity-50 mt-1">
          Zoom: {currentZoom}
        </div>
      </div>

      {/* Estatísticas do Nível Atual */}
      {hierarchicalData?.aggregatedData && (
        <div className="absolute top-4 right-4 z-10 bg-white/80 dark:bg-ios-dark-bg2/80 backdrop-blur-sm text-gray-900 dark:text-ios-dark-text p-3 rounded-ios-lg border border-ios-gray5/30 dark:border-ios-dark-bg4/30 max-w-xs">
          <h3 className="text-sm font-semibold mb-2">
            {hierarchicalData.data ? `📊 ${hierarchicalData.data.name}` : '📊 Visão Global'}
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center p-1 bg-white/10 rounded">
              <div className="text-purple-300 font-bold">{hierarchicalData.aggregatedData.totalIntercessors}</div>
              <div className="text-gray-300">Intercessores</div>
            </div>
            <div className="text-center p-1 bg-white/10 rounded">
              <div className="text-yellow-300 font-bold">{hierarchicalData.aggregatedData.totalPropheticWords}</div>
              <div className="text-gray-300">Palavras</div>
            </div>
            <div className="text-center p-1 bg-white/10 rounded">
              <div className="text-blue-300 font-bold">{hierarchicalData.aggregatedData.totalPrayerTargets}</div>
              <div className="text-gray-300">Alvos</div>
            </div>
            <div className="text-center p-1 bg-white/10 rounded">
              <div className="text-red-300 font-bold">{hierarchicalData.aggregatedData.totalAlerts}</div>
              <div className="text-gray-300">Alertas</div>
            </div>
          </div>
          
          {hierarchicalData.aggregatedData.revivalCenters.length > 0 && (
            <div className="mt-2 p-2 bg-green-500/20 rounded border border-green-500/30">
              <div className="text-xs text-green-300 font-semibold">
                🔥 {hierarchicalData.aggregatedData.revivalCenters.length} Centros de Avivamento Ativo
              </div>
            </div>
          )}

          {hierarchicalData.aggregatedData.criticalAlerts.length > 0 && (
            <div className="mt-2 p-2 bg-red-500/20 rounded border border-red-500/30">
              <div className="text-xs text-red-300 font-semibold">
                🚨 {hierarchicalData.aggregatedData.criticalAlerts.length} Alertas Críticos
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MapComponent;
