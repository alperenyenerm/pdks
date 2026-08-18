import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  Worker,
  AttendanceRecord,
  AdvancePayment,
  Project,
  CompanySettings,
  MachineryUnit,
  BranchLocation,
  OfficialHoliday,
  AuditLog,
  DisciplinaryRecord,
  MonthlyWorkerSummary,
  NotificationToast,
} from '../types';
import { loadStoredData, saveStoredData, exportBackupJSON } from '../utils/storage';
import { calculateWorkerMonthlySummary } from '../utils/calculations';
import {
  INITIAL_WORKERS,
  INITIAL_PROJECTS,
  INITIAL_COMPANY_SETTINGS,
  INITIAL_ADVANCE_PAYMENTS,
  INITIAL_MACHINERY,
  INITIAL_BRANCHES,
  INITIAL_HOLIDAYS,
  INITIAL_AUDIT_LOGS,
  INITIAL_DISCIPLINARY,
  generateInitialAttendance,
} from '../utils/initialData';
import {
  fetchAllDataFromApi,
  saveWorkerToApi,
  deleteWorkerFromApi,
  saveAttendanceToApi,
  saveAdvanceToApi,
  deleteAdvanceFromApi,
  saveProjectToApi,
  deleteProjectFromApi,
  saveMachineryToApi,
  deleteMachineryFromApi,
  saveBranchToApi,
  deleteBranchFromApi,
  saveSettingsToApi,
  clearAllDataFromApi,
} from '../utils/apiClient';

interface UserSession {
  id: any;
  username: string;
  fullName: string;
  role: string;
}

interface AppContextType {
  // Auth state
  currentUser: UserSession | null;
  isAuthenticated: boolean;
  loginUser: (user: UserSession) => void;
  logoutUser: () => void;

  workers: Worker[];
  attendance: AttendanceRecord[];
  advances: AdvancePayment[];
  projects: Project[];
  machinery: MachineryUnit[];
  branches: BranchLocation[];
  holidays: OfficialHoliday[];
  disciplinary: DisciplinaryRecord[];
  auditLogs: AuditLog[];
  settings: CompanySettings;
  selectedYear: number;
  selectedMonth: number;
  activeTab: string;
  toasts: NotificationToast[];
  
  setSelectedYear: (year: number) => void;
  setSelectedMonth: (month: number) => void;
  setActiveTab: (tab: string) => void;
  notify: (title: string, message: string, type?: NotificationToast['type']) => void;
  dismissToast: (id: string) => void;
  
  // Worker actions
  addWorker: (worker: Omit<Worker, 'id'>) => void;
  updateWorker: (worker: Worker) => void;
  deleteWorker: (id: string) => void;
  
  // Attendance actions
  setAttendanceRecord: (record: Omit<AttendanceRecord, 'id'> & { id?: string }) => void;
  bulkSetAttendance: (records: (Omit<AttendanceRecord, 'id'> & { id?: string })[]) => void;
  
  // Advance actions
  addAdvance: (advance: Omit<AdvancePayment, 'id'>) => void;
  deleteAdvance: (id: string) => void;
  
  // Project actions
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  
  // Machinery actions
  addMachinery: (machine: Omit<MachineryUnit, 'id'>) => void;
  updateMachinery: (machine: MachineryUnit) => void;
  deleteMachinery: (id: string) => void;

  // Branch actions
  addBranch: (branch: Omit<BranchLocation, 'id'>) => void;
  updateBranch: (branch: BranchLocation) => void;
  deleteBranch: (id: string) => void;

  // Holiday actions
  addHoliday: (holiday: Omit<OfficialHoliday, 'id'>) => void;
  deleteHoliday: (id: string) => void;

  // Disciplinary actions
  addDisciplinary: (disc: Omit<DisciplinaryRecord, 'id'>) => void;
  
  // Settings actions
  updateSettings: (settings: CompanySettings) => void;
  
