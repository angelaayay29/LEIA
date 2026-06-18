import { useAuth } from '../context/AuthContext';

interface EditableFieldProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  multiline?: boolean;
}

export function EditableField({ value, onChange, className = '', multiline = false }: EditableFieldProps) {
  const { isEditor } = useAuth();

  if (!isEditor) {
    return <span className={className}>{value}</span>;
  }

  if (multiline) {
    return (
      <textarea
        className={`editable-input ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
      />
    );
  }

  return (
    <input
      className={`editable-input ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

interface EditableNumberProps {
  value: number;
  onChange: (val: number) => void;
  className?: string;
}

export function EditableNumber({ value, onChange, className = '' }: EditableNumberProps) {
  const { isEditor } = useAuth();

  if (!isEditor) {
    return <span className={className}>{value}</span>;
  }

  return (
    <input
      className={`editable-input ${className}`}
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ width: '80px' }}
    />
  );
}
