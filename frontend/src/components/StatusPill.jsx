import React from 'react';

export const StatusPill = ({ status, size = 'sm' }) => {
  const getStyle = () => {
    switch (status?.toUpperCase()) {
      case 'CLEARED':
      case 'APPROVED':
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'IN_PROGRESS':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PENDING':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'URGENT':
        return 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse';
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'IN_OFFBOARDING':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'OFFBOARDED':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getDotColor = () => {
    switch (status?.toUpperCase()) {
      case 'CLEARED':
      case 'APPROVED':
      case 'COMPLETED':
        return 'bg-emerald-500';
      case 'IN_PROGRESS':
        return 'bg-blue-500 animate-ping';
      case 'PENDING':
        return 'bg-slate-400';
      case 'REJECTED':
        return 'bg-rose-500';
      case 'URGENT':
        return 'bg-amber-500';
      default:
        return 'bg-slate-400';
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }[size] || 'text-xs px-2.5 py-0.5';

  const formatText = (text) => {
    if (!text) return '';
    return text.replace(/_/g, ' ');
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-full ${getStyle()} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${getDotColor()}`} />
      {formatText(status)}
    </span>
  );
};
