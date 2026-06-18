import { Fragment } from 'react';
import type { ProgramGoals, CommittedWorkRow, VelocityBar } from '../../types';
import { EditableField } from '../EditableField';

interface PlanningWorkDetailProps {
  programGoals: ProgramGoals[];
  committedWork: CommittedWorkRow[];
  velocityHistory: VelocityBar[];
  avgVelocity: number;
  onUpdateGoals?: (g: ProgramGoals[]) => void;
}

const priorityPill: Record<string, string> = {
  High: 'pill-red',
  Medium: 'pill-amber',
  Low: 'pill-green',
};

const rolePill: Record<string, string> = {
  Both: 'pill-purple',
  Eng: 'pill-blue',
  DPE: 'pill-cyan',
};

export function PlanningWorkDetailWidget({
  programGoals,
  committedWork,
  velocityHistory,
  avgVelocity,
  onUpdateGoals,
}: PlanningWorkDetailProps) {
  const maxPoints = Math.max(...velocityHistory.map((v) => v.points), avgVelocity);
  const currentCommitted = velocityHistory.find((v) => v.isCurrent)?.points ?? 0;
  const delta = currentCommitted - avgVelocity;

  const grouped = committedWork.reduce<Record<string, CommittedWorkRow[]>>((acc, row) => {
    (acc[row.workstream] ??= []).push(row);
    return acc;
  }, {});

  return (
    <div>
      <div className="widget-section-title">Sprint Plan Detail</div>

      <div className="subsection-title">Sprint Goals by Program</div>
      <div className="goals-grid">
        {programGoals.map((pg, pi) => (
          <div key={pg.program} className="goal-section">
            <div className="goal-section-header" style={{ color: pg.color, borderColor: pg.color }}>
              {pg.program}
            </div>
            {pg.goals.map((goal, gi) => (
              <div key={gi} className="goal-item">
                <span className="goal-icon" style={{ color: goal.confirmed ? '#10b981' : '#f59e0b' }}>
                  {goal.confirmed ? '✓' : '○'}
                </span>
                <EditableField
                  value={goal.text}
                  onChange={(v) => {
                    const next = [...programGoals];
                    next[pi] = {
                      ...next[pi],
                      goals: next[pi].goals.map((g, j) => (j === gi ? { ...g, text: v } : g)),
                    };
                    onUpdateGoals?.(next);
                  }}
                />
                <span className="goal-owner">{goal.owner}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="subsection-title" style={{ marginTop: '1.5rem' }}>Committed Work</div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Workstream</th>
            <th>Story</th>
            <th>Program</th>
            <th>Role</th>
            <th>Points</th>
            <th>Priority</th>
            <th>Owners</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(grouped).map(([ws, rows]) => (
            <Fragment key={ws}>
              <tr className="group-header">
                <td colSpan={7}>{ws}</td>
              </tr>
              {rows.map((row, i) => (
                <tr key={`${ws}-${i}`}>
                  <td>
                    <span className="workstream-tag" style={{ background: row.workstreamColor }}>{row.workstream}</span>
                  </td>
                  <td>
                    <span style={{ color: 'var(--accent-cyan)', fontSize: '0.7rem' }}>{row.ticketKey}</span>
                    <br />
                    {row.storyName}
                  </td>
                  <td>
                    {row.programs.map((p) => (
                      <span key={p} className="pill pill-blue" style={{ marginRight: 4 }}>{p}</span>
                    ))}
                  </td>
                  <td><span className={`pill ${rolePill[row.role]}`}>{row.role}</span></td>
                  <td>{row.points}</td>
                  <td><span className={`pill ${priorityPill[row.priority]}`}>{row.priority}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {row.owners.map((o) => (
                        <span key={o} className="avatar" title={o}>
                          {o.split(' ').map((n) => n[0]).join('')}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>

      <div className="subsection-title" style={{ marginTop: '1.5rem' }}>Velocity & Commitment History</div>
      <div className="velocity-chart">
        <div
          className="velocity-avg-line"
          style={{ bottom: `${(avgVelocity / maxPoints) * 160}px` }}
        />
        <div className="velocity-callout">
          Committed: <strong>{currentCommitted} pts</strong><br />
          Avg velocity: <strong>{avgVelocity} pts</strong><br />
          Delta: <strong style={{ color: delta > 0 ? '#f59e0b' : '#10b981' }}>
            {delta > 0 ? '+' : ''}{delta} pts
          </strong>
        </div>
        {velocityHistory.map((bar) => (
          <div key={bar.sprint} className="velocity-bar-group">
            <div
              className={`velocity-bar ${bar.isCurrent ? 'current' : 'historical'}`}
              style={{ height: `${(bar.points / maxPoints) * 140}px` }}
              title={`${bar.sprint}: ${bar.points} pts`}
            />
            <span className="velocity-bar-label">{bar.sprint}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
