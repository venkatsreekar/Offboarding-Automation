import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { StatusPill } from '../../components/StatusPill.jsx';
import { WorkflowPipelineVisualizer } from '../../components/WorkflowPipelineVisualizer.jsx';
import { ClearanceActionModal } from '../../components/ClearanceActionModal.jsx';
import {
  ArrowLeft,
  Calendar,
  Building,
  User,
  ShieldAlert,
  FileDown,
  Clock,
  History,
  CheckCircle,
  XCircle,
  KeyRound,
  Send,
  Lock,
  Download,
} from 'lucide-react';

export const CaseDetailsView = ({
  caseId,
  currentPersona,
  onBack,
}) => {
  const [request, setRequest] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Clearance Modal State
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedStageKey, setSelectedStageKey] = useState('REPORTING_MANAGER_CLEARANCE');

  // Access Revocation Dialog State
  const [revocationDialogOpen, setRevocationDialogOpen] = useState(false);
  const [deactivateEmail, setDeactivateEmail] = useState(true);
  const [revokeSystemAccess, setRevokeSystemAccess] = useState(true);
  const [techNotes, setTechNotes] = useState('Google Workspace account suspended. VPN profile deleted.');

  const fetchCaseDetails = async () => {
    try {
      setLoading(true);
      const [reqData, logs] = await Promise.all([
        api.getOffboardingById(caseId),
        api.getAuditLogs('OFFBOARDING_REQUEST', caseId),
      ]);
      setRequest(reqData);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to load case details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseDetails();
  }, [caseId]);

  if (loading || !request) {
    return (
      <div className="p-12 text-center text-slate-400">
        Loading employee clearance record...
      </div>
    );
  }

  const emp = request.employeeId;
  const wf = request.workflowInstanceId;

  // Handle stage submission
  const handleSubmitClearance = async (payload) => {
    await api.submitClearance(request._id, selectedStageKey, {
      ...payload,
      actorUserId: currentPersona.userId || 'admin_user',
      actorRole: currentPersona.role,
      actorName: currentPersona.name,
    });
    await fetchCaseDetails();
  };

  // Handle access revocation
  const handleRevokeAccessSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.revokeAccess(request._id, {
        deactivateEmail,
        revokeSystemAccess,
        revokedByUserId: currentPersona.userId || 'it_admin_01',
        revokedByName: currentPersona.name,
        technicalNotes: techNotes,
      });
      setRevocationDialogOpen(false);
      await fetchCaseDetails();
    } catch (err) {
      alert('Failed to revoke access: ' + (err.response?.data?.message || err.message));
    }
  };

  const openClearanceForStage = (stageKey) => {
    setSelectedStageKey(stageKey);
    setActionModalOpen(true);
  };

  const getStageName = (key) => {
    const map = {
      REPORTING_MANAGER_CLEARANCE: 'Reporting Manager Clearance',
      ADMIN_SYSTEMS_CLEARANCE: 'Admin & Systems Clearance',
      ACCOUNTS_CLEARANCE: 'Accounts & Finance Clearance',
      PERSONNEL_CLEARANCE: 'Personnel & Facilities Clearance',
      HR_FINAL_CLEARANCE: 'HR Final Certification',
    };
    return map[key] || key;
  };

  const canUserActOnStage = (stageKey) => {
    if (!wf?.activeStageKeys?.includes(stageKey)) return false;
    const userRole = currentPersona?.role;
    if (userRole === 'HR_ADMIN') return true;
    if (stageKey === 'REPORTING_MANAGER_CLEARANCE') return userRole === 'REPORTING_MANAGER';
    if (stageKey === 'ADMIN_SYSTEMS_CLEARANCE') return userRole === 'ADMIN_SYSTEMS';
    if (stageKey === 'ACCOUNTS_CLEARANCE') return userRole === 'ACCOUNTS';
    if (stageKey === 'PERSONNEL_CLEARANCE') return userRole === 'PERSONNEL';
    if (stageKey === 'HR_FINAL_CLEARANCE') return userRole === 'HR_ADMIN';
    return false;
  };

  const getRequiredRoleName = (stageKey) => {
    const map = {
      REPORTING_MANAGER_CLEARANCE: 'Manager',
      ADMIN_SYSTEMS_CLEARANCE: 'IT Admin',
      ACCOUNTS_CLEARANCE: 'Accounts',
      PERSONNEL_CLEARANCE: 'Personnel',
      HR_FINAL_CLEARANCE: 'HR Admin',
    };
    return map[stageKey] || 'Authorized Role';
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header with Back Button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Case ID: {request._id}</span>
          <StatusPill status={request.status} size="md" />
        </div>
      </div>

      {/* Employee Profile Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-600 text-white font-black text-xl flex items-center justify-center shadow-md shadow-indigo-500/20">
              {emp?.name?.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{emp?.name}</h2>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {emp?.employeeId}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {emp?.designation} • <span className="font-semibold text-slate-700">{emp?.department}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
            <div>
              <div className="text-slate-400 text-[11px] font-medium">Resignation Date</div>
              <div className="font-bold text-slate-800 mt-0.5">
                {new Date(request.resignationDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-[11px] font-medium">Last Working Day (LWD)</div>
              <div className="font-bold text-indigo-700 mt-0.5">
                {new Date(request.lastWorkingDay).toLocaleDateString('en-US', { dateStyle: 'medium' })}
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-[11px] font-medium">Separation Reason</div>
              <div className="font-semibold text-slate-800 mt-0.5 max-w-xs truncate">{request.reason}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Workflow Visualizer DAG */}
      <WorkflowPipelineVisualizer
        workflowInstance={wf}
        selectedStageKey={selectedStageKey}
        onSelectStage={(key) => openClearanceForStage(key)}
      />

      {/* Grid: Clearance Cards & Live Access Revocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Department Clearance Status Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Department Clearance Form Details
            </h3>
            <span className="text-xs text-slate-400">Click any card or node to take action</span>
          </div>

          {/* 1. Reporting Manager Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">1. Project / Reporting Manager Clearance</h4>
                <p className="text-xs text-slate-500">Project delivery, KT signoff, repository transfer</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill status={request.reportingManagerClearance?.cleared ? 'APPROVED' : 'PENDING'} />
                {wf?.activeStageKeys?.includes('REPORTING_MANAGER_CLEARANCE') && (
                  canUserActOnStage('REPORTING_MANAGER_CLEARANCE') ? (
                    <button
                      type="button"
                      onClick={() => openClearanceForStage('REPORTING_MANAGER_CLEARANCE')}
                      className="px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-xs"
                    >
                      Review & Clear
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200" title="Restricted to Reporting Manager">
                      <Lock className="w-3 h-3 text-slate-400" />
                      Requires Manager
                    </span>
                  )
                )}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                {request.reportingManagerClearance?.projectCompleted ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-300" />
                )}
                <span>Project Completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                {request.reportingManagerClearance?.knowledgeTransferDone ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-300" />
                )}
                <span>Knowledge Transfer (KT)</span>
              </div>
              <div className="flex items-center gap-1.5">
                {request.reportingManagerClearance?.clientAccessRemoved ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-300" />
                )}
                <span>Client Access Revoked</span>
              </div>
            </div>
            {request.reportingManagerClearance?.remarks && (
              <div className="mt-2 text-xs bg-slate-50 p-2.5 rounded-lg text-slate-700 italic border border-slate-200/60">
                "{request.reportingManagerClearance.remarks}" —{' '}
                <span className="font-semibold">{request.reportingManagerClearance.clearedByName || 'Manager'}</span>
              </div>
            )}
          </div>

          {/* 2. Admin & Systems Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">2. Admin & Systems Clearance</h4>
                <p className="text-xs text-slate-500">Hardware return (laptop, phone, keys) & digital access deactivation</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill status={request.adminSystemsClearance?.cleared ? 'APPROVED' : 'PENDING'} />
                {wf?.activeStageKeys?.includes('ADMIN_SYSTEMS_CLEARANCE') && (
                  canUserActOnStage('ADMIN_SYSTEMS_CLEARANCE') ? (
                    <button
                      type="button"
                      onClick={() => openClearanceForStage('ADMIN_SYSTEMS_CLEARANCE')}
                      className="px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-xs"
                    >
                      Review & Clear
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200" title="Restricted to Admin & Systems Lead">
                      <Lock className="w-3 h-3 text-slate-400" />
                      Requires IT Admin
                    </span>
                  )
                )}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                {request.adminSystemsClearance?.laptopReturned ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-slate-300" />}
                <span>Laptop Returned</span>
              </div>
              <div className="flex items-center gap-1.5">
                {request.adminSystemsClearance?.chargerReturned ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-slate-300" />}
                <span>Power Charger</span>
              </div>
              <div className="flex items-center gap-1.5">
                {request.adminSystemsClearance?.emailDeactivated ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-slate-300" />}
                <span>Email Deactivated</span>
              </div>
              <div className="flex items-center gap-1.5">
                {request.adminSystemsClearance?.systemAccessRevoked ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-slate-300" />}
                <span>System Revoked</span>
              </div>
            </div>
            {request.adminSystemsClearance?.remarks && (
              <div className="mt-2 text-xs bg-slate-50 p-2.5 rounded-lg text-slate-700 italic border border-slate-200/60">
                "{request.adminSystemsClearance.remarks}" —{' '}
                <span className="font-semibold">{request.adminSystemsClearance.clearedByName || 'IT Admin'}</span>
              </div>
            )}
          </div>

          {/* 3. Accounts & Finance Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">3. Accounts & Finance Clearance</h4>
                <p className="text-xs text-slate-500">Staff loans, travel advances, and imprest settlement</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill status={request.accountsClearance?.cleared ? 'APPROVED' : 'PENDING'} />
                {wf?.activeStageKeys?.includes('ACCOUNTS_CLEARANCE') && (
                  canUserActOnStage('ACCOUNTS_CLEARANCE') ? (
                    <button
                      type="button"
                      onClick={() => openClearanceForStage('ACCOUNTS_CLEARANCE')}
                      className="px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-xs"
                    >
                      Review & Clear
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200" title="Restricted to Accounts & Finance Lead">
                      <Lock className="w-3 h-3 text-slate-400" />
                      Requires Accounts
                    </span>
                  )
                )}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                {request.accountsClearance?.travelAdvancesCleared ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-slate-300" />}
                <span>Travel Advances</span>
              </div>
              <div className="flex items-center gap-1.5">
                {request.accountsClearance?.staffLoansCleared ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-slate-300" />}
                <span>Staff Loans</span>
              </div>
              <div className="flex items-center gap-1.5">
                {request.accountsClearance?.salaryAdvancesCleared ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-slate-300" />}
                <span>Salary Advances</span>
              </div>
              <div className="flex items-center gap-1.5">
                {request.accountsClearance?.imprestSettled ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-slate-300" />}
                <span>Imprest Settled</span>
              </div>
            </div>
          </div>

          {/* 4. Personnel & Facilities Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">4. Personnel & Facilities Clearance</h4>
                <p className="text-xs text-slate-500">Physical ID card, RFID swipe badge, and business cards</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill status={request.personnelClearance?.cleared ? 'APPROVED' : 'PENDING'} />
                {wf?.activeStageKeys?.includes('PERSONNEL_CLEARANCE') && (
                  canUserActOnStage('PERSONNEL_CLEARANCE') ? (
                    <button
                      type="button"
                      onClick={() => openClearanceForStage('PERSONNEL_CLEARANCE')}
                      className="px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-xs"
                    >
                      Review & Clear
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200" title="Restricted to Personnel & Facilities Lead">
                      <Lock className="w-3 h-3 text-slate-400" />
                      Requires Personnel
                    </span>
                  )
                )}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                {request.personnelClearance?.idCardReturned ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-slate-300" />}
                <span>Employee ID Card</span>
              </div>
              <div className="flex items-center gap-1.5">
                {request.personnelClearance?.accessCardReturned ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-slate-300" />}
                <span>Access/Swipe Badge</span>
              </div>
              <div className="flex items-center gap-1.5">
                {request.personnelClearance?.businessCardsSurrendered ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-slate-300" />}
                <span>Business Cards</span>
              </div>
            </div>
          </div>

          {/* 5. HR Final Certification Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">5. Human Resources Final Clearance</h4>
                <p className="text-xs text-slate-500">Exit interview, resignation covenant signoff, and relieving release</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill status={request.hrFinalClearance?.cleared ? 'APPROVED' : 'PENDING'} />
                {wf?.activeStageKeys?.includes('HR_FINAL_CLEARANCE') && (
                  canUserActOnStage('HR_FINAL_CLEARANCE') ? (
                    <button
                      type="button"
                      onClick={() => openClearanceForStage('HR_FINAL_CLEARANCE')}
                      className="px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-xs"
                    >
                      Review & Sign Off
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200" title="Restricted to HR Administration">
                      <Lock className="w-3 h-3 text-slate-400" />
                      Requires HR Admin
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Access Revocation, Documents, and Audit Timeline */}
        <div className="space-y-6">
          {/* Live Access Revocation Tracker */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-cyan-600" />
                Access Revocation Tracking
              </h4>
              {['ADMIN_SYSTEMS', 'HR_ADMIN'].includes(currentPersona?.role) ? (
                <button
                  type="button"
                  onClick={() => setRevocationDialogOpen(true)}
                  className="text-[11px] font-bold text-cyan-700 hover:underline cursor-pointer"
                >
                  Update Access
                </button>
              ) : (
                <span className="text-[10px] text-slate-400 font-medium">IT Admin Only</span>
              )}
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="font-semibold text-slate-700">Corporate Email ID:</span>
                <span
                  className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                    request.adminSystemsClearance?.emailDeactivated
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {request.adminSystemsClearance?.emailDeactivated ? 'DEACTIVATED' : 'ACTIVE'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="font-semibold text-slate-700">VPN & Internal SSO:</span>
                <span
                  className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                    request.adminSystemsClearance?.systemAccessRevoked
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {request.adminSystemsClearance?.systemAccessRevoked ? 'REVOKED' : 'ACTIVE'}
                </span>
              </div>

              {request.adminSystemsClearance?.accessRevocationTimestamp && (
                <div className="p-2.5 rounded-xl bg-cyan-50/50 border border-cyan-100 text-[11px] text-cyan-900">
                  <div className="font-semibold">Revocation Executed:</div>
                  <div className="font-mono text-[10px] text-slate-600">
                    {new Date(request.adminSystemsClearance.accessRevocationTimestamp).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-600 mt-0.5">
                    By: {request.adminSystemsClearance.accessRevokedBy || 'IT Admin'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Generated PDF Documents */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <FileDown className="w-4 h-4 text-indigo-600" />
              Automated PDF Documents
            </h4>

            <div className="space-y-2">
              <a
                href={api.getDocumentUrl(request._id, 'RESIGNATION_ACCEPTANCE')}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all text-xs font-semibold text-slate-800 cursor-pointer"
              >
                <div>
                  <div className="font-bold">Resignation Acceptance Letter</div>
                  <div className="text-[10px] text-slate-400">Includes Non-Compete & Non-Solicitation</div>
                </div>
                <Download className="w-4 h-4 text-indigo-600" />
              </a>

              <a
                href={api.getDocumentUrl(request._id, 'NOC_CERTIFICATE')}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all text-xs font-semibold text-slate-800 cursor-pointer"
              >
                <div>
                  <div className="font-bold">No Objection Certificate (NOC)</div>
                  <div className="text-[10px] text-slate-400">Consolidated Department Clearances</div>
                </div>
                <Download className="w-4 h-4 text-emerald-600" />
              </a>

              <a
                href={api.getDocumentUrl(request._id, 'RELIEVING_LETTER')}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/30 transition-all text-xs font-semibold text-slate-800 cursor-pointer"
              >
                <div>
                  <div className="font-bold">Experience & Relieving Letter</div>
                  <div className="text-[10px] text-slate-400">Tenure & Role Certification</div>
                </div>
                <Download className="w-4 h-4 text-amber-600" />
              </a>
            </div>
          </div>

          {/* Audit Trail Activity Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <History className="w-4 h-4 text-slate-500" />
              Immutable Audit Timeline
            </h4>

            <div className="max-h-64 overflow-y-auto space-y-3 pr-1 text-xs">
              {auditLogs.length === 0 ? (
                <div className="text-slate-400 text-xs text-center py-4">No audit logs recorded yet.</div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log._id} className="relative pl-4 border-l-2 border-indigo-200">
                    <div className="absolute -left-1.5 top-0.5 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-2 ring-white" />
                    <div className="font-bold text-slate-800 text-[11px]">{log.action?.replace(/_/g, ' ')}</div>
                    <div className="text-[10px] text-slate-500">
                      {log.actorRole || 'SYSTEM'} {log.actorName ? `(${log.actorName})` : ''}
                    </div>
                    {log.details?.remarks && (
                      <div className="text-[11px] text-slate-600 italic mt-0.5">"{log.details.remarks}"</div>
                    )}
                    <div className="text-[9px] font-mono text-slate-400 mt-0.5">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Clearance Modal */}
      <ClearanceActionModal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        offboardingId={request._id}
        stageKey={selectedStageKey}
        stageName={getStageName(selectedStageKey)}
        employeeName={emp?.name || 'Employee'}
        currentPersona={currentPersona}
        onSubmitClearance={handleSubmitClearance}
      />

      {/* Access Revocation Modal */}
      {revocationDialogOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">Execute Access Revocation</h3>
            <p className="text-xs text-slate-500 mb-4">
              Deactivate digital employee accounts and record admin audit trail
            </p>

            <form onSubmit={handleRevokeAccessSubmit} className="space-y-4">
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={deactivateEmail}
                  onChange={(e) => setDeactivateEmail(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">Deactivate Email ID</div>
                  <div className="text-[11px] text-slate-500">Suspend Google Workspace account</div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={revokeSystemAccess}
                  onChange={(e) => setRevokeSystemAccess(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">Revoke VPN & SSO Profiles</div>
                  <div className="text-[11px] text-slate-500">Terminate all active sessions</div>
                </div>
              </label>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Technical Notes
                </label>
                <textarea
                  rows={2}
                  value={techNotes}
                  onChange={(e) => setTechNotes(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRevocationDialogOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-500/20 cursor-pointer"
                >
                  Execute Revocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
