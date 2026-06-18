import { useCallback } from 'react';
import { SortableDashboard } from '../components/SortableDashboard';
import { SprintHeaderWidget } from '../components/widgets/SprintHeaderWidget';
import { AiInsightWidget } from '../components/widgets/AiInsightWidget';
import { HeadlineStatsWidget } from '../components/widgets/HeadlineStatsWidget';
import { ProgramProgressWidget } from '../components/widgets/ProgramProgressWidget';
import { PlanningWorkDetailWidget } from '../components/widgets/PlanningWorkDetailWidget';
import { PlanningPeopleWidget } from '../components/widgets/PlanningPeopleWidget';
import { PlanningRisksWidget } from '../components/widgets/PlanningRisksWidget';
import { useData } from '../context/DataContext';
import { planningWidgetMeta, planningHeadlineStatMeta } from '../data/widgetMetadata';

export function PlanningPage() {
  const { planningData, updatePlanningData, planningWidgetOrder, setPlanningWidgetOrder } = useData();

  const renderWidget = useCallback(
    (id: string) => {
      switch (id) {
        case 'header':
          return (
            <SprintHeaderWidget
              identity={planningData.identity}
              isPlanning
              onUpdate={(identity) => updatePlanningData((d) => ({ ...d, identity }))}
            />
          );
        case 'ai-insight':
          return (
            <AiInsightWidget
              title="Going into Sprint 24"
              text={planningData.aiInsight}
              onUpdate={(text) => updatePlanningData((d) => ({ ...d, aiInsight: text }))}
            />
          );
        case 'headline-stats':
          return (
            <HeadlineStatsWidget
              stats={planningData.headlineStats}
              statMeta={planningHeadlineStatMeta}
              onUpdate={(headlineStats) => updatePlanningData((d) => ({ ...d, headlineStats }))}
            />
          );
        case 'program-progress':
          return (
            <ProgramProgressWidget
              programs={planningData.programSnapshots}
              workstreams={planningData.workstreamProgress}
              onUpdatePrograms={(programSnapshots) => updatePlanningData((d) => ({ ...d, programSnapshots }))}
              onUpdateWorkstreams={(workstreamProgress) => updatePlanningData((d) => ({ ...d, workstreamProgress }))}
            />
          );
        case 'work-detail':
          return (
            <PlanningWorkDetailWidget
              programGoals={planningData.programGoals}
              committedWork={planningData.committedWork}
              velocityHistory={planningData.velocityHistory}
              avgVelocity={planningData.avgVelocity}
              onUpdateGoals={(programGoals) => updatePlanningData((d) => ({ ...d, programGoals }))}
            />
          );
        case 'people-capacity':
          return (
            <PlanningPeopleWidget
              teamCapacity={planningData.teamCapacity}
              oooNotes={planningData.oooNotes}
            />
          );
        case 'risks-followup':
          return (
            <PlanningRisksWidget
              risks={planningData.risks}
              onUpdate={(risks) => updatePlanningData((d) => ({ ...d, risks }))}
            />
          );
        default:
          return null;
      }
    },
    [planningData, updatePlanningData],
  );

  return (
    <div className="page-content">
      <SortableDashboard
        widgetOrder={planningWidgetOrder}
        onReorder={setPlanningWidgetOrder}
        widgetMeta={planningWidgetMeta}
        renderWidget={renderWidget}
      />
    </div>
  );
}
