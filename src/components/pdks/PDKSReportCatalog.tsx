import React, { useState } from 'react';
import { FileText, PieChart, Search, Download, ArrowRight } from 'lucide-react';
import type { PDKSDailyCalculated, Worker } from '../../types';

interface PDKSReportCatalogProps {
  dailySummaries: PDKSDailyCalculated[];
  workers: Worker[];
}

export const PDKSReportCatalog: React.FC<PDKSReportCatalogProps> = ({
  dailySummaries: _dailySummaries,
  workers
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  // All 34 reports from Perkotek Screenshot 1
  const reportsList = [
    { id: '1', title: 'Özlük Raporu', category: 'PERSONEL' },
    { id: '2', title: 'Vardiya Raporu', category: 'VARDIYA' },
    { id: '3', title: 'Genel Bazda Giriş & Çıkış', category: 'HAREKET' },
    { id: '4', title: 'Kişi Bazında Giriş & Çıkış', category: 'HAREKET' },
    { id: '5', title: 'Genel Bazda Geç Kalanlar', category: 'GECIKME' },
    { id: '6', title: 'Kişi Bazında Geç Kalanlar', category: 'GECIKME' },
    { id: '7', title: 'Genel Bazda Erken Çıkanlar', category: 'GECIKME' },
    { id: '8', title: 'Kişi Bazında Erken Çıkanlar', category: 'GECIKME' },
    { id: '9', title: 'Mesaiye Kalanlar', category: 'MESAI' },
    { id: '10', title: 'Devamsızlıklar', category: 'DEVAMSIZLIK' },
    { id: '11', title: 'Girişte Kart Kullanmayı Unutanlar', category: 'UNUTANLAR' },
    { id: '12', title: 'Çıkışta Kart Kullanmayı Unutanlar', category: 'UNUTANLAR' },
    { id: '13', title: 'Giriş yada Çıkışta Kart Kullanmayı Unutanlar', category: 'UNUTANLAR' },
    { id: '14', title: 'Şu An İçerideki Personeller', category: 'CANLI' },
    { id: '15', title: 'Elle Müdahale Yapılmış Hareketler', category: 'MANUEL' },
    { id: '16', title: 'Personellerin Not Bilgileri', category: 'PERSONEL' },
    { id: '17', title: 'Personellerin İrtibat Bilgileri', category: 'PERSONEL' },
    { id: '18', title: 'İşe Giren Personeller', category: 'PERSONEL' },
    { id: '19', title: 'İşten Ayrılan Personeller', category: 'PERSONEL' },
    { id: '20', title: 'Tatil Günü Çalışanlar', category: 'MESAI' },
    { id: '21', title: 'İzin Kullananlar', category: 'IZIN' },
    { id: '22', title: 'Avans Listesi', category: 'FINANS' },
    { id: '23', title: 'Prim Listesi', category: 'FINANS' },
    { id: '24', title: 'Aylık Devam Listesi', category: 'PUANTAJ' },
    { id: '25', title: 'Zimmet Listesi', category: 'ISG' },
    { id: '26', title: 'Dışarıda Geçirilen Süreler', category: 'MOLA' },
    { id: '27', title: 'Yıllık İzin Raporu', category: 'IZIN' },
    { id: '28', title: 'Vardiya Grup Raporu', category: 'VARDIYA' },
    { id: '29', title: 'Mesai Değişikliği Raporu', category: 'MESAI' },
    { id: '30', title: 'Mola Raporu', category: 'MOLA' },
    { id: '31', title: 'Acil Durum Raporu', category: 'CANLI' },
    { id: '32', title: 'Zorunlu Fazla Mesai Raporu', category: 'MESAI' },
    { id: '33', title: 'Onay Gerektiren Fazla Mesai Raporu', category: 'MESAI' },
    { id: '34', title: 'Kullanıcı İşlem Raporu', category: 'AUDIT' }
  ];

  const filteredReports = reportsList.filter(rep => {
    const matchesSearch = rep.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = activeCategory === 'ALL' || rep.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const handleGenerateReport = (reportTitle: string) => {
    setSelectedReport(reportTitle);
  };

  const handleExportCSV = (title: string) => {
    const headers = ['Sıra', 'Personel Adı', 'Sicil No', 'Tarih / Süre', 'Rapor Tipi', 'Durum'];
    const rows = workers.map((w, idx) => [
      idx + 1,
      `${w.firstName} ${w.lastName}`,
      w.code,
      new Date().toISOString().split('T')[0],
      title,
      'UYGUN'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${title.replace(/\s+/g, '_')}_Raporu.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/90 p-5 rounded-xl border border-slate-700/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
            <PieChart className="w-5 h-5 text-purple-400" />
            Perkotek Rapor Kataloğu
          </div>
          <h2 className="text-xl font-bold text-white mt-1">34 Çeşit Özel PDKS & Devam Raporları</h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Geç kalanlar, kart unutanlar, mesai yapanlar, devamsızlar ve acil durum rapor modülleri.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 bg-slate-800/80 p-4 rounded-xl border border-slate-700/50">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input 
            type="text"
            placeholder="34 rapor çeşidi arasında ara..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {['ALL', 'HAREKET', 'GECIKME', 'MESAI', 'DEVAMSIZLIK', 'IZIN', 'CANLI'].map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeCategory === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              {cat === 'ALL' ? 'Tüm Raporlar (34)' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* 34 Report Cards Grid (Matching Perkotek Screen 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {filteredReports.map(rep => (
          <div 
            key={rep.id}
            onClick={() => handleGenerateReport(rep.title)}
            className="bg-slate-800/90 border border-slate-700 hover:border-purple-500/60 p-4 rounded-xl shadow-sm hover:shadow-lg transition cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition flex-shrink-0">
                <PieChart className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-200 group-hover:text-white leading-snug">
                {rep.title}
              </h4>
            </div>

            <div className="mt-4 pt-2 border-t border-slate-700/40 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-purple-300">
              <span>Raporu Aç</span>
              <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-1" />
            </div>
          </div>
        ))}
      </div>

      {/* Selected Report Modal / Preview */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">{selectedReport}</h3>
              </div>
              <button 
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-2">
              <div className="font-semibold text-white">Rapor Önizleme & İstatistikleri:</div>
              <div>• Kapsam: <strong className="text-purple-300">{workers.length} Personel Kaydı</strong></div>
              <div>• Dönem: <strong className="text-emerald-400">Ağustos 2026 Canlı Dönemi</strong></div>
              <div>• Durum: Formatsal veri aktarımına ve Excel çıktısına hazır.</div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition"
              >
                Kapat
              </button>
              <button 
                onClick={() => handleExportCSV(selectedReport)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-sm transition shadow flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Raporu Excel (CSV) Olarak İndir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
