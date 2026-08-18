import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { BranchLocation } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import { Building2, PlusCircle, MapPin, Users, DollarSign, X, Edit2, Trash2 } from 'lucide-react';

export const BranchManagement: React.FC = () => {
  const { branches, workers, monthlySummaries, addBranch, updateBranch, deleteBranch } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchLocation | null>(null);

  const [formData, setFormData] = useState({
    code: 'ŞUB-04',
    name: '',
    city: 'İstanbul',
    address: '',
    managerName: '',
    status: 'ACTIVE' as 'ACTIVE' | 'PASSIVE',
  });

  const handleOpenAdd = () => {
    setEditingBranch(null);
    setFormData({
      code: `ŞUB-0${branches.length + 1}`,
      name: '',
      city: 'İstanbul',
      address: '',
      managerName: '',
      status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: BranchLocation) => {
    setEditingBranch(b);
    setFormData({
      code: b.code,
      name: b.name,
      city: b.city,
      address: b.address,
      managerName: b.managerName,
      status: b.status,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingBranch) {
      updateBranch({ ...editingBranch, ...formData });
    } else {
      addBranch(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            Çoklu Şantiye & Şube Yönetim Paneli
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            İstanbul İkitelli Merkez Atölye, Gebze Fabrikası ve Saha Şantiyeleri işçilik ve kadro dağılımı.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-lg shadow-amber-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Yeni Şantiye / Şube Ekle</span>
        </button>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {branches.map((branch) => {
          const branchWorkers = workers.filter((w) => w.branchId === branch.id);
          const branchSummaries = monthlySummaries.filter((s) => s.worker.branchId === branch.id);
          const totalBranchCost = branchSummaries.reduce(
            (acc, curr) => acc + curr.totalGrossEarnings,
            0
          );

          return (
            <div
              key={branch.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md">
                    {branch.code}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                    {branch.city}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-1">{branch.name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mb-4">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {branch.address}
                </p>

                <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-500" /> Şube Kadrosu:
                    </span>
                    <span className="font-bold text-white font-mono">{branchWorkers.length} Kişi</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Şube Aylık İşçilik:
                    </span>
                    <span className="font-bold text-amber-400 font-mono">
                      {formatCurrency(totalBranchCost)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                    <span>Sorumlu Şef: </span>
                    <span className="font-semibold text-slate-200">{branch.managerName}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 mt-4 pt-3 border-t border-slate-800 text-xs">
                <button
                  onClick={() => handleOpenEdit(branch)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                >
                  <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Bu şubeyi silmek istiyor musunuz?')) {
                      deleteBranch(branch.id);
                    }
                  }}
                  className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingBranch ? 'Şube Düzenle' : 'Yeni Şantiye / Şube Kaydı'}
              </h3>
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
                  Şube Kodu
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Şube / Şantiye Adı
                </label>
                <input
                  type="text"
                  required
                  placeholder="ör. Gebze Ağır İmalat Tesisleri..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Şehir
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Adres
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Şantiye Şefi / Sorumlu Müdürü
                </label>
                <input
                  type="text"
                  value={formData.managerName}
                  onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
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
