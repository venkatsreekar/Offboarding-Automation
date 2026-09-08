import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { ClearanceActionModal } from '../../components/ClearanceActionModal.jsx';
import {
  ClipboardCheck,
  Clock,
  ArrowRight,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Building,
} from 'lucide-react';

export const MyTasksView = ({ currentPersona, onSelectCase }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Clearance Modal
  const [activeModalTask, setActiveModalTask] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await api.getMyTasks(currentPersona.role, currentPersona.userId);
      setTasks(data);
    } catch (err) {
      console.error('Failed to load pending tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [currentPersona]);

  const getStageKeyForRole = (role) => {
    const map = {
      REPORTING_MANAGER: 'REPORTING_MANAGER_CLEARANCE',
      ADMIN_SYSTEMS: 'ADMIN_SYSTEMS_CLEARANCE',
      ACCOUNTS: 'ACCOUNTS_CLEARANCE',
      PERSONNEL: 'PERSONNEL_CLEARANCE',
      HR_ADMIN: 'HR_FINAL_CLEARANCE',
    };
    return map[role] || 'ADMIN_SYSTEMS_CLEARANCE';
  };

  const getStageNameForRole = (role) => {
    const map = {
      REPORTING_MANAGER: 'Reporting Manager Clearance',
      ADMIN_SYSTEMS: 'Admin & Systems Clearance',
      ACCOUNTS: 'Accounts & Finance Clearance',
      PERSONNEL: 'Personnel & Facilities Clearance',
      HR_ADMIN: 'HR Final Certification',
    };
    return map[role] || 'Department Clearance';
  };

  const handleSubmitClearance = async (payload) => {
    if (!activeModalTask) return;
    const stageKey = getStageKeyForRole(currentPersona.role);

    await api.submitClearance(activeModalTask._id, stageKey, {
      ...payload,
      actorUserId: currentPersona.userId || 'admin_user',
      actorRole: currentPersona.role,
      actorName: currentPersona.name,
    });

    await fetchTasks();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Approver Action Queue</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              {tasks.length} Pending
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Displaying clearance verification tasks requiring sign-off for:{' '}
            <span className="font-bold text-indigo-700">{currentPersona.department}</span> ({currentPersona.role})
          </p>
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading your clearance tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">All Caught Up!</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            There are no pending offboarding clearance tasks waiting for your role ({currentPersona.role}). Use the top persona switcher to simulate other departments!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => {
            const emp = task.employeeId;

            return (
              <div
                key={task._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-100 to-blue-50 border border-indigo-200 text-indigo-700 font-bold flex items-center justify-center text-sm">
                        {emp?.name?.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{emp?.name}</h4>
                        <p className="text-xs text-slate-500">
                          {emp?.designation} • <span className="font-semibold">{emp?.department}</span>
                        </p>
                        <span className="text-[10px] font-mono text-slate-400">{emp?.employeeId}</span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                      Action Pending
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px]">Last Working Day: </span>
                      <div className="font-bold text-slate-800">
                        {new Date(task.lastWorkingDay).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">Workflow Step: </span>
                      <div className="font-semibold text-indigo-700">
                        Step {task.workflowInstanceId?.currentStepOrder || 2} of 3
                      </div>
                    </div>
                  </div>

                  {task.notes && (
                    <div className="mt-2.5 p-2 rounded-lg bg-slate-50 text-[11px] text-slate-600 border border-slate-200/60">
                      <span className="font-semibold text-slate-700">Note: </span>
                      {task.notes}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onSelectCase(task._id)}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    View Full Case
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveModalTask(task)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    Review & Clear
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Clearance Modal */}
      {activeModalTask && (
        <ClearanceActionModal
          isOpen={true}
          onClose={() => setActiveModalTask(null)}
          offboardingId={activeModalTask._id}
          stageKey={getStageKeyForRole(currentPersona.role)}
          stageName={getStageNameForRole(currentPersona.role)}
          employeeName={activeModalTask.employeeId?.name || 'Employee'}
          currentPersona={currentPersona}
          onSubmitClearance={handleSubmitClearance}
        />
      )}
    </div>
  );
};
