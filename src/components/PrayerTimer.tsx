import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Play, Pause, Square, X } from 'lucide-react';

interface PrayerTimerProps {
  regionName: string;
  onFinishPrayer: (duration: number) => void;
  onClose: () => void;
}

export const PrayerTimer: React.FC<PrayerTimerProps> = ({ 
  regionName, 
  onFinishPrayer, 
  onClose 
}) => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Formatador de tempo (00:00:00)
  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Iniciar cronômetro
  const handleStart = () => {
    console.log(`⏱️ Iniciando cronômetro para oração por ${regionName}`);
    setIsActive(true);
    setIsPaused(false);
  };

  // Pausar cronômetro
  const handlePause = () => {
    console.log('⏸️ Pausando cronômetro');
    setIsActive(false);
    setIsPaused(true);
  };

  // Retomar cronômetro
  const handleResume = () => {
    console.log('▶️ Retomando cronômetro');
    setIsActive(true);
    setIsPaused(false);
  };

  // Finalizar oração
  const handleFinish = () => {
    console.log(`⏹️ Finalizando oração. Tempo total: ${formatTime(seconds)} (${seconds} segundos)`);
    setIsActive(false);
    onFinishPrayer(seconds);
  };

  // Cancelar oração
  const handleCancel = () => {
    // Se já começou a orar, confirmar antes de cancelar
    if (seconds > 0) {
      if (window.confirm(`Tem certeza que deseja cancelar a oração por ${regionName}? O tempo registrado será perdido.`)) {
        console.log('❌ Cancelando oração após confirmação');
        setIsActive(false);
        setSeconds(0);
        onClose();
      }
    } else {
      // Se ainda não começou, cancelar direto
      console.log('❌ Cancelando oração (ainda não iniciada)');
      setIsActive(false);
      setSeconds(0);
      onClose();
    }
  };

  // Effect do cronômetro
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);

  return (
    <div className="fixed top-4 left-4 right-4 md:right-auto md:w-80 z-50">
      <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-2 border-blue-200 rounded-xl">
        <CardContent className="p-4 md:p-6">
          {/* Header com botão fechar */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🙏</span>
                </div>
                <h3 className="font-semibold text-gray-800 text-sm md:text-base">Sessão de Oração</h3>
              </div>
              <p className="text-lg md:text-xl font-bold text-blue-600 ml-10 md:ml-0 md:text-center">
                {regionName}
              </p>
            </div>
            <Button 
              onClick={handleCancel}
              variant="ghost"
              size="sm"
              className="p-2 h-auto w-auto text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Cronômetro */}
          <div className="text-center mb-6">
            {/* Display do tempo com design mais moderno */}
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 md:p-8 border-2 border-gray-200 shadow-inner">
                <div className="text-4xl md:text-5xl font-mono font-bold text-gray-800 mb-2 tracking-wider">
                  {formatTime(seconds)}
                </div>
                {isActive && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Status da oração */}
            <div className="mt-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                {!isActive && !isPaused && '⏸️ Pronto para começar'}
                {isActive && seconds < 60 && '🌱 Começando a orar...'}
                {isActive && seconds >= 60 && seconds < 300 && '🔥 Orando em profundidade...'}
                {isActive && seconds >= 300 && '⚡ Intercessão intensa!'}
                {isPaused && '⏸️ Pausa na oração'}
              </div>
            </div>
          </div>

          {/* Controles */}
          <div className="space-y-3">
            {/* Botões principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {!isActive && !isPaused && (
                <Button 
                  onClick={handleStart}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 py-3 md:py-2"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Iniciar Oração
                </Button>
              )}

              {isActive && (
                <>
                  <Button
                    onClick={handlePause}
                    variant="outline"
                    className="w-full bg-white border-2 border-orange-400 text-orange-600 hover:bg-orange-600 hover:text-white hover:border-orange-600 py-3 md:py-2 font-semibold transition-all duration-200"
                    size="lg"
                  >
                    <Pause className="w-5 h-5 mr-2" />
                    Pausar
                  </Button>
                  <Button
                    onClick={handleFinish}
                    className="w-full bg-gradient-to-r from-ios-blue to-ios-indigo hover:from-ios-blue/90 hover:to-ios-indigo/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 py-3 md:py-2 font-semibold"
                    size="lg"
                  >
                    <Square className="w-5 h-5 mr-2" />
                    Finalizar
                  </Button>
                </>
              )}

              {isPaused && (
                <>
                  <Button
                    onClick={handleResume}
                    className="w-full bg-gradient-to-r from-ios-green to-green-600 hover:from-ios-green/90 hover:to-green-600/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 py-3 md:py-2 font-semibold"
                    size="lg"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Continuar
                  </Button>
                  <Button
                    onClick={handleFinish}
                    className="w-full bg-gradient-to-r from-ios-blue to-ios-indigo hover:from-ios-blue/90 hover:to-ios-indigo/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 py-3 md:py-2 font-semibold"
                    size="lg"
                  >
                    <Square className="w-5 h-5 mr-2" />
                    Finalizar
                  </Button>
                </>
              )}
            </div>

            {/* Botão cancelar sempre visível */}
            <Button
              onClick={handleCancel}
              variant="outline"
              size="lg"
              className="w-full bg-white text-red-600 hover:text-white hover:bg-red-600 border-2 border-red-300 hover:border-red-600 py-3 md:py-2 transition-all duration-200 font-semibold"
            >
              <X className="w-4 h-4 mr-2" />
              {seconds > 0 ? 'Cancelar Oração' : 'Fechar'}
            </Button>
          </div>

          {/* Dicas e sugestões */}
          {!isActive && !isPaused && (
            <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
              <div className="text-xs text-center text-blue-600 font-medium">
                💡 Dica: Comece com 2-5 minutos de oração focada
              </div>
            </div>
          )}
          
          {seconds > 0 && seconds < 120 && isActive && (
            <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
              <div className="text-xs text-center text-green-600 font-medium">
                🌱 Continue orando... Tempo sugerido: pelo menos 2 minutos
              </div>
            </div>
          )}
          
          {seconds >= 120 && seconds < 300 && isActive && (
            <div className="mt-4 p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-100">
              <div className="text-xs text-center text-orange-600 font-medium">
                🔥 Excelente! Você está em intercessão profunda
              </div>
            </div>
          )}
          
          {seconds >= 300 && isActive && (
            <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
              <div className="text-xs text-center text-purple-600 font-medium">
                ⚡ Poderoso! Intercessão de alto nível
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 