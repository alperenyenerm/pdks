import * as XLSX from 'xlsx';
import type { Worker, AttendanceRecord, AttendanceType } from '../types';

export interface ParseResult {
  workers: Worker[];
  attendance: AttendanceRecord[];
  reportTitle?: string;
  period?: string;
}

/**
 * Normalizes header string to clean ASCII lowercase for robust mapping
 */
function normalizeHeader(str: string): string {
  return String(str || '')
    .toLowerCase()
    .trim()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Checks and parses Perkotek Multi-Block Report ("PERSONEL BAZLI DETAYLI BORDRO" / "Kişi Bazında Maaş Ekstresi")
 */
function parsePerkotekDetailedReport(rows: any[][]): ParseResult | null {
  // Check if first few rows contain Perkotek report title
  let isPerkotek = false;
  let reportTitle = '';
  let period = '';

  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const r = rows[i];
    if (!r) continue;
    const rowStr = r.join(' ').toLowerCase();
    if (rowStr.includes('personel bazli detayli bordro') || rowStr.includes('maas ekstresi') || rowStr.includes('puantaj raporu')) {
      isPerkotek = true;
      reportTitle = String(r[0] || 'Perkotek Bordro Raporu');
    }
    if (r[0] && typeof r[0] === 'string' && r[0].includes('/202') && r[0].includes(' / ')) {
      period = r[0];
    }
  }

  if (!isPerkotek) {
    // Also check if multiple "Kart" and "Personel Adı" blocks exist
    let kartCount = 0;
    for (let i = 0; i < Math.min(50, rows.length); i++) {
      if (rows[i] && rows[i].includes('Kart')) kartCount++;
    }
    if (kartCount >= 1) {
      isPerkotek = true;
    }
  }

  if (!isPerkotek) return null;

  const workers: Worker[] = [];
  const attendance: AttendanceRecord[] = [];
  let currentWorker: Worker | null = null;

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length === 0) continue;

    // Detect Worker Header Block (e.g. ["Kart", 110, ..., "Personel Adı", "HÜSEYİN"])
    for (let j = 0; j < r.length; j++) {
      if (r[j] === 'Kart' && r[j + 1] !== undefined) {
        const card = String(r[j + 1]).trim();
        let name = '';
        let sicil = '';

        for (let k = 0; k < r.length; k++) {
          if (r[k] === 'Personel Adı' && r[k + 1]) name = String(r[k + 1]).trim();
          if (r[k] === 'Sicil No' && r[k + 1]) sicil = String(r[k + 1]).trim();
        }

        const nextRow = rows[i + 1] || [];
        let surname = '';
        let dailyRate = 1500;
        let department = 'Üretim & İmalat';

        for (let k = 0; k < nextRow.length; k++) {
          if (nextRow[k] === 'Soyadı' && nextRow[k + 1]) surname = String(nextRow[k + 1]).trim();
          if (nextRow[k] === 'Bölüm' && nextRow[k + 1]) department = String(nextRow[k + 1]).trim();
          if (nextRow[k] === 'Departman' && nextRow[k + 1]) department = String(nextRow[k + 1]).trim();
          if (nextRow[k] === 'Günlük Ücret' && nextRow[k + 1]) {
            const rawRate = String(nextRow[k + 1]).replace(/\./g, '').replace(',', '.');
            const parsed = parseFloat(rawRate);
            if (!isNaN(parsed) && parsed > 0) dailyRate = parsed;
          }
          if (nextRow[k] === 'Net Maaşı' && nextRow[k + 1] && dailyRate === 1500) {
            const rawSalary = String(nextRow[k + 1]).replace(/\./g, '').replace(',', '.');
            const parsed = parseFloat(rawSalary);
            if (!isNaN(parsed) && parsed > 0) dailyRate = Math.round(parsed / 30);
          }
        }

        const workerId = `w-card-${card}`;
        const code = sicil || `YNR-${card.padStart(3, '0')}`;

        currentWorker = {
          id: workerId,
          code,
          cardNumber: card,
          firstName: name || 'Personel',
          lastName: surname || '',
          role: 'Operatör',
          dailyRate,
          overtimeHourlyRate: Math.round((dailyRate / 8) * 1.5),
          phone: '',
          iban: '',
          department,
          status: 'active',
          startDate: '2026-01-01',
          skillLevel: 'Operatör',
          avatarColor: 'from-amber-500 to-amber-700',
          notes: 'Perkotek Maaş Ekstresi aktarımı'
        };

        // Don't duplicate worker
        if (!workers.find(w => w.cardNumber === card || (w.firstName === name && w.lastName === surname))) {
          workers.push(currentWorker);
        }
        break;
      }
    }

    // Detect Daily Attendance Row (e.g. ["03.08.2026 Pazartesi", "08:15", "18:06", ...])
    if (currentWorker && r[0] && typeof r[0] === 'string' && r[0].match(/^\d{2}\.\d{2}\.\d{4}/)) {
      const dateRaw = r[0].trim();
      const dateParts = dateRaw.split(' ')[0].split('.');
      if (dateParts.length === 3) {
        const isoDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        const dayName = dateRaw.split(' ')[1] || '';
        const isWeekend = dayName === 'Pazar' || dayName === 'Cumartesi';

        const checkIn = r[1] && String(r[1]).trim() !== '' ? String(r[1]).trim() : null;
        const checkOut = r[2] && String(r[2]).trim() !== '' ? String(r[2]).trim() : null;

        // Parse Overtime (Column 7: Fazla Mesai Saat)
        let overtimeHours = 0;
        if (r[7]) {
          const otRaw = String(r[7]).trim();
          if (otRaw.includes(':')) {
            const parts = otRaw.split(':');
            overtimeHours = parseFloat(parts[0]) + (parseFloat(parts[1] || '0') / 60);
          } else {
            const otParsed = parseFloat(otRaw.replace(',', '.'));
            if (!isNaN(otParsed)) overtimeHours = otParsed;
          }
        }

        let type: AttendanceType = 'FULL';
        if (isWeekend) {
          type = (checkIn || checkOut) ? 'WEEKEND_WORK' : 'WEEKEND';
        } else {
          if (checkIn || checkOut) {
            type = 'FULL';
          } else {
            // Check if Leave or Report columns have values
            const ucretliIzin = r[12] && parseFloat(String(r[12]).replace(',', '.')) > 0;
            const ucretsizIzin = r[15] && parseFloat(String(r[15]).replace(',', '.')) > 0;
            const raporUcretli = r[18] && parseFloat(String(r[18]).replace(',', '.')) > 0;
            const raporUcretsiz = r[20] && parseFloat(String(r[20]).replace(',', '.')) > 0;
            const resmiTatil = r[22] && parseFloat(String(r[22]).replace(',', '.')) > 0;

            if (resmiTatil) type = 'WEEKEND';
            else if (raporUcretli) type = 'REPORT_PAID';
            else if (raporUcretsiz) type = 'REPORT_UNPAID';
            else if (ucretliIzin) type = 'LEAVE';
            else if (ucretsizIzin) type = 'REPORT_UNPAID';
            else type = 'ABSENT';
          }
        }

        attendance.push({
          id: `att-${currentWorker.id}-${isoDate}`,
          workerId: currentWorker.id,
          date: isoDate,
          checkInTime: checkIn || undefined,
          checkOutTime: checkOut || undefined,
          overtimeHours: Number(overtimeHours.toFixed(2)),
          type,
          note: checkIn ? `Giriş: ${checkIn} - Çıkış: ${checkOut || '-'}` : undefined
        });
      }
    }
  }

  if (workers.length > 0) {
    return { workers, attendance, reportTitle, period };
  }

  return null;
}

