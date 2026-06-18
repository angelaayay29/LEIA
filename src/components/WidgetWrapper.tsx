import { useState, type ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { WidgetMeta } from '../types';
import { WidgetTooltip } from './WidgetTooltip';

interface WidgetWrapperProps {
  id: string;
  meta: WidgetMeta;
  children: ReactNode;
}

export function WidgetWrapper({ id, meta, children }: WidgetWrapperProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`widget-wrapper${isDragging ? ' dragging' : ''}`}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className="widget-info-icon"
        onMouseEnter={() => setShowTooltip(true)}
        onClick={() => setShowTooltip((v) => !v)}
        title="Widget info"
      >
        i
      </div>
      <div className="widget-drag-handle" {...attributes} {...listeners} title="Drag to reorder">
        ⠿
      </div>
      {showTooltip && <WidgetTooltip meta={meta} />}
      {children}
    </div>
  );
}
