import { EditableField } from '../EditableField';
import { useAuth } from '../../context/AuthContext';

interface AiInsightProps {
  title: string;
  text: string;
  onUpdate?: (text: string) => void;
}

export function AiInsightWidget({ title, text, onUpdate }: AiInsightProps) {
  const { isEditor } = useAuth();

  return (
    <div className="ai-insight-card">
      <h3>{title}</h3>
      {isEditor ? (
        <EditableField value={text} onChange={(v) => onUpdate?.(v)} multiline />
      ) : (
        <p>{text}</p>
      )}
    </div>
  );
}
