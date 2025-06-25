// Extend window object para incluir google
declare global {
  interface Window {
    google: typeof google;
  }
}

interface GoogleGeoPlace {
  place_id: string;
  types: string[];
  formatted_address: string;
  geometry: {
    location: { lat: number; lng: number };
    viewport: {
      northeast: { lat: number; lng: number };
      southwest: { lat: number; lng: number };
    };
  };
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

export class GoogleGeoDataService {
  private geocoder: google.maps.Geocoder | null = null;
  private isGoogleLoaded = false;

  constructor() {
    // Não inicializar o geocoder aqui - faremos lazy loading
  }

  /**
   * 🔧 MÉTODO AUXILIAR: Verificar e inicializar Google Maps
   */
  private async ensureGoogleMapsLoaded(): Promise<void> {
    if (this.isGoogleLoaded && this.geocoder) {
      return; // Já está carregado
    }

    // Verificar se o objeto google está disponível
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      this.geocoder = new google.maps.Geocoder();
      this.isGoogleLoaded = true;
      console.log('✅ Google Maps API carregado e geocoder inicializado');
      return;
    }

    // Se não estiver disponível, aguardar um pouco e tentar novamente
    console.log('⏳ Aguardando Google Maps API carregar...');
    
    let attempts = 0;
    const maxAttempts = 60; // 60 segundos máximo (dobrado)
    
    return new Promise((resolve, reject) => {
      const checkGoogleMaps = () => {
        attempts++;
        
        if (typeof window !== 'undefined' && window.google && window.google.maps) {
          this.geocoder = new google.maps.Geocoder();
          this.isGoogleLoaded = true;
          console.log('✅ Google Maps API carregado após tentativas');
          resolve();
        } else if (attempts >= maxAttempts) {
          reject(new Error('❌ Google Maps API não foi carregado após 30 segundos. Verifique se a API Key está configurada.'));
        } else {
          setTimeout(checkGoogleMaps, 1000); // Tentar novamente em 1 segundo
        }
      };
      
      checkGoogleMaps();
    });
  }

  /**
   * 🌍 PASSO 1: Buscar todos os países do mundo
   */
  async getAllCountries(): Promise<GoogleGeoPlace[]> {
    console.log('🌍 [PASSO 1] Buscando países do mundo...');
    
    // Garantir que o Google Maps está carregado
    await this.ensureGoogleMapsLoaded();
    
    // Lista dos códigos ISO dos principais países
    const countryList = [
      'BR', 'US', 'CA', 'MX', 'AR', 'CL', 'PE', 'CO', 'VE', 'EC', 'BO', 'PY', 'UY', 'GY', 'SR',
      'GB', 'FR', 'DE', 'IT', 'ES', 'PT', 'NL', 'BE', 'CH', 'AT', 'IE', 'DK', 'SE', 'NO', 'FI',
      'PL', 'CZ', 'SK', 'HU', 'RO', 'BG', 'GR', 'HR', 'SI', 'EE', 'LV', 'LT',
      'RU', 'CN', 'IN', 'JP', 'KR', 'TH', 'VN', 'MY', 'SG', 'ID', 'PH', 'AU', 'NZ',
      'ZA', 'NG', 'KE', 'ET', 'EG', 'MA', 'GH', 'TZ'
    ];

    const countries: GoogleGeoPlace[] = [];
    
    for (const countryCode of countryList) {
      try {
        console.log(`   🔍 Buscando: ${countryCode}`);
        const result = await this.geocodeByComponents({
          country: countryCode
        });
        
        if (result && result.length > 0) {
          const country = result.find(r => r.types.includes('country'));
          if (country) {
            countries.push(country);
            const countryName = this.extractPlaceName(country);
            console.log(`   ✅ Encontrado: ${countryName} (${countryCode})`);
          }
        }
      } catch (error) {
        console.error(`   ❌ Erro ao buscar país ${countryCode}:`, error);
      }
      
      // Delay para respeitar rate limits do Google
      await this.delay(150);
    }

    console.log(`🌍 [PASSO 1 COMPLETO] Total: ${countries.length} países`);
    return countries;
  }

