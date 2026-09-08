import React, { useState, useEffect } from 'react';
import { api } from './services/api.js';
import { Header, DEMO_PERSONAS } from './components/Header.jsx';
import { DashboardView } from './features/dashboard/DashboardView.jsx';
import { CaseDetailsView } from './features/details/CaseDetailsView.jsx';
import { MyTasksView } from './features/my-tasks/MyTasksView.jsx';
import { WorkflowConfigView } from './features/workflow-config/WorkflowConfigView.jsx';
import { EmployeePortalView } from './features/employee/EmployeePortalView.jsx';
import { InitiateOffboardingModal } from './components/InitiateOffboardingModal.jsx';
import { LoginView } from './features/auth/LoginView.jsx';
import { ShieldCheck, Cpu, Code2 } from 'lucide-react';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('blazeup_auth') === 'true';
  });

  const [currentPersona, setCurrentPersona] = useState(() => {
    const saved = localStorage.getItem('blazeup_persona');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEMO_PERSONAS[0]; // Rahul Kumar (Employee)
  });

  const getDefaultViewForRole = (role) => {
    if (role === 'EMPLOYEE') return 'employee-portal';
    if (role === 'HR_ADMIN') return 'dashboard';
    return 'my-tasks';
  };

  const [activeView, setActiveView] = useState(() => {
    const saved = localStorage.getItem('blazeup_persona');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        return getDefaultViewForRole(p.role);
      } catch (e) {}
    }
    return 'employee-portal';
  });

  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [isInitiateModalOpen, setIsInitiateModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [pendingTaskCount, setPendingTaskCount] = useState(0);
  const [isResettingSeed, setIsResettingSeed] = useState(false);

  // Synchronize view with role permissions
  useEffect(() => {
    if (!isAuthenticated) return;
    if (currentPersona.role === 'EMPLOYEE' && activeView !== 'employee-portal') {
      setActiveView('employee-portal');
    }
  }, [currentPersona, activeView, isAuthenticated]);

  const handleLogin = (persona) => {
    setCurrentPersona(persona);
    setIsAuthenticated(true);
    localStorage.setItem('blazeup_auth', 'true');
    localStorage.setItem('blazeup_persona', JSON.stringify(persona));
    setActiveView(getDefaultViewForRole(persona.role));
    setSelectedCaseId(null);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('blazeup_auth');
    localStorage.removeItem('blazeup_persona');
    setActiveView('employee-portal');
    setSelectedCaseId(null);
  };

  const fetchBadgeCounts = async () => {
    if (!isAuthenticated || currentPersona.role === 'EMPLOYEE') return;
    try {
      const [tasks, notifs] = await Promise.all([
        api.getMyTasks(currentPersona.role, currentPersona.userId),
        api.getNotifications(currentPersona.role, currentPersona.userId),
      ]);
      setPendingTaskCount(tasks.length);
      setNotifications(notifs);
    } catch (err) {
      console.error('Failed to fetch counts:', err);
    }
  };

  useEffect(() => {
    fetchBadgeCounts();
  }, [currentPersona, isAuthenticated]);

  const handleSelectCase = (id) => {
    setSelectedCaseId(id);
    setActiveView('details');
  };

  const handleResetSeed = async () => {
    if (!window.confirm('Reset database with fresh demo employees and active multi-stage offboarding cases?')) {
      return;
    }
    try {
      setIsResettingSeed(true);
      await api.resetSeedData();
      await fetchBadgeCounts();
      window.location.reload();
    } catch (err) {
      alert('Failed to reset demo data: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsResettingSeed(false);
    }
  };

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Application Bar */}
      <Header
        currentPersona={currentPersona}
        activeView={activeView}
        onNavigate={(view) => {
          setActiveView(view);
          setSelectedCaseId(null);
        }}
        pendingTaskCount={pendingTaskCount}
        notifications={notifications}
        onResetSeed={handleResetSeed}
        isResettingSeed={isResettingSeed}
        onLogout={handleLogout}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* 1. Employee Portal View (Exclusive to role: EMPLOYEE) */}
        {activeView === 'employee-portal' && (
          <EmployeePortalView currentPersona={currentPersona} />
        )}

        {/* 2. HR Executive Dashboard */}
        {activeView === 'dashboard' && currentPersona.role === 'HR_ADMIN' && (
          <DashboardView
            currentPersona={currentPersona}
            onSelectCase={handleSelectCase}
            onOpenInitiateModal={() => setIsInitiateModalOpen(true)}
          />
        )}

        {/* 3. Approver Tasks Queue (Manager, IT Admin, Accounts, Facilities, HR) */}
        {activeView === 'my-tasks' && currentPersona.role !== 'EMPLOYEE' && (
          <MyTasksView
            currentPersona={currentPersona}
            onSelectCase={handleSelectCase}
          />
        )}

        {/* 4. Generic Workflow Engine Visual Editor */}
        {activeView === 'workflow-config' && currentPersona.role === 'HR_ADMIN' && (
          <WorkflowConfigView />
        )}

        {/* 5. Deep-Dive Case Details View with RBAC Protected Clearance Actions */}
        {activeView === 'details' && selectedCaseId && (
          <CaseDetailsView
            caseId={selectedCaseId}
            currentPersona={currentPersona}
            onBack={() => {
              setActiveView(currentPersona.role === 'HR_ADMIN' ? 'dashboard' : 'my-tasks');
              setSelectedCaseId(null);
            }}
          />
        )}
      </main>

      {/* Initiate Offboarding Modal (HR Admin shortcut) */}
      <InitiateOffboardingModal
        isOpen={isInitiateModalOpen}
        onClose={() => setIsInitiateModalOpen(false)}
        onSuccess={() => {
          fetchBadgeCounts();
          setActiveView('dashboard');
        }}
      />

      {/* Corporate Platform Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-800">BlazeUp HROS</span> • Terralogic Employee Offboarding Automation
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 font-mono">
              <Cpu className="w-3.5 h-3.5 text-slate-400" /> Role-Based Access Control (RBAC) Enforced
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-mono">
              <Code2 className="w-3.5 h-3.5 text-slate-400" /> Node.js ES Modules + MongoDB + React + PDFKit
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