/**
 * Parses XML / PDKS file content
 */
function parseXmlContent(text: string): ParseResult {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(text, 'text/xml');
  const parseError = xmlDoc.getElementsByTagName('parsererror');
  if (parseError && parseError.length > 0) {
    throw new Error('Geçersiz XML formatı.');
  }

  const candidateTags = ['personel', 'personeller', 'worker', 'row', 'record', 'kart', 'eleman', 'calisan', 'item'];
  let items: Element[] = [];

  for (const tag of candidateTags) {
    const found = xmlDoc.getElementsByTagName(tag);
    if (found && found.length > 0) {
      items = Array.from(found);
      break;
    }
  }

  if (items.length === 0) {
    const allElems = Array.from(xmlDoc.getElementsByTagName('*'));
    items = allElems.filter(el => el.children.length >= 2);
  }

  if (items.length === 0) {
    throw new Error('XML dosyasında personel kaydı bulunamadı.');
  }

  const workers: Worker[] = [];
  const timestamp = Date.now();

  items.forEach((item, idx) => {
    const normRow: { [key: string]: string } = {};

    Array.from(item.children).forEach((child) => {
      const key = normalizeHeader(child.nodeName);
      normRow[key] = (child.textContent || '').trim();
    });

    Array.from(item.attributes || []).forEach((attr) => {
      const key = normalizeHeader(attr.name);
      normRow[key] = (attr.value || '').trim();
    });

    const getVal = (aliases: string[]) => {
      for (const alias of aliases) {
        const normAlias = normalizeHeader(alias);
        if (normRow[normAlias] !== undefined && normRow[normAlias] !== '') {
          return normRow[normAlias];
        }
      }
      return '';
    };

    let firstName = getVal(['ad', 'adi', 'isim', 'firstname', 'first_name']);
    let lastName = getVal(['soyad', 'soyadi', 'lastname', 'last_name']);
    const fullName = getVal(['adsoyad', 'advesoyad', 'isimsoyisim', 'personeladi', 'fullname', 'name']);

    if ((!firstName || firstName.length === 0) && fullName) {
      const parts = fullName.split(' ').filter(Boolean);
      if (parts.length === 1) {
        firstName = parts[0];
        lastName = '';
      } else {
        lastName = parts.pop() || '';
        firstName = parts.join(' ');
      }
    }

    if (!firstName && !lastName && !fullName) return;

    const code = getVal(['sicilno', 'sicil', 'kod', 'personelkodu', 'code', 'id']) || `PRS-${String(idx + 1).padStart(3, '0')}`;
    const cardNumber = getVal(['kartno', 'kartnumarasi', 'kart', 'cardnumber', 'card_number', 'kartno(perkotek)']) || '';
    const tcNo = getVal(['tcno', 'tckimlikno', 'tc', 'tc_no', 'tckimlik']) || '';
    const department = getVal(['departman', 'bolum', 'department', 'kategori']) || 'Genel Kadro';
    const role = getVal(['gorev', 'unvan', 'pozisyon', 'role', 'meslek', 'gorevi']) || 'Operatör';
    const phone = getVal(['telefon', 'tel', 'gsm', 'cep', 'phone']) || '';
    const iban = getVal(['iban', 'ibanno', 'iban_no', 'hesapno']) || '';

    const rawDailyRate = getVal(['gunlukucret', 'ucret', 'yovmiye', 'maas', 'dailyrate', 'daily_rate', 'gunluk']);
    let dailyRate = 1500;
    if (rawDailyRate) {
      const parsedRate = parseFloat(rawDailyRate.replace(/[^0-9.,]/g, '').replace(',', '.'));
      if (!isNaN(parsedRate) && parsedRate > 0) dailyRate = parsedRate;
    }

    const rawOvertime = getVal(['mesaiucreti', 'saatlikmesai', 'overtimehourlyrate', 'overtime_hourly_rate']);
    let overtimeHourlyRate = Math.round((dailyRate / 8) * 1.5);
    if (rawOvertime) {
      const parsedOt = parseFloat(rawOvertime.replace(/[^0-9.,]/g, '').replace(',', '.'));
      if (!isNaN(parsedOt) && parsedOt > 0) overtimeHourlyRate = parsedOt;
    }

    const rawStartDate = getVal(['giristarihi', 'isebaslama', 'baslamatarihi', 'startdate', 'start_date']);
    let startDate = new Date().toISOString().slice(0, 10);
    if (rawStartDate) {
      if (rawStartDate.includes('.') || rawStartDate.includes('/')) {
        const parts = rawStartDate.split(/[./-]/);
        if (parts.length === 3) {
          if (parts[2].length === 4) {
            startDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          } else if (parts[0].length === 4) {
            startDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
          }
        }
      } else if (rawStartDate.length === 10) {
        startDate = rawStartDate;
      }
    }

    workers.push({
      id: `w-xml-${timestamp}-${idx}`,
      code,
      firstName: firstName || 'Personel',
      lastName: lastName || '',
      role,
      dailyRate,
      overtimeHourlyRate,
      phone,
      iban,
      department,
      status: 'active',
      startDate,
      tcNo: tcNo || undefined,
      cardNumber: cardNumber || undefined,
      skillLevel: 'Operatör',
      avatarColor: 'from-amber-500 to-amber-700',
      notes: 'XML / PDKS aktarımı ile eklendi'
    });
  });

  return { workers, attendance: [] };
}

