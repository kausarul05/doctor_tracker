const conditionConfig: Record<string, { bg: string; color: string; border: string }> = {
  Critical:           { bg: 'rgba(244,63,94,0.1)',   color: '#f43f5e', border: 'rgba(244,63,94,0.25)' },
  Stable:             { bg: 'rgba(16,185,129,0.1)',  color: '#10b981', border: 'rgba(16,185,129,0.25)' },
  Recovering:         { bg: 'rgba(59,130,246,0.1)',  color: '#60a5fa', border: 'rgba(59,130,246,0.25)' },
  Discharged:         { bg: 'rgba(139,92,246,0.1)',  color: '#a78bfa', border: 'rgba(139,92,246,0.25)' },
  'Under Observation':{ bg: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: 'rgba(245,158,11,0.25)' },
};

export default function ConditionBadge({ condition }: { condition: string }) {
  const cfg = conditionConfig[condition] || { bg: 'rgba(255,255,255,0.05)', color: '#8fa3c0', border: 'rgba(255,255,255,0.1)' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: '20px',
      fontSize: '11px', fontWeight: '600',
      letterSpacing: '0.04em', textTransform: 'uppercase',
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`,
    }}>
      {condition}
    </span>
  );
}
