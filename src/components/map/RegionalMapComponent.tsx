import { useEffect, useRef, useState } from 'react';
import { LocationData } from '@/types/Location';
import { SpiritualPopup } from './SpiritualPopup';
import { RegionalSidebar } from './RegionalSidebar';
import { PrayerTimer } from '../PrayerTimer';
import { PropheticWordModal } from '../PropheticWordModal';
import { supabase } from '@/integrations/supabase/client';

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


  const getSpiritualData = async (regionName: string, regionType: string) => {
    // Debug - verificar valores
    console.log(`🔍 getSpiritualData chamado com: regionName="${regionName}", regionType="${regionType}"`);
    
    try {
      // Buscar dados reais do Supabase
      const { data: regionData, error } = await supabase
        .from('spiritual_regions')
        .select('spiritual_data')
        .eq('name', regionName)
        .eq('region_type', regionType.toLowerCase())
        .maybeSingle();

      if (error) {
        console.error('❌ Erro ao buscar dados espirituais:', error);
      }

      if (regionData?.spiritual_data) {
        console.log(`✅ Dados espirituais encontrados para ${regionName}:`, regionData.spiritual_data);
        
        // Converter dados do Supabase para o formato esperado pelo SpiritualPopup
        const spiritualData = regionData.spiritual_data as any;
        
        // NOVA ESTRUTURA - dados salvos pelo admin
        const hasNewStructure = spiritualData.sistema_geopolitico_completo || spiritualData.alvos_intercessao_completo;
        
        if (hasNewStructure) {
          console.log('🆕 Usando nova estrutura de dados');
          
          // Extrair alvos de intercessão do texto
          const alvosText = spiritualData.alvos_intercessao_completo || '';
          const alvosLines = alvosText.split('\n').filter((line: string) => line.trim().length > 0);
          const prayerTargets = alvosLines.map((line: string, index: number) => ({
            id: `target-${index}`,
            title: line.length > 50 ? line.substring(0, 50) + '...' : line,
            description: line,
            priority: 'medium' as const,
            intercessors: Math.floor(Math.random() * 20) + 5,
          }));
          
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
              {
                id: 'sistema-geo',
                type: 'prophetic_word' as const,
                title: '🏛️ Sistema Geopolítico Atualizado',
                description: spiritualData.sistema_geopolitico_completo || 'Informações sobre o sistema geopolítico não disponíveis.',
                author: 'Administrador',
                date: new Date().toISOString(),
                priority: 'high' as const,
              },
              {
                id: 'alvos-intercesao',
                type: 'prayer_target' as const,
                title: '🔥 Alvos de Intercessão Definidos',
                description: `${prayerTargets.length} alvos de oração identificados`,
                author: 'Rede de Oração',
                date: new Date().toISOString(),
                priority: 'high' as const,
              },
              ...(spiritualData.outras_informacoes_importantes ? [{
                id: 'outras-info',
                type: 'mission_base' as const,
                title: '📋 Outras Informações Importantes',
                description: spiritualData.outras_informacoes_importantes,
                author: 'Agente Atalaia',
                date: new Date().toISOString(),
                priority: 'medium' as const,
              }] : [])
            ],
            
            prayerTargets,
            
            spiritualStatus: {
              revivalLevel: prayerTargets.length > 5 ? 'alto' : prayerTargets.length > 2 ? 'médio' : 'baixo' as const,
              alertLevel: 'amarelo' as const,
              description: `${regionName} possui dados espirituais atualizados com ${prayerTargets.length} alvos de intercessão identificados.`,
            }
          };
        }
        
        // ESTRUTURA ANTIGA - manter compatibilidade
        return {
          region: regionName,
          type: regionType as 'continent' | 'country' | 'state' | 'city' | 'neighborhood',
          
          stats: {
            totalIntercessors: spiritualData.stats?.total_intercessors || 0,
            activePrayers: spiritualData.stats?.active_prayers || 0,
            propheticWords: spiritualData.prophetic_words?.length || 0,
            testimonies: spiritualData.testimonies?.length || 0,
            missionBases: spiritualData.mission_bases?.length || 0,
            alerts: spiritualData.spiritual_alerts?.length || 0,
          },
          
          recentActivity: [
            ...(spiritualData.prophetic_words || []).slice(0, 2).map((word: any, index: number) => ({
              id: `pw-${index}`,
              type: 'prophetic_word' as const,
              title: word.content?.substring(0, 50) + '...' || 'Palavra Profética',
              description: word.content || '',
              author: word.author || 'Anônimo',
              date: word.date || new Date().toISOString(),
              priority: 'high' as const,
            })),
            ...(spiritualData.prayer_targets || []).slice(0, 2).map((target: any, index: number) => ({
              id: `pt-${index}`,
              type: 'prayer_target' as const,
              title: target.title || 'Alvo de Oração',
              description: target.description || '',
              author: 'Rede de Oração',
              date: new Date().toISOString(),
              priority: target.urgency || 'medium' as const,
            }))
          ],
          
          prayerTargets: (spiritualData.prayer_targets || []).map((target: any) => ({
            id: target.id || Math.random().toString(),
            title: target.title || 'Alvo de Oração',
            description: target.description || '',
            priority: target.urgency || 'medium' as const,
            intercessors: Math.floor(Math.random() * 50) + 10,
          })),
          
          spiritualStatus: {
            revivalLevel: spiritualData.stats?.revival_level || 'baixo' as 'baixo' | 'médio' | 'alto' | 'avivamento',
            alertLevel: spiritualData.stats?.alert_level || 'verde' as 'verde' | 'amarelo' | 'laranja' | 'vermelho',
            description: `Status espiritual atual de ${regionName}. ${spiritualData.prayer_targets?.length || 0} alvos de oração ativos.`,
          }
        };
      } else {
        console.log(`⚠️ Nenhum dado espiritual encontrado para ${regionName}, retornando dados básicos`);
        
        // Retornar estrutura básica sem dados mockados
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
          
          recentActivity: [],
          
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

      {/* Controles de Zoom e Legenda */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 space-y-2 z-30">
        <div className="text-sm font-medium text-gray-700">
          Zoom: {currentZoom.toFixed(1)} ({determineRegionType(currentZoom)})
        </div>
        <div className="text-xs text-gray-500">
          Fronteiras oficiais Google
        </div>
        <div className="text-xs text-green-600 font-medium">
          ✅ Dados carregados
        </div>
        <div className="border-t pt-2 mt-2">
          <div className="text-xs font-medium text-gray-600 mb-1">Camadas Ativas:</div>
          <div className="space-y-1">
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
          <div className="text-xs text-gray-500 mt-2">
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
        />
      )}

      {/* Loading para dados espirituais */}
      {loadingSpiritualData && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
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