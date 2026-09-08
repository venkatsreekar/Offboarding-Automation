import React, { useState } from 'react';
import {
  Bell,
  RotateCcw,
  User,
  CheckCircle,
  LayoutDashboard,
  ClipboardCheck,
  Building2,
  Sliders,
  LogOut,
  FileText,
  ShieldAlert,
} from 'lucide-react';

export const DEMO_PERSONAS = [
  {
    role: 'EMPLOYEE',
    name: 'Rahul Kumar',
    designation: 'Senior Full-Stack Engineer',
    department: 'Engineering',
    employeeId: 'EMP-1045',
    userId: 'EMP-1045',
    statusTag: 'Active (Ready to Resign)',
  },
  {
    role: 'EMPLOYEE',
    name: 'Devon Miller',
    designation: 'Staff Cloud Architect',
    department: 'Engineering',
    employeeId: 'EMP-1042',
    userId: 'EMP-1042',
    statusTag: 'In Clearance (Pending Mgr)',
  },
  {
    role: 'EMPLOYEE',
    name: 'Elena Rostova',
    designation: 'Senior Backend Engineer',
    department: 'Engineering',
    employeeId: 'EMP-1044',
    userId: 'EMP-1044',
    statusTag: 'Cleared (Download Letters)',
  },
  {
    role: 'REPORTING_MANAGER',
    name: 'Marcus Vance',
    designation: 'Director of Engineering',
    department: 'Engineering',
    employeeId: 'EMP-MGR-01',
    userId: 'EMP-MGR-01',
    statusTag: 'Direct Manager',
  },
  {
    role: 'ADMIN_SYSTEMS',
    name: 'Alex Rivera',
    designation: 'IT Systems Infrastructure Lead',
    department: 'Admin & Systems',
    employeeId: 'EMP-IT-01',
    userId: 'EMP-IT-01',
    statusTag: 'IT / Systems Lead',
  },
  {
    role: 'ACCOUNTS',
    name: 'Priya Sharma',
    designation: 'Head of Financial Operations',
    department: 'Accounts & Finance',
    employeeId: 'EMP-ACC-01',
    userId: 'EMP-ACC-01',
    statusTag: 'Finance Approver',
  },
  {
    role: 'PERSONNEL',
    name: 'David Chen',
    designation: 'Facilities & Asset Manager',
    department: 'Personnel & Facilities',
    employeeId: 'EMP-FAC-01',
    userId: 'EMP-FAC-01',
    statusTag: 'Facilities Lead',
  },
  {
    role: 'HR_ADMIN',
    name: 'Sarah Jenkins',
    designation: 'VP of Human Resources',
    department: 'Human Resources',
    employeeId: 'EMP-HR-01',
    userId: 'EMP-HR-01',
    statusTag: 'HR Executive',
  },
];

export const Header = ({
  currentPersona,
  activeView,
  onNavigate,
  pendingTaskCount = 0,
  notifications = [],
  onResetSeed,
  isResettingSeed = false,
  onLogout,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.isRead);
  const isEmployee = currentPersona.role === 'EMPLOYEE';
  const isManager = currentPersona.role === 'REPORTING_MANAGER';
  const isDeptApprover = ['ADMIN_SYSTEMS', 'ACCOUNTS', 'PERSONNEL'].includes(currentPersona.role);
  const isHrAdmin = currentPersona.role === 'HR_ADMIN';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Left Navigation */}
          <div className="flex items-center gap-8">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => onNavigate(isEmployee ? 'employee-portal' : isHrAdmin ? 'dashboard' : 'my-tasks')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-500/20">
                B
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-slate-900 tracking-tight">BlazeUp HROS</span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Offboarding
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Terralogic Automation Suite</p>
              </div>
            </div>

            {/* Role-Based Nav Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              {/* Employee View Navigation */}
              {isEmployee && (
                <button
                  type="button"
                  onClick={() => onNavigate('employee-portal')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                    activeView === 'employee-portal'
                      ? 'bg-slate-100 text-indigo-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  My Offboarding Portal
                </button>
              )}

              {/* HR Admin Navigation */}
              {isHrAdmin && (
                <>
                  <button
                    type="button"
                    onClick={() => onNavigate('dashboard')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                      activeView === 'dashboard'
                        ? 'bg-slate-100 text-indigo-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    HR Executive Dashboard
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('my-tasks')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer relative ${
                      activeView === 'my-tasks'
                        ? 'bg-slate-100 text-indigo-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    All Clearance Tasks
                    {pendingTaskCount > 0 && (
                      <span className="ml-1 px-2 py-0.5 text-[11px] font-bold rounded-full bg-blue-600 text-white animate-pulse">
                        {pendingTaskCount}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('workflow-config')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                      activeView === 'workflow-config'
                        ? 'bg-slate-100 text-indigo-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Sliders className="w-4 h-4" />
                    Workflow Config
                  </button>
                </>
              )}

              {/* Reporting Manager Navigation */}
              {isManager && (
                <button
                  type="button"
                  onClick={() => onNavigate('my-tasks')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer relative ${
                    activeView === 'my-tasks'
                      ? 'bg-slate-100 text-indigo-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <ClipboardCheck className="w-4 h-4" />
                  My Direct Reportees Approvals
                  {pendingTaskCount > 0 && (
                    <span className="ml-1 px-2 py-0.5 text-[11px] font-bold rounded-full bg-blue-600 text-white animate-pulse">
                      {pendingTaskCount}
                    </span>
                  )}
                </button>
              )}

              {/* Department Approvers (IT, Accounts, Personnel) Navigation */}
              {isDeptApprover && (
                <button
                  type="button"
                  onClick={() => onNavigate('my-tasks')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer relative ${
                    activeView === 'my-tasks'
                      ? 'bg-slate-100 text-indigo-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <ClipboardCheck className="w-4 h-4" />
                  Department Clearance Queue
                  {pendingTaskCount > 0 && (
                    <span className="ml-1 px-2 py-0.5 text-[11px] font-bold rounded-full bg-blue-600 text-white animate-pulse">
                      {pendingTaskCount}
                    </span>
                  )}
                </button>
              )}
            </nav>
          </div>

          {/* Right Actions: Seed Reset, Notifications, Authenticated Persona & Sign Out */}
          <div className="flex items-center gap-3">
            {/* Reset Demo Data Button */}
            <button
              type="button"
              onClick={onResetSeed}
              disabled={isResettingSeed}
              title="Reset database with demo employees and multi-stage cases"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResettingSeed ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 relative cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Notifications</span>
                    <span className="text-[11px] text-slate-500">{notifications.length} Total</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">No recent notifications</div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div key={n._id} className="p-3 hover:bg-slate-50 transition-colors text-xs">
                          <p className="font-semibold text-slate-800">{n.title}</p>
                          <p className="text-slate-500 mt-0.5">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                            {new Date(n.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Authenticated Identity Pill (Locked to Current Session - No Arbitrary Switching) */}
            <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs">
                {currentPersona.name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('') || 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-900 leading-tight">{currentPersona.name}</div>
                <div className="text-[10px] font-semibold text-indigo-600 leading-tight">
                  {currentPersona.role?.replace(/_/g, ' ')}
                </div>
              </div>
            </div>

            {/* Sign Out Button -> Returns to SSO Login Screen */}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Sign out of current role"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 text-rose-700 bg-rose-50/60 hover:bg-rose-100 hover:border-rose-300 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
