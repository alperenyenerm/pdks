import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getDaysInMonth, getMonthNameTr } from '../../utils/calculations';
import type { ShiftType, AttendanceType } from '../../types';
import { RefreshCw, Zap, X } from 'lucide-react';

interface ShiftRotationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type RotationPattern = 'WEEKLY_1' | 'WEEKLY_2' | 'ROTATION_3_SHIFT' | 'FIXED_DAY' | 'FIXED_NIGHT';

export const ShiftRotationModal: React.FC<ShiftRotationModalProps> = ({ isOpen, onClose }) => {
  const { workers, selectedYear, selectedMonth, bulkSetAttendance, notify } = useApp();

  const [pattern, setPattern] = useState<RotationPattern>('ROTATION_3_SHIFT');
  const [startShift, setStartShift] = useState<ShiftType>('SHIFT_1');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [sundayOption, setSundayOption] = useState<'LEAVE' | 'WORK_OVERTIME'>('LEAVE');

  if (!isOpen) return null;

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const activeWorkers = workers.filter((w) => w.status === 'active' && (selectedDept === 'ALL' || w.department === selectedDept));
  const departments = Array.from(new Set(workers.map((w) => w.department).filter(Boolean)));

  // Calculate Monday-based week index for the month
  // If the month starts mid-week (e.g. Wednesday), days before the 1st Monday return 0 (continue previous month shift).
  // The first Monday starts weekIndex 1, second Monday starts weekIndex 2, etc.
  const getMondayBasedWeekIndex = (year: number, month: number, day: number): number => {
    const day1OfWeek = new Date(year, month - 1, 1).getDay(); // 0: Sun, 1: Mon...
    let firstMondayDay = 1;
    if (day1OfWeek === 1) {
      firstMondayDay = 1;
    } else if (day1OfWeek === 0) {
      firstMondayDay = 2;
    } else {
      firstMondayDay = 9 - day1OfWeek;
    }

    if (day < firstMondayDay) {
      return 0; // Pre-first Monday days continue previous month shift
    }

    return 1 + Math.floor((day - firstMondayDay) / 7);
  };

  // Apply Rotation Engine
  const handleApplyRotation = () => {
    const recordsToApply: {
      workerId: string;
      date: string;
      type: AttendanceType;
      overtimeHours: number;
      shift: ShiftType;
    }[] = [];

    activeWorkers.forEach((w, wIdx) => {
      // Offset start shift per worker group if weekly rotation is enabled for alternating teams
      const isAlternatingWorker = wIdx % 2 === 1;

      for (let day = 1; day <= daysInMonth; day++) {
        const dateObj = new Date(selectedYear, selectedMonth - 1, day);
        const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isSunday = dateObj.getDay() === 0;

        let dayShift: ShiftType = startShift;
        let dayType: AttendanceType = 'FULL';
        let overtimeHrs = 0;

        // Calculate shift rotation by Monday-based week number
        const weekIndex = getMondayBasedWeekIndex(selectedYear, selectedMonth, day);

        if (pattern === 'ROTATION_3_SHIFT') {
          // 3-Shift Rotation Engine (08-16 / 16-24 / 00-08)
          const shiftSeq: ShiftType[] = ['SHIFT_1', 'SHIFT_2', 'SHIFT_3'];
          const shiftIdx = (weekIndex + (wIdx % 3)) % 3;
          dayShift = shiftSeq[shiftIdx];
        } else if (pattern === 'WEEKLY_1') {
          // 1 Week Day / 1 Week Night
          const currentWeekShift: ShiftType = (weekIndex + (isAlternatingWorker ? 1 : 0)) % 2 === 0 ? startShift : (startShift === 'DAY' ? 'NIGHT' : 'DAY');
          dayShift = currentWeekShift;
        } else if (pattern === 'WEEKLY_2') {
          // 2 Weeks Day / 2 Weeks Night
          const currentWeekShift: ShiftType = Math.floor(weekIndex / 2) % 2 === 0 ? startShift : (startShift === 'DAY' ? 'NIGHT' : 'DAY');
          dayShift = currentWeekShift;
        } else if (pattern === 'FIXED_DAY') {
          dayShift = 'SHIFT_1';
        } else if (pattern === 'FIXED_NIGHT') {
          dayShift = 'SHIFT_3';
        }

        // Sunday Handling
        if (isSunday) {
          if (sundayOption === 'LEAVE') {
            dayType = 'LEAVE';
          } else {
            dayType = 'FULL';
            overtimeHrs = 4; // Sunday overtime
          }
        }

        recordsToApply.push({
          workerId: w.id,
          date: dateStr,
          type: dayType,
          overtimeHours: overtimeHrs,
          shift: dayShift,
        });
      }
    });

    bulkSetAttendance(recordsToApply);
    onClose();
    notify(
      'Haftalık Pazartesi Dönüşümlü Vardiya Oluşturuldu',
      `${getMonthNameTr(selectedMonth)} ${selectedYear} ayı için ilk Pazartesi gününden itibaren geçerli haftalık vardiya çizelgesi uygulandı.`,
      'success'
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Aylık Vardiya Dönüşü ve Otomatik Çizelge Planlayıcı
              </h3>
              <p className="text-xs text-slate-400">
                {getMonthNameTr(selectedMonth)} {selectedYear} ayı için 1 haftalık / 2 haftalık Gündüz-Gece vardiya rotasyonunu otomatik uygulayın.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          {/* Pattern Selection */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="font-bold text-slate-300 block">Vardiya Dönüşüm Tipi (Rotasyon Düzeni):</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'ROTATION_3_SHIFT', label: '3 Vardiyalı Dönüşüm', desc: '08:00-16:00 / 16:00-24:00 / 00:00-08:00' },
                { id: 'WEEKLY_1', label: '1 Haftalık Dönüşüm', desc: '1 Hafta Gündüz / 1 Hafta Gece' },
                { id: 'WEEKLY_2', label: '2 Haftalık Dönüşüm', desc: '2 Hafta Gündüz / 2 Hafta Gece' },
                { id: 'FIXED_DAY', label: 'Sabit 1. Vardiya', desc: 'Tüm Ay (08:00 - 16:00)' },
                { id: 'FIXED_NIGHT', label: 'Sabit 3. Vardiya (Gece)', desc: 'Tüm Ay (00:00 - 08:00 %20 Prim)' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPattern(p.id as RotationPattern)}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    pattern === p.id
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <p className="font-bold text-[11px]">{p.label}</p>
                  <p className="text-[9px] text-slate-400 mt-1">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Initial Shift */}
          <div className="space-y-1">
            <label className="font-bold text-slate-300 block">Ayın İlk Haftası Başlangıç Vardiyası:</label>
            <select
              value={startShift}
              onChange={(e) => setStartShift(e.target.value as ShiftType)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold"
            >
              <option value="SHIFT_1">☀️ 1. Vardiya (Sabah: 08:00 - 16:00)</option>
              <option value="SHIFT_2">🌆 2. Vardiya (Akşam: 16:00 - 24:00)</option>
              <option value="SHIFT_3">🌙 3. Vardiya (Gece: 00:00 - 08:00 %20 Primli)</option>
            </select>
          </div>

          {/* Target Department */}
          <div className="space-y-1">
            <label className="font-bold text-slate-300 block">Uygulanacak Departman / Kadro:</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold"
            >
              <option value="ALL">Tüm Aktif Kadro ({workers.filter((w) => w.status === 'active').length} Personel)</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d} Departmanı
                </option>
              ))}
            </select>
          </div>

          {/* Sunday Rule */}
          <div className="space-y-1 md:col-span-2">
            <label className="font-bold text-slate-300 block">Pazar Günleri (Hafta Sonu) Kuralı:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSundayOption('LEAVE')}
                className={`p-3 rounded-2xl border text-left transition ${
                  sundayOption === 'LEAVE'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                🏝️ Pazar Günlerini İzin / Tatil Yap (Varsayılan)
              </button>
              <button
                type="button"
                onClick={() => setSundayOption('WORK_OVERTIME')}
                className={`p-3 rounded-2xl border text-left transition ${
                  sundayOption === 'WORK_OVERTIME'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                ⚡ Pazar Günleri Nöbet / Mesaili Çalışma (2.0x Katsayı)
              </button>
            </div>
          </div>

        </div>

        {/* Info Box */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-300 flex items-center space-x-3">
          <Zap className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold text-white">📅 Kural Uyumlu Haftalık Vardiya Dönüşümü:</span> Ay hafta ortasında (örneğin Çarşamba) başlıyorsa, personel ayın **ilk Pazartesi gününe kadar** önceki aydan devreden mevcut vardiyasına devam eder. **Yeni vardiya rotasyonu her ayın İLK PAZARTESİ günü başlar** ve takip eden Pazartesi günlerinde devreder.
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
          <span className="text-slate-400">Dönem: <b>{getMonthNameTr(selectedMonth)} {selectedYear}</b> ({daysInMonth} Gün)</span>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
            >
              İptal
            </button>
            <button
              onClick={handleApplyRotation}
              className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center space-x-2 shadow-lg shadow-amber-500/20 hover:bg-amber-400"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Vardiya Çizelgesini Oluştur ve İşle</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
