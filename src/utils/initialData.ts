import type {
  Worker,
  Project,
  CompanySettings,
  AttendanceRecord,
  AdvancePayment,
  MachineryUnit,
  BranchLocation,
  OfficialHoliday,
  AuditLog,
  DisciplinaryRecord,
} from '../types';

export const INITIAL_COMPANY_SETTINGS: CompanySettings = {
  companyName: 'YNR MAKİNE SAN. VE TİC. LTD. ŞTİ.',
  title: 'Endüstriyel Makine İmalatı & Otomasyon Sistemleri',
  phone: '+90 (212) 555 96 70',
  address: 'İkitelli OSB, İMSAN Sanayi Sitesi A Blok No: 14, Başakşehir / İstanbul',
  taxNo: '9840123982 / İkitelli V.D.',
  defaultOvertimeMultiplier: 1.5,
  sundayOvertimeMultiplier: 2.0,
  holidayOvertimeMultiplier: 2.5,
  workingHoursPerDay: 8,
  defaultMealAllowance: 150,
  defaultTransportAllowance: 80,
  maxWeeklyOvertimeHoursLimit: 45,
  nightShiftMultiplierPercent: 20,
  sgkWorkerPercent: 14,
  unemploymentWorkerPercent: 1,
  incomeTaxPercent: 15,
  stampTaxPercent: 0.759,
  enableAutomaticTaxes: true,
  activeCurrency: 'TRY',
  exchangeRateUSD: 36.5,
  exchangeRateEUR: 39.8,
};

export const INITIAL_BRANCHES: BranchLocation[] = [
  {
    id: 'br-1',
    code: 'ŞUB-01',
    name: 'İkitelli OSB Ana Atölye & Genel Merkez',
    city: 'İstanbul',
    address: 'İkitelli OSB İMSAN Sanayi Sitesi A Blok No: 14',
    managerName: 'Yaşar Yılmaz (Fabrika Müdürü)',
    status: 'ACTIVE',
  },
  {
    id: 'br-2',
    code: 'ŞUB-02',
    name: 'Gebze Plastikçiler OSB Ağır İmalat Tesisleri',
    city: 'Kocaeli / Gebze',
    address: 'Gebze Plastikçiler OSB 4. Cadde No: 28',
    managerName: 'Nuri Aktaş (Üretim Müdürü)',
    status: 'ACTIVE',
  },
  {
    id: 'br-3',
    code: 'ŞUB-03',
    name: 'Ankara Aksa Enerji Saha Kurulum Şantiyesi',
    city: 'Ankara',
    address: 'Kahramankazan Sanayi Bölgesi No: 102',
    managerName: 'Serkan Şahin (Saha Şefi)',
    status: 'ACTIVE',
  },
];

export const INITIAL_HOLIDAYS: OfficialHoliday[] = [
  { id: 'hol-1', date: '2026-01-01', name: 'Yılbaşı Tatili', overtimeMultiplier: 2.5 },
  { id: 'hol-2', date: '2026-03-20', name: 'Ramazan Bayramı 1. Gün', overtimeMultiplier: 3.0 },
  { id: 'hol-3', date: '2026-03-21', name: 'Ramazan Bayramı 2. Gün', overtimeMultiplier: 3.0 },
  { id: 'hol-4', date: '2026-03-22', name: 'Ramazan Bayramı 3. Gün', overtimeMultiplier: 3.0 },
  { id: 'hol-5', date: '2026-04-23', name: '23 Nisan Ulusal Egemenlik ve Çocuk Bayramı', overtimeMultiplier: 2.5 },
  { id: 'hol-6', date: '2026-05-01', name: '1 Mayıs Emek ve Dayanışma Günü', overtimeMultiplier: 2.5 },
  { id: 'hol-7', date: '2026-05-19', name: '19 Mayıs Atatürk\'ü Anma, Gençlik ve Spor Bayramı', overtimeMultiplier: 2.5 },
  { id: 'hol-8', date: '2026-05-27', name: 'Kurban Bayramı 1. Gün', overtimeMultiplier: 3.0 },
  { id: 'hol-9', date: '2026-05-28', name: 'Kurban Bayramı 2. Gün', overtimeMultiplier: 3.0 },
  { id: 'hol-10', date: '2026-07-15', name: '15 Temmuz Demokrasi ve Milli Birlik Günü', overtimeMultiplier: 2.5 },
  { id: 'hol-11', date: '2026-08-30', name: '30 Ağustos Zafer Bayramı', overtimeMultiplier: 2.5 },
  { id: 'hol-12', date: '2026-10-29', name: '29 Ekim Cumhuriyet Bayramı', overtimeMultiplier: 2.5 },
];

