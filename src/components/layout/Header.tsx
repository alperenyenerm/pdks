import React from 'react';
import { useApp } from '../../context/AppContext';
import { getMonthNameTr, formatCurrency } from '../../utils/calculations';
import {
  Wrench,
  ChevronLeft,
  ChevronRight,
  Calendar,
  DollarSign,
  Users,
  TrendingDown,
  PlusCircle,
  Download,
  Building2,
} from 'lucide-react';

import { MySQLStatusBadge } from '../ui/MySQLStatusBadge';

export const Header: React.FC = () => {
  const {
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
    monthlySummaries,
    setActiveTab,
    exportBackup,
  } = useApp();

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const totalGross = monthlySummaries.reduce((acc, curr) => acc + curr.totalGrossEarnings, 0);
  const totalAdvances = monthlySummaries.reduce((acc, curr) => acc + curr.totalAdvancesPaid, 0);
  const totalNet = monthlySummaries.reduce((acc, curr) => acc + curr.netPayable, 0);
  const activeWorkerCount = monthlySummaries.length;

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-xl print:hidden">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col xl:flex-row items-center justify-between py-3 gap-3">
          
          {/* Left: Brand Logo & Month Switcher */}
          <div className="flex flex-wrap items-center justify-between xl:justify-start w-full xl:w-auto gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
                <Wrench className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg font-bold tracking-tight text-white font-mono leading-none">
                    YNR <span className="text-amber-400">MAKİNE</span>
                  </h1>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/30">
                    PRO
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3 h-3 text-slate-500" />
                  Yövmiye & Puantaj Sistemi
                </p>
              </div>
            </div>

            {/* Month / Year Navigator */}
            <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-xl p-1 shadow-inner">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition"
                title="Önceki Ay"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-1.5 px-2">
                <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-xs font-bold text-white font-mono min-w-[95px] text-center whitespace-nowrap">
                  {getMonthNameTr(selectedMonth)} {selectedYear}
                </span>
              </div>

              <button
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition"
                title="Sonraki Ay"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <MySQLStatusBadge />
          </div>

          {/* Center / Right: Key Metric Cards (No text overflow) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full xl:w-auto">
            
            {/* Active Workers */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 flex items-center space-x-2.5 min-w-[130px]">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-slate-400 truncate">Aktif Personel</p>
                <p className="text-xs font-bold text-white font-mono whitespace-nowrap">
                  {activeWorkerCount} Kişi
                </p>
              </div>
            </div>

            {/* Gross Wage */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 flex items-center space-x-2.5 min-w-[145px]">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-slate-400 truncate">Brüt Hakediş</p>
                <p className="text-xs font-bold text-emerald-400 font-mono whitespace-nowrap">
                  {formatCurrency(totalGross)}
                </p>
              </div>
            </div>

            {/* Advances */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 flex items-center space-x-2.5 min-w-[135px]">
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 shrink-0">
                <TrendingDown className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-slate-400 truncate">Ödenen Avans</p>
                <p className="text-xs font-bold text-rose-400 font-mono whitespace-nowrap">
                  {formatCurrency(totalAdvances)}
                </p>
              </div>
            </div>

            {/* Net Payable */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2 flex items-center space-x-2.5 min-w-[145px]">
              <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-400 shrink-0">
                <Wrench className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-amber-300/90 font-medium truncate">Net Ödenecek</p>
                <p className="text-xs font-extrabold text-amber-400 font-mono whitespace-nowrap">
                  {formatCurrency(totalNet)}
                </p>
              </div>
            </div>

          </div>

          {/* Far Right: Header Action Buttons */}
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setActiveTab('attendance')}
              className="flex items-center justify-center space-x-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs transition shadow-md shadow-amber-500/20 whitespace-nowrap"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Puantaj Gir</span>
            </button>
            <button
              onClick={exportBackup}
              className="flex items-center justify-center space-x-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold px-3 py-2 rounded-xl text-xs transition whitespace-nowrap"
              title="Verileri İndir / Yedekle"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Yedekle</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
