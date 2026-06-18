import type { SprintIdentity } from '../../types';
import { EditableField } from '../EditableField';

const pillClass: Record<string, string> = {
  blue: 'pill-blue',
  orange: 'pill-orange',
  green: 'pill-green',
  purple: 'pill-purple',
};

interface SprintHeaderProps {
  identity: SprintIdentity;
  onUpdate?: (identity: SprintIdentity) => void;
  isPlanning?: boolean;
}

export function SprintHeaderWidget({ identity, onUpdate, isPlanning }: SprintHeaderProps) {
  const update = (field: keyof SprintIdentity, val: string | number) => {
    onUpdate?.({ ...identity, [field]: val });
  };

  const metaParts = [
    identity.platform,
    identity.dateRange,
    isPlanning && identity.sprintLengthDays ? `${identity.sprintLengthDays} days` : null,
    !isPlanning ? `${identity.participants} participants` : null,
    `Scrum Master: ${identity.scrumMaster}`,
    isPlanning && identity.quarterWeek ? identity.quarterWeek : null,
  ].filter(Boolean);

  return (
    <div className="sprint-header">
      <h2>
        <EditableField
          value={identity.sprintName}
          onChange={(v) => update('sprintName', v)}
        />
      </h2>
      <div className="sprint-tags">
        {identity.status && <span className="pill pill-green">{identity.status}</span>}
        {identity.programTags.map((tag) => (
          <span key={tag.label} className={`pill ${pillClass[tag.color]}`}>{tag.label}</span>
        ))}
      </div>
      <div className="sprint-meta">{metaParts.join(' · ')}</div>
    </div>
  );
}
