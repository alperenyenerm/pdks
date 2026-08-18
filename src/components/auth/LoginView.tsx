import React, { useState } from 'react';
import { ShieldCheck, Lock, User, KeyRound, AlertCircle, Sparkles } from 'lucide-react';
import { loginToApi } from '../../utils/apiClient';

interface LoginViewProps {
  onLoginSuccess: (user: { id: any; username: string; fullName: string; role: string }) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Lütfen kullanıcı adı ve şifrenizi girin.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await loginToApi({ username, password });
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || 'Kullanıcı adı veya şifre hatalı!');
      }
    } catch (err: any) {
      setError('Giriş yapılırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 backdrop-blur-xl p-8 rounded-3xl shadow-2xl space-y-6 relative z-10">
        {/* Header / Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-amber-500 to-amber-700 rounded-2xl shadow-lg shadow-amber-500/20 mb-2">
            <ShieldCheck className="w-10 h-10 text-slate-950" />
          </div>

          <div className="flex items-center justify-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>GÜVENLİ YÖNETİCİ GİRİŞİ</span>
          </div>

          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            YNR MAKİNE PDKS & PUANTAJ
          </h1>
          <p className="text-xs text-slate-400">
            Sisteme erişmek için kullanıcı bilgilerinizi giriniz.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 p-3.5 rounded-xl flex items-center space-x-3 text-rose-400 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Kullanıcı Adı
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Örn: admin"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Şifre
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-3.5 px-4 rounded-xl transition shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="text-xs font-semibold">Giriş Yapılıyor...</span>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Sisteme Giriş Yap</span>
              </>
            )}
          </button>
        </form>

        {/* Default Admin Hint */}
        <div className="pt-2 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-500">
            Varsayılan Giriş Bilgileri: <span className="font-mono text-amber-400 font-bold">admin</span> / <span className="font-mono text-amber-400 font-bold">admin</span>
          </p>
        </div>
      </div>
    </div>
  );
};
