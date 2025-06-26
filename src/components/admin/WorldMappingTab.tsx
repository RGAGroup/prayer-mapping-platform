import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe, 
  MapPin, 
  Play, 
  Pause, 
  Square, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Loader2,
  RefreshCw,
  Zap,
  Brain,
  Eye,
  Trash2
} from 'lucide-react';
import { googleGeoDataService } from '@/services/googleGeoDataService';
import { supabase } from '@/integrations/supabase/client';
import { aiService } from '@/services/aiService';
import { queueManagementService } from '@/services/queueManagementService';

interface ContinentConfig {
  name: string;
  code: string;
  emoji: string;
  countries: string[];
  status: 'pending' | 'importing' | 'completed' | 'error';
  progress: number;
  estimatedTime: string;
}

interface ImportStats {
  totalCountries: number;
  totalStates: number;
  totalCities: number;
  pendingRegions: number;
  importedToday: number;
  apiCallsUsed: number;
  estimatedCost: number;
  countriesWithSpiritualData: number;
  countriesWithoutSpiritualData: number;
}

export const WorldMappingTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState('dashboard');
  const [isImporting, setIsImporting] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<string>('');
  const [importLogs, setImportLogs] = useState<string[]>([]);
  const [selectedContinent, setSelectedContinent] = useState<string>('');
  const [importStats, setImportStats] = useState<ImportStats>({
    totalCountries: 0,
    totalStates: 0,
    totalCities: 0,
    pendingRegions: 0,
    importedToday: 0,
    apiCallsUsed: 0,
    estimatedCost: 0,
    countriesWithSpiritualData: 0,
    countriesWithoutSpiritualData: 0
  });

  const continentsConfig: ContinentConfig[] = [
    {
      name: 'Américas',
      code: 'americas',
      emoji: '🌎',
      countries: ['BR', 'US', 'CA', 'MX', 'AR', 'CL', 'PE', 'CO', 'VE', 'EC', 'BO', 'PY', 'UY', 'GY', 'SR', 'CR', 'PA', 'NI', 'HN', 'GT', 'BZ', 'SV'],
      status: 'pending',
      progress: 0,
      estimatedTime: '45 min'
    },
    {
      name: 'Europa',
      code: 'europe',
      emoji: '🇪🇺',
      countries: ['GB', 'FR', 'DE', 'IT', 'ES', 'PT', 'NL', 'BE', 'CH', 'AT', 'IE', 'DK', 'SE', 'NO', 'FI', 'PL', 'CZ', 'SK', 'HU', 'RO', 'BG', 'GR', 'HR', 'SI'],
      status: 'pending',
      progress: 0,
      estimatedTime: '60 min'
    },
    {
      name: 'Ásia',
      code: 'asia',
      emoji: '🏯',
      countries: ['CN', 'IN', 'JP', 'KR', 'TH', 'VN', 'MY', 'SG', 'ID', 'PH', 'KH', 'LA', 'MM', 'BD', 'LK', 'NP', 'PK', 'AF', 'IR', 'IQ'],
      status: 'pending',
      progress: 0,
      estimatedTime: '75 min'
    },
    {
      name: 'África',
      code: 'africa',
      emoji: '🌍',
      countries: ['ZA', 'NG', 'KE', 'ET', 'EG', 'MA', 'GH', 'TZ', 'UG', 'MZ', 'MG', 'CM', 'CI', 'NE', 'ML', 'BF', 'MW', 'ZM', 'SN', 'TN'],
      status: 'pending',
      progress: 0,
      estimatedTime: '50 min'
    },
    {
      name: 'Oceania',
      code: 'oceania',
      emoji: '🏝️',
      countries: ['AU', 'NZ', 'FJ', 'PG', 'NC', 'SB', 'VU', 'PF', 'WS', 'TO', 'KI', 'FM', 'MH', 'NR', 'PW', 'TV'],
      status: 'pending',
      progress: 0,
      estimatedTime: '25 min'
    }
  ];

  const [continents, setContinents] = useState<ContinentConfig[]>(continentsConfig);

  useEffect(() => {
    loadImportStats();
  }, []);

  const loadImportStats = async () => {
    try {
      const { data: regions, error } = await supabase
        .from('spiritual_regions')
        .select('region_type, created_at, data_source')
        .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

      if (error) throw error;

      const countries = regions?.filter(r => r.region_type === 'country').length || 0;
      const states = regions?.filter(r => r.region_type === 'state').length || 0;
      const cities = regions?.filter(r => r.region_type === 'city').length || 0;
      const importedToday = regions?.length || 0;

      // Buscar dados sobre spiritual data
      const { data: allCountries, error: allCountriesError } = await supabase
        .from('spiritual_regions')
        .select('spiritual_data')
        .eq('region_type', 'country');

      if (allCountriesError) throw allCountriesError;

      const withSpiritualData = allCountries?.filter(c => c.spiritual_data !== null).length || 0;
      const withoutSpiritualData = allCountries?.filter(c => c.spiritual_data === null).length || 0;

      setImportStats({
        totalCountries: countries,
        totalStates: states,
        totalCities: cities,
        pendingRegions: 0,
        importedToday,
        apiCallsUsed: importedToday * 2, // Estimativa
        estimatedCost: importedToday * 0.005, // Estimativa USD
        countriesWithSpiritualData: withSpiritualData,
        countriesWithoutSpiritualData: withoutSpiritualData
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      addLog(`❌ Erro ao carregar estatísticas: ${error}`);
    }
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setImportLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
    console.log(`[WorldMapping] ${message}`);
  };

  // Função auxiliar para extrair código do país
  const extractCountryCode = (place: any): string | null => {
    const countryComponent = place.address_components?.find((component: any) =>
      component.types.includes('country')
    );
    return countryComponent?.short_name || null;
  };

  // Função simplificada para buscar um país específico
  const searchCountryByCode = async (countryCode: string): Promise<any | null> => {
    try {
      addLog(`🔍 Buscando país: ${countryCode}`);
      
      // Usar busca textual direta do Google Geocoding
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${countryCode}&components=country:${countryCode}&key=AIzaSyCbk0kgeAlS_eU3QFNsR-Cysk_sRsPXTW0`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const countryResult = data.results.find((result: any) => 
          result.types.includes('country')
        );
        
        if (countryResult) {
          addLog(`✅ País encontrado: ${countryResult.formatted_address}`);
          return {
            place_id: countryResult.place_id,
            types: countryResult.types,
            formatted_address: countryResult.formatted_address,
            geometry: {
              location: {
                lat: countryResult.geometry.location.lat,
                lng: countryResult.geometry.location.lng
              },
              viewport: countryResult.geometry.viewport
            },
            address_components: countryResult.address_components
          };
        }
      }
      
      addLog(`⚠️ País ${countryCode} não encontrado`);
      return null;
      
    } catch (error) {
      addLog(`❌ Erro ao buscar ${countryCode}: ${error}`);
      return null;
    }
  };

  const importContinent = async (continentCode: string) => {
    const continent = continents.find(c => c.code === continentCode);
    if (!continent) return;

    setIsImporting(true);
    setCurrentOperation(`Importando ${continent.name}...`);
    addLog(`🌍 Iniciando importação: ${continent.name}`);

    // Atualizar status do continente
    setContinents(prev => prev.map(c => 
      c.code === continentCode 
        ? { ...c, status: 'importing', progress: 0 }
        : c
    ));

    try {
      let totalProgress = 0;
      const totalSteps = continent.countries.length; // Apenas países por agora

      // PASSO 1: Importar países
      addLog(`📍 Importando países de ${continent.name}...`);
      
      for (let i = 0; i < continent.countries.length; i++) {
        const countryCode = continent.countries[i];
        setCurrentOperation(`Importando país: ${countryCode}`);
        
        try {
          // Buscar dados do país via API direta
          const countryData = await searchCountryByCode(countryCode);

          if (countryData) {
            // Extrair nome do país
            const countryName = countryData.address_components?.find((comp: any) => 
              comp.types.includes('country')
            )?.long_name || countryData.formatted_address.split(',')[0];

            // Verificar se já existe
            const { data: existingCountry } = await supabase
              .from('spiritual_regions')
              .select('id')
              .eq('country_code', countryCode)
              .eq('region_type', 'country')
              .single();

            if (existingCountry) {
              addLog(`⚠️ País ${countryName} já existe no banco`);
            } else {
              // Salvar país no banco
              const { error: countryError } = await supabase
                .from('spiritual_regions')
                .insert({
                  name: countryName,
                  region_type: 'country',
                  country_code: countryCode,
                  coordinates: {
                    lat: countryData.geometry.location.lat,
                    lng: countryData.geometry.location.lng
                  },
                  spiritual_data: {
                    google_data: {
                      place_id: countryData.place_id,
                      formatted_address: countryData.formatted_address,
                      viewport: countryData.geometry.viewport,
                      address_components: countryData.address_components,
                      source: 'google_geocoding_api',
                      imported_at: new Date().toISOString()
                    },
                    import_source: 'world_mapping_dashboard',
                    continent: continent.name
                  },
                  data_source: 'imported',
                  status: 'pending'
                });

              if (countryError) {
                addLog(`❌ Erro ao salvar ${countryName}: ${countryError.message}`);
              } else {
                addLog(`✅ País salvo: ${countryName}`);
              }
            }
          }
        } catch (error) {
          addLog(`❌ Erro ao importar ${countryCode}: ${error}`);
        }

        totalProgress++;
        const progressPercent = Math.round((totalProgress / totalSteps) * 100);
        setContinents(prev => prev.map(c => 
          c.code === continentCode 
            ? { ...c, progress: progressPercent }
            : c
        ));

        // Delay para respeitar rate limits
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Concluído
      setContinents(prev => prev.map(c => 
        c.code === continentCode 
          ? { ...c, status: 'completed', progress: 100 }
          : c
      ));
      
      addLog(`🎉 Importação de ${continent.name} concluída!`);
      await loadImportStats();

    } catch (error) {
      setContinents(prev => prev.map(c => 
        c.code === continentCode 
          ? { ...c, status: 'error' }
          : c
      ));
      addLog(`💥 Erro na importação de ${continent.name}: ${error}`);
    } finally {
      setIsImporting(false);
      setCurrentOperation('');
    }
  };

  const stopImport = () => {
    setIsImporting(false);
    setCurrentOperation('');
    addLog('⏹️ Importação interrompida pelo usuário');
  };

  const clearLogs = () => {
    setImportLogs([]);
    addLog('🧹 Logs limpos');
  };

  const testGoogleConnection = async () => {
    addLog('🔧 Testando conexão com Google Maps API...');
    try {
      const testCountry = await searchCountryByCode('BR');
      if (testCountry) {
        addLog('✅ Google Maps API funcionando!');
      } else {
        addLog('❌ Google Maps API não retornou dados');
      }
    } catch (error) {
      addLog(`❌ Erro na conexão: ${error}`);
    }
  };

  const generateSpiritualData = async (countryCode: string) => {
    addLog(`🤖 Gerando dados espirituais para ${countryCode}...`);
    try {
      // Buscar dados do país no banco
      const { data: countryData, error: countryError } = await supabase
        .from('spiritual_regions')
        .select('name, coordinates')
        .eq('country_code', countryCode)
        .eq('region_type', 'country')
        .single();

      if (countryError || !countryData) {
        addLog(`❌ País ${countryCode} não encontrado no banco`);
        return;
      }

      // Gerar e salvar dados espirituais
      const coordinates = countryData.coordinates as { lat: number; lng: number } | null;
      await aiService.generateAndSaveForCountry(
        countryCode,
        countryData.name,
        coordinates ? {
          lat: coordinates.lat,
          lng: coordinates.lng
        } : undefined
      );

      addLog(`✅ Dados espirituais gerados com sucesso para ${countryData.name} (${countryCode})`);
      await loadImportStats();

    } catch (error) {
      addLog(`❌ Erro ao gerar dados espirituais: ${error instanceof Error ? error.message : error}`);
    }
  };

  const generateSpiritualDataBatch = async () => {
    setIsImporting(true);
    addLog(`🤖 Iniciando geração em lote de dados espirituais...`);
    
    try {
      const { data: countries, error: countriesError } = await supabase
        .from('spiritual_regions')
        .select('country_code, name, coordinates')
        .eq('region_type', 'country')
        .is('spiritual_data', null); // Apenas países sem dados espirituais

      if (countriesError) throw countriesError;

      addLog(`📋 ${countries.length} países encontrados para processamento`);

      let processedCount = 0;
      for (const country of countries) {
        setCurrentOperation(`Gerando IA: ${country.name} (${country.country_code})`);
        
        try {
          const coordinates = country.coordinates as { lat: number; lng: number } | null;
          await aiService.generateAndSaveForCountry(
            country.country_code,
            country.name,
            coordinates ? {
              lat: coordinates.lat,
              lng: coordinates.lng
            } : undefined
          );
          
          processedCount++;
          addLog(`✅ [${processedCount}/${countries.length}] ${country.name} processado`);
          
          // Delay para respeitar rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          addLog(`❌ Erro em ${country.name}: ${error instanceof Error ? error.message : error}`);
        }
      }

      addLog(`🎉 Processamento em lote concluído: ${processedCount}/${countries.length} países`);
      await loadImportStats();
      
    } catch (error) {
      addLog(`❌ Erro no processamento em lote: ${error instanceof Error ? error.message : error}`);
    } finally {
      setIsImporting(false);
      setCurrentOperation('');
    }
  };

  const deleteSpiritualData = async (countryCode: string) => {
    addLog(`🗑️ Excluindo dados espirituais de ${countryCode}...`);
    try {
      const { error: deleteError } = await supabase
        .from('spiritual_regions')
        .update({
          spiritual_data: null
        })
        .eq('country_code', countryCode)
        .eq('region_type', 'country');

      if (deleteError) {
        addLog(`❌ Erro ao excluir dados espirituais: ${deleteError.message}`);
      } else {
        addLog(`✅ Dados espirituais excluídos com sucesso de ${countryCode}`);
      }
    } catch (error) {
      addLog(`❌ Erro ao excluir dados espirituais: ${error}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">🌍 Mapeamento Mundial</h2>
          <p className="text-gray-600">Importação controlada de dados geográficos via Google Maps</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={testGoogleConnection}>
            🔧 Testar API
          </Button>
          <Button variant="outline" onClick={loadImportStats}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">📊 Dashboard</TabsTrigger>
          <TabsTrigger value="import">🚀 Importação</TabsTrigger>
          <TabsTrigger value="spiritual">🤖 Dados IA</TabsTrigger>
          <TabsTrigger value="logs">📝 Logs</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Países
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{importStats.totalCountries}</div>
                <p className="text-xs text-muted-foreground">importados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Estados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{importStats.totalStates}</div>
                <p className="text-xs text-muted-foreground">importados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Hoje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{importStats.importedToday}</div>
                <p className="text-xs text-muted-foreground">regiões importadas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  API Calls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{importStats.apiCallsUsed}</div>
                <p className="text-xs text-muted-foreground">~${importStats.estimatedCost.toFixed(3)} USD</p>
              </CardContent>
            </Card>
          </div>

          {/* Status dos Continentes */}
          <Card>
            <CardHeader>
              <CardTitle>Status dos Continentes</CardTitle>
              <CardDescription>Progresso da importação por continente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {continents.map((continent) => (
                  <div key={continent.code} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{continent.emoji}</span>
                      <div>
                        <h3 className="font-medium">{continent.name}</h3>
                        <p className="text-sm text-gray-500">{continent.countries.length} países</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {continent.status === 'completed' && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completo
                        </Badge>
                      )}
                      {continent.status === 'importing' && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Importando
                        </Badge>
                      )}
                      {continent.status === 'error' && (
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Erro
                        </Badge>
                      )}
                      {continent.status === 'pending' && (
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          Pendente
                        </Badge>
                      )}
                      
                      <div className="text-right">
                        <div className="text-sm font-medium">{continent.progress}%</div>
                        <div className="text-xs text-gray-500">~{continent.estimatedTime}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Import Tab */}
        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Controle de Importação</CardTitle>
              <CardDescription>
                Selecione um continente para importar países via Google Maps API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status da operação atual */}
              {isImporting && (
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription>
                    <strong>Operação em andamento:</strong> {currentOperation}
                  </AlertDescription>
                </Alert>
              )}

              {/* Seletor de continente */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Selecionar Continente:</label>
                  <Select value={selectedContinent} onValueChange={setSelectedContinent}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Escolha um continente..." />
                    </SelectTrigger>
                    <SelectContent>
                      {continents.map((continent) => (
                        <SelectItem key={continent.code} value={continent.code}>
                          {continent.emoji} {continent.name} ({continent.countries.length} países)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Controles */}
                <div className="flex gap-2">
                  <Button 
                    onClick={() => selectedContinent && importContinent(selectedContinent)}
                    disabled={!selectedContinent || isImporting}
                    className="flex-1"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Iniciar Importação
                  </Button>
                  
                  {isImporting && (
                    <Button variant="destructive" onClick={stopImport}>
                      <Square className="w-4 h-4 mr-2" />
                      Parar
                    </Button>
                  )}
                </div>
              </div>

              {/* Preview do continente selecionado */}
              {selectedContinent && (
                <Card className="bg-gray-50">
                  <CardContent className="pt-4">
                    {(() => {
                      const continent = continents.find(c => c.code === selectedContinent);
                      return continent ? (
                        <div>
                          <h4 className="font-medium mb-2">
                            {continent.emoji} {continent.name}
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Países:</span> {continent.countries.length}
                            </div>
                            <div>
                              <span className="text-gray-600">Tempo estimado:</span> {continent.estimatedTime}
                            </div>
                            <div>
                              <span className="text-gray-600">Status:</span>{' '}
                              <Badge variant="outline">{continent.status}</Badge>
                            </div>
                            <div>
                              <span className="text-gray-600">Progresso:</span> {continent.progress}%
                            </div>
                          </div>
                          
                          {continent.progress > 0 && (
                            <div className="mt-3">
                              <Progress value={continent.progress} className="w-full" />
                            </div>
                          )}
                        </div>
                      ) : null;
                    })()}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Spiritual AI Data Tab */}
        <TabsContent value="spiritual" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">🤖 Geração de Dados Espirituais</h3>
              <p className="text-gray-600">Gerar análises espirituais com GPT-4o-2024-08-06 para países importados</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={generateSpiritualDataBatch}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={isImporting}
              >
                <Zap className="w-4 h-4 mr-2" />
                Gerar Todos
              </Button>
              <Button variant="outline" onClick={loadImportStats}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Países Importados</p>
                    <p className="text-2xl font-bold">{importStats.totalCountries}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🌍</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Com Dados IA</p>
                    <p className="text-2xl font-bold">{importStats.countriesWithSpiritualData}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Brain className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pendentes IA</p>
                    <p className="text-2xl font-bold">{importStats.countriesWithoutSpiritualData}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">⏳</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Países */}
          <Card>
            <CardHeader>
              <CardTitle>📋 Países Disponíveis para Geração IA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {continents.map(continent => (
                  <div key={continent.code} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{continent.emoji} {continent.name}</h4>
                      <Badge variant={continent.status === 'completed' ? 'default' : 'secondary'}>
                        {continent.countries.length} países
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {continent.countries.slice(0, 8).map(countryCode => (
                        <div key={countryCode} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                          <span className="font-mono">{countryCode}</span>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-6 p-0"
                              onClick={() => generateSpiritualData(countryCode)}
                              disabled={isImporting}
                            >
                              <Brain className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-6 p-0"
                              onClick={() => deleteSpiritualData(countryCode)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {continent.countries.length > 8 && (
                        <div className="text-xs text-gray-500 p-2">
                          +{continent.countries.length - 8} mais...
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Configurações de IA */}
          <Card>
            <CardHeader>
              <CardTitle>⚙️ Configurações de IA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Modelo</p>
                  <Badge variant="outline" className="mt-1">GPT-4o-2024-08-06</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Custo por país</p>
                  <Badge variant="outline" className="mt-1">~$0.03 USD</Badge>
                </div>
              </div>
              
              <Alert>
                <Brain className="h-4 w-4" />
                <AlertDescription>
                  <strong>Dados gerados:</strong> 🏛️ Sistema Geopolítico, 🔥 Alvos de Intercessão, 
                  Guerra Espiritual, Clima Espiritual, Bases Missionárias e mais para cada país.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Logs de Importação</CardTitle>
                <CardDescription>Histórico detalhado das operações realizadas</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={clearLogs}>
                🧹 Limpar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
                {importLogs.length === 0 ? (
                  <div className="text-gray-500">Nenhum log disponível ainda...</div>
                ) : (
                  importLogs.map((log, index) => (
                    <div key={index} className="mb-1">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 