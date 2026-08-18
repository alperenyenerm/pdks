import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getMonthNameTr, formatCurrency, getDaysInMonth } from '../../utils/calculations';
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
} from 'lucide-react';
import { WhatsAppModal } from './WhatsAppModal';
import { BankPaymentModal } from './BankPaymentModal';

export const ReportsView: React.FC = () => {
  const {
    settings,
    selectedYear,
    selectedMonth,
    monthlySummaries,
    workers,
    attendance,
  } = useApp();

  const [reportType, setReportType] = useState<'matrix' | 'payroll' | 'slip' | 'roster'>('slip');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(workers[0]?.id || '');
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Excel Export
  const handleExportExcel = () => {
    const data = monthlySummaries.map((s) => ({
      'Personel Kodu': s.worker.code,
      'Ad Soyad': `${s.worker.firstName} ${s.worker.lastName}`,
      'Görevi / Unvan': s.worker.role,
      Departman: s.worker.department,
      'Günlük Yövmiye (TL)': s.worker.dailyRate,
      'Saatlik Mesai (TL)': s.worker.overtimeHourlyRate,
      'Tam Gün': s.fullDays,
      'Yarım Gün': s.halfDays,
      'İzinli Gün': s.leaveDays,
      'Raporlu Gün': s.reportDays,
      Devamsız: s.absentDays,
      'Eşdeğer Gün': s.totalWorkedDaysEquivalent,
      'Gece Vardiyası Gün': s.nightShiftDays,
      'Gece Vardiya Primi (TL)': s.nightShiftBonusEarnings,
      'Mesai Saati': s.totalOvertimeHours,
      'Yövmiye Hakedişi (TL)': s.baseWageEarnings,
      'Mesai Hakedişi (TL)': s.overtimeEarnings,
      'Yemek Yardımı (TL)': s.totalMealAllowances,
      'Yol Yardımı (TL)': s.totalTransportAllowances,
      'Brüt Toplam (TL)': s.totalGrossEarnings,
      'Ödenen Avans (TL)': s.totalAdvancesPaid,
      'Prim / Ekstra (TL)': s.totalBonusesPaid,
      'Net Ödenecek Tutar (TL)': s.netPayable,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Maaş ve Puantaj Listesi');

    const fileName = `YNR_Makine_Puantaj_${getMonthNameTr(selectedMonth)}_${selectedYear}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedSummary = monthlySummaries.find((s) => s.worker.id === selectedWorkerId);

  // Tax & SSI Simulation Calculations for Payslip
  const calculateDetailedPayslip = (summary: typeof selectedSummary) => {
    if (!summary) return null;

    const gross = summary.totalGrossEarnings;
    const sgkWorker = gross * 0.14; // SGK %14
    const unemploymentWorker = gross * 0.01; // İşsizlik %1
    const taxBase = gross - (sgkWorker + unemploymentWorker);
    const incomeTax = taxBase * 0.15; // Gelir vergisi %15
    const stampTax = gross * 0.00759; // Damga vergisi %0.759
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
      totalAdvances: summary.totalAdvancesPaid,
      totalDeductions: summary.totalDeductions,
      totalDeductionsAll,
      finalNetPayable,
    };
  };

  const detailedTax = calculateDetailedPayslip(selectedSummary);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg print:hidden">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            Resmi Maaş Bordrosu, Vardiya & Raporlama Merkezi
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            A4 formatında onaylı detaylı personel maaş bordroları, kişisel vardiya takvimleri ve Excel dökümleri.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsBankModalOpen(true)}
            className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-lg shadow-amber-500/20"
          >
            <Building2 className="w-4 h-4" />
            <span>Toplu Banka Ödeme Dosyası (.TXT)</span>
          </button>
          <button
            onClick={() => setIsWhatsAppOpen(true)}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-lg shadow-emerald-600/20"
          >
            <Send className="w-4 h-4 text-emerald-200" />
            <span>WhatsApp ile Bordro Gönder</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-4 py-2.5 rounded-xl text-xs transition"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Excel Indir (.xlsx)</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-4 py-2.5 rounded-xl text-xs transition"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Sayfa Yazdır / PDF</span>
          </button>
        </div>
      </div>

      {/* Report Mode Selector Tabs */}
      <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-xl gap-2 print:hidden overflow-x-auto">
        <button
          onClick={() => setReportType('slip')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 whitespace-nowrap ${
            reportType === 'slip'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Detaylı Personel Maaş Bordrosu</span>
        </button>

        <button
          onClick={() => setReportType('roster')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 whitespace-nowrap ${
            reportType === 'roster'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Personel Kişisel Vardiya Çizelgesi</span>
        </button>

        <button
          onClick={() => setReportType('matrix')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 whitespace-nowrap ${
            reportType === 'matrix'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Aylık Imzalı Puantaj Cetveli</span>
        </button>

        <button
          onClick={() => setReportType('payroll')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 whitespace-nowrap ${
            reportType === 'payroll'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Tüm Kadro Maaş & Avans Listesi</span>
        </button>
      </div>

      {/* PRINTABLE & DISPLAY AREA */}
      <div className="space-y-6">
        
        {/* REPORT TYPE 1: DETAYLI PERSONEL MAAŞ BORDROSU */}
        {reportType === 'slip' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl print:hidden">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-slate-300">Bordrosu Hazırlanacak Personel:</span>
                <select
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
                >
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.code} - {w.firstName} {w.lastName} ({w.role})
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-xs text-amber-400 font-mono font-bold bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-lg">
                Dönem: {getMonthNameTr(selectedMonth)} {selectedYear}
              </span>
            </div>

            {selectedSummary && detailedTax && (
              <div className="bg-slate-900 print:bg-white text-slate-100 print:text-black border border-slate-800 print:border-black rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 rounded-t-3xl -mx-8 -mt-8 mb-6 print:hidden"></div>

                <div className="border-b-2 border-slate-800 print:border-black pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm font-mono print:hidden">
                        YNR
                      </div>
                      <h1 className="text-xl font-extrabold text-white print:text-black tracking-tight uppercase">
                        {settings.companyName}
                      </h1>
                    </div>
                    <p className="text-xs text-slate-400 print:text-gray-600 font-medium">
                      {settings.title}
                    </p>
                    <p className="text-[11px] text-slate-400 print:text-gray-600 font-mono">
                      Adres: {settings.address} | Vergi No: {settings.taxNo}
                    </p>
                  </div>

                  <div className="text-left sm:text-right bg-slate-950 print:bg-gray-100 p-3.5 rounded-2xl border border-slate-800 print:border-black">
                    <h2 className="text-sm font-bold text-amber-400 print:text-black uppercase tracking-wider">
                      PERSONEL MAAŞ & HAKEDİŞ BORDROSU
                    </h2>
                    <p className="text-xs font-mono font-bold text-white print:text-black mt-0.5">
                      BORDRO DÖNEMİ: {getMonthNameTr(selectedMonth).toUpperCase()} {selectedYear}
                    </p>
                    <p className="text-[10px] text-slate-400 print:text-gray-600 font-mono mt-0.5">
                      Evrak No: YNR-BORDRO-{selectedYear}-{String(selectedMonth).padStart(2, '0')}/
                      {selectedSummary.worker.code}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950/60 print:bg-gray-50 border border-slate-800 print:border-black rounded-2xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase font-semibold block">
                      Personel Kodu & Adı
                    </span>
                    <p className="font-bold text-white print:text-black text-sm mt-0.5">
                      {selectedSummary.worker.code} - {selectedSummary.worker.firstName}{' '}
                      {selectedSummary.worker.lastName}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase font-semibold block">
                      Görevi / Unvanı
                    </span>
                    <p className="font-bold text-amber-400 print:text-black text-sm mt-0.5">
                      {selectedSummary.worker.role}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase font-semibold block">
                      Departman & Şube
                    </span>
                    <p className="font-semibold text-slate-200 print:text-black text-xs mt-0.5">
                      {selectedSummary.worker.department}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase font-semibold block">
                      T.C. Kimlik / Sicil No
                    </span>
                    <p className="font-mono text-slate-300 print:text-black text-xs mt-0.5">
                      {selectedSummary.worker.tcNo || '12345678901'}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase font-semibold block">
                      Günlük Yövmiye Ücreti
                    </span>
                    <p className="font-bold font-mono text-emerald-400 print:text-black text-xs mt-0.5">
                      {formatCurrency(selectedSummary.worker.dailyRate)} / Gün
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase font-semibold block">
                      Saatlik Mesai Ücreti
                    </span>
                    <p className="font-bold font-mono text-amber-400 print:text-black text-xs mt-0.5">
                      {formatCurrency(selectedSummary.worker.overtimeHourlyRate)} / Saat
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase font-semibold block">
                      IBAN / Ödeme Hesabı
                    </span>
                    <p className="font-mono text-slate-200 print:text-black text-xs mt-0.5 truncate">
                      {selectedSummary.worker.iban || 'Nakit Ödeme'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="border border-slate-800 print:border-black rounded-2xl overflow-hidden shadow">
                    <div className="bg-slate-950 print:bg-gray-100 p-3 border-b border-slate-800 print:border-black flex items-center justify-between">
                      <h3 className="font-bold text-emerald-400 print:text-black uppercase tracking-wider text-xs">
                        1. KAZANÇLAR & HAKEDİŞLER
                      </h3>
                      <span className="text-[10px] text-slate-400 print:text-gray-600">Tutar (₺)</span>
                    </div>

                    <table className="w-full text-left border-collapse">
                      <tbody className="divide-y divide-slate-800 print:divide-black text-slate-300 print:text-black">
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
                            <td className="py-2.5 px-3 font-semibold text-amber-400 print:text-black">
                              Gece Vardiyası Primi ({selectedSummary.nightShiftDays} Gün x %20 Ekstra)
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-amber-400 print:text-black font-semibold">
                              +{formatCurrency(selectedSummary.nightShiftBonusEarnings)}
                            </td>
                          </tr>
                        )}

                        <tr>
                          <td className="py-2.5 px-3">
                            Fazla Mesai ({selectedSummary.totalOvertimeHours} Saat)
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-amber-400 print:text-black font-semibold">
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
                          <td className="py-2.5 px-3 text-right font-mono text-emerald-400 print:text-black font-semibold">
                            +{formatCurrency(selectedSummary.totalBonusesPaid)}
                          </td>
                        </tr>

                        <tr className="bg-slate-950/80 print:bg-gray-100 font-bold text-white print:text-black border-t-2 border-slate-800 print:border-black">
                          <td className="py-3 px-3">TOPLAM BRÜT KAZANÇ</td>
                          <td className="py-3 px-3 text-right font-mono text-emerald-400 print:text-black text-sm">
                            {formatCurrency(selectedSummary.totalGrossEarnings)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="border border-slate-800 print:border-black rounded-2xl overflow-hidden shadow">
                    <div className="bg-slate-950 print:bg-gray-100 p-3 border-b border-slate-800 print:border-black flex items-center justify-between">
                      <h3 className="font-bold text-rose-400 print:text-black uppercase tracking-wider text-xs">
                        2. KESİNTİLER & YASAL ÖDEMELER
                      </h3>
                      <span className="text-[10px] text-slate-400 print:text-gray-600">Tutar (₺)</span>
                    </div>

                    <table className="w-full text-left border-collapse">
                      <tbody className="divide-y divide-slate-800 print:divide-black text-slate-300 print:text-black">
                        <tr>
                          <td className="py-2 px-3 text-[11px]">SGK İşçi Payı Kesintisi (%14)</td>
                          <td className="py-2 px-3 text-right font-mono text-rose-300 print:text-black">
                            -{formatCurrency(detailedTax.sgkWorker)}
                          </td>
                        </tr>

                        <tr>
                          <td className="py-2 px-3 text-[11px]">İşsizlik Sigortası Payı (%1)</td>
                          <td className="py-2 px-3 text-right font-mono text-rose-300 print:text-black">
                            -{formatCurrency(detailedTax.unemploymentWorker)}
                          </td>
                        </tr>

                        <tr>
                          <td className="py-2 px-3 text-[11px]">Gelir Vergisi Kesintisi (%15)</td>
                          <td className="py-2 px-3 text-right font-mono text-rose-300 print:text-black">
                            -{formatCurrency(detailedTax.incomeTax)}
                          </td>
                        </tr>

                        <tr>
                          <td className="py-2 px-3 text-[11px]">Damga Vergisi (%0.759)</td>
                          <td className="py-2 px-3 text-right font-mono text-rose-300 print:text-black">
                            -{formatCurrency(detailedTax.stampTax)}
                          </td>
                        </tr>

                        <tr>
                          <td className="py-2.5 px-3 font-semibold text-rose-400 print:text-black">
                            Kesilen Ara Avans / EFT'ler
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-rose-400 print:text-black font-semibold">
                            -{formatCurrency(selectedSummary.totalAdvancesPaid)}
                          </td>
                        </tr>

                        <tr className="bg-slate-950/80 print:bg-gray-100 font-bold text-white print:text-black border-t-2 border-slate-800 print:border-black">
                          <td className="py-3 px-3">TOPLAM KESİNTİ TUTARI</td>
                          <td className="py-3 px-3 text-right font-mono text-rose-400 print:text-black text-sm">
                            -{formatCurrency(detailedTax.totalDeductionsAll)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 border-2 border-amber-400 print:border-black print:bg-gray-200 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
                  <div>
                    <span className="text-xs font-extrabold text-amber-300 print:text-black uppercase tracking-widest block">
                      NET ELE GEÇECEK ÖDENECEK MAAŞ TUTARI
                    </span>
                    <p className="text-xs text-slate-300 print:text-gray-700 mt-1">
                      Yukarıdaki brüt hakedişten tüm yasal kesinti ve avanslar düşüldükten sonra net kalan bakiyedir.
                    </p>
                  </div>

                  <div className="text-center md:text-right">
                    <p className="text-3xl font-black text-amber-400 print:text-black font-mono tracking-tight">
                      {formatCurrency(detailedTax.finalNetPayable)}
                    </p>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-800 print:border-black grid grid-cols-3 gap-6 text-center text-xs text-slate-300 print:text-black">
                  <div className="space-y-8">
                    <div className="border-b border-slate-700 print:border-black pb-2 font-bold">
                      Düzenleyen / İK Yetkilisi
                    </div>
                    <div className="text-[10px] text-slate-500 print:text-gray-600">İmza / Tarih</div>
                  </div>

                  <div className="space-y-8">
                    <div className="border-b border-slate-700 print:border-black pb-2 font-bold">
                      Kontrol Eden / Şantiye Şefi
                    </div>
                    <div className="text-[10px] text-slate-500 print:text-gray-600">İmza / Kaşe</div>
                  </div>

                  <div className="space-y-8">
                    <div className="border-b border-slate-700 print:border-black pb-2 font-bold">
                      Teslim Alan (Personel İmza)
                    </div>
                    <div className="text-[10px] text-slate-500 print:text-gray-600">
                      {selectedSummary.worker.firstName} {selectedSummary.worker.lastName}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* REPORT TYPE 2: PERSONEL KİŞİSEL VARDİYA ÇİZELGESİ (Individual Shift Schedule Roster & Printable) */}
        {reportType === 'roster' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl print:hidden">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-slate-300">Vardiya Çizelgesi Gösterilecek Personel:</span>
                <select
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
                >
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.code} - {w.firstName} {w.lastName} ({w.role})
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-xs text-amber-400 font-mono font-bold bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-lg">
                Dönem: {getMonthNameTr(selectedMonth)} {selectedYear}
              </span>
            </div>

            {selectedSummary && (
              <div className="bg-slate-900 print:bg-white text-slate-100 print:text-black border border-slate-800 print:border-black rounded-3xl p-8 shadow-2xl space-y-6">
                
                {/* Header */}
                <div className="border-b border-slate-800 print:border-black pb-4 flex justify-between items-start">
                  <div>
                    <h1 className="text-xl font-bold text-white print:text-black uppercase">
                      {settings.companyName}
                    </h1>
                    <h2 className="text-base font-bold text-amber-400 print:text-black">
                      PERSONEL BİREYSEL AYLIK VARDİYA VE ÇALIŞMA ÇİZELGESİ
                    </h2>
                    <p className="text-xs text-slate-400 print:text-gray-600">
                      Personel: <b>{selectedSummary.worker.firstName} {selectedSummary.worker.lastName}</b> ({selectedSummary.worker.role})
                    </p>
                  </div>
                  <div className="text-right font-mono">
                    <p className="text-sm font-bold text-amber-400 print:text-black">
                      DÖNEM: {getMonthNameTr(selectedMonth).toUpperCase()} {selectedYear}
                    </p>
                    <p className="text-[10px] text-slate-400 print:text-gray-600">
                      Departman: {selectedSummary.worker.department}
                    </p>
                  </div>
                </div>

                {/* Worker Personal Shift Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-950 print:bg-gray-100 p-3 rounded-2xl border border-slate-800 print:border-black">
                    <span className="text-[10px] text-slate-400 print:text-gray-600 block">☀️ Gündüz Vardiyası</span>
                    <span className="text-base font-bold text-emerald-400 print:text-black font-mono">
                      {selectedSummary.fullDays - selectedSummary.nightShiftDays} Gün
                    </span>
                  </div>

                  <div className="bg-slate-950 print:bg-gray-100 p-3 rounded-2xl border border-slate-800 print:border-black">
                    <span className="text-[10px] text-slate-400 print:text-gray-600 block">🌙 Gece Vardiyası (%20 Prim)</span>
                    <span className="text-base font-bold text-amber-400 print:text-black font-mono">
                      {selectedSummary.nightShiftDays} Gün
                    </span>
                  </div>

                  <div className="bg-slate-950 print:bg-gray-100 p-3 rounded-2xl border border-slate-800 print:border-black">
                    <span className="text-[10px] text-slate-400 print:text-gray-600 block">⚡ Toplam Fazla Mesai</span>
                    <span className="text-base font-bold text-amber-300 print:text-black font-mono">
                      {selectedSummary.totalOvertimeHours} Saat
                    </span>
                  </div>

                  <div className="bg-slate-950 print:bg-gray-100 p-3 rounded-2xl border border-slate-800 print:border-black">
                    <span className="text-[10px] text-slate-400 print:text-gray-600 block">🏝️ İzinli / Tatil Günleri</span>
                    <span className="text-base font-bold text-blue-400 print:text-black font-mono">
                      {selectedSummary.leaveDays} Gün
                    </span>
                  </div>
                </div>

                {/* Detailed Daily Calendar Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950 print:bg-gray-100 text-slate-300 print:text-black border border-slate-800 print:border-black font-semibold">
                        <th className="p-2 border border-slate-800 print:border-black w-24">Tarih</th>
                        <th className="p-2 border border-slate-800 print:border-black w-28">Gün</th>
                        <th className="p-2 border border-slate-800 print:border-black">Atanan Vardiya Tipi</th>
                        <th className="p-2 border border-slate-800 print:border-black text-center w-28">Çalışma Saatleri</th>
                        <th className="p-2 border border-slate-800 print:border-black text-center w-24">Mesai (Saat)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 print:divide-black">
                      {daysArray.map((day) => {
                        const dateObj = new Date(selectedYear, selectedMonth - 1, day);
                        const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
                        const dayName = dayNames[dateObj.getDay()];
                        const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        
                        const rec = attendance.find(
                          (r) => r.workerId === selectedWorkerId && r.date === dateStr
                        );

                        const isNight = rec?.shift === 'NIGHT';
                        const isLeave = rec?.type === 'LEAVE';
                        const isWeekend = dateObj.getDay() === 0;

                        return (
                          <tr
                            key={day}
                            className={`border border-slate-800 print:border-black text-slate-200 print:text-black ${
                              isWeekend ? 'bg-slate-950/40 print:bg-gray-50' : ''
                            }`}
                          >
                            <td className="p-2 border border-slate-800 print:border-black font-mono font-bold">
                              {String(day).padStart(2, '0')}.{String(selectedMonth).padStart(2, '0')}.{selectedYear}
                            </td>

                            <td className="p-2 border border-slate-800 print:border-black font-semibold">
                              {dayName}
                            </td>

                            <td className="p-2 border border-slate-800 print:border-black">
                              {isLeave ? (
                                <span className="text-blue-400 font-bold flex items-center gap-1">
                                  🏝️ İzinli / Hafta Tatili
                                </span>
                              ) : rec?.shift === 'SHIFT_1' || rec?.shift === 'DAY' ? (
                                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                  ☀️ 1. Vardiya (Sabah)
                                </span>
                              ) : rec?.shift === 'SHIFT_2' ? (
                                <span className="text-blue-400 font-semibold flex items-center gap-1">
                                  🌆 2. Vardiya (Akşam)
                                </span>
                              ) : isNight || rec?.shift === 'SHIFT_3' ? (
                                <span className="text-amber-400 font-bold flex items-center gap-1">
                                  🌙 3. Vardiya (Gece %20 Prim)
                                </span>
                              ) : (
                                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                  ☀️ 1. Vardiya (Sabah)
                                </span>
                              )}
                            </td>

                            <td className="p-2 border border-slate-800 print:border-black text-center font-mono text-[11px]">
                              {isLeave
                                ? '-'
                                : rec?.shift === 'SHIFT_2'
                                ? '16:00 - 24:00'
                                : isNight || rec?.shift === 'SHIFT_3'
                                ? '00:00 - 08:00'
                                : '08:00 - 16:00'}
                            </td>

                            <td className="p-2 border border-slate-800 print:border-black text-center font-mono font-bold text-amber-400 print:text-black">
                              {rec?.overtimeHours ? `+${rec.overtimeHours}s` : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Signature Box */}
                <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs text-slate-300 print:text-black">
                  <div className="border-t border-slate-700 print:border-black pt-2">
                    <p className="font-bold">Vardiya Amiri / Atölye Şefi Onay</p>
                    <p className="text-[10px] text-slate-500 print:text-gray-600">YNR MAKİNE A.Ş.</p>
                  </div>
                  <div className="border-t border-slate-700 print:border-black pt-2">
                    <p className="font-bold">Teslim Alan (Personel İmza)</p>
                    <p className="text-[10px] text-slate-500 print:text-gray-600">
                      {selectedSummary.worker.firstName} {selectedSummary.worker.lastName}
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* REPORT TYPE 3: Aylık Imzalı Puantaj Cetveli */}
        {reportType === 'matrix' && (
          <div className="bg-slate-900 print:bg-white text-slate-100 print:text-black border border-slate-800 print:border-black rounded-3xl p-6 shadow-xl space-y-6">
            <div className="border-b border-slate-800 print:border-black pb-4 flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold text-white print:text-black uppercase tracking-wide">
                  {settings.companyName}
                </h1>
                <p className="text-xs text-slate-400 print:text-gray-600">{settings.title}</p>
              </div>
              <div className="text-right">
                <h2 className="text-lg font-bold text-amber-400 print:text-black uppercase">
                  AYLIK RESMİ PUANTAJ CETVELİ
                </h2>
                <p className="text-sm font-mono font-bold text-white print:text-black">
                  DÖNEM: {getMonthNameTr(selectedMonth)} {selectedYear}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[10px] print:text-[9px]">
                <thead>
                  <tr className="bg-slate-950 print:bg-gray-100 text-slate-300 print:text-black border border-slate-800 print:border-black font-semibold">
                    <th className="p-1.5 border border-slate-800 print:border-black w-36">Personel</th>
                    <th className="p-1 border border-slate-800 print:border-black text-center w-16">Unvan</th>
                    {daysArray.map((d) => (
                      <th key={d} className="p-1 border border-slate-800 print:border-black text-center w-6">
                        {d}
                      </th>
                    ))}
                    <th className="p-1 border border-slate-800 print:border-black text-center font-bold">Gün</th>
                    <th className="p-1 border border-slate-800 print:border-black text-center font-bold">Mesai</th>
                    <th className="p-1 border border-slate-800 print:border-black text-right font-bold w-20">Net Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlySummaries.map((s) => (
                    <tr key={s.worker.id} className="border border-slate-800 print:border-black text-slate-200 print:text-black">
                      <td className="p-1.5 border border-slate-800 print:border-black font-bold">
                        {s.worker.firstName} {s.worker.lastName}
                      </td>
                      <td className="p-1 border border-slate-800 print:border-black text-slate-400 print:text-gray-700">
                        {s.worker.role}
                      </td>
                      {daysArray.map((day) => {
                        const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const rec = attendance.find((r) => r.workerId === s.worker.id && r.date === dateStr);
                        let val = '-';
                        if (rec) {
                          if (rec.type === 'FULL') val = '1';
                          else if (rec.type === 'HALF') val = '½';
                          else if (rec.type === 'LEAVE') val = 'İ';
                          else if (rec.type === 'REPORT') val = 'R';
                          else if (rec.type === 'ABSENT') val = 'X';
                          if (rec.overtimeHours > 0) val += `+${rec.overtimeHours}`;
                        }
                        return (
                          <td key={day} className="p-1 border border-slate-800 print:border-black text-center font-mono text-[9px]">
                            {val}
                          </td>
                        );
                      })}
                      <td className="p-1 border border-slate-800 print:border-black text-center font-bold font-mono">
                        {s.totalWorkedDaysEquivalent}
                      </td>
                      <td className="p-1 border border-slate-800 print:border-black text-center font-bold font-mono">
                        {s.totalOvertimeHours}s
                      </td>
                      <td className="p-1 border border-slate-800 print:border-black text-right font-bold font-mono">
                        {formatCurrency(s.netPayable)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT TYPE 4: Tüm Kadro Maaş Listesi */}
        {reportType === 'payroll' && (
          <div className="bg-slate-900 print:bg-white text-slate-100 print:text-black border border-slate-800 print:border-black rounded-3xl p-6 shadow-xl space-y-6">
            <div className="border-b border-slate-800 print:border-black pb-4 flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold text-white print:text-black uppercase">
                  {settings.companyName}
                </h1>
                <p className="text-xs text-slate-400 print:text-gray-600">
                  Dönem Maaş ve Avans Hakediş Bordro Özet Tablosu
                </p>
              </div>
              <div className="text-right font-mono text-sm font-bold text-amber-400 print:text-black">
                {getMonthNameTr(selectedMonth)} {selectedYear}
              </div>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 print:bg-gray-100 text-slate-300 print:text-black border border-slate-800 print:border-black font-semibold">
                  <th className="p-2 border border-slate-800 print:border-black">Kod</th>
                  <th className="p-2 border border-slate-800 print:border-black">Personel Adı</th>
                  <th className="p-2 border border-slate-800 print:border-black text-right">Yövmiye (₺)</th>
                  <th className="p-2 border border-slate-800 print:border-black text-center">Çalışılan Gün</th>
                  <th className="p-2 border border-slate-800 print:border-black text-center">Mesai (s)</th>
                  <th className="p-2 border border-slate-800 print:border-black text-right">Brüt Hakediş (₺)</th>
                  <th className="p-2 border border-slate-800 print:border-black text-right">Ödenen Avans (₺)</th>
                  <th className="p-2 border border-slate-800 print:border-black text-right font-bold">Net Ödenecek (₺)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-black">
                {monthlySummaries.map((s) => (
                  <tr key={s.worker.id} className="text-slate-200 print:text-black">
                    <td className="p-2 border border-slate-800 print:border-black font-mono">{s.worker.code}</td>
                    <td className="p-2 border border-slate-800 print:border-black font-bold">
                      {s.worker.firstName} {s.worker.lastName}
                    </td>
                    <td className="p-2 border border-slate-800 print:border-black text-right font-mono">
                      {formatCurrency(s.worker.dailyRate)}
                    </td>
                    <td className="p-2 border border-slate-800 print:border-black text-center font-mono font-bold">
                      {s.totalWorkedDaysEquivalent}
                    </td>
                    <td className="p-2 border border-slate-800 print:border-black text-center font-mono">
                      {s.totalOvertimeHours}
                    </td>
                    <td className="p-2 border border-slate-800 print:border-black text-right font-mono">
                      {formatCurrency(s.totalGrossEarnings)}
                    </td>
                    <td className="p-2 border border-slate-800 print:border-black text-right font-mono text-rose-400 print:text-black">
                      {formatCurrency(s.totalAdvancesPaid)}
                    </td>
                    <td className="p-2 border border-slate-800 print:border-black text-right font-mono font-bold text-amber-400 print:text-black">
                      {formatCurrency(s.netPayable)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* WHATSAPP MODAL */}
      <WhatsAppModal isOpen={isWhatsAppOpen} onClose={() => setIsWhatsAppOpen(false)} />

      {/* BANK PAYMENT FILE MODAL */}
      <BankPaymentModal isOpen={isBankModalOpen} onClose={() => setIsBankModalOpen(false)} />
    </div>
  );
};
