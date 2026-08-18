import React from 'react';
import { useApp } from '../../context/AppContext';
import { getMonthNameTr, formatCurrency } from '../../utils/calculations';
import {
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Briefcase,
  ArrowUpRight,
  UserCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const Dashboard: React.FC = () => {
  const {
    workers,
    selectedMonth,
    selectedYear,
    monthlySummaries,
    attendance,
    advances,
    setActiveTab,
  } = useApp();

  const totalGross = monthlySummaries.reduce((acc, curr) => acc + curr.totalGrossEarnings, 0);
  const totalBaseWage = monthlySummaries.reduce((acc, curr) => acc + curr.baseWageEarnings, 0);
  const totalOvertimeEarn = monthlySummaries.reduce((acc, curr) => acc + curr.overtimeEarnings, 0);
  const totalOvertimeHours = monthlySummaries.reduce((acc, curr) => acc + curr.totalOvertimeHours, 0);
  const totalAdvances = monthlySummaries.reduce((acc, curr) => acc + curr.totalAdvancesPaid, 0);
  const totalNet = monthlySummaries.reduce((acc, curr) => acc + curr.netPayable, 0);

  // Today stats (e.g. 2026-08-12 or 10th of selected month)
  const todayStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-10`; // Sample day
  const todayRecords = attendance.filter((a) => a.date === todayStr);

  const todayFull = todayRecords.filter((r) => r.type === 'FULL').length;
  const todayHalf = todayRecords.filter((r) => r.type === 'HALF').length;
  const todayLeave = todayRecords.filter((r) => r.type === 'LEAVE' || r.type === 'REPORT').length;
  const todayAbsent = todayRecords.filter((r) => r.type === 'ABSENT').length;

  // Chart 1: Department Cost Distribution
  const deptMap: { [key: string]: { name: string; cost: number; hours: number } } = {};
  monthlySummaries.forEach((s) => {
    const dept = s.worker.department || 'Diğer';
    if (!deptMap[dept]) {
      deptMap[dept] = { name: dept, cost: 0, hours: 0 };
    }
    deptMap[dept].cost += s.totalGrossEarnings;
    deptMap[dept].hours += s.totalOvertimeHours;
  });
  const deptData = Object.values(deptMap);

  // Chart 2: Top Overtime Workers
  const topOvertimeData = [...monthlySummaries]
    .sort((a, b) => b.totalOvertimeHours - a.totalOvertimeHours)
    .slice(0, 5)
    .map((s) => ({
      name: `${s.worker.firstName} ${s.worker.lastName.charAt(0)}.`,
      mesaiSaat: s.totalOvertimeHours,
      mesaiUcret: s.overtimeEarnings,
    }));

  // Chart 3: Attendance Status Distribution
  const totalFull = monthlySummaries.reduce((a, c) => a + c.fullDays, 0);
  const totalHalf = monthlySummaries.reduce((a, c) => a + c.halfDays, 0);
  const totalLeave = monthlySummaries.reduce((a, c) => a + c.leaveDays + c.reportDays, 0);
  const totalAbsent = monthlySummaries.reduce((a, c) => a + c.absentDays, 0);

  const pieData = [
    { name: 'Tam Gün (1.0)', value: totalFull, color: '#10b981' },
    { name: 'Yarım Gün (0.5)', value: totalHalf, color: '#3b82f6' },
    { name: 'İzinli / Raporlu', value: totalLeave, color: '#f59e0b' },
    { name: 'Gelmedi (Devamsız)', value: totalAbsent, color: '#f43f5e' },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950/40 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>YNR MAKİNE OPERASYON PANORAMASI</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {getMonthNameTr(selectedMonth)} {selectedYear} Dönemi Puantaj Özeti
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Atölye ve imalat kadrosunun çalışma süreleri, mesai saatleri ve net maaş hakedişlerinin anlık finansal dökümü.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('attendance')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition shadow-lg shadow-amber-500/20 flex items-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Puantaj Tablosuna Git</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Toplam Brüt Hakediş</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-white font-mono">{formatCurrency(totalGross)}</p>
            <div className="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800 flex-wrap gap-1">
              <span className="whitespace-nowrap">Yövmiye: {formatCurrency(totalBaseWage)}</span>
              <span className="text-amber-400 font-semibold whitespace-nowrap">Mesai: {formatCurrency(totalOvertimeEarn)}</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Toplam Fazla Mesai</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-amber-400 font-mono">
              {totalOvertimeHours} <span className="text-sm font-normal text-slate-400">Saat</span>
            </p>
            <div className="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800">
              <span>Mesai Ücreti Tutarı:</span>
              <span className="font-semibold text-emerald-400">{formatCurrency(totalOvertimeEarn)}</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Ödenen Toplam Avans</span>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-rose-400 font-mono">{formatCurrency(totalAdvances)}</p>
            <div className="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800">
              <span>Avans Adedi: {advances.length} işlem</span>
              <button
                onClick={() => setActiveTab('advances')}
                className="text-amber-400 hover:underline flex items-center gap-0.5"
              >
                <span>Detay</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden bg-gradient-to-b from-amber-500/5 to-transparent">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-300">Kalan Net Ödenecek Maaş</span>
            <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-400 border border-amber-400/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-amber-400 font-mono">{formatCurrency(totalNet)}</p>
            <div className="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800">
              <span>{workers.filter((w) => w.status === 'active').length} Personel Dağılımı</span>
              <span className="text-emerald-400 font-semibold">Hazır</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Today's Status & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today Attendance Snapshot */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-400" />
                Günün Puantaj Özeti
              </h3>
              <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
                10 {getMonthNameTr(selectedMonth)} {selectedYear}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800 flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <div>
                  <p className="text-xs text-slate-400">Tam Gün</p>
                  <p className="text-lg font-bold text-white font-mono">{todayFull} kişi</p>
                </div>
              </div>

              <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800 flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <div>
                  <p className="text-xs text-slate-400">Yarım Gün</p>
                  <p className="text-lg font-bold text-white font-mono">{todayHalf} kişi</p>
                </div>
              </div>

              <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800 flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div>
                  <p className="text-xs text-slate-400">İzinli / Raporlu</p>
                  <p className="text-lg font-bold text-white font-mono">{todayLeave} kişi</p>
                </div>
              </div>

              <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800 flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <div>
                  <p className="text-xs text-slate-400">Gelmedi (Devamsız)</p>
                  <p className="text-lg font-bold text-white font-mono">{todayAbsent} kişi</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={() => setActiveTab('attendance')}
              className="w-full bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold py-2.5 rounded-xl text-xs transition border border-slate-700 flex items-center justify-center space-x-2"
            >
              <span>Bugünkü Puantajları Düzenle</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chart 1: Department Cost Distribution */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-amber-400" />
              Departman Bazlı Maliyet Dağılımı (₺)
            </h3>
            <span className="text-xs text-slate-400">Brüt Hakediş</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                  }}
                  formatter={(value: any) => [formatCurrency(value), 'Maliyet']}
                />
                <Bar dataKey="cost" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section: Top Overtime & Attendance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top 5 Overtime Workers */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              En Çok Fazla Mesai Yapan Personeller
            </h3>
            <span className="text-xs text-amber-400 font-mono">Top 5</span>
          </div>

          <div className="space-y-3">
            {topOvertimeData.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 text-xs font-bold font-mono flex items-center justify-center border border-amber-400/30">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">{item.name}</p>
                    <p className="text-xs text-slate-400">
                      Mesai Ücreti: {formatCurrency(item.mesaiUcret)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-amber-400 font-mono">
                    {item.mesaiSaat} Saat
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Distribution Pie Chart */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              Aylık Devam & Puantaj Dağılım Oranı
            </h3>
            <span className="text-xs text-slate-400">Toplam Günler</span>
          </div>

          <div className="h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-300 font-medium truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
