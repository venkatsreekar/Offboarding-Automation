import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export const ClearanceActionModal = ({
  isOpen,
  onClose,
  stageKey,
  stageName,
  employeeName,
  currentPersona,
  onSubmitClearance,
}) => {
  if (!isOpen) return null;

  const [decision, setDecision] = useState('APPROVE');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const getRequiredRole = (key) => {
    const map = {
      REPORTING_MANAGER_CLEARANCE: 'REPORTING_MANAGER',
      ADMIN_SYSTEMS_CLEARANCE: 'ADMIN_SYSTEMS',
      ACCOUNTS_CLEARANCE: 'ACCOUNTS',
      PERSONNEL_CLEARANCE: 'PERSONNEL',
      HR_FINAL_CLEARANCE: 'HR_ADMIN',
    };
    return map[key] || 'HR_ADMIN';
  };

  const requiredRole = getRequiredRole(stageKey);
  const isAuthorized =
    currentPersona.role === 'HR_ADMIN' ||
    currentPersona.role === requiredRole;

  // Department-specific checklist state defaults
  const [pmChecklist, setPmChecklist] = useState({
    projectCompleted: true,
    knowledgeTransferDone: true,
    clientAccessRemoved: true,
  });

  const [adminChecklist, setAdminChecklist] = useState({
    laptopReturned: true,
    chargerReturned: true,
    phoneReturned: true,
    dataCardReturned: true,
    keysReturned: true,
    emailDeactivated: true,
    systemAccessRevoked: true,
  });

  const [accountsChecklist, setAccountsChecklist] = useState({
    travelAdvancesCleared: true,
    staffLoansCleared: true,
    salaryAdvancesCleared: true,
    imprestSettled: true,
  });

  const [personnelChecklist, setPersonnelChecklist] = useState({
    idCardReturned: true,
    accessCardReturned: true,
    businessCardsSurrendered: true,
  });

  const [hrChecklist, setHrChecklist] = useState({
    exitInterviewCompleted: true,
    resignationAcceptanceSigned: true,
    finalSettlementApproved: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthorized) {
      setErrorMsg(`Access Denied: Role [${requiredRole}] or HR Admin required to take clearance action.`);
      return;
    }
    if (!remarks.trim()) {
      setErrorMsg('Remarks are required to submit an action.');
      return;
    }

    let checklistData = {};
    if (stageKey === 'REPORTING_MANAGER_CLEARANCE') checklistData = pmChecklist;
    else if (stageKey === 'ADMIN_SYSTEMS_CLEARANCE') checklistData = adminChecklist;
    else if (stageKey === 'ACCOUNTS_CLEARANCE') checklistData = accountsChecklist;
    else if (stageKey === 'PERSONNEL_CLEARANCE') checklistData = personnelChecklist;
    else if (stageKey === 'HR_FINAL_CLEARANCE') checklistData = hrChecklist;

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await onSubmitClearance({
        decision,
        remarks,
        checklistData,
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to submit clearance action.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">{stageName}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Clearance for: <span className="font-semibold text-slate-800">{employeeName}</span></p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Approver Identity Banner */}
          <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500">Signing as: </span>
              <span className="font-bold text-indigo-900">{currentPersona.name}</span>
            </div>
            <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-indigo-100 text-indigo-700">
              {currentPersona.role}
            </span>
          </div>

          {!isAuthorized && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold">Role Access Restricted: </span>
                You are logged in as <span className="font-mono font-bold text-amber-950">[{currentPersona.role}]</span>. Only <span className="font-mono font-bold text-amber-950">[{requiredRole}]</span> or HR Admin can sign off on this department clearance.
              </div>
            </div>
          )}

          {/* Decision Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Decision</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDecision('APPROVE')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  decision === 'APPROVE'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800 ring-2 ring-emerald-300'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Approve Clearance
              </button>

              <button
                type="button"
                onClick={() => setDecision('REJECT')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  decision === 'REJECT'
                    ? 'bg-rose-50 border-rose-400 text-rose-800 ring-2 ring-rose-300'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-600" />
                Reject / Raise Query
              </button>
            </div>
          </div>

          {/* Department Specific Verification Checklist */}
          {decision === 'APPROVE' && (
            <div className="space-y-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Department Checklist Items
              </label>

              {/* 1. Reporting Manager Items */}
              {stageKey === 'REPORTING_MANAGER_CLEARANCE' && (
                <div className="space-y-2 text-xs text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pmChecklist.projectCompleted}
                      onChange={(e) => setPmChecklist({ ...pmChecklist, projectCompleted: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>Project tasks completed and committed to repository</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pmChecklist.knowledgeTransferDone}
                      onChange={(e) => setPmChecklist({ ...pmChecklist, knowledgeTransferDone: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>Knowledge Transfer (KT) documentation handed over</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pmChecklist.clientAccessRemoved}
                      onChange={(e) => setPmChecklist({ ...pmChecklist, clientAccessRemoved: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>Client portal, VPN, and system access revoked</span>
                  </label>
                </div>
              )}

              {/* 2. Admin & Systems Items */}
              {stageKey === 'ADMIN_SYSTEMS_CLEARANCE' && (
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="font-semibold text-slate-800 text-[11px] mb-1">Hardware & Assets Return:</div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={adminChecklist.laptopReturned}
                      onChange={(e) => setAdminChecklist({ ...adminChecklist, laptopReturned: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>Company Laptop / Desktop returned</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={adminChecklist.chargerReturned}
                      onChange={(e) => setAdminChecklist({ ...adminChecklist, chargerReturned: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>Charger & power adapter returned</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={adminChecklist.phoneReturned}
                      onChange={(e) => setAdminChecklist({ ...adminChecklist, phoneReturned: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>Company Phone & Data Card returned</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={adminChecklist.keysReturned}
                      onChange={(e) => setAdminChecklist({ ...adminChecklist, keysReturned: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>Cabinet / Pedestal keys returned</span>
                  </label>

                  <div className="pt-2 border-t border-slate-200 font-semibold text-slate-800 text-[11px] mb-1">
                    Digital Access Revocation:
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={adminChecklist.emailDeactivated}
                      onChange={(e) => setAdminChecklist({ ...adminChecklist, emailDeactivated: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span className="font-semibold text-indigo-900">Email ID suspended / deleted</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={adminChecklist.systemAccessRevoked}
                      onChange={(e) => setAdminChecklist({ ...adminChecklist, systemAccessRevoked: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span className="font-semibold text-indigo-900">SSO & Internal System Access revoked</span>
                  </label>
                </div>
              )}

              {/* 3. Accounts Items */}
              {stageKey === 'ACCOUNTS_CLEARANCE' && (
                <div className="space-y-2 text-xs text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={accountsChecklist.travelAdvancesCleared}
                      onChange={(e) => setAccountsChecklist({ ...accountsChecklist, travelAdvancesCleared: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>Travel Advances settled (INR 0.00 outstanding)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={accountsChecklist.staffLoansCleared}
                      onChange={(e) => setAccountsChecklist({ ...accountsChecklist, staffLoansCleared: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>Staff Loans & advances repaid</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={accountsChecklist.salaryAdvancesCleared}
                      onChange={(e) => setAccountsChecklist({ ...accountsChecklist, salaryAdvancesCleared: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>Salary advances reconciled</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={accountsChecklist.imprestSettled}
                      onChange={(e) => setAccountsChecklist({ ...accountsChecklist, imprestSettled: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>Imprest / Petty Cash balances settled</span>
                  </label>
                </div>
              )}

              {/* 4. Personnel Items */}
              {stageKey === 'PERSONNEL_CLEARANCE' && (
                <div className="space-y-2 text-xs text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={personnelChecklist.idCardReturned}
                      onChange={(e) => setPersonnelChecklist({ ...personnelChecklist, idCardReturned: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>Physical Employee ID Card returned</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={personnelChecklist.accessCardReturned}
                      onChange={(e) => setPersonnelChecklist({ ...personnelChecklist, accessCardReturned: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>Facility RFID access / swipe card surrendered</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={personnelChecklist.businessCardsSurrendered}
                      onChange={(e) => setPersonnelChecklist({ ...personnelChecklist, businessCardsSurrendered: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>Official company business cards surrendered</span>
                  </label>
                </div>
              )}

              {/* 5. HR Items */}
              {stageKey === 'HR_FINAL_CLEARANCE' && (
                <div className="space-y-2 text-xs text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hrChecklist.exitInterviewCompleted}
                      onChange={(e) => setHrChecklist({ ...hrChecklist, exitInterviewCompleted: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>Exit interview questionnaire completed</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hrChecklist.resignationAcceptanceSigned}
                      onChange={(e) => setHrChecklist({ ...hrChecklist, resignationAcceptanceSigned: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>Resignation Acceptance and Restrictive Covenants signed</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hrChecklist.finalSettlementApproved}
                      onChange={(e) => setHrChecklist({ ...hrChecklist, finalSettlementApproved: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>Final settlement & certificate generation approved</span>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Remarks / Comments <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Provide sign-off remarks, asset conditions, or reason for rejection..."
              className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isAuthorized}
              className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                decision === 'APPROVE'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
              }`}
            >
              {isSubmitting
                ? 'Processing...'
                : !isAuthorized
                ? `Restricted to ${requiredRole}`
                : decision === 'APPROVE'
                ? 'Confirm Approval'
                : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
