import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { changePasswordApi } from '../../utils/apiClient';
import {
  Settings,
  Download,
  Upload,
  RefreshCw,
  Save,
  CheckCircle2,
  Trash2,
  KeyRound,
  Percent,
  Receipt,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, exportBackup, importBackup, resetDemoData, clearAllData, currentUser } = useApp();

  const [formData, setFormData] = useState({
    ...settings,
    sgkWorkerPercent: settings.sgkWorkerPercent ?? 14,
    unemploymentWorkerPercent: settings.unemploymentWorkerPercent ?? 1,
    incomeTaxPercent: settings.incomeTaxPercent ?? 15,
    stampTaxPercent: settings.stampTaxPercent ?? 0.759,
    enableAutomaticTaxes: settings.enableAutomaticTaxes ?? true,
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  const [passData, setPassData] = useState({
    username: currentUser?.username || 'admin',
    newUsername: currentUser?.username || 'admin',
    oldPassword: '',
    newPassword: '',
  });
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passData.newPassword) {
      setPassMsg({ type: 'error', text: 'Lütfen yeni şifrenizi girin.' });
      return;
    }
    const res = await changePasswordApi(passData);
    if (res.success) {
      setPassMsg({ type: 'success', text: 'Giriş bilgileriniz başarıyla güncellendi.' });
      setPassData({ ...passData, oldPassword: '', newPassword: '' });
    } else {
      setPassMsg({ type: 'error', text: res.message || 'Mevcut şifre hatalı.' });
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          importBackup(content);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            Sistem ve Şirket Parametre Ayarları
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            SGK/Vergi oranları, mesai katsayıları, şifre ve sistem yedekleme yönetimi.
          </p>
        </div>
      </div>

      {/* Admin Password Change Card */}
      <div className="bg-slate-900 border border-amber-500/30 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <KeyRound className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            1. Yönetici Giriş Adı & Şifre Değiştirme
          </h3>
        </div>

        {passMsg && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold ${
              passMsg.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}
          >
            {passMsg.text}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Kullanıcı Adı</label>
            <input
              type="text"
              value={passData.newUsername}
              onChange={(e) => setPassData({ ...passData, newUsername: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Mevcut Şifre</label>
            <input
              type="password"
              placeholder="Eski Şifreniz"
              value={passData.oldPassword}
              onChange={(e) => setPassData({ ...passData, oldPassword: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Yeni Şifre</label>
            <input
              type="password"
              placeholder="Yeni Şifreniz"
              value={passData.newPassword}
              onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition shadow-md flex items-center space-x-2"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Giriş Bilgilerini Güncelle</span>
            </button>
          </div>
        </form>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Info */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
            2. Firma Künye & İletişim Bilgileri
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Şirket Unvanı</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Alt Başlık / Slogan</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Telefon</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Vergi Dairesi & No</label>
              <input
                type="text"
                value={formData.taxNo}
                onChange={(e) => setFormData({ ...formData, taxNo: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">Adres</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* 3. SGK & YASAL KESİNTİ ORANLARI (USER REQUEST) */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Receipt className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                3. SGK, Gelir Vergisi & Yasal Kesinti Oranları
              </h3>
            </div>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableAutomaticTaxes}
                onChange={(e) => setFormData({ ...formData, enableAutomaticTaxes: e.target.checked })}
                className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500 w-4 h-4"
              />
              <span className="text-xs font-semibold text-slate-300">Maaş Pusulasında Otomatik Hesapla</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                SGK İşçi Payı Kesintisi (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.sgkWorkerPercent}
                  onChange={(e) => setFormData({ ...formData, sgkWorkerPercent: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-8 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                />
                <Percent className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Standart Oran: %14.00</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                İşsizlik Sigortası Payı (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.unemploymentWorkerPercent}
                  onChange={(e) => setFormData({ ...formData, unemploymentWorkerPercent: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-8 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                />
                <Percent className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Standart Oran: %1.00</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Gelir Vergisi Dilimi (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.incomeTaxPercent}
                  onChange={(e) => setFormData({ ...formData, incomeTaxPercent: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-8 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                />
                <Percent className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Standart Oran: %15.00</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Damga Vergisi (Binde) (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  max="10"
                  value={formData.stampTaxPercent}
                  onChange={(e) => setFormData({ ...formData, stampTaxPercent: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-8 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                />
                <Percent className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Standart Oran: %0.759</span>
            </div>
          </div>
        </div>

        {/* 4. Mesai Katsayıları & Yardım Parametreleri */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
            4. Mesai Katsayıları & Standart Yemek / Yol Yardımı
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Hafta İçi Mesai Katsayısı (x)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.defaultOvertimeMultiplier}
                onChange={(e) =>
                  setFormData({ ...formData, defaultOvertimeMultiplier: parseFloat(e.target.value) || 1.5 })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Pazar Mesai Katsayısı (x)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.sundayOvertimeMultiplier}
                onChange={(e) =>
                  setFormData({ ...formData, sundayOvertimeMultiplier: parseFloat(e.target.value) || 2.0 })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Resmi Tatil Katsayısı (x)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.holidayOvertimeMultiplier}
                onChange={(e) =>
                  setFormData({ ...formData, holidayOvertimeMultiplier: parseFloat(e.target.value) || 2.5 })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Standart Günlük Yemek Yardımı (₺)
              </label>
              <input
                type="number"
                value={formData.defaultMealAllowance}
                onChange={(e) =>
                  setFormData({ ...formData, defaultMealAllowance: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Standart Günlük Yol Yardımı (₺)
              </label>
              <input
                type="number"
                value={formData.defaultTransportAllowance}
                onChange={(e) =>
                  setFormData({ ...formData, defaultTransportAllowance: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Haftalık Yasal Mesai Sınırı (Saat)
              </label>
              <input
                type="number"
                value={formData.maxWeeklyOvertimeHoursLimit}
                onChange={(e) =>
                  setFormData({ ...formData, maxWeeklyOvertimeHoursLimit: parseInt(e.target.value) || 45 })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Save Button Bar */}
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
          {saveSuccess ? (
            <span className="text-emerald-400 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Ayarlar veritabanına başarıyla kaydedildi!
            </span>
          ) : (
            <span className="text-slate-400 text-xs">
              Değişiklikleri veritabanına uygulamak için kaydedin.
            </span>
          )}

          <button
            type="submit"
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-lg flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Ayarları Kaydet</span>
          </button>
        </div>
      </form>

      {/* Backup & System Maintenance Card */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
          5. Veri Yedekleme & Sistem Bakımı
        </h3>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={exportBackup}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition border border-slate-700"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>JSON Yedeği İndir</span>
          </button>

          <label className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition border border-slate-700 cursor-pointer">
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Yedek Dosyası Yükle</span>
            <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
          </label>

          <button
            onClick={resetDemoData}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2.5 rounded-xl text-xs transition border border-slate-700"
          >
            <RefreshCw className="w-4 h-4 text-blue-400" />
            <span>Fabrika Demo Verilerini Yükle</span>
          </button>

          <button
            onClick={clearAllData}
            className="flex items-center space-x-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/60 font-semibold px-4 py-2.5 rounded-xl text-xs transition ml-auto"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Tüm Verileri Temizle (Sıfırla)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
