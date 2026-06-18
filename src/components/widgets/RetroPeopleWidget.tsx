import type { IndividualDelivery, HappinessBucket } from '../../types';

interface RetroPeopleWidgetProps {
  individualDelivery: IndividualDelivery[];
  happinessBuckets: HappinessBucket[];
  happinessTrend: number[];
  happinessAverage: number;
}

export function RetroPeopleWidget({
  individualDelivery,
  happinessBuckets,
  happinessTrend,
  happinessAverage,
}: RetroPeopleWidgetProps) {
  const engRows = individualDelivery.filter((r) => r.role === 'Eng');
  const dpeRows = individualDelivery.filter((r) => r.role === 'DPE');

  const statusPill = (status: string) => {
    const map: Record<string, string> = {
      'Full delivery': 'pill-green',
      Partial: 'pill-amber',
      '+Unplanned': 'pill-cyan',
    };
    return <span className={`pill ${map[status] ?? 'pill-blue'}`}>{status}</span>;
  };

  const renderGroup = (label: string, rows: IndividualDelivery[]) => (
    <>
      <tr className="group-header">
        <td colSpan={6}>{label}</td>
      </tr>
      {rows.map((row, i) => {
        const pct = row.assigned > 0 ? (row.completed / row.assigned) * 100 : 100;
        const barColor = row.status === 'Full delivery' ? '#10b981' : row.status === 'Partial' ? '#f59e0b' : '#06b6d4';
        return (
          <tr key={`${label}-${i}`}>
            <td>
              <div className="avatar-row">
                <span className="avatar">{row.initials}</span>
                {row.name}
              </div>
            </td>
            <td><span className="pill pill-purple">{row.role}</span></td>
            <td style={{ minWidth: 120 }}>
              <div className="delivery-bar-track">
                <div className="delivery-bar-fill" style={{ width: `${Math.min(pct, 100)}%`, background: barColor }} />
              </div>
            </td>
            <td>{row.completed} → {row.assigned || row.completed}</td>
            <td>{statusPill(row.status)}</td>
            <td>{row.workstream}</td>
          </tr>
        );
      })}
    </>
  );

  const maxTrend = Math.max(...happinessTrend, 10);

  return (
    <div>
      <div className="widget-section-title">People & Team Health</div>

      <div className="subsection-title">Individual Delivery</div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Team Member</th>
            <th>Role</th>
            <th>Progress</th>
            <th>Points</th>
            <th>Status</th>
            <th>Workstream</th>
          </tr>
        </thead>
        <tbody>
          {renderGroup('Engineering (Eng)', engRows)}
          {renderGroup('Data Product Engineering (DPE)', dpeRows)}
        </tbody>
      </table>

      <div className="subsection-title" style={{ marginTop: '1.5rem' }}>Team Happiness Index</div>
      <div className="happiness-grid">
        {happinessBuckets.map((b) => (
          <div key={b.label} className="happiness-card" style={{ background: `${b.color}18`, borderColor: `${b.color}40` }}>
            <div className="count" style={{ color: b.color }}>{b.count}</div>
            <div className="label" style={{ color: b.color }}>{b.label}</div>
            <div className="pct">{b.percentage}%</div>
          </div>
        ))}
      </div>

      <div className="subsection-title">Happiness Trend (Last 5 Sprints)</div>
      <div className="sparkline-container">
        {happinessTrend.map((score, i) => (
          <div
            key={i}
            className="sparkline-bar"
            style={{ height: `${(score / maxTrend) * 100}%` }}
          >
            <span className="bar-label">S{18 + i}</span>
          </div>
        ))}
      </div>
      <div className="sparkline-avg">Average happiness score: <strong>{happinessAverage}</strong></div>
    </div>
  );
}
