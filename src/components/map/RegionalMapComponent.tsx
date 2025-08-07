import { useEffect, useRef, useState } from 'react';
import { LocationData } from '@/types/Location';
import { SpiritualPopup } from './SpiritualPopup';
import { RegionalSidebar } from './RegionalSidebar';
import { PrayerTimer } from '../PrayerTimer';
import { PropheticWordModal } from '../PropheticWordModal';
import { supabase } from '@/integrations/supabase/client';
import { aiService } from '@/services/aiService';
import advancedAgentService from '@/services/advancedAgentService';

interface RegionalMapComponentProps {
  onRegionSelect: (regionName: string, regionType: string) => void;
}

const RegionalMapComponent = ({ onRegionSelect }: RegionalMapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [currentZoom, setCurrentZoom] = useState(3);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [boundaries, setBoundaries] = useState<google.maps.Polygon[]>([]);
  
  // Estados para o popup espiritual e sidebar
  const [showPopup, setShowPopup] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedRegionType, setSelectedRegionType] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);
  const [spiritualData, setSpiritualData] = useState<any>(null);
  const [loadingSpiritualData, setLoadingSpiritualData] = useState(false);

  // Estados para o cronômetro de oração
  const [showPrayerTimer, setShowPrayerTimer] = useState(false);
  const [currentPrayerRegion, setCurrentPrayerRegion] = useState<string>('');

  // Estados para palavra profética
  const [showPropheticModal, setShowPropheticModal] = useState(false);
  const [prayerDuration, setPrayerDuration] = useState(0);
  const [lastClickCoordinates, setLastClickCoordinates] = useState<{ lat: number, lng: number } | null>(null);

  // 🎯 Função para detectar hierarquia automaticamente
  const detectRegionHierarchy = async (regionName: string, regionType: string) => {
    console.log(`🔍 Detectando hierarquia para ${regionName} (${regionType})`);
    
    try {
      // 1. 📍 Obter coordenadas atuais do último clique
      const coordinates = lastClickCoordinates || { lat: 0, lng: 0 };
      console.log(`📍 Coordenadas detectadas:`, coordinates);
      
      // 2. 🌍 Usar Google Maps Geocoding para obter hierarquia completa
      if (window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder();
        
        return new Promise((resolve, reject) => {
          geocoder.geocode({ 
            location: { lat: coordinates.lat, lng: coordinates.lng }
          }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              const result = results[0];
              console.log('🗺️ Resultado do Geocoding:', result);
              
              // 3. 🧩 Extrair componentes hierárquicos
              const components = result.address_components;
              let country = '';
              let state = '';
              let continent = '';
              
              components.forEach(component => {
                const types = component.types;
                if (types.includes('country')) {
                  country = component.long_name;
                } else if (types.includes('administrative_area_level_1')) {
                  state = component.long_name;
                }
              });
              
              // 4. 🗂️ Determinar continente baseado no país
              continent = getContinent(country);
              
              // 5. 🔗 Buscar parent_id no banco
              const hierarchyInfo = {
                coordinates,
                continent,
                country,
                state,
                parentId: null,
                hierarchyPath: ''
              };
              
              // Buscar parent baseado no tipo da região
              if (regionType === 'city') {
                // Cidade: parent é o estado
                hierarchyInfo.hierarchyPath = `${continent} > ${country} > ${state} > ${regionName}`;
                // Buscar estado no banco
                findParentInDatabase(state, 'state').then(parentId => {
                  hierarchyInfo.parentId = parentId;
                  resolve(hierarchyInfo);
                }).catch(reject);
              } else if (regionType === 'state') {
                // Estado: parent é o país
                hierarchyInfo.hierarchyPath = `${continent} > ${country} > ${regionName}`;
                // Buscar país no banco
                findParentInDatabase(country, 'country').then(parentId => {
                  hierarchyInfo.parentId = parentId;
                  resolve(hierarchyInfo);
                }).catch(reject);
              } else if (regionType === 'country') {
                // País: sem parent
                hierarchyInfo.hierarchyPath = `${continent} > ${regionName}`;
                hierarchyInfo.parentId = null;
                resolve(hierarchyInfo);
              } else {
                // Outros tipos: sem parent por enquanto
                hierarchyInfo.hierarchyPath = regionName;
                hierarchyInfo.parentId = null;
                resolve(hierarchyInfo);
              }
              
            } else {
              console.warn('⚠️ Geocoding falhou, usando dados básicos');
              resolve({
                coordinates,
                continent: 'Desconhecido',
                country: '',
                state: '',
                parentId: null,
                hierarchyPath: regionName
              });
            }
          });
        });
      } else {
        // Fallback sem Google Maps
        console.warn('⚠️ Google Maps não disponível, usando dados básicos');
        return {
          coordinates,
          continent: 'Desconhecido',
          country: '',
          state: '',
          parentId: null,
          hierarchyPath: regionName
        };
      }
    } catch (error) {
      console.error('❌ Erro na detecção de hierarquia:', error);
      return {
        coordinates: { lat: 0, lng: 0 },
        continent: 'Desconhecido',
        country: '',
        state: '',
        parentId: null,
        hierarchyPath: regionName
      };
    }
  };

  // 🌍 Função para determinar continente baseado no país
  const getContinent = (country: string) => {
    const continents = {
      'Brazil': 'América do Sul',
      'Brasil': 'América do Sul',
      'Argentina': 'América do Sul',
      'Chile': 'América do Sul',
      'Peru': 'América do Sul',
      'Bolivia': 'América do Sul',
      'Paraguay': 'América do Sul',
      'United States': 'América do Norte',
      'Canada': 'América do Norte',
      'Mexico': 'América do Norte',
      'Germany': 'Europa',
      'France': 'Europa',
      'Italy': 'Europa',
      'Spain': 'Europa',
      'Portugal': 'Europa',
      'United Kingdom': 'Europa',
      'Russia': 'Europa',
      'China': 'Ásia',
      'Japan': 'Ásia',
      'India': 'Ásia',
      'South Korea': 'Ásia',
      'Indonesia': 'Ásia',
      'Australia': 'Oceania',
      'New Zealand': 'Oceania',
      'South Africa': 'África',
      'Nigeria': 'África',
      'Egypt': 'África',
      'Kenya': 'África'
    };
    
    return continents[country] || 'Desconhecido';
  };

  // 🔍 Função para buscar parent_id no banco de dados
  const findParentInDatabase = async (parentName: string, parentType: string) => {
    try {
      console.log(`🔍 Buscando parent no banco: ${parentName} (${parentType})`);
      
      const { data, error } = await supabase
        .from('spiritual_regions')
        .select('id')
        .eq('name', parentName)
        .eq('region_type', parentType)
        .limit(1)
        .single();
      
      if (error) {
        console.warn(`⚠️ Parent ${parentName} não encontrado no banco:`, error);
        return null;
      }
      
      console.log(`✅ Parent encontrado: ${parentName} = ID ${data.id}`);
      return data.id;
    } catch (error) {
      console.warn(`⚠️ Erro ao buscar parent ${parentName}:`, error);
      return null;
    }
  };

  const getSpiritualData = async (regionName: string, regionType: string) => {
    // Debug - verificar valores
    console.log(`🔍 getSpiritualData chamado com: regionName="${regionName}", regionType="${regionType}"`);
    
    try {
      // Debug: Primeiro vamos ver todas as regiões similares com múltiplas variações
      console.log(`🔍 Buscando regiões com nome similar a "${regionName}"...`);
      
      // Dicionário de tradução PT -> EN para países
      const countryTranslations: { [key: string]: string[] } = {
        'Sudão': ['Sudan'],
        'Rússia': ['Russia', 'Russian Federation'],
        'Sudão do Sul': ['South Sudan'],
        'Estados Unidos': ['United States', 'United States of America', 'USA'],
        'Reino Unido': ['United Kingdom', 'UK'],
        'Coreia do Sul': ['South Korea', 'Republic of Korea'],
        'Coreia do Norte': ['North Korea', 'Democratic People\'s Republic of Korea'],
        'República Democrática do Congo': ['Democratic Republic of the Congo', 'Congo (Kinshasa)', 'DRC'],
        'República do Congo': ['Republic of the Congo', 'Congo (Brazzaville)'],
        'Costa do Marfim': ['Ivory Coast', 'Côte d\'Ivoire'],
        'Alemanha': ['Germany'],
        'França': ['France'],
        'Espanha': ['Spain'],
        'Itália': ['Italy'],
        'Portugal': ['Portugal'],
        'Brasil': ['Brazil'],
        'China': ['China'],
        'Japão': ['Japan'],
        'Índia': ['India'],
        'África do Sul': ['South Africa'],
        'Arábia Saudita': ['Saudi Arabia'],
        'Emirados Árabes Unidos': ['United Arab Emirates', 'UAE'],
        'Suíça': ['Switzerland'],
        'Áustria': ['Austria'],
        'Bélgica': ['Belgium'],
        'Holanda': ['Netherlands', 'Holland'],
        'Polônia': ['Poland'],
        'Suécia': ['Sweden'],
        'Noruega': ['Norway'],
        'Dinamarca': ['Denmark'],
        'Finlândia': ['Finland'],
        'Grécia': ['Greece'],
        'Turquia': ['Turkey'],
        'Egito': ['Egypt'],
        'México': ['Mexico'],
        'Argentina': ['Argentina'],
        'Chile': ['Chile'],
        'Peru': ['Peru'],
        'Colômbia': ['Colombia'],
        'Venezuela': ['Venezuela'],
        'Canadá': ['Canada'],
        'Austrália': ['Australia'],
        'Nova Zelândia': ['New Zealand'],
        'Tailândia': ['Thailand'],
        'Vietnã': ['Vietnam'],
        'Filipinas': ['Philippines'],
        'Indonésia': ['Indonesia'],
        'Malásia': ['Malaysia'],
        'Singapura': ['Singapore'],
        'Israel': ['Israel'],
        'Irã': ['Iran'],
        'Iraque': ['Iraq'],
        'Afeganistão': ['Afghanistan'],
        'Paquistão': ['Pakistan'],
        'Bangladesh': ['Bangladesh'],
        'Sri Lanka': ['Sri Lanka'],
        'Myanmar': ['Myanmar', 'Burma'],
        'Camboja': ['Cambodia'],
        'Laos': ['Laos'],
        'Nepal': ['Nepal'],
        'Butão': ['Bhutan'],
        'Mongólia': ['Mongolia'],
        'Cazaquistão': ['Kazakhstan'],
        'Uzbequistão': ['Uzbekistan'],
        'Quirguistão': ['Kyrgyzstan'],
        'Tajiquistão': ['Tajikistan'],
        'Turcomenistão': ['Turkmenistan'],
        'Geórgia': ['Georgia'],
        'Armênia': ['Armenia'],
        'Azerbaijão': ['Azerbaijan'],
        'Moldávia': ['Moldova'],
        'Ucrânia': ['Ukraine'],
        'Bielorrússia': ['Belarus'],
        'Estônia': ['Estonia'],
        'Letônia': ['Latvia'],
        'Lituânia': ['Lithuania'],
        'República Tcheca': ['Czech Republic', 'Czechia'],
        'Eslováquia': ['Slovakia'],
        'Hungria': ['Hungary'],
        'Romênia': ['Romania'],
        'Bulgária': ['Bulgaria'],
        'Sérvia': ['Serbia'],
        'Croácia': ['Croatia'],
        'Eslovênia': ['Slovenia'],
        'Bósnia e Herzegovina': ['Bosnia and Herzegovina'],
        'Montenegro': ['Montenegro'],
        'Macedônia do Norte': ['North Macedonia'],
        'Albânia': ['Albania'],
        'Kosovo': ['Kosovo']
      };

      // Criar variações de busca incluindo traduções
      const searchVariations = [
        regionName,
        regionName.toLowerCase(),
        regionName.replace(/í/g, 'i').replace(/ã/g, 'a').replace(/ç/g, 'c'), // Remove acentos
      ];

      // Adicionar traduções específicas se existirem
      if (countryTranslations[regionName]) {
        searchVariations.push(...countryTranslations[regionName]);
        console.log(`🌍 Traduções encontradas para "${regionName}":`, countryTranslations[regionName]);
      }

      // Adicionar mais variações genéricas
      searchVariations.push(
        regionName.replace(/Sudão do Sul/g, 'South Sudan'),
        regionName.replace(/Estados Unidos/g, 'United States'),
        regionName.replace(/Reino Unido/g, 'United Kingdom')
      );
      
      console.log(`🔍 Testando variações:`, searchVariations);
      
      let allRegions = [];
      for (const variation of searchVariations) {
        const { data: regions, error: debugError } = await supabase
        .from('spiritual_regions')
          .select('id, name, region_type, spiritual_data')
          .ilike('name', `%${variation}%`);
        
        if (regions && regions.length > 0) {
          allRegions = regions;
          console.log(`✅ Encontrado com variação "${variation}":`, regions.map(r => r.name));
          break;
        } else {
          console.log(`❌ Nada encontrado com "${variation}"`);
        }
      }
      
      console.log(`📊 Regiões encontradas com nome similar:`, allRegions);
      
      // Mostrar detalhes das regiões similares
      if (allRegions && allRegions.length > 0) {
        console.log(`🔍 Detalhes das regiões similares:`);
        allRegions.forEach((region, index) => {
          console.log(`  ${index + 1}. Nome: "${region.name}" | Tipo: "${region.region_type}" | Tem dados: ${!!region.spiritual_data}`);
          if (region.spiritual_data) {
            const hasNew = region.spiritual_data.sistema_geopolitico_completo || 
                          region.spiritual_data.alvos_intercessao_completo || 
                          region.spiritual_data.outras_informacoes_importantes;
            console.log(`     🎯 Estrutura nova: ${hasNew ? 'SIM' : 'NÃO'}`);
          }
        });
      }

      // 🚀 SISTEMA DE FALLBACK INTELIGENTE
      // Se não encontrou nada, tentar estratégias de fallback
      if (!allRegions || allRegions.length === 0) {
        console.log(`🔄 Iniciando sistema de fallback inteligente...`);
        
        // Estratégia 1: Se for estado/província, buscar pelo país pai
        if (regionType.toLowerCase() === 'state') {
          console.log(`🏛️ Estado não encontrado, tentando buscar dados do país pai...`);
          
          // Tentar identificar o país pela localização geográfica
          const countryFallbacks = [
            // Sudão e estados
            { states: ['South Kordofan', 'North Kurdufan', 'Blue Nile'], country: 'Sudan' },
            { states: ['South Kordofan', 'North Kordofan', 'Blue Nile'], country: 'Sudan' },
            // Egito
            { states: ['The New Valley Governorate', 'New Valley'], country: 'Egypt' },
            // Arábia Saudita  
            { states: ['Riyadh Province', 'Eastern Province'], country: 'Saudi Arabia' },
            // Etiópia
            { states: ['Oromia', 'Amhara', 'Tigray'], country: 'Ethiopia' },
            // Índia
            { states: ['Madhya Pradesh', 'Karnataka', 'Uttar Pradesh'], country: 'India' }
          ];
          
          const parentCountry = countryFallbacks.find(f => 
            f.states.some(state => state.toLowerCase().includes(regionName.toLowerCase()) || 
                                 regionName.toLowerCase().includes(state.toLowerCase()))
          );
          
          if (parentCountry) {
            console.log(`🌍 Tentando buscar dados do país pai: ${parentCountry.country}`);
            const { data: countryData } = await supabase
              .from('spiritual_regions')
              .select('spiritual_data, name, region_type')
              .ilike('name', `%${parentCountry.country}%`)
              .eq('region_type', 'country')
              .limit(1)
              .single();
            
            if (countryData && countryData.spiritual_data) {
              console.log(`✅ Usando dados do país pai: ${countryData.name}`);
              allRegions = [countryData];
            }
          }
        }
        
        // Estratégia 2: Busca fuzzy mais ampla
        if ((!allRegions || allRegions.length === 0) && regionName.length > 3) {
          console.log(`🔍 Tentando busca fuzzy mais ampla...`);
          const fuzzyTerms = [
            regionName.substring(0, 4), // Primeiros 4 chars
            regionName.substring(0, 5), // Primeiros 5 chars
            regionName.split(' ')[0],   // Primeira palavra
            regionName.split(' ').pop() // Última palavra
          ].filter(term => term && term.length > 2);
          
          for (const term of fuzzyTerms) {
            const { data: fuzzyResults } = await supabase
              .from('spiritual_regions')
              .select('spiritual_data, name, region_type')
              .ilike('name', `%${term}%`)
              .limit(3);
            
            if (fuzzyResults && fuzzyResults.length > 0) {
              console.log(`🎯 Busca fuzzy encontrou com "${term}":`, fuzzyResults.map(r => r.name));
              allRegions = fuzzyResults;
              break;
            }
          }
        }
      }
      
      // Buscar dados reais do Supabase (query original)
      let { data: regionData, error } = await supabase
        .from('spiritual_regions')
        .select('spiritual_data, name, region_type')
        .eq('name', regionName)
        .eq('region_type', regionType.toLowerCase())
        .maybeSingle();
      
      console.log(`🎯 Query exata resultado:`, regionData);
      console.log(`🎯 Query exata - spiritual_data:`, regionData?.spiritual_data);
      
      // Se não encontrou com query exata OU encontrou mas sem dados, tentar variações
      if ((!regionData || !regionData.spiritual_data) && allRegions && allRegions.length > 0) {
        console.log(`🔄 Query exata falhou, tentando com regiões similares...`);
        
        // Priorizar região com estrutura nova
        const regionWithNewData = allRegions.find(r => r.spiritual_data && 
          (r.spiritual_data.sistema_geopolitico_completo || 
           r.spiritual_data.alvos_intercessao_completo ||
           r.spiritual_data.outras_informacoes_importantes));
        
        if (regionWithNewData) {
          console.log(`✅ Usando região com estrutura nova: "${regionWithNewData.name}" (${regionWithNewData.region_type})`);
          return await processRegionData(regionWithNewData.spiritual_data, regionName, regionType);
        }
        
        // Fallback: primeira região com qualquer dado espiritual
        const anyRegionWithData = allRegions.find(r => r.spiritual_data && Object.keys(r.spiritual_data).length > 0);
        if (anyRegionWithData) {
          console.log(`✅ Usando fallback com dados: "${anyRegionWithData.name}" (${anyRegionWithData.region_type})`);
          
          // 🎯 MARCAR COMO REGIÃO NÃO MAPEADA pois está usando fallback
          const fallbackData = await processRegionData(anyRegionWithData.spiritual_data, regionName, regionType);
          fallbackData.recentActivity = [
            {
              id: 'region-not-mapped',
              text: `Esta região ainda não foi mapeada espiritualmente (usando dados de ${anyRegionWithData.name})`,
              timestamp: new Date().toISOString(),
              type: 'unmapped' as const
            }
          ];
          return fallbackData;
        }
        
        // Se não tem dados espirituais mas tem registro, usar o primeiro
        const firstRegion = allRegions[0];
        if (firstRegion) {
          console.log(`📋 Usando primeiro registro encontrado: "${firstRegion.name}" (sem dados espirituais)`);
          // Forçar para usar a estrutura "região sem dados"
          regionData = { spiritual_data: null, name: firstRegion.name, region_type: firstRegion.region_type };
        }
      }

      if (error) {
        console.error('❌ Erro ao buscar dados espirituais:', error);
      }

      if (regionData?.spiritual_data) {
        console.log(`✅ Dados espirituais encontrados para ${regionName}:`, regionData.spiritual_data);
        return await processRegionData(regionData.spiritual_data, regionName, regionType);
      } else if (regionData) {
        console.log(`📋 Região ${regionName} encontrada mas sem dados espirituais, criando estrutura básica`);
        // Região existe mas não tem dados espirituais - criar estrutura informativa
        return {
          region: regionName,
          type: regionType as 'continent' | 'country' | 'state' | 'city' | 'neighborhood',
          
          stats: {
            totalIntercessors: 0,
            activePrayers: 0,
            propheticWords: 0,
            testimonies: 0,
            missionBases: 0,
            alerts: 1,
          },
          
          recentActivity: [
            {
              id: 'region-not-mapped',
              text: `Esta região precisa de mapeamento espiritual`,
              timestamp: new Date().toISOString(),
              type: 'unmapped' as const
            }
          ],
          
          prayerTargets: [
            {
              id: 'generate-data',
              title: `Gerar dados espirituais para ${regionName}`,
              description: `Esta região precisa de dados espirituais gerados pela IA. Vá ao Dashboard Administrativo para gerar conteúdo.`,
              priority: 'medium' as const,
              intercessors: 0,
            }
          ],
          
          spiritualStatus: {
            revivalLevel: 'baixo' as const,
            alertLevel: 'amarelo' as const,
            description: `${regionName} aguarda geração de dados espirituais. Use o painel administrativo para ativar o sistema de IA.`,
          }
        };
      } else {
        console.log(`❌ Nenhum registro encontrado para ${regionName}`);
        
        // Criar estrutura informativa mesmo quando não há dados
        return {
          region: regionName,
          type: regionType as 'continent' | 'country' | 'state' | 'city' | 'neighborhood',
          
          stats: {
            totalIntercessors: 0,
            activePrayers: 0,
            propheticWords: 0,
            testimonies: 0,
            missionBases: 0,
            alerts: 1,
          },
          
          recentActivity: [
            {
              id: 'region-not-mapped',
              type: 'alert' as const,
              title: '🗺️ Região Não Mapeada',
              description: `${regionName} ainda não foi cadastrada em nosso sistema de mapeamento espiritual. Esta é uma excelente oportunidade para expandir nosso alcance global através da intercessão.`,
              author: 'Sistema Atalaia',
              date: new Date().toISOString(),
              priority: 'high' as const,
            }
          ],
          
          prayerTargets: [
            {
              id: 'intercession-pioneer',
              title: `Interceder como pioneiro por ${regionName}`,
              description: `Seja um pioneiro na intercessão por esta região ainda não mapeada. Sua oração pode abrir caminhos espirituais.`,
              priority: 'high' as const,
              intercessors: 0,
            },
            {
              id: 'request-mapping',
              title: `Solicitar mapeamento de ${regionName}`,
              description: `Contate a administração para incluir esta região em nosso sistema de mapeamento espiritual.`,
              priority: 'medium' as const,
              intercessors: 0,
            }
          ],
          
          spiritualStatus: {
            revivalLevel: 'desconhecido' as const,
            alertLevel: 'laranja' as const,
            description: `${regionName} é uma região não mapeada espiritualmente. Sua intercessão pioneira é crucial para estabelecer cobertura espiritual.`,
          }
        };
      }
    } catch (error) {
      console.error('💥 Erro geral na função getSpiritualData:', error);
      return null;
    }
  };

  // Função separada para processar dados da região
  const processRegionData = async (rawSpiritualData: any, regionName: string, regionType: string) => {
    try {
      console.log(`🔄 Processando dados para ${regionName}:`, rawSpiritualData);
        
        // Converter dados do Supabase para o formato esperado pelo SpiritualPopup
      const spiritualData = rawSpiritualData as any;
        
        // NOVA ESTRUTURA - dados salvos pelo admin (mesma estrutura do modal Visualizar)
        const hasNewStructure = spiritualData.sistema_geopolitico_completo || spiritualData.alvos_intercessao_completo || spiritualData.outras_informacoes_importantes;
        
        if (hasNewStructure) {
          console.log('🆕 Usando nova estrutura de dados (compatível com modal Visualizar)');
          
          // Extrair alvos de intercessão do texto - melhor processamento
          const alvosText = spiritualData.alvos_intercessao_completo || '';
          let prayerTargets = [];
          
          if (alvosText.trim()) {
            // Tentar diferentes delimitadores para extrair alvos
            const alvosLines = alvosText.split(/[\n\r•\-\*]/)
              .map(line => line.trim())
              .filter(line => line.length > 3); // Filtra linhas muito pequenas
            
            prayerTargets = alvosLines.map((line: string, index: number) => ({
            id: `target-${index}`,
            title: line.length > 50 ? line.substring(0, 50) + '...' : line,
            description: line,
            priority: 'medium' as const,
            intercessors: Math.floor(Math.random() * 20) + 5,
          }));
          }
          
          return {
            region: regionName,
            type: regionType as 'continent' | 'country' | 'state' | 'city' | 'neighborhood',
            
            stats: {
              totalIntercessors: prayerTargets.length * 10,
              activePrayers: prayerTargets.length,
              propheticWords: spiritualData.sistema_geopolitico_completo ? 1 : 0,
              testimonies: 0,
              missionBases: 0,
              alerts: 0,
            },
            
            recentActivity: [
              // Sistema Geopolítico (sempre incluir se existe)
              ...(spiritualData.sistema_geopolitico_completo ? [{
                id: 'sistema-geo',
                type: 'prophetic_word' as const,
                title: '🏛️ Sistema Geopolítico',
                description: spiritualData.sistema_geopolitico_completo,
                author: 'Agente IA Atalaia',
                date: new Date().toISOString(),
                priority: 'high' as const,
              }] : []),
              
              // Alvos de Intercessão (só se tiver alvos)
              ...(prayerTargets.length > 0 ? [{
                id: 'alvos-intercesao',
                type: 'prayer_target' as const,
                title: '🔥 Alvos de Intercessão',
                description: `${prayerTargets.length} alvos específicos de oração identificados:\n\n${prayerTargets.map(t => `• ${t.description}`).join('\n')}`,
                author: 'Rede de Oração',
                date: new Date().toISOString(),
                priority: 'high' as const,
              }] : []),
              
              // Outras Informações Importantes
              ...(spiritualData.outras_informacoes_importantes ? [{
                id: 'outras-info',
                type: 'mission_base' as const,
                title: '📋 Outras Informações Importantes',
                description: spiritualData.outras_informacoes_importantes,
                author: 'Agente IA Atalaia',
                date: new Date().toISOString(),
                priority: 'medium' as const,
              }] : []),
              
              // Fallback se não tiver nenhum dado
              ...(!spiritualData.sistema_geopolitico_completo && prayerTargets.length === 0 && !spiritualData.outras_informacoes_importantes ? [{
                id: 'no-data',
                type: 'alert' as const,
                title: '⚠️ Dados Espirituais Limitados',
                description: 'Esta região ainda não possui dados espirituais completos gerados pela IA. Use o Dashboard Administrativo para gerar conteúdo.',
                author: 'Sistema Atalaia',
                date: new Date().toISOString(),
                priority: 'low' as const,
              }] : [])
            ],
            
            prayerTargets,
            
            spiritualStatus: {
              revivalLevel: prayerTargets.length > 5 ? 'alto' : prayerTargets.length > 2 ? 'médio' : 'baixo' as const,
              alertLevel: 'amarelo' as const,
              description: `${regionName} possui dados espirituais atualizados com ${prayerTargets.length} alvos de intercessão identificados.`,
          }
        };
      } else {
        console.log(`⚠️ Nenhum dado espiritual encontrado para ${regionName}, retornando dados básicos`);
        
        // Retornar estrutura básica sem dados mockados - MARCANDO COMO REGIÃO SEM DADOS ESPIRITUAIS
        return {
          region: regionName,
          type: regionType as 'continent' | 'country' | 'state' | 'city' | 'neighborhood',
          
          stats: {
            totalIntercessors: 0,
            activePrayers: 0,
            propheticWords: 0,
            testimonies: 0,
            missionBases: 0,
            alerts: 0,
          },
          
          recentActivity: [
            {
              id: 'region-not-mapped',
              text: `Esta região precisa de mapeamento espiritual`,
              timestamp: new Date().toISOString(),
              type: 'unmapped' as const
            }
          ],
          
          prayerTargets: [
            {
              id: '1',
              title: `Oração por ${regionName}`,
              description: `Intercessão pela obra de Deus em ${regionName}`,
              priority: 'medium' as const,
              intercessors: 0,
            }
          ],
          
          spiritualStatus: {
            revivalLevel: 'baixo' as const,
            alertLevel: 'verde' as const,
            description: `${regionName} aguarda dados espirituais. Contribua adicionando informações no painel administrativo.`,
          }
        };
      }
    } catch (error) {
      console.error('❌ Erro ao processar dados espirituais:', error);
      
      // Fallback mínimo em caso de erro
      return {
        region: regionName,
        type: regionType as 'continent' | 'country' | 'state' | 'city' | 'neighborhood',
        stats: { totalIntercessors: 0, activePrayers: 0, propheticWords: 0, testimonies: 0, missionBases: 0, alerts: 0 },
        recentActivity: [],
        prayerTargets: [],
        spiritualStatus: {
          revivalLevel: 'baixo' as const,
          alertLevel: 'verde' as const,
          description: `Erro ao carregar dados de ${regionName}. Tente novamente.`,
        }
      };
    }
  };

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Verificar se Google Maps está disponível
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (typeof google !== 'undefined' && google.maps) {
        console.log('✅ Google Maps carregado com sucesso!');
        setIsGoogleLoaded(true);
      } else {
        console.log('⏳ Aguardando Google Maps...');
        setTimeout(checkGoogleMaps, 100);
      }
    };

    checkGoogleMaps();
  }, []);

  // Determinar tipo de região baseado no zoom
  const determineRegionType = (zoom: number): string => {
    if (zoom <= 4) return 'Países';
    if (zoom <= 7) return 'Países + Estados';
    if (zoom <= 10) return 'Estados + Cidades';
    return 'Cidades + Localidades';
  };

  // Determinar quais camadas estão ativas
  const getActiveLayers = (zoom: number) => {
    if (zoom <= 4) return ['countries'];
    if (zoom <= 7) return ['countries', 'states'];
    if (zoom <= 10) return ['states', 'cities'];
    return ['cities', 'localities'];
  };





  // Configurar Data-Driven Styling com Feature Layers habilitadas
  const setupDataDrivenStyling = (map: google.maps.Map) => {
    console.log('🎨 Configurando Data-Driven Styling com Feature Layers habilitadas...');

    try {
      // 1. PAÍSES - Fronteiras vermelhas
      const countryLayer = map.getFeatureLayer(google.maps.FeatureType.COUNTRY);
      countryLayer.style = {
        strokeColor: '#FF6B6B',
        strokeOpacity: 1.0,
        strokeWeight: 3,
        fillColor: '#FF6B6B',
        fillOpacity: 0.1,
      };

      // 2. ESTADOS/PROVÍNCIAS - Fronteiras azuis
      const adminLevel1Layer = map.getFeatureLayer(google.maps.FeatureType.ADMINISTRATIVE_AREA_LEVEL_1);
      adminLevel1Layer.style = {
        strokeColor: '#4ECDC4',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#4ECDC4',
        fillOpacity: 0.05,
      };

      // 3. CIDADES/MUNICÍPIOS - Fronteiras azuis
      const adminLevel2Layer = map.getFeatureLayer(google.maps.FeatureType.ADMINISTRATIVE_AREA_LEVEL_2);
      adminLevel2Layer.style = {
        strokeColor: '#45B7D1',
        strokeOpacity: 0.6,
        strokeWeight: 1,
        fillColor: '#45B7D1',
        fillOpacity: 0.03,
      };

      // 4. LOCALIDADES - Fronteiras amarelas
      const localityLayer = map.getFeatureLayer(google.maps.FeatureType.LOCALITY);
      localityLayer.style = {
        strokeColor: '#FFA726',
        strokeOpacity: 0.5,
        strokeWeight: 1,
        fillColor: '#FFA726',
        fillOpacity: 0.02,
      };

      console.log('🎨 Estilos aplicados a todas as camadas');

      

      // FUNÇÃO PARA CONTROLAR VISIBILIDADE BASEADA NO ZOOM
      const updateLayerVisibility = (zoom: number) => {
        console.log(`🔍 Atualizando visibilidade das camadas para zoom: ${zoom}`);
        
        // ZOOM 1-4: Apenas países
        if (zoom <= 4) {
          console.log('🌍 Mostrando apenas PAÍSES');
          countryLayer.style = {
            strokeColor: '#FF6B6B',
            strokeOpacity: 1.0,
            strokeWeight: 3,
            fillColor: '#FF6B6B',
            fillOpacity: 0.1,
          };
          adminLevel1Layer.style = null; // Ocultar estados
          adminLevel2Layer.style = null; // Ocultar cidades
          localityLayer.style = null; // Ocultar localidades
        }
        // ZOOM 5-7: Países + Estados
        else if (zoom <= 7) {
          console.log('🌍🏛️ Mostrando PAÍSES + ESTADOS');
          countryLayer.style = {
            strokeColor: '#FF6B6B',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF6B6B',
            fillOpacity: 0.05,
          };
          adminLevel1Layer.style = {
            strokeColor: '#4ECDC4',
            strokeOpacity: 1.0,
            strokeWeight: 3,
            fillColor: '#4ECDC4',
            fillOpacity: 0.1,
          };
          adminLevel2Layer.style = null; // Ocultar cidades
          localityLayer.style = null; // Ocultar localidades
        }
        // ZOOM 8-10: Estados + Cidades (SEM círculos - bordas mais grossas para mobile)
        else if (zoom <= 10) {
          console.log('🏛️🏙️ Mostrando ESTADOS + CIDADES (mobile optimized)');
          countryLayer.style = {
            strokeColor: '#FF6B6B',
            strokeOpacity: 0.3,
            strokeWeight: 1,
            fillColor: '#FF6B6B',
            fillOpacity: 0.02,
          };
          adminLevel1Layer.style = {
            strokeColor: '#4ECDC4',
            strokeOpacity: 0.8,
            strokeWeight: 3, // Mais grosso para mobile
            fillColor: '#4ECDC4',
            fillOpacity: 0.1, // Mais visível para mobile
          };
          adminLevel2Layer.style = {
            strokeColor: '#45B7D1',
            strokeOpacity: 1.0,
            strokeWeight: 4, // Mais grosso para mobile
            fillColor: '#45B7D1',
            fillOpacity: 0.15, // Mais visível para mobile
          };
          localityLayer.style = null; // Ocultar localidades
        }
        // ZOOM 11+: Cidades + Localidades (SEM círculos - bordas mais grossas para mobile)
        else {
          console.log('🏙️📍 Mostrando CIDADES + LOCALIDADES (mobile optimized)');
          countryLayer.style = null; // Ocultar países
          adminLevel1Layer.style = {
            strokeColor: '#4ECDC4',
            strokeOpacity: 0.3,
            strokeWeight: 1,
            fillColor: '#4ECDC4',
            fillOpacity: 0.02,
          };
          adminLevel2Layer.style = {
            strokeColor: '#45B7D1',
            strokeOpacity: 0.8,
            strokeWeight: 3, // Mais grosso para mobile
            fillColor: '#45B7D1',
            fillOpacity: 0.1, // Mais visível para mobile
          };
          localityLayer.style = {
            strokeColor: '#FFA726',
            strokeOpacity: 1.0,
            strokeWeight: 4, // Mais grosso para mobile
            fillColor: '#FFA726',
            fillOpacity: 0.15, // Mais visível para mobile
          };
        }
      };

      // Aplicar visibilidade inicial
      updateLayerVisibility(currentZoom);

      // Listener para mudanças de zoom
      map.addListener('zoom_changed', () => {
        const newZoom = map.getZoom() || 4;
        updateLayerVisibility(newZoom);
      });

      // FUNÇÃO UNIFICADA PARA DETECTAR REGIÃO BASEADA NO ZOOM
      const handleRegionClick = (event: google.maps.FeatureMouseEvent, layerType: string) => {
        console.log(`🖱️ CLIQUE detectado na camada: ${layerType}`, event);
        
        // 📍 Capturar coordenadas do clique para uso posterior
        if (event.latLng) {
          const coordinates = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
          };
          setLastClickCoordinates(coordinates);
          console.log(`📍 Coordenadas capturadas:`, coordinates);
        }
        
        // Prevenir popup padrão do Google Maps
        event.stop();
        
        if (event.latLng) {
          const currentZoom = map.getZoom() || 4;
          const geocoder = new google.maps.Geocoder();
          
          // Função para tentar múltiplos pontos próximos
          const tryGeocoding = async (attempts: google.maps.LatLng[]) => {
            for (let i = 0; i < attempts.length; i++) {
              try {
                const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
                  geocoder.geocode({ location: attempts[i] }, (results, status) => {
                    if (status === 'OK' && results && results.length > 0) {
                      resolve(results);
                    } else {
                      reject(status);
                    }
                  });
                });
                
                console.log(`✅ Tentativa ${i + 1} bem-sucedida:`, result[0].address_components);
                return result[0];
              } catch (error) {
                console.log(`❌ Tentativa ${i + 1} falhou:`, error);
                if (i === attempts.length - 1) {
                  throw new Error('Todas as tentativas falharam');
                }
              }
            }
          };
          
          // Criar pontos próximos para tentar (caso o clique seja em área imprecisa)
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          const offset = 0.01; // ~1km de offset
          
          const attemptPoints = [
            event.latLng, // Ponto original
            new google.maps.LatLng(lat + offset, lng), // Norte
            new google.maps.LatLng(lat - offset, lng), // Sul  
            new google.maps.LatLng(lat, lng + offset), // Leste
            new google.maps.LatLng(lat, lng - offset), // Oeste
            new google.maps.LatLng(lat + offset/2, lng + offset/2), // Nordeste
          ];
          
          tryGeocoding(attemptPoints)
            .then((result) => {
              console.log('📍 Componentes encontrados:', result.address_components);
              
              let regionName = '';
              let regionType = '';
              let confidence = 'high';
              
              // Função para buscar componente específico
              const findComponent = (types: string[]) => {
                for (const type of types) {
                  const component = result.address_components.find(comp => 
                    comp.types.includes(type)
                  );
                  if (component) return component;
                }
                return null;
              };
              
              // Detectar baseado no zoom atual (sem fallbacks)
              if (currentZoom <= 4) {
                // Zoom baixo: APENAS país
                const country = findComponent(['country']);
                if (country) {
                  regionName = country.long_name;
                  regionType = 'country';
                  console.log(`🌍 Zoom ${currentZoom}: País identificado - ${regionName}`);
                } else {
                  throw new Error('País não encontrado no zoom baixo');
                }
              }
              else if (currentZoom <= 7) {
                // Zoom médio: APENAS estado
                const state = findComponent(['administrative_area_level_1']);
                if (state) {
                  regionName = state.long_name;
                  regionType = 'state';
                  console.log(`🏛️ Zoom ${currentZoom}: Estado identificado - ${regionName}`);
                } else {
                  throw new Error('Estado não encontrado no zoom médio');
                }
              }
              else if (currentZoom <= 10) {
                // Zoom alto: APENAS cidade
                const city = findComponent(['administrative_area_level_2', 'locality', 'sublocality']);
                if (city) {
                  regionName = city.long_name;
                  regionType = 'city';
                  console.log(`🏙️ Zoom ${currentZoom}: Cidade identificada - ${regionName}`);
                } else {
                  throw new Error('Cidade não encontrada no zoom alto');
                }
              }
              else {
                // Zoom máximo: APENAS localidade
                const locality = findComponent(['locality', 'sublocality', 'neighborhood', 'sublocality_level_1']);
                if (locality) {
                  regionName = locality.long_name;
                  regionType = 'locality';
                  console.log(`📍 Zoom ${currentZoom}: Localidade identificada - ${regionName}`);
                } else {
                  throw new Error('Localidade não encontrada no zoom máximo');
                }
              }
              
              // Se encontrou uma região válida
              if (regionName) {
                console.log(`✅ Região identificada: ${regionName} (${regionType}) - Confiança: ${confidence}`);
                
                setSelectedRegion(regionName);
                setSelectedRegionType(regionType);
                setPopupPosition({ 
                  x: (event.domEvent as MouseEvent)?.clientX || 100, 
                  y: (event.domEvent as MouseEvent)?.clientY || 100 
                });
                
                // Carregar dados espirituais assincronamente
                setLoadingSpiritualData(true);
                getSpiritualData(regionName, regionType).then((data) => {
                  setSpiritualData(data);
                  setLoadingSpiritualData(false);
                  setShowPopup(true);
                }).catch((error) => {
                  console.error('❌ Erro ao carregar dados espirituais:', error);
                  setLoadingSpiritualData(false);
                  setShowPopup(true);
                });
                
                onRegionSelect(regionName, regionType);
              }
            })
            .catch((error) => {
              console.error('❌ Erro em todas as tentativas de geocoding:', error);
              console.log('🚫 Nenhum fallback ativo - apenas log do erro');
            });
        }
      };

      // EVENTOS DE CLIQUE - PAÍSES
      countryLayer.addListener('click', (event: google.maps.FeatureMouseEvent) => {
        handleRegionClick(event, 'country');
      });

      // EVENTOS DE CLIQUE - ESTADOS/PROVÍNCIAS
      adminLevel1Layer.addListener('click', (event: google.maps.FeatureMouseEvent) => {
        handleRegionClick(event, 'state');
      });

      // EVENTOS DE CLIQUE - CIDADES/MUNICÍPIOS
      adminLevel2Layer.addListener('click', (event: google.maps.FeatureMouseEvent) => {
        handleRegionClick(event, 'city');
      });

      // EVENTOS DE CLIQUE - LOCALIDADES
      localityLayer.addListener('click', (event: google.maps.FeatureMouseEvent) => {
        handleRegionClick(event, 'locality');
      });

      console.log('✅ Data-Driven Styling configurado com sistema de zoom adaptativo!');
      console.log('🔍 Zoom 1-4: Países | Zoom 5-7: Países+Estados | Zoom 8-10: Estados+Cidades | Zoom 11+: Cidades+Localidades');
      
    } catch (error) {
      console.error('❌ Erro no Data-Driven Styling:', error);
      console.log('🚫 Nenhum fallback ativo - apenas log do erro');
    }
  };

  // Inicializar mapa
  useEffect(() => {
    if (!isGoogleLoaded || !mapRef.current) return;

    console.log('🗺️ Inicializando Google Maps com Data-Driven Styling...');

    const mapInstance = new google.maps.Map(mapRef.current, {
      zoom: currentZoom,
      center: { lat: -14.235, lng: -51.925 },
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapId: '3c973b49fc0bc22ebc3b14a8', // Map ID com Feature Layers configuradas
      disableDefaultUI: true, // Remove controles padrão e tags do Google Maps
      zoomControl: true, // Mantém apenas o controle de zoom
      gestureHandling: 'greedy', // Permite zoom/pan sem Ctrl
      clickableIcons: false // Remove cliques em ícones padrão do Google Maps
    });

    mapInstance.addListener('zoom_changed', () => {
      const newZoom = mapInstance.getZoom() || 4;
      setCurrentZoom(newZoom);
      console.log(`🔍 Zoom: ${newZoom}`);
    });

    setMap(mapInstance);

    // Configurar Data-Driven Styling
    setTimeout(() => {
      setupDataDrivenStyling(mapInstance);
    }, 1000);

  }, [isGoogleLoaded]);



  // Event handlers
  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleOpenSidebar = () => {
    setShowSidebar(true);
    setShowPopup(false);
  };

  const handleCloseSidebar = () => {
    setShowSidebar(false);
  };

  const handleStartPrayer = (regionName: string, regionData: any) => {
    console.log(`🙏 Iniciando oração por ${regionName}`);
    console.log('📊 Dados da região:', regionData);
    
    // Fechar popup e abrir cronômetro
    setShowPopup(false);
    setCurrentPrayerRegion(regionName);
    setShowPrayerTimer(true);
  };

  const handleSaveRegion = async (regionName: string, regionData: any) => {
    console.log(`💾 [FASE 1B] Salvando região ${regionName} no banco`);
    console.log('📊 Dados da região:', regionData);
    
    try {
      // 1. 🎯 Detectar hierarquia automaticamente
      console.log('🔍 Detectando hierarquia da região...');
      const hierarcyInfo = await detectRegionHierarchy(regionName, regionData.type);
      
      // 2. 📍 Preparar dados para inserção
      const regionDataToInsert = {
        name: regionName,
        region_type: regionData.type,
        parent_id: hierarcyInfo.parentId, // ✅ Corrigido: parent_id não parent_region_id
        coordinates: hierarcyInfo.coordinates || { lat: 0, lng: 0 }, // ✅ Formato JSONB {lat, lng}
        data_source: 'manual', // ✅ Corrigido: 'manual' não 'google_maps_manual'
        status: 'draft', // ✅ Adicionado: status obrigatório
        spiritual_data: null, // Será preenchido depois pela IA
        created_at: new Date().toISOString()
      };
      
      console.log('📄 Dados para inserção:', regionDataToInsert);
      
      // 3. 💾 Inserir no Supabase
      const { data: insertedRegion, error } = await supabase
        .from('spiritual_regions')
        .insert([regionDataToInsert])
        .select()
        .single();
      
      if (error) {
        console.error('❌ Erro ao inserir região:', error);
        alert(`❌ Erro ao salvar região!\n\n🚨 ${error.message}`);
        return;
      }
      
      console.log('✅ Região salva com sucesso:', insertedRegion);
      alert(`✅ REGIÃO SALVA COM SUCESSO!\n\n📍 Nome: ${regionName}\n🆔 ID: ${insertedRegion.id}\n🔗 Hierarquia: ${hierarcyInfo.hierarchyPath}\n\n🎉 A região agora está mapeada!`);
      
      // 4. 🔄 Atualizar o popup para não mostrar mais os botões
      // (O sistema já vai detectar automaticamente na próxima busca)
      
    } catch (error) {
      console.error('❌ Erro geral ao salvar região:', error);
      alert(`❌ ERRO INESPERADO!\n\n${error.message || error}`);
    }
  };

  const handleGenerateAI = async (regionName: string, regionData: any) => {
    console.log(`🤖 [VERSÃO DASHBOARD] Gerando dados espirituais IA para ${regionName}`);
    console.log('📊 Dados da região:', regionData);
    
    try {
      // 1. 🔍 Verificar se a região existe no banco (deve existir após "Salvar Região")
      console.log('🔍 Buscando região no banco para gerar IA...');
      const { data: existingRegion, error: searchError } = await supabase
        .from('spiritual_regions')
        .select('id, name, region_type, coordinates, country_code, spiritual_data')
        .eq('name', regionName)
        .eq('region_type', regionData.type)
        .single();
      
      if (searchError || !existingRegion) {
        alert(`❌ REGIÃO NÃO ENCONTRADA!\n\nPrimeiro clique em "Salvar Região" antes de gerar dados espirituais.`);
        return;
      }
      
      console.log('✅ Região encontrada:', existingRegion);
      
      // 2. 🎭 Edge Function não precisa de persona (usa API diretamente)
      console.log('🎭 Edge Function usa API OpenAI diretamente - sem necessidade de persona');
      
      // 3. 🤖 Executar geração via Edge Function (versão segura)
      console.log('🚀 Chamando Edge Function spiritual-ai-generation...');
      const result = await aiService.generateSpiritualData({
        regionName: existingRegion.name,
        regionType: existingRegion.region_type as 'country' | 'state' | 'city' | 'neighborhood',
        countryCode: existingRegion.country_code,
        coordinates: existingRegion.coordinates,
        context: `Região encontrada no banco de dados: ${existingRegion.name} (${existingRegion.region_type})`
      });
      
      console.log('✅ Dados gerados com sucesso (versão dashboard):', result);
      
      alert(`✅ DADOS ESPIRITUAIS GERADOS COM SUCESSO!\n\n🤖 Região: ${regionName}\n🚀 Via: Edge Function (segura)\n📝 Status: Dados gerados e salvos\n🔄 Próximo: Recarregue para ver os dados\n\n🎉 Gloria a Deus!`);
      
    } catch (error) {
      console.error('❌ Erro geral na geração de IA (versão dashboard):', error);
      alert(`❌ ERRO NA GERAÇÃO DE IA!\n\n${error.message || error}`);
    }
  };

  const handleFinishPrayer = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    
    console.log(`✅ Oração finalizada! Região: ${currentPrayerRegion}, Duração: ${minutes}m ${seconds}s`);
    
    // Fechar cronômetro e abrir modal de palavra profética
    setShowPrayerTimer(false);
    setPrayerDuration(duration);
    setShowPropheticModal(true);
  };

  const handleClosePrayerTimer = () => {
    setShowPrayerTimer(false);
    setCurrentPrayerRegion('');
  };

  const handleClosePropheticModal = () => {
    setShowPropheticModal(false);
    setCurrentPrayerRegion('');
    setPrayerDuration(0);
  };

  // Se Google Maps não carregou ainda, mostrar loading
  if (!isGoogleLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-lg">Carregando Google Maps...</p>
          <p className="text-sm text-purple-300 mt-2">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex">
      {/* Mapa - ajusta largura baseado no popup desktop */}
      <div 
        ref={mapRef} 
        className={`h-full transition-all duration-300 ${
          showPopup && !isMobile ? 'w-full ml-96' : 'w-full'
        }`} 
      />

      {/* Controles de Zoom e Legenda - Mobile Otimizado */}
      <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 md:p-3 space-y-1 md:space-y-2 z-30 text-xs md:text-sm">
        <div className="text-xs md:text-sm font-medium text-gray-700">
          Zoom: {currentZoom.toFixed(1)} ({determineRegionType(currentZoom)})
        </div>
        <div className="hidden md:block text-xs text-gray-500">
          Fronteiras oficiais Google
        </div>
        <div className="text-xs text-green-600 font-medium">
          ✅ Dados carregados
        </div>
        <div className="border-t pt-1 md:pt-2 mt-1 md:mt-2">
          <div className="text-xs font-medium text-gray-600 mb-1">Camadas Ativas:</div>
          <div className="space-y-0.5 md:space-y-1">
            {getActiveLayers(currentZoom).includes('countries') && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-red-500"></div>
                <span className="text-xs">🌍 Países</span>
              </div>
            )}
            {getActiveLayers(currentZoom).includes('states') && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-teal-400"></div>
                <span className="text-xs">🏛️ Estados</span>
              </div>
            )}
            {getActiveLayers(currentZoom).includes('cities') && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-blue-500"></div>
                <span className="text-xs">🏙️ Cidades</span>
              </div>
            )}
            {getActiveLayers(currentZoom).includes('localities') && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-orange-400"></div>
                <span className="text-xs">📍 Localidades</span>
              </div>
            )}
          </div>
          <div className="hidden md:block text-xs text-gray-500 mt-2">
            💡 Use o zoom para navegar entre níveis
          </div>
        </div>
      </div>

      {/* Popup Espiritual */}
      {showPopup && spiritualData && (
        <SpiritualPopup
          onClose={handleClosePopup}
          position={popupPosition}
          data={spiritualData}
          onStartPrayer={handleStartPrayer}
          onSaveRegion={handleSaveRegion}
          onGenerateAI={handleGenerateAI}
        />
      )}

      {/* Loading para dados espirituais */}
      {loadingSpiritualData && (
        <div className="fixed inset-0 bg-ios-dark-bg/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Carregando dados espirituais...</p>
          </div>
        </div>
      )}

      {/* Sidebar Regional */}
      {showSidebar && spiritualData && (
        <RegionalSidebar
          isOpen={showSidebar}
          onClose={handleCloseSidebar}
          data={spiritualData}
        />
      )}

      {/* Cronômetro de Oração */}
      {showPrayerTimer && currentPrayerRegion && (
        <PrayerTimer
          regionName={currentPrayerRegion}
          onFinishPrayer={handleFinishPrayer}
          onClose={handleClosePrayerTimer}
        />
      )}

      {/* Modal de Palavra Profética */}
      {showPropheticModal && currentPrayerRegion && (
        <PropheticWordModal
          isOpen={showPropheticModal}
          onClose={handleClosePropheticModal}
          regionName={currentPrayerRegion}
          prayerDuration={prayerDuration}
          spiritualData={spiritualData}
        />
      )}
    </div>
  );
};

export default RegionalMapComponent; 