/**
 * Universal file parser for Excel (.xlsx, .xls, .csv), XML (.xml), and Perkotek Reports
 */
export async function parseWorkersFromExcel(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const isXmlOrPdks = file.name.endsWith('.xml') || file.name.endsWith('.pdks');
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const result = e.target?.result;

        // 1. Text XML / PDKS check
        if (typeof result === 'string' && (isXmlOrPdks || result.trim().startsWith('<'))) {
          const xmlRes = parseXmlContent(result);
          resolve(xmlRes);
          return;
        }

        const data = new Uint8Array(result as ArrayBuffer);

        // Quick check if text XML in array buffer
        const textDecoder = new TextDecoder('utf-8');
        const textSample = textDecoder.decode(data.slice(0, 300));
        if (textSample.trim().startsWith('<?xml') || textSample.trim().startsWith('<')) {
          const fullText = textDecoder.decode(data);
          const xmlRes = parseXmlContent(fullText);
          resolve(xmlRes);
          return;
        }

        const workbook = XLSX.read(data, { type: 'array' });
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('Dosyada geçerli bir çalışma sayfası bulunamadı.');
        }

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawRows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

        if (!rawRows || rawRows.length === 0) {
          throw new Error('Dosyada okunabilir veri bulunamadı.');
        }

        // 2. Try Perkotek Multi-Block Report Parser (e.g. "Kişi Bazında Maaş Ekstresi")
        const perkotekResult = parsePerkotekDetailedReport(rawRows);
        if (perkotekResult && perkotekResult.workers.length > 0) {
          resolve(perkotekResult);
          return;
        }

        // 3. Fallback: Standard Flat Excel Table Parser
        const rawJson: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        const workers: Worker[] = [];
        const timestamp = Date.now();

        rawJson.forEach((row, idx) => {
          const normRow: { [key: string]: any } = {};
          Object.keys(row).forEach((key) => {
            normRow[normalizeHeader(key)] = row[key];
          });

          const getVal = (aliases: string[]) => {
            for (const alias of aliases) {
              const normAlias = normalizeHeader(alias);
              if (normRow[normAlias] !== undefined && String(normRow[normAlias]).trim() !== '') {
                return String(normRow[normAlias]).trim();
              }
            }
            return '';
          };

          let firstName = getVal(['ad', 'adi', 'isim', 'firstname', 'first_name']);
          let lastName = getVal(['soyad', 'soyadi', 'lastname', 'last_name']);
          const fullName = getVal(['adsoyad', 'advesoyad', 'isimsoyisim', 'personeladi', 'fullname']);

          if ((!firstName || firstName.length === 0) && fullName) {
            const parts = fullName.split(' ').filter(Boolean);
            if (parts.length === 1) {
              firstName = parts[0];
              lastName = '';
            } else {
              lastName = parts.pop() || '';
              firstName = parts.join(' ');
            }
          }

          if (!firstName && !lastName && !fullName) return;

          const code = getVal(['sicilno', 'sicil', 'kod', 'personelkodu', 'code', 'id']) || `PRS-${String(idx + 1).padStart(3, '0')}`;
          const cardNumber = getVal(['kartno', 'kartnumarasi', 'kart', 'cardnumber', 'card_number', 'kartno(perkotek)']) || '';
          const tcNo = getVal(['tcno', 'tckimlikno', 'tc', 'tc_no', 'tckimlik']) || '';
          const department = getVal(['departman', 'bolum', 'department', 'kategori']) || 'Genel Kadro';
          const role = getVal(['gorev', 'unvan', 'pozisyon', 'role', 'meslek', 'gorevi']) || 'Operatör';
          const phone = getVal(['telefon', 'tel', 'gsm', 'cep', 'phone']) || '';
          const iban = getVal(['iban', 'ibanno', 'iban_no', 'hesapno']) || '';

          const rawDailyRate = getVal(['gunlukucret', 'ucret', 'yovmiye', 'maas', 'dailyrate', 'daily_rate', 'gunluk']);
          let dailyRate = 1500;
          if (rawDailyRate) {
            const parsedRate = parseFloat(rawDailyRate.replace(/[^0-9.,]/g, '').replace(',', '.'));
            if (!isNaN(parsedRate) && parsedRate > 0) dailyRate = parsedRate;
          }

          const rawOvertime = getVal(['mesaiucreti', 'saatlikmesai', 'overtimehourlyrate', 'overtime_hourly_rate']);
          let overtimeHourlyRate = Math.round((dailyRate / 8) * 1.5);
          if (rawOvertime) {
            const parsedOt = parseFloat(rawOvertime.replace(/[^0-9.,]/g, '').replace(',', '.'));
            if (!isNaN(parsedOt) && parsedOt > 0) overtimeHourlyRate = parsedOt;
          }

          const rawStartDate = getVal(['giristarihi', 'isebaslama', 'baslamatarihi', 'startdate', 'start_date']);
          let startDate = new Date().toISOString().slice(0, 10);
          if (rawStartDate) {
            if (!isNaN(Number(rawStartDate)) && Number(rawStartDate) > 20000) {
              try {
                const dateObj = new Date((Number(rawStartDate) - (25567 + 2)) * 86400 * 1000);
                startDate = dateObj.toISOString().slice(0, 10);
              } catch (e) {}
            } else if (rawStartDate.includes('.') || rawStartDate.includes('/')) {
              const parts = rawStartDate.split(/[./-]/);
              if (parts.length === 3) {
                if (parts[2].length === 4) {
                  startDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                } else if (parts[0].length === 4) {
                  startDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
                }
              }
            } else if (rawStartDate.length === 10) {
              startDate = rawStartDate;
            }
          }

          workers.push({
            id: `w-imp-${timestamp}-${idx}`,
            code,
            firstName: firstName || 'Personel',
            lastName: lastName || '',
            role,
            dailyRate,
            overtimeHourlyRate,
            phone,
            iban,
            department,
            status: 'active',
            startDate,
            tcNo: tcNo || undefined,
            cardNumber: cardNumber || undefined,
            skillLevel: 'Operatör',
            avatarColor: 'from-amber-500 to-amber-700',
            notes: 'Excel aktarımı ile eklendi'
          });
        });

        resolve({ workers, attendance: [] });
      } catch (err: any) {
        reject(new Error(err.message || 'Dosya ayrıştırılamadı.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Dosya okunamadı.'));
    };

    if (isXmlOrPdks) {
      reader.readAsText(file, 'utf-8');
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
}

