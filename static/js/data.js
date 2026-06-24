/* LEIA static data — no build required */
const LEIA_WIDGET_ORDER = ['header','ai-insight','headline-stats','program-progress','work-detail','people-capacity','risks-followup'];

/* GST360 Jira field reference (disneyexperiences.atlassian.net, board 608) */
const LEIA_JIRA_FIELD_REF = {
  sprint: 'customfield_10020 — Sprint (name, startDate, endDate, state)',
  storyPoints: 'customfield_10042 — Story Points (falls back to 1 if empty)',
  summary: 'fields.summary — issue title',
  status: 'fields.status.name — workflow status (Done, Blocked, In Progress, Deploy, To Do)',
  statusCategory: 'fields.status.statusCategory.key — done | indeterminate | new',
  assignee: 'fields.assignee.displayName — sprint assignee',
  priority: 'fields.priority.name — mapped to High / Medium / Low',
  components: 'fields.components[].name — Eng or DPE (role proxy)',
  parentSummary: 'fields.parent.fields.summary — epic; segment before | = workstream; CCN/BEEP/WoT hints',
  labels: 'fields.labels[] — program tag fallback',
  issuetype: 'fields.issuetype.subtask — excludes subtasks from story counts',
  key: 'key — GST360-### ticket key',
};

