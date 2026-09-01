import * as XLSX from 'xlsx';
import type { Worker } from '../types';

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
 * Parses uploaded Excel (.xlsx, .xls, .csv) file and extracts valid Worker list
 */
export async function parseWorkersFromExcel(file: File): Promise<Worker[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('Excel dosyasında geçerli bir çalışma sayfası bulunamadı.');
        }

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          throw new Error('Excel dosyasında okunabilir veri bulunamadı.');
        }

        const workers: Worker[] = [];
        const timestamp = Date.now();

        rawJson.forEach((row, idx) => {
          // Normalize row keys
          const normRow: { [key: string]: any } = {};
          Object.keys(row).forEach((key) => {
            normRow[normalizeHeader(key)] = row[key];
          });

          // Helper to get matching key
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

          // Skip completely blank rows
          if (!firstName && !lastName && !fullName) {
            return;
          }

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
            if (!isNaN(parsedRate) && parsedRate > 0) {
              dailyRate = parsedRate;
            }
          }

          const rawOvertime = getVal(['mesaiucreti', 'saatlikmesai', 'overtimehourlyrate', 'overtime_hourly_rate']);
          let overtimeHourlyRate = Math.round((dailyRate / 8) * 1.5);
          if (rawOvertime) {
            const parsedOt = parseFloat(rawOvertime.replace(/[^0-9.,]/g, '').replace(',', '.'));
            if (!isNaN(parsedOt) && parsedOt > 0) {
              overtimeHourlyRate = parsedOt;
            }
          }

          const rawStartDate = getVal(['giristarihi', 'isebaslama', 'baslamatarihi', 'startdate', 'start_date']);
          let startDate = new Date().toISOString().slice(0, 10);
          if (rawStartDate) {
            // Check if Excel serial date number
            if (!isNaN(Number(rawStartDate)) && Number(rawStartDate) > 20000) {
              try {
                const dateObj = new Date((Number(rawStartDate) - (25567 + 2)) * 86400 * 1000);
                startDate = dateObj.toISOString().slice(0, 10);
              } catch (e) {
                // fallback
              }
            } else if (rawStartDate.includes('.') || rawStartDate.includes('/')) {
              const parts = rawStartDate.split(/[./-]/);
              if (parts.length === 3) {
                // DD.MM.YYYY -> YYYY-MM-DD
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

          const worker: Worker = {
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
          };

          workers.push(worker);
        });

        resolve(workers);
      } catch (err: any) {
        reject(new Error(err.message || 'Excel dosyası ayrıştırılamadı.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Dosya okunamadı.'));
    };

    reader.readAsArrayBuffer(file);
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

  // Auto-fit column widths
  const colWidths = [
    { wch: 12 }, // Sicil No
    { wch: 10 }, // Kart No
    { wch: 14 }, // Adı
    { wch: 14 }, // Soyadı
    { wch: 16 }, // TC Kimlik No
    { wch: 20 }, // Departman
    { wch: 24 }, // Görevi
    { wch: 18 }, // Günlük Ücret
    { wch: 18 }, // Saatlik Mesai
    { wch: 16 }, // Telefon
    { wch: 30 }, // IBAN
    { wch: 18 }, // İşe Başlama Tarihi
  ];
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, 'YNR_Makine_Ornek_Personel_Sablonu.xlsx');
}
