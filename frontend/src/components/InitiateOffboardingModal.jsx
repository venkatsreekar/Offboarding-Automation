import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { X, UserPlus, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';

export const InitiateOffboardingModal = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [resignationDate, setResignationDate] = useState(new Date().toISOString().split('T')[0]);
  const [lastWorkingDay, setLastWorkingDay] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  );
  const [reason, setReason] = useState('Career advancement');
  const [notes, setNotes] = useState('Standard 30 days notice period.');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    api.getEmployees({ status: 'ACTIVE' }).then(setEmployees).catch(console.error);
  }, []);

  const selectedEmployee = employees.find((e) => e._id === selectedEmployeeId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployeeId) {
      setErrorMsg('Please select an employee.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      await api.initiateOffboarding({
        employeeId: selectedEmployeeId,
        resignationDate,
        lastWorkingDay,
        reason,
        notes,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to initiate offboarding.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Initiate Employee Offboarding</h3>
              <p className="text-xs text-slate-500">Launches approval workflow & generates acceptance letter</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Employee Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Departing Employee <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">-- Choose Employee --</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} ({emp.employeeId}) — {emp.designation} [{emp.department}]
                </option>
              ))}
            </select>
          </div>

          {/* Auto-populated Employee Details Card */}
          {selectedEmployee && (
            <div className="p-3.5 rounded-xl bg-indigo-50/40 border border-indigo-100 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 text-[11px]">Department: </span>
                <span className="font-semibold text-slate-800">{selectedEmployee.department}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Designation: </span>
                <span className="font-semibold text-slate-800">{selectedEmployee.designation}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Joining Date: </span>
                <span className="font-semibold text-slate-800">
                  {new Date(selectedEmployee.joiningDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Reporting Manager: </span>
                <span className="font-semibold text-indigo-700">
                  {typeof selectedEmployee.reportingManagerId === 'object'
                    ? selectedEmployee.reportingManagerId?.name
                    : 'Auto-resolved'}
                </span>
              </div>
            </div>
          )}

          {/* Dates Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Resignation Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={resignationDate}
                onChange={(e) => setResignationDate(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Last Working Day (LWD) <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={lastWorkingDay}
                onChange={(e) => setLastWorkingDay(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Separation Reason <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Higher Studies, Relocation, Career Growth"
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Internal HR Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional handover instructions, notice waivers, etc."
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Workflow Chain Preview */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 text-indigo-700 font-bold mb-1">
              <ShieldCheck className="w-4 h-4" />
              Workflow Pipeline to be Created:
            </div>
            <p className="text-[11px] text-slate-600">
              Step 1: Reporting Manager ➔ Step 2: Admin & Systems, Accounts, Personnel (Parallel) ➔ Step 3: HR Final Sign-off.
            </p>
          </div>

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
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Initiating...' : 'Launch Clearance Workflow'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
