import React from 'react';
import type { MatchTier } from '../../utils/ml/linear/models';
import { Tooltip } from '../ui/Tooltip';

export const TIER_COLORS: Record<MatchTier, string> = {
  'Strong Match': '#4A5E47',
  'Good Match': '#6F876A',
  'Moderate Match': '#AC9784',
  'Low Match': '#C6B5A3'
};

const EXPLAINER = 'How closely this job matches your profile and preferences — not a prediction of getting hired.';

interface MatchScoreProps {
  score: number;
  tier: MatchTier;
  size?: 'md' | 'lg';
  showTier?: boolean;
}

export function MatchScore({ score, tier, size = 'md', showTier = true }: MatchScoreProps) {
  const dim = size === 'lg' ? 64 : 40;
  const stroke = size === 'lg' ? 6 : 4;
  const r = (dim - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = TIER_COLORS[tier];

  return (
    <Tooltip content={EXPLAINER} align="end">
      <span tabIndex={0} className="flex shrink-0 items-center gap-2.5 rounded-md" aria-label={`${score}% match. ${tier}. ${EXPLAINER}`}>
        <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} className="-rotate-90" aria-hidden="true">
          <circle cx={dim / 2} cy={dim / 2} r={r} stroke="#EDE6DA" strokeWidth={stroke} fill="none" />
          <circle cx={dim / 2} cy={dim / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={`${c * score / 100} ${c}`} />
        </svg>
        <span className="leading-tight">
          <span className={`block whitespace-nowrap font-semibold tabular-nums text-ink ${size === 'lg' ? 'text-2xl' : 'text-[15px]'}`}>{score}% Match</span>
          {showTier && <span className="hidden whitespace-nowrap text-xs text-ink-muted sm:block">{tier}</span>}
        </span>
      </span>
    </Tooltip>);

}