const LEIA_RETRO_META = {
  header: {
    title: 'Sprint Identity Bar',
    whatItShows: 'Sprint name, date range, participant count, Scrum Master, sprint status, and program tags (CCN R2 · BEEP · WoT).',
    whyImportant: 'Establishes sprint context at a glance for Ryan, Brian, and leadership.',
    displayType: 'Single-line header with colored pill tags',
    owner: 'David (Scrum Master)',
    ownerWhy: 'Updates sprint name, dates, participant count, and program tags before each retro is published.',
    jiraFields: [
      LEIA_JIRA_FIELD_REF.sprint + ' — sprint name, startDate, endDate, state (closed | active | future)',
      LEIA_JIRA_FIELD_REF.assignee + ' — distinct assignees in sprint = participant count',
      LEIA_JIRA_FIELD_REF.parentSummary + ' and ' + LEIA_JIRA_FIELD_REF.labels + ' — program tag pills',
    ],
    dataSources: [
      'Jira GST360 board 608 — sprint record via customfield_10020 on sprint issues.',
      'Jira — unique fields.assignee.displayName across sprint backlog.',
      'Jira — program inferred from parent.fields.summary and fields.labels[].',
    ],
    processing: [
      'Read customfield_10020[0] for sprint name and dates.',
      'Count distinct assignees excluding Unassigned.',
      'Derive program tags from epic summaries and labels on sprint tickets.',
    ],
  },
  'ai-insight': {
    title: 'Sprint Summary & Executive Brief',
    whatItShows: 'Plain-English narrative of what happened (or what is planned), plus interactive checklists for leadership review and escalations.',
    whyImportant: 'Single card for time-pressed executives — read the summary and check off asks in one place.',
    displayType: 'Narrative paragraph + two-column interactive checklist',
    owner: 'David (Scrum Master)',
    ownerWhy: 'Reviews the AI-generated draft and checklist items, edits for accuracy, and approves before publish.',
    jiraFields: [
      LEIA_JIRA_FIELD_REF.storyPoints + ' — done vs total (retro) or committed vs velocity (planning)',
      LEIA_JIRA_FIELD_REF.status + ' — Done/Deploy vs Blocked counts',
      LEIA_JIRA_FIELD_REF.sprint + ' — sprint name and board 608 context',
      LEIA_JIRA_FIELD_REF.key + ' — blocked ticket keys in help checklist items',
    ],
    dataSources: [
      'Jira — sprint delivery/commitment totals and blocker count from GST360.',
      'Retro Tool — qualitative themes (not in Jira; manual import).',
      'EOW Survey — team health (not in Jira; placeholder until wired).',
      'AI / Cursor MCP Layer — narrative + executive checklist via scripts/jira_to_leia.py.',
    ],
    processing: [
      'Render aiInsight narrative from Jira metrics.',
      'Render executiveBrief needs/howToHelp as checklists; checked state saved in localStorage.',
    ],
  },
  'headline-stats': {
    title: 'Four Headline Stats',
    whatItShows: 'Points delivered, delivered/planned ratio, team health (EOW), scope churn — with green/red vs baselines where applicable.',
    whyImportant: 'Leadership sees delivery output, plan adherence, morale, and mid-sprint disruption in one row.',
    displayType: 'Four stat cards — large numbers with color-coded delta pills',
    owner: 'David (Scrum Master)',
    ownerWhy: 'Verifies all four numbers are correct and refreshes them after sprint close.',
    jiraFields: [
      LEIA_JIRA_FIELD_REF.storyPoints + ' — sum on Done/Deploy issues = points delivered',
      LEIA_JIRA_FIELD_REF.storyPoints + ' — sum on all sprint issues = planned total',
      LEIA_JIRA_FIELD_REF.status + ' — filters Done/Deploy for numerator',
      'fields.changelog (not yet wired) — scope adds/removes mid-sprint',
    ],
    dataSources: [
      'Jira — customfield_10042 summed on Done tickets in retro sprint.',
      'Jira — customfield_10042 summed on all tickets in sprint for planned total.',
      'EOW Survey — team health score (placeholder “—” until integrated).',
      'Jira changelog — scope churn (placeholder until integrated).',
    ],
    processing: [
      'Sum customfield_10042 where status is Done or Deploy.',
      'Compare delivered to total sprint points for planned vs delivered card.',
      'Color stat deltas green when above baseline, red when below.',
    ],
  },
  'program-progress': {
    title: 'Program & Capability Progress',
    whatItShows: 'Program cards show done ÷ total GST360 tasks per program (all sprints). Workstream bars use the same task-count formula.',
    whyImportant: 'Mid-level view of program pace and which capabilities are ahead or at risk.',
    displayType: 'Program cards + horizontal workstream bars',
    owner: 'David (Scrum Master)',
    ownerWhy: 'Validates percentages with capability leads before retro publish.',
    jiraFields: [
      'COUNT(parent issues) per program WHERE customfield_10020 not empty — total_tasks',
      'COUNT(done parent issues) per program — done_tasks; program_% = 100 × done / total',
      LEIA_JIRA_FIELD_REF.parentSummary + ' — workstream grouping',
      LEIA_JIRA_FIELD_REF.status + ' — Done/Deploy defines done_tasks',
    ],
    dataSources: [
      'Jira — all GST360 parent issues on any sprint (merged snapshot).',
      'docs/widgets/RETROSPECTIVE_WIDGETS.md — full formulas',
    ],
    processing: [
      'Total = sprint-attributed tasks per program across GST360.',
      'Progress % = done tasks ÷ total tasks (task count, not story points).',
    ],
  },
  'work-detail': {
    title: 'Sprint Delivery Detail',
    whatItShows: 'Completed work table, retro themes, and action items.',
    whyImportant: 'Granular shipped work plus qualitative retro story and improvement commitments.',
    displayType: 'Grouped table + two-column bullet lists + action items table',
    owner: 'David (Scrum Master)',
    ownerWhy: 'Facilitates retro and keeps completed-work table current after sprint close.',
    jiraFields: [
      LEIA_JIRA_FIELD_REF.summary + ' — story name column',
      LEIA_JIRA_FIELD_REF.storyPoints + ' — points column',
      LEIA_JIRA_FIELD_REF.parentSummary + ' — workstream grouping',
      LEIA_JIRA_FIELD_REF.status + ' — Done/Deploy filter for completed table',
      LEIA_JIRA_FIELD_REF.issuetype + ' — parent stories only',
      'fields.labels[] contains retro-action (planned) — action item source',
    ],
    dataSources: [
      'Jira — Done parent stories in retro sprint (GST360).',
      'Retro Tool — went well / to improve (manual ceremony export).',
      'Jira — retro-action label on tickets (when used).',
    ],
    processing: [
      'Query sprint issues where status is Done; group by workstream_from_issue().',
      'Import retro themes from ceremony; merge retro-action tickets.',
    ],
  },
  'people-capacity': {
    title: 'People & Team Health',
    whatItShows: 'Per-person assigned vs completed points and happiness index (EOW).',
    whyImportant: 'Shows who delivered fully vs carried work, and whether morale is evenly distributed.',
    displayType: 'Table with progress bars + happiness cards + sparkline',
    owner: 'David (Scrum Master)',
    ownerWhy: 'Runs EOW survey and confirms individual delivery rows before retro publish.',
    jiraFields: [
      LEIA_JIRA_FIELD_REF.assignee + ' — row per person',
      LEIA_JIRA_FIELD_REF.storyPoints + ' — assigned total and completed (Done) total',
      LEIA_JIRA_FIELD_REF.components + ' — Eng vs DPE grouping',
      LEIA_JIRA_FIELD_REF.parentSummary + ' — primary workstream column',
    ],
    dataSources: [
      'Jira — assignee + customfield_10042 on all sprint issues.',
      'EOW Survey — happiness buckets (not in Jira; placeholder).',
    ],
    processing: [
      'Sum points per assignee; completed = sum where status is Done/Deploy.',
      'Label Full delivery / Partial / +Unplanned from assigned vs completed.',
    ],
  },
  'risks-followup': {
    title: 'Risks & Follow-up',
    whatItShows: 'Retro action items with carried-forward highlighting.',
    whyImportant: 'Tracks whether the team closes the loop on process improvements.',
    displayType: 'Compact table with status chips',
    owner: 'David (Scrum Master)',
    ownerWhy: 'Maintains action items after each retro.',
    jiraFields: [
      'fields.labels[] — retro-action label (when used)',
      LEIA_JIRA_FIELD_REF.assignee + ' — action owner',
      LEIA_JIRA_FIELD_REF.summary + ' — action description',
      LEIA_JIRA_FIELD_REF.sprint + ' — due sprint on linked ticket',
    ],
    dataSources: [
      'Jira — tickets labeled retro-action.',
      'LEIA Snapshot Storage — prior action list for Carried detection.',
    ],
    processing: [
      'Fetch retro-action tickets; compare to prior snapshot for Carried status.',
    ],
  },
};

