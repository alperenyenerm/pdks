import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, getMonthNameTr } from '../../utils/calculations';
import {
  CreditCard,
  PlusCircle,
  TrendingDown,
  Gift,
  Search,
  Trash2,
  Calendar,
  CheckCircle2,
  X,
} from 'lucide-react';

export const AdvancesPayments: React.FC = () => {
  const {
    workers,
    advances,
    selectedYear,
    selectedMonth,
    addAdvance,
    deleteAdvance,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    workerId: workers[0]?.id || '',
    date: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-05`,
    amount: 1000,
    type: 'ADVANCE' as 'ADVANCE' | 'BONUS' | 'DEDUCTION',
    paymentMethod: 'BANK' as 'CASH' | 'BANK',
    description: 'Haftalık nakit avans',
  });

  const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  const currentMonthAdvances = advances.filter((a) => a.date.startsWith(monthPrefix));

  const filteredAdvances = currentMonthAdvances.filter((adv) => {
    const worker = workers.find((w) => w.id === adv.workerId);
    const workerName = worker ? `${worker.firstName} ${worker.lastName}` : '';
    const matchSearch = `${workerName} ${adv.description}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchWorker = selectedWorkerId === 'ALL' || adv.workerId === selectedWorkerId;
    return matchSearch && matchWorker;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.workerId || formData.amount <= 0) return;
    addAdvance(formData);
    setIsModalOpen(false);
  };

  const totalAdvancesThisMonth = currentMonthAdvances
    .filter((a) => a.type === 'ADVANCE')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalBonusesThisMonth = currentMonthAdvances
    .filter((a) => a.type === 'BONUS')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            Avans & Kesinti Yönetimi
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Personellere ödenen ara avansları, primleri ve kesintileri kaydedin; hakedişten otomatik düşülsün.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-lg shadow-amber-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Yeni Avans / Prim Öde</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Bu Ay Verilen Avanslar</p>
            <p className="text-2xl font-bold text-rose-400 font-mono mt-1">
              {formatCurrency(totalAdvancesThisMonth)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Dağıtılan Primler</p>
            <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">
              {formatCurrency(totalBonusesThisMonth)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Gift className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Toplam Avans Alan Personel</p>
            <p className="text-2xl font-bold text-white font-mono mt-1">
              {new Set(currentMonthAdvances.map((a) => a.workerId)).size} Kişi
            </p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Açıklama veya isim ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={selectedWorkerId}
          onChange={(e) => setSelectedWorkerId(e.target.value)}
          className="w-full sm:w-auto bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
        >
          <option value="ALL">Tüm Personeller</option>
          {workers.map((w) => (
            <option key={w.id} value={w.id}>
              {w.firstName} {w.lastName} ({w.code})
            </option>
          ))}
        </select>
      </div>

      {/* History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            {getMonthNameTr(selectedMonth)} {selectedYear} Avans & Ödeme İşlem Geçmişi
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {filteredAdvances.length} Kayıt Gösteriliyor
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Tarih</th>
                <th className="py-3 px-4">Personel</th>
                <th className="py-3 px-4">İşlem Tipi</th>
                <th className="py-3 px-4">Ödeme Yöntemi</th>
                <th className="py-3 px-4">Açıklama</th>
                <th className="py-3 px-4 text-right">Tutar (₺)</th>
                <th className="py-3 px-4 text-center">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAdvances.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Bu ay için henüz kaydolmuş avans veya ödeme bulunmamaktadır.
                  </td>
                </tr>
              ) : (
                filteredAdvances.map((adv) => {
                  const worker = workers.find((w) => w.id === adv.workerId);

                  let badgeColor = '';
                  let typeLabel = '';
                  if (adv.type === 'ADVANCE') {
                    badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                    typeLabel = 'Nakit Avans';
                  } else if (adv.type === 'BONUS') {
                    badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                    typeLabel = 'Prim / İkramiye';
                  } else {
                    badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                    typeLabel = 'Kesinti';
                  }

                  return (
                    <tr key={adv.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono font-medium text-slate-300">
                        {adv.date}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">
                          {worker ? `${worker.firstName} ${worker.lastName}` : 'Silinmiş Personel'}
                        </div>
                        <div className="text-[10px] text-slate-400">{worker?.role}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold ${badgeColor}`}
                        >
                          {typeLabel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {adv.paymentMethod === 'BANK' ? 'Banka / Havale' : 'Elden (Nakit)'}
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                        {adv.description}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white text-sm">
                        {formatCurrency(adv.amount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            if (confirm('Bu ödeme kaydını silmek istediğinize emin misiniz?')) {
                              deleteAdvance(adv.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD ADVANCE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Yeni Avans / Prim Ödemesi Girişi</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Personel Seçin
                </label>
                <select
                  required
                  value={formData.workerId}
                  onChange={(e) => setFormData({ ...formData, workerId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                >
                  {workers
                    .filter((w) => w.status === 'active')
                    .map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.firstName} {w.lastName} - {w.role}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Ödeme Tarihi
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    İşlem Türü
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="ADVANCE">Nakit Avans</option>
                    <option value="BONUS">Prim / İkramiye</option>
                    <option value="DEDUCTION">Kesinti</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Ödeme Kanalı
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentMethod: e.target.value as any })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="BANK">Banka / EFT</option>
                    <option value="CASH">Elden Nakit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-amber-400 uppercase tracking-wider block mb-1">
                  Tutar (₺)
                </label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-base text-amber-400 font-bold font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Açıklama / Not
                </label>
                <input
                  type="text"
                  placeholder="ör. Haftalık cep harçlığı, acil ihtiyaç..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-amber-500/20"
                >
                  Ödemeyi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
