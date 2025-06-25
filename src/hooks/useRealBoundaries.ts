import { useState, useEffect } from 'react';

interface CountryBoundary {
  name: string;
  type: string;
  coordinates: [number, number][][];
  properties: {
    name: string;
    name_en?: string;
    iso_a2?: string;
    iso_a3?: string;
    continent?: string;
  };
}

interface UseRealBoundariesProps {
  zoom: number;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export const useRealBoundaries = ({ zoom, bounds }: UseRealBoundariesProps) => {
  const [boundaries, setBoundaries] = useState<CountryBoundary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determinar que tipo de fronteiras carregar baseado no zoom
  const getBoundaryType = (zoomLevel: number) => {
    if (zoomLevel <= 3) return 'continents';
    if (zoomLevel <= 6) return 'countries';
    if (zoomLevel <= 9) return 'states';
    return 'cities';
  };

  // Carregar fronteiras de países (dados simplificados para teste)
  const loadCountryBoundaries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🌍 Carregando fronteiras de países...');
      
            // Fronteiras mais precisas dos países sul-americanos
      // Baseado em dados do Natural Earth (simplificado)
      const sampleCountries: CountryBoundary[] = [
        {
          name: 'Brasil',
          type: 'country',
          coordinates: [[
            // Fronteira simplificada do Brasil - formato aproximado
            [-53.1, 5.3], [-60.0, 5.3], [-73.9, -4.3], [-73.9, -18.0], 
            [-57.6, -30.2], [-48.6, -33.8], [-34.8, -33.8], [-34.8, -7.3],
            [-35.0, 2.8], [-44.0, 5.3], [-53.1, 5.3]
          ]],
          properties: {
            name: 'Brasil',
            name_en: 'Brazil',
            iso_a2: 'BR',
            iso_a3: 'BRA',
            continent: 'South America'
          }
        },
        {
          name: 'Argentina',
          type: 'country', 
          coordinates: [[
            // Fronteira simplificada da Argentina
            [-73.4, -22.0], [-62.7, -22.0], [-57.6, -30.2], [-58.6, -51.6],
            [-66.5, -55.0], [-73.6, -53.6], [-73.4, -22.0]
          ]],
          properties: {
            name: 'Argentina',
            name_en: 'Argentina',
            iso_a2: 'AR',
            iso_a3: 'ARG',
            continent: 'South America'
          }
        },
        {
          name: 'Chile',
          type: 'country',
          coordinates: [[
            // Fronteira simplificada do Chile - formato longo e estreito
            [-70.7, -17.5], [-66.4, -21.8], [-68.6, -26.5], [-70.0, -40.0],
            [-73.6, -53.6], [-75.6, -52.0], [-71.0, -22.4], [-70.7, -17.5]
          ]],
          properties: {
            name: 'Chile',
            name_en: 'Chile',
            iso_a2: 'CL',
            iso_a3: 'CHL',
            continent: 'South America'
          }
        },
        {
          name: 'Peru',
          type: 'country',
          coordinates: [[
            // Fronteira simplificada do Peru
            [-81.3, -18.3], [-68.7, -18.3], [-68.7, -13.2], [-70.0, -9.4],
            [-73.2, -4.2], [-81.3, -4.2], [-81.3, -18.3]
          ]],
          properties: {
            name: 'Peru',
            name_en: 'Peru',
            iso_a2: 'PE',
            iso_a3: 'PER',
            continent: 'South America'
          }
        },
        {
          name: 'Colômbia',
          type: 'country',
          coordinates: [[
            // Fronteira simplificada da Colômbia
            [-78.2, 12.4], [-66.9, 12.4], [-66.9, 1.4], [-69.9, -4.2],
            [-73.2, -4.2], [-79.0, 1.4], [-78.2, 12.4]
          ]],
          properties: {
            name: 'Colômbia',
            name_en: 'Colombia',
            iso_a2: 'CO',
            iso_a3: 'COL',
            continent: 'South America'
          }
        }
      ];

      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setBoundaries(sampleCountries);
      console.log('✅ Fronteiras carregadas:', sampleCountries.length, 'países');
      
    } catch (err) {
      console.error('❌ Erro ao carregar fronteiras:', err);
      setError('Erro ao carregar fronteiras geográficas');
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar fronteiras de continentes
  const loadContinentBoundaries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🌎 Carregando fronteiras de continentes...');
      
              const continents: CountryBoundary[] = [
          {
            name: 'América do Sul',
            type: 'continent',
            coordinates: [[
              [-81.326, 12.4373], [-34.7315, 12.4373], [-34.7315, -56.1456], [-81.326, -56.1456], [-81.326, 12.4373]
            ]],
            properties: {
              name: 'América do Sul',
              name_en: 'South America',
              continent: 'South America'
            }
          },
          {
            name: 'América do Norte',
            type: 'continent',
            coordinates: [[
              [-168.1193, 71.5388], [-52.6480, 71.5388], [-52.6480, 12.8229], [-168.1193, 12.8229], [-168.1193, 71.5388]
            ]],
            properties: {
              name: 'América do Norte',
              name_en: 'North America',
              continent: 'North America'
            }
          }
        ];

      await new Promise(resolve => setTimeout(resolve, 300));
      setBoundaries(continents);
      console.log('✅ Continentes carregados:', continents.length);
      
    } catch (err) {
      console.error('❌ Erro ao carregar continentes:', err);
      setError('Erro ao carregar fronteiras continentais');
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar fronteiras baseado no tipo
  useEffect(() => {
    const boundaryType = getBoundaryType(zoom);
    
    console.log('🔍 Carregando fronteiras para zoom:', zoom, 'tipo:', boundaryType);
    
    switch (boundaryType) {
      case 'continents':
        loadContinentBoundaries();
        break;
      case 'countries':
        loadCountryBoundaries();
        break;
      case 'states':
        // Por enquanto, usar países
        loadCountryBoundaries();
        break;
      default:
        loadCountryBoundaries();
        break;
    }
  }, [zoom]);

  return {
    boundaries,
    isLoading,
    error,
    boundaryType: getBoundaryType(zoom)
  };
}; 