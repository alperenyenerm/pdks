import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import type { AttendanceType, ShiftType, MagicPassLog } from '../../types';
import { fetchMagicPassLogsFromApi, pushMagicPassLogToApi } from '../../utils/apiClient';
import {
  Moon,
  Sun,
  Sparkles,
  Cpu,
  RefreshCw,
  Clock,
  Send,
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
  const [magicLogs, setMagicLogs] = useState<MagicPassLog[]>([]);
  const [loadingMagic, setLoadingMagic] = useState(false);
  const [simWorkerCode, setSimWorkerCode] = useState(workers[0]?.code || 'W-001');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadMagicLogs = async () => {
    setLoadingMagic(true);
    const logs = await fetchMagicPassLogsFromApi();
    setMagicLogs(logs);
    setLoadingMagic(false);
  };

  useEffect(() => {
    loadMagicLogs();
    const interval = setInterval(loadMagicLogs, 15000);
    return () => clearInterval(interval);
  }, []);

  const todayStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-10`; // Target day

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

  const handleSimulateMagicPassPush = async () => {
    if (!simWorkerCode) return;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const res = await pushMagicPassLogToApi({
      device_id: 'MAGICPASS_PRO_01',
      worker_code: simWorkerCode,
      timestamp: nowStr,
      event_state: 'IN',
    });
    if (res.success) {
      notify('MagicPass Test Verisi Gönderildi', `Personel (${simWorkerCode}) cihaz okuması simüle edildi.`, 'success');
      loadMagicLogs();
    } else {
      notify('Hata', 'MagicPass simülasyonu başarısız.', 'error');
    }
  };

  const handleApplyLogToAttendance = (log: MagicPassLog) => {
    const worker = workers.find((w) => w.code === log.workerCode || w.id === log.workerCode);
    if (!worker) {
      notify('Eşleşme Bulunamadı', `Personel kodu (${log.workerCode}) sistemde kayıtlı değil.`, 'error');
      return;
    }

    const logDate = log.timestamp.split(' ')[0] || todayStr;
    const logTime = log.timestamp.split(' ')[1]?.substring(0, 5) || '08:00';

    setAttendanceRecord({
      workerId: worker.id,
      date: logDate,
      type: 'FULL',
      overtimeHours: 0,
      checkInTime: logTime,
      checkOutTime: '18:00',
    });

    notify('Puantaja Dönüştürüldü', `${worker.firstName} ${worker.lastName} giriş saati (${logTime}) puantaja işlendi.`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Kiosk Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span>HIZLI VARDİYA & MAGICPASS TERMINALİ</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              YNR Makine Atölye Dokunmatik Giriş & Cihaz Kiosk
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Personel dokunmatik paneli ve MagicPass parmak izi/kartlı geçiş cihaz canlı entegrasyonu.
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

      {/* MagicPass Hardware Integration Card */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
              <Cpu className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                MagicPass Biyometrik Cihaz Entegrasyon Servisi
              </h3>
              <p className="text-[11px] text-slate-400">
                MagicPass / ZK-TECO cihazlarından gelen canlı parmak izi ve kart okumaları
              </p>
            </div>
          </div>

          <button
            onClick={loadMagicLogs}
            disabled={loadingMagic}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loadingMagic ? 'animate-spin' : ''}`} />
            <span>Cihaz Verilerini Yenile</span>
          </button>
        </div>

        {/* Webhook Connection Guide */}
        <div className="bg-slate-950 border border-slate-800/80 p-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Cihaz Push (Webhook) URL:</span>
            <code className="text-amber-400 bg-slate-900 px-2 py-1 rounded font-mono text-[11px] select-all border border-slate-800">
              http://pdks.ynrmakine.com/api.php?action=magicpass_push
            </code>
          </div>

          {/* Test Simulator */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <select
              value={simWorkerCode}
              onChange={(e) => setSimWorkerCode(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
            >
              {workers.map((w) => (
                <option key={w.id} value={w.code}>
                  {w.code} - {w.firstName} {w.lastName}
                </option>
              ))}
            </select>
            <button
              onClick={handleSimulateMagicPassPush}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition flex items-center space-x-1 whitespace-nowrap"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Test Kartı Bas</span>
            </button>
          </div>
        </div>

        {/* Live MagicPass Log Table */}
        <div className="overflow-x-auto max-h-48 overflow-y-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <th className="py-2 px-3">Cihaz</th>
                <th className="py-2 px-3">Personel Kodu / Adı</th>
                <th className="py-2 px-3">Tarih & Saat</th>
                <th className="py-2 px-3 text-center">Durum</th>
                <th className="py-2 px-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {magicLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-500 text-xs">
                    Henüz cihaz kaydı bulunamadı. Cihazınızı tanımlayın veya test kartı basın.
                  </td>
                </tr>
              ) : (
                magicLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 text-indigo-400 font-bold">{log.deviceId}</td>
                    <td className="py-2 px-3 text-white font-bold">{log.workerName}</td>
                    <td className="py-2 px-3 text-slate-400">{log.timestamp}</td>
                    <td className="py-2 px-3 text-center">
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                        {log.eventState === 'IN' ? 'GİRİŞ' : 'ÇIKIŞ'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => handleApplyLogToAttendance(log)}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2.5 py-1 rounded text-[10px] transition"
                      >
                        Puantaja İşle
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-400" />
                      Giriş Saati:
                    </span>
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
