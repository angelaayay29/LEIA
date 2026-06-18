import type { WidgetMeta } from '../types';

interface WidgetTooltipProps {
  meta: WidgetMeta;
}

export function WidgetTooltip({ meta }: WidgetTooltipProps) {
  return (
    <div className="widget-tooltip">
      <h4>{meta.title}</h4>

      <section>
        <h5>What it shows</h5>
        <p>{meta.whatItShows}</p>
      </section>

      <section>
        <h5>Why it matters</h5>
        <p>{meta.whyImportant}</p>
      </section>

      <section>
        <h5>Display type</h5>
        <p>{meta.displayType}</p>
      </section>

      <section>
        <h5>Owner</h5>
        <p>{meta.owner} — {meta.ownerWhy}</p>
      </section>

      <section>
        <h5>Data sources</h5>
        <ul>
          {meta.dataSources.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </section>

      <section>
        <h5>Processing required</h5>
        <ul>
          {meta.processing.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </section>

      <section>
        <h5>Pending questions</h5>
        <ul>
          {meta.pendingQuestions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
