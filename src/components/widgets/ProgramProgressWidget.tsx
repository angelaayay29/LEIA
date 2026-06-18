import type { ProgramSnapshot, WorkstreamProgress } from '../../types';
import { EditableField, EditableNumber } from '../EditableField';

interface ProgramProgressProps {
  programs: ProgramSnapshot[];
  workstreams: WorkstreamProgress[];
  onUpdatePrograms?: (p: ProgramSnapshot[]) => void;
  onUpdateWorkstreams?: (w: WorkstreamProgress[]) => void;
}

export function ProgramProgressWidget({
  programs,
  workstreams,
  onUpdatePrograms,
  onUpdateWorkstreams,
}: ProgramProgressProps) {
  const statusPill = (status: string, color: string) => {
    const cls = color === 'green' ? 'pill-green' : color === 'amber' ? 'pill-amber' : 'pill-red';
    return <span className={`pill ${cls}`}>{status}</span>;
  };

  const wsStatusPill = (status: string) => {
    const cls = status === 'On track' ? 'pill-green' : status === 'At risk' ? 'pill-amber' : 'pill-red';
    return <span className={`pill ${cls}`}>{status}</span>;
  };

  return (
    <div>
      <div className="widget-section-title">Program & Capability Progress</div>

      <div className="subsection-title">Program Snapshot</div>
      <div className="program-grid">
        {programs.map((prog, i) => (
          <div key={prog.name} className="program-card">
            <div className="program-card-header">
              <h4>{prog.name}</h4>
              {statusPill(prog.status, prog.statusColor)}
            </div>
            <div className="program-pct" style={{ color: prog.color }}>
              <EditableNumber
                value={prog.percentage}
                onChange={(v) => {
                  const next = [...programs];
                  next[i] = { ...next[i], percentage: v };
                  onUpdatePrograms?.(next);
                }}
              />%
            </div>
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{ width: `${prog.percentage}%`, background: prog.color }}
              />
            </div>
            <div className="program-meta">
              <EditableField
                value={prog.delta}
                onChange={(v) => {
                  const next = [...programs];
                  next[i] = { ...next[i], delta: v };
                  onUpdatePrograms?.(next);
                }}
              />
              {' · '}
              <EditableField
                value={prog.remaining}
                onChange={(v) => {
                  const next = [...programs];
                  next[i] = { ...next[i], remaining: v };
                  onUpdatePrograms?.(next);
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="subsection-title" style={{ marginTop: '1.5rem' }}>Capability Workstream Progress</div>
      <div className="workstream-list">
        {workstreams.map((ws, i) => (
          <div key={ws.name} className="workstream-row">
            <span className="workstream-name">{ws.name}</span>
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${ws.percentage}%`,
                  background: ws.status === 'On track' ? '#10b981' : ws.status === 'At risk' ? '#f59e0b' : '#ef4444',
                }}
              />
            </div>
            <span className="workstream-pct">
              <EditableNumber
                value={ws.percentage}
                onChange={(v) => {
                  const next = [...workstreams];
                  next[i] = { ...next[i], percentage: v };
                  onUpdateWorkstreams?.(next);
                }}
              />%
            </span>
            {wsStatusPill(ws.status)}
          </div>
        ))}
      </div>
    </div>
  );
}
