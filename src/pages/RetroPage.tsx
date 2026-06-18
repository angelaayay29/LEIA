import { useCallback } from 'react';
import { SortableDashboard } from '../components/SortableDashboard';
import { SprintHeaderWidget } from '../components/widgets/SprintHeaderWidget';
import { AiInsightWidget } from '../components/widgets/AiInsightWidget';
import { HeadlineStatsWidget } from '../components/widgets/HeadlineStatsWidget';
import { ProgramProgressWidget } from '../components/widgets/ProgramProgressWidget';
import { RetroWorkDetailWidget } from '../components/widgets/RetroWorkDetailWidget';
import { RetroPeopleWidget } from '../components/widgets/RetroPeopleWidget';
import { RetroRisksWidget } from '../components/widgets/RetroRisksWidget';
import { useData } from '../context/DataContext';
import { retroWidgetMeta, headlineStatMeta } from '../data/widgetMetadata';

export function RetroPage() {
  const { retroData, updateRetroData, retroWidgetOrder, setRetroWidgetOrder } = useData();

  const renderWidget = useCallback(
    (id: string) => {
      switch (id) {
        case 'header':
          return (
            <SprintHeaderWidget
              identity={retroData.identity}
              onUpdate={(identity) => updateRetroData((d) => ({ ...d, identity }))}
            />
          );
        case 'ai-insight':
          return (
            <AiInsightWidget
              title="What happened this sprint"
              text={retroData.aiInsight}
              onUpdate={(text) => updateRetroData((d) => ({ ...d, aiInsight: text }))}
            />
          );
        case 'headline-stats':
          return (
            <HeadlineStatsWidget
              stats={retroData.headlineStats}
              statMeta={headlineStatMeta}
              onUpdate={(headlineStats) => updateRetroData((d) => ({ ...d, headlineStats }))}
            />
          );
        case 'program-progress':
          return (
            <ProgramProgressWidget
              programs={retroData.programSnapshots}
              workstreams={retroData.workstreamProgress}
              onUpdatePrograms={(programSnapshots) => updateRetroData((d) => ({ ...d, programSnapshots }))}
              onUpdateWorkstreams={(workstreamProgress) => updateRetroData((d) => ({ ...d, workstreamProgress }))}
            />
          );
        case 'work-detail':
          return (
            <RetroWorkDetailWidget
              completedWork={retroData.completedWork}
              wentWell={retroData.wentWell}
              toImprove={retroData.toImprove}
              actionItems={retroData.actionItems}
              onUpdateWentWell={(wentWell) => updateRetroData((d) => ({ ...d, wentWell }))}
              onUpdateToImprove={(toImprove) => updateRetroData((d) => ({ ...d, toImprove }))}
            />
          );
        case 'people-capacity':
          return (
            <RetroPeopleWidget
              individualDelivery={retroData.individualDelivery}
              happinessBuckets={retroData.happinessBuckets}
              happinessTrend={retroData.happinessTrend}
              happinessAverage={retroData.happinessAverage}
            />
          );
        case 'risks-followup':
          return <RetroRisksWidget actionItems={retroData.actionItems} />;
        default:
          return null;
      }
    },
    [retroData, updateRetroData],
  );

  return (
    <div className="page-content">
      <SortableDashboard
        widgetOrder={retroWidgetOrder}
        onReorder={setRetroWidgetOrder}
        widgetMeta={retroWidgetMeta}
        renderWidget={renderWidget}
      />
    </div>
  );
}