export const INITIAL_MACHINERY: MachineryUnit[] = [
  {
    id: 'm-1',
    code: 'TEZ-101',
    name: 'Mazak 5-Eksen CNC İşleme Merkezi',
    category: 'CNC',
    status: 'OPERATIONAL',
    hourlyOperatingCost: 850,
    branchId: 'br-1',
  },
  {
    id: 'm-2',
    code: 'TEZ-102',
    name: 'Bystronic 10kW Fiber Lazer Kesim',
    category: 'Lazer',
    status: 'OPERATIONAL',
    hourlyOperatingCost: 1200,
    branchId: 'br-1',
  },
  {
    id: 'm-3',
    code: 'TEZ-103',
    name: 'Durma 300 Ton CNC Abkant Pres',
    category: 'Pres',
    status: 'OPERATIONAL',
    hourlyOperatingCost: 650,
    branchId: 'br-2',
  },
  {
    id: 'm-4',
    code: 'TEZ-104',
    name: 'Kemppi Robotik Gazaltı Kaynak Masası',
    category: 'Kaynak',
    status: 'OPERATIONAL',
    hourlyOperatingCost: 450,
    branchId: 'br-2',
  },
  {
    id: 'm-5',
    code: 'TEZ-105',
    name: 'Fabrika Ana Montaj & Test İstasyonu',
    category: 'Montaj',
    status: 'OPERATIONAL',
    hourlyOperatingCost: 350,
    branchId: 'br-1',
  },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'prj-1',
    code: 'PRJ-2026-01',
    name: 'CNC 5-Eksen İşleme Merkezi İmalatı',
    client: 'YNR Stok İmalat',
    startDate: '2026-06-01',
    status: 'ACTIVE',
    budget: 850000,
    branchId: 'br-1',
  },
  {
    id: 'prj-2',
    code: 'PRJ-2026-02',
    name: 'Otomatik Şişeleme & Konveyör Hattı',
    client: 'Ege Gıda San. A.Ş.',
    startDate: '2026-07-10',
    status: 'ACTIVE',
    budget: 1200000,
    branchId: 'br-2',
  },
  {
    id: 'prj-3',
    code: 'PRJ-2026-03',
    name: '250 Ton Hidrolik Derin Çekme Presi',
    client: 'Kardeşler Otomotiv',
    startDate: '2026-07-20',
    status: 'ACTIVE',
    budget: 650000,
    branchId: 'br-1',
  },
  {
    id: 'prj-4',
    code: 'PRJ-2026-04',
    name: 'Fabrika Lazer Kesim Odası Havalandırma',
    client: 'Aksa Metal',
    startDate: '2026-05-15',
    status: 'COMPLETED',
    budget: 320000,
    branchId: 'br-3',
  },
];

