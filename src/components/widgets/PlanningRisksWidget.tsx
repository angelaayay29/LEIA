import type { RiskItem } from '../../types';
import { EditableField } from '../EditableField';

interface PlanningRisksWidgetProps {
  risks: RiskItem[];
  onUpdate?: (risks: RiskItem[]) => void;
}

const severityPill: Record<string, string> = {
  High: 'pill-red',
  Medium: 'pill-amber',
  Low: 'pill-green',
};

const severityDot: Record<string, string> = {
  High: 'high',
  Medium: 'medium',
  Low: 'low',
};

export function PlanningRisksWidget({ risks, onUpdate }: PlanningRisksWidgetProps) {
  const sorted = [...risks].sort((a, b) => {
    const order = { High: 0, Medium: 1, Low: 2 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <div>
      <div className="widget-section-title">Risks & Blockers</div>
      <div className="risk-list">
        {sorted.map((risk, i) => (
          <div key={i} className="risk-item">
            <div className={`severity-dot ${severityDot[risk.severity]}`} />
            <div>
              <div className="risk-desc">
                <EditableField
                  value={risk.description}
                  onChange={(v) => {
                    const next = [...risks];
                    next[i] = { ...next[i], description: v };
                    onUpdate?.(next);
                  }}
                />
              </div>
              <div className="risk-resolution">
                <EditableField
                  value={risk.resolution}
                  onChange={(v) => {
                    const next = [...risks];
                    next[i] = { ...next[i], resolution: v };
                    onUpdate?.(next);
                  }}
                />
              </div>
              <div className="risk-owner">Owner: {risk.owner}</div>
            </div>
            <span className={`pill ${severityPill[risk.severity]}`}>{risk.severity} risk</span>
          </div>
        ))}
      </div>
    </div>
  );
}
