import React, { useState } from 'react';
import { 
  Fingerprint, LogIn, LogOut, Plus, Search, Filter
} from 'lucide-react';
import type { PDKSLog, Worker } from '../../types';

interface PDKSHareketlerProps {
  logs: PDKSLog[];
  workers: Worker[];
  onAddLog: (log: Omit<PDKSLog, 'id'>) => void;
}

export const PDKSHareketler: React.FC<PDKSHareketlerProps> = ({
  logs,
  workers,
  onAddLog
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [directionFilter, setDirectionFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State for manual log
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [direction, setDirection] = useState<'IN' | 'OUT'>('IN');
  const [verificationType, setVerificationType] = useState<'FINGERPRINT' | 'FACE' | 'CARD' | 'MANUAL'>('FINGERPRINT');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('08:00');
  const [deviceName, setDeviceName] = useState('Ana Turnike Okuyucu');
  const [notes, setNotes] = useState('');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.workerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.deviceName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDirection = directionFilter === 'ALL' || log.direction === directionFilter;
    return matchesSearch && matchesDirection;
  });

  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    const worker = workers.find(w => w.id === selectedWorkerId);
    if (!worker) return;

    onAddLog({
      workerId: worker.id,
      workerCode: worker.code,
      workerName: `${worker.firstName} ${worker.lastName}`,
      deviceId: 'PERKOTEK_MANUAL',
      deviceName: deviceName || 'Manuel Kayıt',
      verificationType: verificationType,
      direction: direction,
      timestamp: `${date} ${time}:00`,
      status: 'MANUAL_ENTRY',
      notes: notes
    });

    setShowAddModal(false);
    // Reset fields
    setNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/90 p-5 rounded-xl border border-slate-700/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
            <Fingerprint className="w-5 h-5 text-blue-400" />
            PDKS Geçiş & Cihaz Kayıtları
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Giriş / Çıkış Hareket Logları</h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Perkotek turnike, parmak izi ve yüz tanıma cihazlarından gelen anlık hareket kayıtları.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition shadow flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Manuel Hareket Ekle
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 bg-slate-800/80 p-4 rounded-xl border border-slate-700/50">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input 
            type="text"
            placeholder="Personel adı, sicil no veya cihaz adı ile ara..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 ml-1" />
          <select 
            value={directionFilter}
            onChange={e => setDirectionFilter(e.target.value as any)}
            className="bg-slate-900/80 border border-slate-700 rounded-lg text-sm text-white px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Tüm Yönler (Giriş + Çıkış)</option>
            <option value="IN">Yalnızca Girişler (IN)</option>
            <option value="OUT">Yalnızca Çıkışlar (OUT)</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-800/90 rounded-xl border border-slate-700/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-700">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Personel</th>
                <th className="py-3.5 px-4 font-semibold">Geçiş Yönü</th>
                <th className="py-3.5 px-4 font-semibold">Tarih & Saat</th>
                <th className="py-3.5 px-4 font-semibold">Cihaz / Konum</th>
                <th className="py-3.5 px-4 font-semibold">Doğrulama Tipi</th>
                <th className="py-3.5 px-4 font-semibold">Durum</th>
                <th className="py-3.5 px-4 font-semibold">Not</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Aranan kriterlere uygun geçiş kaydı bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-700/30 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 text-xs font-bold">
                          {log.workerName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{log.workerName}</div>
                          <div className="text-xs text-slate-400">Sicil No: {log.workerCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                        log.direction === 'IN' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {log.direction === 'IN' ? <LogIn className="w-3.5 h-3.5" /> : <LogOut className="w-3.5 h-3.5" />}
                        {log.direction === 'IN' ? 'GİRİŞ' : 'ÇIKIŞ'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-white">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-300">
                      {log.deviceName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-[11px] font-medium text-slate-300 uppercase">
                        {log.verificationType}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs ${
                        log.status === 'MANUAL_ENTRY' ? 'text-amber-400 font-medium' : 'text-slate-400'
                      }`}>
                        {log.status === 'MANUAL_ENTRY' ? 'Manuel Eklendi' : 'Cihaz Kaydı'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400">
                      {log.notes || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" />
              Manuel Giriş/Çıkış Kaydı Ekle
            </h3>
            <p className="text-xs text-slate-400">
              Kart okutmayı unutan veya izinli geçiş yapan personel için manuel log kaydı girin.
            </p>

            <form onSubmit={handleSubmitManual} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Personel Seçin</label>
                <select 
                  required
                  value={selectedWorkerId}
                  onChange={e => setSelectedWorkerId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Personel Seçiniz --</option>
                  {workers.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.firstName} {w.lastName} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Geçiş Yönü</label>
                  <select 
                    value={direction}
                    onChange={e => setDirection(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="IN">GİRİŞ (IN)</option>
                    <option value="OUT">ÇIKIŞ (OUT)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Doğrulama Tipi</label>
                  <select 
                    value={verificationType}
                    onChange={e => setVerificationType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="FINGERPRINT">Parmak İzi</option>
                    <option value="FACE">Yüz Tanıma</option>
                    <option value="CARD">Kart Okuma</option>
                    <option value="MANUAL">Manuel Giriş</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Tarih</label>
                  <input 
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Saat</label>
                  <input 
                    type="time"
                    required
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Cihaz / Konum Adı</label>
                <input 
                  type="text"
                  value={deviceName}
                  onChange={e => setDeviceName(e.target.value)}
                  placeholder="Örn: Ana Turnike, Güvenlik Giriş"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Açıklama / Not</label>
                <textarea 
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Manuel ekleme sebebi..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition"
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition shadow"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
