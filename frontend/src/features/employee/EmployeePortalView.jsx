import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { StatusPill } from '../../components/StatusPill.jsx';
import {
  User,
  Briefcase,
  Building,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Send,
  ShieldCheck,
  Laptop,
  Landmark,
  Award,
  KeyRound,
  FileCheck2,
  ChevronRight,
  Info,
  RotateCcw,
} from 'lucide-react';

export const EmployeePortalView = ({ currentPersona }) => {
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [offboardingCase, setOffboardingCase] = useState(null);
  const [loading, setLoading] = useState(true);

  // Resignation Form State (for active employees who haven't resigned yet)
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultLwdStr = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
  const [resignationDate, setResignationDate] = useState(todayStr);
  const [lastWorkingDay, setLastWorkingDay] = useState(defaultLwdStr);
  const [reason, setReason] = useState('Career Growth / New Opportunity');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      setSubmitError(null);

      // 1. Fetch employee profile details
      const empId = currentPersona.employeeId || currentPersona.userId;
      let profile = null;
      try {
        const emps = await api.getEmployees({ search: empId });
        if (emps && emps.length > 0) {
          profile = emps[0];
        }
      } catch (err) {
        console.warn('Could not fetch detailed employee profile:', err);
      }
      setEmployeeProfile(profile);

      // 2. Fetch offboarding request for this employee
      const requests = await api.getOffboardings({ employeeId: empId });
      if (requests && requests.length > 0) {
        // Find latest active or cleared case (exclude withdrawn cases so employee can resubmit if needed)
        const activeOrCleared = requests.find((r) => ['INITIATED', 'IN_PROGRESS', 'CLEARED'].includes(r.status));
        setOffboardingCase(activeOrCleared || null);
      } else {
        setOffboardingCase(null);
      }
    } catch (err) {
      console.error('Failed to load employee portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  const [withdrawing, setWithdrawing] = useState(false);

  const handleWithdrawTicket = async () => {
    if (!offboardingCase) return;
    const confirmWithdraw = window.confirm(
      'Are you sure you want to withdraw and revoke your resignation ticket?\n\nThis will immediately terminate the clearance workflow and restore your active employment status.'
    );
    if (!confirmWithdraw) return;

    const reason = window.prompt(
      'Please state your reason for withdrawing your resignation (e.g., "Mutual retention agreed with management"):',
      'Mutual retention agreed with management'
    );
    if (reason === null) return;

    try {
      setWithdrawing(true);
      await api.withdrawOffboarding(offboardingCase._id, {
        reason: reason || 'Withdrawn by employee',
        actorUserId: currentPersona.employeeId || currentPersona.userId,
        actorName: currentPersona.name,
      });
      alert('Resignation ticket successfully withdrawn! Your active employment status is restored.');
      await fetchEmployeeData();
    } catch (err) {
      alert('Failed to withdraw ticket: ' + (err.response?.data?.message || err.message));
    } finally {
      setWithdrawing(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, [currentPersona]);

  // Handle Resignation Ticket Submission
  const handleInitiateResignation = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setSubmitError(null);

      const empId = employeeProfile?._id || currentPersona.employeeId || currentPersona.userId;

      await api.initiateOffboarding({
        employeeId: empId,
        resignationDate,
        lastWorkingDay,
        reason,
        notes: notes || 'Formal resignation ticket raised via Employee Self-Service Portal.',
        initiatedById: empId,
      });

      setSubmitSuccess(true);
      await fetchEmployeeData();
    } catch (err) {
      console.error('Failed to initiate resignation ticket:', err);
      setSubmitError(err.response?.data?.message || err.message || 'Failed to submit resignation ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-600">Loading your employee clearance portal...</p>
      </div>
    );
  }

  // Calculate Clearance Stage Statuses
  const stages = [
    {
      key: 'REPORTING_MANAGER_CLEARANCE',
      stepNumber: 1,
      title: 'Reporting Manager Clearance',
      department: 'Engineering Directorate',
      approverName: employeeProfile?.reportingManagerId?.name || 'Marcus Vance',
      icon: <Briefcase className="w-5 h-5 text-blue-600" />,
      cleared: offboardingCase?.reportingManagerClearance?.cleared,
      clearedAt: offboardingCase?.reportingManagerClearance?.clearedAt,
      remarks: offboardingCase?.reportingManagerClearance?.remarks,
      items: [
        { label: 'Project Handover Completed', checked: offboardingCase?.reportingManagerClearance?.projectCompleted },
        { label: 'Knowledge Transfer (KT) Signed-off', checked: offboardingCase?.reportingManagerClearance?.knowledgeTransferDone },
        { label: 'Client Repositories & Access Removed', checked: offboardingCase?.reportingManagerClearance?.clientAccessRemoved },
      ],
    },
    {
      key: 'ADMIN_SYSTEMS_CLEARANCE',
      stepNumber: 2,
      title: 'Admin & Systems Clearance',
      department: 'Admin & Systems Infrastructure',
      approverName: 'Alex Rivera',
      icon: <Laptop className="w-5 h-5 text-cyan-600" />,
      cleared: offboardingCase?.adminSystemsClearance?.cleared,
      clearedAt: offboardingCase?.adminSystemsClearance?.clearedAt,
      remarks: offboardingCase?.adminSystemsClearance?.remarks,
      items: [
        { label: 'Company Laptop & Charger Surrendered', checked: offboardingCase?.adminSystemsClearance?.laptopReturned },
        { label: 'Official Email & Workspace Deactivated', checked: offboardingCase?.adminSystemsClearance?.emailDeactivated },
        { label: 'VPN & Cloud Infrastructure Revoked', checked: offboardingCase?.adminSystemsClearance?.systemAccessRevoked },
      ],
    },
    {
      key: 'ACCOUNTS_CLEARANCE',
      stepNumber: 3,
      title: 'Accounts & Finance Clearance',
      department: 'Accounts & Financial Operations',
      approverName: 'Priya Sharma',
      icon: <Landmark className="w-5 h-5 text-emerald-600" />,
      cleared: offboardingCase?.accountsClearance?.cleared,
      clearedAt: offboardingCase?.accountsClearance?.clearedAt,
      remarks: offboardingCase?.accountsClearance?.remarks,
      items: [
        { label: 'Travel Advances Cleared (Nil Balance)', checked: offboardingCase?.accountsClearance?.travelAdvancesCleared },
        { label: 'Staff Loans & Advances Settled', checked: offboardingCase?.accountsClearance?.staffLoansCleared },
        { label: 'Imprest Balances Reconciled', checked: offboardingCase?.accountsClearance?.imprestSettled },
      ],
    },
    {
      key: 'PERSONNEL_CLEARANCE',
      stepNumber: 4,
      title: 'Personnel & Facilities Clearance',
      department: 'Personnel & Facilities Management',
      approverName: 'David Chen',
      icon: <Building className="w-5 h-5 text-purple-600" />,
      cleared: offboardingCase?.personnelClearance?.cleared,
      clearedAt: offboardingCase?.personnelClearance?.clearedAt,
      remarks: offboardingCase?.personnelClearance?.remarks,
      items: [
        { label: 'Physical Employee ID Badge Surrendered', checked: offboardingCase?.personnelClearance?.idCardReturned },
        { label: 'Facility Access Swipe Card Returned', checked: offboardingCase?.personnelClearance?.accessCardReturned },
        { label: 'Company Business Cards Surrendered', checked: offboardingCase?.personnelClearance?.businessCardsSurrendered },
      ],
    },
    {
      key: 'HR_FINAL_CLEARANCE',
      stepNumber: 5,
      title: 'HR Final Certification & Sign-off',
      department: 'Human Resources Directorate',
      approverName: 'Sarah Jenkins',
      icon: <Award className="w-5 h-5 text-indigo-600" />,
      cleared: offboardingCase?.hrFinalClearance?.cleared,
      clearedAt: offboardingCase?.hrFinalClearance?.clearedAt,
      remarks: offboardingCase?.hrFinalClearance?.remarks,
      items: [
        { label: 'Formal Exit Interview Completed', checked: offboardingCase?.hrFinalClearance?.exitInterviewCompleted },
        { label: 'Resignation Acceptance Letter Executed', checked: offboardingCase?.hrFinalClearance?.resignationAcceptanceSigned },
        { label: 'Final Settlement (F&F) Approved', checked: offboardingCase?.hrFinalClearance?.finalSettlementApproved },
      ],
    },
  ];

  const completedCount = stages.filter((s) => s.cleared).length;
  const progressPercent = Math.round((completedCount / stages.length) * 100);
  const isFullyCleared = offboardingCase?.status === 'CLEARED' || completedCount === stages.length;

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Employee Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-40 h-40 bg-indigo-50 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              {currentPersona.name
                ?.split(' ')
                .map((n) => n[0])
                .join('') || 'E'}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{currentPersona.name}</h1>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {currentPersona.employeeId || employeeProfile?.employeeId || 'EMP-1045'}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Employee Self-Service
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {currentPersona.designation || employeeProfile?.designation} •{' '}
                <span className="font-semibold text-slate-700">{currentPersona.department}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 text-xs">
            <div>
              <span className="text-[11px] font-medium text-slate-400 block">Reporting Manager</span>
              <span className="font-bold text-slate-800">
                {employeeProfile?.reportingManagerId?.name || 'Marcus Vance'}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-400 block">Employment Status</span>
              <span className="font-bold text-slate-800">
                {offboardingCase ? (
                  <StatusPill status={offboardingCase.status} />
                ) : (
                  <span className="text-emerald-600 font-bold">Active Employment</span>
                )}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-400 block">Work Email</span>
              <span className="font-mono text-slate-600 truncate block max-w-[160px]">
                {employeeProfile?.email || `${currentPersona.name.toLowerCase().replace(/\s+/g, '.')}@blazeup.test`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STATE A: If NO Offboarding Ticket Exists -> Resignation Ticket Submission Form */}
      {!offboardingCase ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 mb-3">
              <Info className="w-3.5 h-3.5 text-amber-600" />
              Separation & Clearance Initiation
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Submit Resignation & Clearance Ticket
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Initiate your formal separation process. Upon submission, a ticket will be raised and automatically routed to your Reporting Manager, IT Admin, Accounts, Facilities, and HR for parallel clearances.
            </p>
          </div>

          {submitError && (
            <div className="mt-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleInitiateResignation} className="mt-6 max-w-2xl space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Resignation Notice Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    required
                    value={resignationDate}
                    onChange={(e) => setResignationDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Requested Last Working Day (LWD)
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    required
                    value={lastWorkingDay}
                    onChange={(e) => setLastWorkingDay(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 font-medium"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Primary Reason for Resignation
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 font-medium text-slate-800"
              >
                <option value="Career Growth / New Opportunity">Career Growth / New Opportunity</option>
                <option value="Higher Education / Technical Certifications">Higher Education / Technical Certifications</option>
                <option value="Relocation / Family Reasons">Relocation / Family Reasons</option>
                <option value="Health / Personal Well-being">Health / Personal Well-being</option>
                <option value="Entrepreneurship / Founding New Venture">Entrepreneurship / Founding New Venture</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Handover & Transition Plan Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detail current projects, repositories, and readiness for knowledge transfer (KT)..."
                className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 font-medium"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting Resignation Ticket...' : 'Submit Resignation & Raise Clearance Ticket'}</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* 3. STATE B: If Offboarding Ticket Exists -> Live Tracker & Document Center */
        <div className="space-y-6">
          {/* Ticket Summary Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                    Ticket #{offboardingCase._id?.substring(0, 10).toUpperCase()}
                  </span>
                  <StatusPill status={offboardingCase.status} />
                </div>
                <h2 className="text-xl font-black mt-2">Active Separation & Clearance Workflow</h2>
                <p className="text-xs text-indigo-200 mt-0.5">
                  Resignation Date:{' '}
                  <span className="font-bold text-white">
                    {new Date(offboardingCase.resignationDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                  </span>{' '}
                  • Last Working Day:{' '}
                  <span className="font-bold text-emerald-300">
                    {new Date(offboardingCase.lastWorkingDay).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                  </span>
                </p>

                {offboardingCase.status === 'IN_PROGRESS' && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={handleWithdrawTicket}
                      disabled={withdrawing}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${withdrawing ? 'animate-spin' : ''}`} />
                      <span>{withdrawing ? 'Withdrawing Ticket...' : 'Withdraw / Revoke Resignation Ticket'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Progress Ring / Percentage */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 min-w-[200px]">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-indigo-200 font-medium">Clearance Progress</span>
                  <span className="font-mono font-black text-emerald-300">{progressPercent}%</span>
                </div>
                <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full transition-all duration-700 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="text-[10px] text-indigo-200 mt-1.5 text-right font-medium">
                  {completedCount} of {stages.length} Clearances Completed
                </div>
              </div>
            </div>
          </div>

          {/* 4. Official Exit Documents Download Center */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-indigo-600" />
                  Official Digital Exit Documents
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isFullyCleared
                    ? 'All departmental clearances have been signed off. Your official digital certificates are ready for download.'
                    : 'Documents will be certified and unlocked upon completion of HR Final Certification.'}
                </p>
              </div>
              <span
                className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                  isFullyCleared ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {isFullyCleared ? 'Ready for Download' : 'Generating on Completion'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Document 1: Resignation Acceptance */}
              <div
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isFullyCleared
                    ? 'border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50'
                    : 'border-slate-200 bg-slate-50/50 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
                    <FileText className="w-4 h-4" />
                    <span>Resignation Acceptance</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Formal acknowledgment of resignation and relieving date commitment.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">PDF • Signed</span>
                  {isFullyCleared ? (
                    <a
                      href={api.getDocumentUrl(offboardingCase._id, 'RESIGNATION_ACCEPTANCE')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">Locked</span>
                  )}
                </div>
              </div>

              {/* Document 2: No Objection Certificate (NOC) */}
              <div
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isFullyCleared
                    ? 'border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50'
                    : 'border-slate-200 bg-slate-50/50 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Clearance Certificate (NOC)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Multi-department signoff verifying zero outstanding dues and assets.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">PDF • Certified</span>
                  {isFullyCleared ? (
                    <a
                      href={api.getDocumentUrl(offboardingCase._id, 'NOC_CERTIFICATE')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">Locked</span>
                  )}
                </div>
              </div>

              {/* Document 3: Relieving Letter */}
              <div
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isFullyCleared
                    ? 'border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50'
                    : 'border-slate-200 bg-slate-50/50 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
                    <Award className="w-4 h-4" />
                    <span>Relieving & Experience Letter</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Official service certificate detailing tenure and graceful separation.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">PDF • Corporate Seal</span>
                  {isFullyCleared ? (
                    <a
                      href={api.getDocumentUrl(offboardingCase._id, 'RELIEVING_LETTER')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">Locked</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 5. Live Multi-Department Clearance Pipeline Tracker */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Multi-Department Clearance Verification Checklist
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Track each department's sign-off status and approval notes in real time.
              </p>
            </div>

            <div className="space-y-4">
              {stages.map((stage) => {
                return (
                  <div
                    key={stage.key}
                    className={`rounded-2xl border p-5 transition-all ${
                      stage.cleared
                        ? 'border-emerald-200 bg-emerald-50/30'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2.5 rounded-xl border ${
                            stage.cleared
                              ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                              : 'bg-slate-50 border-slate-200 text-slate-500'
                          }`}
                        >
                          {stage.cleared ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : stage.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              {stage.stepNumber}. {stage.title}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold">
                              {stage.department}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Assigned Approver: <span className="font-semibold text-slate-700">{stage.approverName}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {stage.cleared ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Cleared
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <Clock className="w-3.5 h-3.5 animate-pulse" />
                            In Verification
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stage Checklist Items */}
                    <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-600">
                      {stage.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          {item.checked ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                          )}
                          <span className={item.checked ? 'text-slate-900 font-medium' : 'text-slate-400'}>
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Approver Remarks Note */}
                    {stage.remarks && (
                      <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
                        <span className="font-bold text-slate-900">Approver Remark: </span>
                        <span className="italic">"{stage.remarks}"</span>
                        {stage.clearedAt && (
                          <span className="block text-[10px] text-slate-400 mt-1 font-mono">
                            Timestamp: {new Date(stage.clearedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
