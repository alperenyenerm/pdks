import React from 'react';
import { Wrench, Building2, Layers, Tag, ShieldCheck, Truck } from 'lucide-react';
import type { BranchLocation, CompanySettings } from '../../types';

interface PDKSDefinitionsViewProps {
  branches: BranchLocation[];
  settings: CompanySettings;
}

export const PDKSDefinitionsView: React.FC<PDKSDefinitionsViewProps> = ({
  branches,
  settings: _settings
}) => {
  
  // Custom reason codes and departments matching Perkotek Screenshot 2
  const definitionsList = [
    { title: 'Şirket / Şube Tanımları', count: branches.length, icon: <Building2 className="w-5 h-5 text-blue-400" /> },
    { title: 'Departman Tanımları', count: 8, icon: <Layers className="w-5 h-5 text-emerald-400" /> },
    { title: 'Bölüm & Ünite Tanımları', count: 12, icon: <Tag className="w-5 h-5 text-indigo-400" /> },
    { title: 'Servis & Güzergah Tanımları', count: 4, icon: <Truck className="w-5 h-5 text-amber-400" /> },
    { title: 'Zimmet Kategorileri', count: 7, icon: <ShieldCheck className="w-5 h-5 text-purple-400" /> },
    { title: 'Gecikme & İzin Neden Kodları', count: 6, icon: <Wrench className="w-5 h-5 text-cyan-400" /> }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/90 p-5 rounded-xl border border-slate-700/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <Wrench className="w-5 h-5 text-indigo-400" />
            Perkotek Genel Tanımlama Parametreleri
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Şirket, Departman, Bölüm & Neden Kodları</h2>
          <p className="text-slate-400 text-xs mt-0.5">
            PDKS altyapısındaki departman, birim, servis, zimmet bölümleri ve mazeret kodu tanımları.
          </p>
        </div>
      </div>

      {/* Grid of Definition Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {definitionsList.map((def, idx) => (
          <div 
            key={idx}
            className="bg-slate-800/90 border border-slate-700 hover:border-indigo-500/50 p-5 rounded-xl shadow-sm transition flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center">
                {def.icon}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{def.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{def.count} Kayıtlı Tanım</p>
              </div>
            </div>
            <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-semibold transition">
              Yönet
            </button>
          </div>
        ))}
      </div>

      {/* Department & Reason Codes Table */}
      <div className="bg-slate-800/90 border border-slate-700/60 rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          Aktif Departmanlar ve Neden Kodları Listesi
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Departmanlar */}
          <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-700/80">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Departmanlar</h4>
            <div className="space-y-2 text-xs text-slate-200">
              {['KAYNAK ATÖLYESİ', 'TAŞLAMA & ÇAPAK', 'CNC TORNA & FREZE', 'MONTAJ & OTOMASYON', 'AR-GE & TASARIM', 'KALİTE KONTROL', 'İDARİ İŞLER', 'SEVKİYAT & DEPO'].map((dep, i) => (
                <div key={i} className="flex justify-between items-center p-2 rounded bg-slate-800/60 border border-slate-700/50">
                  <span>{dep}</span>
                  <span className="text-[10px] text-slate-400 font-mono">DEP-0{i+1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Neden Kodları */}
          <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-700/80">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Geç Kalma & İzin Neden Kodları</h4>
            <div className="space-y-2 text-xs text-slate-200">
              {[
                { code: 'NK-01', name: 'Servis / Trafik Gecikmesi', type: 'Ücretli İzin' },
                { code: 'NK-02', name: 'Doktor / Hastane Vizite', type: 'Mazeret İzni' },
                { code: 'NK-03', name: 'Resmi Daire / Noter İşi', type: 'Görevli Çıkış' },
                { code: 'NK-04', name: 'Ücretsiz Evlilik İzni', type: 'Ücretsiz İzin' },
                { code: 'NK-05', name: 'Vefat / Cenaze İzni', type: 'Ücretli Mazeret' },
                { code: 'NK-06', name: 'Makinanın Arızalanması', type: 'İdari Bekleme' },
              ].map((reason, i) => (
                <div key={i} className="flex justify-between items-center p-2 rounded bg-slate-800/60 border border-slate-700/50">
                  <div>
                    <span className="font-semibold">{reason.name}</span>
                    <span className="text-[10px] text-slate-400 block">{reason.type}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-700 text-indigo-300 rounded font-mono">{reason.code}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
