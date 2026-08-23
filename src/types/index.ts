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
  cardNumber?: string; // Kart No (Perkotek)
  accountGroup?: string; // Hes. Grubu / Sabit Grup (Perkotek)
  isSeparated?: boolean; // İşten Ayrılanlar (Perkotek)
  separationDate?: string;
  branchId?: string; // Şantiye / Şube ID
  status: 'active' | 'passive';
  startDate: string;
  tcNo?: string;
  emergencyPhone?: string;
  skillLevel?: 'Usta' | 'Uzman' | 'Kalfa' | 'Mühendis' | 'Operatör' | 'Çırak';
  notes?: string;
  avatarColor?: string;
}

export interface OvertimeApproval {
  id: string;
  workerId: string;
  workerName: string;
  date: string;
  calculatedHours: number;
  approvedHours: number;
  multiplier: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  notes?: string;
}

export interface PDKSDevice {
  id: string;
  name: string;
  model: string; // e.g. "MAGIC PASS 20656 ID"
  serialNumber: string; // e.g. "C2609CD64315222B"
  ipAddress: string; // e.g. "88.247.139.41"
  port: number; // e.g. 8008
  location: string; // e.g. "MERKEZ"
  functionType: string; // e.g. "Standart"
  status: 'ONLINE' | 'OFFLINE' | 'CHECKING';
  lastSyncTime: string; // e.g. "21.08.2026 / 18:05:56"
}

export interface BulkOperationRecord {
  id: string;
  title: string;
  type: 'SALARY_RAISE' | 'BULK_LOG' | 'BULK_LEAVE' | 'BULK_ADVANCE' | 'BULK_BONUS' | 'BULK_CORRECT';
  date: string;
  affectedCount: number;
  details: string;
}

export interface PayrollSlip {
  workerId: string;
  workerName: string;
  period: string; // YYYY-MM
  baseDailyRate: number;
  totalWorkedDays: number;
  baseEarnings: number;
  overtimeEarnings: number;
  bonuses: number;
  deductions: number;
  advances: number;
  netSalary: number;
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

export interface PDKSLog {
  id: string;
  workerId: string;
  workerCode: string;
  workerName: string;
  deviceId: string;
  deviceName: string;
  verificationType: 'FINGERPRINT' | 'FACE' | 'CARD' | 'MANUAL' | 'PIN';
  direction: 'IN' | 'OUT';
  timestamp: string; // YYYY-MM-DD HH:mm:ss
  status: 'SUCCESS' | 'MANUAL_ENTRY' | 'CORRECTED';
  notes?: string;
}

export interface ShiftDefinition {
  id: string;
  code: string;
  name: string; // e.g. "Gündüz Vardiyası (08:00 - 18:00)"
  startTime: string; // "08:00"
  endTime: string; // "18:00"
  breakDurationMinutes: number; // e.g. 60
  latenessToleranceMinutes: number; // e.g. 5
  earlyExitToleranceMinutes: number; // e.g. 15
  isNightShift: boolean;
  nightBonusRatePercent?: number; // e.g. 20
  colorTag?: string;
}

export interface PDKSDailyCalculated {
  id: string;
  workerId: string;
  workerName: string;
  date: string; // YYYY-MM-DD
  shiftName: string;
  firstCheckIn?: string; // "07:54"
  lastCheckOut?: string; // "18:32"
  totalWorkedMinutes: number;
  normalWorkedMinutes: number;
  lateMinutes: number;
  earlyExitMinutes: number;
  overtimeMinutes: number;
  status: 'FULL_WORK' | 'LATE' | 'EARLY_EXIT' | 'OVERTIME' | 'LEAVE' | 'ABSENT' | 'WEEKEND';
  notes?: string;
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
  sgkWorkerPercent?: number; // %14 SGK işçi payı
  unemploymentWorkerPercent?: number; // %1 İşsizlik sigortası payı
  incomeTaxPercent?: number; // %15 Gelir vergisi dilimi
  stampTaxPercent?: number; // %0.759 Damga vergisi
  enableAutomaticTaxes?: boolean; // Yasal kesintileri göster/hesapla
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
