import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Laptop,
  Landmark,
  UserCheck,
  Award,
} from 'lucide-react';

export const WorkflowPipelineVisualizer = ({
  workflowInstance,
  onSelectStage,
  selectedStageKey,
}) => {
  if (!workflowInstance) {
    return (
      <div className="p-6 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
        No active workflow instance associated with this request.
      </div>
    );
  }

  const findStage = (key) => {
    return workflowInstance.stageStates?.find((s) => s.stageKey === key);
  };

  const mgrStage = findStage('REPORTING_MANAGER_CLEARANCE');
  const adminStage = findStage('ADMIN_SYSTEMS_CLEARANCE');
  const accountsStage = findStage('ACCOUNTS_CLEARANCE');
  const personnelStage = findStage('PERSONNEL_CLEARANCE');
  const hrStage = findStage('HR_FINAL_CLEARANCE');

  const getNodeStyle = (stage) => {
    if (!stage) return 'bg-slate-50 border-slate-200 text-slate-400';
    switch (stage.status) {
      case 'APPROVED':
        return 'bg-emerald-50/80 border-emerald-300 text-emerald-900 shadow-sm';
      case 'IN_PROGRESS':
        return 'bg-blue-50/90 border-blue-400 text-blue-900 shadow-md ring-2 ring-blue-300/50 ring-offset-1';
      case 'REJECTED':
        return 'bg-rose-50 border-rose-300 text-rose-900';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-500';
    }
  };

  const getStatusIcon = (stage) => {
    if (!stage) return <Clock className="w-4 h-4 text-slate-400" />;
    switch (stage.status) {
      case 'APPROVED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'IN_PROGRESS':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'REJECTED':
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const renderStageCard = (stage, icon, subtitle, slaText) => {
    if (!stage) return null;
    const isSelected = selectedStageKey === stage.stageKey;

    return (
      <button
        type="button"
        onClick={() => onSelectStage?.(stage.stageKey)}
        className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${getNodeStyle(
          stage,
        )} ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2' : 'hover:border-slate-400'}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white/80 shadow-xs border border-slate-200/60">{icon}</div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider">{stage.name}</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">{getStatusIcon(stage)}</div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
          <span className="text-slate-500 font-mono">{slaText || 'SLA: 48h'}</span>
          <span
            className={`font-semibold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${
              stage.status === 'APPROVED'
                ? 'bg-emerald-100 text-emerald-800'
                : stage.status === 'IN_PROGRESS'
                ? 'bg-blue-100 text-blue-800 font-bold'
                : stage.status === 'REJECTED'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {stage.status}
          </span>
        </div>

        {stage.actionedByName && (
          <div className="mt-1.5 text-[10px] text-slate-600 truncate">
            ✓ Signed by: <span className="font-medium text-slate-800">{stage.actionedByName}</span>
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Configurable Approval Workflow Execution Chain
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Sequential Step 1 ➔ Parallel Department Step 2 ➔ Sequential Final Sign-off Step 3
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 font-mono font-medium rounded-md bg-slate-100 text-slate-700 border border-slate-200">
            Pipeline: {workflowInstance.definitionCode}
          </span>
          <span className="text-xs px-2.5 py-1 font-semibold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
            Step {workflowInstance.currentStepOrder} of 3
          </span>
        </div>
      </div>

      {/* Visual Pipeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch relative mt-2">
        {/* Step 1: Sequential Node (Manager) */}
        <div className="md:col-span-3 flex flex-col justify-center">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
            <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 inline-flex items-center justify-center text-[10px]">1</span>
            Sequential Gate
          </div>
          {renderStageCard(mgrStage, <UserCheck className="w-4 h-4 text-indigo-600" />, 'Project & KT Handover', 'SLA: 48h')}
        </div>

        {/* Connector 1 */}
        <div className="hidden md:flex md:col-span-1 flex-col items-center justify-center text-slate-300 font-bold">
          <div className="w-full h-0.5 bg-slate-200 relative">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-slate-400 rotate-45" />
          </div>
          <span className="text-[9px] uppercase tracking-tighter text-slate-400 mt-1">Unlocks</span>
        </div>

        {/* Step 2: Parallel Node Cluster (3 Departments) */}
        <div className="md:col-span-4 flex flex-col justify-center">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 inline-flex items-center justify-center text-[10px]">2</span>
              Parallel Clearances (Concurrent)
            </span>
            <span className="text-[9px] text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded">
              3 Departments
            </span>
          </div>

          <div className="space-y-2 border border-dashed border-indigo-200/80 rounded-xl p-2 bg-indigo-50/20">
            {renderStageCard(adminStage, <Laptop className="w-4 h-4 text-cyan-600" />, 'Admin & Systems Clearance', 'SLA: 72h')}
            {renderStageCard(accountsStage, <Landmark className="w-4 h-4 text-emerald-600" />, 'Accounts & Loans Clearance', 'SLA: 72h')}
            {renderStageCard(personnelStage, <ShieldCheck className="w-4 h-4 text-purple-600" />, 'Personnel & Badges Clearance', 'SLA: 72h')}
          </div>
        </div>

        {/* Connector 2 */}
        <div className="hidden md:flex md:col-span-1 flex-col items-center justify-center text-slate-300 font-bold">
          <div className="w-full h-0.5 bg-slate-200 relative">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-slate-400 rotate-45" />
          </div>
          <span className="text-[9px] uppercase tracking-tighter text-slate-400 mt-1">Converges</span>
        </div>

        {/* Step 3: Sequential Final Node (HR) */}
        <div className="md:col-span-3 flex flex-col justify-center">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
            <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 inline-flex items-center justify-center text-[10px]">3</span>
            Final Certification
          </div>
          {renderStageCard(hrStage, <Award className="w-4 h-4 text-amber-600" />, 'HR Director Sign-Off & PDFs', 'SLA: 24h')}
        </div>
      </div>
    </div>
  );
};
