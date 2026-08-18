import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  PlusCircle,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';

export const PublicHolidaysView: React.FC = () => {
  const { holidays, addHoliday, deleteHoliday } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: '2026-12-31',
    name: '',
    overtimeMultiplier: 2.5,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.date) return;
    addHoliday(formData);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            Resmi Tatil & Bayram Otomasyon Yönetimi
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Türkiye resmi tatilleri ve dini bayramlarda otomatik 2.5x / 3.0x mesai katsayısı hesabı.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-lg shadow-amber-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Yeni Özel Tatil Ekle</span>
        </button>
      </div>

      {/* Holidays Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {holidays.map((holiday) => (
          <div
            key={holiday.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between hover:border-slate-700 transition"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md">
                {holiday.date}
              </span>
              <h3 className="text-base font-bold text-white pt-1">{holiday.name}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Mesai Katsayısı: <span className="font-bold text-emerald-400 font-mono">{holiday.overtimeMultiplier}x</span>
              </p>
            </div>

            <button
              onClick={() => {
                if (confirm(`${holiday.name} kaydını silmek istediğinize emin misiniz?`)) {
                  deleteHoliday(holiday.id);
                }
              }}
              className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition border border-rose-500/20"
              title="Sil"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* ADD HOLIDAY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Yeni Resmi / Özel Tatil Tanımla</h3>
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
                  Tatil Tarihi
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Tatil / Bayram Adı
                </label>
                <input
                  type="text"
                  required
                  placeholder="ör. Zafer Bayramı / Özel Şirket İzni..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                  Mesai Katsayısı Çarpanı (x)
                </label>
                <select
                  value={formData.overtimeMultiplier}
                  onChange={(e) =>
                    setFormData({ ...formData, overtimeMultiplier: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-emerald-400 font-bold font-mono focus:border-amber-500 focus:outline-none"
                >
                  <option value={2.0}>2.0x (Çift Yövmiye)</option>
                  <option value={2.5}>2.5x (Resmi Tatil Standart)</option>
                  <option value={3.0}>3.0x (Dini Bayram Ekstra)</option>
                </select>
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
                  Tatil Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
