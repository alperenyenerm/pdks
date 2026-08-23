import React, { useState } from 'react';
import { 
  FileText, Download, Filter, Calendar, Search, Sliders 
} from 'lucide-react';
import type { PDKSDailyCalculated, Worker } from '../../types';
import { PDKSReportWizardModal } from './PDKSReportWizardModal';

interface PDKSReportsProps {
  dailySummaries: PDKSDailyCalculated[];
  workers: Worker[];
}

export const PDKSReports: React.FC<PDKSReportsProps> = ({
  dailySummaries,
  workers
}) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const filteredSummaries = dailySummaries.filter(summary => {
    const matchesMonth = summary.date.startsWith(selectedMonth);
    const matchesWorker = selectedWorkerId === 'ALL' || summary.workerId === selectedWorkerId;
    const matchesSearch = summary.workerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesMonth && matchesWorker && matchesSearch;
  });

  // Calculate aggregated stats
  const totalWorkedHours = (filteredSummaries.reduce((acc, s) => acc + s.totalWorkedMinutes, 0) / 60).toFixed(1);
  const totalOvertimeHours = (filteredSummaries.reduce((acc, s) => acc + s.overtimeMinutes, 0) / 60).toFixed(1);
  const totalLateMinutes = filteredSummaries.reduce((acc, s) => acc + s.lateMinutes, 0);
  const totalEarlyExitMinutes = filteredSummaries.reduce((acc, s) => acc + s.earlyExitMinutes, 0);

  const handleExportCSV = () => {
    const headers = ['Tarih', 'Personel', 'Vardiya', 'Giriş Saati', 'Çıkış Saati', 'Toplam (Saat)', 'Normal (Saat)', 'Geç Kalma (Dk)', 'Erken Çıkış (Dk)', 'Fazla Mesai (Dk)', 'Durum'];
    const rows = filteredSummaries.map(s => [
      s.date,
      s.workerName,
      s.shiftName,
      s.firstCheckIn || '-',
      s.lastCheckOut || '-',
      (s.totalWorkedMinutes / 60).toFixed(1),
      (s.normalWorkedMinutes / 60).toFixed(1),
      s.lateMinutes,
      s.earlyExitMinutes,
      s.overtimeMinutes,
      s.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PDKS_Raporu_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'FULL_WORK':
        return <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">NÇ (Normal)</span>;
      case 'LATE':
        return <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">GK (Geç Kalma)</span>;
      case 'EARLY_EXIT':
        return <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 text-xs font-semibold border border-orange-500/20">EÇ (Erken Çıkış)</span>;
      case 'OVERTIME':
        return <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20">FM (Fazla Mesai)</span>;
      case 'LEAVE':
        return <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-xs font-semibold border border-purple-500/20">İZİN</span>;
      case 'ABSENT':
        return <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 text-xs font-semibold border border-rose-500/20">DEV (Devamsız)</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-300 text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/90 p-5 rounded-xl border border-slate-700/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
            <FileText className="w-5 h-5 text-blue-400" />
            PDKS Raporlama & Çizelge Motoru
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Günlük & Aylık Personel PDKS Raporları</h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Geç kalma, erken çıkış, mesai süreleri ve eksiksiz devam-devamsızlık çizelgeleri.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsWizardOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition shadow flex items-center gap-2"
          >
            <Sliders className="w-4 h-4" />
            Rapor Çıkar Sihirbazı (ADIM 1-2-3)
          </button>
          <button 
            onClick={handleExportCSV}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition shadow flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Excel (CSV) İndir
          </button>
        </div>
      </div>

      <PDKSReportWizardModal 
        workers={workers}
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onRunReport={() => {
          setIsWizardOpen(false);
        }}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/90 border border-slate-700/60 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Toplam Çalışma</div>
          <div className="text-2xl font-extrabold text-white mt-1">{totalWorkedHours} Saat</div>
          <div className="text-xs text-slate-400 mt-1">Filtrelenen dönem</div>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/60 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Fazla Mesai</div>
          <div className="text-2xl font-extrabold text-blue-400 mt-1">+{totalOvertimeHours} Saat</div>
          <div className="text-xs text-blue-300 mt-1">Zamlı fazla mesai</div>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/60 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Toplam Geç Kalma</div>
          <div className="text-2xl font-extrabold text-amber-400 mt-1">{totalLateMinutes} Dakika</div>
          <div className="text-xs text-amber-300 mt-1">Vardiya gecikmeleri</div>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/60 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Toplam Erken Çıkış</div>
          <div className="text-2xl font-extrabold text-orange-400 mt-1">{totalEarlyExitMinutes} Dakika</div>
          <div className="text-xs text-orange-300 mt-1">Erken ayrılma süreleri</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 bg-slate-800/80 p-4 rounded-xl border border-slate-700/50">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400 ml-1" />
          <input 
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="bg-slate-900/80 border border-slate-700 rounded-lg text-sm text-white px-3 py-2 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select 
            value={selectedWorkerId}
            onChange={e => setSelectedWorkerId(e.target.value)}
            className="bg-slate-900/80 border border-slate-700 rounded-lg text-sm text-white px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Tüm Personeller</option>
            {workers.map(w => (
              <option key={w.id} value={w.id}>
                {w.firstName} {w.lastName} ({w.code})
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input 
            type="text"
            placeholder="Personel adı ile filtrele..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-slate-800/90 rounded-xl border border-slate-700/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-700">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Tarih</th>
                <th className="py-3.5 px-4 font-semibold">Personel</th>
                <th className="py-3.5 px-4 font-semibold">Vardiya</th>
                <th className="py-3.5 px-4 font-semibold">Giriş Saati</th>
                <th className="py-3.5 px-4 font-semibold">Çıkış Saati</th>
                <th className="py-3.5 px-4 font-semibold">Çalışma Süresi</th>
                <th className="py-3.5 px-4 font-semibold">Geç Kalma</th>
                <th className="py-3.5 px-4 font-semibold">Erken Çıkış</th>
                <th className="py-3.5 px-4 font-semibold">Fazla Mesai</th>
                <th className="py-3.5 px-4 font-semibold">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredSummaries.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    Seçilen filtre ve döneme ait PDKS rapor verisi bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredSummaries.map(s => (
                  <tr key={s.id} className="hover:bg-slate-700/30 transition">
                    <td className="py-3 px-4 font-mono text-xs text-white">
                      {s.date}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {s.workerName}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-300">
                      {s.shiftName}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-emerald-400 font-semibold">
                      {s.firstCheckIn || '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-rose-400 font-semibold">
                      {s.lastCheckOut || '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-white">
                      {(s.totalWorkedMinutes / 60).toFixed(1)} Sa ({s.totalWorkedMinutes} Dk)
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {s.lateMinutes > 0 ? (
                        <span className="text-amber-400 font-semibold">+{s.lateMinutes} Dk</span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {s.earlyExitMinutes > 0 ? (
                        <span className="text-orange-400 font-semibold">-{s.earlyExitMinutes} Dk</span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {s.overtimeMinutes > 0 ? (
                        <span className="text-blue-400 font-bold">+{ (s.overtimeMinutes / 60).toFixed(1) } Sa</span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(s.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
