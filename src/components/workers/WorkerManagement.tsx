import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import type { Worker } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import { parseWorkersFromExcel, downloadSampleWorkerExcel } from '../../utils/excelUtils';
import {
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Building2,
  Calendar,
  DollarSign,
  X,
  UserCheck,
  CreditCard,
  FileSpreadsheet,
  Download,
} from 'lucide-react';

export const WorkerManagement: React.FC = () => {
  const { workers, monthlySummaries, addWorker, bulkAddWorkers, updateWorker, deleteWorker, notify } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'active' | 'passive'>('active');
  const [isImporting, setIsImporting] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    cardNumber: '',
    firstName: '',
    lastName: '',
    role: '',
    dailyRate: 1500,
    overtimeHourlyRate: 281.25,
    phone: '',
    iban: '',
    department: 'Talaşlı İmalat',
    status: 'active' as 'active' | 'passive',
    startDate: new Date().toISOString().slice(0, 10),
    notes: '',
  });

  const departments = Array.from(new Set(workers.map((w) => w.department).filter(Boolean)));

  const filteredWorkers = workers.filter((w) => {
    const matchesSearch = `${w.firstName} ${w.lastName} ${w.code} ${w.cardNumber || ''} ${w.role}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || w.department === selectedDept;
    const matchesStatus = selectedStatus === 'ALL' || w.status === selectedStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingWorker(null);
    const nextCode = `YNR-${String(workers.length + 1).padStart(3, '0')}`;
    const nextCard = String(1000 + workers.length + 1);
    setFormData({
      code: nextCode,
      cardNumber: nextCard,
      firstName: '',
      lastName: '',
      role: 'Mekanik Montaj Elemanı',
      dailyRate: 1500,
      overtimeHourlyRate: 281.25,
      phone: '',
      iban: '',
      department: 'Montaj & Test',
      status: 'active',
      startDate: new Date().toISOString().slice(0, 10),
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (worker: Worker) => {
    setEditingWorker(worker);
    setFormData({
      code: worker.code,
      cardNumber: worker.cardNumber || '',
      firstName: worker.firstName,
      lastName: worker.lastName,
      role: worker.role,
      dailyRate: worker.dailyRate,
      overtimeHourlyRate: worker.overtimeHourlyRate,
      phone: worker.phone,
      iban: worker.iban,
      department: worker.department,
      status: worker.status,
      startDate: worker.startDate,
      notes: worker.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName) return;

    if (editingWorker) {
      updateWorker({
        ...editingWorker,
        ...formData,
      });
    } else {
      addWorker(formData);
    }
    setIsModalOpen(false);
  };

  // Auto calculate 1.5x overtime hourly rate when dailyRate changes
  const handleDailyRateChange = (val: number) => {
    const hourly = val / 8; // 8-hour workday
    const overtime = Number((hourly * 1.5).toFixed(2));
    setFormData((prev) => ({
      ...prev,
      dailyRate: val,
      overtimeHourlyRate: overtime,
    }));
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    try {
      setIsImporting(true);
      const parsed = await parseWorkersFromExcel(file);
      if (parsed.length === 0) {
        notify('Uyarı', 'Excel dosyasında personel kaydı bulunamadı.', 'warning');
        return;
      }
      bulkAddWorkers(parsed);
      notify('Excel Yüklendi', `${parsed.length} personel başarıyla aktarıldı ve kaydedildi.`, 'success');
    } catch (err: any) {
      notify('Hata', err.message || 'Excel dosyası okunamadı.', 'error');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx, .xls, .csv"
        onChange={handleExcelUpload}
        className="hidden"
      />

      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-400" />
            Personel & Kadro Yönetimi
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Çalışan listesini görün, yeni personel ekleyin veya Excel ile toplu yükleyin.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={downloadSampleWorkerExcel}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs transition border border-slate-700"
            title="Örnek Excel Şablonu İndir"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Şablon İndir</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3.5 py-2 rounded-xl text-xs transition shadow-md disabled:opacity-50"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{isImporting ? 'Yükleniyor...' : 'Excel\'den Yükle'}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition shadow-lg shadow-amber-500/20"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Yeni Personel</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Ad, soyad, unvan veya kod..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Dept Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Tüm Departmanlar</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="active">Aktif Çalışanlar</option>
            <option value="passive">Pasif / Ayrılanlar</option>
            <option value="ALL">Tümü</option>
          </select>
        </div>
      </div>

      {/* Workers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorkers.map((worker) => {
          const summary = monthlySummaries.find((s) => s.worker.id === worker.id);

          return (
            <div
              key={worker.id}
              className={`bg-slate-900 border rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all hover:border-slate-700 ${
                worker.status === 'active' ? 'border-slate-800' : 'border-rose-900/40 bg-slate-950/60'
              }`}
            >
              <div>
                {/* Top Badge & Code */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md">
                      {worker.code}
                    </span>
                    {worker.cardNumber && (
                      <span className="text-[11px] font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md flex items-center gap-1" title="Cihaz Geçiş Kart No">
                        <CreditCard className="w-3 h-3" />
                        {worker.cardNumber}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      worker.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {worker.status === 'active' ? 'Aktif' : 'Pasif'}
                  </span>
                </div>

                {/* Name & Role */}
                <h3 className="text-lg font-bold text-white">
                  {worker.firstName} {worker.lastName}
                </h3>
                <p className="text-xs text-amber-300/90 font-medium mb-3">{worker.role}</p>

                {/* Details List */}
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center justify-between bg-slate-800/40 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" /> Departman
                    </span>
                    <span className="font-semibold text-slate-200">{worker.department}</span>
                  </div>

                  <div className="flex items-center justify-between bg-slate-800/40 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Günlük Yövmiye
                    </span>
                    <span className="font-bold text-emerald-400 font-mono">
                      {formatCurrency(worker.dailyRate)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-slate-800/40 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-amber-400" /> Saatlik Mesai
                    </span>
                    <span className="font-bold text-amber-400 font-mono">
                      {formatCurrency(worker.overtimeHourlyRate)} /s
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {worker.phone || 'Telefon Yok'}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[10px]">
                      <Calendar className="w-3 h-3" /> {worker.startDate}
                    </span>
                  </div>
                </div>

                {/* Current Month Financial Stats */}
                {summary && (
                  <div className="mt-4 pt-3 border-t border-slate-800 bg-slate-950/50 p-3 rounded-xl">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400">Çalışılan Gün:</span>
                        <p className="font-bold text-white font-mono">
                          {summary.totalWorkedDaysEquivalent} gün (+{summary.totalOvertimeHours}s)
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400">Net Alacağı:</span>
                        <p className="font-bold text-amber-400 font-mono">
                          {formatCurrency(summary.netPayable)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2 mt-4 pt-3 border-t border-slate-800">
                <button
                  onClick={() => handleOpenEdit(worker)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1 border border-slate-700"
                >
                  <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Düzenle</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm(`${worker.firstName} ${worker.lastName} adlı personeli silmek istiyor musunuz?`)) {
                      deleteWorker(worker.id);
                    }
                  }}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center space-x-1 border border-rose-500/20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD / EDIT WORKER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingWorker ? 'Personel Bilgilerini Düzenle' : 'Yeni Personel Kaydı'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Personel Kodu
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
                  <label className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                    Kart No (Cihaz Geçiş Kartı)
                  </label>
                  <input
                    type="text"
                    placeholder="ör. 1001 veya 0012345"
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-indigo-500/40 rounded-xl px-3 py-2 text-sm text-indigo-300 font-mono font-bold focus:border-indigo-400 focus:outline-none placeholder-slate-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Departman / Şantiye
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Talaşlı İmalat">Talaşlı İmalat</option>
                    <option value="Kaynak & Şasi">Kaynak & Şasi</option>
                    <option value="Taşlama Elemanı">Taşlama Elemanı</option>
                    <option value="Montaj & Test">Montaj & Test</option>
                    <option value="Mühendislik & Kalite">Mühendislik & Kalite</option>
                    <option value="Saha Montaj">Saha Montaj</option>
                    <option value="Muhasebe Elemanı">Muhasebe Elemanı</option>
                    <option value="Ofis Çalışanı">Ofis Çalışanı</option>
                    <option value="İdari İşler & Yönetim">İdari İşler & Yönetim</option>
                    <option value="Depo & Sevkiyat">Depo & Sevkiyat</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Adı
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Soyadı
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Görevi / Unvanı
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ör. Torna Operatörü, Kaynak Ustası..."
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Daily wage rate */}
                <div>
                  <label className="text-xs font-semibold text-amber-400 uppercase tracking-wider block mb-1">
                    Günlük Yövmiye Ücreti (₺)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.dailyRate}
                    onChange={(e) => handleDailyRateChange(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-amber-400 font-bold font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Overtime hourly rate */}
                <div>
                  <label className="text-xs font-semibold text-amber-400 uppercase tracking-wider block mb-1">
                    Saatlik Mesai Ücreti (₺ / 1.5x)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.overtimeHourlyRate}
                    onChange={(e) =>
                      setFormData({ ...formData, overtimeHourlyRate: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-amber-400 font-bold font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Telefon Numarası
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    İşe Başlama Tarihi
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    IBAN Numarası
                  </label>
                  <input
                    type="text"
                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                    value={formData.iban}
                    onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
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
