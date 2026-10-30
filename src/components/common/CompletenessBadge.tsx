import React from 'react';
import { CompletenessStatus } from '../../types';

interface CompletenessBadgeProps {
  pct: number;
  status?: CompletenessStatus;
  showPercent?: boolean;
}

export const CompletenessBadge: React.FC<CompletenessBadgeProps> = ({
  pct,
  status,
  showPercent = true,
}) => {
  let effectiveStatus: CompletenessStatus = status || 'Complete';
  if (!status) {
    if (pct >= 90) effectiveStatus = 'Complete';
    else if (pct >= 70) effectiveStatus = 'Partial';
    else effectiveStatus = 'Incomplete';
  }

  let colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let dotColor = 'bg-emerald-500';

  if (effectiveStatus === 'Partial') {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
    dotColor = 'bg-amber-500';
  } else if (effectiveStatus === 'Incomplete') {
    colorClasses = 'bg-red-50 text-red-700 border-red-200';
    dotColor = 'bg-red-500';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClasses}`}
      title={`Data quality: ${pct}% complete. Missing data is re-weighted automatically without assuming zero.`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{effectiveStatus}</span>
      {showPercent && <span className="opacity-75 font-mono">{pct}%</span>}
    </span>
  );
};
