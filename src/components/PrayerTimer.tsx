import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Play, Pause, Square } from 'lucide-react';

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
    console.log('❌ Cancelando oração');
    setIsActive(false);
    setSeconds(0);
    onClose();
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
    <div className="fixed top-4 left-4 z-50">
      <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-2 border-blue-200">
        <CardContent className="p-4">
          {/* Header */}
          <div className="text-center mb-4">
            <h3 className="font-semibold text-gray-800">🙏 Orando por</h3>
            <p className="text-lg font-bold text-blue-600">{regionName}</p>
          </div>

          {/* Cronômetro */}
          <div className="text-center mb-4">
            <div className="text-3xl font-mono font-bold text-gray-800 mb-2">
              {formatTime(seconds)}
            </div>
            <div className="text-sm text-gray-500">
              {seconds < 60 ? 'Começando a orar...' : 
               seconds < 300 ? 'Orando em profundidade...' : 
               'Intercessão intensa!'}
            </div>
          </div>

          {/* Controles */}
          <div className="flex gap-2">
            {!isActive && !isPaused && (
              <Button 
                onClick={handleStart}
                className="flex-1 bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <Play className="w-4 h-4 mr-1" />
                Iniciar
              </Button>
            )}

            {isActive && (
              <Button 
                onClick={handlePause}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                <Pause className="w-4 h-4 mr-1" />
                Pausar
              </Button>
            )}

            {isPaused && (
              <Button 
                onClick={handleResume}
                className="flex-1 bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <Play className="w-4 h-4 mr-1" />
                Continuar
              </Button>
            )}

            {(isActive || isPaused) && (
              <Button 
                onClick={handleFinish}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                <Square className="w-4 h-4 mr-1" />
                Finalizar
              </Button>
            )}

            <Button 
              onClick={handleCancel}
              variant="ghost"
              size="sm"
              className="px-2"
            >
              ✕
            </Button>
          </div>

          {/* Tempo mínimo sugerido */}
          {seconds > 0 && seconds < 120 && (
            <div className="mt-2 text-xs text-center text-gray-500">
              💡 Sugestão: Ore por pelo menos 2 minutos
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 