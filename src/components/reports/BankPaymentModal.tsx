import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, getMonthNameTr } from '../../utils/calculations';
import { Building2, Download, AlertTriangle, X } from 'lucide-react';

interface BankPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type BankFormat = 'ZIRAAT' | 'GARANTI' | 'AKBANK' | 'ISBANK' | 'YAPIKREDI' | 'GENERIC_CSV';

export const BankPaymentModal: React.FC<BankPaymentModalProps> = ({ isOpen, onClose }) => {
  const { settings, selectedYear, selectedMonth, monthlySummaries, notify } = useApp();

  const [selectedBank, setSelectedBank] = useState<BankFormat>('ZIRAAT');

  if (!isOpen) return null;

  const validSummaries = monthlySummaries.filter((s) => s.netPayable > 0);
  const totalNetPayment = validSummaries.reduce((sum, s) => sum + s.netPayable, 0);
  const missingIbanCount = validSummaries.filter((s) => !s.worker.iban || s.worker.iban.trim() === '').length;

  // Generate Bank File Content
  const generateBankFile = () => {
    const periodStr = `${getMonthNameTr(selectedMonth).toUpperCase()} ${selectedYear}`;
    let content = '';
    let fileName = `YNR_MAAS_ODEME_${selectedBank}_${selectedYear}_${selectedMonth}`;

    if (selectedBank === 'GENERIC_CSV') {
      // CSV Format
      content = `Banka IBAN;Alıcı Adı Soyadı;T.C. Kimlik No;Ödenecek Tutar (TL);Açıklama\n`;
      validSummaries.forEach((s) => {
        const iban = s.worker.iban || 'TR000000000000000000000000';
        const name = `${s.worker.firstName} ${s.worker.lastName}`;
        const tc = s.worker.tcNo || '12345678901';
        const amount = s.netPayable.toFixed(2);
        const desc = `${periodStr} MAAŞ ÖDEMESİ - ${settings.companyName}`;
        content += `${iban};${name};${tc};${amount};${desc}\n`;
      });
      fileName += '.csv';
    } else {
      // Official TXT Banking File Formats
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      content += `H|${settings.taxNo}|${settings.companyName}|${dateStr}|${validSummaries.length}|${totalNetPayment.toFixed(2)}|${periodStr} MAAS TABLO\n`;

      validSummaries.forEach((s, idx) => {
        const lineNo = String(idx + 1).padStart(4, '0');
        const iban = (s.worker.iban || 'TR000000000000000000000000').replace(/\s+/g, '');
        const name = `${s.worker.firstName} ${s.worker.lastName}`.padEnd(40, ' ');
        const amount = String(Math.round(s.netPayable * 100)).padStart(12, '0'); // Amount in kurus
        const desc = `${periodStr} MAAS`.padEnd(30, ' ');

        content += `D|${lineNo}|${iban}|${amount}|TRY|${name}|${desc}\n`;
      });

      content += `T|${validSummaries.length}|${String(Math.round(totalNetPayment * 100)).padStart(14, '0')}\n`;
      fileName += '.txt';
    }

    // Trigger Download
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    notify('Banka Dosyası İndirildi', `${selectedBank} formatında toplu ödeme dosyası oluşturuldu.`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl p-6 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Toplu Banka Maaş Ödeme Dosyası Oluşturucu (EFT / TXT / CSV)
              </h3>
              <p className="text-xs text-slate-400">
                {getMonthNameTr(selectedMonth)} {selectedYear} dönemi toplam <b>{formatCurrency(totalNetPayment)}</b> tutarındaki net maaş hakedişlerini tek tıkla kurumsal banka formatına dönüştürün.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bank Selection Cards */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-300 block">Kurumsal Banka Şablonu Seçiniz:</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { id: 'ZIRAAT', name: 'Ziraat Bankası', desc: 'Virman & EFT TXT' },
              { id: 'GARANTI', name: 'Garanti BBVA', desc: 'Maaş Ödeme TXT' },
              { id: 'AKBANK', name: 'Akbank', desc: 'Kurumsal Havale TXT' },
              { id: 'ISBANK', name: 'İş Bankası', desc: 'EFT Ödeme Şablonu' },
              { id: 'YAPIKREDI', name: 'Yapı Kredi', desc: 'Toplu EFT Dosyası' },
              { id: 'GENERIC_CSV', name: 'Genel CSV / Excel', desc: 'Noktalı Virgül CSV' },
            ].map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBank(b.id as BankFormat)}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                  selectedBank === b.id
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <p className="text-xs font-bold">{b.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{b.desc}</p>
                </div>
                {selectedBank === b.id && (
                  <span className="mt-2 text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold self-start">
                    SEÇİLİ
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Warnings & Summary Stats */}
        {missingIbanCount > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 flex items-center space-x-3 text-amber-300 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold">IBAN Eksik Uyarısı:</span> Toplam {missingIbanCount} personelin IBAN bilgisi tanımlanmamış. Bu personeller varsayılan geçici IBAN ile dosyaya eklenecektir.
            </div>
          </div>
        )}

        {/* Worker Payment Table Preview */}
        <div className="border border-slate-800 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 sticky top-0">
              <tr>
                <th className="p-2.5">Personel</th>
                <th className="p-2.5">IBAN</th>
                <th className="p-2.5 text-right">Net Ödenecek (₺)</th>
                <th className="p-2.5 text-center">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {validSummaries.map((s) => (
                <tr key={s.worker.id} className="hover:bg-slate-800/40">
                  <td className="p-2.5 font-bold">
                    {s.worker.firstName} {s.worker.lastName}
                  </td>
                  <td className="p-2.5 font-mono text-slate-400 text-[11px]">
                    {s.worker.iban || <span className="text-amber-400 font-semibold">IBAN Girilmedi</span>}
                  </td>
                  <td className="p-2.5 text-right font-mono font-bold text-emerald-400">
                    {formatCurrency(s.netPayable)}
                  </td>
                  <td className="p-2.5 text-center">
                    {s.worker.iban ? (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                        Hazır
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-bold">
                        Kontrol Et
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div>
            <p className="text-xs text-slate-400">Ödenecek Kişi Sayısı: <b>{validSummaries.length} Personel</b></p>
            <p className="text-sm font-bold text-amber-400 font-mono">Toplam Toplu EFT: {formatCurrency(totalNetPayment)}</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              Kapat
            </button>
            <button
              onClick={generateBankFile}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center space-x-2 shadow-lg shadow-amber-500/20"
            >
              <Download className="w-4 h-4" />
              <span>{selectedBank} Banka Ödeme Dosyasını İndir (.TXT / .CSV)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
