import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { MachineryUnit } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import {
  Cpu,
  PlusCircle,
  X,
} from 'lucide-react';

export const MachineryCostCenter: React.FC = () => {
  const { machinery, attendance, workers, addMachinery, updateMachinery, deleteMachinery } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<MachineryUnit | null>(null);

  const [formData, setFormData] = useState({
    code: 'TEZ-106',
    name: '',
    category: 'CNC' as MachineryUnit['category'],
    status: 'OPERATIONAL' as MachineryUnit['status'],
    hourlyOperatingCost: 500,
  });

  const handleOpenAdd = () => {
    setEditingMachine(null);
    setFormData({
      code: `TEZ-${100 + machinery.length + 1}`,
      name: '',
      category: 'CNC',
      status: 'OPERATIONAL',
      hourlyOperatingCost: 500,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: MachineryUnit) => {
    setEditingMachine(m);
    setFormData({
      code: m.code,
      name: m.name,
      category: m.category,
      status: m.status,
      hourlyOperatingCost: m.hourlyOperatingCost,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingMachine) {
      updateMachinery({
        ...editingMachine,
        ...formData,
      });
    } else {
      addMachinery(formData);
    }
    setIsModalOpen(false);
  };

  // Calculate machine usage stats from attendance records
  const getMachineStats = (machineId: string) => {
    const records = attendance.filter((r) => r.machineryId === machineId);
    let totalWorkedHours = 0;
    let totalLaborCost = 0;

    records.forEach((rec) => {
      const worker = workers.find((w) => w.id === rec.workerId);
      if (!worker) return;

      let hrs = 0;
      if (rec.type === 'FULL') hrs = 8;
      else if (rec.type === 'HALF') hrs = 4;
      hrs += rec.overtimeHours || 0;

      totalWorkedHours += hrs;
      const hourlyBase = worker.dailyRate / 8;
      totalLaborCost += hrs * hourlyBase;
    });

    return { totalWorkedHours, totalLaborCost, recordCount: records.length };
  };

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-400" />
            Tezgah & Makine Parkuru Verimlilik Paneli
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Atölyedeki CNC, Lazer ve Kaynak tezgahlarına ayrılan işçilik saatleri ve işletim maliyeti analizleri.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-lg shadow-amber-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Yeni Tezgah / Makine Ekle</span>
        </button>
      </div>

      {/* Machinery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {machinery.map((machine) => {
          const stats = getMachineStats(machine.id);
          const totalMachineOperatingCost = stats.totalWorkedHours * machine.hourlyOperatingCost;

          return (
            <div
              key={machine.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md">
                    {machine.code}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      machine.status === 'OPERATIONAL'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {machine.status === 'OPERATIONAL' ? 'Faal / Çalışıyor' : 'Bakımda'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-1">{machine.name}</h3>
                <p className="text-xs text-slate-400 mb-4">Kategori: {machine.category}</p>

                {/* Metrics */}
                <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Çalışma Süresi:</span>
                    <span className="font-bold text-white font-mono">
                      {stats.totalWorkedHours} Saat
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Harcanan İşçilik Tutarı:</span>
                    <span className="font-bold text-amber-400 font-mono">
                      {formatCurrency(stats.totalLaborCost)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span className="text-slate-400">Tezgah İletişim Maliyeti:</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      {formatCurrency(totalMachineOperatingCost)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800 text-xs">
                <span className="text-[10px] text-slate-500 font-mono">
                  Saatlik Maliyet: {formatCurrency(machine.hourlyOperatingCost)}/s
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEdit(machine)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Bu tezgahı silmek istediğinize emin misiniz?')) {
                        deleteMachinery(machine.id);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 transition border border-rose-500/20"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD / EDIT MACHINERY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingMachine ? 'Tezgah Düzenle' : 'Yeni Tezgah / Makine Tanımı'}
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
                  Tezgah Kodu
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
                  Tezgah / Ekipman Adı
                </label>
                <input
                  type="text"
                  required
                  placeholder="ör. Mazak 5-Eksen CNC İşleme..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as any })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="CNC">CNC</option>
                    <option value="Lazer">Lazer Kesim</option>
                    <option value="Pres">Pres</option>
                    <option value="Kaynak">Kaynak</option>
                    <option value="Montaj">Montaj</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Durum
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="OPERATIONAL">Faal / Çalışıyor</option>
                    <option value="MAINTENANCE">Bakımda</option>
                    <option value="IDLE">Boşta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-amber-400 uppercase tracking-wider block mb-1">
                  Saatlik Tezgah Çalıştırma Maliyeti (₺/saat)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={formData.hourlyOperatingCost}
                  onChange={(e) =>
                    setFormData({ ...formData, hourlyOperatingCost: Number(e.target.value) })
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
