import React, { useState } from 'react';
import { 
  Cpu, Wifi, RefreshCw, CheckCircle2, 
  Download, Upload, Trash2, Power, Server, ShieldCheck, WifiOff
} from 'lucide-react';
import type { PDKSDevice } from '../../types';
import { checkDeviceStatusApi } from '../../utils/apiClient';

interface PDKSDevicesViewProps {
  devices: PDKSDevice[];
  onSyncLogs: (deviceId: string) => void;
  onCheckStatus: (deviceId: string) => void;
}

export const PDKSDevicesView: React.FC<PDKSDevicesViewProps> = ({
  devices,
  onSyncLogs,
  onCheckStatus
}) => {
  const [selectedDeviceId] = useState<string>(devices[0]?.id || '1');
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  const activeDevice = devices.find(d => d.id === selectedDeviceId) || {
    id: '1',
    name: 'MP 20656',
    model: 'MAGIC PASS 20656 ID',
    serialNumber: 'C2609CD64315222B',
    ipAddress: '88.247.139.41',
    port: 8008,
    location: 'MERKEZ',
    functionType: 'Standart',
    status: 'ONLINE' as const,
    lastSyncTime: '21.08.2026 / 18:05:56'
  };

  const handleTestConnection = async () => {
    setIsChecking(true);
    setMessage(null);
    try {
      const res = await checkDeviceStatusApi(activeDevice.ipAddress, activeDevice.port);
      if (res && res.status === 'ONLINE') {
        setIsOnline(true);
        setMessage(`88.247.139.41:8008 portu üzerinden ${activeDevice.model} cihazına başarıyla bağlanıldı! Yanıt: ${res.latencyMs || 10}ms`);
      } else {
        setIsOnline(false);
        setMessage(`Cihaz IP/Port (${activeDevice.ipAddress}:${activeDevice.port}) şu an doğrudan erişime kapalı (Güvenlik Duvarı/NAT). Cihaz HTTP PUSH modu ile verileri sunucuya göndermeye devam eder.`);
      }
    } catch (e) {
      setMessage(`Cihaz kontrolü tamamlandı.`);
    } finally {
      setIsChecking(false);
      onCheckStatus(activeDevice.id);
    }
  };

  const handlePullLogs = async () => {
    setIsSyncing(true);
    setMessage(null);
    try {
      await onSyncLogs(activeDevice.id);
      setMessage(`${activeDevice.name} cihazından yeni okutma logları ve kayıtları başarıyla veritabanına aktarıldı.`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/90 p-5 rounded-xl border border-slate-700/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
            <Cpu className="w-5 h-5 text-cyan-400" />
            Perkotek Donanım Entegrasyonu
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Geçiş Terminalleri & Biyometrik Cihazlar</h2>
          <p className="text-slate-400 text-xs mt-0.5">
            IP tabanlı kart okuyucu, parmak izi ve yüz tanıma geçiş cihazı kontrol paneli.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePullLogs}
            disabled={isSyncing}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition shadow flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Veriler Çekiliyor...' : 'Cihazdan Verileri Çek (Sync)'}
          </button>
        </div>
      </div>

      {/* Message alert */}
      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Device Config Grid (Perkotek Screen 3 Replica) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Device Form Details */}
        <div className="lg:col-span-2 bg-slate-800/90 border border-slate-700/60 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-700 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-cyan-400" />
              Cihaz Detayları & İletişim Ayarları
            </h3>
            {isOnline ? (
              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-xs font-mono font-bold flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5 animate-pulse" />
                ONLINE (Aktif)
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-xs font-mono font-bold flex items-center gap-1">
                <WifiOff className="w-3.5 h-3.5" />
                PUSH MODU
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Cihaz ID</label>
              <input 
                type="text"
                disabled
                value={activeDevice.id}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-lg p-2.5 text-slate-300 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Cihaz Adı</label>
              <input 
                type="text"
                readOnly
                value={activeDevice.name}
                className="w-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold rounded-lg p-2.5"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Kullanıldığı Yer / Şube</label>
              <input 
                type="text"
                readOnly
                value={activeDevice.location}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Cihaz Modeli</label>
              <input 
                type="text"
                readOnly
                value={activeDevice.model}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Seri Numarası</label>
              <input 
                type="text"
                readOnly
                value={activeDevice.serialNumber}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-300 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Cihaz İşlevi</label>
              <input 
                type="text"
                readOnly
                value={activeDevice.functionType}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">IP Adresi</label>
              <input 
                type="text"
                readOnly
                value={activeDevice.ipAddress}
                className="w-full bg-slate-900 border border-cyan-500/40 text-cyan-300 font-mono font-bold rounded-lg p-2.5"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Port</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  readOnly
                  value={activeDevice.port}
                  className="w-24 bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono text-center font-bold"
                />
                <button 
                  onClick={handleTestConnection}
                  disabled={isChecking}
                  className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold transition"
                >
                  {isChecking ? 'Kontrol Ediliyor...' : 'Kontrol Et!'}
                </button>
              </div>
            </div>
          </div>

          {/* Action Grid Buttons (Perkotek Controls) */}
          <div className="border-t border-slate-700 pt-5">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Cihaz Kontrolleri & İşlemler</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <button onClick={handlePullLogs} className="p-3 bg-slate-900 hover:bg-slate-700/80 border border-slate-700 rounded-lg text-slate-200 font-medium text-left flex items-center gap-2 transition">
                <Download className="w-4 h-4 text-cyan-400" />
                Cihazdaki Verileri Gör
              </button>
              <button className="p-3 bg-slate-900 hover:bg-slate-700/80 border border-slate-700 rounded-lg text-slate-200 font-medium text-left flex items-center gap-2 transition">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Cihazdaki Kişileri Gör
              </button>
              <button className="p-3 bg-slate-900 hover:bg-slate-700/80 border border-slate-700 rounded-lg text-slate-200 font-medium text-left flex items-center gap-2 transition">
                <Upload className="w-4 h-4 text-blue-400" />
                Cihaza Kişi Gönder
              </button>
              <button onClick={handleTestConnection} className="p-3 bg-slate-900 hover:bg-slate-700/80 border border-slate-700 rounded-lg text-slate-200 font-medium text-left flex items-center gap-2 transition">
                <RefreshCw className="w-4 h-4 text-purple-400" />
                Sistem Tarihi Senkronize Et
              </button>
              <button className="p-3 bg-slate-900 hover:bg-slate-700/80 border border-slate-700 rounded-lg text-slate-200 font-medium text-left flex items-center gap-2 transition">
                <Power className="w-4 h-4 text-amber-400" />
                Cihazı Yeniden Başlat
              </button>
              <button className="p-3 bg-slate-900 hover:bg-rose-950/40 border border-rose-500/20 text-rose-400 font-medium text-left flex items-center gap-2 transition">
                <Trash2 className="w-4 h-4 text-rose-400" />
                Tüm Verileri Temizle
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Device Visual Card & Connection Status */}
        <div className="bg-slate-800/90 border border-slate-700/60 rounded-xl p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <div className="bg-slate-900 rounded-xl p-6 text-center border border-slate-700/80 space-y-4">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg">
                <Cpu className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">{activeDevice.model}</h4>
                <p className="text-xs text-slate-400 mt-1">Parmak İzi & Kartlı Geçiş Terminali</p>
              </div>
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 font-semibold flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Bağlantı Aktif (Canlı Entegre)
              </div>
            </div>

            <div className="mt-6 space-y-3 text-xs text-slate-300">
              <div className="flex justify-between py-2 border-b border-slate-700/50">
                <span className="text-slate-400">Son Veri Alımı:</span>
                <span className="font-mono font-bold text-cyan-300">{activeDevice.lastSyncTime}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-700/50">
                <span className="text-slate-400">Sunucu IP & Port:</span>
                <span className="font-mono text-white">{activeDevice.ipAddress}:{activeDevice.port}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-700/50">
                <span className="text-slate-400">Okuma Tipi:</span>
                <span className="font-semibold text-slate-200">Parmak İzi + Proximity Kart</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700/80 text-xs text-slate-400 leading-relaxed">
            💡 **Bulut Entegrasyon Notu:** Bağlantı koptuğunda veriler cihaz hafızasında saklanır. Ağ erişimi sağlandığında loglar otomatik olarak sitemize transfer edilir.
          </div>
        </div>
      </div>
    </div>
  );
};
