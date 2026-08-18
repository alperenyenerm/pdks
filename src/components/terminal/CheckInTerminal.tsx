import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import type { AttendanceType, ShiftType } from '../../types';
import {
  Moon,
  Sun,
  Sparkles,
} from 'lucide-react';

export const CheckInTerminal: React.FC = () => {
  const {
    workers,
    attendance,
    selectedYear,
    selectedMonth,
    setAttendanceRecord,
    notify,
  } = useApp();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedShift, setSelectedShift] = useState<ShiftType>('DAY');
  const [filterDept, setFilterDept] = useState('ALL');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-10`; // Current target day

  const activeWorkers = workers.filter((w) => {
    if (w.status !== 'active') return false;
    return filterDept === 'ALL' || w.department === filterDept;
  });

  const departments = Array.from(new Set(workers.map((w) => w.department).filter(Boolean)));

  const handleQuickCheckIn = (
    workerId: string,
    workerName: string,
    type: AttendanceType,
    overtimeHours = 0,
    shift: ShiftType = 'DAY'
  ) => {
    setAttendanceRecord({
      workerId,
      date: todayStr,
      type,
      overtimeHours,
      shift,
      checkInTime: currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    });

    if (type === 'FULL') {
      notify('Giriş Başarılı', `${workerName} gündüz vardiyasına giriş yaptı.`, 'success');
    } else if (type === 'ABSENT') {
      notify('Devamsız İşaretlendi', `${workerName} gelmedi olarak kaydedildi.`, 'warning');
    } else {
      notify('Puantaj Güncellendi', `${workerName} kaydı yenilendi.`, 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Kiosk Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span>HIZLI VARDİYA & GİRİŞ TERMINALİ</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              YNR Makine Atölye Dokunmatik Giriş Kiosk
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Vardiya başı ve sonu personellerin tek tıkla devam ve mesai saatlerini kaydetme paneli.
            </p>
          </div>

          {/* Digital Clock */}
          <div className="bg-slate-950/80 border border-amber-500/30 px-6 py-3 rounded-2xl shadow-inner text-center">
            <p className="text-[10px] text-amber-400/80 font-mono uppercase tracking-widest">
              CANLI ATÖLYE SAATİ
            </p>
            <p className="text-2xl font-bold font-mono text-amber-400 tracking-wider">
              {currentTime.toLocaleTimeString('tr-TR')}
            </p>
          </div>
        </div>
      </div>

      {/* Terminal Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedShift('SHIFT_1')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              selectedShift === 'SHIFT_1' || selectedShift === 'DAY'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-400" />
            <span>1. Vardiya (Sabah: 08:00 - 16:00)</span>
          </button>

          <button
            onClick={() => setSelectedShift('SHIFT_2')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              selectedShift === 'SHIFT_2'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Sun className="w-4 h-4 text-blue-300" />
            <span>2. Vardiya (Akşam: 16:00 - 24:00)</span>
          </button>

          <button
            onClick={() => setSelectedShift('SHIFT_3')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              selectedShift === 'SHIFT_3' || selectedShift === 'NIGHT'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Moon className="w-4 h-4 text-amber-400" />
            <span>3. Vardiya (Gece: 00:00 - 08:00 %20 Primli)</span>
          </button>
        </div>

        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
        >
          <option value="ALL">Tüm Departmanlar</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Touch Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {activeWorkers.map((worker) => {
          const rec = attendance.find(
            (r) =>
              r.workerId === worker.id &&
              r.date === todayStr
          );

          const isCheckedIn = rec?.type === 'FULL' || rec?.type === 'HALF';
          const isAbsent = rec?.type === 'ABSENT';

          return (
            <div
              key={worker.id}
              className={`bg-slate-900 border rounded-2xl p-4 shadow-xl flex flex-col justify-between transition-all ${
                isCheckedIn
                  ? 'border-emerald-500/40 bg-emerald-950/10'
                  : isAbsent
                  ? 'border-rose-900/40 bg-rose-950/10'
                  : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${
                        worker.avatarColor || 'from-amber-500 to-amber-700'
                      } text-white font-bold flex items-center justify-center text-xs font-mono shadow`}
                    >
                      {worker.firstName.charAt(0)}
                      {worker.lastName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight">
                        {worker.firstName} {worker.lastName}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono">{worker.code}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isCheckedIn
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isAbsent
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {isCheckedIn ? 'VARDİYADA' : isAbsent ? 'GELMEDİ' : 'BEKLİYOR'}
                  </span>
                </div>

                <p className="text-xs text-amber-300/80 mb-3">{worker.role}</p>

                {rec && rec.checkInTime && (
                  <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800 mb-3 flex items-center justify-between">
                    <span>Giriş Saati:</span>
                    <span className="font-mono font-bold text-emerald-400">{rec.checkInTime}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons for Kiosk */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() =>
                      handleQuickCheckIn(
                        worker.id,
                        `${worker.firstName} ${worker.lastName}`,
                        'FULL',
                        0,
                        selectedShift
                      )
                    }
                    className="py-2 px-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow"
                  >
                    Giriş Yap
                  </button>

                  <button
                    onClick={() =>
                      handleQuickCheckIn(
                        worker.id,
                        `${worker.firstName} ${worker.lastName}`,
                        'FULL',
                        2,
                        selectedShift
                      )
                    }
                    className="py-2 px-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition shadow"
                  >
                    +2s Mesai
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() =>
                      handleQuickCheckIn(
                        worker.id,
                        `${worker.firstName} ${worker.lastName}`,
                        'LEAVE',
                        0,
                        selectedShift
                      )
                    }
                    className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold text-[11px] rounded-xl transition border border-slate-700"
                  >
                    İzinli
                  </button>

                  <button
                    onClick={() =>
                      handleQuickCheckIn(
                        worker.id,
                        `${worker.firstName} ${worker.lastName}`,
                        'ABSENT',
                        0,
                        selectedShift
                      )
                    }
                    className="py-1.5 px-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-[11px] rounded-xl transition border border-rose-500/20"
                  >
                    Gelmedi
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
