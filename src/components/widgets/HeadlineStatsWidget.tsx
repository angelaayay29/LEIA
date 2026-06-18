import type { HeadlineStat } from '../../types';
import type { WidgetMeta } from '../../types';
import { EditableField } from '../EditableField';
import { WidgetTooltip } from '../WidgetTooltip';
import { useState } from 'react';

interface HeadlineStatsProps {
  stats: HeadlineStat[];
  statMeta?: Record<string, WidgetMeta>;
  onUpdate?: (stats: HeadlineStat[]) => void;
}

export function HeadlineStatsWidget({ stats, statMeta, onUpdate }: HeadlineStatsProps) {
  const [hoveredStat, setHoveredStat] = useState<string | null>(null);

  const updateStat = (index: number, field: keyof HeadlineStat, val: string) => {
    if (!onUpdate) return;
    const next = [...stats];
    next[index] = { ...next[index], [field]: val };
    onUpdate(next);
  };

  return (
    <div>
      <div className="section-title">Headline Stats</div>
      <div className="stat-grid">
        {stats.map((stat, i) => (
          <div
            key={stat.id}
            className="stat-card"
            style={{ position: 'relative' }}
            onMouseEnter={() => setHoveredStat(stat.id)}
            onMouseLeave={() => setHoveredStat(null)}
          >
            {statMeta?.[stat.id] && hoveredStat === stat.id && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100 }}>
                <WidgetTooltip meta={statMeta[stat.id]} />
              </div>
            )}
            <div className={`stat-value${stat.healthColor ? ` ${stat.healthColor}` : ''}`}>
              <EditableField
                value={stat.value}
                onChange={(v) => updateStat(i, 'value', v)}
              />
            </div>
            <div className="stat-label">
              <EditableField
                value={stat.label}
                onChange={(v) => updateStat(i, 'label', v)}
              />
            </div>
            {stat.delta && (
              <span className={`stat-delta ${stat.deltaDirection ?? 'neutral'}`}>
                <EditableField value={stat.delta} onChange={(v) => updateStat(i, 'delta', v)} />
              </span>
            )}
            {stat.subNote && (
              <div className="stat-sub">
                <EditableField value={stat.subNote} onChange={(v) => updateStat(i, 'subNote', v)} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
