import type { Worker, AttendanceRecord, AdvancePayment, MonthlyWorkerSummary, CompanySettings } from '../types';

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate();
};

export const getMonthNameTr = (month: number): string => {
  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  return monthNames[month - 1] || '';
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const calculateOvertimeFromTimes = (
  checkIn?: string,
  checkOut?: string,
  standardWorkingHours: number = 8
): number => {
  if (!checkIn || !checkOut) return 0;
  const [inH, inM] = checkIn.split(':').map(Number);
  const [outH, outM] = checkOut.split(':').map(Number);
  if (isNaN(inH) || isNaN(outH)) return 0;

  const inMinutes = inH * 60 + (inM || 0);
  const outMinutes = outH * 60 + (outM || 0);
  let totalMinutes = outMinutes - inMinutes;
  if (totalMinutes < 0) totalMinutes += 24 * 60; // Overnight shift

  // Deduct 1 hour meal/rest break if worked more than 5 hours
  if (totalMinutes > 300) {
    totalMinutes -= 60;
  }

  const workedHours = totalMinutes / 60;
  const overtime = Math.max(0, workedHours - standardWorkingHours);
  return Math.round(overtime * 10) / 10;
};

export const calculateWorkerMonthlySummary = (
  worker: Worker,
  year: number,
  month: number,
  attendanceRecords: AttendanceRecord[],
  advancePayments: AdvancePayment[],
  settings?: CompanySettings
): MonthlyWorkerSummary => {
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
  
  // Filter attendance for worker & month
  const workerAttendance = attendanceRecords.filter(
    (r) => r.workerId === worker.id && r.date.startsWith(monthPrefix)
  );

  let fullDays = 0;
  let halfDays = 0;
  let leaveDays = 0;
  let reportDays = 0;
  let paidReportDays = 0;
  let unpaidReportDays = 0;
  let absentDays = 0;
  let weekendDays = 0;
  let weekendWorkDays = 0;
  let totalOvertimeHours = 0;
  let overtimeEarnings = 0;
  let totalMealAllowances = 0;
  let totalTransportAllowances = 0;
  let nightShiftDays = 0;

  const defaultOvertimeMultiplier = settings?.defaultOvertimeMultiplier || 1.5;
  const sundayMultiplier = settings?.sundayOvertimeMultiplier || 2.0;

  workerAttendance.forEach((rec) => {
    switch (rec.type) {
      case 'FULL':
        fullDays += 1;
        break;
      case 'HALF':
        halfDays += 1;
        break;
      case 'LEAVE':
        leaveDays += 1;
        break;
      case 'REPORT':
      case 'REPORT_PAID':
        reportDays += 1;
        paidReportDays += 1;
        break;
      case 'REPORT_UNPAID':
        reportDays += 1;
        unpaidReportDays += 1;
        break;
      case 'ABSENT':
        absentDays += 1;
        break;
      case 'WEEKEND':
        weekendDays += 1;
        break;
      case 'WEEKEND_WORK':
        weekendWorkDays += 1;
        break;
    }

    if (rec.shift === 'NIGHT' || rec.shift === 'SHIFT_3') nightShiftDays += 1;

    // Auto-calculate overtime if checkIn & checkOut present and no manual overtime set
    let hrs = rec.overtimeHours;
    if ((hrs === undefined || hrs === 0) && rec.checkInTime && rec.checkOutTime && rec.type !== 'ABSENT') {
      hrs = calculateOvertimeFromTimes(rec.checkInTime, rec.checkOutTime, settings?.workingHoursPerDay || 8);
    }
    hrs = hrs || 0;

    let multiplier = rec.overtimeMultiplier || defaultOvertimeMultiplier;

    if (rec.type === 'WEEKEND_WORK') {
      multiplier = rec.overtimeMultiplier || sundayMultiplier;
      if (hrs === 0) {
        hrs = settings?.workingHoursPerDay || 8;
      }
    }

    if (hrs > 0) {
      totalOvertimeHours += hrs;
      const baseHourly = worker.overtimeHourlyRate / 1.5; // Base hourly wage
      overtimeEarnings += hrs * baseHourly * multiplier;
    }

    totalMealAllowances += rec.mealAllowance || 0;
    totalTransportAllowances += rec.transportAllowance || 0;
  });

  // Paid days = FULL + HALF*0.5 + WEEKEND + WEEKEND_WORK + REPORT_PAID
  const totalWorkedDaysEquivalent = fullDays + halfDays * 0.5 + weekendDays + weekendWorkDays + paidReportDays;
  const baseWageEarnings = totalWorkedDaysEquivalent * worker.dailyRate;
  
  const nightShiftPercent = (settings?.nightShiftMultiplierPercent || 20) / 100;
  const nightShiftBonusEarnings = nightShiftDays * (worker.dailyRate * nightShiftPercent);

  const totalGrossEarnings = baseWageEarnings + overtimeEarnings + totalMealAllowances + totalTransportAllowances + nightShiftBonusEarnings;

  // Filter payments
  const workerPayments = advancePayments.filter(
    (p) => p.workerId === worker.id && p.date.startsWith(monthPrefix)
  );

  let totalAdvancesPaid = 0;
  let totalBonusesPaid = 0;
  let totalDeductions = 0;

  workerPayments.forEach((p) => {
    if (p.type === 'ADVANCE') totalAdvancesPaid += p.amount;
    else if (p.type === 'BONUS') totalBonusesPaid += p.amount;
    else if (p.type === 'DEDUCTION') totalDeductions += p.amount;
  });

  const netPayable = totalGrossEarnings + totalBonusesPaid - totalAdvancesPaid - totalDeductions;
  const maxOvertimeLimit = settings?.maxWeeklyOvertimeHoursLimit || 45;
  const isOvertimeLimitExceeded = totalOvertimeHours > maxOvertimeLimit;

  const performanceScorePercent = Math.min(Math.round((totalWorkedDaysEquivalent / 26) * 100), 100);

  return {
    worker,
    fullDays,
    halfDays,
    leaveDays,
    reportDays,
    paidReportDays,
    unpaidReportDays,
    absentDays,
    weekendDays,
    weekendWorkDays,
    totalWorkedDaysEquivalent,
    totalOvertimeHours,
    nightShiftDays,
    nightShiftBonusEarnings,
    baseWageEarnings,
    overtimeEarnings,
    totalMealAllowances,
    totalTransportAllowances,
    totalGrossEarnings,
    totalAdvancesPaid,
    totalBonusesPaid,
    totalDeductions,
    netPayable,
    isOvertimeLimitExceeded,
    performanceScorePercent,
  };
};
