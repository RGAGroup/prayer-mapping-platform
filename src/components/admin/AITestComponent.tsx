import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Bot, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { aiService, type SpiritualData } from '@/services/aiService';

const AITestComponent = () => {
  const [regionName, setRegionName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<SpiritualData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [showApiInput, setShowApiInput] = useState(!aiService.isReady());

  const handleConfigureAPI = () => {
    if (apiKey.trim()) {
      aiService.setApiKey(apiKey.trim());
      setShowApiInput(false);
      setApiKey('');
    }
  };

  const handleGenerate = async () => {
    if (!regionName.trim() || !aiService.isReady()) return;

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const data = await aiService.generateSpiritualData({
        regionName: regionName.trim(),
        regionType: 'country',
        context: 'Teste do sistema AI'
      });

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsGenerating(false);
    }
  };

  if (showApiInput) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bot className="w-5 h-5 mr-2" />
            Configurar OpenAI
          </CardTitle>
          <CardDescription>
            Configure sua API key para testar a geração AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="api-key">OpenAI API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          <Button onClick={handleConfigureAPI} className="w-full">
            Configurar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2 text-blue-500" />
            Teste de Geração AI
          </CardTitle>
          <CardDescription>
            Teste a geração de dados espirituais usando IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Label htmlFor="region">Nome da Região</Label>
              <Input
                id="region"
                placeholder="Ex: França, Japão, Nigéria"
                value={regionName}
                onChange={(e) => setRegionName(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleGenerate}
                disabled={!regionName.trim() || isGenerating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isGenerating ? (
                  <>
                    <Bot className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Gerar
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              API Configurada
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowApiInput(true)}
            >
              Reconfigurar API
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-700 flex items-center">
              ⚔️ Relatório de Guerra Espiritual - {regionName}
            </CardTitle>
            <CardDescription className="text-purple-600 font-medium">
              🕊️ Palavra Profética: {result.propheticWord}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Fortalezas Espirituais */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center">
                👹 Fortalezas Identificadas:
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.strongholds.map((stronghold, index) => (
                  <Badge key={index} variant="destructive" className="bg-red-600">
                    {stronghold}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Influências Espirituais */}
            {result.spiritualInfluences && result.spiritualInfluences.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  🐍 Influências Territoriais:
                </h4>
                <div className="space-y-2">
                  {result.spiritualInfluences.map((influence, index) => (
                    <div key={index} className="p-3 bg-red-50 border-l-4 border-red-400 rounded">
                      <h5 className="font-medium text-red-800">{influence.name}</h5>
                      <p className="text-sm text-red-700 mb-1">📋 {influence.manifestation}</p>
                      <p className="text-sm text-red-600">⚔️ Estratégia: {influence.counterStrategy}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alertas Espirituais */}
            {result.spiritualAlerts && result.spiritualAlerts.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">⚠️ Alertas Espirituais:</h4>
                <div className="space-y-2">
                  {result.spiritualAlerts.map((alert, index) => (
                    <div key={index} className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-medium text-yellow-800">{alert.type}</h5>
                        <Badge variant={alert.urgency === 'critical' ? 'destructive' : 'secondary'}>
                          {alert.urgency}
                        </Badge>
                      </div>
                      <p className="text-sm text-yellow-700 mb-1">{alert.description}</p>
                      <p className="text-sm text-yellow-600">🙏 Foco: {alert.prayerFocus}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alvos de Intercessão */}
            <div>
              <h4 className="font-semibold mb-2">🔥 Alvos de Intercessão ({result.prayerTargets.length}):</h4>
              <div className="space-y-2">
                {result.prayerTargets.slice(0, 3).map((target, index) => (
                  <div key={index} className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-medium text-blue-800">{target.title}</h5>
                      <Badge variant="outline">P{target.priority}</Badge>
                    </div>
                    <p className="text-sm text-blue-700 mb-1">{target.description}</p>
                    <p className="text-sm text-blue-600">⚔️ {target.spiritualContext}</p>
                  </div>
                ))}
                {result.prayerTargets.length > 3 && (
                  <p className="text-sm text-gray-500">
                    +{result.prayerTargets.length - 3} alvos adicionais
                  </p>
                )}
              </div>
            </div>

            {/* Sistema Geopolítico */}
            {result.geopoliticalSystem && (
              <div>
                <h4 className="font-semibold mb-2">🏛️ Sistema Geopolítico:</h4>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm mb-2"><strong>Governo:</strong> {result.geopoliticalSystem.governmentType}</p>
                  <p className="text-sm mb-2"><strong>Filosofia:</strong> {result.geopoliticalSystem.dominantPhilosophy}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs font-medium text-purple-700">Cargos-Chave:</p>
                      <div className="flex flex-wrap gap-1">
                        {result.geopoliticalSystem.keyPositions.slice(0, 3).map((position, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {position}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-purple-700">Centros de Poder:</p>
                      <div className="flex flex-wrap gap-1">
                        {result.geopoliticalSystem.powerCenters.slice(0, 3).map((center, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {center}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Ações para Intercessores */}
            {result.intercessorActions && result.intercessorActions.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">🙏 Ações para Intercessores:</h4>
                <div className="space-y-1">
                  {result.intercessorActions.map((action, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="text-green-600 font-bold">{index + 1}.</span>
                      <span className="text-sm text-gray-700">{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Testemunhos de Avivamento */}
            {result.revivalTestimonies && result.revivalTestimonies.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">📖 Testemunhos de Avivamento:</h4>
                <div className="space-y-2">
                  {result.revivalTestimonies.slice(0, 2).map((testimony, index) => (
                    <div key={index} className="p-3 bg-green-50 rounded-lg">
                      <h5 className="font-medium text-green-800">{testimony.title} ({testimony.year})</h5>
                      <p className="text-sm text-green-700">{testimony.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bases Missionárias */}
            {result.missionBases && result.missionBases.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">🧱 Bases Missionárias:</h4>
                <div className="space-y-2">
                  {result.missionBases.slice(0, 2).map((base, index) => (
                    <div key={index} className="p-2 bg-orange-50 rounded">
                      <h5 className="font-medium text-orange-800">{base.name}</h5>
                      <p className="text-xs text-orange-600">{base.organization} - {base.focus}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Informações Complementares */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">⛪ Igrejas Estimadas:</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {result.churches.estimate.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  Temperatura: {result.churches.spiritualTemperature}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🌍 Idiomas:</h4>
                <div className="flex flex-wrap gap-1">
                  {result.languagesSpoken.slice(0, 3).map((lang, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AITestComponent; 