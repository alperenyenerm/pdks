export type AttendanceType =
  | 'FULL'
  | 'HALF'
  | 'LEAVE'
  | 'REPORT'
  | 'REPORT_PAID'
  | 'REPORT_UNPAID'
  | 'ABSENT'
  | 'WEEKEND'
  | 'WEEKEND_WORK';

export type ShiftType = 'DAY' | 'NIGHT' | 'WEEKEND' | 'SHIFT_1' | 'SHIFT_2' | 'SHIFT_3';
export type CurrencyCode = 'TRY' | 'USD' | 'EUR';

export interface Worker {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  role: string;
  dailyRate: number; // ₺ / gün
  overtimeHourlyRate: number; // ₺ / saat
  phone: string;
  iban: string;
  department: string;
  branchId?: string; // Şantiye / Şube ID
  status: 'active' | 'passive';
  startDate: string;
  tcNo?: string;
  emergencyPhone?: string;
  skillLevel?: 'Usta' | 'Uzman' | 'Kalfa' | 'Mühendis' | 'Operatör' | 'Çırak';
  notes?: string;
  avatarColor?: string;
}

export interface AttendanceRecord {
  id: string;
  workerId: string;
  date: string; // YYYY-MM-DD
  type: AttendanceType;
  overtimeHours: number;
  overtimeMultiplier?: number; // 1.5x, 2.0x (Pazar/Haftasonu), 2.5x (Resmi Tatil)
  shift?: ShiftType;
  projectId?: string;
  machineryId?: string; // Makine / Tezgah No
  branchId?: string;
  mealAllowance?: number; // Günlük yemek yardımı ₺
  transportAllowance?: number; // Günlük yol yardımı ₺
  checkInTime?: string; // e.g. "07:55"
  checkOutTime?: string; // e.g. "18:30"
  note?: string;
}

export interface MagicPassLog {
  id: string;
  deviceId: string;
  workerCode: string;
  timestamp: string; // YYYY-MM-DD HH:mm:ss
  eventState: 'IN' | 'OUT' | 'CHECK';
  processed: boolean;
  workerName?: string;
}

export interface AdvancePayment {
  id: string;
  workerId: string;
  date: string; // YYYY-MM-DD
  amount: number;
  type: 'ADVANCE' | 'BONUS' | 'DEDUCTION' | 'PAYROLL_SETTLEMENT';
  paymentMethod: 'CASH' | 'BANK';
  description: string;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  client: string;
  startDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PLANNED';
  budget?: number;
  branchId?: string;
}

export interface MachineryUnit {
  id: string;
  code: string;
  name: string;
  category: 'CNC' | 'Kaynak' | 'Pres' | 'Montaj' | 'Lazer' | 'Diğer';
  status: 'OPERATIONAL' | 'MAINTENANCE' | 'IDLE';
  hourlyOperatingCost: number;
  branchId?: string;
}

export interface BranchLocation {
  id: string;
  code: string;
  name: string;
  city: string;
  address: string;
  managerName: string;
  status: 'ACTIVE' | 'PASSIVE';
}

export interface OfficialHoliday {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  overtimeMultiplier: number; // e.g. 2.5x / 3.0x
  isHalfDay?: boolean;
}

export interface DisciplinaryRecord {
  id: string;
  workerId: string;
  date: string;
  type: 'PRAISE' | 'WARNING' | 'LATENESS' | 'SAFETY_VIOLATION';
  title: string;
  description: string;
  penaltyOrBonusAmount?: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  category: 'PUANTAJ' | 'AVANS' | 'PERSONEL' | 'PROJE' | 'AYARLAR';
  details: string;
}

export interface CompanySettings {
  companyName: string;
  title: string;
  phone: string;
  address: string;
  taxNo: string;
  defaultOvertimeMultiplier: number; // 1.5
  sundayOvertimeMultiplier: number; // 2.0
  holidayOvertimeMultiplier: number; // 2.5
  workingHoursPerDay: number; // 8
  defaultMealAllowance: number; // 150 ₺
  defaultTransportAllowance: number; // 80 ₺
  maxWeeklyOvertimeHoursLimit: number; // 45 saat yasal sınır
  nightShiftMultiplierPercent?: number; // %20 Gece vardiya primi
  activeCurrency: CurrencyCode;
  exchangeRateUSD: number; // ₺/USD
  exchangeRateEUR: number; // ₺/EUR
}

export interface MonthlyWorkerSummary {
  worker: Worker;
  fullDays: number;
  halfDays: number;
  leaveDays: number;
  reportDays: number; // Toplam Rapor
  paidReportDays: number; // Ücretli Rapor (ÜR)
  unpaidReportDays: number; // Ücretsiz Rapor (ÜR-)
  absentDays: number;
  weekendDays: number; // Hafta Sonu Ücretli Tatil (HT)
  weekendWorkDays: number; // Hafta Sonu Mesaili Çalışma (HÇ)
  totalWorkedDaysEquivalent: number;
  totalOvertimeHours: number;
  nightShiftDays: number;
  nightShiftBonusEarnings: number; // Gece vardiya prim kazancı ₺
  baseWageEarnings: number;
  overtimeEarnings: number;
  totalMealAllowances: number;
  totalTransportAllowances: number;
  totalGrossEarnings: number;
  totalAdvancesPaid: number;
  totalBonusesPaid: number;
  totalDeductions: number;
  netPayable: number;
  isOvertimeLimitExceeded: boolean;
  performanceScorePercent: number; // %0 - %100
}

export interface ISGEquipment {
  id: string;
  workerId: string;
  equipmentName: string;
  category: 'AYAKKABI' | 'BARET' | 'MASKE' | 'ELBİSE' | 'KULAKLIK' | 'ELDİVEN' | 'GÖZLÜK';
  issueDate: string;
  expiryDate: string;
  status: 'VALID' | 'WARNING' | 'EXPIRED';
  sizeOrSerial?: string;
  signedByWorker: boolean;
}

export interface ISGCertificate {
  id: string;
  workerId: string;
  certificateName: string;
  issuingInstitution: string;
  issueDate: string;
  expiryDate: string;
  status: 'VALID' | 'WARNING' | 'EXPIRED';
  certificateNo: string;
}

export interface NotificationToast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: number;
}