const LEIA_PLANNING_META = {
  header: {
    ...LEIA_RETRO_META.header,
    whatItShows: 'Upcoming sprint name, dates, length, Scrum Master, quarter week, and program tags.',
    ownerWhy: 'Updates sprint metadata before the planning summary is shared.',
    jiraFields: [
      LEIA_JIRA_FIELD_REF.sprint + ' — future/active sprint name, startDate, endDate on planning sprint',
      LEIA_JIRA_FIELD_REF.assignee + ' — participants in upcoming sprint backlog',
    ],
  },
  'ai-insight': {
    ...LEIA_RETRO_META['ai-insight'],
    title: 'Sprint Summary & Executive Brief',
    whatItShows: 'Forward-looking narrative plus interactive leadership checklists (review + how to help).',
    whyImportant: 'Prep for planning — commitment vs velocity, risks, and executive asks in one card.',
    displayType: 'Narrative paragraph + two-column interactive checklist',
    owner: 'David (Scrum Master)',
    ownerWhy: 'Reviews and approves the planning brief and checklist before the planning meeting.',
    jiraFields: [
      LEIA_JIRA_FIELD_REF.storyPoints + ' — committed total vs rolling velocity',
      LEIA_JIRA_FIELD_REF.status + ' — Blocked count in narrative and checklist',
      'static/data/ooo-schedule.json — OOO items in help checklist',
    ],
    dataSources: [
      'Jira — planning sprint commitment, blockers, risks.',
      'Jira — closed-sprint Done points for velocity average.',
      'static/data/ooo-schedule.json — OOO notes when present.',
      'AI / Cursor MCP Layer — narrative + checklist generation.',
    ],
    processing: [
      'Compare committed points to rolling velocity in narrative.',
      'Populate executiveBrief checklists from blockers, risks, and OOO schedule.',
    ],
  },
  'headline-stats': {
    title: 'Four Headline Stats',
    whatItShows: 'Committed points, avg velocity, stories in scope, capacity % — green above / red below velocity baseline.',
    whyImportant: 'Immediately answers whether the team is overcommitting given real availability.',
    displayType: 'Four stat cards with color-coded context',
    owner: 'David (Scrum Master)',
    ownerWhy: 'Confirms stats before sprint kickoff.',
    jiraFields: [
      LEIA_JIRA_FIELD_REF.storyPoints + ' — sum on all planning sprint issues',
      'Done customfield_10042 in closed sprints — avg velocity baseline',
      LEIA_JIRA_FIELD_REF.status + ' — Blocked count for stories-in-scope note',
      LEIA_JIRA_FIELD_REF.issuetype + ' — parent story count',
    ],
    dataSources: [
      'Jira — committed story points and ticket count in planning sprint.',
      'Jira — historical Done points from last 3–5 closed sprints.',
      'static/data/ooo-schedule.json — capacity adjustment (planned).',
    ],
    processing: [
      'Sum customfield_10042 on planning sprint backlog.',
      'Average Done points from closed sprints for velocity baseline.',
      'Color committed vs avg: green if at/above avg, red if below.',
    ],
  },
  'program-progress': {
    ...LEIA_RETRO_META['program-progress'],
    whatItShows: 'Same project-wide task completion % as retro — lifetime done ÷ total per program/workstream.',
    dataSources: [
      'Jira — merged GST360 sprint-attributed issues (see retrospective program-progress spec).',
    ],
    processing: [
      'Same formula as retro; planning sprint commitment shown in work-detail table.',
    ],
  },
  'work-detail': {
    title: 'Sprint Plan Detail',
    whatItShows: 'Sprint goals, committed work table, and velocity chart with average baseline line (green above / red below).',
    whyImportant: 'Business goals plus backlog and historical commitment context.',
    displayType: 'Goal lists + table + bar chart with average line',
    owner: 'David (Scrum Master)',
    ownerWhy: 'Assembles goals, backlog, and velocity chart before sprint day 1.',
    jiraFields: [
      LEIA_JIRA_FIELD_REF.summary + ' — story name; ' + LEIA_JIRA_FIELD_REF.key + ' — ticket key',
      LEIA_JIRA_FIELD_REF.storyPoints + ' — points per row and velocity bars',
      LEIA_JIRA_FIELD_REF.assignee + ' — owners column',
      LEIA_JIRA_FIELD_REF.priority + ' — priority column',
      LEIA_JIRA_FIELD_REF.components + ' — Eng/DPE role',
      'customfield_10020 on closed sprints — historical velocity bars',
    ],
    dataSources: [
      'Jira — full planning sprint backlog.',
      'Jira — Done points per closed sprint for velocity history.',
    ],
    processing: [
      'Render committed work grouped by workstream_from_issue().',
      'Build velocity bars from closed sprint Done totals; color each bar vs avg line.',
    ],
  },
  'people-capacity': {
    title: 'Team Capacity & Benchmark',
    whatItShows: 'Per-person committed points vs benchmark; OOO days flagged with warning symbols.',
    whyImportant: 'Surfaces over-loading and availability before day 1.',
    displayType: 'Table with variance chips and OOO day badges',
    owner: 'David (Scrum Master)',
    ownerWhy: 'Validates load and OOO before sprint kickoff.',
    jiraFields: [
      LEIA_JIRA_FIELD_REF.assignee + ' — team member rows',
      LEIA_JIRA_FIELD_REF.storyPoints + ' — committed points per assignee',
      LEIA_JIRA_FIELD_REF.components + ' — Eng/DPE grouping',
    ],
    dataSources: [
      'Jira — sum customfield_10042 per assignee on planning sprint.',
      'static/data/ooo-schedule.json — oooDays[] per person (sprint day numbers); Outlook integration planned.',
      'LEIA Snapshot Storage — 3-sprint avg benchmark (when history available).',
    ],
    processing: [
      'Sum assigned points per fields.assignee.displayName.',
      'Merge oooDays from ooo-schedule.json; render ⚠ on each affected sprint day.',
    ],
  },
  'risks-followup': {
    title: 'Risks & Blockers',
    whatItShows: 'Prioritized blockers and dependencies entering the sprint.',
    whyImportant: 'Exposes sprint exposure before kickoff.',
    displayType: 'Prioritized list with severity dots',
    owner: 'David (Scrum Master)',
    ownerWhy: 'Maintains risk register before kickoff.',
    jiraFields: [
      LEIA_JIRA_FIELD_REF.status + ' — Blocked filter',
      LEIA_JIRA_FIELD_REF.summary + ' — risk description',
      LEIA_JIRA_FIELD_REF.assignee + ' — owner',
      LEIA_JIRA_FIELD_REF.priority + ' — severity mapping',
      LEIA_JIRA_FIELD_REF.key + ' — ticket key in description',
    ],
    dataSources: [
      'Jira — status = Blocked on board 608 planning sprint issues.',
      'issuelinks (planned) — blocks / is blocked by relationships.',
    ],
    processing: [
      'List Blocked issues in planning sprint; map priority to High/Medium/Low.',
    ],
  },
};

