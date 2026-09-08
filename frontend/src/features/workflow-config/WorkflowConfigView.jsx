import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import {
  Sliders,
  ShieldCheck,
  Save,
  CheckCircle2,
  Clock,
  Layers,
  Code2,
  Sparkles,
  GitMerge,
  ArrowRight,
} from 'lucide-react';

export const WorkflowConfigView = () => {
  const [definition, setDefinition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showJson, setShowJson] = useState(false);

  useEffect(() => {
    fetchDefinition();
  }, []);

  const fetchDefinition = async () => {
    try {
      setLoading(true);
      const definitions = await api.getWorkflowDefinitions();
      const active = definitions.find((d) => d.code === 'EMPLOYEE_OFFBOARDING_V1') || definitions[0];
      setDefinition(active);
    } catch (err) {
      console.error('Failed to load workflow definition:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSlaChange = (stepIndex, stageIndex, newSla) => {
    const updated = JSON.parse(JSON.stringify(definition));
    updated.steps[stepIndex].stages[stageIndex].slaHours = parseInt(newSla, 10) || 24;
    setDefinition(updated);
  };

  const handleModeChange = (stepIndex, newMode) => {
    const updated = JSON.parse(JSON.stringify(definition));
    updated.steps[stepIndex].executionMode = newMode;
    setDefinition(updated);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.saveWorkflowDefinition(definition);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
      await fetchDefinition();
    } catch (err) {
      alert('Failed to save workflow definition: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !definition) {
    return (
      <div className="p-12 text-center text-slate-400">
        Loading workflow definition schema...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Workflow Engine Configuration</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
              Agnostic Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure approval stages, execution modes (Sequential vs Parallel), approver types, and SLAs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowJson(!showJson)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <Code2 className="w-4 h-4 text-slate-500" />
            {showJson ? 'Visual Editor' : 'View JSON Schema'}
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Workflow'}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Workflow definition successfully updated in MongoDB! New offboarding instances will follow this configuration.</span>
        </div>
      )}

      {/* Overview Metadata Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-medium">Pipeline Identifier:</span>
            <div className="font-mono font-bold text-slate-900 mt-0.5">{definition.code}</div>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Workflow Name:</span>
            <div className="font-bold text-slate-900 mt-0.5">{definition.name}</div>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Engine Architecture:</span>
            <div className="font-bold text-indigo-700 mt-0.5">Hierarchical State-Machine (Agnostic)</div>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Version / Status:</span>
            <div className="font-semibold text-emerald-600 mt-0.5">v{definition.version || 1} • Active</div>
          </div>
        </div>
      </div>

      {/* JSON Mode or Visual Mode */}
      {showJson ? (
        <div className="bg-slate-900 rounded-2xl p-5 shadow-xl text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800">
          <pre>{JSON.stringify(definition, null, 2)}</pre>
        </div>
      ) : (
        <div className="space-y-5">
          {definition.steps?.map((step, stepIdx) => (
            <div
              key={step.stepOrder}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs relative"
            >
              {/* Step Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-black text-sm flex items-center justify-center">
                    {step.stepOrder}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{step.name}</h3>
                    <p className="text-[11px] text-slate-400">
                      Step {step.stepOrder} • {step.stages?.length} Stage(s)
                    </p>
                  </div>
                </div>

                {/* Execution Mode Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Execution Mode:</span>
                  <select
                    value={step.executionMode}
                    onChange={(e) => handleModeChange(stepIdx, e.target.value)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${
                      step.executionMode === 'PARALLEL'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    <option value="SEQUENTIAL">Sequential (Gate)</option>
                    <option value="PARALLEL">Parallel (Concurrent)</option>
                  </select>
                </div>
              </div>

              {/* Stages List */}
              <div className="mt-4 space-y-3">
                {step.stages?.map((stage, stageIdx) => (
                  <div
                    key={stage.stageKey}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{stage.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 text-slate-700">
                          {stage.stageKey}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{stage.description}</p>
                      <div className="flex items-center gap-4 text-[11px] text-slate-600 pt-1">
                        <span>
                          Approver Resolver:{' '}
                          <strong className="text-indigo-700">
                            {stage.approverType === 'DYNAMIC_MANAGER'
                              ? 'Dynamic Employee Reporting Manager'
                              : `Department Role [${stage.requiredRole}]`}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {/* SLA Configuration */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          SLA Window (Hours)
                        </label>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <input
                            type="number"
                            min="1"
                            max="720"
                            value={stage.slaHours || 48}
                            onChange={(e) => handleSlaChange(stepIdx, stageIdx, e.target.value)}
                            className="w-16 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-indigo-500"
                          />
                          <span className="text-xs text-slate-500 font-semibold">hrs</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
