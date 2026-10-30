import React from 'react';
import { getRiskColor, getRiskLevel } from '../../utils/detectionEngine';

interface RiskGaugeProps {
  score: number | null;
  size?: number; // diameter in px
  strokeWidth?: number;
  showLabel?: boolean;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  size = 110,
  strokeWidth = 9,
  showLabel = true,
}) => {
  const isInsufficient = score === null || isNaN(score);
  const validScore = isInsufficient ? 0 : Math.min(100, Math.max(0, score));
  const level = isInsufficient ? 'Low' : getRiskLevel(validScore);
  const color = getRiskColor(level);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Arc covering 240 degrees
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * validScore) / 100;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="rotate-[135deg] transform origin-center"
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Progress Arc */}
          {!isInsufficient && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={color.hex}
              strokeWidth={strokeWidth}
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          )}
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {isInsufficient ? (
            <span className="text-xs font-semibold text-slate-400">N/A</span>
          ) : (
            <>
              <span className="text-2xl font-extrabold tracking-tight text-slate-800">
                {validScore}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 -mt-1">
                Score / 100
              </span>
            </>
          )}
        </div>
      </div>

      {showLabel && (
        <div className="mt-1 flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: isInsufficient ? '#94A3B8' : color.hex }}
          />
          <span className="text-xs font-bold" style={{ color: isInsufficient ? '#64748B' : color.hex }}>
            {isInsufficient ? 'Insufficient Data' : `${level} Risk`}
          </span>
        </div>
      )}
    </div>
  );
};
