import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './components/dashboard/Dashboard';
import { AttendanceMatrix } from './components/attendance/AttendanceMatrix';
import { WorkerManagement } from './components/workers/WorkerManagement';
import { AdvancesPayments } from './components/advances/AdvancesPayments';
import { ProjectTracking } from './components/projects/ProjectTracking';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { CheckInTerminal } from './components/terminal/CheckInTerminal';
import { MachineryCostCenter } from './components/machinery/MachineryCostCenter';
import { PublicHolidaysView } from './components/holidays/PublicHolidaysView';
import { AuditLogsView } from './components/audit/AuditLogsView';
import { PerformanceView } from './components/performance/PerformanceView';
import { BranchManagement } from './components/branches/BranchManagement';
import { ISGView } from './components/isg/ISGView';
import { LoginView } from './components/auth/LoginView';
import { ToastNotificationContainer } from './components/ui/ToastNotification';
import { PDKSDashboard } from './components/pdks/PDKSDashboard';
import { PDKSHareketler } from './components/pdks/PDKSHareketler';
import { ShiftManagement } from './components/pdks/ShiftManagement';
import { PDKSReports } from './components/pdks/PDKSReports';
import { OvertimeApprovalView } from './components/pdks/OvertimeApprovalView';
import { BulkOperationsView } from './components/pdks/BulkOperationsView';
import { PayrollSlipsView } from './components/pdks/PayrollSlipsView';
import { PDKSDevicesView } from './components/pdks/PDKSDevicesView';
import { PDKSReportCatalog } from './components/pdks/PDKSReportCatalog';
import { PDKSDefinitionsView } from './components/pdks/PDKSDefinitionsView';
import { PDKSWorkPlanSchedule } from './components/pdks/PDKSWorkPlanSchedule';
import { PDKSDataImportView } from './components/pdks/PDKSDataImportView';

const MainContent: React.FC = () => {
  const { 
    activeTab, setActiveTab, workers, pdksLogs, pdksShifts, 
    pdksDailySummary, overtimeApprovals, bulkOperations, settings, monthlySummaries, branches,
    addPDKSLog, saveShift, deleteShift, approveOvertime, rejectOvertime,
    applySalaryRaise, applyBulkLeave, syncDeviceLogs
  } = useApp();

  switch (activeTab) {
    case 'pdks_import':
      return (
        <PDKSDataImportView 
          workers={workers}
          onImportSuccess={(_count) => syncDeviceLogs('ALL')}
        />
      );
    case 'pdks_devices':
      return (
        <PDKSDevicesView 
          devices={[{
            id: '1',
            name: 'MP 20656',
            model: 'MAGIC PASS 20656 ID',
            serialNumber: 'C2609CD64315222B',
            ipAddress: '88.247.139.41',
            port: 8008,
            location: 'MERKEZ',
            functionType: 'Standart',
            status: 'ONLINE',
            lastSyncTime: '21.08.2026 / 18:05:56'
          }]}
          onSyncLogs={(id) => syncDeviceLogs(id)}
          onCheckStatus={() => {}}
        />
      );
    case 'pdks_catalog':
      return (
        <PDKSReportCatalog 
          dailySummaries={pdksDailySummary}
          workers={workers}
        />
      );
    case 'pdks_schedule':
      return (
        <PDKSWorkPlanSchedule 
          workers={workers}
        />
      );
    case 'pdks_definitions':
      return (
        <PDKSDefinitionsView 
          branches={branches}
          settings={settings}
        />
      );
    case 'pdks_dashboard':
      return (
        <PDKSDashboard 
          workers={workers}
          logs={pdksLogs}
          dailySummaries={pdksDailySummary}
          onNavigateToLogs={() => setActiveTab('pdks_logs')}
          onNavigateToShifts={() => setActiveTab('pdks_shifts')}
          onNavigateToReports={() => setActiveTab('pdks_reports')}
        />
      );
    case 'pdks_logs':
      return (
        <PDKSHareketler 
          logs={pdksLogs}
          workers={workers}
          onAddLog={addPDKSLog}
        />
      );
    case 'pdks_shifts':
      return (
        <ShiftManagement 
          shifts={pdksShifts}
          onSaveShift={saveShift}
          onDeleteShift={deleteShift}
        />
      );
    case 'pdks_overtime_approval':
      return (
        <OvertimeApprovalView 
          approvals={overtimeApprovals}
          workers={workers}
          onApprove={approveOvertime}
          onReject={rejectOvertime}
        />
      );
    case 'pdks_bulk_ops':
      return (
        <BulkOperationsView 
          workers={workers}
          bulkOperations={bulkOperations}
          onApplySalaryRaise={applySalaryRaise}
          onApplyBulkLeave={applyBulkLeave}
        />
      );
    case 'pdks_payroll_slips':
      return (
        <PayrollSlipsView 
          workers={workers}
          monthlySummaries={monthlySummaries}
          settings={settings}
        />
      );
    case 'pdks_reports':
      return (
        <PDKSReports 
          dailySummaries={pdksDailySummary}
          workers={workers}
        />
      );
    case 'dashboard':
      return <Dashboard />;
    case 'terminal':
      return <CheckInTerminal />;
    case 'attendance':
      return <AttendanceMatrix />;
    case 'holidays':
      return <PublicHolidaysView />;
    case 'workers':
      return <WorkerManagement />;
    case 'advances':
      return <AdvancesPayments />;
    case 'performance':
      return <PerformanceView />;
    case 'isg':
      return <ISGView />;
    case 'projects':
      return <ProjectTracking />;
    case 'machinery':
      return <MachineryCostCenter />;
    case 'branches':
      return <BranchManagement />;
    case 'reports':
      return <ReportsView />;
    case 'audit':
      return <AuditLogsView />;
    case 'settings':
      return <SettingsView />;
    default:
      return <Dashboard />;
  }
};

const ToastWrapper: React.FC = () => {
  const { toasts, dismissToast } = useApp();
  return <ToastNotificationContainer toasts={toasts} onDismiss={dismissToast} />;
};

const AppContainer: React.FC = () => {
  const { isAuthenticated, loginUser } = useApp();

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={loginUser} />;
  }

  return (
    <Layout>
      <MainContent />
    </Layout>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContainer />
      <ToastWrapper />
    </AppProvider>
  );
}

export default App;
