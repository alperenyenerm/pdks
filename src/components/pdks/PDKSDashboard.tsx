import React from 'react';
import { 
  Users, LogIn, LogOut, Clock, AlertTriangle, 
  CheckCircle2, Activity, Fingerprint, Calendar
} from 'lucide-react';
import type { PDKSLog, PDKSDailyCalculated, Worker } from '../../types';

interface PDKSDashboardProps {
  workers: Worker[];
  logs: PDKSLog[];
  dailySummaries: PDKSDailyCalculated[];
  onNavigateToLogs: () => void;
  onNavigateToShifts: () => void;
  onNavigateToReports: () => void;
}

export const PDKSDashboard: React.FC<PDKSDashboardProps> = ({
  workers,
  logs,
  dailySummaries,
  onNavigateToLogs,
  onNavigateToShifts,
  onNavigateToReports
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate live numbers
  const activeWorkers = workers.filter(w => w.status === 'active');
  const todaySummaries = dailySummaries.filter(d => d.date === todayStr);

  // Inside facility workers count (last direction was IN)
  const workerLastDirections: Record<string, { direction: string; time: string }> = {};
  logs.forEach(log => {
    if (!workerLastDirections[log.workerId]) {
      workerLastDirections[log.workerId] = { direction: log.direction, time: log.timestamp };
    }
  });

  const currentlyInsideCount = Object.values(workerLastDirections).filter(d => d.direction === 'IN').length;
  const lateCount = todaySummaries.filter(s => s.lateMinutes > 0).length;
  const overtimeCount = todaySummaries.filter(s => s.overtimeMinutes > 0).length;
  const leaveCount = todaySummaries.filter(s => s.status === 'LEAVE').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            Canlı PDKS Devam Kontrol Paneli
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Perkotek Web PDKS Entegre Sistem</h1>
          <p className="text-blue-200/80 text-sm mt-1">
            Geçiş terminalleri, parmak izi, yüz tanıma logları ve otomatik vardiya/mesai takibi.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={onNavigateToLogs}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition shadow-lg flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Cihaz Logları
          </button>
          <button 
            onClick={onNavigateToReports}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition backdrop-blur-sm flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            PDKS Raporları
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/90 border border-slate-700/60 rounded-xl p-5 shadow-sm hover:border-blue-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">İçerideki Personel</span>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white">{currentlyInsideCount}</span>
            <span className="text-xs text-slate-400 ml-2">/ {activeWorkers.length} Aktif Personel</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Tesis içi canlı geçiş durumu</span>
          </div>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/60 rounded-xl p-5 shadow-sm hover:border-amber-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Geç Kalanlar</span>
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white">{lateCount}</span>
            <span className="text-xs text-slate-400 ml-2">Kişi Bugün</span>
          </div>
          <div className="mt-2 text-xs text-amber-400/90 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Tolerans süresini aşan girişler</span>
          </div>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/60 rounded-xl p-5 shadow-sm hover:border-indigo-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Mesai Yapanlar</span>
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white">{overtimeCount}</span>
            <span className="text-xs text-slate-400 ml-2">Kişi Mesaili</span>
          </div>
          <div className="mt-2 text-xs text-indigo-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Vardiya sonrası çalışma</span>
          </div>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/60 rounded-xl p-5 shadow-sm hover:border-purple-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">İzinli / Raporlu</span>
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white">{leaveCount}</span>
            <span className="text-xs text-slate-400 ml-2">Kişi İzinli</span>
          </div>
          <div className="mt-2 text-xs text-purple-300 flex items-center gap-1">
            <span>Onaylı izin & hastalık raporları</span>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Logs Stream */}
        <div className="lg:col-span-2 bg-slate-800/90 border border-slate-700/60 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-semibold text-white">Canlı Kart & Cihaz Okutma Akışı</h3>
            </div>
            <button 
              onClick={onNavigateToLogs}
              className="text-xs font-medium text-blue-400 hover:text-blue-300 transition"
            >
              Tümünü Gör →
            </button>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {logs.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                Henüz cihaz okuma kaydı bulunmuyor. Giriş-Çıkış sekmesinden test kaydı ekleyebilirsiniz.
              </div>
            ) : (
              logs.slice(0, 8).map(log => (
                <div 
                  key={log.id}
                  className="flex items-center justify-between p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                      log.direction === 'IN' 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {log.direction === 'IN' ? <LogIn className="w-4 h-4" /> : <LogOut className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{log.workerName}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{log.deviceName}</span>
                        <span>•</span>
                        <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] uppercase font-mono">
                          {log.verificationType}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block ${
                      log.direction === 'IN' ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                    }`}>
                      {log.direction === 'IN' ? 'GİRİŞ' : 'ÇIKIŞ'}
                    </div>
                    <div className="text-xs font-mono text-slate-400 mt-1">
                      {log.timestamp}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Shift & Quick Stats */}
        <div className="space-y-6">
          <div className="bg-slate-800/90 border border-slate-700/60 rounded-xl p-5 shadow-sm">
            <h3 className="text-base font-semibold text-white mb-3">Vardiya & Çalışma Bilgisi</h3>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-700/50 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-white">Gündüz Vardiyası (Sabit)</div>
                  <div className="text-xs text-slate-400 mt-0.5">08:00 - 18:00 (60 dk mola)</div>
                </div>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs font-medium border border-blue-500/30">
                  Varsayılan
                </span>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-700/50 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-white">Gece Vardiyası (%20 Prim)</div>
                  <div className="text-xs text-slate-400 mt-0.5">18:00 - 04:00</div>
                </div>
                <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs font-medium border border-purple-500/30">
                  Gece
                </span>
              </div>
            </div>
            <button 
              onClick={onNavigateToShifts}
              className="w-full mt-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-medium transition"
            >
              Vardiya Tanımlarını Yönet
            </button>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/50 to-slate-900/80 border border-indigo-500/30 rounded-xl p-5 shadow-sm">
            <h4 className="text-sm font-semibold text-indigo-200 mb-2">Otomatik Puantaj Entegrasyonu</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Geçiş terminallerinden okutulan saatler doğrudan vardiyalar ile eşleştirilir. 
              Geç kalma ve fazla mesai süreleri otomatik olarak puantaj cetveline yansıtılır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
