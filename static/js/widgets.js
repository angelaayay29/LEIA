/* LEIA widget renderers */
const pillMap = { blue:'pill-blue', orange:'pill-orange', green:'pill-green', purple:'pill-purple', red:'pill-red', amber:'pill-amber', cyan:'pill-cyan' };

function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function pill(text, color) {
  return `<span class="pill ${pillMap[color] || 'pill-blue'}">${esc(text)}</span>`;
}

function edit(content, isEditor) {
  return isEditor ? ' contenteditable="true"' : '';
}

function renderTooltip(meta) {
  const li = (arr) => arr.map(x => `<li>${esc(x)}</li>`).join('');
  const ownerLine = `${esc(meta.owner)} — ${esc(meta.ownerWhy)}`;
  const jiraSection = meta.jiraFields && meta.jiraFields.length
    ? `<section><h5>Jira fields (GST360)</h5><ul>${li(meta.jiraFields)}</ul></section>` : '';
  return `<h4 class="widget-spec-title">${esc(meta.title)}</h4>
    <div class="widget-spec-inner">
      <section><h5>What it shows</h5><p>${esc(meta.whatItShows)}</p></section>
      <section><h5>Why it matters</h5><p>${esc(meta.whyImportant)}</p></section>
      <section><h5>Display type</h5><p>${esc(meta.displayType)}</p></section>
      <section><h5>Owner</h5><p>${ownerLine}</p></section>
      ${jiraSection}
      <section><h5>Data sources</h5><ul>${li(meta.dataSources)}</ul></section>
      <section><h5>Processing required</h5><ul>${li(meta.processing)}</ul></section>
    </div>`;
}

function renderHeader(identity, isPlanning, isEditor) {
  const meta = [identity.platform, identity.dateRange];
  if (isPlanning && identity.sprintLengthDays) meta.push(identity.sprintLengthDays + ' days');
  if (!isPlanning) meta.push(identity.participants + ' participants');
  meta.push('Scrum Master: ' + identity.scrumMaster);
  if (isPlanning && identity.quarterWeek) meta.push(identity.quarterWeek);
  const tags = (identity.programTags || []).map(t => pill(t.label, t.color)).join(' ');
  const status = identity.status ? pill(identity.status, 'green') : '';
  return `<div class="sprint-header"><h2><span${edit('', isEditor)} data-field="sprintName">${esc(identity.sprintName)}</span></h2>
    <div class="sprint-tags">${status} ${tags}</div><div class="sprint-meta">${esc(meta.join(' · '))}</div></div>`;
}

function normalizeExecItem(item) {
  if (item == null) return { text: '', checked: false };
  if (typeof item === 'string') return { text: item, checked: false };
  return { text: item.text || '', checked: !!item.checked };
}

function renderExecChecklist(items, section, isEditor) {
  const list = (items || []).map(normalizeExecItem);
  if (!list.length) {
    return '<p class="executive-checklist-empty">No items</p>';
  }
  return `<div class="executive-checklist" role="group">${list.map((item, i) => {
    const id = `exec-${section}-${i}`;
    return `<div class="executive-check-row">
      <input type="checkbox" class="executive-check-input" id="${id}"
        data-exec-section="${section}" data-exec-index="${i}"${item.checked ? ' checked' : ''} />
      <label class="executive-check-text" for="${id}"${edit('', isEditor)} data-exec-section="${section}" data-exec-index="${i}">${esc(item.text)}</label>
    </div>`;
  }).join('')}</div>`;
}

function renderAiInsight(title, text, brief, isEditor) {
  const body = isEditor
    ? `<div class="ai-insight-body" contenteditable="true" data-field="aiInsight">${esc(text)}</div>`
    : `<p class="ai-insight-body">${esc(text)}</p>`;

  const hasBrief = brief && ((brief.needs && brief.needs.length) || (brief.howToHelp && brief.howToHelp.length));
  const briefHtml = hasBrief ? `
    <div class="ai-insight-executive">
      <div class="ai-insight-divider"></div>
      <h4 class="ai-insight-subhead">What we need from you</h4>
      <div class="executive-brief-grid">
        <div class="executive-brief-panel">
          <div class="executive-panel-label">Review these</div>
          ${renderExecChecklist(brief.needs, 'needs', isEditor)}
        </div>
        <div class="executive-brief-panel">
          <div class="executive-panel-label">How you can help</div>
          ${renderExecChecklist(brief.howToHelp, 'help', isEditor)}
        </div>
      </div>
    </div>` : '';

  return `<div class="ai-insight-card"><h3>${esc(title)}</h3>${body}${briefHtml}</div>`;
}

