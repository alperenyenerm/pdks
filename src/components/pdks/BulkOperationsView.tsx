import React, { useState } from 'react';
import { 
  TrendingUp, Calendar, CheckCircle2, Layers, SlidersHorizontal
} from 'lucide-react';
import type { BulkOperationRecord, Worker } from '../../types';

interface BulkOperationsViewProps {
  workers: Worker[];
  bulkOperations: BulkOperationRecord[];
  onApplySalaryRaise: (percentage: number) => void;
  onApplyBulkLeave: (startDate: string, endDate: string, reason: string) => void;
}

export const BulkOperationsView: React.FC<BulkOperationsViewProps> = ({
  workers,
  bulkOperations,
  onApplySalaryRaise,
  onApplyBulkLeave
}) => {
  const [activeTab, setActiveTab] = useState<'RAISE' | 'LEAVE' | 'HISTORY'>('RAISE');
  
  // Form State: Salary raise
  const [raisePercentage, setRaisePercentage] = useState<number>(15);

  // Form State: Bulk Leave
  const [leaveStartDate, setLeaveStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [leaveEndDate, setLeaveEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [leaveReason, setLeaveReason] = useState<string>('Resmi Tatil / İdari İzin');

  const handleSalaryRaiseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplySalaryRaise(raisePercentage);
  };

  const handleBulkLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyBulkLeave(leaveStartDate, leaveEndDate, leaveReason);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/90 p-5 rounded-xl border border-slate-700/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
            Perkotek Toplu İşlemler Modülü
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Toplu Maaş Artırımı, İzin & Hareket İşlemleri</h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Tüm personel kadrosu veya seçili gruplar üzerinde toplu güncelleme ve zam tanımları.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700 space-x-4">
        <button 
          onClick={() => setActiveTab('RAISE')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'RAISE'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Toplu Maaş Artımı (Zam)
        </button>
        <button 
          onClick={() => setActiveTab('LEAVE')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'LEAVE'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Toplu İzin / Tatil İşleme
        </button>
        <button 
          onClick={() => setActiveTab('HISTORY')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'HISTORY'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          İşlem Geçmişi ({bulkOperations.length})
        </button>
      </div>

      {/* Tab 1: Salary Raise */}
      {activeTab === 'RAISE' && (
        <div className="bg-slate-800/90 border border-slate-700/60 rounded-xl p-6 shadow-sm max-w-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Toplu Yövmiye / Maaş Zam Oranı Uygula</h3>
              <p className="text-xs text-slate-400">
                Aktif çalışan tüm {workers.filter(w => w.status === 'active').length} personelin günlük yövmiye ve mesai ücretlerine yüzde zam yansıtır.
              </p>
            </div>
          </div>

          <form onSubmit={handleSalaryRaiseSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
                Zam Oranı (%)
              </label>
              <div className="flex items-center gap-3">
                <input 
                  type="number"
                  required
                  min="1"
                  max="500"
                  value={raisePercentage}
                  onChange={e => setRaisePercentage(Number(e.target.value))}
                  className="w-40 bg-slate-900 border border-slate-700 rounded-lg p-3 text-xl font-bold font-mono text-white text-center focus:outline-none focus:border-emerald-500"
                />
                <span className="text-xl font-bold text-emerald-400">% ZAM</span>
              </div>
            </div>

            <div className="p-4 bg-slate-900/80 rounded-lg border border-slate-700 text-xs text-slate-300 space-y-1">
              <div className="font-semibold text-white">İşlem Özeti:</div>
              <div>• Toplam Etkilenecek Personel: <strong className="text-emerald-400">{workers.filter(w => w.status === 'active').length} Kişi</strong></div>
              <div>• Yeni Yövmiye Hesabı: <code className="text-blue-300">Mevcut Yövmiye × (1 + {raisePercentage}/100)</code></div>
            </div>

            <button 
              type="submit"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-sm transition shadow-lg flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              %{raisePercentage} Zam Oranını Tüm Kadroya Uygula
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Bulk Leave */}
      {activeTab === 'LEAVE' && (
        <div className="bg-slate-800/90 border border-slate-700/60 rounded-xl p-6 shadow-sm max-w-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Toplu İzin veya Resmi Tatil Tanımla</h3>
              <p className="text-xs text-slate-400">
                Seçilen tarih aralığında tüm personeller için idari izin veya resmi tatil kaydı oluşturur.
              </p>
            </div>
          </div>

          <form onSubmit={handleBulkLeaveSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Başlangıç Tarihi</label>
                <input 
                  type="date"
                  required
                  value={leaveStartDate}
                  onChange={e => setLeaveStartDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Bitiş Tarihi</label>
                <input 
                  type="date"
                  required
                  value={leaveEndDate}
                  onChange={e => setLeaveEndDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Açıklama / Tatil Nedeni</label>
              <input 
                type="text"
                required
                value={leaveReason}
                onChange={e => setLeaveReason(e.target.value)}
                placeholder="Örn: Bayram İzni, Fabrika Bakım İdari İzni"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <button 
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-sm transition shadow-lg flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Toplu İzni Tüm Kadroya İşle
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: History */}
      {activeTab === 'HISTORY' && (
        <div className="bg-slate-800/90 rounded-xl border border-slate-700/60 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-700">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Tarih</th>
                <th className="py-3.5 px-4 font-semibold">İşlem Adı</th>
                <th className="py-3.5 px-4 font-semibold">Tür</th>
                <th className="py-3.5 px-4 font-semibold">Etkilenen Personel</th>
                <th className="py-3.5 px-4 font-semibold">Detaylar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {bulkOperations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Henüz yapılmış toplu işlem kaydı yok.
                  </td>
                </tr>
              ) : (
                bulkOperations.map(op => (
                  <tr key={op.id} className="hover:bg-slate-700/30 transition">
                    <td className="py-3 px-4 font-mono text-xs text-white">{op.date}</td>
                    <td className="py-3 px-4 font-semibold text-white">{op.title}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded">
                        {op.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-blue-400">{op.affectedCount} Kişi</td>
                    <td className="py-3 px-4 text-xs text-slate-400">{op.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
