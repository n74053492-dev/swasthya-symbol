import React from 'react';
import { RiskLevel } from '../../types';
import { getRiskColor } from '../../utils/detectionEngine';

interface RiskBadgeProps {
  level: RiskLevel | 'Insufficient Data';
  score?: number | null;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score, size = 'md' }) => {
  if (level === 'Insufficient Data' || score === null) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-300 ${
          size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3.5 py-1 text-sm' : 'px-2.5 py-0.5 text-xs'
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        Insufficient Data
      </span>
    );
  }

  const color = getRiskColor(level);

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${color.bg} ${color.border} ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3.5 py-1 text-sm' : 'px-2.5 py-0.5 text-xs'
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${color.dot} animate-pulse`} />
      <span>{level}</span>
      {score !== undefined && score !== null && (
        <span className="font-bold opacity-90">({score})</span>
      )}
    </span>
  );
};