function renderHeadlineStats(stats, isEditor) {
  return `<div class="section-title">Headline Stats</div><div class="stat-grid">${stats.map(s => {
    let hc = s.healthColor ? ` ${s.healthColor}` : '';
    if (!hc && s.baselineCompare != null && s.numericValue != null) {
      hc = s.numericValue >= s.baselineCompare ? ' green' : ' red';
    }
    const deltaDir = s.deltaDirection || 'neutral';
    const delta = s.delta ? `<span class="stat-delta ${deltaDir}">${esc(s.delta)}</span>` : '';
    const sub = s.subNote ? `<div class="stat-sub">${esc(s.subNote)}</div>` : '';
    const ed = isEditor ? ' contenteditable="true"' : '';
    return `<div class="stat-card"><div class="stat-value${hc}"${ed} data-stat="value">${esc(s.value)}</div>
      <div class="stat-label"${ed} data-stat="label">${esc(s.label)}</div>${delta}${sub}</div>`;
  }).join('')}</div>`;
}

function renderProgramProgress(programs, workstreams, isEditor) {
  const wsStatus = s => s === 'On track' ? 'pill-green' : s === 'At risk' ? 'pill-amber' : 'pill-red';
  const progCards = programs.map(p => {
    const sc = p.statusColor === 'green' ? 'pill-green' : p.statusColor === 'amber' ? 'pill-amber' : 'pill-red';
    return `<div class="program-card"><div class="program-card-header"><h4>${esc(p.name)}</h4><span class="pill ${sc}">${esc(p.status)}</span></div>
      <div class="program-pct" style="color:${p.color}">${p.percentage}%</div>
      <div class="progress-bar-track"><div class="progress-bar-fill" style="width:${p.percentage}%;background:${p.color}"></div></div>
      <div class="program-meta">${esc(p.delta)} · ${esc(p.remaining)}</div></div>`;
  }).join('');
  const wsRows = workstreams.map(w => {
    const col = w.status === 'On track' ? '#10b981' : w.status === 'At risk' ? '#f59e0b' : '#ef4444';
    return `<div class="workstream-row"><span class="workstream-name">${esc(w.name)}</span>
      <div class="progress-bar-track"><div class="progress-bar-fill" style="width:${w.percentage}%;background:${col}"></div></div>
      <span class="workstream-pct">${w.percentage}%</span><span class="pill ${wsStatus(w.status)}">${esc(w.status)}</span></div>`;
  }).join('');
  return `<div class="widget-section-title">Program & Capability Progress</div>
    <p class="widget-formula-note">Program % = done GST360 tasks ÷ all sprint-attributed tasks for that program (across all sprints). Workstream % uses the same task-count formula.</p>
    <div class="subsection-title">Program Snapshot</div><div class="program-grid">${progCards}</div>
    <div class="subsection-title" style="margin-top:0.75rem">Capability Workstream Progress</div><div class="workstream-list">${wsRows}</div>`;
}

