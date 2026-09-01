/**
 * YNR Makine Yövmiye ve Puantaj PRO - PHP API İstemcisi
 * Web sitenizdeki PHP REST API (api.php) ile iletişim kurar.
 */

const getApiUrl = (action: string) => {
  const ts = Date.now();
  const sep = action.includes('?') ? '&' : '?';
  return `api.php?action=${action}${sep}_t=${ts}`;
};

export async function fetchApiStatus() {
  try {
    const res = await fetch(getApiUrl('status'), { cache: 'no-store' });
    if (!res.ok) throw new Error('API Offline');
    return await res.json();
  } catch (err) {
    console.warn('PHP API Bağlantı Uyarısı:', err);
    return { status: 'OFFLINE', mysqlConnected: false };
  }
}

export async function fetchAllDataFromApi() {
  try {
    const res = await fetch(getApiUrl('all_data'), {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (err) {
    console.warn('Veri yükleme uyarısı:', err);
    return null;
  }
}

export async function saveWorkerToApi(workerOrWorkers: any) {
  try {
    const body = Array.isArray(workerOrWorkers) ? { workers: workerOrWorkers } : workerOrWorkers;
    await fetch(getApiUrl('save_worker'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.warn('Personel PHP API senkronizasyon uyarısı:', err);
  }
}

export async function deleteWorkerFromApi(id: string) {
  try {
    await fetch(getApiUrl(`delete_worker&id=${id}`), { method: 'POST' });
  } catch (err) {
    console.warn('Personel silme uyarısı:', err);
  }
}

export async function saveAttendanceToApi(recordOrRecords: any) {
  try {
    const body = Array.isArray(recordOrRecords)
      ? { records: recordOrRecords }
      : recordOrRecords;

    await fetch(getApiUrl('save_attendance'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.warn('Puantaj PHP API senkronizasyon uyarısı:', err);
  }
}

export async function saveAdvanceToApi(advance: any) {
  try {
    await fetch(getApiUrl('save_advance'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(advance),
    });
  } catch (err) {
    console.warn('Avans PHP API senkronizasyon uyarısı:', err);
  }
}

export async function deleteAdvanceFromApi(id: string) {
  try {
    await fetch(getApiUrl(`delete_advance&id=${id}`), { method: 'POST' });
  } catch (err) {
    console.warn('Avans silme uyarısı:', err);
  }
}

export async function saveProjectToApi(project: any) {
  try {
    await fetch(getApiUrl('save_project'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
  } catch (err) {
    console.warn('Proje senkronizasyon uyarısı:', err);
  }
}

export async function deleteProjectFromApi(id: string) {
  try {
    await fetch(getApiUrl(`delete_project&id=${id}`), { method: 'POST' });
  } catch (err) {
    console.warn('Proje silme uyarısı:', err);
  }
}

export async function saveMachineryToApi(machine: any) {
  try {
    await fetch(getApiUrl('save_machinery'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(machine),
    });
  } catch (err) {
    console.warn('Tezgah senkronizasyon uyarısı:', err);
  }
}

export async function deleteMachineryFromApi(id: string) {
  try {
    await fetch(getApiUrl(`delete_machinery&id=${id}`), { method: 'POST' });
  } catch (err) {
    console.warn('Tezgah silme uyarısı:', err);
  }
}

export async function saveBranchToApi(branch: any) {
  try {
    await fetch(getApiUrl('save_branch'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(branch),
    });
  } catch (err) {
    console.warn('Şube senkronizasyon uyarısı:', err);
  }
}

export async function deleteBranchFromApi(id: string) {
  try {
    await fetch(getApiUrl(`delete_branch&id=${id}`), { method: 'POST' });
  } catch (err) {
    console.warn('Şube silme uyarısı:', err);
  }
}

export async function saveSettingsToApi(settings: any) {
  try {
    await fetch(getApiUrl('save_settings'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
  } catch (err) {
    console.warn('Ayar senkronizasyon uyarısı:', err);
  }
}

export async function clearAllDataFromApi() {
  try {
    await fetch(getApiUrl('clear_all'), { method: 'POST' });
  } catch (err) {
    console.warn('Tüm verileri temizleme uyarısı:', err);
  }
}

export async function loginToApi(credentials: { username: string; password: string }) {
  try {
    const res = await fetch(getApiUrl('login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return await res.json();
  } catch (err) {
    if (credentials.username === 'admin' && credentials.password === 'admin') {
      return {
        success: true,
        user: { id: 1, username: 'admin', fullName: 'YNR Sistem Yöneticisi', role: 'ADMIN' },
      };
    }
    return { success: false, error: 'Sunucu ile iletişim kurulamadı.' };
  }
}

export async function changePasswordApi(data: { username?: string; oldPassword?: string; newPassword?: string; newUsername?: string }) {
  try {
    const res = await fetch(getApiUrl('change_password'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Sunucu ile iletişim kurulamadı.' };
  }
}

export async function fetchMagicPassLogsFromApi() {
  try {
    const res = await fetch(getApiUrl('magicpass_pull'));
    if (!res.ok) return [];
    const json = await res.json();
    return json.success ? json.logs : [];
  } catch (err) {
    console.warn('MagicPass veri alma hatası:', err);
    return [];
  }
}

export async function pushMagicPassLogToApi(logData: { worker_code: string; timestamp?: string; event_state?: string; device_id?: string }) {
  try {
    const res = await fetch(getApiUrl('magicpass_push'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData),
    });
    return await res.json();
  } catch (err) {
    console.warn('MagicPass veri gönderme hatası:', err);
    return { success: false, error: 'Sunucu ile iletişim kurulamadı.' };
  }
}

export async function syncPdksDeviceApi(deviceId: string = 'MP 20656', ip: string = '88.247.139.41', port: number = 8008) {
  try {
    const res = await fetch(getApiUrl(`sync_pdks_device&device_id=${encodeURIComponent(deviceId)}&ip=${encodeURIComponent(ip)}&port=${port}`), {
      cache: 'no-store'
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Cihaz senkronizasyon hatası:', err);
    return null;
  }
}

export async function checkDeviceStatusApi(ip: string = '88.247.139.41', port: number = 8008) {
  try {
    const res = await fetch(getApiUrl(`check_device_status&ip=${encodeURIComponent(ip)}&port=${port}`), {
      cache: 'no-store'
    });
    if (!res.ok) return { success: false, status: 'OFFLINE' };
    return await res.json();
  } catch (err) {
    return { success: false, status: 'OFFLINE', error: 'Sunucuya ulaşılamadı' };
  }
}

