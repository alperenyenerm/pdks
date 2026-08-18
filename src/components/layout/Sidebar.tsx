import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  CreditCard,
  Briefcase,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
  Zap,
  Cpu,
  Calendar,
  Building2,
  Award,
  History,
  HardHat,
} from 'lucide-react';

interface NavSection {
  title: string;
  items: {
    id: string;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
  }[];
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, workers, projects, machinery, branches } = useApp();

  const navSections: NavSection[] = [
    {
      title: 'Operasyon & Puantaj',
      items: [
        {
          id: 'dashboard',
          label: 'Kontrol Paneli',
          icon: <LayoutDashboard className="w-4 h-4" />,
        },
        {
          id: 'terminal',
          label: 'Hızlı Giriş Terminali',
          icon: <Zap className="w-4 h-4 text-amber-400" />,
          badge: 'DOKUNMATİK',
        },
        {
          id: 'attendance',
          label: 'Puantaj Cetveli',
          icon: <CalendarDays className="w-4 h-4" />,
          badge: 'CANLI',
        },
        {
          id: 'holidays',
          label: 'Resmi Tatil & Bayramlar',
          icon: <Calendar className="w-4 h-4 text-emerald-400" />,
          badge: '2.5x',
        },
      ],
    },
    {
      title: 'Kadro & Finans',
      items: [
        {
          id: 'workers',
          label: 'Personel Yönetimi',
          icon: <Users className="w-4 h-4" />,
          badge: workers.filter((w) => w.status === 'active').length,
        },
        {
          id: 'advances',
          label: 'Avans & Kesintiler',
          icon: <CreditCard className="w-4 h-4" />,
        },
        {
          id: 'performance',
          label: 'Performans & Disiplin',
          icon: <Award className="w-4 h-4 text-amber-400" />,
        },
        {
          id: 'isg',
          label: 'İSG Zimmet & Sertifika',
          icon: <HardHat className="w-4 h-4 text-emerald-400" />,
          badge: 'KKD',
        },
      ],
    },
    {
      title: 'Üretim & Şantiye',
      items: [
        {
          id: 'projects',
          label: 'Proje & Şantiye',
          icon: <Briefcase className="w-4 h-4" />,
          badge: projects.filter((p) => p.status === 'ACTIVE').length,
        },
        {
          id: 'machinery',
          label: 'Tezgah Parkuru',
          icon: <Cpu className="w-4 h-4" />,
          badge: machinery.length,
        },
        {
          id: 'branches',
          label: 'Şube & Şantiyeler',
          icon: <Building2 className="w-4 h-4" />,
          badge: branches.length,
        },
      ],
    },
    {
      title: 'Rapor & Sistem',
      items: [
        {
          id: 'reports',
          label: 'Raporlar & Çıktı',
          icon: <FileSpreadsheet className="w-4 h-4" />,
        },
        {
          id: 'audit',
          label: 'Denetim İzi (Audit Log)',
          icon: <History className="w-4 h-4 text-blue-400" />,
        },
        {
          id: 'settings',
          label: 'Sistem Ayarları',
          icon: <Settings className="w-4 h-4" />,
        },
      ],
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 print:hidden">
      <div className="p-4 space-y-4 overflow-y-auto">
        {navSections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            <p className="px-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase font-mono">
              {sec.title}
            </p>
            <nav className="space-y-0.5">
              {sec.items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium text-xs transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-400 border border-amber-500/30 shadow-md'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className={isActive ? 'text-amber-400' : 'text-slate-400'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                          isActive
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer info box */}
      <div className="mt-auto p-4 border-t border-slate-800/80">
        <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <p className="font-semibold text-slate-200">YNR MAKİNE v3.0</p>
            <p className="text-[10px] text-slate-400">Dünyanın En Kapsamlı Sistemi</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