function renderRetroWorkDetail(d, isEditor) {
  const grouped = {};
  d.completedWork.forEach(r => { (grouped[r.workstream] = grouped[r.workstream] || []).push(r); });
  let tableRows = '';
  Object.entries(grouped).forEach(([ws, rows]) => {
    tableRows += `<tr class="group-header"><td colspan="5">${esc(ws)}</td></tr>`;
    rows.forEach(r => {
      tableRows += `<tr><td><span class="workstream-tag" style="background:${r.workstreamColor}">${esc(r.workstream)}</span></td>
        <td>${esc(r.storyName)}</td><td>${pill(r.program,'blue')}</td><td>${r.points}</td><td>${pill('Done','green')}</td></tr>`;
    });
  });
  const themeLi = (items, icon, color) => items.map((t,i) =>
    `<li><span class="theme-icon" style="color:${color}">${icon}</span><span${edit('',isEditor)} data-theme="${i}">${esc(t.text)}${t.recurring ? '<span class="recurring-badge">Recurring</span>' : ''}</span></li>`
  ).join('');
  const actionStatus = { New:'pill-green', 'In Progress':'pill-cyan', Carried:'pill-amber' };
  const sorted = [...d.actionItems].sort((a,b) => (a.status==='Carried'?0:1)-(b.status==='Carried'?0:1));
  const actionRows = sorted.map(a => `<tr><td>${esc(a.description)}</td><td><div class="avatar-row"><span class="avatar">${esc(a.owner.slice(0,2).toUpperCase())}</span>${esc(a.owner)}</div></td><td>${esc(a.dueSprint)}</td><td><span class="pill ${actionStatus[a.status]}">${esc(a.status)}</span></td></tr>`).join('');

  return `<div class="widget-section-title">Sprint Delivery Detail</div>
    <div class="subsection-title">Completed Work</div>
    <table class="data-table"><thead><tr><th>Workstream</th><th>Story</th><th>Program</th><th>Points</th><th>Status</th></tr></thead><tbody>${tableRows}</tbody></table>
    <div class="subsection-title" style="margin-top:1.5rem">Retro Themes</div>
    <div class="theme-columns"><div class="theme-column well"><h4>What Went Well</h4><ul>${themeLi(d.wentWell,'✓','#10b981')}</ul></div>
    <div class="theme-column improve"><h4>Areas to Improve</h4><ul>${themeLi(d.toImprove,'⚠','#f59e0b')}</ul></div></div>
    <div class="subsection-title" style="margin-top:1.5rem">Action Items</div>
    <table class="data-table"><thead><tr><th>Description</th><th>Owner</th><th>Due Sprint</th><th>Status</th></tr></thead><tbody>${actionRows}</tbody></table>`;
}

function renderRetroPeople(d) {
  const statusPill = { 'Full delivery':'pill-green', Partial:'pill-amber', '+Unplanned':'pill-cyan' };
  const renderGroup = (label, rows) => {
    let h = `<tr class="group-header"><td colspan="6">${esc(label)}</td></tr>`;
    rows.forEach(r => {
      const pct = r.assigned > 0 ? (r.completed/r.assigned)*100 : 100;
      const col = r.status==='Full delivery'?'#10b981':r.status==='Partial'?'#f59e0b':'#06b6d4';
      h += `<tr><td><div class="avatar-row"><span class="avatar">${esc(r.initials)}</span>${esc(r.name)}</div></td>
        <td>${pill(r.role,'blue')}</td><td><div class="delivery-bar-track"><div class="delivery-bar-fill" style="width:${Math.min(pct,100)}%;background:${col}"></div></div></td>
        <td>${r.completed} → ${r.assigned||r.completed}</td><td><span class="pill ${statusPill[r.status]}">${esc(r.status)}</span></td><td>${esc(r.workstream)}</td></tr>`;
    });
    return h;
  };
  const maxT = Math.max(...d.happinessTrend, 10);
  const spark = d.happinessTrend.map((s,i) =>
    `<div class="sparkline-bar" style="height:${(s/maxT)*100}%"><span class="bar-label">S${18+i}</span></div>`
  ).join('');
  const happy = d.happinessBuckets.map(b =>
    `<div class="happiness-card" style="background:${b.color}18;border-color:${b.color}40"><div class="count" style="color:${b.color}">${b.count}</div><div class="label" style="color:${b.color}">${esc(b.label)}</div><div class="pct">${b.percentage}%</div></div>`
  ).join('');

  return `<div class="widget-section-title">People & Team Health</div>
    <div class="subsection-title">Individual Delivery</div>
    <table class="data-table"><thead><tr><th>Team Member</th><th>Role</th><th>Progress</th><th>Points</th><th>Status</th><th>Workstream</th></tr></thead><tbody>
    ${renderGroup('Engineering (Eng)', d.individualDelivery.filter(r=>r.role==='Eng'))}
    ${renderGroup('Data Product Engineering (DPE)', d.individualDelivery.filter(r=>r.role==='DPE'))}
    </tbody></table>
    <div class="subsection-title" style="margin-top:1.5rem">Team Happiness Index</div><div class="happiness-grid">${happy}</div>
    <div class="subsection-title">Happiness Trend (Last 5 Sprints)</div>
    <div class="sparkline-wrap"><div class="sparkline-container">${spark}</div></div>
    <div class="sparkline-avg">Average happiness score: <strong>${d.happinessAverage}</strong></div>`;
}

