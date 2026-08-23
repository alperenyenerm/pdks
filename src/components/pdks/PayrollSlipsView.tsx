import React, { useState } from 'react';
import { 
  FileText, Printer
} from 'lucide-react';
import type { Worker, MonthlyWorkerSummary, CompanySettings } from '../../types';

interface PayrollSlipsViewProps {
  workers: Worker[];
  monthlySummaries: MonthlyWorkerSummary[];
  settings: CompanySettings;
}

export const PayrollSlipsView: React.FC<PayrollSlipsViewProps> = ({
  workers,
  monthlySummaries,
  settings
}) => {
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(workers[0]?.id || '');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08');

  const selectedWorker = workers.find(w => w.id === selectedWorkerId) || workers[0];
  const summary = monthlySummaries.find(s => s.worker.id === selectedWorkerId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/90 p-5 rounded-xl border border-slate-700/60 shadow-sm print:hidden">
        <div>
          <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
            <FileText className="w-5 h-5 text-purple-400" />
            Perkotek Maaş Ekstresi & Pusulası
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Kişi Bazında Maaş Ekstresi & Bordro Zarfı</h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Brüt kazançlar, fazla mesai hakedişi, avans/kesintiler ve net ödenecek maaş hesabı.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrint}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition shadow flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Maaş Pusulasını Yazdır
          </button>
        </div>
      </div>

      {/* Worker & Period Selector */}
      <div className="flex flex-col sm:flex-row gap-3 bg-slate-800/80 p-4 rounded-xl border border-slate-700/50 print:hidden">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Personel Seçin</label>
          <select 
            value={selectedWorkerId}
            onChange={e => setSelectedWorkerId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
          >
            {workers.map(w => (
              <option key={w.id} value={w.id}>
                {w.firstName} {w.lastName} ({w.role} - {w.code})
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-48">
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Dönem</label>
          <input 
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Printable Slip Container */}
      {selectedWorker && (
        <div className="bg-white text-slate-900 rounded-2xl p-8 shadow-xl max-w-3xl mx-auto space-y-6 border border-slate-200 print:shadow-none print:p-0 print:border-none">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">{settings.companyName}</h1>
              <p className="text-xs text-slate-600 mt-0.5">{settings.title}</p>
              <p className="text-xs text-slate-500">{settings.taxNo}</p>
            </div>
            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-bold uppercase rounded">
                MAAŞ PUSULASI (BORDRO ZARFI)
              </div>
              <div className="text-xs font-mono font-bold text-slate-700 mt-1">Dönem: {selectedMonth}</div>
            </div>
          </div>

          {/* Worker Info Grid */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Adı Soyadı:</span>
              <div className="font-bold text-slate-900 text-sm">{selectedWorker.firstName} {selectedWorker.lastName}</div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Sicil No / Kart No:</span>
              <div className="font-bold text-slate-900 text-sm">{selectedWorker.code} / {selectedWorker.cardNumber || '-'}</div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Görevi / Departman:</span>
              <div className="font-semibold text-slate-800">{selectedWorker.role} - {selectedWorker.department}</div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Günlük Yövmiye Ücreti:</span>
              <div className="font-mono font-bold text-emerald-700 text-sm">₺ {selectedWorker.dailyRate.toLocaleString('tr-TR')} / Gün</div>
            </div>
          </div>

          {/* Detailed Earnings & Deductions Table */}
          <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 font-bold uppercase text-slate-700 border-b border-slate-300">
                <tr>
                  <th className="py-2.5 px-4">Hakediş / Kazanç Kalemi</th>
                  <th className="py-2.5 px-4 text-center">Gün / Saat</th>
                  <th className="py-2.5 px-4 text-right">Tutar (₺)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                <tr>
                  <td className="py-2 px-4 font-medium">Normal Çalışma Hakedişi</td>
                  <td className="py-2 px-4 text-center font-mono">{summary ? summary.fullDays : 26} Gün</td>
                  <td className="py-2 px-4 text-right font-mono font-bold">
                    ₺ {(summary ? summary.baseWageEarnings : selectedWorker.dailyRate * 26).toLocaleString('tr-TR')}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-medium">Fazla Mesai Hakedişi (1.5x)</td>
                  <td className="py-2 px-4 text-center font-mono">{summary ? summary.totalOvertimeHours : 12} Saat</td>
                  <td className="py-2 px-4 text-right font-mono font-bold text-emerald-700">
                    + ₺ {(summary ? summary.overtimeEarnings : selectedWorker.overtimeHourlyRate * 12).toLocaleString('tr-TR')}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-medium">Yemek & Yol Yardım Primi</td>
                  <td className="py-2 px-4 text-center font-mono">-</td>
                  <td className="py-2 px-4 text-right font-mono font-bold text-emerald-700">
                    + ₺ {(summary ? summary.totalMealAllowances + summary.totalTransportAllowances : 4500).toLocaleString('tr-TR')}
                  </td>
                </tr>
                <tr className="bg-slate-50 font-bold text-slate-900">
                  <td className="py-2.5 px-4">TOPLAM BRÜT KAZANÇ</td>
                  <td className="py-2.5 px-4 text-center">-</td>
                  <td className="py-2.5 px-4 text-right font-mono text-sm text-emerald-800">
                    ₺ {(summary ? summary.totalGrossEarnings : selectedWorker.dailyRate * 26 + 3000).toLocaleString('tr-TR')}
                  </td>
                </tr>
                <tr className="bg-rose-50 text-rose-900">
                  <td className="py-2 px-4 font-medium">Ödenen Avans & Kesintiler</td>
                  <td className="py-2 px-4 text-center font-mono">-</td>
                  <td className="py-2 px-4 text-right font-mono font-bold text-rose-700">
                    - ₺ {(summary ? summary.totalAdvancesPaid + summary.totalDeductions : 2000).toLocaleString('tr-TR')}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-900 text-white font-extrabold text-sm">
                <tr>
                  <td className="py-3 px-4 uppercase">NET ÖDENECEK MAAŞ:</td>
                  <td className="py-3 px-4 text-center">-</td>
                  <td className="py-3 px-4 text-right font-mono text-base text-emerald-400">
                    ₺ {(summary ? summary.netPayable : selectedWorker.dailyRate * 26 + 1000).toLocaleString('tr-TR')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-300 text-xs text-center text-slate-600">
            <div>
              <div className="font-bold text-slate-800">İşveren / Yetkili İmza</div>
              <div className="h-12"></div>
              <div>YNR MAKİNE SAN. LTD. ŞTİ.</div>
            </div>
            <div>
              <div className="font-bold text-slate-800">Personel Teslim Alan İmza</div>
              <div className="h-12"></div>
              <div>{selectedWorker.firstName} {selectedWorker.lastName}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