export const INITIAL_WORKERS: Worker[] = [
  {
    id: 'w-1',
    code: 'YNR-001',
    firstName: 'Mustafa',
    lastName: 'Yılmaz',
    role: 'Talaşlı İmalat Ustası (CNC Torna)',
    dailyRate: 1800,
    overtimeHourlyRate: 337.5,
    phone: '0532 111 2233',
    iban: 'TR42 0006 2000 0000 1234 5678 01',
    department: 'Talaşlı İmalat',
    branchId: 'br-1',
    status: 'active',
    startDate: '2021-03-15',
    tcNo: '12345678901',
    cardNumber: '1001',
    skillLevel: 'Usta',
    avatarColor: 'from-amber-500 to-amber-700',
    notes: 'Kıdemli CNC operatörü, takım lideri.',
  },
  {
    id: 'w-2',
    code: 'YNR-002',
    firstName: 'Ahmet',
    lastName: 'Demir',
    role: 'Gazaltı & TIG Kaynak Ustası',
    dailyRate: 1700,
    overtimeHourlyRate: 318.75,
    phone: '0533 222 3344',
    iban: 'TR15 0001 5000 0000 9876 5432 02',
    department: 'Kaynak & Şasi',
    branchId: 'br-1',
    status: 'active',
    startDate: '2022-06-01',
    tcNo: '23456789012',
    cardNumber: '1002',
    skillLevel: 'Uzman',
    avatarColor: 'from-blue-500 to-indigo-700',
    notes: 'Sertifikalı basınçlı kap kaynakçısı.',
  },
  {
    id: 'w-3',
    code: 'YNR-003',
    firstName: 'Mehmet',
    lastName: 'Kaya',
    role: 'Mekanik Montaj Elemanı',
    dailyRate: 1400,
    overtimeHourlyRate: 262.5,
    phone: '0535 333 4455',
    iban: 'TR68 0006 4000 0000 1122 3344 03',
    department: 'Montaj & Test',
    branchId: 'br-2',
    status: 'active',
    startDate: '2023-01-10',
    cardNumber: '1003',
    skillLevel: 'Operatör',
    avatarColor: 'from-emerald-500 to-teal-700',
  },
  {
    id: 'w-4',
    code: 'YNR-004',
    firstName: 'Hüseyin',
    lastName: 'Çelik',
    role: 'Otomasyon & Elektrik Teknisyeni',
    dailyRate: 2000,
    overtimeHourlyRate: 375,
    phone: '0536 444 5566',
    iban: 'TR91 0001 2000 0000 5566 7788 04',
    department: 'Mühendislik & Kalite',
    branchId: 'br-1',
    status: 'active',
    startDate: '2020-09-01',
    cardNumber: '1004',
    skillLevel: 'Mühendis',
    avatarColor: 'from-purple-500 to-purple-800',
    notes: 'PLC pano montajı ve devreye alma uzmanı.',
  },
  {
    id: 'w-5',
    code: 'YNR-005',
    firstName: 'Serkan',
    lastName: 'Şahin',
    role: 'Saha Montaj & Kurulum Ustası',
    dailyRate: 1650,
    overtimeHourlyRate: 309.38,
    phone: '0537 555 6677',
    iban: 'TR24 0006 2000 0000 8899 0011 05',
    department: 'Saha Montaj',
    branchId: 'br-3',
    status: 'active',
    startDate: '2022-11-15',
    cardNumber: '1005',
    skillLevel: 'Usta',
    avatarColor: 'from-rose-500 to-rose-700',
  },
  {
    id: 'w-6',
    code: 'YNR-006',
    firstName: 'Emre',
    lastName: 'Öztürk',
    role: 'CNC Freze Operatörü',
    dailyRate: 1550,
    overtimeHourlyRate: 290.63,
    phone: '0538 666 7788',
    iban: 'TR33 0001 5000 0000 2233 4455 06',
    department: 'Talaşlı İmalat',
    branchId: 'br-1',
    status: 'active',
    startDate: '2023-05-20',
    cardNumber: '1006',
    skillLevel: 'Operatör',
    avatarColor: 'from-orange-500 to-amber-700',
  },
  {
    id: 'w-7',
    code: 'YNR-007',
    firstName: 'Burak',
    lastName: 'Arslan',
    role: 'Çırak & Genel Yardımcı',
    dailyRate: 1100,
    overtimeHourlyRate: 206.25,
    phone: '0539 777 8899',
    iban: 'TR44 0006 4000 0000 6677 8899 07',
    department: 'Montaj & Test',
    branchId: 'br-2',
    status: 'active',
    startDate: '2024-02-01',
    cardNumber: '1007',
    skillLevel: 'Çırak',
    avatarColor: 'from-cyan-500 to-blue-700',
  },
  {
    id: 'w-8',
    code: 'YNR-008',
    firstName: 'İbrahim',
    lastName: 'Aydın',
    role: 'Kalite Kontrol & Ölçüm Uzmanı',
    dailyRate: 1900,
    overtimeHourlyRate: 356.25,
    phone: '0540 888 9900',
    iban: 'TR55 0001 2000 0000 9900 1122 08',
    department: 'Mühendislik & Kalite',
    branchId: 'br-1',
    status: 'active',
    startDate: '2022-01-15',
    cardNumber: '1008',
    skillLevel: 'Uzman',
    avatarColor: 'from-indigo-500 to-violet-700',
  },
];

