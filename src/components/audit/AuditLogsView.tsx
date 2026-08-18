import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Search, Clock } from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchSearch = `${log.action} ${log.user} ${log.details}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'ALL' || log.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            Sistem Denetim İzi & İşlem Geçmişi (Audit Log)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Sistemdeki tüm puantaj, avans, personel ve veri değişikliklerinin zaman damgalı kayıtları.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Kullanıcı, işlem veya açıklama ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-auto bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
        >
          <option value="ALL">Tüm Kategoriler</option>
          <option value="PUANTAJ">Puantaj İşlemleri</option>
          <option value="AVANS">Avans & Kesintiler</option>
          <option value="PERSONEL">Personel Düzenlemeleri</option>
          <option value="AYARLAR">Sistem Ayarları</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Zaman Damgası</th>
                <th className="py-3 px-4">Kullanıcı</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Eylem</th>
                <th className="py-3 px-4">İşlem Detayları</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-mono text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4 font-bold text-white">{log.user}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-amber-400 font-mono text-[10px] border border-slate-700 font-bold">
                      {log.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-emerald-400">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 text-slate-300">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
