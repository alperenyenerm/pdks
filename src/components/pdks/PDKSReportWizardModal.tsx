import React, { useState } from 'react';
import { Sliders, Play } from 'lucide-react';
import type { Worker } from '../../types';

interface PDKSReportWizardModalProps {
  workers: Worker[];
  isOpen: boolean;
  onClose: () => void;
  onRunReport: (params: any) => void;
}

export const PDKSReportWizardModal: React.FC<PDKSReportWizardModalProps> = ({
  workers,
  isOpen,
  onClose,
  onRunReport
}) => {
  const [selectedWorkerOption, setSelectedWorkerOption] = useState<string>('ALL');
  const [sortOption, setSortOption] = useState<string>('NAME_ASC');
  const [roundOvertime, setRoundOvertime] = useState<string>('NONE');
  const [firstInLastOutOnly, setFirstInLastOutOnly] = useState<boolean>(true);

  const [startDate, setStartDate] = useState<string>('2026-08-01');
  const [endDate, setEndDate] = useState<string>('2026-08-22');
  const [monthlyCalc, setMonthlyCalc] = useState<boolean>(true);

  // ADIM 3 Payroll columns matrix matching Perkotek Screenshot 1
  const [payrollMatrix, setPayrollMatrix] = useState({
    normalWork: { day: true, hour: true, wage: true, gf: true },
    overtime50: { day: false, hour: true, wage: true, gf: false },
    overtime100: { day: false, hour: false, wage: false, gf: false },
    absenteeism: { day: true, hour: true, wage: true, gf: true },
    paidLeave: { day: true, hour: true, wage: true, gf: true },
    unpaidLeave: { day: true, hour: true, wage: true, gf: true },
    paidMedicalReport: { day: true, hour: false, wage: true, gf: true },
    unpaidMedicalReport: { day: true, hour: false, wage: true, gf: true },
    officialHoliday: { day: true, hour: false, wage: true, gf: true },
    weekendHoliday: { day: true, hour: true, wage: true, gf: true },
    annualLeave: { day: true, hour: false, wage: true, gf: true },
    advance: { day: false, hour: false, wage: true, gf: false },
    bonus: { day: false, hour: false, wage: true, gf: false },
    transport: { day: false, hour: false, wage: true, gf: false },
  });

  if (!isOpen) return null;

  const handleToggleMatrix = (key: keyof typeof payrollMatrix, col: 'day' | 'hour' | 'wage' | 'gf') => {
    setPayrollMatrix(prev => ({
      ...prev,
      [key]: { ...prev[key], [col]: !prev[key][col] }
    }));
  };

  const handleExecute = () => {
    onRunReport({
      selectedWorkerOption,
      sortOption,
      startDate,
      endDate,
      monthlyCalc,
      payrollMatrix
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center bg-slate-900 px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-2 text-indigo-400 font-bold">
            <Sliders className="w-5 h-5" />
            <span>PDKS Raporlama Parametre Sihirbazı (Perkotek Rapor Çıkar)</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
        </div>

        {/* Content Body: 3 Steps (Perkotek Screenshot 1 Replica) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Side: ADIM 1 & ADIM 2 */}
            <div className="space-y-6">
              {/* ADIM 1 */}
              <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 space-y-3">
                <div className="font-bold text-slate-200 text-xs uppercase tracking-wider text-indigo-400">
                  ADIM 1: Raporlama İçin Personel Seçiniz
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <button className="px-3 py-2 bg-slate-800 border border-slate-700 text-white font-semibold rounded text-xs">
                      Personel Seçimi (Tümü - {workers.length} Kişi)
                    </button>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={selectedWorkerOption === 'ALL'}
                        onChange={e => setSelectedWorkerOption(e.target.checked ? 'ALL' : 'SELECTED')}
                        className="rounded border-slate-700"
                      />
                      <span>Tüm Personeller</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Sıralama:</label>
                      <select 
                        value={sortOption}
                        onChange={e => setSortOption(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                      >
                        <option value="NAME_ASC">Ad Soyad (A-Z)</option>
                        <option value="CODE_ASC">Sicil / Kart No</option>
                        <option value="DEPT_ASC">Departman Bazlı</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">FM Saat Yuvarlama:</label>
                      <select 
                        value={roundOvertime}
                        onChange={e => setRoundOvertime(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                      >
                        <option value="NONE">Yuvarlama Yapma</option>
                        <option value="15MIN">15 Dakikaya Tamamla</option>
                        <option value="30MIN">30 Dakikaya Tamamla</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-800/80 rounded border border-slate-700 flex items-center gap-2">
                    <input 
                      type="checkbox"
                      id="firstLastCheck"
                      checked={firstInLastOutOnly}
                      onChange={e => setFirstInLastOutOnly(e.target.checked)}
                      className="rounded border-slate-700"
                    />
                    <label htmlFor="firstLastCheck" className="text-xs text-white font-medium cursor-pointer">
                      İlk Giriş & Son Çıkış arasını dikkate al!
                    </label>
                  </div>
                </div>
              </div>

              {/* ADIM 2 */}
              <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 space-y-3">
                <div className="font-bold text-slate-200 text-xs uppercase tracking-wider text-emerald-400">
                  ADIM 2: Görüntülemek İstediğiniz Tarih Aralığı
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Başlangıç Tarihi:</label>
                    <input 
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Bitiş Tarihi:</label>
                    <input 
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input 
                    type="checkbox"
                    id="monthlyCalcCheck"
                    checked={monthlyCalc}
                    onChange={e => setMonthlyCalc(e.target.checked)}
                    className="rounded border-slate-700"
                  />
                  <label htmlFor="monthlyCalcCheck" className="text-xs text-white font-medium cursor-pointer">
                    Aylık Hesap (26 Gün / 225 Saat Standart Ay Hesabı)
                  </label>
                </div>
              </div>
            </div>

            {/* Right Side: ADIM 3 Bordro Alanları Matrisi */}
            <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 space-y-3 flex flex-col justify-between">
              <div>
                <div className="font-bold text-slate-200 text-xs uppercase tracking-wider text-purple-400 mb-2">
                  ADIM 3: Raporlarda Hesaplanmasını İstediğiniz Bordro Alanları
                </div>

                <div className="border border-slate-700 rounded-lg overflow-hidden max-h-[340px] overflow-y-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-800 text-[11px] font-bold uppercase text-slate-300 border-b border-slate-700">
                      <tr>
                        <th className="py-2 px-3">Bordro Alanı</th>
                        <th className="py-2 px-2 text-center">Gün</th>
                        <th className="py-2 px-2 text-center">Saat</th>
                        <th className="py-2 px-2 text-center">Ücret</th>
                        <th className="py-2 px-2 text-center">G.F.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {[
                        { key: 'normalWork', label: 'Normal Çalışma' },
                        { key: 'overtime50', label: 'Fazla Mesai %50' },
                        { key: 'overtime100', label: 'Fazla Mesai %100' },
                        { key: 'absenteeism', label: 'Devamsızlık' },
                        { key: 'paidLeave', label: 'Ücretli İzin' },
                        { key: 'unpaidLeave', label: 'Ücretsiz İzin' },
                        { key: 'paidMedicalReport', label: 'Rapor (Ücretli)' },
                        { key: 'unpaidMedicalReport', label: 'Rapor (Ücretsiz)' },
                        { key: 'officialHoliday', label: 'Resmi Tatil' },
                        { key: 'weekendHoliday', label: 'Hafta Tatili' },
                        { key: 'annualLeave', label: 'Yıllık İzin' },
                        { key: 'advance', label: 'Avans' },
                        { key: 'bonus', label: 'Prim' },
                        { key: 'transport', label: 'Yol Parası' },
                      ].map((item) => {
                        const m = payrollMatrix[item.key as keyof typeof payrollMatrix];
                        return (
                          <tr key={item.key} className="hover:bg-slate-800/50">
                            <td className="py-1.5 px-3 font-medium text-white">{item.label}</td>
                            <td className="py-1.5 px-2 text-center">
                              <input 
                                type="checkbox"
                                checked={m.day}
                                onChange={() => handleToggleMatrix(item.key as any, 'day')}
                              />
                            </td>
                            <td className="py-1.5 px-2 text-center">
                              <input 
                                type="checkbox"
                                checked={m.hour}
                                onChange={() => handleToggleMatrix(item.key as any, 'hour')}
                              />
                            </td>
                            <td className="py-1.5 px-2 text-center">
                              <input 
                                type="checkbox"
                                checked={m.wage}
                                onChange={() => handleToggleMatrix(item.key as any, 'wage')}
                              />
                            </td>
                            <td className="py-1.5 px-2 text-center">
                              <input 
                                type="checkbox"
                                checked={m.gf}
                                onChange={() => handleToggleMatrix(item.key as any, 'gf')}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="bg-slate-900 px-6 py-4 border-t border-slate-700 flex justify-between items-center">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
          >
            İptal
          </button>
          <button 
            onClick={handleExecute}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-sm transition shadow flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Rapor Çıkar (Hesapla)
          </button>
        </div>
      </div>
    </div>
  );
};