const LEIA_INITIAL_RETRO = {"identity":{"sprintNumber":23,"sprintName":"Sprint 23 — Retrospective Summary","platform":"Data Plat Platform","dateRange":"May 15 – May 30, 2025","participants":12,"scrumMaster":"David","status":"Completed","programTags":[{"label":"CCN R2","color":"blue"},{"label":"BEEP","color":"orange"},{"label":"WoT","color":"green"}]},"aiInsight":"Sprint 23 delivered 54 story points against a 48-point commitment — a solid +6 surplus driven by strong Identity and Analytics workstreams. Team health rose to 7.8 (+0.6), though the happiness distribution reveals two members in the Stressed bucket, suggesting uneven workload. Scope churn was moderate (+3 added, −2 removed), within the team's typical range. Integration remains the primary risk area entering Sprint 24, with two carried action items on cross-team dependency meetings that need resolution in the first two days.","headlineStats":[{"id":"points-delivered","value":"54","label":"Points delivered","delta":"+6 vs. S22","deltaDirection":"up"},{"id":"planned-vs-delivered","value":"54 / 48","label":"Delivered / Planned","subNote":"Above plan","healthColor":"green"},{"id":"team-health","value":"7.8","label":"Team health","delta":"+0.6 vs. S22","deltaDirection":"up","healthColor":"green"},{"id":"scope-churn","value":"+3 / −2","label":"Scope changes","subNote":"Within typical range","healthColor":"green"}],"programSnapshots":[{"name":"CCN R2","percentage":72,"delta":"+8% this sprint","remaining":"28 pts remaining","status":"On track","statusColor":"green","color":"#3b82f6"},{"name":"BEEP","percentage":58,"delta":"+4% this sprint","remaining":"42 pts remaining","status":"At risk","statusColor":"amber","color":"#f59e0b"},{"name":"WoT","percentage":85,"delta":"+12% this sprint","remaining":"15 pts remaining","status":"On track","statusColor":"green","color":"#10b981"}],"workstreamProgress":[{"name":"Identity","percentage":78,"status":"On track","owner":"Kavita"},{"name":"Guest Events","percentage":65,"status":"On track","owner":"Chu"},{"name":"Analytics","percentage":82,"status":"On track","owner":"Elaine"},{"name":"Integration","percentage":45,"status":"At risk","owner":"Emily"},{"name":"Activation","percentage":70,"status":"On track","owner":"Samantha"}],"completedWork":[{"workstream":"Identity","workstreamColor":"#8b5cf6","storyName":"Build dining reservation event pipeline","program":"CCN R2","points":8},{"workstream":"Identity","workstreamColor":"#8b5cf6","storyName":"Fix identity resolution edge case","program":"BEEP","points":5},{"workstream":"Analytics","workstreamColor":"#06b6d4","storyName":"Guest journey funnel dashboard v2","program":"WoT","points":13},{"workstream":"Analytics","workstreamColor":"#06b6d4","storyName":"Real-time event aggregation service","program":"CCN R2","points":8},{"workstream":"Guest Events","workstreamColor":"#ec4899","storyName":"Park entry event schema update","program":"CCN R2","points":5},{"workstream":"Integration","workstreamColor":"#f59e0b","storyName":"Cross-platform API gateway config","program":"BEEP","points":8},{"workstream":"Activation","workstreamColor":"#10b981","storyName":"Onboarding flow A/B test results","program":"WoT","points":3},{"workstream":"Activation","workstreamColor":"#10b981","storyName":"Push notification targeting rules","program":"BEEP","points":4}],"wentWell":[{"text":"Strong cross-workstream collaboration on CCN R2 deliverables"},{"text":"Analytics dashboard shipped ahead of schedule"},{"text":"New standup format reduced meeting overrun","recurring":true},{"text":"Pair programming sessions improved code review turnaround"},{"text":"Clear sprint goals set at planning — team aligned from day 1"}],"toImprove":[{"text":"Cross-team dependency meetings still ad hoc — need scheduled cadence","recurring":true},{"text":"Integration testing environment unstable mid-sprint"},{"text":"Requirements clarity on BEEP epics caused rework","recurring":true},{"text":"Late ticket additions disrupted Analytics capacity planning"},{"text":"Documentation lagging behind shipped features"}],"actionItems":[{"description":"Schedule recurring cross-team dependency sync (bi-weekly)","owner":"David","dueSprint":"S24","status":"Carried"},{"description":"Define acceptance criteria template before sprint start","owner":"Ryan","dueSprint":"S24","status":"Carried"},{"description":"Stabilize integration test environment — root cause analysis","owner":"Emily","dueSprint":"S24","status":"In Progress"},{"description":"Create BEEP epic requirements checklist","owner":"Brian","dueSprint":"S24","status":"New"},{"description":"Document shipped Analytics features in Confluence","owner":"Elaine","dueSprint":"S25","status":"New"}],"individualDelivery":[{"name":"Alex Chen","initials":"AC","role":"Eng","assigned":10,"completed":10,"status":"Full delivery","workstream":"Identity"},{"name":"Jordan Lee","initials":"JL","role":"Eng","assigned":8,"completed":8,"status":"Full delivery","workstream":"Analytics"},{"name":"Sam Rivera","initials":"SR","role":"Eng","assigned":8,"completed":6,"status":"Partial","workstream":"Integration"},{"name":"Taylor Kim","initials":"TK","role":"Eng","assigned":5,"completed":5,"status":"Full delivery","workstream":"Guest Events"},{"name":"Morgan Patel","initials":"MP","role":"Eng","assigned":0,"completed":5,"status":"+Unplanned","workstream":"Activation"},{"name":"Casey Wong","initials":"CW","role":"DPE","assigned":8,"completed":8,"status":"Full delivery","workstream":"Analytics"},{"name":"Riley Nguyen","initials":"RN","role":"DPE","assigned":5,"completed":5,"status":"Full delivery","workstream":"Identity"},{"name":"Avery Brooks","initials":"AB","role":"DPE","assigned":8,"completed":7,"status":"Partial","workstream":"Integration"}],"happinessBuckets":[{"label":"Thriving","count":3,"percentage":25,"color":"#059669"},{"label":"Happy","count":5,"percentage":42,"color":"#34d399"},{"label":"Neutral","count":2,"percentage":17,"color":"#fbbf24"},{"label":"Stressed","count":2,"percentage":17,"color":"#f59e0b"},{"label":"Burned Out","count":0,"percentage":0,"color":"#ef4444"}],"happinessTrend":[6.8,7.0,7.2,7.5,7.8],"happinessAverage":7.8};