function renderRetroRisks(d) {
  const carried = d.actionItems.filter(a => a.status === 'Carried');
  const actionStatus = { New:'pill-green', 'In Progress':'pill-cyan', Carried:'pill-amber' };
  const carriedHtml = carried.length ? `<div class="subsection-title">Carried Forward (${carried.length})</div><div class="risk-list" style="margin-bottom:1rem">${carried.map(a =>
    `<div class="risk-item" style="border-color:rgba(245,158,11,0.3)"><div class="severity-dot medium"></div><div><div class="risk-desc">${esc(a.description)}</div><div class="risk-resolution">Owner: ${esc(a.owner)} · Due: ${esc(a.dueSprint)}</div></div><span class="pill pill-amber">Carried</span></div>`
  ).join('')}</div>` : '';
  const allRows = [...carried, ...d.actionItems.filter(a=>a.status!=='Carried')].map(a =>
    `<tr><td>${esc(a.description)}</td><td><div class="avatar-row"><span class="avatar">${esc(a.owner.slice(0,2).toUpperCase())}</span>${esc(a.owner)}</div></td><td>${esc(a.dueSprint)}</td><td><span class="pill ${actionStatus[a.status]}">${esc(a.status)}</span></td></tr>`
  ).join('');
  return `<div class="widget-section-title">Risks & Follow-up</div>
    <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:1rem">Retro action items track process improvement commitments. Carried items indicate the team is not closing the loop.</p>
    ${carriedHtml}<div class="subsection-title">All Action Items</div>
    <table class="data-table"><thead><tr><th>Description</th><th>Owner</th><th>Due Sprint</th><th>Status</th></tr></thead><tbody>${allRows}</tbody></table>`;
}

