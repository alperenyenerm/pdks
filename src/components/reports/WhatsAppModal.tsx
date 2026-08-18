import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, getMonthNameTr } from '../../utils/calculations';
import type { MonthlyWorkerSummary } from '../../types';
import { Send, MessageSquare, CheckCircle2, Phone, X, Copy, Check } from 'lucide-react';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary?: MonthlyWorkerSummary;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ isOpen, onClose, summary }) => {
  const { settings, selectedYear, selectedMonth, monthlySummaries, notify } = useApp();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sentMap, setSentMap] = useState<{ [key: string]: boolean }>({});

  if (!isOpen) return null;

  // Selected workers list (single or all)
  const targetSummaries = summary ? [summary] : monthlySummaries;

  // Format message text for a worker
  const formatWhatsAppText = (s: MonthlyWorkerSummary) => {
    const phoneClean = s.worker.phone.replace(/\s+/g, '').replace(/^0/, '90');
    const msg = `*${settings.companyName}*\n*${getMonthNameTr(selectedMonth).toUpperCase()} ${selectedYear} MAAŞ VE HAKEDİŞ BÖRDROSU*\n-----------------------------------\n Sayın *${s.worker.firstName} ${s.worker.lastName}* (${s.worker.role}),\n\nBu ayki puantaj ve maaş hakediş detaylarınız aşağıdadır:\n\n Çalışılan Eşdeğer Gün: *${s.totalWorkedDaysEquivalent} Gün*\n Fazla Mesai Saati: *${s.totalOvertimeHours} Saat*\n Brüt Hakediş Tutarı: *${formatCurrency(s.totalGrossEarnings)}*\n Kesilen Nakit/Banka Avansları: *${formatCurrency(s.totalAdvancesPaid)}*\n\n *NET ELE GEÇECEK ÖDENECEK MAAŞ: ${formatCurrency(s.netPayable)}*\n-----------------------------------\nIBAN: ${s.worker.iban || 'Nakit Ödeme'}\n\nİyi çalışmalar dileriz.\n*YNR MAKİNE İK & PUANTAJ YÖNETİMİ*`;

    return { phoneClean, msg };
  };

  const handleSendWhatsApp = (s: MonthlyWorkerSummary) => {
    const { phoneClean, msg } = formatWhatsAppText(s);
    const encodedMsg = encodeURIComponent(msg);
    const url = `https://wa.me/${phoneClean}?text=${encodedMsg}`;
    
    window.open(url, '_blank');
    setSentMap((prev) => ({ ...prev, [s.worker.id]: true }));
    notify('WhatsApp Açıldı', `${s.worker.firstName} ${s.worker.lastName} için bordro WhatsApp mesajı oluşturuldu.`, 'success');
  };

  const handleCopyText = (s: MonthlyWorkerSummary) => {
    const { msg } = formatWhatsAppText(s);
    navigator.clipboard.writeText(msg);
    setCopiedId(s.worker.id);
    notify('Kopyalandı', 'Bordro metni panoya kopyalandı.', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                WhatsApp & SMS Otomatik Bordro Gönderici
              </h3>
              <p className="text-xs text-slate-400">
                {getMonthNameTr(selectedMonth)} {selectedYear} dönemi personel maaş özetlerini cep telefonlarına tek tıkla iletin.
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

        {/* Worker Dispatch List */}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {targetSummaries.map((s) => {
            const isSent = sentMap[s.worker.id];

            return (
              <div
                key={s.worker.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                      {s.worker.code}
                    </span>
                    <h4 className="text-sm font-bold text-white">
                      {s.worker.firstName} {s.worker.lastName}
                    </h4>
                    {isSent && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Gönderildi
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-500" /> {s.worker.phone || 'Telefon Yok'}
                    </span>
                    <span>|</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      Net: {formatCurrency(s.netPayable)}
                    </span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => handleCopyText(s)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition"
                    title="Mesaj Metnini Kopyala"
                  >
                    {copiedId === s.worker.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span>{copiedId === s.worker.id ? 'Kopyalandı' : 'Kopyala'}</span>
                  </button>

                  <button
                    onClick={() => handleSendWhatsApp(s)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-emerald-600/20 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>WhatsApp Gönder</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
          <span>Toplam {targetSummaries.length} Personel Listelendi</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
};