  /**
   * 🏛️ PASSO 2: Buscar estados/províncias de um país específico
   */
  async getStatesByCountry(countryCode: string): Promise<GoogleGeoPlace[]> {
    console.log(`🏛️ [PASSO 2] Buscando estados de: ${countryCode}`);
    
    // Garantir que o Google Maps está carregado
    await this.ensureGoogleMapsLoaded();
    
    try {
      // Método 1: Buscar estados conhecidos via text search
      const knownStates = await this.searchKnownStates(countryCode);
      
      // Método 2: Complementar com reverse geocoding em pontos distribuídos
      const reverseGeoStates = await this.findStatesByReverseGeocoding(countryCode);
      
      // Combinar e deduplicar
      const allStates = [...knownStates, ...reverseGeoStates];
      const uniqueStates = this.deduplicatePlaces(allStates);
      
      console.log(`🏛️ [PASSO 2 COMPLETO] ${countryCode}: ${uniqueStates.length} estados`);
      return uniqueStates;
      
    } catch (error) {
      console.error(`❌ Erro ao buscar estados de ${countryCode}:`, error);
      return [];
    }
  }

  /**
   * 🏙️ PASSO 3: Buscar cidades de um estado específico
   */
  async getCitiesByState(countryCode: string, stateName: string): Promise<GoogleGeoPlace[]> {
    console.log(`🏙️ [PASSO 3] Buscando cidades: ${stateName}, ${countryCode}`);
    
    // Garantir que o Google Maps está carregado
    await this.ensureGoogleMapsLoaded();
    
    try {
      // Método 1: Component restrictions
      const componentCities = await this.geocodeByComponents({
        country: countryCode,
        administrativeArea: stateName
      });
      
      // Método 2: Text search para cidades conhecidas
      const knownCities = await this.searchKnownCities(countryCode, stateName);
      
      // Combinar e filtrar apenas cidades
      const allResults = [...componentCities, ...knownCities];
      const cities = allResults.filter(place => 
        place.types.some(type => 
          ['locality', 'administrative_area_level_2', 'sublocality'].includes(type)
        )
      );
      
      const uniqueCities = this.deduplicatePlaces(cities);
      console.log(`🏙️ [PASSO 3 COMPLETO] ${stateName}: ${uniqueCities.length} cidades`);
      return uniqueCities;
      
    } catch (error) {
      console.error(`❌ Erro ao buscar cidades de ${stateName}:`, error);
      return [];
    }
  }

  /**
   * 🔧 MÉTODO AUXILIAR: Geocoding com component restrictions
   */
  private async geocodeByComponents(components: {
    country?: string;
    administrativeArea?: string;
    locality?: string;
    postalCode?: string;
  }): Promise<GoogleGeoPlace[]> {
    
    if (!this.geocoder) {
      throw new Error('❌ Google Maps Geocoder não está inicializado');
    }
    
    return new Promise((resolve, reject) => {
      this.geocoder!.geocode({
        componentRestrictions: components
      }, (results, status) => {
        if (status === 'OK' && results) {
          const converted = results.map(this.convertGeocoderResult);
          resolve(converted);
        } else if (status === 'ZERO_RESULTS') {
          resolve([]);
        } else {
          reject(new Error(`Geocoding falhou: ${status}`));
        }
      });
    });
  }

  /**
   * 🔧 MÉTODO AUXILIAR: Buscar estados conhecidos via text search
   */
  private async searchKnownStates(countryCode: string): Promise<GoogleGeoPlace[]> {
    const stateQueries = this.getKnownStatesList(countryCode);
    const states: GoogleGeoPlace[] = [];
    
    for (const stateName of stateQueries) {
      try {
        console.log(`     🔍 Buscando estado: ${stateName}`);
        const result = await this.geocodeByAddress(`${stateName}, ${countryCode}`);
        
        if (result && result.length > 0) {
          const state = result.find(r => 
            r.types.includes('administrative_area_level_1') || 
            r.types.includes('administrative_area_level_2')
          );
          if (state) {
            states.push(state);
            console.log(`     ✅ Estado encontrado: ${stateName}`);
          }
        }
      } catch (error) {
        console.warn(`     ⚠️ Erro ao buscar estado ${stateName}:`, error);
      }
      
      await this.delay(100);
    }
    
    return states;
  }

