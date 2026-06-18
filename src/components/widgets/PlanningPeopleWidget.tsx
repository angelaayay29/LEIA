import type { TeamCapacityRow } from '../../types';

interface PlanningPeopleWidgetProps {
  teamCapacity: TeamCapacityRow[];
  oooNotes?: string;
}

const variancePill: Record<string, { cls: string; label: string }> = {
  avg: { cls: 'pill-blue', label: '= Avg' },
  above: { cls: 'pill-green', label: '↑ Above' },
  below: { cls: 'pill-red', label: '↓ Below' },
};

export function PlanningPeopleWidget({ teamCapacity, oooNotes }: PlanningPeopleWidgetProps) {
  const engRows = teamCapacity.filter((r) => r.role === 'Eng');
  const dpeRows = teamCapacity.filter((r) => r.role === 'DPE');

  const renderGroup = (label: string, rows: TeamCapacityRow[]) => (
    <>
      <tr className="group-header">
        <td colSpan={5}>{label}</td>
      </tr>
      {rows.map((row, i) => {
        const v = variancePill[row.variance];
        return (
          <tr key={`${label}-${i}`}>
            <td>
              <div className="avatar-row">
                <span className="avatar">{row.initials}</span>
                {row.name}
              </div>
            </td>
            <td><span className="pill pill-purple">{row.role}</span></td>
            <td style={{ fontWeight: 700, fontSize: '1rem' }}>{row.committed}</td>
            <td style={{ color: 'var(--text-muted)' }}>{row.threeSprintAvg}</td>
            <td>
              <span className={`pill ${v.cls}`}>{v.label}</span>
              {row.availability && (
                <span className="pill pill-red" style={{ marginLeft: 6, fontSize: '0.6rem' }}>
                  {row.availability}
                </span>
              )}
            </td>
          </tr>
        );
      })}
    </>
  );

  return (
    <div>
      <div className="widget-section-title">Team Capacity & Benchmark</div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Team Member</th>
            <th>Role</th>
            <th>S24 Points</th>
            <th>3-Sprint Avg</th>
            <th>Variance</th>
          </tr>
        </thead>
        <tbody>
          {renderGroup('Engineering (Eng)', engRows)}
          {renderGroup('Data Product Engineering (DPE)', dpeRows)}
        </tbody>
      </table>
      {oooNotes && (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', fontStyle: 'italic' }}>
          {oooNotes}
        </p>
      )}
    </div>
  );
}
