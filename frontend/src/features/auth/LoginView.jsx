import React, { useState } from 'react';
import { DEMO_PERSONAS } from '../../components/Header.jsx';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  Building,
  Laptop,
  Landmark,
  Award,
  KeyRound,
  CheckCircle2,
  User,
  Users,
  Briefcase,
} from 'lucide-react';

export const LoginView = ({ onLogin }) => {
  const [selectedPersona, setSelectedPersona] = useState(DEMO_PERSONAS[0]); // Rahul Kumar (Employee)
  const [email, setEmail] = useState(`${DEMO_PERSONAS[0].name.toLowerCase().replace(/\s+/g, '.')}@blazeup.test`);
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [personaFilter, setPersonaFilter] = useState('ALL');

  const handleSelectPersona = (p) => {
    setSelectedPersona(p);
    setEmail(`${p.name.toLowerCase().replace(/\s+/g, '.')}@blazeup.test`);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onLogin(selectedPersona);
  };

  const getPersonaIcon = (role) => {
    switch (role) {
      case 'EMPLOYEE':
        return <User className="w-5 h-5 text-indigo-600" />;
      case 'REPORTING_MANAGER':
        return <Briefcase className="w-5 h-5 text-blue-600" />;
      case 'ADMIN_SYSTEMS':
        return <Laptop className="w-5 h-5 text-cyan-600" />;
      case 'ACCOUNTS':
        return <Landmark className="w-5 h-5 text-emerald-600" />;
      case 'PERSONNEL':
        return <Building className="w-5 h-5 text-purple-600" />;
      case 'HR_ADMIN':
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <UserCheck className="w-5 h-5 text-slate-600" />;
    }
  };

  const filteredPersonas = DEMO_PERSONAS.filter((p) => {
    if (personaFilter === 'EMPLOYEE') return p.role === 'EMPLOYEE';
    if (personaFilter === 'APPROVER') return p.role !== 'EMPLOYEE' && p.role !== 'HR_ADMIN';
    if (personaFilter === 'HR') return p.role === 'HR_ADMIN';
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden shadow-2xl border border-slate-700/60 bg-white/5 backdrop-blur-xl">
        {/* Left Col: Hero Branding & Problem Statement Mission */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-600 to-indigo-900 p-8 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white text-indigo-700 flex items-center justify-center font-black text-2xl shadow-lg">
                B
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight">BlazeUp HROS</h1>
                <p className="text-[11px] text-indigo-200 font-medium">Terralogic Automation Suite</p>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-indigo-100 backdrop-blur-xs border border-white/20">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                Enterprise Clearance Portal
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight leading-snug">
                Automated Employee Offboarding & Digital Clearances
              </h2>
              <p className="text-xs text-indigo-200 leading-relaxed">
                Replacing manual paper No Objection Certificates (NOC) with an auditable, role-isolated, multi-department workflow engine.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-indigo-400/30 text-xs text-indigo-200 space-y-2.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>
                <strong className="text-white">Employee Self-Service:</strong> Raise resignation ticket & track live clearances
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>
                <strong className="text-white">Role Isolation (RBAC):</strong> Each persona only sees and clears authorized tasks
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>
                <strong className="text-white">Digital Document Delivery:</strong> Certified PDF acceptance, NOC, and relieving letters
              </span>
            </div>
          </div>
        </div>

        {/* Right Col: SSO Credentials & Evaluator One-Click Persona Login */}
        <div className="lg:col-span-7 bg-white text-slate-900 p-8 flex flex-col justify-between max-h-[90vh] overflow-y-auto">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Single Sign-On (SSO)</h3>
                <p className="text-xs text-slate-500 mt-0.5">Select a role persona to log into their isolated portal</p>
              </div>
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                BlazeUp IdP
              </span>
            </div>

            {/* Persona Quick Filters */}
            <div className="mt-4 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Filter:</span>
              {[
                { id: 'ALL', label: 'All Roles (8)' },
                { id: 'EMPLOYEE', label: '👤 Employees' },
                { id: 'APPROVER', label: '🏢 Approvers' },
                { id: 'HR', label: '🎖️ HR Admin' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setPersonaFilter(tab.id)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    personaFilter === tab.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Evaluator 1-Click Persona Cards */}
            <div className="mt-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {filteredPersonas.map((p) => {
                  const isSelected = selectedPersona.userId === p.userId && selectedPersona.name === p.name;
                  return (
                    <button
                      key={p.userId || p.name}
                      type="button"
                      onClick={() => handleSelectPersona(p)}
                      className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/30'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs shrink-0">
                        {getPersonaIcon(p.role)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 truncate">{p.name}</span>
                          <span className="text-[9px] font-mono font-bold text-slate-400">{p.employeeId}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">{p.designation}</div>
                        <div className="text-[9px] font-bold text-indigo-700 mt-0.5 truncate flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
                          {p.statusTag || p.role.replace(/_/g, ' ')}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Persona Confirmation & Login Form */}
            <form onSubmit={handleFormSubmit} className="mt-4 pt-3 border-t border-slate-100 space-y-3">
              <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-indigo-700">Signing In As</span>
                  <div className="text-xs font-black text-slate-900">{selectedPersona.name}</div>
                  <div className="text-[10px] text-slate-500">
                    Role: <strong className="text-indigo-700">{selectedPersona.role.replace(/_/g, ' ')}</strong> • Department: {selectedPersona.department}
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-white text-indigo-700 border border-indigo-200 shadow-2xs">
                  {selectedPersona.employeeId}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Enterprise Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                  />
                  <span>Remember session</span>
                </label>
                <span className="text-slate-400 text-[11px]">Strict RBAC Session</span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
              >
                <span>Enter Portal as {selectedPersona.name}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>🔒 Strict Role-Based Session Enforcement</span>
            <span>Terralogic BlazeUp HROS v2.4</span>
          </div>
        </div>
      </div>
    </div>
  );
};