const LEIA_INITIAL_PLANNING = {"identity":{"sprintNumber":24,"sprintName":"Sprint 24 — Planning Summary","platform":"Data Plat Platform","dateRange":"Jun 2 – Jun 13, 2025","participants":12,"scrumMaster":"David","sprintLengthDays":10,"quarterWeek":"Q2 W23","programTags":[{"label":"CCN R2","color":"blue"},{"label":"BEEP","color":"orange"},{"label":"WoT","color":"green"}]},"aiInsight":"Sprint 24 commits 62 story points against a 58-point rolling average — a modest +4 stretch that is achievable if Integration dependencies resolve in the first two days. The highest-risk item is the cross-platform API dependency (BEEP-442) blocking three downstream stories; Emily should front-load the dependency sync meeting on Day 1. Capacity is at 91% utilization with Samantha OOO days 6–10 — consider shifting her 8 points to Alex or Jordan. CCN R2 goals are well-scoped; BEEP goals carry two at-risk dependencies that need confirmation before sprint kickoff.","headlineStats":[{"id":"committed-points","value":"62","label":"Committed points","subNote":"Capacity: 68 pts"},{"id":"avg-velocity","value":"58","label":"Avg velocity (3 sprints)","delta":"↑6% vs last sprint","deltaDirection":"up"},{"id":"stories-in-scope","value":"16","label":"Stories in scope","subNote":"3 carried over from S23","healthColor":"amber"},{"id":"capacity-utilized","value":"91%","label":"Capacity utilized","subNote":"Healthy range","healthColor":"green"}],"programSnapshots":[{"name":"CCN R2","percentage":72,"delta":"Target: 85% by S26","remaining":"28 pts remaining","status":"On track","statusColor":"green","color":"#3b82f6"},{"name":"BEEP","percentage":58,"delta":"Target: 70% by S27","remaining":"42 pts remaining","status":"At risk","statusColor":"amber","color":"#f59e0b"},{"name":"WoT","percentage":85,"delta":"Target: 95% by S25","remaining":"15 pts remaining","status":"On track","statusColor":"green","color":"#10b981"}],"workstreamProgress":[{"name":"Identity","percentage":78,"status":"On track","owner":"Kavita"},{"name":"Guest Events","percentage":65,"status":"On track","owner":"Chu"},{"name":"Analytics","percentage":82,"status":"On track","owner":"Elaine"},{"name":"Integration","percentage":45,"status":"At risk","owner":"Emily"},{"name":"Activation","percentage":70,"status":"On track","owner":"Samantha"}],"programGoals":[{"program":"CCN R2","color":"#3b82f6","goals":[{"text":"Complete dining reservation event pipeline end-to-end","confirmed":true,"owner":"Kavita"},{"text":"Deploy guest journey funnel dashboard to production","confirmed":true,"owner":"Elaine"},{"text":"Integrate park entry events with identity resolution","confirmed":false,"owner":"Chu"}]},{"program":"BEEP","color":"#f59e0b","goals":[{"text":"Resolve cross-platform API gateway blockers","confirmed":false,"owner":"Emily"},{"text":"Ship push notification targeting v2","confirmed":true,"owner":"Samantha"},{"text":"Complete BEEP epic requirements for S25 planning","confirmed":true,"owner":"Brian"}]},{"program":"WoT","color":"#10b981","goals":[{"text":"Launch onboarding A/B test in production","confirmed":true,"owner":"Samantha"},{"text":"Analytics real-time pipeline for guest events","confirmed":true,"owner":"Elaine"}]}],"committedWork":[{"workstream":"Identity","workstreamColor":"#8b5cf6","storyName":"Identity resolution v3 migration","ticketKey":"GST360-1201","programs":["CCN R2"],"role":"Eng","points":8,"priority":"High","owners":["Alex Chen"]},{"workstream":"Identity","workstreamColor":"#8b5cf6","storyName":"Guest profile merge logic","ticketKey":"GST360-1205","programs":["BEEP"],"role":"Both","points":5,"priority":"Medium","owners":["Alex Chen","Riley Nguyen"]},{"workstream":"Analytics","workstreamColor":"#06b6d4","storyName":"Funnel dashboard production deploy","ticketKey":"GST360-1210","programs":["CCN R2","WoT"],"role":"DPE","points":5,"priority":"High","owners":["Casey Wong"]},{"workstream":"Analytics","workstreamColor":"#06b6d4","storyName":"Real-time event aggregation scaling","ticketKey":"GST360-1215","programs":["WoT"],"role":"Eng","points":8,"priority":"Medium","owners":["Jordan Lee"]},{"workstream":"Guest Events","workstreamColor":"#ec4899","storyName":"Park entry event integration","ticketKey":"GST360-1220","programs":["CCN R2"],"role":"Eng","points":5,"priority":"High","owners":["Taylor Kim"]},{"workstream":"Integration","workstreamColor":"#f59e0b","storyName":"Cross-platform API gateway (BEEP-442)","ticketKey":"GST360-1225","programs":["BEEP"],"role":"Eng","points":13,"priority":"High","owners":["Sam Rivera"]},{"workstream":"Integration","workstreamColor":"#f59e0b","storyName":"Third-party webhook reliability","ticketKey":"GST360-1230","programs":["BEEP"],"role":"Both","points":5,"priority":"Medium","owners":["Sam Rivera","Avery Brooks"]},{"workstream":"Activation","workstreamColor":"#10b981","storyName":"Onboarding A/B test launch","ticketKey":"GST360-1235","programs":["WoT"],"role":"DPE","points":3,"priority":"High","owners":["Morgan Patel"]},{"workstream":"Activation","workstreamColor":"#10b981","storyName":"Push notification targeting v2","ticketKey":"GST360-1240","programs":["BEEP"],"role":"Eng","points":5,"priority":"Medium","owners":["Morgan Patel"]},{"workstream":"Analytics","workstreamColor":"#06b6d4","storyName":"Data quality monitoring alerts","ticketKey":"GST360-1245","programs":["CCN R2"],"role":"DPE","points":5,"priority":"Low","owners":["Casey Wong"]}],"velocityHistory":[{"sprint":"S19","points":52},{"sprint":"S20","points":48},{"sprint":"S21","points":55},{"sprint":"S22","points":48},{"sprint":"S23","points":54},{"sprint":"S24","points":62,"isCurrent":true}],"avgVelocity":58,"teamCapacity":[{"name":"Alex Chen","initials":"AC","role":"Eng","committed":13,"threeSprintAvg":10,"variance":"above"},{"name":"Jordan Lee","initials":"JL","role":"Eng","committed":8,"threeSprintAvg":8,"variance":"avg"},{"name":"Sam Rivera","initials":"SR","role":"Eng","committed":18,"threeSprintAvg":10,"variance":"above"},{"name":"Taylor Kim","initials":"TK","role":"Eng","committed":5,"threeSprintAvg":6,"variance":"below"},{"name":"Morgan Patel","initials":"MP","role":"Eng","committed":8,"threeSprintAvg":5,"variance":"above"},{"name":"Casey Wong","initials":"CW","role":"DPE","committed":10,"threeSprintAvg":8,"variance":"above"},{"name":"Riley Nguyen","initials":"RN","role":"DPE","committed":5,"threeSprintAvg":5,"variance":"avg"},{"name":"Avery Brooks","initials":"AB","role":"DPE","committed":5,"threeSprintAvg":7,"variance":"below","availability":"OOO Jun 6–10"}],"risks":[{"severity":"High","description":"Cross-platform API dependency (BEEP-442) blocking 3 downstream stories","owner":"Emily","resolution":"Schedule dependency sync Day 1; escalate to BEEP team lead if unresolved by Day 2"},{"severity":"High","description":"Integration test environment instability from S23 not yet resolved","owner":"Emily","resolution":"Root cause analysis action item — target fix by Day 3"},{"severity":"Medium","description":"Samantha OOO days 6–10 reduces Activation capacity by 40%","owner":"David","resolution":"Shift 3 pts to Alex; defer push notification polish to S25"},{"severity":"Medium","description":"BEEP epic requirements still incomplete for 2 stories","owner":"Brian","resolution":"Requirements checklist due before sprint kickoff"},{"severity":"Low","description":"Park entry event schema change pending external team sign-off","owner":"Chu","resolution":"Follow up with Guest Events platform team — non-blocking for sprint start"}],"oooNotes":"Avery Brooks: OOO Jun 6–10 | Samantha (Activation lead): partial availability days 6–10"};
