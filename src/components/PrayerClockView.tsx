/**
 * PRAYER CLOCK VIEW
 * Visualização do Relógio de Oração 24/7
 * Modo: Lista de Horários
 */

import React, { useState, useEffect } from 'react';
import { X, Clock, Plus, Users, TrendingUp, AlertCircle, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PrayerClockModal } from './PrayerClockModal';
import {
  getRegionClocks,
  getClockCoverage24h,
  calculateCoveragePercentage,
  formatTime,
  getDayName,
  getDayShortName,
  formatDuration,
  deactivatePrayerClock,
  type PrayerClock,
  type ClockCoverage,
} from '@/services/prayerClockService';

interface PrayerClockViewProps {
  isOpen: boolean;
  onClose: () => void;
  regionName: string;
  regionType: 'continent' | 'country' | 'state' | 'city' | 'neighborhood';
  regionCode?: string;
}

export const PrayerClockView: React.FC<PrayerClockViewProps> = ({
  isOpen,
  onClose,
  regionName,
  regionType,
  regionCode,
}) => {
  const [clocks, setClocks] = useState<PrayerClock[]>([]);
  const [coverage, setCoverage] = useState<ClockCoverage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(1); // Segunda-feira

  useEffect(() => {
    if (isOpen) {
      console.log('📊 PrayerClockView aberto:', { regionName, regionType, selectedDay });
      loadData();
    }
  }, [isOpen, selectedDay]);

  const loadData = async () => {
    setLoading(true);
    console.log('🔄 Carregando dados do relógio...', { regionName, regionType, selectedDay });
    const [clocksData, coverageData] = await Promise.all([
      getRegionClocks(regionName, regionType),
      getClockCoverage24h(regionName, regionType, selectedDay),
    ]);
    console.log('✅ Dados carregados:', { clocks: clocksData.length, coverage: coverageData.length });
    setClocks(clocksData);
    setCoverage(coverageData);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este compromisso?')) {
      const success = await deactivatePrayerClock(id);
      if (success) {
        alert('✅ Compromisso removido com sucesso!');
        loadData();
      } else {
        alert('❌ Erro ao remover compromisso.');
      }
    }
  };

  const coveragePercentage = calculateCoveragePercentage(coverage);
  const coveredHours = coverage.filter(c => c.is_covered).length;

  // Filtrar compromissos do dia selecionado
  const dayClocks = clocks.filter(c => c.is_recurring && c.day_of_week === selectedDay);

  console.log('🔍 PrayerClockView render:', { isOpen, regionName, regionType });

  if (!isOpen) {
    console.log('❌ PrayerClockView: isOpen = false, retornando null');
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-ios-dark-bg/60 backdrop-blur-sm z-50 animate-ios-fade-in"
        onClick={(e) => {
          e.stopPropagation();
          console.log('🔴 Overlay clicado - fechando PrayerClockView');
          onClose();
        }}
      />
      
      {/* Modal Principal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-4xl bg-white/95 dark:bg-ios-dark-bg2/95 backdrop-blur-ios rounded-ios-2xl shadow-ios-2xl animate-ios-slide-up max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-ios-blue to-ios-indigo p-6 rounded-t-ios-2xl flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Clock className="w-6 h-6" />
                  Relógio de Oração 24/7
                </h2>
                <p className="text-ios-gray6 mt-1">
                  {regionName} • {regionType === 'country' ? 'País' : regionType === 'state' ? 'Estado' : 'Cidade'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-ios-md"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Estatísticas de Cobertura */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-ios-lg p-4">
                <div className="text-ios-gray6 text-sm">Cobertura</div>
                <div className="text-2xl font-bold text-white">{coveragePercentage}%</div>
                <div className="text-xs text-ios-gray6">{coveredHours}/24 horas</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-ios-lg p-4">
                <div className="text-ios-gray6 text-sm">Intercessores</div>
                <div className="text-2xl font-bold text-white">
                  {coverage.reduce((sum, c) => sum + c.total_intercessors, 0)}
                </div>
                <div className="text-xs text-ios-gray6">Total</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-ios-lg p-4">
                <div className="text-ios-gray6 text-sm">Compromissos</div>
                <div className="text-2xl font-bold text-white">{clocks.length}</div>
                <div className="text-xs text-ios-gray6">Ativos</div>
              </div>
            </div>
          </div>

          {/* Seletor de Dia */}
          <div className="p-4 border-b border-ios-gray5/20 dark:border-ios-dark-bg4/20 flex-shrink-0">
            <div className="flex gap-2 overflow-x-auto">
              {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2 rounded-ios-lg font-semibold whitespace-nowrap transition-all ${
                    selectedDay === day
                      ? 'bg-ios-blue text-white'
                      : 'bg-ios-gray6 dark:bg-ios-dark-bg3 text-gray-600 dark:text-ios-dark-text3'
                  }`}
                >
                  {getDayShortName(day)}
                </button>
              ))}
            </div>
          </div>

          {/* Content - Lista de Horários */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ios-blue mx-auto mb-4"></div>
                <p className="text-ios-gray dark:text-ios-dark-text3">Carregando...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Botão Criar Compromisso */}
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full bg-gradient-to-r from-ios-green to-ios-teal text-white rounded-ios-lg py-6 font-semibold shadow-ios-lg hover:shadow-ios-xl transition-all"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Criar Novo Compromisso
                </Button>

                {/* Lista de Horários (0-23h) */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 dark:text-ios-dark-text mb-3">
                    📅 {getDayName(selectedDay)}
                  </h3>
                  
                  {coverage.map((slot) => {
                    const slotClocks = dayClocks.filter(c => {
                      const hour = parseInt(c.start_time.split(':')[0]);
                      return hour === slot.hour_slot;
                    });

                    return (
                      <div
                        key={slot.hour_slot}
                        className={`p-4 rounded-ios-lg border-2 transition-all ${
                          slot.is_covered
                            ? 'border-ios-green/30 bg-ios-green/5'
                            : 'border-ios-red/30 bg-ios-red/5'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-ios-md flex items-center justify-center font-bold ${
                              slot.is_covered
                                ? 'bg-ios-green text-white'
                                : 'bg-ios-red text-white'
                            }`}>
                              {slot.hour_slot}h
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-ios-dark-text">
                                {slot.is_covered ? '✅ Coberto' : '❌ Vazio'}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-ios-dark-text3">
                                {slot.total_intercessors} intercessor(es) • {slot.total_duration_minutes}min
                              </div>
                            </div>
                          </div>

                          {slot.is_covered && (
                            <Badge variant="outline" className="bg-white/50">
                              <Users className="w-3 h-3 mr-1" />
                              {slot.total_intercessors}
                            </Badge>
                          )}
                        </div>

                        {/* Compromissos neste horário */}
                        {slotClocks.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {slotClocks.map((clock) => (
                              <div
                                key={clock.id}
                                className="flex items-center justify-between p-3 bg-white/50 dark:bg-ios-dark-bg3/50 rounded-ios-md"
                              >
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-ios-blue" />
                                  <span className="text-sm font-medium text-gray-900 dark:text-ios-dark-text">
                                    {formatTime(clock.start_time)} • {formatDuration(clock.duration_minutes)}
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(clock.id)}
                                  className="text-ios-red hover:bg-ios-red/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Modal de Criar Compromisso */}
      {showCreateModal && (
        <PrayerClockModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          regionName={regionName}
          regionType={regionType}
          regionCode={regionCode}
          onSuccess={loadData}
        />
      )}
    </>
  );
};

