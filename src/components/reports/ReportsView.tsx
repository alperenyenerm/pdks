import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getMonthNameTr, formatCurrency, getDaysInMonth } from '../../utils/calculations';
import type { AttendanceRecord, AttendanceType } from '../../types';
import * as XLSX from 'xlsx';
import {
  Printer,
  FileSpreadsheet,
  Download,
  User,
  Layers,
  FileText,
  Send,
  Building2,
  Clock,
  ShieldCheck,
  CalendarX,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { WhatsAppModal } from './WhatsAppModal';
import { BankPaymentModal } from './BankPaymentModal';

export interface MissingDateDetail {
  date: string; // e.g. "05.08"
  dayNumber: number;
  type: AttendanceType;
  label: string;
  badgeClass: string;
}

export const getWorkerMissingDateDetails = (
  workerId: string,
  year: number,
  month: number,
  attendance: AttendanceRecord[]
): MissingDateDetail[] => {
  const monthStr = String(month).padStart(2, '0');
  const workerRecords = attendance.filter(
    (a) => a.workerId === workerId && a.date.startsWith(`${year}-${monthStr}`)
  );

  const missingDetails: MissingDateDetail[] = [];

  workerRecords.forEach((rec) => {
    const parts = rec.date.split('-');
    const dayNum = parseInt(parts[2] || '0');
    const dateFormatted = `${String(dayNum).padStart(2, '0')}.${monthStr}`;

    if (rec.type === 'ABSENT') {
      missingDetails.push({
        date: dateFormatted,
        dayNumber: dayNum,
        type: rec.type,
        label: 'Devamsız (Gelmedi)',
        badgeClass: 'bg-rose-500/20 text-rose-400 border border-rose-500/40 print:bg-rose-100 print:text-rose-900 print:border-rose-300 font-bold',
      });
    } else if (rec.type === 'REPORT_UNPAID') {
      missingDetails.push({
        date: dateFormatted,
        dayNumber: dayNum,
        type: rec.type,
        label: 'Ücretsiz Rapor',
        badgeClass: 'bg-purple-500/20 text-purple-400 border border-purple-500/40 print:bg-purple-100 print:text-purple-900 print:border-purple-300 font-bold',
      });
    } else if (rec.type === 'HALF') {
      missingDetails.push({
        date: dateFormatted,
        dayNumber: dayNum,
        type: rec.type,
        label: 'Yarım Gün',
        badgeClass: 'bg-amber-500/20 text-amber-400 border border-amber-500/40 print:bg-amber-100 print:text-amber-900 print:border-amber-300 font-bold',
      });
    } else if (rec.type === 'LEAVE') {
      missingDetails.push({
        date: dateFormatted,
        dayNumber: dayNum,
        type: rec.type,
        label: 'İzinli',
        badgeClass: 'bg-blue-500/20 text-blue-400 border border-blue-500/40 print:bg-blue-100 print:text-blue-900 print:border-blue-300 font-bold',
      });
    }
  });

  return missingDetails.sort((a, b) => a.dayNumber - b.dayNumber);
};

const CompanyHeaderLogo: React.FC<{ companyName: string; title: string; taxNo: string; phone: string; address: string }> = ({
  companyName,
  title,
  taxNo,
  phone,
  address,
}) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-slate-800 print:border-amber-500 pb-4 mb-4 gap-4">
    <div className="flex items-center space-x-3.5">
      {/* Modern High-End Emblem */}
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-600 to-amber-400 p-0.5 shadow-xl flex items-center justify-center shrink-0 print:bg-amber-500 print:border-none">
        <div className="w-full h-full bg-slate-950 print:bg-slate-950 rounded-[14px] flex flex-col items-center justify-center p-1">
          <div className="flex items-center justify-center space-x-0.5">
            <span className="text-amber-400 font-black text-xs font-mono tracking-tighter print:text-amber-400">YNR</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 print:bg-amber-400"></span>
          </div>
          <span className="text-[8px] font-black text-white print:text-white tracking-widest font-mono">MAKİNE</span>
        </div>
      </div>

      <div>
        <div className="flex items-center space-x-2">
          <h1 className="text-lg font-black text-white print:text-slate-900 uppercase tracking-tight font-mono">
            {companyName}
          </h1>
        </div>
        <p className="text-xs text-amber-400 print:text-amber-700 font-bold mt-0.5">{title}</p>
        <p className="text-[10px] text-slate-400 print:text-slate-600 font-mono mt-0.5">
          Vergi D. / No: {taxNo} | Tel: {phone}
        </p>
        <p className="text-[10px] text-slate-500 print:text-slate-600 font-mono truncate max-w-md">
          {address}
        </p>
      </div>
    </div>

    {/* Official Verification Badge */}
    <div className="text-right shrink-0 hidden sm:block">
      <div className="inline-flex items-center space-x-1.5 bg-slate-950 print:bg-amber-50 border border-slate-800 print:border-amber-300 px-3 py-1 rounded-xl text-[10px] font-mono font-bold text-slate-300 print:text-amber-900 mb-1 shadow-sm">
        <ShieldCheck className="w-4 h-4 text-emerald-400 print:text-emerald-600" />
        <span>RESMİ MAAŞ & İK BORDROSU</span>
      </div>
      <p className="text-[10px] text-slate-400 print:text-slate-500 font-mono">
        Onay Kodu: YNR-{Date.now().toString().substring(6)}
      </p>
    </div>
  </div>
);

