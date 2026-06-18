import type { ActionItem } from '../../types';

interface RetroRisksWidgetProps {
  actionItems: ActionItem[];
}

const statusPill: Record<string, string> = {
  New: 'pill-green',
  'In Progress': 'pill-cyan',
  Carried: 'pill-amber',
};

export function RetroRisksWidget({ actionItems }: RetroRisksWidgetProps) {
  const carried = actionItems.filter((a) => a.status === 'Carried');
  const others = actionItems.filter((a) => a.status !== 'Carried');

  return (
    <div>
      <div className="widget-section-title">Risks & Follow-up</div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Retro action items track process improvement commitments. Carried items indicate the team is not closing the loop.
      </p>

      {carried.length > 0 && (
        <>
          <div className="subsection-title">Carried Forward ({carried.length})</div>
          <div className="risk-list" style={{ marginBottom: '1rem' }}>
            {carried.map((item, i) => (
              <div key={i} className="risk-item" style={{ borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                <div className="severity-dot medium" />
                <div>
                  <div className="risk-desc">{item.description}</div>
                  <div className="risk-resolution">Owner: {item.owner} · Due: {item.dueSprint}</div>
                </div>
                <span className={`pill ${statusPill[item.status]}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="subsection-title">All Action Items</div>
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
          {[...carried, ...others].map((item, i) => (
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
