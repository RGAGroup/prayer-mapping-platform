import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Textarea } from './ui/textarea';
import { Heart, Copy, Share2, BookOpen, Database } from 'lucide-react';
import { savePrayerSession } from '@/services/prayerSessionService';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';

interface PropheticWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  regionName: string;
  prayerDuration: number;
  spiritualData?: any;
}

export const PropheticWordModal: React.FC<PropheticWordModalProps> = ({
  isOpen,
  onClose,
  regionName,
  prayerDuration,
  spiritualData
}) => {
  const { t } = useTranslation();
  const [customReflection, setCustomReflection] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [sessionSaved, setSessionSaved] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Resetar estado quando o modal fechar
  useEffect(() => {
    if (!isOpen) {
      setSessionSaved(false);
      setCustomReflection('');
      setIsSaving(false);
      setSessionId(null);
    }
  }, [isOpen]);

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`;
  };

  // Palavras proféticas baseadas na duração da oração
  const getPropheticWord = (duration: number, region: string): string => {
    if (duration < 60) {
      return `"${region}, ainda que tua oração tenha sido breve, eu ouvi cada palavra do teu coração. Como uma semente plantada, esta intercessão germinará em bênçãos. Não subestimes o poder de um momento sincero diante de Mim." - Disse o Senhor`;
    } else if (duration < 180) {
      return `"Sobre ${region} derramarei chuvas de bênçãos. Tua perseverança na oração move o Meu coração. Eu levantarei intercessores nesta terra e despertarei corações para o avivamento. O que foi pedido em secreto será manifestado em público." - Declara o Senhor`;
    } else if (duration < 300) {
      return `"${region} será um farol de luz entre as nações. Tua oração persistente quebrou cadeias no mundo espiritual. Eu estabelecerei esta terra como lugar de refúgio e restauração. Levantarei uma geração que Me buscará de todo o coração." - Assim diz o Senhor`;
    } else {
      return `"${region} experimentará um mover poderoso do Meu Espírito! Tua oração fervorosa abriu os céus sobre esta região. Eu enviarei avivamento, cura e transformação. Esta terra se tornará um centro de adoração e evangelização para as nações vizinhas. O que era impossível aos homens, Eu tornarei possível!" - Declara o Senhor dos Exércitos`;
    }
  };

  const propheticWord = getPropheticWord(prayerDuration, regionName);

  // Salvar sessão automaticamente quando o modal abrir
  useEffect(() => {
    if (isOpen && !sessionSaved) {
      savePrayerSessionToDatabase();
    }
  }, [isOpen, sessionSaved]);

  const savePrayerSessionToDatabase = async () => {
    try {
      setIsSaving(true);
      console.log('🔄 Iniciando salvamento de sessão de oração...');

      // Verificar se usuário está logado
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError) {
        console.error('❌ Erro ao verificar autenticação:', authError);
        alert(t('propheticWord.errorAuth'));
        setIsSaving(false);
        return;
      }

      if (!user) {
        console.error('⚠️ Usuário não logado - sessão não será salva');
        alert(t('propheticWord.errorNotLogged'));
        setIsSaving(false);
        return;
      }

      console.log('✅ Usuário autenticado:', user.email);

      // Preparar dados da sessão
      const now = new Date();
      const startTime = new Date(now.getTime() - (prayerDuration * 1000));

      const sessionData = {
        user_id: user.id,
        region_name: regionName,
        region_type: 'country' as const, // Por enquanto assumindo país
        duration_seconds: prayerDuration,
        started_at: startTime.toISOString(),
        finished_at: now.toISOString(),
        prophetic_word: propheticWord,
        personal_reflection: '',
        spiritual_data: spiritualData || null,
      };

      console.log('💾 Dados da sessão preparados:', sessionData);

      const savedSession = await savePrayerSession(sessionData);

      if (savedSession) {
        console.log('✅ Sessão salva com sucesso no banco de dados!', savedSession);
        setSessionSaved(true);
        setSessionId(savedSession.id); // Armazenar o ID da sessão
        alert('✅ Oração registrada com sucesso!');
      } else {
        console.error('❌ Falha ao salvar sessão - savePrayerSession retornou null');
        alert(t('propheticWord.errorSavingSession'));
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao salvar sessão:', error);
      alert(`${t('propheticWord.errorSaving')}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyWord = () => {
    navigator.clipboard.writeText(propheticWord);
    alert(t('propheticWord.copied'));
  };

  const handleShareWord = () => {
    if (navigator.share) {
      navigator.share({
        title: `Palavra Profética para ${regionName}`,
        text: `Após ${formatDuration(prayerDuration)} de oração:\n\n${propheticWord}`,
      });
    } else {
      // Fallback para navegadores sem Web Share API
      const text = `Palavra Profética para ${regionName}\nApós ${formatDuration(prayerDuration)} de oração:\n\n${propheticWord}`;
      navigator.clipboard.writeText(text);
      alert(t('propheticWord.copiedToShare'));
    }
  };

  const handleSaveReflection = async () => {
    if (!customReflection.trim()) return;

    // Verificar se temos o ID da sessão
    if (!sessionId) {
      alert(t('propheticWord.errorSessionNotSaved'));
      console.error('❌ sessionId não está disponível');
      return;
    }

    try {
      setIsSaving(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert(t('propheticWord.errorNotLogged'));
        return;
      }

      console.log('💾 Salvando reflexão para sessão ID:', sessionId);

      // Atualizar APENAS a sessão específica usando o ID
      const { error } = await supabase
        .from('prayer_sessions')
        .update({ personal_reflection: customReflection.trim() })
        .eq('id', sessionId)
        .eq('user_id', user.id); // Segurança adicional

      if (error) {
        console.error('❌ Erro ao salvar reflexão:', error);
        alert(t('propheticWord.errorSavingReflection'));
      } else {
        console.log('✅ Reflexão salva com sucesso para sessão:', sessionId);

        // Copiar reflexão completa
        const fullText = `Oração por ${regionName} - ${formatDuration(prayerDuration)}\n\nPalavra Profética:\n${propheticWord}\n\nReflexão Pessoal:\n${customReflection}`;
        navigator.clipboard.writeText(fullText);
        alert(t('propheticWord.copiedToShare'));
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao salvar reflexão:', error);
      alert('❌ Erro inesperado');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-ios-dark-bg2">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-ios-blue dark:text-ios-blue flex items-center justify-center gap-2">
            <BookOpen className="w-6 h-6" />
            Palavra Profética para {regionName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estatísticas da Oração */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
            <CardContent className="p-4">
              <div className="text-center">
                <h3 className="font-semibold text-gray-800 mb-2">🙏 Sessão de Oração Completada</h3>
                <div className="flex justify-center gap-4 text-sm flex-wrap">
                  <div className="bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200">
                    <span className="text-gray-600">Região:</span>
                    <span className="font-semibold text-blue-600 ml-1">{regionName}</span>
                  </div>
                  <div className="bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200">
                    <span className="text-gray-600">Duração:</span>
                    <span className="font-semibold text-green-600 ml-1">{formatDuration(prayerDuration)}</span>
                  </div>
                  <div className="bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-semibold ml-1 ${
                      isSaving ? 'text-yellow-600' :
                      sessionSaved ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {isSaving ? '💾 Salvando...' :
                       sessionSaved ? '✅ Salvo' : '⏳ Pendente'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Palavra Profética */}
          <Card className="border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-orange-600 flex items-center justify-center gap-2">
                  ✨ Palavra do Senhor
                </h3>
              </div>

              <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-400 shadow-sm">
                <p className="text-gray-800 leading-relaxed text-justify italic">
                  {propheticWord}
                </p>
              </div>

              <div className="flex gap-2 mt-4 justify-center">
                <Button
                  onClick={handleCopyWord}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 bg-white hover:bg-gray-100 border-gray-300 text-gray-700"
                >
                  <Copy className="w-4 h-4" />
                  {t('propheticWord.copy')}
                </Button>
                <Button
                  onClick={handleShareWord}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 bg-white hover:bg-gray-100 border-gray-300 text-gray-700"
                >
                  <Share2 className="w-4 h-4" />
                  {t('propheticWord.share')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Dados Espirituais da Região (se disponível) */}
          {spiritualData && (spiritualData.sistema_geopolitico_completo || spiritualData.alvos_intercessao_completo) && (
            <Card className="bg-gray-50 border border-gray-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  📊 Contexto Espiritual de {regionName}
                </h3>

                {spiritualData.sistema_geopolitico_completo && (
                  <div className="mb-3">
                    <h4 className="font-medium text-gray-700 mb-1">🏛️ Sistema Geopolítico:</h4>
                    <p className="text-sm text-gray-600 bg-white p-2 rounded-md border-l-2 border-blue-400">
                      {spiritualData.sistema_geopolitico_completo.substring(0, 200)}...
                    </p>
                  </div>
                )}

                {spiritualData.alvos_intercessao_completo && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">🔥 Alvos de Intercessão:</h4>
                    <p className="text-sm text-gray-600 bg-white p-2 rounded-md border-l-2 border-red-400">
                      {spiritualData.alvos_intercessao_completo.substring(0, 200)}...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Reflexão Pessoal */}
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                {t('propheticWord.personalReflection')}
              </h3>
              <Textarea
                placeholder={t('propheticWord.reflectionPlaceholder')}
                value={customReflection}
                onChange={(e) => setCustomReflection(e.target.value)}
                className="min-h-[100px] bg-white border-gray-300 text-gray-800"
              />
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex gap-3 justify-center flex-wrap">
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {t('propheticWord.close')}
            </Button>
            {customReflection.trim() && (
              <Button
                variant="outline"
                onClick={handleSaveReflection}
                disabled={isSaving}
                className="flex items-center gap-2 bg-white hover:bg-green-600 hover:text-white border-green-500 text-green-600 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Database className="w-4 h-4 animate-spin" />
                    {t('prayerStats.saving')}
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    {t('propheticWord.save')}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 