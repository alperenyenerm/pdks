import React, { useState } from 'react';
import { Calendar, Plus, CheckCircle2, Save } from 'lucide-react';
import type { Worker } from '../../types';

interface PDKSWorkPlanScheduleProps {
  workers: Worker[];
}

export const PDKSWorkPlanSchedule: React.FC<PDKSWorkPlanScheduleProps> = ({
  workers: _workers
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('Sabit Grup');
  const [selectedMonth, setSelectedMonth] = useState<string>('Ağustos');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  // Generate days for August 2026 based on Screenshot 4
  const [daysSchedule, setDaysSchedule] = useState([
    { dateStr: '01 Ağustos 2026, Cumartesi', dayNum: 1, dayName: 'Cumartesi', shift: 'Cumartesi (08:00-13:00)' },
    { dateStr: '02 Ağustos 2026, Pazar', dayNum: 2, dayName: 'Pazar', shift: 'Tatil' },
    { dateStr: '03 Ağustos 2026, Pazartesi', dayNum: 3, dayName: 'Pazartesi', shift: '08:00-18:00' },
    { dateStr: '04 Ağustos 2026, Salı', dayNum: 4, dayName: 'Salı', shift: '08:00-18:00' },
    { dateStr: '05 Ağustos 2026, Çarşamba', dayNum: 5, dayName: 'Çarşamba', shift: '08:00-18:00' },
    { dateStr: '06 Ağustos 2026, Perşembe', dayNum: 6, dayName: 'Perşembe', shift: '08:00-18:00' },
    { dateStr: '07 Ağustos 2026, Cuma', dayNum: 7, dayName: 'Cuma', shift: '08:00-18:00' },
    { dateStr: '08 Ağustos 2026, Cumartesi', dayNum: 8, dayName: 'Cumartesi', shift: 'Cumartesi (08:00-13:00)' },
    { dateStr: '09 Ağustos 2026, Pazar', dayNum: 9, dayName: 'Pazar', shift: 'Tatil' },
    { dateStr: '10 Ağustos 2026, Pazartesi', dayNum: 10, dayName: 'Pazartesi', shift: '08:00-18:00' },
    { dateStr: '11 Ağustos 2026, Salı', dayNum: 11, dayName: 'Salı', shift: '08:00-18:00' },
    { dateStr: '12 Ağustos 2026, Çarşamba', dayNum: 12, dayName: 'Çarşamba', shift: '08:00-18:00' },
    { dateStr: '13 Ağustos 2026, Perşembe', dayNum: 13, dayName: 'Perşembe', shift: '08:00-18:00' },
    { dateStr: '14 Ağustos 2026, Cuma', dayNum: 14, dayName: 'Cuma', shift: '08:00-18:00' },
    { dateStr: '15 Ağustos 2026, Cumartesi', dayNum: 15, dayName: 'Cumartesi', shift: 'Cumartesi (08:00-13:00)' },
  ]);

  const handleShiftChange = (index: number, newShift: string) => {
    setDaysSchedule(prev => prev.map((item, i) => i === index ? { ...item, shift: newShift } : item));
  };

  const handleSavePlan = () => {
    setSavedMessage(`${selectedGroup} için ${selectedMonth} ${selectedYear} çalışma planı güncellendi.`);
    setTimeout(() => setSavedMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/90 p-5 rounded-xl border border-slate-700/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <Calendar className="w-5 h-5 text-indigo-400" />
            Perkotek Çalışma Planları & Vardiya Takvimi
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Genel Gruplar & Personele Özel Çalışma Planları</h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Aylık takvim üzerinde günlük vardiyaları atama (08:00-18:00, Cumartesi 08:00-13:00, Pazar Tatil).
          </p>
        </div>
        <button 
          onClick={handleSavePlan}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition shadow flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Planı Kaydet
        </button>
      </div>

      {savedMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Main Split Screen (Replica of Perkotek Screenshot 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Pane: Groups List */}
        <div className="bg-slate-800/90 border border-slate-700/60 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Çalışma Grupları</h3>
            <button className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" />
              Ekle
            </button>
          </div>

          <div className="space-y-2">
            {['Sabit Grup', 'Vardiyalı İmalat Kadrosu', 'Haftasonu Nöbetçi Ekip', 'İdari Büro Kadrosu'].map((grp, idx) => (
              <div 
                key={idx}
                onClick={() => setSelectedGroup(grp)}
                className={`p-3 rounded-lg border text-sm font-semibold flex items-center justify-between cursor-pointer transition ${
                  selectedGroup === grp
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                    : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:bg-slate-700/40'
                }`}
              >
                <span>{grp}</span>
                <span className="text-[10px] px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-slate-400">
                  {idx === 0 ? '74 Personel' : 'Aktif'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Pane: Monthly Days & Shift Assign Table */}
        <div className="lg:col-span-2 bg-slate-800/90 border border-slate-700/60 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-700 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">{selectedGroup} - Günlük Vardiya Atamaları</h3>
              <p className="text-xs text-slate-400">Seçilen grup için gün bazlı çalışma saatleri</p>
            </div>
            <div className="flex items-center gap-2">
              <select 
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white"
              >
                <option value="Ağustos">Ağustos</option>
                <option value="Eylül">Eylül</option>
                <option value="Ekim">Ekim</option>
              </select>
              <select 
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white"
              >
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>
          </div>

          <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1">
            {daysSchedule.map((item, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg border flex items-center justify-between text-xs transition ${
                  item.dayName === 'Pazar' 
                    ? 'bg-rose-950/20 border-rose-500/20' 
                    : item.dayName === 'Cumartesi'
                    ? 'bg-amber-950/20 border-amber-500/20'
                    : 'bg-slate-900/80 border-slate-700/60'
                }`}
              >
                <div className="font-semibold text-slate-200 w-52 font-mono">
                  {item.dateStr}
                </div>
                <div className="flex-1 max-w-xs">
                  <select 
                    value={item.shift}
                    onChange={e => handleShiftChange(index, e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="08:00-18:00">08:00-18:00 (Normal Tam Gün)</option>
                    <option value="Cumartesi (08:00-13:00)">Cumartesi (08:00-13:00 Yarım Gün)</option>
                    <option value="Tatil">Tatil (Pazar / Hafta Tatili)</option>
                    <option value="Resmi Tatil">Resmi Tatil</option>
                  </select>
                </div>
                <div className="text-[11px] font-mono text-indigo-300 w-24 text-right">
                  {item.shift.includes('18:00') ? '9 Saat' : item.shift.includes('13:00') ? '4.5 Saat' : '0 Saat'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