function renderPlanningWorkDetail(d, isEditor) {
  const pri = { High:'pill-red', Medium:'pill-amber', Low:'pill-green' };
  const role = { Both:'pill-purple', Eng:'pill-blue', DPE:'pill-cyan' };
  const goalsHtml = d.programGoals.map(pg => {
    const items = pg.goals.map(g => `<div class="goal-item"><span class="goal-icon" style="color:${g.confirmed?'#10b981':'#f59e0b'}">${g.confirmed?'✓':'○'}</span>
      <span${edit('',isEditor)}>${esc(g.text)}</span><span class="goal-owner">${esc(g.owner)}</span></div>`).join('');
    return `<div class="goal-section"><div class="goal-section-header" style="color:${pg.color};border-color:${pg.color}">${esc(pg.program)}</div>${items}</div>`;
  }).join('');
  const grouped = {};
  d.committedWork.forEach(r => { (grouped[r.workstream] = grouped[r.workstream] || []).push(r); });
  let tableRows = '';
  Object.entries(grouped).forEach(([ws, rows]) => {
    tableRows += `<tr class="group-header"><td colspan="7">${esc(ws)}</td></tr>`;
    rows.forEach(r => {
      const progs = r.programs.map(p => pill(p,'blue')).join(' ');
      const owners = r.owners.map(o => `<span class="avatar" title="${esc(o)}">${esc(o.split(' ').map(n=>n[0]).join(''))}</span>`).join('');
      tableRows += `<tr><td><span class="workstream-tag" style="background:${r.workstreamColor}">${esc(r.workstream)}</span></td>
        <td><span style="color:var(--accent-cyan);font-size:0.7rem">${esc(r.ticketKey)}</span><br>${esc(r.storyName)}</td><td>${progs}</td>
        <td><span class="pill ${role[r.role]}">${esc(r.role)}</span></td><td>${r.points}</td><td><span class="pill ${pri[r.priority]}">${esc(r.priority)}</span></td><td><div style="display:flex;gap:4px">${owners}</div></td></tr>`;
    });
  });
  const maxP = Math.max(...d.velocityHistory.map(v=>v.points), d.avgVelocity, 1);
  const current = d.velocityHistory.find(v=>v.isCurrent);
  const delta = (current?.points||0) - d.avgVelocity;
  const deltaColor = delta >= 0 ? '#10b981' : '#ef4444';
  const bars = d.velocityHistory.map(v => {
    const above = v.points >= d.avgVelocity;
    const barClass = v.isCurrent ? 'current' : 'historical';
    const cmpClass = above ? 'above-avg' : 'below-avg';
    return `<div class="velocity-bar-group"><div class="velocity-bar ${barClass} ${cmpClass}" style="height:${(v.points/maxP)*140}px" title="${esc(v.sprint)}: ${v.points} pts (${above ? 'at/above' : 'below'} avg ${d.avgVelocity})"></div><span class="velocity-bar-label">${esc(v.sprint)}</span></div>`;
  }).join('');

  return `<div class="widget-section-title">Sprint Plan Detail</div>
    <div class="subsection-title">Sprint Goals by Program</div><div class="goals-grid">${goalsHtml}</div>
    <div class="subsection-title" style="margin-top:1.5rem">Committed Work</div>
    <table class="data-table"><thead><tr><th>Workstream</th><th>Story</th><th>Program</th><th>Role</th><th>Points</th><th>Priority</th><th>Owners</th></tr></thead><tbody>${tableRows}</tbody></table>
    <div class="subsection-title" style="margin-top:1.5rem">Velocity & Commitment History</div>
    <div class="velocity-block">
      <div class="velocity-callout">Committed: <strong>${current?.points||0} pts</strong> · Avg velocity: <strong>${d.avgVelocity} pts</strong> · vs baseline: <strong style="color:${deltaColor}">${delta>0?'+':''}${delta} pts</strong> <span class="velocity-legend"><span class="vel-dot above"></span> at/above avg</span> <span class="velocity-legend"><span class="vel-dot below"></span> below avg</span></div>
      <div class="velocity-chart"><div class="velocity-avg-line" style="bottom:${(d.avgVelocity/maxP)*140}px" title="Rolling avg: ${d.avgVelocity} pts"></div>${bars}</div>
    </div>`;
}

function renderOooBadges(oooDays, note) {
  if (!oooDays || !oooDays.length) return '';
  const days = oooDays.map(d =>
    `<span class="ooo-day-badge" title="${esc(note || 'Out of office')}"><span class="ooo-warn" aria-hidden="true">⚠</span> D${d}</span>`
  ).join('');
  return `<span class="ooo-day-wrap">${days}</span>`;
}

