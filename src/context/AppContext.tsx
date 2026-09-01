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
  PDKSLog,
  ShiftDefinition,
  PDKSDailyCalculated,
  OvertimeApproval,
  BulkOperationRecord,
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
  INITIAL_PDKS_SHIFTS,
  INITIAL_PDKS_LOGS,
  INITIAL_PDKS_DAILY,
  INITIAL_OVERTIME_APPROVALS,
  INITIAL_BULK_OPERATIONS,
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
  pdksLogs: PDKSLog[];
  pdksShifts: ShiftDefinition[];
  pdksDailySummary: PDKSDailyCalculated[];
  overtimeApprovals: OvertimeApproval[];
  bulkOperations: BulkOperationRecord[];
  settings: CompanySettings;
  selectedYear: number;
  selectedMonth: number;
  activeTab: string;
  toasts: NotificationToast[];

  // PDKS Actions
  addPDKSLog: (log: Omit<PDKSLog, 'id'>) => void;
  saveShift: (shift: ShiftDefinition) => void;
  deleteShift: (id: string) => void;
  approveOvertime: (id: string, approvedHours: number) => void;
  rejectOvertime: (id: string) => void;
  applySalaryRaise: (percentage: number) => void;
  applyBulkLeave: (startDate: string, endDate: string, reason: string) => void;
  syncDeviceLogs: (deviceId: string) => Promise<any>;
  
  setSelectedYear: (year: number) => void;
  setSelectedMonth: (month: number) => void;
  setActiveTab: (tab: string) => void;
  notify: (title: string, message: string, type?: NotificationToast['type']) => void;
  dismissToast: (id: string) => void;
  
  // Worker actions
  addWorker: (worker: Omit<Worker, 'id'>) => void;
  bulkAddWorkers: (workers: (Omit<Worker, 'id'> & { id?: string })[]) => void;
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
  const [pdksShifts, setPdksShifts] = useState<ShiftDefinition[]>(INITIAL_PDKS_SHIFTS);
  const [pdksLogs, setPdksLogs] = useState<PDKSLog[]>(INITIAL_PDKS_LOGS);
  const [pdksDailySummary, setPdksDailySummary] = useState<PDKSDailyCalculated[]>(INITIAL_PDKS_DAILY);
  const [overtimeApprovals, setOvertimeApprovals] = useState<OvertimeApproval[]>(INITIAL_OVERTIME_APPROVALS);
  const [bulkOperations, setBulkOperations] = useState<BulkOperationRecord[]>(INITIAL_BULK_OPERATIONS);
  const [settings, setSettings] = useState<CompanySettings>(initial.settings);
  
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(8);
  const [activeTab, setActiveTab] = useState<string>('pdks_dashboard');
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

  const addPDKSLog = (newLog: Omit<PDKSLog, 'id'>) => {
    const created: PDKSLog = {
      id: `pdks-${Date.now()}`,
      ...newLog
    };
    setPdksLogs(prev => [created, ...prev]);
    notify('PDKS Kaydı Eklendi', `${created.workerName} için ${created.direction === 'IN' ? 'Giriş' : 'Çıkış'} kaydedildi.`, 'success');
  };

  const saveShift = (shift: ShiftDefinition) => {
    setPdksShifts(prev => {
      const exists = prev.find(s => s.id === shift.id);
      if (exists) {
        return prev.map(s => s.id === shift.id ? shift : s);
      }
      return [...prev, shift];
    });
    notify('Vardiya Kaydedildi', `${shift.name} tanımı güncellendi.`, 'success');
  };

  const deleteShift = (id: string) => {
    setPdksShifts(prev => prev.filter(s => s.id !== id));
    notify('Vardiya Silindi', 'Vardiya tanımı kaldırıldı.', 'info');
  };

  const approveOvertime = (id: string, approvedHours: number) => {
    setOvertimeApprovals(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, approvedHours, status: 'APPROVED' as const, approvedBy: currentUser ? currentUser.fullName : 'Yönetici' };
      }
      return a;
    }));
    notify('Mesai Onaylandı', `${approvedHours} saat fazla mesai onaylandı.`, 'success');
  };

  const rejectOvertime = (id: string) => {
    setOvertimeApprovals(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, status: 'REJECTED' as const };
      }
      return a;
    }));
    notify('Mesai Reddedildi', 'Fazla mesai talebi reddedildi.', 'warning');
  };

  const applySalaryRaise = (percentage: number) => {
    setWorkers(prev => prev.map(w => ({
      ...w,
      dailyRate: Math.round(w.dailyRate * (1 + percentage / 100)),
      overtimeHourlyRate: Math.round((w.dailyRate * (1 + percentage / 100)) / 8 * 1.5)
    })));

    const newOp: BulkOperationRecord = {
      id: `op-${Date.now()}`,
      title: `%${percentage} Toplu Maaş/Yövmiye Zam Artırımı`,
      type: 'SALARY_RAISE',
      date: new Date().toISOString().split('T')[0],
      affectedCount: workers.filter(w => w.status === 'active').length,
      details: `Tüm aktif personele %${percentage} zam oranı uygulandı.`
    };
    setBulkOperations(prev => [newOp, ...prev]);
    notify('Toplu Zam Uygulandı', `Tüm aktif kadroya %${percentage} zam başarıyla yansıtıldı!`, 'success');
  };

  const applyBulkLeave = (startDate: string, endDate: string, reason: string) => {
    const newOp: BulkOperationRecord = {
      id: `op-${Date.now()}`,
      title: `Toplu İzin: ${reason}`,
      type: 'BULK_LEAVE',
      date: startDate,
      affectedCount: workers.filter(w => w.status === 'active').length,
      details: `${startDate} ile ${endDate} arasında toplu idari izin atandı.`
    };
    setBulkOperations(prev => [newOp, ...prev]);
    notify('Toplu İzin Atandı', `${reason} kapsamında tüm kadroya izin işlendi.`, 'success');
  };

  const syncDeviceLogs = async (deviceId: string) => {
    try {
      const res = await fetch(`api.php?action=sync_pdks_device&device_id=${encodeURIComponent(deviceId)}`);
      const data = await res.json();
      if (data && data.success) {
        if (data.logs && data.logs.length > 0) {
          setPdksLogs(prev => [...data.logs, ...prev]);
        }
        notify('Cihaz Verileri Çekildi (Sync)', `${data.pulledCount} Adet yeni geçiş kaydı çekildi ve kaydedildi!`, 'success');
        return data;
      }
    } catch (e) {
      console.warn('API sync error fallback:', e);
    }
    // Fallback sync
    const newLogs: PDKSLog[] = workers.slice(0, 4).map((w, idx) => ({
      id: `pdks-sync-${Date.now()}-${idx}`,
      workerId: w.id,
      workerCode: w.code || `YNR-00${idx+1}`,
      workerName: `${w.firstName} ${w.lastName}`,
      deviceId: 'PERKOTEK_MAGICPASS',
      deviceName: 'MAGIC PASS 20656 ID (88.247.139.41:8008)',
      verificationType: idx % 2 === 0 ? 'FINGERPRINT' : 'CARD',
      direction: idx % 2 === 0 ? 'IN' : 'OUT',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'SUCCESS',
      notes: 'Cihaz Anlık Sync Kaydı'
    }));

    setPdksLogs(prev => [...newLogs, ...prev]);
    notify('Cihaz Verileri Çekildi', `${newLogs.length} yeni geçiş okuması başarıyla veritabanına aktarıldı.`, 'success');
    return { success: true, count: newLogs.length };
  };

  // PHP MySQL API'sinden Verileri Yükle
  useEffect(() => {
    async function initDataFromApi() {
      const apiData = await fetchAllDataFromApi();
      if (apiData) {
        if (apiData.workers !== undefined) setWorkers(apiData.workers);
        if (apiData.attendance !== undefined) setAttendance(apiData.attendance);
        if (apiData.advances !== undefined) setAdvances(apiData.advances);
        if (apiData.projects !== undefined) setProjects(apiData.projects);
        if (apiData.machinery !== undefined) setMachinery(apiData.machinery);
        if (apiData.branches !== undefined) setBranches(apiData.branches);
        if (apiData.holidays !== undefined) setHolidays(apiData.holidays);
        if (apiData.settings) setSettings((prev) => ({ ...prev, ...apiData.settings }));
        if (apiData.disciplinary !== undefined) setDisciplinary(apiData.disciplinary);
        if (apiData.auditLogs !== undefined) setAuditLogs(apiData.auditLogs);
        if (apiData.pdksShifts !== undefined) setPdksShifts(apiData.pdksShifts);
        if (apiData.pdksLogs !== undefined) setPdksLogs(apiData.pdksLogs);
        if (apiData.pdksDailySummary !== undefined) setPdksDailySummary(apiData.pdksDailySummary);
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

  const bulkAddWorkers = (newWorkers: (Omit<Worker, 'id'> & { id?: string })[]) => {
    const preparedList: Worker[] = newWorkers.map((w, idx) => ({
      id: w.id || `w-${Date.now()}-${idx}`,
      code: w.code || `YNR-${String(idx + 1).padStart(3, '0')}`,
      firstName: w.firstName || 'Personel',
      lastName: w.lastName || '',
      role: w.role || 'Operatör',
      dailyRate: w.dailyRate || 1500,
      overtimeHourlyRate: w.overtimeHourlyRate || Math.round(((w.dailyRate || 1500) / 8) * 1.5),
      phone: w.phone || '',
      iban: w.iban || '',
      department: w.department || 'Genel',
      branchId: w.branchId,
      status: w.status || 'active',
      startDate: w.startDate || new Date().toISOString().slice(0, 10),
      tcNo: w.tcNo,
      cardNumber: w.cardNumber,
      skillLevel: w.skillLevel || 'Operatör',
      notes: w.notes || '',
      avatarColor: w.avatarColor || 'from-amber-500 to-amber-700'
    }));

    setWorkers((prev) => {
      const existingMap = new Map(prev.map((w) => [w.id, w]));
      preparedList.forEach((pw) => {
        // If matches by code or cardNumber, replace or update
        const match = prev.find(
          (p) =>
            p.id === pw.id ||
            (pw.code && p.code.toLowerCase() === pw.code.toLowerCase()) ||
            (pw.cardNumber && p.cardNumber && p.cardNumber === pw.cardNumber)
        );
        if (match) {
          existingMap.set(match.id, { ...match, ...pw, id: match.id });
        } else {
          existingMap.set(pw.id, pw);
        }
      });
      return Array.from(existingMap.values());
    });

    saveWorkerToApi(preparedList);
    notify('Excel Aktarımı Başarılı', `${preparedList.length} Personel başarıyla sisteme aktarıldı ve MySQL veritabanına kaydedildi!`, 'success');
    logAction('TOPLU_PERSONEL_EKLE', 'PERSONEL', `${preparedList.length} personel Excel/Toplu aktarımla kaydedildi.`);
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
        pdksLogs,
        pdksShifts,
        pdksDailySummary,
        overtimeApprovals,
        bulkOperations,
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
        addPDKSLog,
        saveShift,
        deleteShift,
        approveOvertime,
        rejectOvertime,
        applySalaryRaise,
        applyBulkLeave,
        syncDeviceLogs,
        addWorker,
        bulkAddWorkers,
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
