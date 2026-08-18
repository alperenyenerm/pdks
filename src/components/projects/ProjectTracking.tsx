import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Project } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import {
  Briefcase,
  FolderPlus,
  Building2,
  Calendar,
  Edit2,
  Trash2,
  X,
} from 'lucide-react';

export const ProjectTracking: React.FC = () => {
  const { projects, attendance, workers, addProject, updateProject, deleteProject } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState({
    code: 'PRJ-2026-05',
    name: '',
    client: '',
    startDate: new Date().toISOString().slice(0, 10),
    status: 'ACTIVE' as 'ACTIVE' | 'COMPLETED' | 'PLANNED',
    budget: 500000,
  });

  const handleOpenAdd = () => {
    setEditingProject(null);
    const nextCode = `PRJ-2026-${String(projects.length + 1).padStart(2, '0')}`;
    setFormData({
      code: nextCode,
      name: '',
      client: '',
      startDate: new Date().toISOString().slice(0, 10),
      status: 'ACTIVE',
      budget: 500000,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prj: Project) => {
    setEditingProject(prj);
    setFormData({
      code: prj.code,
      name: prj.name,
      client: prj.client,
      startDate: prj.startDate,
      status: prj.status,
      budget: prj.budget || 0,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.client) return;

    if (editingProject) {
      updateProject({
        ...editingProject,
        ...formData,
      });
    } else {
      addProject(formData);
    }
    setIsModalOpen(false);
  };

  // Calculate project cost & worked days stats from attendance records
  const calculateProjectStats = (projectId: string) => {
    const projectRecords = attendance.filter((r) => r.projectId === projectId);
    let totalDays = 0;
    let totalLaborCost = 0;

    projectRecords.forEach((rec) => {
      const worker = workers.find((w) => w.id === rec.workerId);
      if (!worker) return;

      let dayVal = 0;
      if (rec.type === 'FULL') dayVal = 1;
      else if (rec.type === 'HALF') dayVal = 0.5;

      totalDays += dayVal;
      const baseCost = dayVal * worker.dailyRate;
      const overtimeCost = (rec.overtimeHours || 0) * worker.overtimeHourlyRate;
      totalLaborCost += baseCost + overtimeCost;
    });

    return { totalDays, totalLaborCost, recordCount: projectRecords.length };
  };

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-400" />
            Proje & İmalat Bazlı İşçilik Takibi
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Makine siparişleri ve şantiyelere harcanan adam/gün ve toplam işçilik maliyet analizleri.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-lg shadow-amber-500/20"
        >
          <FolderPlus className="w-4 h-4" />
          <span>Yeni Proje Ekle</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((project) => {
          const stats = calculateProjectStats(project.id);
          const progressPercent = project.budget
            ? Math.min(Math.round((stats.totalLaborCost / project.budget) * 100), 100)
            : 0;

          return (
            <div
              key={project.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md">
                    {project.code}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      project.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : project.status === 'COMPLETED'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {project.status === 'ACTIVE'
                      ? 'Aktif Üretim'
                      : project.status === 'COMPLETED'
                      ? 'Tamamlandı'
                      : 'Planlamada'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-1">{project.name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mb-4">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  Müşteri: <span className="text-slate-200 font-semibold">{project.client}</span>
                </p>

                {/* Key Metrics Box */}
                <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Harcanan Adam/Gün:</span>
                    <span className="font-bold text-white font-mono">{stats.totalDays} Gün</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Toplam İşçilik Maliyeti:</span>
                    <span className="font-bold text-amber-400 font-mono text-sm">
                      {formatCurrency(stats.totalLaborCost)}
                    </span>
                  </div>

                  {project.budget && (
                    <div className="pt-2 border-t border-slate-800/80">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span>Bütçe Kullanım Oranı:</span>
                        <span className="font-bold text-slate-200 font-mono">
                          %{progressPercent} ({formatCurrency(project.budget)})
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800 text-xs">
                <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {project.startDate}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEdit(project)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
                    title="Düzenle"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Bu projeyi silmek istiyor musunuz?')) {
                        deleteProject(project.id);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition border border-rose-500/20"
                    title="Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD / EDIT PROJECT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingProject ? 'Proje Düzenle' : 'Yeni Proje / Makine Siparişi'}
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
                  Proje Kodu
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
                  Proje / Makine Adı
                </label>
                <input
                  type="text"
                  required
                  placeholder="ör. CNC 5-Eksen Freze İmalatı #02"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Müşteri / Firma
                </label>
                <input
                  type="text"
                  required
                  placeholder="ör. YNR Stok / Aksa Enerji / Ege Gıda"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Durum
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="ACTIVE">Aktif Üretim</option>
                    <option value="COMPLETED">Tamamlandı</option>
                    <option value="PLANNED">Planlamada</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Tahmini Bütçe (₺)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-amber-400 font-bold font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Başlangıç Tarihi
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-amber-500 focus:outline-none"
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
