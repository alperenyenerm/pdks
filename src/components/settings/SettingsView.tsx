import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Download,
  Upload,
  RefreshCw,
  Save,
  CheckCircle2,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, exportBackup, importBackup, resetDemoData } = useApp();

  const [formData, setFormData] = useState({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        const ok = importBackup(json);
        if (ok) {
          alert('Yedek başarıyla yüklendi!');
        } else {
          alert('Yedek dosyası formatı geçersiz.');
        }
      } catch (err) {
        alert('Dosya okuma hatası: Geçerli bir JSON dosyası seçiniz.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            Sistem & Şirket Ayarları
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Firma resmi bilgilerini güncelleyin, veri yedeğinizi indirin veya geri yükleyin.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <form onSubmit={handleSave} className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
            Şirket Kurumsal Bilgileri
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Firma / Şirket Unvanı
              </label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Faaliyet Alanı / Slogan
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Telefon Numarası
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Vergi Dairesi / No
              </label>
              <input
                type="text"
                value={formData.taxNo}
                onChange={(e) => setFormData({ ...formData, taxNo: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Şirket Adresi
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-amber-400 uppercase tracking-wider block mb-1">
                Gece Vardiyası Primi (% Ekstra Yövmiye)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.nightShiftMultiplierPercent || 20}
                onChange={(e) => setFormData({ ...formData, nightShiftMultiplierPercent: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-amber-500/30 rounded-xl px-3 py-2 text-sm text-amber-400 font-bold font-mono focus:border-amber-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Gece vardiyasında (22:00 - 06:00) çalışan personele verilecek ekstra yövmiye yüzdesi (Varsayılan %20).
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {saveSuccess ? (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Ayarlar Başarıyla Kaydedildi
              </span>
            ) : (
              <span></span>
            )}
            <button
              type="submit"
              className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-lg shadow-amber-500/20"
            >
              <Save className="w-4 h-4" />
              <span>Ayarları Kaydet</span>
            </button>
          </div>
        </form>

        {/* Data Backup & Restore Section */}
        <div className="pt-6 border-t border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Veri Yedekleme & Geri Yükleme
          </h3>
          <p className="text-xs text-slate-400">
            Uygulama verileri tarayıcınızda saklanır. Bilgisayar değişimi veya güvenlik için yedeğinizi indirin.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <button
              onClick={exportBackup}
              className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold p-4 rounded-xl text-xs border border-slate-700 transition"
            >
              <Download className="w-5 h-5 text-amber-400" />
              <span>JSON Veri Yedeği İndir</span>
            </button>

            <label className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold p-4 rounded-xl text-xs border border-slate-700 transition cursor-pointer">
              <Upload className="w-5 h-5 text-emerald-400" />
              <span>JSON Yedek Yükle</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={() => {
                if (confirm('Tüm veriler sıfırlanıp fabrika demo verilerine dönülecek. Onaylıyor musunuz?')) {
                  resetDemoData();
                  alert('Demo verileri sıfırlandı.');
                }
              }}
              className="flex items-center justify-center space-x-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold p-4 rounded-xl text-xs border border-rose-500/20 transition"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Demo Verileri Sıfırla</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
