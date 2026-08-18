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
import { ToastNotificationContainer } from './components/ui/ToastNotification';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  switch (activeTab) {
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

export function App() {
  return (
    <AppProvider>
      <Layout>
        <MainContent />
      </Layout>
      <ToastWrapper />
    </AppProvider>
  );
}

export default App;
