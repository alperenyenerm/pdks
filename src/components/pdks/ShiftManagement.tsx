import React, { useState } from 'react';
import { Clock, Plus, Settings, Moon, Sun } from 'lucide-react';
import type { ShiftDefinition } from '../../types';

interface ShiftManagementProps {
  shifts: ShiftDefinition[];
  onSaveShift: (shift: ShiftDefinition) => void;
  onDeleteShift: (id: string) => void;
}

export const ShiftManagement: React.FC<ShiftManagementProps> = ({
  shifts,
  onSaveShift,
  onDeleteShift
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftDefinition | null>(null);

  const [code, setCode] = useState('VARD_01');
  const [name, setName] = useState('Gündüz Vardiyası');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('18:00');
  const [breakDurationMinutes, setBreakDurationMinutes] = useState(60);
  const [latenessToleranceMinutes, setLatenessToleranceMinutes] = useState(5);
  const [earlyExitToleranceMinutes, setEarlyExitToleranceMinutes] = useState(15);
  const [isNightShift, setIsNightShift] = useState(false);
  const [nightBonusRatePercent, setNightBonusRatePercent] = useState(20);
  const [colorTag, setColorTag] = useState('#3b82f6');

  const handleOpenNew = () => {
    setEditingShift(null);
    setCode(`VARD_0${shifts.length + 1}`);
    setName('');
    setStartTime('08:00');
    setEndTime('18:00');
    setBreakDurationMinutes(60);
    setLatenessToleranceMinutes(5);
    setEarlyExitToleranceMinutes(15);
    setIsNightShift(false);
    setNightBonusRatePercent(20);
    setColorTag('#3b82f6');
    setShowModal(true);
  };

  const handleOpenEdit = (shift: ShiftDefinition) => {
    setEditingShift(shift);
    setCode(shift.code);
    setName(shift.name);
    setStartTime(shift.startTime);
    setEndTime(shift.endTime);
    setBreakDurationMinutes(shift.breakDurationMinutes);
    setLatenessToleranceMinutes(shift.latenessToleranceMinutes);
    setEarlyExitToleranceMinutes(shift.earlyExitToleranceMinutes);
    setIsNightShift(shift.isNightShift);
    setNightBonusRatePercent(shift.nightBonusRatePercent || 20);
    setColorTag(shift.colorTag || '#3b82f6');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveShift({
      id: editingShift ? editingShift.id : `shift_${Date.now()}`,
      code,
      name,
      startTime,
      endTime,
      breakDurationMinutes: Number(breakDurationMinutes),
      latenessToleranceMinutes: Number(latenessToleranceMinutes),
      earlyExitToleranceMinutes: Number(earlyExitToleranceMinutes),
      isNightShift,
      nightBonusRatePercent: isNightShift ? Number(nightBonusRatePercent) : 0,
      colorTag
    });
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/90 p-5 rounded-xl border border-slate-700/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <Clock className="w-5 h-5 text-indigo-400" />
            Vardiya & Çalışma Planı Yönetimi
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Vardiya Tanımları ve Tolerans Ayarları</h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Giriş-çıkış saatleri, geç kalma toleransı, yemek molası ve gece vardiyası prim kuralları.
          </p>
        </div>
        <button 
          onClick={handleOpenNew}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition shadow flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Yeni Vardiya Ekle
        </button>
      </div>

      {/* Default Shifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {shifts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
            Tanımlı vardiya bulunamadı. Lütfen "Yeni Vardiya Ekle" butonu ile oluşturun.
          </div>
        ) : (
          shifts.map(shift => (
            <div 
              key={shift.id}
              className="bg-slate-800/90 border border-slate-700/60 rounded-xl p-5 shadow-sm hover:border-slate-600 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span 
                    className="px-2.5 py-0.5 rounded text-xs font-bold text-white uppercase tracking-wider"
                    style={{ backgroundColor: shift.colorTag || '#3b82f6' }}
                  >
                    {shift.code}
                  </span>
                  {shift.isNightShift ? (
                    <span className="flex items-center gap-1 text-xs text-purple-400 font-semibold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                      <Moon className="w-3.5 h-3.5" />
                      Gece Vardiyası
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      <Sun className="w-3.5 h-3.5" />
                      Gündüz Vardiyası
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white">{shift.name}</h3>

                <div className="mt-4 space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-700/50">
                    <span className="text-slate-400">Çalışma Saatleri:</span>
                    <span className="font-mono font-bold text-white">{shift.startTime} - {shift.endTime}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-700/50">
                    <span className="text-slate-400">Yemek / Ara Mola:</span>
                    <span className="font-semibold text-slate-200">{shift.breakDurationMinutes} Dakika</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-700/50">
                    <span className="text-slate-400">Geç Kalma Toleransı:</span>
                    <span className="font-semibold text-emerald-400">{shift.latenessToleranceMinutes} Dk</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-700/50">
                    <span className="text-slate-400">Erken Çıkış Toleransı:</span>
                    <span className="font-semibold text-emerald-400">{shift.earlyExitToleranceMinutes} Dk</span>
                  </div>
                  {shift.isNightShift && (
                    <div className="flex justify-between py-1 border-b border-slate-700/50">
                      <span className="text-slate-400">Gece Primi Oranı:</span>
                      <span className="font-semibold text-purple-300">+{shift.nightBonusRatePercent}%</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-700/60 flex justify-end gap-2">
                <button 
                  onClick={() => handleOpenEdit(shift)}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-medium transition"
                >
                  Düzenle
                </button>
                <button 
                  onClick={() => onDeleteShift(shift.id)}
                  className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded text-xs font-medium transition border border-rose-500/20"
                >
                  Sil
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Shift Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-400" />
              {editingShift ? 'Vardiya Düzenle' : 'Yeni Vardiya Tanımla'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Vardiya Kodu</label>
                  <input 
                    type="text"
                    required
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Vardiya Adı</label>
                  <input 
                    type="text"
                    required
                    placeholder="Örn: Gündüz Vardiyası"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Başlangıç Saati</label>
                  <input 
                    type="time"
                    required
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Bitiş Saati</label>
                  <input 
                    type="time"
                    required
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Mola (Dk)</label>
                  <input 
                    type="number"
                    value={breakDurationMinutes}
                    onChange={e => setBreakDurationMinutes(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Geç Tolerans (Dk)</label>
                  <input 
                    type="number"
                    value={latenessToleranceMinutes}
                    onChange={e => setLatenessToleranceMinutes(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Erken Tolerans (Dk)</label>
                  <input 
                    type="number"
                    value={earlyExitToleranceMinutes}
                    onChange={e => setEarlyExitToleranceMinutes(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-700 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Gece Vardiyası Özelliği</div>
                  <div className="text-[11px] text-slate-400">18:00 sonrası çalışmalar için zamlı prim</div>
                </div>
                <input 
                  type="checkbox"
                  checked={isNightShift}
                  onChange={e => setIsNightShift(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-800 border-slate-700"
                />
              </div>

              {isNightShift && (
                <div>
                  <label className="block text-xs font-semibold text-purple-300 uppercase mb-1">Gece Zam Primi Oranı (%)</label>
                  <input 
                    type="number"
                    value={nightBonusRatePercent}
                    onChange={e => setNightBonusRatePercent(Number(e.target.value))}
                    placeholder="Örn: 20"
                    className="w-full bg-slate-900 border border-purple-500/50 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition"
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition shadow"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