  /**
   * 🔧 MÉTODO AUXILIAR: Buscar cidades conhecidas
   */
  private async searchKnownCities(countryCode: string, stateName: string): Promise<GoogleGeoPlace[]> {
    const cityQueries = this.getKnownCitiesList(countryCode, stateName);
    const cities: GoogleGeoPlace[] = [];
    
    for (const cityName of cityQueries) {
      try {
        console.log(`       🔍 Buscando cidade: ${cityName}`);
        const result = await this.geocodeByAddress(`${cityName}, ${stateName}, ${countryCode}`);
        
        if (result && result.length > 0) {
          const city = result.find(r => 
            r.types.includes('locality') || r.types.includes('administrative_area_level_2')
          );
          if (city) {
            cities.push(city);
            console.log(`       ✅ Cidade encontrada: ${cityName}`);
          }
        }
      } catch (error) {
        console.warn(`       ⚠️ Erro ao buscar cidade ${cityName}:`, error);
      }
      
      await this.delay(100);
    }
    
    return cities;
  }

  /**
   * 🔧 MÉTODO AUXILIAR: Reverse geocoding para encontrar divisões administrativas
   */
  private async findStatesByReverseGeocoding(countryCode: string): Promise<GoogleGeoPlace[]> {
    const samplePoints = this.getSamplePointsForCountry(countryCode);
    const states: GoogleGeoPlace[] = [];
    
    for (const point of samplePoints) {
      try {
        const result = await this.reverseGeocode(point);
        const stateComponents = result.filter(r => 
          r.types.includes('administrative_area_level_1')
        );
        states.push(...stateComponents);
      } catch (error) {
        console.warn(`⚠️ Erro no reverse geocoding:`, error);
      }
      
      await this.delay(100);
    }
    
    return this.deduplicatePlaces(states);
  }

  /**
   * 🔧 MÉTODO AUXILIAR: Geocoding por endereço
   */
  private async geocodeByAddress(address: string): Promise<GoogleGeoPlace[]> {
    if (!this.geocoder) {
      throw new Error('❌ Google Maps Geocoder não está inicializado');
    }
    
    return new Promise((resolve, reject) => {
      this.geocoder!.geocode({ address }, (results, status) => {
        if (status === 'OK' && results) {
          const converted = results.map(this.convertGeocoderResult);
          resolve(converted);
        } else if (status === 'ZERO_RESULTS') {
          resolve([]);
        } else {
          reject(new Error(`Geocoding falhou: ${status}`));
        }
      });
    });
  }

  /**
   * 🔧 MÉTODO AUXILIAR: Reverse geocoding
   */
  private async reverseGeocode(location: { lat: number; lng: number }): Promise<GoogleGeoPlace[]> {
    if (!this.geocoder) {
      throw new Error('❌ Google Maps Geocoder não está inicializado');
    }
    
    return new Promise((resolve, reject) => {
      this.geocoder!.geocode({ location }, (results, status) => {
        if (status === 'OK' && results) {
          const converted = results.map(this.convertGeocoderResult);
          resolve(converted);
        } else if (status === 'ZERO_RESULTS') {
          resolve([]);
        } else {
          reject(new Error(`Reverse geocoding falhou: ${status}`));
        }
      });
    });
  }

  /**
   * 🔧 MÉTODO AUXILIAR: Converter GeocoderResult para GoogleGeoPlace
   */
  private convertGeocoderResult = (result: google.maps.GeocoderResult): GoogleGeoPlace => {
    return {
      place_id: result.place_id,
      types: result.types,
      formatted_address: result.formatted_address,
      geometry: {
        location: {
          lat: result.geometry.location.lat(),
          lng: result.geometry.location.lng()
        },
        viewport: {
          northeast: {
            lat: result.geometry.viewport.getNorthEast().lat(),
            lng: result.geometry.viewport.getNorthEast().lng()
          },
          southwest: {
            lat: result.geometry.viewport.getSouthWest().lat(),
            lng: result.geometry.viewport.getSouthWest().lng()
          }
        }
      },
      address_components: result.address_components.map(component => ({
        long_name: component.long_name,
        short_name: component.short_name,
        types: component.types
      }))
    };
  }

  /**
   * 📋 LISTAS DE ESTADOS CONHECIDOS
   */
  private getKnownStatesList(countryCode: string): string[] {
    const statesByCountry: Record<string, string[]> = {
      'BR': [
        'São Paulo', 'Rio de Janeiro', 'Minas Gerais', 'Bahia', 'Paraná', 'Rio Grande do Sul',
        'Pernambuco', 'Ceará', 'Pará', 'Santa Catarina', 'Goiás', 'Maranhão', 'Espírito Santo',
        'Paraíba', 'Amazonas', 'Mato Grosso', 'Rio Grande do Norte', 'Alagoas', 'Piauí', 
        'Distrito Federal', 'Mato Grosso do Sul', 'Sergipe', 'Rondônia', 'Acre', 'Amapá', 
        'Roraima', 'Tocantins'
      ],
      'US': [
        'California', 'Texas', 'Florida', 'New York', 'Pennsylvania', 'Illinois', 'Ohio', 
        'Georgia', 'North Carolina', 'Michigan', 'New Jersey', 'Virginia', 'Washington'
      ],
      'AR': [
        'Buenos Aires', 'Córdoba', 'Santa Fe', 'Mendoza', 'Tucumán', 'Entre Ríos', 'Salta'
      ]
    };
    
    return statesByCountry[countryCode] || [];
  }