export const ReportsView: React.FC = () => {
  const {
    settings,
    selectedYear,
    selectedMonth,
    monthlySummaries,
    workers,
    attendance,
  } = useApp();

  const [reportType, setReportType] = useState<'matrix' | 'payroll' | 'slip' | 'roster'>('payroll');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(workers[0]?.id || '');
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Excel Export
  const handleExportExcel = () => {
    const data = monthlySummaries.map((s) => {
      const missingList = getWorkerMissingDateDetails(s.worker.id, selectedYear, selectedMonth, attendance);
      const missingStr = missingList.length > 0 ? missingList.map((m) => `${m.date} (${m.label})`).join(', ') : 'Tam Devamlılık';

      return {
        'Personel Kodu': s.worker.code,
        'Ad Soyad': `${s.worker.firstName} ${s.worker.lastName}`,
        'Görevi / Unvan': s.worker.role,
        Departman: s.worker.department,
        'Günlük Yövmiye (TL)': s.worker.dailyRate,
        'Saatlik Mesai (TL)': s.worker.overtimeHourlyRate,
        'Tam Gün': s.fullDays,
        'Yarım Gün': s.halfDays,
        'Hafta Sonu Tatil (HT)': s.weekendDays,
        'Hafta Sonu Çalışması (HÇ)': s.weekendWorkDays,
        'Ücretli Rapor (ÜR)': s.paidReportDays,
        'Ücretsiz Rapor (ÜR-)': s.unpaidReportDays,
        'İzinli Gün': s.leaveDays,
        Devamsız: s.absentDays,
        'Eksik Gün Tarihleri': missingStr,
        'Eşdeğer Hak Gün': s.totalWorkedDaysEquivalent,
        'Gece Vardiyası Gün': s.nightShiftDays,
        'Gece Vardiya Primi (TL)': s.nightShiftBonusEarnings,
        'Mesai Saati': s.totalOvertimeHours,
        'Yövmiye Hakedişi (TL)': s.baseWageEarnings,
        'Mesai Hakedişi (TL)': s.overtimeEarnings,
        'Yemek Yardımı (TL)': s.totalMealAllowances,
        'Yol Yardımı (TL)': s.totalTransportAllowances,
        'Brüt Toplam Kazanç (TL)': s.totalGrossEarnings,
        'Ödenen Avans (TL)': s.totalAdvancesPaid,
        'Prim / Ekstra (TL)': s.totalBonusesPaid,
        'Net Ödenecek Tutar (TL)': s.netPayable,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Detaylı Maaş Bordrosu');

    const fileName = `YNR_Makine_Bordro_${getMonthNameTr(selectedMonth)}_${selectedYear}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedSummary = monthlySummaries.find((s) => s.worker.id === selectedWorkerId);

  // Tax & SSI Simulation Calculations for Payslip
  const calculateDetailedPayslip = (summary: typeof selectedSummary) => {
    if (!summary) return null;

    const enableTaxes = settings.enableAutomaticTaxes ?? true;
    const sgkRate = (settings.sgkWorkerPercent ?? 14) / 100;
    const unempRate = (settings.unemploymentWorkerPercent ?? 1) / 100;
    const incomeRate = (settings.incomeTaxPercent ?? 15) / 100;
    const stampRate = (settings.stampTaxPercent ?? 0.759) / 100;

    const gross = summary.totalGrossEarnings;
    const sgkWorker = enableTaxes ? gross * sgkRate : 0;
    const unemploymentWorker = enableTaxes ? gross * unempRate : 0;
    const taxBase = gross - (sgkWorker + unemploymentWorker);
    const incomeTax = enableTaxes ? taxBase * incomeRate : 0;
    const stampTax = enableTaxes ? gross * stampRate : 0;
    const totalTaxesAndSSI = sgkWorker + unemploymentWorker + incomeTax + stampTax;

    const totalDeductionsAll = totalTaxesAndSSI + summary.totalAdvancesPaid + summary.totalDeductions;
    const finalNetPayable = Math.max(0, gross - totalDeductionsAll);

    return {
      gross,
      sgkWorker,
      unemploymentWorker,
      taxBase,
      incomeTax,
      stampTax,
      totalTaxesAndSSI,
      totalDeductionsAll,
      finalNetPayable,
    };
  };

  const detailedTax = calculateDetailedPayslip(selectedSummary);

  const selectedMissingDateDetails = selectedSummary
    ? getWorkerMissingDateDetails(selectedSummary.worker.id, selectedYear, selectedMonth, attendance)
    : [];

  return (
    <div className="space-y-6 print:p-0 print:space-y-4">
      {/* Print Color Adjustments CSS */}
      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background-color: white !important;
            color: #0f172a !important;
          }
          .print-color-exact {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* Top Controls Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg print:hidden">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            Resmi Bordro, Pusula & Rapor Merkezi
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Eksik gün tarihli, modern renkli baskıya ve PDF çıktısına tam uyumlu resmi evraklar
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setIsBankModalOpen(true)}
            className="flex-1 md:flex-initial flex items-center justify-center space-x-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 font-semibold px-3 py-2 rounded-xl text-xs transition"
          >
            <Building2 className="w-4 h-4" />
            <span>Banka EFT/Havale Talimatı</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex-1 md:flex-initial flex items-center justify-center space-x-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-semibold px-3 py-2 rounded-xl text-xs transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel İndir</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 md:flex-initial flex items-center justify-center space-x-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>Bordro Yazdır / PDF</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 print:hidden">
        <button
          onClick={() => setReportType('payroll')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            reportType === 'payroll'
              ? 'bg-amber-400 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Detaylı Ücret Bordrosu</span>
        </button>

        <button
          onClick={() => setReportType('slip')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            reportType === 'slip'
              ? 'bg-amber-400 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Resmi Maaş Pusulası (Bireysel)</span>
        </button>

        <button
          onClick={() => setReportType('roster')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            reportType === 'roster'
              ? 'bg-amber-400 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Personel Vardiya Çizelgesi</span>
        </button>

        <button
          onClick={() => setReportType('matrix')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            reportType === 'matrix'
              ? 'bg-amber-400 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Aylık Imzalı Puantaj Cetveli</span>
        </button>
      </div>

      {/* REPORT TYPE 1: Detaylı Ücret Bordrosu Tablosu */}
      {reportType === 'payroll' && (
        <div className="bg-slate-900 print:bg-white text-slate-100 print:text-slate-900 border border-slate-800 print:border-slate-300 rounded-3xl p-6 shadow-xl space-y-6 print:shadow-none print:p-4">
          <CompanyHeaderLogo
            companyName={settings.companyName}
            title={settings.title}
            taxNo={settings.taxNo}
            phone={settings.phone}
            address={settings.address}
          />

          <div className="flex justify-between items-center bg-slate-950 print:bg-slate-100 p-3 rounded-2xl border border-slate-800 print:border-slate-300 print-color-exact">
            <h2 className="text-sm font-extrabold text-amber-400 print:text-amber-900 uppercase tracking-wider">
              DETAYLI PERSONEL ÜCRET BORDROSU CETVELİ
            </h2>
            <span className="text-xs font-mono font-bold text-white print:text-slate-900 bg-slate-900 print:bg-white border border-slate-800 print:border-slate-300 px-3 py-1 rounded-xl">
              DÖNEM: {getMonthNameTr(selectedMonth).toUpperCase()} {selectedYear}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs print:text-[10px]">
              <thead>
                <tr className="bg-slate-950 print:bg-slate-800 text-slate-300 print:text-white border border-slate-800 print:border-slate-700 font-semibold print-color-exact">
                  <th className="py-2.5 px-3 border border-slate-800 print:border-slate-700">Personel / Görev</th>
                  <th className="py-2.5 px-2 border border-slate-800 print:border-slate-700 text-center">Hak Gün</th>
                  <th className="py-2.5 px-2 border border-slate-800 print:border-slate-700 text-right">Yövmiye (₺)</th>
                  <th className="py-2.5 px-2 border border-slate-800 print:border-slate-700 text-right text-indigo-400 print:text-indigo-200">Yol (₺)</th>
                  <th className="py-2.5 px-2 border border-slate-800 print:border-slate-700 text-right text-emerald-400 print:text-emerald-200">Yemek (₺)</th>
                  <th className="py-2.5 px-2 border border-slate-800 print:border-slate-700 text-right text-amber-400 print:text-amber-200">Gece (₺)</th>
                  <th className="py-2.5 px-2 border border-slate-800 print:border-slate-700 text-right text-amber-300 print:text-amber-200">Mesai (₺)</th>
                  <th className="py-2.5 px-2 border border-slate-800 print:border-slate-700 text-right font-bold text-emerald-400 print:text-emerald-200">Brüt Toplam</th>
                  <th className="py-2.5 px-2 border border-slate-800 print:border-slate-700 text-right text-rose-400 print:text-rose-200">Avans/Kesinti</th>
                  <th className="py-2.5 px-2 border border-slate-800 print:border-slate-700 text-left text-amber-400 print:text-amber-200">Eksik Gün Tarihleri</th>
                  <th className="py-2.5 px-3 border border-slate-800 print:border-slate-700 text-right font-extrabold bg-amber-500/10 text-amber-400 print:text-amber-300">Net Ödenecek</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                {monthlySummaries.map((s) => {
                  const missingList = getWorkerMissingDateDetails(s.worker.id, selectedYear, selectedMonth, attendance);

                  return (
                    <tr key={s.worker.id} className="hover:bg-slate-800/40 print:hover:bg-transparent">
                      <td className="py-2.5 px-3 border border-slate-800 print:border-slate-200">
                        <div className="font-bold text-white print:text-slate-900">{s.worker.firstName} {s.worker.lastName}</div>
                        <div className="text-[10px] text-slate-400 print:text-slate-600">{s.worker.role} ({s.worker.code})</div>
                      </td>
                      <td className="py-2.5 px-2 border border-slate-800 print:border-slate-200 text-center font-mono font-bold">
                        {s.totalWorkedDaysEquivalent} G
                      </td>
                      <td className="py-2.5 px-2 border border-slate-800 print:border-slate-200 text-right font-mono">
                        {formatCurrency(s.baseWageEarnings)}
                      </td>
                      <td className="py-2.5 px-2 border border-slate-800 print:border-slate-200 text-right font-mono text-indigo-300 print:text-indigo-900">
                        {formatCurrency(s.totalTransportAllowances)}
                      </td>
                      <td className="py-2.5 px-2 border border-slate-800 print:border-slate-200 text-right font-mono text-emerald-400 print:text-emerald-900">
                        {formatCurrency(s.totalMealAllowances)}
                      </td>
                      <td className="py-2.5 px-2 border border-slate-800 print:border-slate-200 text-right font-mono text-amber-400 print:text-amber-900">
                        {formatCurrency(s.nightShiftBonusEarnings)}
                      </td>
                      <td className="py-2.5 px-2 border border-slate-800 print:border-slate-200 text-right font-mono text-amber-300 print:text-amber-900 font-semibold">
                        {formatCurrency(s.overtimeEarnings)}
                      </td>
                      <td className="py-2.5 px-2 border border-slate-800 print:border-slate-200 text-right font-mono font-bold text-emerald-400 print:text-emerald-800">
                        {formatCurrency(s.totalGrossEarnings)}
                      </td>
                      <td className="py-2.5 px-2 border border-slate-800 print:border-slate-200 text-right font-mono text-rose-400 print:text-rose-800">
                        -{formatCurrency(s.totalAdvancesPaid + s.totalDeductions)}
                      </td>
                      <td className="py-2.5 px-2 border border-slate-800 print:border-slate-200 text-left font-mono text-[10px]">
                        {missingList.length === 0 ? (
                          <span className="text-emerald-400 print:text-emerald-700 font-semibold">Tam Devam</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {missingList.map((m, idx) => (
                              <span key={idx} className={`px-1 py-0.5 rounded text-[9px] ${m.badgeClass}`}>
                                {m.date} ({m.label.substring(0, 3)})
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 border border-slate-800 print:border-slate-200 text-right font-mono font-extrabold text-amber-400 print:text-amber-900 bg-amber-500/5 print:bg-amber-50 print-color-exact">
                        {formatCurrency(s.netPayable)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-950 print:bg-slate-900 font-bold text-white print:text-amber-400 border-t-2 border-slate-800 print:border-amber-500 print-color-exact">
                  <td className="py-3 px-3 border border-slate-800 print:border-slate-700">GENEL TOPLAM</td>
                  <td className="py-3 px-2 border border-slate-800 print:border-slate-700 text-center font-mono">
                    {monthlySummaries.reduce((a, b) => a + b.totalWorkedDaysEquivalent, 0)} G
                  </td>
                  <td className="py-3 px-2 border border-slate-800 print:border-slate-700 text-right font-mono">
                    {formatCurrency(monthlySummaries.reduce((a, b) => a + b.baseWageEarnings, 0))}
                  </td>
                  <td className="py-3 px-2 border border-slate-800 print:border-slate-700 text-right font-mono">
                    {formatCurrency(monthlySummaries.reduce((a, b) => a + b.totalTransportAllowances, 0))}
                  </td>
                  <td className="py-3 px-2 border border-slate-800 print:border-slate-700 text-right font-mono">
                    {formatCurrency(monthlySummaries.reduce((a, b) => a + b.totalMealAllowances, 0))}
                  </td>
                  <td className="py-3 px-2 border border-slate-800 print:border-slate-700 text-right font-mono">
                    {formatCurrency(monthlySummaries.reduce((a, b) => a + b.nightShiftBonusEarnings, 0))}
                  </td>
                  <td className="py-3 px-2 border border-slate-800 print:border-slate-700 text-right font-mono">
                    {formatCurrency(monthlySummaries.reduce((a, b) => a + b.overtimeEarnings, 0))}
                  </td>
                  <td className="py-3 px-2 border border-slate-800 print:border-slate-700 text-right font-mono text-emerald-400 print:text-emerald-300">
                    {formatCurrency(monthlySummaries.reduce((a, b) => a + b.totalGrossEarnings, 0))}
                  </td>
                  <td className="py-3 px-2 border border-slate-800 print:border-slate-700 text-right font-mono text-rose-400 print:text-rose-300">
                    -{formatCurrency(monthlySummaries.reduce((a, b) => a + b.totalAdvancesPaid + b.totalDeductions, 0))}
                  </td>
                  <td className="py-3 px-2 border border-slate-800 print:border-slate-700 text-left font-mono text-[10px] text-slate-400 print:text-slate-300">
                    -
                  </td>
                  <td className="py-3 px-3 border border-slate-800 print:border-slate-700 text-right font-mono text-amber-400 print:text-amber-300 text-sm">
                    {formatCurrency(monthlySummaries.reduce((a, b) => a + b.netPayable, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="pt-8 border-t border-slate-800 print:border-slate-300 grid grid-cols-3 gap-6 text-center text-xs text-slate-300 print:text-slate-800">
            <div className="space-y-6">
              <div className="border-b border-slate-700 print:border-slate-400 pb-2 font-bold">Hazırlayan / İK Yöneticisi</div>
              <div className="text-[10px] text-slate-500 print:text-slate-600">İmza / Kaşe</div>
            </div>
            <div className="space-y-6">
              <div className="border-b border-slate-700 print:border-slate-400 pb-2 font-bold">Muhasebe / Finans Onay</div>
              <div className="text-[10px] text-slate-500 print:text-slate-600">İmza / Tarih</div>
            </div>
            <div className="space-y-6">
              <div className="border-b border-slate-700 print:border-slate-400 pb-2 font-bold">Genel Müdür Onay</div>
              <div className="text-[10px] text-slate-500 print:text-slate-600">İmza / Kaşe</div>
            </div>
          </div>
        </div>
      )}

      {/* REPORT TYPE 2: Bireysel Maaş Pusulası */}
      {reportType === 'slip' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg print:hidden">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-amber-400" />
              <label className="text-xs font-semibold text-slate-300">Pusulası Görüntülenecek Personel:</label>
              <select
                value={selectedWorkerId}
                onChange={(e) => setSelectedWorkerId(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
              >
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.firstName} {w.lastName} ({w.role})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsWhatsAppOpen(true)}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow"
            >
              <Send className="w-4 h-4" />
              <span>WhatsApp İle Maaş Pusulası Gönder</span>
            </button>
          </div>

          {selectedSummary && detailedTax && (
            <div className="bg-slate-900 print:bg-white text-slate-100 print:text-slate-900 border border-slate-800 print:border-slate-300 rounded-3xl p-8 shadow-xl space-y-6 print:p-4 print:shadow-none">
              <CompanyHeaderLogo
                companyName={settings.companyName}
                title={settings.title}
                taxNo={settings.taxNo}
                phone={settings.phone}
                address={settings.address}
              />

              <div className="flex justify-between items-center bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 print:from-amber-50 print:to-amber-100 p-3 rounded-2xl border border-amber-500/30 print:border-amber-400 print-color-exact">
                <h2 className="text-sm font-extrabold text-amber-400 print:text-amber-900 uppercase tracking-wider">
                  RESMİ BİREYSEL ÜCRET MAAŞ PUSULASI
                </h2>
                <span className="text-xs font-mono font-bold text-white print:text-slate-900 bg-slate-900 print:bg-white border border-slate-800 print:border-amber-300 px-3 py-1 rounded-xl">
                  DÖNEM: {getMonthNameTr(selectedMonth).toUpperCase()} {selectedYear}
                </span>
              </div>

              {/* Personal Info Box */}
              <div className="bg-slate-950 print:bg-slate-50 border border-slate-800 print:border-slate-300 p-4 rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-4 text-xs print-color-exact">
                <div>
                  <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-semibold block">
                    Personel Adı Soyadı
                  </span>
                  <p className="font-bold text-white print:text-slate-900 text-sm mt-0.5">
                    {selectedSummary.worker.firstName} {selectedSummary.worker.lastName}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-semibold block">
                    Görevi / Unvanı
                  </span>
                  <p className="font-semibold text-slate-300 print:text-slate-800 text-xs mt-0.5">
                    {selectedSummary.worker.role}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-semibold block">
                    Departman
                  </span>
                  <p className="font-semibold text-slate-300 print:text-slate-800 text-xs mt-0.5">
                    {selectedSummary.worker.department}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-semibold block">
                    Sicil / Personel Kodu
                  </span>
                  <p className="font-mono font-bold text-amber-400 print:text-amber-800 text-xs mt-0.5">
                    {selectedSummary.worker.code}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-semibold block">
                    Günlük Yövmiye Ücreti
                  </span>
                  <p className="font-bold font-mono text-emerald-400 print:text-emerald-800 text-xs mt-0.5">
                    {formatCurrency(selectedSummary.worker.dailyRate)} / Gün
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-semibold block">
                    Saatlik Mesai Ücreti
                  </span>
                  <p className="font-bold font-mono text-amber-400 print:text-amber-800 text-xs mt-0.5">
                    {formatCurrency(selectedSummary.worker.overtimeHourlyRate)} / Saat
                  </p>
                </div>

                <div className="md:col-span-2">
                  <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-semibold block">
                    IBAN / Ödeme Hesabı
                  </span>
                  <p className="font-mono text-slate-200 print:text-slate-900 text-xs mt-0.5 truncate">
                    {selectedSummary.worker.iban || 'Nakit Ödeme'}
                  </p>
                </div>
              </div>

              {/* USER REQUEST: EKSİK GÜN VE TARİH DETAYLARI PANENİ (MISSING DATES CARD) */}
              <div className="bg-slate-950 print:bg-amber-50/70 border border-slate-800 print:border-amber-300 p-4 rounded-2xl space-y-2.5 print-color-exact">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CalendarX className="w-4 h-4 text-amber-400 print:text-amber-800" />
                    <h3 className="text-xs font-bold text-amber-400 print:text-amber-900 uppercase tracking-wider">
                      EKSİK / KESİNTİLİ GÜNLER VE TARİH LİSTESİ
                    </h3>
                  </div>

                  <span className="text-[11px] font-bold font-mono text-slate-300 print:text-slate-800">
                    Toplam Kesintili Gün: {selectedMissingDateDetails.length} Gün
                  </span>
                </div>

                {selectedMissingDateDetails.length === 0 ? (
                  <div className="flex items-center space-x-2 bg-emerald-500/10 print:bg-emerald-100 border border-emerald-500/30 print:border-emerald-300 p-2.5 rounded-xl text-emerald-400 print:text-emerald-900 text-xs font-semibold print-color-exact">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 print:text-emerald-700" />
                    <span>Bu ay personel için herhangi bir devamsızlık veya eksik gün bulunmamaktadır (Tam Devamlılık).</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-400 print:text-slate-700">
                      Personelin bu ay içerisinde çalışmadığı veya raporlu olduğu kesinleşmiş tarihler aşağıda listelenmiştir:
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {selectedMissingDateDetails.map((item, idx) => (
                        <div
                          key={idx}
                          className={`px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm print-color-exact ${item.badgeClass}`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span className="font-mono font-extrabold">{item.date} {getMonthNameTr(selectedMonth)}</span>
                          <span>-</span>
                          <span>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Earnings & Deductions Tables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* 1. Kazançlar */}
                <div className="border border-slate-800 print:border-emerald-300 rounded-2xl overflow-hidden shadow">
                  <div className="bg-slate-950 print:bg-emerald-700 p-3 border-b border-slate-800 print:border-emerald-600 flex items-center justify-between print-color-exact">
                    <h3 className="font-bold text-emerald-400 print:text-white uppercase tracking-wider text-xs">
                      1. KAZANÇLAR & HAKEDİŞLER
                    </h3>
                    <span className="text-[10px] text-slate-400 print:text-emerald-100 font-mono">Tutar (₺)</span>
                  </div>

                  <table className="w-full text-left border-collapse">
                    <tbody className="divide-y divide-slate-800 print:divide-slate-200 text-slate-300 print:text-slate-900">
                      <tr>
                        <td className="py-2.5 px-3">
                          Normal Çalışma ({selectedSummary.totalWorkedDaysEquivalent} Gün)
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold">
                          {formatCurrency(selectedSummary.baseWageEarnings)}
                        </td>
                      </tr>

                      {selectedSummary.nightShiftDays > 0 && (
                        <tr>
                          <td className="py-2.5 px-3 font-semibold text-amber-400 print:text-amber-800">
                            Gece Vardiyası Primi ({selectedSummary.nightShiftDays} Gün x %20 Ekstra)
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-amber-400 print:text-amber-800 font-semibold">
                            +{formatCurrency(selectedSummary.nightShiftBonusEarnings)}
                          </td>
                        </tr>
                      )}

                      <tr>
                        <td className="py-2.5 px-3">
                          Fazla Mesai ({selectedSummary.totalOvertimeHours} Saat)
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-amber-400 print:text-amber-800 font-semibold">
                          +{formatCurrency(selectedSummary.overtimeEarnings)}
                        </td>
                      </tr>

                      <tr>
                        <td className="py-2.5 px-3">Günlük Yemek Yardımı</td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold">
                          +{formatCurrency(selectedSummary.totalMealAllowances)}
                        </td>
                      </tr>

                      <tr>
                        <td className="py-2.5 px-3">Günlük Yol Yardımı</td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold">
                          +{formatCurrency(selectedSummary.totalTransportAllowances)}
                        </td>
                      </tr>

                      <tr>
                        <td className="py-2.5 px-3">İmalat & Performans Primi</td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-400 print:text-emerald-800 font-semibold">
                          +{formatCurrency(selectedSummary.totalBonusesPaid)}
                        </td>
                      </tr>

                      <tr className="bg-slate-950/80 print:bg-emerald-50 font-bold text-white print:text-emerald-950 border-t-2 border-slate-800 print:border-emerald-300 print-color-exact">
                        <td className="py-3 px-3">TOPLAM BRÜT KAZANÇ</td>
                        <td className="py-3 px-3 text-right font-mono text-emerald-400 print:text-emerald-900 text-sm">
                          {formatCurrency(selectedSummary.totalGrossEarnings)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 2. Kesintiler */}
                <div className="border border-slate-800 print:border-rose-300 rounded-2xl overflow-hidden shadow">
                  <div className="bg-slate-950 print:bg-rose-700 p-3 border-b border-slate-800 print:border-rose-600 flex items-center justify-between print-color-exact">
                    <h3 className="font-bold text-rose-400 print:text-white uppercase tracking-wider text-xs">
                      2. KESİNTİLER & YASAL ÖDEMELER
                    </h3>
                    <span className="text-[10px] text-slate-400 print:text-rose-100 font-mono">Tutar (₺)</span>
                  </div>

                  <table className="w-full text-left border-collapse">
                    <tbody className="divide-y divide-slate-800 print:divide-slate-200 text-slate-300 print:text-slate-900">
                      <tr>
                        <td className="py-2 px-3 text-[11px]">SGK İşçi Payı Kesintisi (%{settings.sgkWorkerPercent ?? 14})</td>
                        <td className="py-2 px-3 text-right font-mono text-rose-300 print:text-rose-800">
                          -{formatCurrency(detailedTax.sgkWorker)}
                        </td>
                      </tr>

                      <tr>
                        <td className="py-2 px-3 text-[11px]">İşsizlik Sigortası Payı (%{settings.unemploymentWorkerPercent ?? 1})</td>
                        <td className="py-2 px-3 text-right font-mono text-rose-300 print:text-rose-800">
                          -{formatCurrency(detailedTax.unemploymentWorker)}
                        </td>
                      </tr>

                      <tr>
                        <td className="py-2 px-3 text-[11px]">Gelir Vergisi Kesintisi (%{settings.incomeTaxPercent ?? 15})</td>
                        <td className="py-2 px-3 text-right font-mono text-rose-300 print:text-rose-800">
                          -{formatCurrency(detailedTax.incomeTax)}
                        </td>
                      </tr>

                      <tr>
                        <td className="py-2 px-3 text-[11px]">Damga Vergisi (%{settings.stampTaxPercent ?? 0.759})</td>
                        <td className="py-2 px-3 text-right font-mono text-rose-300 print:text-rose-800">
                          -{formatCurrency(detailedTax.stampTax)}
                        </td>
                      </tr>

                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-rose-400 print:text-rose-800">
                          Kesilen Ara Avans / EFT'ler
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-rose-400 print:text-rose-800 font-semibold">
                          -{formatCurrency(selectedSummary.totalAdvancesPaid)}
                        </td>
                      </tr>

                      <tr className="bg-slate-950/80 print:bg-rose-50 font-bold text-white print:text-rose-950 border-t-2 border-slate-800 print:border-rose-300 print-color-exact">
                        <td className="py-3 px-3">TOPLAM KESİNTİ TUTARI</td>
                        <td className="py-3 px-3 text-right font-mono text-rose-400 print:text-rose-900 text-sm">
                          -{formatCurrency(detailedTax.totalDeductionsAll)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Net Payable Banner */}
              <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 print:from-amber-500 print:to-amber-600 border-2 border-amber-400 print:border-amber-600 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl print-color-exact">
                <div>
                  <span className="text-xs font-extrabold text-amber-300 print:text-slate-950 uppercase tracking-widest block">
                    NET ELE GEÇECEK ÖDENECEK MAAŞ TUTARI
                  </span>
                  <p className="text-xs text-slate-300 print:text-amber-950 mt-1 font-semibold">
                    Brüt hakedişten yol, yemek, vardiya primi, yasal kesintiler ve avanslar düşüldükten sonra net kalan bakiyedir.
                  </p>
                </div>

                <div className="text-center md:text-right">
                  <p className="text-3xl font-black text-amber-400 print:text-slate-950 font-mono tracking-tight">
                    {formatCurrency(detailedTax.finalNetPayable)}
                  </p>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-8 border-t border-slate-800 print:border-slate-300 grid grid-cols-3 gap-6 text-center text-xs text-slate-300 print:text-slate-800">
                <div className="space-y-8">
                  <div className="border-b border-slate-700 print:border-slate-400 pb-2 font-bold">
                    Düzenleyen / İK Yetkilisi
                  </div>
                  <div className="text-[10px] text-slate-500 print:text-slate-600">İmza / Tarih</div>
                </div>

                <div className="space-y-8">
                  <div className="border-b border-slate-700 print:border-slate-400 pb-2 font-bold">
                    Kontrol Eden / Şantiye Şefi
                  </div>
                  <div className="text-[10px] text-slate-500 print:text-slate-600">İmza / Kaşe</div>
                </div>

                <div className="space-y-8">
                  <div className="border-b border-slate-700 print:border-slate-400 pb-2 font-bold">
                    İhtilafsız Teslim Aldım (İmza)
                  </div>
                  <div className="text-[10px] text-slate-500 print:text-slate-600">
                    {selectedSummary.worker.firstName} {selectedSummary.worker.lastName}
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* REPORT TYPE 3: Vardiya Çizelgesi */}
      {reportType === 'roster' && selectedSummary && (
        <div className="bg-slate-900 print:bg-white text-slate-100 print:text-slate-900 border border-slate-800 print:border-slate-300 rounded-3xl p-6 shadow-xl space-y-6 print:p-4">
          <CompanyHeaderLogo
            companyName={settings.companyName}
            title={settings.title}
            taxNo={settings.taxNo}
            phone={settings.phone}
            address={settings.address}
          />

          <div className="flex justify-between items-center bg-slate-950 print:bg-slate-100 p-3 rounded-2xl border border-slate-800 print:border-slate-300 print-color-exact">
            <h2 className="text-sm font-extrabold text-amber-400 print:text-amber-900 uppercase tracking-wider">
              BİREYSEL VARDİYA & GİRİŞ-ÇIKIŞ ÇİZELGESİ
            </h2>
            <span className="text-xs font-mono font-bold text-white print:text-slate-900 bg-slate-900 print:bg-white border border-slate-800 print:border-slate-300 px-3 py-1 rounded-xl">
              {selectedSummary.worker.firstName} {selectedSummary.worker.lastName} - {getMonthNameTr(selectedMonth)} {selectedYear}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 print:bg-slate-800 text-slate-300 print:text-white border border-slate-800 print:border-slate-700 font-semibold print-color-exact">
                  <th className="p-2 border border-slate-800 print:border-slate-700 w-28">Tarih</th>
                  <th className="p-2 border border-slate-800 print:border-slate-700 w-24">Gün</th>
                  <th className="p-2 border border-slate-800 print:border-slate-700">Vardiya / Durum</th>
                  <th className="p-2 border border-slate-800 print:border-slate-700 text-center w-28">Giriş Saati</th>
                  <th className="p-2 border border-slate-800 print:border-slate-700 text-center w-28">Çıkış Saati</th>
                  <th className="p-2 border border-slate-800 print:border-slate-700 text-center w-24">Mesai (Saat)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                {daysArray.map((day) => {
                  const dateObj = new Date(selectedYear, selectedMonth - 1, day);
                  const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
                  const dayName = dayNames[dateObj.getDay()];
                  const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  
                  const rec = attendance.find(
                    (r) => r.workerId === selectedWorkerId && r.date === dateStr
                  );

                  const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

                  return (
                    <tr
                      key={day}
                      className={`border border-slate-800 print:border-slate-200 text-slate-200 print:text-slate-900 ${
                        isWeekend ? 'bg-slate-950/40 print:bg-slate-50' : ''
                      }`}
                    >
                      <td className="p-2 border border-slate-800 print:border-slate-200 font-mono font-bold">
                        {String(day).padStart(2, '0')}.{String(selectedMonth).padStart(2, '0')}.{selectedYear}
                      </td>

                      <td className="p-2 border border-slate-800 print:border-slate-200 font-semibold">
                        {dayName}
                      </td>

                      <td className="p-2 border border-slate-800 print:border-slate-200">
                        {rec?.type === 'WEEKEND' ? (
                          <span className="text-indigo-400 print:text-indigo-700 font-bold">HT - Hafta Sonu Tatili (Ücretli)</span>
                        ) : rec?.type === 'WEEKEND_WORK' ? (
                          <span className="text-amber-400 print:text-amber-700 font-bold">HÇ - Hafta Sonu Çalışması</span>
                        ) : rec?.type === 'REPORT_PAID' ? (
                          <span className="text-purple-400 print:text-purple-700 font-bold">ÜR - Ücretli Rapor</span>
                        ) : rec?.type === 'REPORT_UNPAID' ? (
                          <span className="text-rose-400 print:text-rose-700 font-bold">ÜR- - Ücretsiz Rapor</span>
                        ) : rec?.type === 'LEAVE' ? (
                          <span className="text-amber-300 print:text-amber-700 font-bold">İzinli</span>
                        ) : rec?.type === 'ABSENT' ? (
                          <span className="text-rose-500 print:text-rose-700 font-bold">Gelmedi</span>
                        ) : (
                          <span className="text-emerald-400 print:text-emerald-700 font-semibold">Tam Gün Çalışma</span>
                        )}
                      </td>

                      <td className="p-2 border border-slate-800 print:border-slate-200 text-center font-mono">
                        {rec?.checkInTime || (rec?.type === 'FULL' ? '08:00' : '-')}
                      </td>

                      <td className="p-2 border border-slate-800 print:border-slate-200 text-center font-mono">
                        {rec?.checkOutTime || (rec?.type === 'FULL' ? '18:00' : '-')}
                      </td>

                      <td className="p-2 border border-slate-800 print:border-slate-200 text-center font-mono font-bold text-amber-400 print:text-amber-900">
                        {rec?.overtimeHours ? `+${rec.overtimeHours}s` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT TYPE 4: Aylık Imzalı Puantaj Cetveli */}
      {reportType === 'matrix' && (
        <div className="bg-slate-900 print:bg-white text-slate-100 print:text-slate-900 border border-slate-800 print:border-slate-300 rounded-3xl p-6 shadow-xl space-y-6 print:p-4">
          <CompanyHeaderLogo
            companyName={settings.companyName}
            title={settings.title}
            taxNo={settings.taxNo}
            phone={settings.phone}
            address={settings.address}
          />

          <div className="flex justify-between items-center bg-slate-950 print:bg-slate-100 p-3 rounded-2xl border border-slate-800 print:border-slate-300 print-color-exact">
            <h2 className="text-sm font-extrabold text-amber-400 print:text-amber-900 uppercase tracking-wider">
              AYLIK RESMİ İMZALI PUANTAJ CETVELİ
            </h2>
            <span className="text-xs font-mono font-bold text-white print:text-slate-900 bg-slate-900 print:bg-white border border-slate-800 print:border-slate-300 px-3 py-1 rounded-xl">
              DÖNEM: {getMonthNameTr(selectedMonth)} {selectedYear}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[10px] print:text-[9px]">
              <thead>
                <tr className="bg-slate-950 print:bg-slate-800 text-slate-300 print:text-white border border-slate-800 print:border-slate-700 font-semibold print-color-exact">
                  <th className="p-1.5 border border-slate-800 print:border-slate-700 w-36">Personel</th>
                  <th className="p-1 border border-slate-800 print:border-slate-700 text-center w-16">Unvan</th>
                  {daysArray.map((d) => (
                    <th key={d} className="p-1 border border-slate-800 print:border-slate-700 text-center w-6">
                      {d}
                    </th>
                  ))}
                  <th className="p-1 border border-slate-800 print:border-slate-700 text-center font-bold">Gün</th>
                  <th className="p-1 border border-slate-800 print:border-slate-700 text-center font-bold">Mesai</th>
                  <th className="p-1 border border-slate-800 print:border-slate-700 text-right font-bold w-20">Net Tutar</th>
                </tr>
              </thead>
              <tbody>
                {monthlySummaries.map((s) => (
                  <tr key={s.worker.id} className="border border-slate-800 print:border-slate-200 text-slate-200 print:text-slate-900">
                    <td className="p-1.5 border border-slate-800 print:border-slate-200 font-bold">
                      {s.worker.firstName} {s.worker.lastName}
                    </td>
                    <td className="p-1 border border-slate-800 print:border-slate-200 text-slate-400 print:text-slate-700">
                      {s.worker.role}
                    </td>
                    {daysArray.map((day) => {
                      const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const rec = attendance.find((r) => r.workerId === s.worker.id && r.date === dateStr);
                      let val = '-';
                      if (rec) {
                        if (rec.type === 'FULL') val = '1';
                        else if (rec.type === 'HALF') val = '½';
                        else if (rec.type === 'WEEKEND') val = 'HT';
                        else if (rec.type === 'WEEKEND_WORK') val = 'HÇ';
                        else if (rec.type === 'REPORT_PAID') val = 'ÜR';
                        else if (rec.type === 'REPORT_UNPAID') val = 'ÜR-';
                        else if (rec.type === 'LEAVE') val = 'İ';
                        else if (rec.type === 'ABSENT') val = 'X';
                      }
                      return (
                        <td key={day} className="p-0.5 border border-slate-800 print:border-slate-200 text-center font-mono">
                          {val}
                        </td>
                      );
                    })}
                    <td className="p-1 border border-slate-800 print:border-slate-200 text-center font-mono font-bold text-emerald-400 print:text-emerald-800">
                      {s.totalWorkedDaysEquivalent}
                    </td>
                    <td className="p-1 border border-slate-800 print:border-slate-200 text-center font-mono font-bold text-amber-400 print:text-amber-800">
                      {s.totalOvertimeHours}s
                    </td>
                    <td className="p-1 border border-slate-800 print:border-slate-200 text-right font-mono font-bold text-amber-400 print:text-amber-900">
                      {formatCurrency(s.netPayable)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      <WhatsAppModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        summary={selectedSummary}
      />

      {/* Bank Payment Modal */}
      <BankPaymentModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
      />
    </div>
  );
};