  // Utilities
  monthlySummaries: MonthlyWorkerSummary[];
  exportBackup: () => void;
  importBackup: (data: any) => boolean;
  resetDemoData: () => void;
  clearAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = loadStoredData();
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('ynr_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [workers, setWorkers] = useState<Worker[]>(initial.workers);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(initial.attendance);
  const [advances, setAdvances] = useState<AdvancePayment[]>(initial.advances);
  const [projects, setProjects] = useState<Project[]>(initial.projects);
  const [machinery, setMachinery] = useState<MachineryUnit[]>(initial.machinery);
  const [branches, setBranches] = useState<BranchLocation[]>(INITIAL_BRANCHES);
  const [holidays, setHolidays] = useState<OfficialHoliday[]>(INITIAL_HOLIDAYS);
  const [disciplinary, setDisciplinary] = useState<DisciplinaryRecord[]>(INITIAL_DISCIPLINARY);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [settings, setSettings] = useState<CompanySettings>(initial.settings);
  
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(8);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [toasts, setToasts] = useState<NotificationToast[]>([]);

  const loginUser = (user: UserSession) => {
    setCurrentUser(user);
    localStorage.setItem('ynr_session', JSON.stringify(user));
    notify('Giriş Başarılı', `Hoş geldiniz, ${user.fullName}.`, 'success');
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('ynr_session');
    notify('Oturum Kapatıldı', 'Güvenli çıkış yapıldı.', 'info');
  };

  // PHP MySQL API'sinden Verileri Yükle
  useEffect(() => {
    async function initDataFromApi() {
      const apiData = await fetchAllDataFromApi();
      if (apiData) {
        setWorkers(apiData.workers || []);
        setAttendance(apiData.attendance || []);
        setAdvances(apiData.advances || []);
        setProjects(apiData.projects || []);
        setMachinery(apiData.machinery || []);
        if (apiData.branches && apiData.branches.length > 0) setBranches(apiData.branches);
        if (apiData.holidays && apiData.holidays.length > 0) setHolidays(apiData.holidays);
        if (apiData.settings) setSettings((prev) => ({ ...prev, ...apiData.settings }));
        if (apiData.disciplinary) setDisciplinary(apiData.disciplinary);
        if (apiData.auditLogs) setAuditLogs(apiData.auditLogs);
      }
    }
    initDataFromApi();
  }, []);

  useEffect(() => {
    saveStoredData({ workers, attendance, advances, projects, settings, machinery });
  }, [workers, attendance, advances, projects, settings, machinery]);

  const logAction = (action: string, category: AuditLog['category'], details: string) => {
    const timestamp = new Date().toLocaleString('tr-TR');
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp,
      user: currentUser ? currentUser.fullName : 'YNR Sistem Yöneticisi',
      action,
      category,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const notify = (title: string, message: string, type: NotificationToast['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: NotificationToast = { id, title, message, type, timestamp: Date.now() };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const monthlySummaries: MonthlyWorkerSummary[] = workers
    .filter((w) => w.status === 'active')
    .map((worker) =>
      calculateWorkerMonthlySummary(worker, selectedYear, selectedMonth, attendance, advances, settings)
    );

  const addWorker = (newWorker: Omit<Worker, 'id'>) => {
    const id = `w-${Date.now()}`;
    const created = { ...newWorker, id };
    setWorkers((prev) => [...prev, created]);
    saveWorkerToApi(created);
    notify('Personel Eklendi', `${created.firstName} ${created.lastName} kadroya eklendi.`, 'success');
    logAction('PERSONEL_EKLE', 'PERSONEL', `${created.firstName} ${created.lastName} kadroya eklendi.`);
  };

  const updateWorker = (updated: Worker) => {
    setWorkers((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
    saveWorkerToApi(updated);
    notify('Personel Güncellendi', `${updated.firstName} ${updated.lastName} bilgileri güncellendi.`, 'info');
    logAction('PERSONEL_GUNCELLE', 'PERSONEL', `${updated.firstName} ${updated.lastName} bilgileri güncellendi.`);
  };

  const deleteWorker = (id: string) => {
    const worker = workers.find((w) => w.id === id);
    setWorkers((prev) => prev.filter((w) => w.id !== id));
    deleteWorkerFromApi(id);
    if (worker) {
      notify('Personel Silindi', `${worker.firstName} ${worker.lastName} sistemden çıkarıldı.`, 'warning');
      logAction('PERSONEL_SIL', 'PERSONEL', `${worker.firstName} ${worker.lastName} silindi.`);
    }
  };

  const setAttendanceRecord = (recData: Omit<AttendanceRecord, 'id'> & { id?: string }) => {
    const id = recData.id || `att-${recData.workerId}-${recData.date}`;
    const fullRecord = { ...recData, id };
    setAttendance((prev) => {
      const idx = prev.findIndex((item) => item.workerId === recData.workerId && item.date === recData.date);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = fullRecord;
        return updated;
      }
      return [...prev, fullRecord];
    });
    saveAttendanceToApi(fullRecord);
    logAction('PUANTAJ_GIRIS', 'PUANTAJ', `Tarih: ${recData.date}, Durum: ${recData.type}`);
  };

  const bulkSetAttendance = (recList: (Omit<AttendanceRecord, 'id'> & { id?: string })[]) => {
    const preparedList = recList.map((recData) => ({
      ...recData,
      id: recData.id || `att-${recData.workerId}-${recData.date}`,
    }));

    setAttendance((prev) => {
      let next = [...prev];
      preparedList.forEach((fullRecord) => {
        const idx = next.findIndex((item) => item.workerId === fullRecord.workerId && item.date === fullRecord.date);
        if (idx >= 0) {
          next[idx] = fullRecord;
        } else {
          next.push(fullRecord);
        }
      });
      return next;
    });
    saveAttendanceToApi(preparedList);
    notify('Toplu Puantaj Girişi', `${recList.length} personele puantaj kaydı uygulandı.`, 'success');
    logAction('TOPLU_PUANTAJ', 'PUANTAJ', `${recList.length} personele puantaj kaydı yazıldı.`);
  };

  const addAdvance = (adv: Omit<AdvancePayment, 'id'>) => {
    const id = `adv-${Date.now()}`;
    const created = { ...adv, id };
    setAdvances((prev) => [created, ...prev]);
    saveAdvanceToApi(created);
    notify('Ödeme Kaydedildi', `${adv.amount} TL tutarındaki işlem kaydedildi.`, 'success');
    logAction('AVANS_ODEME', 'AVANS', `Tutar: ${adv.amount} TL, Açıklama: ${adv.description}`);
  };

  const deleteAdvance = (id: string) => {
    setAdvances((prev) => prev.filter((a) => a.id !== id));
    deleteAdvanceFromApi(id);
    notify('İşlem Silindi', 'Ödeme kaydı kaldırıldı.', 'warning');
    logAction('AVANS_SIL', 'AVANS', 'Avans kaydı silindi.');
  };

  const addProject = (prj: Omit<Project, 'id'>) => {
    const id = `prj-${Date.now()}`;
    const created = { ...prj, id };
    setProjects((prev) => [...prev, created]);
    saveProjectToApi(created);
    notify('Proje Oluşturuldu', `${prj.name} projeler listesine eklendi.`, 'success');
  };

  const updateProject = (updated: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    saveProjectToApi(updated);
    notify('Proje Güncellendi', `${updated.name} projesi güncellendi.`, 'info');
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    deleteProjectFromApi(id);
    notify('Proje Silindi', 'Proje kaydı silindi.', 'warning');
  };

  const addMachinery = (machine: Omit<MachineryUnit, 'id'>) => {
    const id = `m-${Date.now()}`;
    const created = { ...machine, id };
    setMachinery((prev) => [...prev, created]);
    saveMachineryToApi(created);
    notify('Tezgah Eklendi', `${machine.name} parkura dahil edildi.`, 'success');
  };

  const updateMachinery = (updated: MachineryUnit) => {
    setMachinery((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    saveMachineryToApi(updated);
    notify('Tezgah Güncellendi', `${updated.name} bilgileri güncellendi.`, 'info');
  };

  const deleteMachinery = (id: string) => {
    setMachinery((prev) => prev.filter((m) => m.id !== id));
    deleteMachineryFromApi(id);
    notify('Tezgah Silindi', 'Tezgah kaydı silindi.', 'warning');
  };

  const addBranch = (branch: Omit<BranchLocation, 'id'>) => {
    const id = `br-${Date.now()}`;
    const created = { ...branch, id };
    setBranches((prev) => [...prev, created]);
    saveBranchToApi(created);
    notify('Şube Eklendi', `${branch.name} sisteme dahil edildi.`, 'success');
  };

  const updateBranch = (updated: BranchLocation) => {
    setBranches((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    saveBranchToApi(updated);
    notify('Şube Güncellendi', `${updated.name} güncellendi.`, 'info');
  };

  const deleteBranch = (id: string) => {
    setBranches((prev) => prev.filter((b) => b.id !== id));
    deleteBranchFromApi(id);
    notify('Şube Silindi', 'Şube kaydı silindi.', 'warning');
  };

  const addHoliday = (hol: Omit<OfficialHoliday, 'id'>) => {
    const id = `hol-${Date.now()}`;
    setHolidays((prev) => [...prev, { ...hol, id }]);
    notify('Tatil Eklendi', `${hol.name} takvime işlendi.`, 'success');
  };

  const deleteHoliday = (id: string) => {
    setHolidays((prev) => prev.filter((h) => h.id !== id));
    notify('Tatil Silindi', 'Tatil kaydı silindi.', 'warning');
  };

  const addDisciplinary = (disc: Omit<DisciplinaryRecord, 'id'>) => {
    const id = `disc-${Date.now()}`;
    setDisciplinary((prev) => [{ ...disc, id }, ...prev]);
    notify('Kayıt Eklendi', `${disc.title} kaydedildi.`, 'success');
  };

  const updateSettings = (newSettings: CompanySettings) => {
    setSettings(newSettings);
    saveSettingsToApi(newSettings);
    notify('Ayarlar Kaydedildi', 'Sistem ayarları güncellendi.', 'success');
    logAction('AYAR_GUNCELLE', 'AYARLAR', 'Şirket ve katsayı ayarları güncellendi.');
  };

  const exportBackup = () => {
    exportBackupJSON({ workers, attendance, advances, projects, settings, machinery, branches, holidays });
    notify('Yedek İndirildi', 'Sistem yedeği JSON olarak kaydedildi.', 'success');
    logAction('YEDEK_INDIR', 'AYARLAR', 'Yedek JSON dosyası indirildi.');
  };

  const importBackup = (data: any): boolean => {
    try {
      if (data.workers && Array.isArray(data.workers)) setWorkers(data.workers);
      if (data.attendance && Array.isArray(data.attendance)) setAttendance(data.attendance);
      if (data.advances && Array.isArray(data.advances)) setAdvances(data.advances);
      if (data.projects && Array.isArray(data.projects)) setProjects(data.projects);
      if (data.machinery && Array.isArray(data.machinery)) setMachinery(data.machinery);
      if (data.settings && typeof data.settings === 'object') setSettings(data.settings);
      notify('Yedek Yüklendi', 'Tüm sistem verileri başarıyla yüklendi.', 'success');
      logAction('YEDEK_YUKLE', 'AYARLAR', 'Yedek dosyası sisteme yüklendi.');
      return true;
    } catch (e) {
      console.error(e);
      notify('Yükleme Hatası', 'Geçersiz yedek dosyası.', 'error');
      return false;
    }
  };

  const resetDemoData = () => {
    setWorkers(INITIAL_WORKERS);
    setProjects(INITIAL_PROJECTS);
    setMachinery(INITIAL_MACHINERY);
    setBranches(INITIAL_BRANCHES);
    setHolidays(INITIAL_HOLIDAYS);
    setSettings(INITIAL_COMPANY_SETTINGS);
    setAdvances(INITIAL_ADVANCE_PAYMENTS);
    setAttendance(generateInitialAttendance(INITIAL_WORKERS));
    notify('Demo Sıfırlandı', 'Varsayılan YNR Makine verileri yüklendi.', 'info');
    logAction('DEMO_SIFIRLA', 'AYARLAR', 'Tüm veriler fabrika ayarlarına sıfırlandı.');
  };

  const clearAllData = async () => {
    setWorkers([]);
    setAttendance([]);
    setAdvances([]);
    setProjects([]);
    setMachinery([]);
    setDisciplinary([]);
    setAuditLogs([]);
    localStorage.clear();
    await clearAllDataFromApi();
    notify('Tüm Veriler Temizlendi', 'Sistemdeki tüm demo ve kayıtlı veriler sıfırlandı.', 'warning');
    logAction('TUM_VERILERI_TEMIZLE', 'AYARLAR', 'Veritabanı ve yerel hafıza sıfırlandı.');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        loginUser,
        logoutUser,
        workers,
        attendance,
        advances,
        projects,
        machinery,
        branches,
        holidays,
        disciplinary,
        auditLogs,
        settings,
        selectedYear,
        selectedMonth,
        activeTab,
        toasts,
        setSelectedYear,
        setSelectedMonth,
        setActiveTab,
        notify,
        dismissToast,
        addWorker,
        updateWorker,
        deleteWorker,
        setAttendanceRecord,
        bulkSetAttendance,
        addAdvance,
        deleteAdvance,
        addProject,
        updateProject,
        deleteProject,
        addMachinery,
        updateMachinery,
        deleteMachinery,
        addBranch,
        updateBranch,
        deleteBranch,
        addHoliday,
        deleteHoliday,
        addDisciplinary,
        updateSettings,
        monthlySummaries,
        exportBackup,
        importBackup,
        resetDemoData,
        clearAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
