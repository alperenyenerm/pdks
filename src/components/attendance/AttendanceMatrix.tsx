import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { AttendanceType, AttendanceRecord, Worker } from '../../types';
import { getDaysInMonth, getMonthNameTr, formatCurrency, calculateOvertimeFromTimes } from '../../utils/calculations';
import {
  Check,
  Zap,
  Search,
  X,
  Calendar as CalendarIcon,
  ChevronDown,
  RefreshCw,
  Sun,
  Briefcase,
  Clock,
} from 'lucide-react';

import { ShiftRotationModal } from './ShiftRotationModal';

export const AttendanceMatrix: React.FC = () => {
  const {
    workers,
    attendance,
    projects,
    selectedYear,
    selectedMonth,
    monthlySummaries,
    setAttendanceRecord,
    bulkSetAttendance,
    settings,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [isRotationModalOpen, setIsRotationModalOpen] = useState(false);
  
  // Selected Cell Modal State
  const [editingCell, setEditingCell] = useState<{
    worker: Worker;
    day: number;
    record?: AttendanceRecord;
    checkInTime?: string;
    checkOutTime?: string;
  } | null>(null);

  // Bulk Entry Modal State
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkDay, setBulkDay] = useState(1);
  const [bulkType, setBulkType] = useState<AttendanceType>('FULL');
  const [bulkOvertime, setBulkOvertime] = useState(0);
  const [bulkProject, setBulkProject] = useState('');

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Filter active workers
  const activeWorkers = workers.filter((w) => {
    if (w.status !== 'active') return false;
    const matchSearch = `${w.firstName} ${w.lastName} ${w.code} ${w.cardNumber || ''} ${w.role}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchDept = selectedDept === 'ALL' || w.department === selectedDept;
    return matchSearch && matchDept;
  });

  const departments = Array.from(new Set(workers.map((w) => w.department).filter(Boolean)));

  // Helper to get record
  const getRecordFor = (workerId: string, day: number): AttendanceRecord | undefined => {
    const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return attendance.find((r) => r.workerId === workerId && r.date === dateStr);
  };

  // Quick fill weekends as REST (HT) or WORK (HÇ)
  const handleFillWeekends = (type: 'WEEKEND' | 'WEEKEND_WORK') => {
    const newRecords: AttendanceRecord[] = [];
    
    daysArray.forEach((day) => {
      const dateObj = new Date(selectedYear, selectedMonth - 1, day);
      const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6; // Sunday or Saturday
      if (isWeekend) {
        const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        activeWorkers.forEach((w) => {
          newRecords.push({
            id: `att-${w.id}-${dateStr}`,
            workerId: w.id,
            date: dateStr,
            type,
            overtimeHours: type === 'WEEKEND_WORK' ? 8 : 0,
            overtimeMultiplier: 2.0,
          });
        });
      }
    });

    if (newRecords.length > 0) {
      bulkSetAttendance(newRecords);
    }
  };

  // Cell status styling & labels
  const getStatusBadge = (rec?: AttendanceRecord) => {
    if (!rec) {
      return (
        <div className="w-7 h-7 rounded-lg bg-slate-800/40 text-slate-600 flex items-center justify-center text-xs font-mono border border-slate-800 hover:border-slate-700">
          -
        </div>
      );
    }

    let bgClass = '';
    let text = '';

    switch (rec.type) {
      case 'FULL':
        bgClass = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold';
        text = '1';
        break;
      case 'HALF':
        bgClass = 'bg-blue-500/20 text-blue-400 border-blue-500/40 font-bold';
        text = '½';
        break;
      case 'WEEKEND':
        bgClass = 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40 font-bold';
        text = 'HT';
        break;
      case 'WEEKEND_WORK':
        bgClass = 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold ring-1 ring-amber-400/40';
        text = 'HÇ';
        break;
      case 'LEAVE':
        bgClass = 'bg-amber-500/20 text-amber-400 border-amber-500/40 font-bold';
        text = 'İ';
        break;
      case 'REPORT':
      case 'REPORT_PAID':
        bgClass = 'bg-purple-500/20 text-purple-400 border-purple-500/40 font-bold';
        text = 'ÜR';
        break;
      case 'REPORT_UNPAID':
        bgClass = 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold';
        text = 'ÜR-';
        break;
      case 'ABSENT':
        bgClass = 'bg-rose-500/20 text-rose-400 border-rose-500/40 font-bold';
        text = 'X';
        break;
    }

    return (
      <div className="relative group">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono border transition-all ${bgClass}`}
        >
          {text}
        </div>
        {rec.overtimeHours > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-950 font-extrabold text-[9px] px-1 rounded-full border border-amber-300 shadow">
            +{rec.overtimeHours}
          </span>
        )}
      </div>
    );
  };

  // Handle cell click
  const handleCellClick = (worker: Worker, day: number) => {
    const rec = getRecordFor(worker.id, day);
    setEditingCell({
      worker,
      day,
      record: rec,
      checkInTime: rec?.checkInTime || '08:00',
      checkOutTime: rec?.checkOutTime || '18:00',
    });
  };

  // Save single cell edit
  const handleSaveCell = (
    type: AttendanceType,
    overtimeHours: number,
    projectId?: string,
    checkInTime?: string,
    checkOutTime?: string
  ) => {
    if (!editingCell) return;
    const { worker, day } = editingCell;
    const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const finalCheckIn = checkInTime !== undefined ? checkInTime : editingCell.checkInTime;
    const finalCheckOut = checkOutTime !== undefined ? checkOutTime : editingCell.checkOutTime;

    // Auto calculate overtime if times modified
    let finalOvertime = overtimeHours;
    if (finalCheckIn && finalCheckOut && type !== 'ABSENT') {
      const autoOt = calculateOvertimeFromTimes(finalCheckIn, finalCheckOut, settings.workingHoursPerDay || 8);
      if (autoOt > 0 && overtimeHours === 0) {
        finalOvertime = autoOt;
      }
    }

    setAttendanceRecord({
      workerId: worker.id,
      date: dateStr,
      type,
      overtimeHours: finalOvertime,
      projectId: projectId || undefined,
      checkInTime: finalCheckIn,
      checkOutTime: finalCheckOut,
    });
    setEditingCell(null);
  };

  // Save bulk entry
  const handleApplyBulk = () => {
    const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(bulkDay).padStart(2, '0')}`;
    const newRecords = activeWorkers.map((w) => ({
      workerId: w.id,
      date: dateStr,
      type: bulkType,
      overtimeHours: bulkOvertime,
      projectId: bulkProject || undefined,
    }));
    bulkSetAttendance(newRecords);
    setIsBulkOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-amber-400" />
            {getMonthNameTr(selectedMonth)} {selectedYear} Aylık Puantaj Cetveli
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Giriş-Çıkış saatleri, ücretli/ücretsiz raporlar ve hafta sonu mesaileri otomatik işlenebilir.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleFillWeekends('WEEKEND')}
            className="flex items-center space-x-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-2 rounded-xl text-xs font-semibold transition"
            title="Aydaki tüm hafta sonlarını Ücretli Tatil (HT) olarak doldurur"
          >
            <Sun className="w-3.5 h-3.5 text-indigo-400" />
            <span>Hafta Sonları Tatil (HT)</span>
          </button>

          <button
            onClick={() => handleFillWeekends('WEEKEND_WORK')}
            className="flex items-center space-x-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-2 rounded-xl text-xs font-semibold transition"
            title="Aydaki tüm hafta sonlarını Mesaili Çalışma (HÇ) olarak doldurur"
          >
            <Briefcase className="w-3.5 h-3.5 text-amber-400" />
            <span>Hafta Sonları Çalışma (HÇ)</span>
          </button>

          <button
            onClick={() => setIsRotationModalOpen(true)}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-3 py-2 rounded-xl text-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Vardiya Planla</span>
          </button>

          <button
            onClick={() => setIsBulkOpen(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition shadow-md"
          >
            <Zap className="w-4 h-4" />
            <span>Toplu Giriş Yap</span>
          </button>
        </div>
      </div>

      {/* Filter & Legend */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-slate-900/50 border border-slate-800/80 p-4 rounded-xl">
        {/* Status Legend */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Kategoriler:</span>
          <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
            <b className="text-emerald-400">1</b> Tam Gün
          </span>
          <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded font-mono">
            <b className="text-blue-400">½</b> Yarım Gün
          </span>
          <span className="inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded font-mono">
            <b className="text-indigo-400">HT</b> Hafta Sonu Tatili (Ücretli)
          </span>
          <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-mono">
            <b className="text-amber-400">HÇ</b> Hafta Sonu Çalışması (Mesaili)
          </span>
          <span className="inline-flex items-center gap-1 bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded font-mono">
            <b className="text-purple-400">ÜR</b> Ücretli Rapor
          </span>
          <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded font-mono">
            <b className="text-rose-300">ÜR-</b> Ücretsiz Rapor
          </span>
          <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono">
            <b className="text-amber-300">İ</b> İzinli
          </span>
          <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded font-mono">
            <b className="text-rose-400">X</b> Gelmedi
          </span>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Personel ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Dept Dropdown */}
          <div className="relative">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 pr-8 appearance-none"
            >
              <option value="ALL">Tüm Departmanlar</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Dynamic Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 sticky left-0 z-20 bg-slate-950 w-60 border-r border-slate-800 shadow-md">
                  Personel (Ad Soyad / Görev)
                </th>
                <th className="py-3 px-2 text-center w-20 border-r border-slate-800">
                  Yövmiye (₺)
                </th>

                {/* Days Columns */}
                {daysArray.map((day) => {
                  const dateObj = new Date(selectedYear, selectedMonth - 1, day);
                  const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                  return (
                    <th
                      key={day}
                      className={`py-2 px-1 text-center w-9 border-r border-slate-800/60 font-mono ${
                        isWeekend ? 'bg-indigo-950/40 text-amber-400 font-bold' : 'text-slate-300'
                      }`}
                    >
                      <div className={`text-[10px] ${isWeekend ? 'text-indigo-400 font-bold' : 'text-slate-500'} font-sans`}>
                        {['Pz', 'Pt', 'Sa', 'Çr', 'Pş', 'Cu', 'Ct'][dateObj.getDay()]}
                      </div>
                      <div>{day}</div>
                    </th>
                  );
                })}

                {/* Summary Headers */}
                <th className="py-3 px-2 text-center w-14 border-r border-slate-800 bg-slate-950/80 text-emerald-400">
                  Gün
                </th>
                <th className="py-3 px-2 text-center w-14 border-r border-slate-800 bg-slate-950/80 text-amber-400">
                  Mesai
                </th>
                <th className="py-3 px-3 text-right w-28 border-r border-slate-800 bg-slate-950/80 text-slate-200">
                  Brüt Hakediş
                </th>
                <th className="py-3 px-3 text-right w-28 bg-amber-500/10 text-amber-400">
                  Net Ödenecek
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 text-xs">
              {activeWorkers.map((worker) => {
                const summary = monthlySummaries.find((s) => s.worker.id === worker.id);

                return (
                  <tr key={worker.id} className="hover:bg-slate-800/40 transition">
                    {/* Sticky Worker Name */}
                    <td className="py-2.5 px-4 sticky left-0 z-10 bg-slate-900 border-r border-slate-800">
                      <div className="font-bold text-white text-sm">
                        {worker.firstName} {worker.lastName}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-between">
                        <span>{worker.role}</span>
                        <span className="text-[10px] text-amber-400/80 font-mono font-medium">
                          {worker.code}
                        </span>
                      </div>
                    </td>

                    {/* Daily Rate */}
                    <td className="py-2.5 px-2 text-center border-r border-slate-800 font-mono text-slate-300">
                      {formatCurrency(worker.dailyRate)}
                    </td>

                    {/* Days Cells */}
                    {daysArray.map((day) => {
                      const rec = getRecordFor(worker.id, day);
                      const dateObj = new Date(selectedYear, selectedMonth - 1, day);
                      const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

                      return (
                        <td
                          key={day}
                          onClick={() => handleCellClick(worker, day)}
                          className={`py-1 px-0.5 text-center border-r border-slate-800/40 cursor-pointer hover:bg-amber-400/10 transition ${
                            isWeekend ? 'bg-indigo-950/20' : ''
                          }`}
                        >
                          <div className="flex items-center justify-center">
                            {getStatusBadge(rec)}
                          </div>
                        </td>
                      );
                    })}

                    {/* Summary Cells */}
                    <td className="py-2.5 px-2 text-center border-r border-slate-800 font-mono font-bold text-emerald-400">
                      {summary?.totalWorkedDaysEquivalent || 0}
                    </td>
                    <td className="py-2.5 px-2 text-center border-r border-slate-800 font-mono font-bold text-amber-400">
                      {summary?.totalOvertimeHours || 0}s
                    </td>
                    <td className="py-2.5 px-3 text-right border-r border-slate-800 font-mono font-semibold text-slate-200">
                      {formatCurrency(summary?.totalGrossEarnings || 0)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-400 bg-amber-500/5">
                      {formatCurrency(summary?.netPayable || 0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SINGLE CELL EDIT MODAL WITH CHECK IN/OUT */}
      {editingCell && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  Puantaj & Saat Kaydı: {editingCell.worker.firstName} {editingCell.worker.lastName}
                </h3>
                <p className="text-xs text-amber-400 font-mono">
                  Tarih: {editingCell.day} {getMonthNameTr(selectedMonth)} {selectedYear}
                </p>
              </div>
              <button
                onClick={() => setEditingCell(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Check-In / Check-Out Times */}
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-2">
              <label className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Giriş & Çıkış Saatleri (Otomatik Mesai Hesaplama)</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Giriş Saati</label>
                  <input
                    type="time"
                    value={editingCell.checkInTime || '08:00'}
                    onChange={(e) => {
                      const newIn = e.target.value;
                      const autoOt = calculateOvertimeFromTimes(newIn, editingCell.checkOutTime || '18:00', settings.workingHoursPerDay || 8);
                      setEditingCell({ ...editingCell, checkInTime: newIn, record: editingCell.record ? { ...editingCell.record, overtimeHours: autoOt } : undefined });
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Çıkış Saati</label>
                  <input
                    type="time"
                    value={editingCell.checkOutTime || '18:00'}
                    onChange={(e) => {
                      const newOut = e.target.value;
                      const autoOt = calculateOvertimeFromTimes(editingCell.checkInTime || '08:00', newOut, settings.workingHoursPerDay || 8);
                      setEditingCell({ ...editingCell, checkOutTime: newOut, record: editingCell.record ? { ...editingCell.record, overtimeHours: autoOt } : undefined });
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Quick Status Buttons */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Kategori / Devam Durumu
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: 'FULL', label: 'Tam Gün (1.0)', color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' },
                  { type: 'HALF', label: 'Yarım Gün (0.5)', color: 'border-blue-500/50 bg-blue-500/10 text-blue-400' },
                  { type: 'WEEKEND', label: 'Hafta Sonu Tatili (HT)', color: 'border-indigo-500/50 bg-indigo-500/10 text-indigo-400' },
                  { type: 'WEEKEND_WORK', label: 'Hafta Sonu Çalışması (HÇ)', color: 'border-amber-500/50 bg-amber-500/10 text-amber-400' },
                  { type: 'REPORT_PAID', label: 'Ücretli Rapor (ÜR)', color: 'border-purple-500/50 bg-purple-500/10 text-purple-400' },
                  { type: 'REPORT_UNPAID', label: 'Ücretsiz Rapor (ÜR-)', color: 'border-rose-500/50 bg-rose-500/10 text-rose-300' },
                  { type: 'LEAVE', label: 'İzinli (İ)', color: 'border-amber-500/30 bg-amber-500/5 text-amber-300' },
                  { type: 'ABSENT', label: 'Gelmedi (X)', color: 'border-rose-500/50 bg-rose-500/10 text-rose-400' },
                ].map((item) => {
                  const isSelected = (editingCell.record?.type || 'FULL') === item.type;
                  return (
                    <button
                      key={item.type}
                      onClick={() =>
                        handleSaveCell(
                          item.type as AttendanceType,
                          editingCell.record?.overtimeHours || (item.type === 'WEEKEND_WORK' ? 8 : 0),
                          editingCell.record?.projectId,
                          editingCell.checkInTime,
                          editingCell.checkOutTime
                        )
                      }
                      className={`p-2.5 rounded-xl border text-xs font-bold text-left transition flex items-center justify-between ${item.color} ${
                        isSelected ? 'ring-2 ring-amber-400' : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Overtime Hours Input */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Fazla Mesai Saati</span>
                <span className="text-amber-400 font-mono">
                  {editingCell.record?.overtimeHours || 0} Saat (₺
                  {((editingCell.record?.overtimeHours || 0) * editingCell.worker.overtimeHourlyRate).toFixed(0)})
                </span>
              </label>

              <div className="grid grid-cols-5 gap-2">
                {[0, 1, 2, 4, 8].map((hrs) => (
                  <button
                    key={hrs}
                    onClick={() =>
                      handleSaveCell(
                        editingCell.record?.type || 'FULL',
                        hrs,
                        editingCell.record?.projectId,
                        editingCell.checkInTime,
                        editingCell.checkOutTime
                      )
                    }
                    className={`py-2 rounded-xl border text-xs font-bold font-mono transition ${
                      (editingCell.record?.overtimeHours || 0) === hrs
                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-extrabold'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    +{hrs}s
                  </button>
                ))}
              </div>
            </div>

            {/* Project Selector */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Çalışılan Proje / Makine Siparişi
              </label>
              <select
                value={editingCell.record?.projectId || ''}
                onChange={(e) =>
                  handleSaveCell(
                    editingCell.record?.type || 'FULL',
                    editingCell.record?.overtimeHours || 0,
                    e.target.value,
                    editingCell.checkInTime,
                    editingCell.checkOutTime
                  )
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Proje Seçilmedi --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* BULK ENTRY MODAL */}
      {isBulkOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Toplu Puantaj Girişi</h3>
              </div>
              <button
                onClick={() => setIsBulkOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Uygulanacak Gün
                </label>
                <select
                  value={bulkDay}
                  onChange={(e) => setBulkDay(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {daysArray.map((d) => (
                    <option key={d} value={d}>
                      {d} {getMonthNameTr(selectedMonth)} {selectedYear}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Devam Durumu / Kategori
                </label>
                <select
                  value={bulkType}
                  onChange={(e) => setBulkType(e.target.value as AttendanceType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="FULL">Tam Gün (1.0)</option>
                  <option value="HALF">Yarım Gün (0.5)</option>
                  <option value="WEEKEND">Hafta Sonu Tatili (HT - Ücretli)</option>
                  <option value="WEEKEND_WORK">Hafta Sonu Çalışması (HÇ - Mesaili)</option>
                  <option value="REPORT_PAID">Ücretli Rapor (ÜR)</option>
                  <option value="REPORT_UNPAID">Ücretsiz Rapor (ÜR-)</option>
                  <option value="LEAVE">İzinli (İ)</option>
                  <option value="ABSENT">Gelmedi (X)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Ek Fazla Mesai Saati
                </label>
                <input
                  type="number"
                  min="0"
                  max="12"
                  value={bulkOvertime}
                  onChange={(e) => setBulkOvertime(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Proje Seçimi
                </label>
                <select
                  value={bulkProject}
                  onChange={(e) => setBulkProject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Proje Yok --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
              <button
                onClick={() => setIsBulkOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
              >
                İptal
              </button>
              <button
                onClick={handleApplyBulk}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs transition shadow-md"
              >
                Uygula ({activeWorkers.length} Personel)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHIFT ROTATION MODAL */}
      <ShiftRotationModal isOpen={isRotationModalOpen} onClose={() => setIsRotationModalOpen(false)} />
    </div>
  );
};