export const generateInitialAttendance = (workers: Worker[], year = 2026, month = 8): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  
  workers.forEach((worker, workerIdx) => {
    for (let day = 1; day <= Math.min(daysInMonth, 12); day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dateObj = new Date(year, month - 1, day);
      const dayOfWeek = dateObj.getDay();
      
      let type: AttendanceRecord['type'] = 'FULL';
      let overtimeHours = 0;
      let overtimeMultiplier = 1.5;
      let shift: AttendanceRecord['shift'] = 'DAY';
      let projectId = INITIAL_PROJECTS[workerIdx % INITIAL_PROJECTS.length].id;
      let machineryId = INITIAL_MACHINERY[workerIdx % INITIAL_MACHINERY.length].id;
      let checkInTime = '07:55';
      let checkOutTime = '18:00';

      if (dayOfWeek === 0) {
        type = 'LEAVE';
        overtimeHours = 0;
        overtimeMultiplier = 2.0;
      } else if (dayOfWeek === 6) {
        type = 'HALF';
        if ((day + workerIdx) % 2 === 0) {
          overtimeHours = 4;
          checkOutTime = '16:00';
        }
      } else {
        if (day === 5 && workerIdx === 2) {
          type = 'LEAVE';
        } else if (day === 8 && workerIdx === 6) {
          type = 'REPORT';
        } else if (day === 11 && workerIdx === 7) {
          type = 'ABSENT';
        } else {
          type = 'FULL';
          if ((day + workerIdx) % 4 === 0) {
            shift = 'NIGHT';
            checkInTime = '18:00';
            checkOutTime = '04:00';
          }
          if ((day + workerIdx) % 3 === 0) {
            overtimeHours = 2;
          } else if ((day + workerIdx) % 5 === 0) {
            overtimeHours = 3.5;
          }
        }
      }

      records.push({
        id: `att-${worker.id}-${dateStr}`,
        workerId: worker.id,
        date: dateStr,
        type,
        overtimeHours,
        overtimeMultiplier,
        shift,
        projectId: type === 'FULL' || type === 'HALF' ? projectId : undefined,
        machineryId: type === 'FULL' || type === 'HALF' ? machineryId : undefined,
        branchId: worker.branchId,
        mealAllowance: type === 'FULL' ? 150 : type === 'HALF' ? 75 : 0,
        transportAllowance: type === 'FULL' || type === 'HALF' ? 80 : 0,
        checkInTime,
        checkOutTime,
      });
    }
  });

  return records;
};

export const INITIAL_ADVANCE_PAYMENTS: AdvancePayment[] = [
  {
    id: 'adv-1',
    workerId: 'w-1',
    date: '2026-08-03',
    amount: 3000,
    type: 'ADVANCE',
    paymentMethod: 'BANK',
    description: 'Haftalık nakit avans talebi',
  },
  {
    id: 'adv-2',
    workerId: 'w-2',
    date: '2026-08-05',
    amount: 2500,
    type: 'ADVANCE',
    paymentMethod: 'CASH',
    description: 'Acil elden avans',
  },
  {
    id: 'adv-3',
    workerId: 'w-4',
    date: '2026-08-08',
    amount: 1500,
    type: 'BONUS',
    paymentMethod: 'BANK',
    description: 'Saha montaj tamamlama primi',
  },
  {
    id: 'adv-4',
    workerId: 'w-3',
    date: '2026-08-02',
    amount: 2000,
    type: 'ADVANCE',
    paymentMethod: 'BANK',
    description: 'Avans',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-08-12 10:15:30',
    user: 'YNR Sistem Yöneticisi',
    action: 'TOPLU_PUANTAJ_GİRİŞİ',
    category: 'PUANTAJ',
    details: '10 Ağustos 2026 tarihi için 8 personele tam gün puantaj yazıldı.',
  },
  {
    id: 'log-2',
    timestamp: '2026-08-10 14:20:05',
    user: 'Fabrika Müdürü',
    action: 'AVANS_ODEMESI',
    category: 'AVANS',
    details: 'Mustafa Yılmaz adına 3,000 TL Banka avansı kaydedildi.',
  },
  {
    id: 'log-3',
    timestamp: '2026-08-08 09:00:00',
    user: 'İK Departmanı',
    action: 'PERSONEL_GUNCELLEME',
    category: 'PERSONEL',
    details: 'Hüseyin Çelik saatlik mesai ücreti 375 TL olarak güncellendi.',
  },
];

export const INITIAL_DISCIPLINARY: DisciplinaryRecord[] = [
  {
    id: 'disc-1',
    workerId: 'w-1',
    date: '2026-08-04',
    type: 'PRAISE',
    title: 'Üstün İmalat Performans Ödülü',
    description: 'CNC 5-Eksen frezeleme projesindeki sıfır hata toleranslı işçiliğinden ötürü takdir edildi.',
    penaltyOrBonusAmount: 1000,
  },
  {
    id: 'disc-2',
    workerId: 'w-7',
    date: '2026-08-09',
    type: 'LATENESS',
    title: 'Mesaiye Geç Kalma Uyarısı',
    description: 'Sabah 08:00 vardiyasına 45 dakika geç katılındı.',
  },
];

