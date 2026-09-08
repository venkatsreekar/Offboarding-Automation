import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { StatusPill } from '../../components/StatusPill.jsx';
import {
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  UserPlus,
  ArrowUpRight,
  Send,
  Building,
  Calendar,
  Layers,
  FileText,
} from 'lucide-react';

export const DashboardView = ({
  currentPersona,
  onSelectCase,
  onOpenInitiateModal,
}) => {
  const [metrics, setMetrics] = useState(null);
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [reminderStatus, setReminderStatus] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [m, r] = await Promise.all([
        api.getDashboard(),
        api.getOffboardings({
          status: statusFilter === 'ALL' ? undefined : statusFilter,
          search: searchTerm || undefined,
        }),
      ]);
      setMetrics(m);
      setRequests(r);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, searchTerm]);

  const handleQuickReminder = async (offboardingId, e) => {
    e.stopPropagation();
    try {
      await api.sendReminder(offboardingId, {
        stageKey: 'ADMIN_SYSTEMS_CLEARANCE',
        customMessage: 'HR Reminder: Please review and action this pending clearance.',
        senderUserId: currentPersona.userId || 'hr_01',
        senderName: currentPersona.name,
      });
      setReminderStatus(`Reminder sent for case ${offboardingId.slice(-6).toUpperCase()}!`);
      setTimeout(() => setReminderStatus(null), 3500);
      fetchData();
    } catch (err) {
      alert('Failed to send reminder: ' + (err.response?.data?.message || err.message));
    }
  };

  const calculateDaysRemaining = (lwdString) => {
    const lwd = new Date(lwdString).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((lwd - now) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Employee Offboarding Automation</h1>
          <p className="text-xs text-slate-500 mt-1">
            Centralized digital clearance tracking, approval chains, and automated documents
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenInitiateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Initiate Offboarding
          </button>
        </div>
      </div>

      {reminderStatus && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-fade-in">
          <span>✓ {reminderStatus}</span>
          <button onClick={() => setReminderStatus(null)} className="text-emerald-600 font-bold hover:underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Initiated</span>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900">{metrics.overview.total}</span>
              <span className="text-xs text-slate-400 ml-2 font-medium">All Time</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Clearances</span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-blue-600">{metrics.overview.active}</span>
              <span className="text-xs text-slate-400 ml-2 font-medium">In Pipeline</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed / Cleared</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-emerald-600">{metrics.overview.cleared}</span>
              <span className="text-xs text-slate-400 ml-2 font-medium">NOCs Issued</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">SLA Urgent / At Risk</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-amber-600">{metrics.overview.urgentOrBreached}</span>
              <span className="text-xs text-amber-600 font-semibold ml-2">≤ 3 Days to LWD</span>
            </div>
          </div>
        </div>
      )}

      {/* Department Bottlenecks Breakdown */}
      {metrics && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Department Clearance Bottleneck Monitor
              </h3>
              <p className="text-[11px] text-slate-500">
                Live count of clearance tasks awaiting departmental sign-off across all active cases
              </p>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 font-mono">Real-Time SLA</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="text-[11px] font-semibold text-slate-500">Reporting Manager</div>
              <div className="text-xl font-black text-slate-800 mt-1">
                {metrics.departmentBottlenecks.reportingManager}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">KT & Client Access</div>
            </div>

            <div className="p-3 rounded-xl bg-cyan-50/50 border border-cyan-200/60">
              <div className="text-[11px] font-semibold text-cyan-800">Admin & Systems</div>
              <div className="text-xl font-black text-cyan-900 mt-1">
                {metrics.departmentBottlenecks.adminSystems}
              </div>
              <div className="text-[10px] text-cyan-600 mt-0.5">Assets & Email Revocation</div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/60">
              <div className="text-[11px] font-semibold text-emerald-800">Accounts & Finance</div>
              <div className="text-xl font-black text-emerald-900 mt-1">
                {metrics.departmentBottlenecks.accounts}
              </div>
              <div className="text-[10px] text-emerald-600 mt-0.5">Advances & Loans Dues</div>
            </div>

            <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-200/60">
              <div className="text-[11px] font-semibold text-purple-800">Personnel & Facilities</div>
              <div className="text-xl font-black text-purple-900 mt-1">
                {metrics.departmentBottlenecks.personnel}
              </div>
              <div className="text-[10px] text-purple-600 mt-0.5">Badges & Business Cards</div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-200/60">
              <div className="text-[11px] font-semibold text-indigo-800">HR Directorate</div>
              <div className="text-xl font-black text-indigo-900 mt-1">
                {metrics.departmentBottlenecks.hr}
              </div>
              <div className="text-[10px] text-indigo-600 mt-0.5">Final Cert & Relieving</div>
            </div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search employee name, code, reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-semibold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 py-2 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="CLEARED">Cleared / Completed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Offboarding Cases Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department & Role</th>
                <th className="py-3 px-4">Resignation / LWD</th>
                <th className="py-3 px-4">Clearance Progress</th>
                <th className="py-3 px-4">Pending Approver(s)</th>
                <th className="py-3 px-4">Overall Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading offboarding cases...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No offboarding requests found matching criteria.
                  </td>
                </tr>
              ) : (
                requests.map((req) => {
                  const daysLeft = calculateDaysRemaining(req.lastWorkingDay);
                  const isUrgent = req.status === 'IN_PROGRESS' && daysLeft <= 3 && daysLeft >= 0;
                  const isBreached = req.status === 'IN_PROGRESS' && daysLeft < 0;

                  // Calculate Progress (e.g. 3/5 stages cleared)
                  const totalStages = 5;
                  const clearedStages = [
                    req.reportingManagerClearance?.cleared,
                    req.adminSystemsClearance?.cleared,
                    req.accountsClearance?.cleared,
                    req.personnelClearance?.cleared,
                    req.hrClearance?.cleared,
                  ].filter(Boolean).length;
                  const progressPercent = Math.round((clearedStages / totalStages) * 100);

                  // Calculate Pending Approvers
                  const activeKeys = req.workflowInstanceId?.activeStageKeys || [];
                  const roleNameMap = {
                    REPORTING_MANAGER_CLEARANCE: 'Reporting Manager',
                    ADMIN_SYSTEMS_CLEARANCE: 'Admin & Systems',
                    ACCOUNTS_CLEARANCE: 'Accounts & Finance',
                    PERSONNEL_CLEARANCE: 'Personnel',
                    HR_FINAL_CLEARANCE: 'HR Directorate',
                  };
                  const pendingApprovers = activeKeys.map((k) => roleNameMap[k] || k);

                  return (
                    <tr
                      key={req._id}
                      onClick={() => onSelectCase(req._id)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-100 to-indigo-50 border border-slate-200 flex items-center justify-center font-bold text-indigo-700 text-xs">
                            {req.employeeId?.name
                              ?.split(' ')
                              .map((n) => n[0])
                              .join('') || 'E'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{req.employeeId?.name || 'Employee'}</div>
                            <div className="text-[11px] font-mono text-slate-400">{req.employeeId?.employeeId}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium">{req.employeeId?.department}</div>
                        <div className="text-[11px] text-slate-400">{req.employeeId?.designation}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-800">
                          {new Date(req.lastWorkingDay).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                        </div>
                        {isUrgent && (
                          <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 animate-pulse">
                            ⚠️ {daysLeft} days remaining
                          </span>
                        )}
                        {isBreached && (
                          <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-800">
                            🚨 Past LWD ({Math.abs(daysLeft)}d overdue)
                          </span>
                        )}
                        {!isUrgent && !isBreached && (
                          <span className="text-[11px] text-slate-400">
                            Resigned: {new Date(req.resignationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </td>

                      {/* Progress: 3/5 with sleek progress bar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-between text-xs mb-1 font-semibold">
                          <span className="text-indigo-700 font-bold">{clearedStages} / {totalStages} Cleared</span>
                          <span className="text-[11px] text-slate-400">{progressPercent}%</span>
                        </div>
                        <div className="w-28 h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                          <div
                            className={`h-full rounded-full transition-all ${
                              clearedStages === totalStages
                                ? 'bg-emerald-500'
                                : clearedStages > 0
                                ? 'bg-indigo-600'
                                : 'bg-slate-300'
                            }`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </td>

                      {/* Current Pending Approvers */}
                      <td className="py-3 px-4">
                        {req.status === 'CLEARED' ? (
                          <span className="inline-flex items-center text-[11px] font-medium text-emerald-700">
                            ✓ None (All Cleared)
                          </span>
                        ) : req.status === 'REJECTED' ? (
                          <span className="inline-flex items-center text-[11px] font-semibold text-rose-600">
                            ✕ Halted (Rejected)
                          </span>
                        ) : pendingApprovers.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {pendingApprovers.map((appr, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200"
                              >
                                {appr}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">Next Step Pending</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <StatusPill status={req.status} />
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          {req.status === 'IN_PROGRESS' && (
                            <button
                              type="button"
                              onClick={(e) => handleQuickReminder(req._id, e)}
                              title="Send manual reminder to pending stage approvers"
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onSelectCase(req._id)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                          >
                            Details
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
