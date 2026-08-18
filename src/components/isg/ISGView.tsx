import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { ISGEquipment, ISGCertificate } from '../../types';
import {
  ShieldAlert,
  ShieldCheck,
  Award,
  AlertTriangle,
  Plus,
  Printer,
  CheckCircle2,
  Search,
  HardHat,
  User,
} from 'lucide-react';

export const ISGView: React.FC = () => {
  const { workers, notify } = useApp();

  const [activeTab, setActiveTab] = useState<'equipment' | 'certificates'>('equipment');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Initial Mock ISG Equipment & Certificates for YNR Makine
  const [equipmentList, setEquipmentList] = useState<ISGEquipment[]>([
    {
      id: 'eq-1',
      workerId: workers[0]?.id || 'w1',
      equipmentName: 'S3 Çelik Burunlu Kompozit İş Ayakkabısı (42 No)',
      category: 'AYAKKABI',
      issueDate: '2025-09-10',
      expiryDate: '2026-09-10',
      status: 'VALID',
      sizeOrSerial: '42 Numara',
      signedByWorker: true,
    },
    {
      id: 'eq-2',
      workerId: workers[1]?.id || 'w2',
      equipmentName: 'Otomatik Kararan Profesyonel Kaynak Maskesi',
      category: 'MASKE',
      issueDate: '2024-05-15',
      expiryDate: '2026-08-15',
      status: 'WARNING',
      sizeOrSerial: 'SN-98210',
      signedByWorker: true,
    },
    {
      id: 'eq-3',
      workerId: workers[2]?.id || 'w3',
      equipmentName: 'Vidalı Çene Ayarlı Endüstriyel Baret (Sarı)',
      category: 'BARET',
      issueDate: '2023-01-10',
      expiryDate: '2025-01-10',
      status: 'EXPIRED',
      sizeOrSerial: 'YNR-BARET-04',
      signedByWorker: false,
    },
    {
      id: 'eq-4',
      workerId: workers[3]?.id || 'w4',
      equipmentName: '3M SNR 35dB Gürültü Önleyici İş Kulaklığı',
      category: 'KULAKLIK',
      issueDate: '2026-02-01',
      expiryDate: '2027-02-01',
      status: 'VALID',
      sizeOrSerial: '3M-OPTIME3',
      signedByWorker: true,
    },
  ]);

  const [certificateList] = useState<ISGCertificate[]>([
    {
      id: 'cert-1',
      workerId: workers[0]?.id || 'w1',
      certificateName: 'MYK Gazaltı Kaynakçısı Seviye 4 Yeterlilik Belgesi',
      issuingInstitution: 'TSE / MYK Kurumu',
      issueDate: '2023-04-12',
      expiryDate: '2028-04-12',
      status: 'VALID',
      certificateNo: 'MYK-2023-98120',
    },
    {
      id: 'cert-2',
      workerId: workers[1]?.id || 'w2',
      certificateName: 'Endüstriyel Yüksekte Çalışma & İskele Sertifikası',
      issuingInstitution: 'İSG Akademi A.Ş.',
      issueDate: '2024-08-20',
      expiryDate: '2026-08-20',
      status: 'WARNING',
      certificateNo: 'ISG-YUK-8841',
    },
    {
      id: 'cert-3',
      workerId: workers[2]?.id || 'w3',
      certificateName: 'Periyodik Akciğer Grafisi & İş Sağlığı Raporu',
      issuingInstitution: 'İOSB Ortak Sağlık Güvenlik Birimi (OSGB)',
      issueDate: '2025-01-15',
      expiryDate: '2026-01-15',
      status: 'EXPIRED',
      certificateNo: 'OSGB-SAGLIK-2025/14',
    },
  ]);

  // Form State for Add Modal
  const [newWorkerId, setNewWorkerId] = useState(workers[0]?.id || '');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'AYAKKABI' | 'BARET' | 'MASKE' | 'ELBİSE' | 'KULAKLIK'>('AYAKKABI');
  const [newIssueDate, setNewIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [newExpiryDate] = useState('2027-08-12');

  const handleAddEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const item: ISGEquipment = {
      id: `eq-${Date.now()}`,
      workerId: newWorkerId,
      equipmentName: newTitle,
      category: newCategory,
      issueDate: newIssueDate,
      expiryDate: newExpiryDate,
      status: 'VALID',
      signedByWorker: true,
    };

    setEquipmentList([item, ...equipmentList]);
    setIsAddModalOpen(false);
    setNewTitle('');
    notify('İSG Zimmeti Eklendi', 'Yeni ekipman zimmet kaydı başarıyla oluşturuldu.', 'success');
  };

  const warningCount = equipmentList.filter((e) => e.status === 'WARNING').length + certificateList.filter((c) => c.status === 'WARNING').length;
  const expiredCount = equipmentList.filter((e) => e.status === 'EXPIRED').length + certificateList.filter((c) => c.status === 'EXPIRED').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Summary */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <HardHat className="w-6 h-6 text-amber-400" />
            İş Sağlığı ve Güvenliği (İSG) Ekipman Zimmet & Sertifika Paneli
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Atölye ve şantiye personellerinin kişisel koruyucu donanım (KKD) zimmetlerini ve zorunlu İSG sertifika geçerlilik sürelerini takip edin.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Zimmet Tutanağı Yazdır</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Zimmet / Sertifika Ekle</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center space-x-4 shadow">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Aktif Zimmetli Ekipman</p>
            <p className="text-xl font-bold text-white font-mono mt-0.5">{equipmentList.length} Adet</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 flex items-center space-x-4 shadow bg-amber-500/5">
          <div className="p-3 rounded-xl bg-amber-400/20 text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-amber-300">Yaklaşan Yenilemeler (30 Gün)</p>
            <p className="text-xl font-bold text-amber-400 font-mono mt-0.5">{warningCount} İkaz</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-4 flex items-center space-x-4 shadow bg-rose-500/5">
          <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-rose-300">Süresi Dolmuş / Yenilenmeli</p>
            <p className="text-xl font-bold text-rose-400 font-mono mt-0.5">{expiredCount} Kritik</p>
          </div>
        </div>
      </div>

      {/* Tabs Selector & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-2 rounded-2xl">
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('equipment')}
            className={`flex-1 sm:flex-none py-2 px-4 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'equipment'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <HardHat className="w-4 h-4" />
            <span>Ekipman Zimmet Takibi (KKD)</span>
          </button>

          <button
            onClick={() => setActiveTab('certificates')}
            className={`flex-1 sm:flex-none py-2 px-4 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'certificates'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>İSG Sertifika & Sağlık Raporları</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Personel veya ekipman ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* TAB 1: EQUIPMENT ZİMMET LIST */}
      {activeTab === 'equipment' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Personel</th>
                <th className="p-3">Ekipman & KKD Adı</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Veriliş Tarihi</th>
                <th className="p-3">Son Yenileme Tarihi</th>
                <th className="p-3 text-center">İmza Durumu</th>
                <th className="p-3 text-center">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {equipmentList.map((eq) => {
                const worker = workers.find((w) => w.id === eq.workerId);
                return (
                  <tr key={eq.id} className="hover:bg-slate-800/40">
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-amber-400">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-bold text-white">
                            {worker ? `${worker.firstName} ${worker.lastName}` : 'Bilinmeyen Personel'}
                          </p>
                          <p className="text-[10px] text-slate-400">{worker?.role}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3 font-semibold text-slate-200">
                      {eq.equipmentName}
                      {eq.sizeOrSerial && (
                        <span className="block text-[10px] text-slate-400 font-mono">Beden/No: {eq.sizeOrSerial}</span>
                      )}
                    </td>

                    <td className="p-3 font-mono">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-bold">
                        {eq.category}
                      </span>
                    </td>

                    <td className="p-3 font-mono text-slate-400">{eq.issueDate}</td>
                    <td className="p-3 font-mono font-bold text-amber-400">{eq.expiryDate}</td>

                    <td className="p-3 text-center">
                      {eq.signedByWorker ? (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> İmzalandı
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                          İmza Bekliyor
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-center">
                      {eq.status === 'VALID' && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[10px]">
                          Geçerli
                        </span>
                      )}
                      {eq.status === 'WARNING' && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[10px] animate-pulse">
                          Yenilenmeli
                        </span>
                      )}
                      {eq.status === 'EXPIRED' && (
                        <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 font-bold text-[10px]">
                          Süresi Doldu!
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: CERTIFICATES */}
      {activeTab === 'certificates' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Personel</th>
                <th className="p-3">Sertifika & Belge Adı</th>
                <th className="p-3">Düzenleyen Kurum</th>
                <th className="p-3">Belge No</th>
                <th className="p-3">Geçerlilik Tarihi</th>
                <th className="p-3 text-center">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {certificateList.map((cert) => {
                const worker = workers.find((w) => w.id === cert.workerId);
                return (
                  <tr key={cert.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-white">
                      {worker ? `${worker.firstName} ${worker.lastName}` : 'Personel'}
                    </td>
                    <td className="p-3 font-semibold text-amber-300">{cert.certificateName}</td>
                    <td className="p-3 text-slate-400">{cert.issuingInstitution}</td>
                    <td className="p-3 font-mono text-slate-300">{cert.certificateNo}</td>
                    <td className="p-3 font-mono font-bold text-emerald-400">{cert.expiryDate}</td>
                    <td className="p-3 text-center">
                      {cert.status === 'VALID' && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[10px]">
                          Geçerli Belge
                        </span>
                      )}
                      {cert.status === 'WARNING' && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[10px]">
                          Son 30 Gün!
                        </span>
                      )}
                      {cert.status === 'EXPIRED' && (
                        <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 font-bold text-[10px]">
                          Süresi Doldu!
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD ISG ITEM MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddEquipment}
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HardHat className="w-5 h-5 text-amber-400" />
              Yeni İSG Ekipman Zimmeti Tanımla
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Personel Seçiniz:</label>
                <select
                  value={newWorkerId}
                  onChange={(e) => setNewWorkerId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.firstName} {w.lastName} ({w.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Ekipman / KKD Tanımı:</label>
                <input
                  type="text"
                  placeholder="ör. S3 Çelik Burunlu İş Ayakkabısı"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Kategori:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="AYAKKABI">Ayakkabı</option>
                    <option value="BARET">Baret</option>
                    <option value="MASKE">Kaynak Maskesi</option>
                    <option value="ELBİSE">İş Elbisesi</option>
                    <option value="KULAKLIK">Kulaklık</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Teslim Tarihi:</label>
                  <input
                    type="date"
                    value={newIssueDate}
                    onChange={(e) => setNewIssueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
              >
                Zimmeti Kaydet
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
