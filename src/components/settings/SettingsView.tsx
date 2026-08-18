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
  ShieldAlert,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, exportBackup, importBackup, resetDemoData, clearAllData, currentUser } = useApp();

  const [formData, setFormData] = useState({ ...settings });
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
    const res = await changePasswordApi({
      username: passData.username,
      newUsername: passData.newUsername,
      oldPassword: passData.oldPassword,
      newPassword: passData.newPassword,
    });
    if (res.success) {
      setPassMsg({ type: 'success', text: 'Giriş bilgileriniz başarıyla güncellendi!' });
      setPassData({ ...passData, oldPassword: '', newPassword: '' });
      setTimeout(() => setPassMsg(null), 4000);
    } else {
      setPassMsg({ type: 'error', text: res.error || 'Şifre değiştirilemedi!' });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        importBackup(json);
      } catch (err) {
        alert('Geçersiz JSON yedek dosyası!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <Settings className="w-8 h-8 text-amber-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Sistem & Şirket Ayarları</h2>
          <p className="text-xs text-slate-400">
            Firma bilgileri, güvenlik şifresi, fazla mesai katsayıları ve yedekleme yönetimi
          </p>
        </div>
      </div>

      {/* Password & Security Card */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>1. Yönetici Giriş Adı & Şifre Değiştirme</span>
          </h3>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
            Aktif Kullanıcı: {currentUser?.username || 'admin'}
          </span>
        </div>

        {passMsg && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
              passMsg.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            }`}
          >
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{passMsg.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Yeni Kullanıcı Adı</label>
            <input
              type="text"
              required
              value={passData.newUsername}
              onChange={(e) => setPassData({ ...passData, newUsername: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Mevcut Şifre</label>
            <input
              type="password"
              placeholder="Varsayılan: admin"
              value={passData.oldPassword}
              onChange={(e) => setPassData({ ...passData, oldPassword: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Yeni Şifre</label>
            <input
              type="password"
              required
              placeholder="Yeni şifreniz"
              value={passData.newPassword}
              onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-3 flex justify-end">
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

        {/* Calculation Rates */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
            3. Mesai Katsayıları & Standart Haklar
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Hafta İçi Mesai Katsayısı</label>
              <input
                type="number"
                step="0.1"
                value={formData.defaultOvertimeMultiplier}
                onChange={(e) =>
                  setFormData({ ...formData, defaultOvertimeMultiplier: parseFloat(e.target.value) || 1.5 })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Pazar Mesai Katsayısı</label>
              <input
                type="number"
                step="0.1"
                value={formData.sundayOvertimeMultiplier}
                onChange={(e) =>
                  setFormData({ ...formData, sundayOvertimeMultiplier: parseFloat(e.target.value) || 2.0 })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Resmi Tatil Katsayısı</label>
              <input
                type="number"
                step="0.1"
                value={formData.holidayOvertimeMultiplier}
                onChange={(e) =>
                  setFormData({ ...formData, holidayOvertimeMultiplier: parseFloat(e.target.value) || 2.5 })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Günlük Yemek Bedeli (TL)</label>
              <input
                type="number"
                value={formData.defaultMealAllowance}
                onChange={(e) =>
                  setFormData({ ...formData, defaultMealAllowance: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Günlük Yol Bedeli (TL)</label>
              <input
                type="number"
                value={formData.defaultTransportAllowance}
                onChange={(e) =>
                  setFormData({ ...formData, defaultTransportAllowance: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Günlük Çalışma Saati</label>
              <input
                type="number"
                value={formData.workingHoursPerDay}
                onChange={(e) =>
                  setFormData({ ...formData, workingHoursPerDay: parseInt(e.target.value) || 8 })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end space-x-3">
          {saveSuccess && (
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Ayarlar kaydedildi!</span>
            </div>
          )}
          <button
            type="submit"
            className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-6 py-3 rounded-xl transition shadow-lg"
          >
            <Save className="w-4 h-4" />
            <span>Ayarları Kaydet</span>
          </button>
        </div>
      </form>

      {/* Backup & Restore */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
          4. Veritabanı, Sıfırlama & Yedekleme İşlemleri
        </h3>
        <p className="text-xs text-slate-400">
          Tüm verileriniz MySQL veritabanınızda ve tarayıcı yerel hafızasında saklanır.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <button
            onClick={exportBackup}
            className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold p-4 rounded-xl text-xs border border-slate-700 transition"
          >
            <Download className="w-5 h-5 text-amber-400" />
            <span>JSON Yedeği İndir</span>
          </button>

          <label className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold p-4 rounded-xl text-xs border border-slate-700 transition cursor-pointer">
            <Upload className="w-5 h-5 text-emerald-400" />
            <span>JSON Yedek Yükle</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={() => {
              if (confirm('Fabrika demo verilerine dönülecek. Onaylıyor musunuz?')) {
                resetDemoData();
                alert('Demo verileri sıfırlandı.');
              }
            }}
            className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold p-4 rounded-xl text-xs border border-slate-700 transition"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Demo Verileri Yükle</span>
          </button>

          <button
            onClick={() => {
              if (confirm('DİKKAT: Veritabanındaki tüm personel, puantaj ve kayıtlar kalıcı olarak silinecek ve veritabanı sıfırlanacaktır! Onaylıyor musunuz?')) {
                clearAllData();
                alert('Tüm veriler veritabanından temizlendi.');
              }
            }}
            className="flex items-center justify-center space-x-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold p-4 rounded-xl text-xs border border-rose-500/20 transition"
          >
            <Trash2 className="w-5 h-5" />
            <span>Tüm Verileri Temizle</span>
          </button>
        </div>
      </div>
    </div>
  );
};