function renderPlanningPeople(d) {
  const varPill = { avg:['pill-blue','= Avg'], above:['pill-green','↑ Above'], below:['pill-red','↓ Below'] };
  const sprintCol = d.identity && d.identity.sprintNumber ? `S${d.identity.sprintNumber} Points` : 'Committed';
  const renderGroup = (label, rows) => {
    let h = `<tr class="group-header"><td colspan="5">${esc(label)}</td></tr>`;
    rows.forEach(r => {
      const v = varPill[r.variance] || varPill.avg;
      const ooo = renderOooBadges(r.oooDays, r.oooNote);
      h += `<tr class="${r.oooDays && r.oooDays.length ? 'has-ooo' : ''}"><td><div class="avatar-row"><span class="avatar">${esc(r.initials)}</span>${esc(r.name)}</div></td>
        <td>${pill(r.role,'blue')}</td><td style="font-weight:700;font-size:1rem">${r.committed}</td><td style="color:var(--text-muted)">${r.threeSprintAvg}</td>
        <td><span class="pill ${v[0]}">${v[1]}</span>${ooo}${r.availability && !ooo ? `<span class="pill pill-amber ooo-summary-pill">${esc(r.availability)}</span>` : ''}</td></tr>`;
    });
    return h;
  };
  const oooBanner = (d.oooSchedule && d.oooSchedule.length)
    ? `<div class="ooo-schedule-banner"><span class="ooo-warn" aria-hidden="true">⚠</span> OOO this sprint: ${d.oooSchedule.map(o =>
        `<strong>${esc(o.name)}</strong> (${o.oooDays.map(day => 'D' + day).join(', ')})`
      ).join(' · ')}</div>` : '';
  return `<div class="widget-section-title">Team Capacity & Benchmark</div>
    ${oooBanner}
    <table class="data-table"><thead><tr><th>Team Member</th><th>Role</th><th>${esc(sprintCol)}</th><th>3-Sprint Avg</th><th>Variance / OOO</th></tr></thead><tbody>
    ${renderGroup('Engineering (Eng)', d.teamCapacity.filter(r=>r.role==='Eng'))}
    ${renderGroup('Data Product Engineering (DPE)', d.teamCapacity.filter(r=>r.role==='DPE'))}
    </tbody></table>${d.oooNotes?`<p class="ooo-notes-line"><span class="ooo-warn" aria-hidden="true">⚠</span> ${esc(d.oooNotes)}</p>`:''}`;
}

function renderPlanningRisks(d, isEditor) {
  const sev = { High:'high', Medium:'medium', Low:'low' };
  const sevPill = { High:'pill-red', Medium:'pill-amber', Low:'pill-green' };
  const order = { High:0, Medium:1, Low:2 };
  const sorted = [...d.risks].sort((a,b) => order[a.severity]-order[b.severity]);
  const items = sorted.map(r => `<div class="risk-item"><div class="severity-dot ${sev[r.severity]}"></div><div>
    <div class="risk-desc"${edit('',isEditor)}>${esc(r.description)}</div>
    <div class="risk-resolution"${edit('',isEditor)}>${esc(r.resolution)}</div><div class="risk-owner">Owner: ${esc(r.owner)}</div></div>
    <span class="pill ${sevPill[r.severity]}">${esc(r.severity)} risk</span></div>`).join('');
  return `<div class="widget-section-title">Risks & Blockers</div><div class="risk-list">${items}</div>`;
}

function renderRetroWidget(id, data, isEditor) {
  switch(id) {
    case 'header': return renderHeader(data.identity, false, isEditor);
    case 'ai-insight': return renderAiInsight('What happened this sprint', data.aiInsight, data.executiveBrief, isEditor);
    case 'executive-brief': return '';
    case 'headline-stats': return renderHeadlineStats(data.headlineStats, isEditor);
    case 'program-progress': return renderProgramProgress(data.programSnapshots, data.workstreamProgress, isEditor);
    case 'work-detail': return renderRetroWorkDetail(data, isEditor);
    case 'people-capacity': return renderRetroPeople(data);
    case 'risks-followup': return renderRetroRisks(data);
    default: return '';
  }
}

function renderPlanningWidget(id, data, isEditor) {
  switch(id) {
    case 'header': return renderHeader(data.identity, true, isEditor);
    case 'ai-insight': {
      const n = data.identity && data.identity.sprintNumber;
      const title = n ? ('Going into Sprint ' + n) : 'Sprint planning insight';
      return renderAiInsight(title, data.aiInsight, data.executiveBrief, isEditor);
    }
    case 'executive-brief': return '';
    case 'headline-stats': return renderHeadlineStats(data.headlineStats, isEditor);
    case 'program-progress': return renderProgramProgress(data.programSnapshots, data.workstreamProgress, isEditor);
    case 'work-detail': return renderPlanningWorkDetail(data, isEditor);
    case 'people-capacity': return renderPlanningPeople(data);
    case 'risks-followup': return renderPlanningRisks(data, isEditor);
    default: return '';
  }
}
