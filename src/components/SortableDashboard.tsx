import { useEffect, type ReactNode } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { WidgetWrapper } from '../WidgetWrapper';
import { fireStarRain } from '../StarRain';
import type { WidgetMeta } from '../../types';

interface SortableDashboardProps {
  widgetOrder: string[];
  onReorder: (order: string[]) => void;
  widgetMeta: Record<string, WidgetMeta>;
  renderWidget: (id: string) => ReactNode;
}

export function SortableDashboard({
  widgetOrder,
  onReorder,
  widgetMeta,
  renderWidget,
}: SortableDashboardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    fireStarRain();
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = widgetOrder.indexOf(String(active.id));
    const newIndex = widgetOrder.indexOf(String(over.id));
    const next = [...widgetOrder];
    const [removed] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, removed);
    onReorder(next);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={widgetOrder} strategy={verticalListSortingStrategy}>
        {widgetOrder.map((id) => (
          <WidgetWrapper key={id} id={id} meta={widgetMeta[id]}>
            {renderWidget(id)}
          </WidgetWrapper>
        ))}
      </SortableContext>
    </DndContext>
  );
}
