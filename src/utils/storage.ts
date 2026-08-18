import type { Worker, AttendanceRecord, AdvancePayment, Project, CompanySettings, MachineryUnit } from '../types';
import {
  INITIAL_WORKERS,
  INITIAL_PROJECTS,
  INITIAL_COMPANY_SETTINGS,
  INITIAL_ADVANCE_PAYMENTS,
  INITIAL_MACHINERY,
  generateInitialAttendance,
} from './initialData';

const KEYS = {
  WORKERS: 'ynr_puantaj_workers',
  ATTENDANCE: 'ynr_puantaj_attendance',
  ADVANCES: 'ynr_puantaj_advances',
  PROJECTS: 'ynr_puantaj_projects',
  SETTINGS: 'ynr_puantaj_settings',
  MACHINERY: 'ynr_puantaj_machinery',
};

export const loadStoredData = () => {
  try {
    const rawWorkers = localStorage.getItem(KEYS.WORKERS);
    const rawAttendance = localStorage.getItem(KEYS.ATTENDANCE);
    const rawAdvances = localStorage.getItem(KEYS.ADVANCES);
    const rawProjects = localStorage.getItem(KEYS.PROJECTS);
    const rawSettings = localStorage.getItem(KEYS.SETTINGS);
    const rawMachinery = localStorage.getItem(KEYS.MACHINERY);

    const workers: Worker[] = rawWorkers ? JSON.parse(rawWorkers) : INITIAL_WORKERS;
    const projects: Project[] = rawProjects ? JSON.parse(rawProjects) : INITIAL_PROJECTS;
    const settings: CompanySettings = rawSettings ? JSON.parse(rawSettings) : INITIAL_COMPANY_SETTINGS;
    const advances: AdvancePayment[] = rawAdvances ? JSON.parse(rawAdvances) : INITIAL_ADVANCE_PAYMENTS;
    const machinery: MachineryUnit[] = rawMachinery ? JSON.parse(rawMachinery) : INITIAL_MACHINERY;
    const attendance: AttendanceRecord[] = rawAttendance
      ? JSON.parse(rawAttendance)
      : generateInitialAttendance(workers);

    return { workers, projects, settings, advances, attendance, machinery };
  } catch (err) {
    console.error('Failed loading stored data:', err);
    return {
      workers: INITIAL_WORKERS,
      projects: INITIAL_PROJECTS,
      settings: INITIAL_COMPANY_SETTINGS,
      advances: INITIAL_ADVANCE_PAYMENTS,
      machinery: INITIAL_MACHINERY,
      attendance: generateInitialAttendance(INITIAL_WORKERS),
    };
  }
};

export const saveStoredData = (data: {
  workers?: Worker[];
  attendance?: AttendanceRecord[];
  advances?: AdvancePayment[];
  projects?: Project[];
  settings?: CompanySettings;
  machinery?: MachineryUnit[];
}) => {
  try {
    if (data.workers) localStorage.setItem(KEYS.WORKERS, JSON.stringify(data.workers));
    if (data.attendance) localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(data.attendance));
    if (data.advances) localStorage.setItem(KEYS.ADVANCES, JSON.stringify(data.advances));
    if (data.projects) localStorage.setItem(KEYS.PROJECTS, JSON.stringify(data.projects));
    if (data.settings) localStorage.setItem(KEYS.SETTINGS, JSON.stringify(data.settings));
    if (data.machinery) localStorage.setItem(KEYS.MACHINERY, JSON.stringify(data.machinery));
  } catch (err) {
    console.error('Failed saving data to localStorage:', err);
  }
};

export const exportBackupJSON = (data: any) => {
  const dataStr = JSON.stringify(data, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `YNR_Makine_Puantaj_Yedek_${dateStr}.json`;
  link.click();
  URL.revokeObjectURL(url);
};
