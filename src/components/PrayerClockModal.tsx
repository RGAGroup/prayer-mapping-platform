/**
 * PRAYER CLOCK MODAL
 * Modal para criar/editar compromissos de oração
 */

import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import {
  createPrayerClock,
  getClockCoverage24h,
  getEmptySlots,
  formatTime,
  getDayName,
  type ClockCoverage,
  type EmptySlot,
} from '@/services/prayerClockService';

interface PrayerClockModalProps {
  isOpen: boolean;
  onClose: () => void;
  regionName: string;
  regionType: 'continent' | 'country' | 'state' | 'city' | 'neighborhood';
  regionCode?: string;
  onSuccess?: () => void;
}

export const PrayerClockModal: React.FC<PrayerClockModalProps> = ({
  isOpen,
  onClose,
  regionName,
  regionType,
  regionCode,
  onSuccess,
}) => {
  const { t } = useTranslation();
  // Estados do formulário
  const [isRecurring, setIsRecurring] = useState(true);
  const [dayOfWeek, setDayOfWeek] = useState<number>(1); // Segunda-feira
  const [specificDate, setSpecificDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [notifyBefore, setNotifyBefore] = useState(15);
  
  // Estados de análise
  const [coverage, setCoverage] = useState<ClockCoverage[]>([]);
  const [emptySlots, setEmptySlots] = useState<EmptySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Carregar cobertura quando mudar o dia
  useEffect(() => {
    if (isOpen && isRecurring) {
      loadCoverage();
    }
  }, [isOpen, dayOfWeek, isRecurring]);

  const loadCoverage = async () => {
    setLoading(true);
    const coverageData = await getClockCoverage24h(regionName, regionType, dayOfWeek);
    const emptySlotsData = await getEmptySlots(regionName, regionType, dayOfWeek);
    setCoverage(coverageData);
    setEmptySlots(emptySlotsData);
    setLoading(false);
  };

  const handleSubmit = async () => {
    setSaving(true);

    const result = await createPrayerClock({
      region_name: regionName,
      region_type: regionType,
      region_code: regionCode,
      day_of_week: isRecurring ? dayOfWeek : undefined,
      specific_date: !isRecurring ? specificDate : undefined,
      start_time: `${startTime}:00`,
      duration_minutes: durationMinutes,
      is_recurring: isRecurring,
      notify_before_minutes: notifyBefore,
    });

    setSaving(false);

    if (result) {
      alert(t('prayerClock.createSuccess'));
      if (onSuccess) onSuccess();
      onClose();
    } else {
      alert(t('prayerClock.createError'));
    }
  };

  // Obter status do horário selecionado
  const getSelectedSlotStatus = () => {
    const hour = parseInt(startTime.split(':')[0]);
    const slot = coverage.find(c => c.hour_slot === hour);
    return slot;
  };

  const selectedSlot = getSelectedSlotStatus();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-ios-dark-bg/60 backdrop-blur-sm z-50 animate-ios-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4">
        <Card className="w-full max-w-2xl bg-white/95 dark:bg-ios-dark-bg2/95 backdrop-blur-ios rounded-ios-xl sm:rounded-ios-2xl shadow-ios-2xl animate-ios-slide-up max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-ios-blue to-ios-indigo p-4 sm:p-6 rounded-t-ios-xl sm:rounded-t-ios-2xl">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                  <span className="truncate">{t('prayerClock.createTitle')}</span>
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
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Tipo de Agendamento */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-900 dark:text-ios-dark-text mb-2 sm:mb-3">
                {t('prayerClock.scheduleType')}
              </label>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <button
                  onClick={() => setIsRecurring(true)}
                  className={`p-3 sm:p-4 rounded-ios-lg border-2 transition-all ${
                    isRecurring
                      ? 'border-ios-blue bg-ios-blue/10 text-ios-blue'
                      : 'border-ios-gray5 dark:border-ios-dark-bg4 text-gray-600 dark:text-ios-dark-text3'
                  }`}
                >
                  <div className="font-semibold text-sm sm:text-base">{t('prayerClock.recurring')}</div>
                  <div className="text-xs mt-1">{t('prayerClock.recurringDesc')}</div>
                </button>
                <button
                  onClick={() => setIsRecurring(false)}
                  className={`p-3 sm:p-4 rounded-ios-lg border-2 transition-all ${
                    !isRecurring
                      ? 'border-ios-blue bg-ios-blue/10 text-ios-blue'
                      : 'border-ios-gray5 dark:border-ios-dark-bg4 text-gray-600 dark:text-ios-dark-text3'
                  }`}
                >
                  <div className="font-semibold text-sm sm:text-base">{t('prayerClock.oneTime')}</div>
                  <div className="text-xs mt-1">{t('prayerClock.oneTimeDesc')}</div>
                </button>
              </div>
            </div>

            {/* Dia da Semana ou Data Específica */}
            {isRecurring ? (
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-900 dark:text-ios-dark-text mb-2 sm:mb-3">
                  {t('prayerClock.dayOfWeek')}
                </label>
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => (
                    <button
                      key={index}
                      onClick={() => setDayOfWeek(index)}
                      className={`p-2 sm:p-3 rounded-ios-lg text-xs sm:text-sm font-semibold transition-all ${
                        dayOfWeek === index
                          ? 'bg-ios-blue text-white'
                          : 'bg-ios-gray6 dark:bg-ios-dark-bg3 text-gray-600 dark:text-ios-dark-text3'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-ios-gray dark:text-ios-dark-text3 mt-2">
                  Selecionado: {getDayName(dayOfWeek)}
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-ios-dark-text mb-3">
                  {t('prayerClock.specificDate')}
                </label>
                <input
                  type="date"
                  value={specificDate}
                  onChange={(e) => setSpecificDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 rounded-ios-lg border border-ios-gray5 dark:border-ios-dark-bg4 bg-white dark:bg-ios-dark-bg3 text-gray-900 dark:text-ios-dark-text"
                />
              </div>
            )}

            {/* Horário */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-ios-dark-text mb-3">
                {t('prayerClock.startTime')}
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-3 rounded-ios-lg border border-ios-gray5 dark:border-ios-dark-bg4 bg-white dark:bg-ios-dark-bg3 text-gray-900 dark:text-ios-dark-text"
              />
            </div>

            {/* Duração */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-ios-dark-text mb-3">
                {t('prayerClock.duration')}
              </label>
              <div className="grid grid-cols-4 gap-3">
                {[15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setDurationMinutes(mins)}
                    className={`p-3 rounded-ios-lg font-semibold transition-all ${
                      durationMinutes === mins
                        ? 'bg-ios-green text-white'
                        : 'bg-ios-gray6 dark:bg-ios-dark-bg3 text-gray-600 dark:text-ios-dark-text3'
                    }`}
                  >
                    {t('prayerClock.durationMinutes', { count: mins })}
                  </button>
                ))}
              </div>
            </div>

            {/* Status do Horário */}
            {isRecurring && selectedSlot && (
              <div className={`p-4 rounded-ios-lg border-2 ${
                selectedSlot.is_covered
                  ? 'border-ios-green bg-ios-green/10'
                  : 'border-ios-orange bg-ios-orange/10'
              }`}>
                <div className="flex items-start gap-3">
                  <AlertCircle className={`w-5 h-5 mt-0.5 ${
                    selectedSlot.is_covered ? 'text-ios-green' : 'text-ios-orange'
                  }`} />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-ios-dark-text">
                      {selectedSlot.is_covered ? t('prayerClock.slotCovered') : t('prayerClock.slotEmpty')}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-ios-dark-text3 mt-1">
                      {t('prayerClock.slotIntercessors', { count: selectedSlot.total_intercessors })} • {t('prayerClock.durationMinutes', { count: selectedSlot.total_duration_minutes })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Horários Vazios (Sugestões) */}
            {isRecurring && emptySlots.length > 0 && (
              <div className="p-4 rounded-ios-lg bg-ios-red/10 border border-ios-red/20">
                <div className="font-semibold text-gray-900 dark:text-ios-dark-text mb-2">
                  {t('prayerClock.emptySlots')}
                </div>
                <div className="flex flex-wrap gap-2">
                  {emptySlots.slice(0, 6).map((slot) => (
                    <Badge
                      key={slot.hour_slot}
                      variant="outline"
                      className="cursor-pointer hover:bg-ios-red/20"
                      onClick={() => setStartTime(`${slot.hour_slot.toString().padStart(2, '0')}:00`)}
                    >
                      {slot.hour_slot}h
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-ios-gray6/50 dark:bg-ios-dark-bg3/50 backdrop-blur-ios p-6 rounded-b-ios-2xl border-t border-ios-gray5/20 dark:border-ios-dark-bg4/20">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 rounded-ios-lg"
                disabled={saving}
              >
                {t('prayerClock.cancel')}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={saving || (!isRecurring && !specificDate)}
                className="flex-1 bg-gradient-to-r from-ios-blue to-ios-indigo text-white rounded-ios-lg"
              >
                {saving ? t('prayerClock.creating') : t('prayerClock.create')}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