export const INITIAL_PDKS_SHIFTS = [
  {
    id: 'shift-1',
    code: 'VARD_01',
    name: 'Gündüz Vardiyası (Sabit)',
    startTime: '08:00',
    endTime: '18:00',
    breakDurationMinutes: 60,
    latenessToleranceMinutes: 5,
    earlyExitToleranceMinutes: 15,
    isNightShift: false,
    colorTag: '#3b82f6'
  },
  {
    id: 'shift-2',
    code: 'VARD_02',
    name: 'Gece Vardiyası (%20 Prim)',
    startTime: '18:00',
    endTime: '04:00',
    breakDurationMinutes: 60,
    latenessToleranceMinutes: 5,
    earlyExitToleranceMinutes: 15,
    isNightShift: true,
    nightBonusRatePercent: 20,
    colorTag: '#a855f7'
  }
];

export const INITIAL_PDKS_LOGS = [
  {
    id: 'pdks-1',
    workerId: 'w-1',
    workerCode: 'YNR-001',
    workerName: 'Ahmet Yılmaz',
    deviceId: 'PERKOTEK_01',
    deviceName: 'Ana Turnike Okuyucu',
    verificationType: 'FINGERPRINT' as const,
    direction: 'IN' as const,
    timestamp: '2026-08-22 07:54:12',
    status: 'SUCCESS' as const,
    notes: 'Zamanında Giriş'
  },
  {
    id: 'pdks-2',
    workerId: 'w-2',
    workerCode: 'YNR-002',
    workerName: 'Mehmet Demir',
    deviceId: 'PERKOTEK_01',
    deviceName: 'Ana Turnike Okuyucu',
    verificationType: 'FACE' as const,
    direction: 'IN' as const,
    timestamp: '2026-08-22 07:58:40',
    status: 'SUCCESS' as const
  },
  {
    id: 'pdks-3',
    workerId: 'w-3',
    workerCode: 'YNR-003',
    workerName: 'Mustafa Kaya',
    deviceId: 'PERKOTEK_01',
    deviceName: 'Ana Turnike Okuyucu',
    verificationType: 'CARD' as const,
    direction: 'IN' as const,
    timestamp: '2026-08-22 08:12:05',
    status: 'MANUAL_ENTRY' as const,
    notes: '12 Dk Gecikmeli Giriş'
  }
];

export const INITIAL_PDKS_DAILY = [
  {
    id: 'daily-1',
    workerId: 'w-1',
    workerName: 'Ahmet Yılmaz',
    date: '2026-08-22',
    shiftName: 'Gündüz Vardiyası',
    firstCheckIn: '07:54',
    lastCheckOut: '18:30',
    totalWorkedMinutes: 576,
    normalWorkedMinutes: 540,
    lateMinutes: 0,
    earlyExitMinutes: 0,
    overtimeMinutes: 30,
    status: 'OVERTIME' as const,
    notes: '30 dk mesai kaldı'
  },
  {
    id: 'daily-2',
    workerId: 'w-3',
    workerName: 'Mustafa Kaya',
    date: '2026-08-22',
    shiftName: 'Gündüz Vardiyası',
    firstCheckIn: '08:12',
    lastCheckOut: '18:00',
    totalWorkedMinutes: 528,
    normalWorkedMinutes: 528,
    lateMinutes: 12,
    earlyExitMinutes: 0,
    overtimeMinutes: 0,
    status: 'LATE' as const,
    notes: '12 dk geç kalındı'
  }
];

export const INITIAL_OVERTIME_APPROVALS = [
  {
    id: 'fm-1',
    workerId: 'w-1',
    workerName: 'Ahmet Yılmaz',
    date: '2026-08-21',
    calculatedHours: 3.0,
    approvedHours: 3.0,
    multiplier: 1.5,
    status: 'APPROVED' as const,
    approvedBy: 'Yaşar Yılmaz (Fabrika Müdürü)',
    notes: 'Ağır imalat montaj mesaisi'
  },
  {
    id: 'fm-2',
    workerId: 'w-2',
    workerName: 'Mehmet Demir',
    date: '2026-08-21',
    calculatedHours: 2.5,
    approvedHours: 2.0,
    multiplier: 1.5,
    status: 'PENDING' as const,
    notes: 'Vardiya amiri onayı bekliyor'
  }
];

export const INITIAL_BULK_OPERATIONS = [
  {
    id: 'bulk-1',
    title: '%15 Toplu Maaş/Yövmiye Zam Artırımı',
    type: 'SALARY_RAISE' as const,
    date: '2026-08-01',
    affectedCount: 74,
    details: 'Tüm imalat kadrosuna yıllık enflasyon zammı uygulandı.'
  },
  {
    id: 'bulk-2',
    title: 'Toplu Resmi Tatil İzni İşleme',
    type: 'BULK_LEAVE' as const,
    date: '2026-07-15',
    affectedCount: 74,
    details: '15 Temmuz Demokrasi Bayramı tüm personele resmi tatil olarak atandı.'
  }
];
