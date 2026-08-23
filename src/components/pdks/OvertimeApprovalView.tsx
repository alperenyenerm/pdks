import React, { useState } from 'react';
import { CheckCircle2, XCircle, Clock, Check, X, Filter, UserCheck } from 'lucide-react';
import type { OvertimeApproval, Worker } from '../../types';

interface OvertimeApprovalViewProps {
  approvals: OvertimeApproval[];
  workers: Worker[];
  onApprove: (id: string, approvedHours: number) => void;
  onReject: (id: string) => void;
}

export const OvertimeApprovalView: React.FC<OvertimeApprovalViewProps> = ({
  approvals,
  workers: _workers,
  onApprove,
  onReject
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [customHours, setCustomHours] = useState<number>(0);

  const filteredApprovals = approvals.filter(a => {
    return statusFilter === 'ALL' || a.status === statusFilter;
  });

  const pendingCount = approvals.filter(a => a.status === 'PENDING').length;
  const approvedCount = approvals.filter(a => a.status === 'APPROVED').length;
  const totalApprovedHours = approvals.filter(a => a.status === 'APPROVED').reduce((sum, a) => sum + a.approvedHours, 0);

  const handleStartEdit = (app: OvertimeApproval) => {
    setEditingId(app.id);
    setCustomHours(app.calculatedHours);
  };

  const handleSaveApprove = (id: string) => {
    onApprove(id, customHours);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/90 p-5 rounded-xl border border-slate-700/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <UserCheck className="w-5 h-5 text-indigo-400" />
            Perkotek Fazla Mesai Yönetimi
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Fazla Mesai Onay Ekranı</h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Cihaz okumaları ile hesaplanan fazla mesailerin yönetici ve amir tarafından onaylanması.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800/90 border border-slate-700/60 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold">Onay Bekleyenler</div>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">{pendingCount} Mesai</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/60 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold">Onaylanan Toplam FM</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">{totalApprovedHours.toFixed(1)} Saat</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/60 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold">Onaylanan Kayıtlar</div>
            <div className="text-2xl font-extrabold text-blue-400 mt-1">{approvedCount} Adet</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 bg-slate-800/80 p-4 rounded-xl border border-slate-700/50">
        <Filter className="w-4 h-4 text-slate-400 ml-1" />
        <span className="text-xs font-semibold text-slate-300">Durum Filtresi:</span>
        <select 
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as any)}
          className="bg-slate-900 border border-slate-700 rounded-lg text-sm text-white px-3 py-1.5 focus:outline-none focus:border-indigo-500"
        >
          <option value="ALL">Tüm Durumlar (Tümü)</option>
          <option value="PENDING">Onay Bekleyenler (PENDING)</option>
          <option value="APPROVED">Onaylananlar (APPROVED)</option>
          <option value="REJECTED">Reddedilenler (REJECTED)</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-800/90 rounded-xl border border-slate-700/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-700">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Personel</th>
                <th className="py-3.5 px-4 font-semibold">Tarih</th>
                <th className="py-3.5 px-4 font-semibold">Hesaplanan FM</th>
                <th className="py-3.5 px-4 font-semibold">Onaylanan FM</th>
                <th className="py-3.5 px-4 font-semibold">Katsayı</th>
                <th className="py-3.5 px-4 font-semibold">Durum</th>
                <th className="py-3.5 px-4 font-semibold">Açıklama</th>
                <th className="py-3.5 px-4 font-semibold text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredApprovals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Seçilen kriterde mesai onay kaydı bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredApprovals.map(app => (
                  <tr key={app.id} className="hover:bg-slate-700/30 transition">
                    <td className="py-3 px-4 font-semibold text-white">
                      {app.workerName}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-white">
                      {app.date}
                    </td>
                    <td className="py-3 px-4 font-bold text-amber-400">
                      {app.calculatedHours.toFixed(1)} Saat
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-400">
                      {editingId === app.id ? (
                        <input 
                          type="number"
                          step="0.5"
                          value={customHours}
                          onChange={e => setCustomHours(Number(e.target.value))}
                          className="w-20 bg-slate-900 border border-emerald-500 rounded px-2 py-1 text-white font-mono text-xs"
                        />
                      ) : (
                        `${app.approvedHours.toFixed(1)} Saat`
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-indigo-300">
                        {app.multiplier}x
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {app.status === 'APPROVED' && (
                        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-md flex items-center gap-1 inline-flex">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Onaylandı
                        </span>
                      )}
                      {app.status === 'PENDING' && (
                        <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold rounded-md flex items-center gap-1 inline-flex">
                          <Clock className="w-3.5 h-3.5" />
                          Onay Bekliyor
                        </span>
                      )}
                      {app.status === 'REJECTED' && (
                        <span className="px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold rounded-md flex items-center gap-1 inline-flex">
                          <XCircle className="w-3.5 h-3.5" />
                          Reddedildi
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400">
                      {app.notes || '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {editingId === app.id ? (
                        <div className="flex justify-end gap-1">
                          <button 
                            onClick={() => handleSaveApprove(app.id)}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded transition"
                            title="Onayla ve Kaydet"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setEditingId(null)}
                            className="p-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded transition"
                            title="İptal"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-1">
                          {app.status !== 'APPROVED' && (
                            <button 
                              onClick={() => handleStartEdit(app)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition"
                            >
                              Onayla
                            </button>
                          )}
                          {app.status !== 'REJECTED' && (
                            <button 
                              onClick={() => onReject(app.id)}
                              className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded text-xs font-medium transition"
                            >
                              Reddet
                            </button>
                          )}
                        </div>
                      )}
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
