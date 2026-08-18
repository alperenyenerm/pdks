import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/calculations';
import {
  Award,
  Star,
  PlusCircle,
  X,
} from 'lucide-react';

export const PerformanceView: React.FC = () => {
  const { workers, monthlySummaries, disciplinary, addDisciplinary } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    workerId: workers[0]?.id || '',
    date: new Date().toISOString().slice(0, 10),
    type: 'PRAISE' as 'PRAISE' | 'WARNING' | 'LATENESS' | 'SAFETY_VIOLATION',
    title: '',
    description: '',
    penaltyOrBonusAmount: 500,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.workerId || !formData.title) return;
    addDisciplinary(formData);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            Personel Performans, Disiplin & Prim Değerlendirme
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Devam oranları, geç kalma uyarısı, takdirnameler ve iş güvenliği kayıtları.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-lg shadow-amber-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Yeni Takdir / Uyarı Kaydı</span>
        </button>
      </div>

      {/* Workers Performance Score List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {monthlySummaries.map((summary) => {
          const workedDays = summary.totalWorkedDaysEquivalent;
          const score = Math.min(Math.round((workedDays / 26) * 100), 100);

          return (
            <div
              key={summary.worker.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {summary.worker.firstName} {summary.worker.lastName}
                  </h4>
                  <p className="text-[11px] text-slate-400">{summary.worker.role}</p>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                  %{score} Devam
                </span>
              </div>

              {/* Progress ring / bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Aylık İmalat Katkısı</span>
                  <span className="font-mono text-slate-200">{workedDays} / 26 Gün</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Disciplinary & Praise Records Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            Performans, Takdir ve Uyarı Kayıtları
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Tarih</th>
                <th className="py-3 px-4">Personel</th>
                <th className="py-3 px-4">Tür</th>
                <th className="py-3 px-4">Başlık / Konu</th>
                <th className="py-3 px-4">Açıklama</th>
                <th className="py-3 px-4 text-right">Tutar (₺)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {disciplinary.map((item) => {
                const worker = workers.find((w) => w.id === item.workerId);

                let badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                let typeLabel = 'Takdir / Teşekkür';
                if (item.type === 'LATENESS') {
                  badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                  typeLabel = 'Geç Kalma Uyarısı';
                } else if (item.type === 'SAFETY_VIOLATION') {
                  badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                  typeLabel = 'İş Güvenliği İhlali';
                } else if (item.type === 'WARNING') {
                  badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                  typeLabel = 'Yazılı İkaz';
                }

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono text-slate-300">{item.date}</td>
                    <td className="py-3 px-4 font-bold text-white">
                      {worker ? `${worker.firstName} ${worker.lastName}` : 'Bilinmiyor'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${badgeColor}`}>
                        {typeLabel}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-200">{item.title}</td>
                    <td className="py-3 px-4 text-slate-300">{item.description}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">
                      {item.penaltyOrBonusAmount ? formatCurrency(item.penaltyOrBonusAmount) : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD DISCIPLINARY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Takdir / Uyarı Kaydı Ekle</h3>
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
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.firstName} {w.lastName} ({w.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Kayıt Türü
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="PRAISE">Takdir / Teşekkür Ödülü</option>
                  <option value="LATENESS">Geç Kalma Uyarısı</option>
                  <option value="SAFETY_VIOLATION">İş Güvenliği İhlali</option>
                  <option value="WARNING">Yazılı İkaz</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Başlık
                </label>
                <input
                  type="text"
                  required
                  placeholder="ör. Üstün İmalat Başarısı..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Açıklama
                </label>
                <input
                  type="text"
                  placeholder="Detaylı not..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-amber-400 uppercase tracking-wider block mb-1">
                  Ödül veya Kesinti Tutarı (₺ - Opsiyonel)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={formData.penaltyOrBonusAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, penaltyOrBonusAmount: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-amber-400 font-bold font-mono focus:border-amber-500 focus:outline-none"
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
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