/**
 * Downloads a pre-formatted Sample Excel template for staff import
 */
export function downloadSampleWorkerExcel() {
  const sampleData = [
    {
      'Sicil No': 'PRS-001',
      'Kart No': '1001',
      'Adı': 'Ahmet',
      'Soyadı': 'Yılmaz',
      'TC Kimlik No': '12345678901',
      'Departman': 'Talaşlı İmalat',
      'Görevi': 'CNC Freze Ustası',
      'Günlük Ücret (₺)': 1800,
      'Saatlik Mesai (₺)': 337.50,
      'Telefon': '0532 111 22 33',
      'IBAN': 'TR120006200000000123456789',
      'İşe Başlama Tarihi': '2024-01-15'
    },
    {
      'Sicil No': 'PRS-002',
      'Kart No': '1002',
      'Adı': 'Mehmet',
      'Soyadı': 'Kaya',
      'TC Kimlik No': '23456789012',
      'Departman': 'Kaynak Atölyesi',
      'Görevi': 'TIG/MIG Kaynakçı',
      'Günlük Ücret (₺)': 1650,
      'Saatlik Mesai (₺)': 309.38,
      'Telefon': '0533 222 33 44',
      'IBAN': 'TR450006200000000987654321',
      'İşe Başlama Tarihi': '2024-03-01'
    },
    {
      'Sicil No': 'PRS-003',
      'Kart No': '1003',
      'Adı': 'Mustafa',
      'Soyadı': 'Demir',
      'TC Kimlik No': '34567890123',
      'Departman': 'Montaj & Test',
      'Görevi': 'Mekanik Montaj Ustası',
      'Günlük Ücret (₺)': 1700,
      'Saatlik Mesai (₺)': 318.75,
      'Telefon': '0535 333 44 55',
      'IBAN': 'TR880006200000000555444333',
      'İşe Başlama Tarihi': '2023-11-20'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Personel Listesi');

  const colWidths = [
    { wch: 12 },
    { wch: 10 },
    { wch: 14 },
    { wch: 14 },
    { wch: 16 },
    { wch: 20 },
    { wch: 24 },
    { wch: 18 },
    { wch: 18 },
    { wch: 16 },
    { wch: 30 },
    { wch: 18 },
  ];
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, 'YNR_Makine_Ornek_Personel_Sablonu.xlsx');
}