  /**
   * 📋 LISTAS DE CIDADES CONHECIDAS
   */
  private getKnownCitiesList(countryCode: string, stateName: string): string[] {
    const citiesByState: Record<string, Record<string, string[]>> = {
      'BR': {
        'São Paulo': ['São Paulo', 'Campinas', 'Santos', 'Ribeirão Preto', 'Sorocaba'],
        'Rio de Janeiro': ['Rio de Janeiro', 'Niterói', 'Nova Iguaçu', 'Duque de Caxias'],
        'Minas Gerais': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora']
      }
    };
    
    return citiesByState[countryCode]?.[stateName] || [];
  }

  /**
   * 🔧 MÉTODO AUXILIAR: Pontos de amostra para reverse geocoding
   */
  private getSamplePointsForCountry(countryCode: string): Array<{ lat: number; lng: number }> {
    const pointsByCountry: Record<string, Array<{ lat: number; lng: number }>> = {
      'BR': [
        { lat: -15.7942, lng: -47.8822 }, // Brasília
        { lat: -23.5505, lng: -46.6333 }, // São Paulo
        { lat: -22.9068, lng: -43.1729 }, // Rio de Janeiro
        { lat: -12.9714, lng: -38.5014 }, // Salvador
        { lat: -25.4244, lng: -49.2654 }  // Curitiba
      ]
    };
    
    return pointsByCountry[countryCode] || [];
  }

  /**
   * 🔧 MÉTODO AUXILIAR: Deduplicar places por place_id
   */
  private deduplicatePlaces(places: GoogleGeoPlace[]): GoogleGeoPlace[] {
    const unique = new Map<string, GoogleGeoPlace>();
    
    places.forEach(place => {
      if (!unique.has(place.place_id)) {
        unique.set(place.place_id, place);
      }
    });
    
    return Array.from(unique.values());
  }

  /**
   * 🔧 MÉTODO AUXILIAR: Extrair nome limpo do place
   */
  private extractPlaceName(place: GoogleGeoPlace): string {
    // Priorizar componentes administrativos
    for (const component of place.address_components) {
      if (component.types.includes('country') || 
          component.types.includes('administrative_area_level_1') ||
          component.types.includes('administrative_area_level_2') ||
          component.types.includes('locality')) {
        return component.long_name;
      }
    }
    
    return place.formatted_address.split(',')[0].trim();
  }

  /**
   * 🔧 MÉTODO AUXILIAR: Delay para respeitar rate limits
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 📊 CONVERTER para formato do banco de dados
   */
  convertToLocationData(
    place: GoogleGeoPlace, 
    type: 'country' | 'state' | 'city', 
    parentId?: string
  ): any {
    return {
      name: this.extractPlaceName(place),
      region_type: type,
      parent_id: parentId,
      
      // Código do país (extrair dos address_components)
      country_code: this.extractCountryCode(place),
      
      // Coordenadas como JSONB
      coordinates: {
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng
      },
      
      // Metadados do Google salvos em spiritual_data (JSONB)
      spiritual_data: {
        google_data: {
          place_id: place.place_id,
          formatted_address: place.formatted_address,
          viewport: place.geometry.viewport,
          address_components: place.address_components,
          source: 'google_maps_api',
          imported_at: new Date().toISOString()
        }
      },
      
      // Auditoria (valores permitidos: 'manual', 'ai_generated', 'imported')
      data_source: 'imported',
      status: 'pending'
    };
  }

  /**
   * 🔧 MÉTODO AUXILIAR: Extrair código do país
   */
  private extractCountryCode(place: GoogleGeoPlace): string | null {
    const countryComponent = place.address_components.find(component =>
      component.types.includes('country')
    );
    return countryComponent?.short_name || null;
  }
}

// Instância singleton
export const googleGeoDataService = new GoogleGeoDataService(); 