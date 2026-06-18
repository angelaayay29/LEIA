import { Fragment } from 'react';
import type { CompletedWorkRow, RetroTheme, ActionItem } from '../../types';
import { EditableField } from '../EditableField';

interface RetroWorkDetailProps {
  completedWork: CompletedWorkRow[];
  wentWell: RetroTheme[];
  toImprove: RetroTheme[];
  actionItems: ActionItem[];
  onUpdateCompleted?: (w: CompletedWorkRow[]) => void;
  onUpdateWentWell?: (t: RetroTheme[]) => void;
  onUpdateToImprove?: (t: RetroTheme[]) => void;
  onUpdateActions?: (a: ActionItem[]) => void;
}

const statusPill: Record<string, string> = {
  New: 'pill-green',
  'In Progress': 'pill-cyan',
  Carried: 'pill-amber',
};

export function RetroWorkDetailWidget({
  completedWork,
  wentWell,
  toImprove,
  actionItems,
  onUpdateWentWell,
  onUpdateToImprove,
}: RetroWorkDetailProps) {
  const sortedActions = [...actionItems].sort((a, b) => {
    if (a.status === 'Carried' && b.status !== 'Carried') return -1;
    if (b.status === 'Carried' && a.status !== 'Carried') return 1;
    return 0;
  });

  const grouped = completedWork.reduce<Record<string, CompletedWorkRow[]>>((acc, row) => {
    (acc[row.workstream] ??= []).push(row);
    return acc;
  }, {});

  return (
    <div>
      <div className="widget-section-title">Sprint Delivery Detail</div>

      <div className="subsection-title">Completed Work</div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Workstream</th>
            <th>Story</th>
            <th>Program</th>
            <th>Points</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(grouped).map(([ws, rows]) => (
            <Fragment key={ws}>
              <tr className="group-header">
                <td colSpan={5}>{ws}</td>
              </tr>
              {rows.map((row, i) => (
                <tr key={`${ws}-${i}`}>
                  <td>
                    <span className="workstream-tag" style={{ background: row.workstreamColor }}>{row.workstream}</span>
                  </td>
                  <td>{row.storyName}</td>
                  <td><span className="pill pill-blue">{row.program}</span></td>
                  <td>{row.points}</td>
                  <td><span className="pill pill-green">Done</span></td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>

      <div className="subsection-title" style={{ marginTop: '1.5rem' }}>Retro Themes</div>
      <div className="theme-columns">
        <div className="theme-column well">
          <h4>What Went Well</h4>
          <ul>
            {wentWell.map((item, i) => (
              <li key={i}>
                <span className="theme-icon" style={{ color: '#10b981' }}>✓</span>
                <span>
                  <EditableField
                    value={item.text}
                    onChange={(v) => {
                      const next = [...wentWell];
                      next[i] = { ...next[i], text: v };
                      onUpdateWentWell?.(next);
                    }}
                  />
                  {item.recurring && <span className="recurring-badge">Recurring</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="theme-column improve">
          <h4>Areas to Improve</h4>
          <ul>
            {toImprove.map((item, i) => (
              <li key={i}>
                <span className="theme-icon" style={{ color: '#f59e0b' }}>⚠</span>
                <span>
                  <EditableField
                    value={item.text}
                    onChange={(v) => {
                      const next = [...toImprove];
                      next[i] = { ...next[i], text: v };
                      onUpdateToImprove?.(next);
                    }}
                  />
                  {item.recurring && <span className="recurring-badge">Recurring</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="subsection-title" style={{ marginTop: '1.5rem' }}>Action Items</div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Owner</th>
            <th>Due Sprint</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {sortedActions.map((item, i) => (
            <tr key={i}>
              <td>{item.description}</td>
              <td>
                <div className="avatar-row">
                  <span className="avatar">{item.owner.slice(0, 2).toUpperCase()}</span>
                  {item.owner}
                </div>
              </td>
              <td>{item.dueSprint}</td>
              <td><span className={`pill ${statusPill[item.status]}`}>{item.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
