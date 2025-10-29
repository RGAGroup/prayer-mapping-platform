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
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
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
  const { user } = useAuth(); // Obter usuário atual
  const { t } = useTranslation();
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
    if (confirm(t('prayerClock.deleteConfirm'))) {
      const success = await deactivatePrayerClock(id);
      if (success) {
        alert(t('prayerClock.deleteSuccess'));
        loadData();
      } else {
        alert(t('prayerClock.deleteError'));
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
      <div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4">
        <Card className="w-full max-w-4xl bg-white/95 dark:bg-ios-dark-bg2/95 backdrop-blur-ios rounded-ios-xl sm:rounded-ios-2xl shadow-ios-2xl animate-ios-slide-up max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-ios-blue to-ios-indigo p-4 sm:p-6 rounded-t-ios-xl sm:rounded-t-ios-2xl flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                  <span className="truncate">{t('prayerClock.title')}</span>
                </h2>
                <p className="text-ios-gray6 mt-1 text-xs sm:text-sm truncate">
                  {regionName} • {regionType === 'country' ? t('prayerClock.country') : regionType === 'state' ? t('prayerClock.state') : t('prayerClock.city')}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-ios-md flex-shrink-0 ml-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Estatísticas de Cobertura */}
            <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-ios-lg p-2 sm:p-4">
                <div className="text-ios-gray6 text-xs sm:text-sm">{t('prayerClock.coverage')}</div>
                <div className="text-lg sm:text-2xl font-bold text-white">{coveragePercentage}%</div>
                <div className="text-xs text-ios-gray6">{coveredHours}/24h</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-ios-lg p-2 sm:p-4">
                <div className="text-ios-gray6 text-xs sm:text-sm">{t('prayerClock.intercessors')}</div>
                <div className="text-lg sm:text-2xl font-bold text-white">
                  {coverage.reduce((sum, c) => sum + c.total_intercessors, 0)}
                </div>
                <div className="text-xs text-ios-gray6">{t('prayerClock.total')}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-ios-lg p-2 sm:p-4">
                <div className="text-ios-gray6 text-xs sm:text-sm">{t('prayerClock.commitments')}</div>
                <div className="text-lg sm:text-2xl font-bold text-white">{clocks.length}</div>
                <div className="text-xs text-ios-gray6">{t('prayerClock.active')}</div>
              </div>
            </div>
          </div>

          {/* Seletor de Dia */}
          <div className="p-3 sm:p-4 border-b border-ios-gray5/20 dark:border-ios-dark-bg4/20 flex-shrink-0">
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-ios-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                    selectedDay === day
                      ? 'bg-ios-blue text-white shadow-ios-sm'
                      : 'bg-ios-gray6 dark:bg-ios-dark-bg3 text-gray-600 dark:text-ios-dark-text3'
                  }`}
                >
                  {getDayShortName(day)}
                </button>
              ))}
            </div>
          </div>

          {/* Content - Lista de Horários */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ios-blue mx-auto mb-4"></div>
                <p className="text-ios-gray dark:text-ios-dark-text3 text-sm">{t('prayerClock.loading')}</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {/* Botão Criar Compromisso */}
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full bg-gradient-to-r from-ios-green to-ios-teal text-white rounded-ios-lg py-4 sm:py-6 text-sm sm:text-base font-semibold shadow-ios-lg hover:shadow-ios-xl transition-all"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  {t('prayerClock.createNew')}
                </Button>

                {/* Lista de Horários (0-23h) */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 dark:text-ios-dark-text mb-2 sm:mb-3 text-sm sm:text-base">
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
                        className={`p-3 sm:p-4 rounded-ios-lg border-2 transition-all ${
                          slot.is_covered
                            ? 'border-ios-green/30 bg-ios-green/5'
                            : 'border-ios-red/30 bg-ios-red/5'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-ios-md flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0 ${
                              slot.is_covered
                                ? 'bg-ios-green text-white'
                                : 'bg-ios-red text-white'
                            }`}>
                              {slot.hour_slot}h
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 dark:text-ios-dark-text text-sm sm:text-base">
                                {slot.is_covered ? t('prayerClock.covered') : t('prayerClock.empty')}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-600 dark:text-ios-dark-text3 truncate">
                                {t('prayerClock.intercessorCount', { count: slot.total_intercessors })} • {t('prayerClock.minutes', { count: slot.total_duration_minutes })}
                              </div>
                            </div>
                          </div>

                          {slot.is_covered && (
                            <Badge variant="outline" className="bg-white/50 flex-shrink-0 text-xs">
                              <Users className="w-3 h-3 mr-1" />
                              {slot.total_intercessors}
                            </Badge>
                          )}
                        </div>

                        {/* Compromissos neste horário */}
                        {slotClocks.length > 0 && (
                          <div className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2">
                            {slotClocks.map((clock) => {
                              const isOwner = user?.id === clock.user_id;

                              return (
                                <div
                                  key={clock.id}
                                  className="flex items-center justify-between gap-2 p-2 sm:p-3 bg-white/50 dark:bg-ios-dark-bg3/50 rounded-ios-md"
                                >
                                  <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-ios-blue flex-shrink-0" />
                                    <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-ios-dark-text truncate">
                                      {formatTime(clock.start_time)} • {formatDuration(clock.duration_minutes)}
                                      {isOwner && <span className="ml-1 sm:ml-2 text-xs text-ios-blue">{t('prayerClock.yours')}</span>}
                                    </span>
                                  </div>
                                  {/* Botão deletar - apenas para o dono */}
                                  {isOwner && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDelete(clock.id)}
                                      className="text-ios-red hover:bg-ios-red/10 h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </Button>
                                  )}
                                </div>
                              );
                            })}
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

