/* LEIA static data — no build required */
const LEIA_WIDGET_ORDER = ['header','ai-insight','headline-stats','program-progress','work-detail','people-capacity','risks-followup'];

const LEIA_RETRO_META = {
  header: {
    title: 'Sprint Identity Bar',
    whatItShows: 'Sprint number, date range, 12 participants, Scrum Master David, Completed status, program tags CCN R2 · BEEP · WoT.',
    whyImportant: 'Establishes sprint context at a glance for Ryan, Brian, and leadership.',
    displayType: 'Single-line header with colored pill tags',
    owner: 'David (Scrum Master)',
    ownerWhy: 'Updates sprint name, dates, participant count, and program tags before each retro is published.',
    dataSources: [
      'Jira — sprint name, start/end dates, and Completed status for the active sprint on board 13159.',
      'Jira — team member list to count how many people participated this sprint.',
      'Jira — program labels on tickets (CCN R2, BEEP, WoT) mapped to the colored tags shown in the header.',
    ],
    processing: [
      'Pull the closed sprint record from Jira and confirm dates match the retro period.',
      'Count active assignees or board members to get the participant total.',
      'Read program labels from sprint tickets and render each as a colored pill tag.',
    ],
  },
  'ai-insight': {
    title: 'AI Insight',
    whatItShows: 'Plain-English narrative: what got done, why delivery went as it did, team sentiment, what to watch in Sprint 24.',
    whyImportant: 'Most aggregated view — the only widget a time-pressed executive needs to read.',
    displayType: 'Shaded narrative card — paragraph text, no charts',
    owner: 'David (Scrum Master)',
    ownerWhy: 'Reviews the AI-generated draft, edits for accuracy, and approves the narrative before the retro goes live.',
    dataSources: [
      'LEIA Snapshot Storage — this sprint\'s locked metrics (points, health, scope churn) plus prior-sprint baselines for comparison.',
      'Retro Tool — what went well, areas to improve, and recurring themes from the ceremony.',
      'EOW Survey — team health score and any open-text verbatims that add context to morale.',
      'AI / Cursor MCP Layer — turns the structured inputs above into a readable paragraph; does not calculate numbers.',
    ],
    processing: [
      'Bundle the sprint snapshot, retro themes, and EOW scores into a single structured payload.',
      'Send that payload to the AI layer with a fixed prompt template (stored in LEIA scripts/).',
      'David reads the draft, fixes anything misstated, and publishes the final text.',
    ],
  },
  'headline-stats': {
    title: 'Four Headline Stats',
    whatItShows: 'Points Delivered (54), Planned vs Delivered (54/48), Team Health (7.8), Scope Churn (+3/−2) with deltas vs S22.',
    whyImportant: 'Leadership sees delivery output, plan adherence, morale, and mid-sprint disruption in one row.',
    displayType: 'Four stat cards — large numbers with delta pills',
    owner: 'David (Scrum Master)',
    ownerWhy: 'Verifies all four numbers are correct and refreshes them after sprint close, before the retro is shared.',
    dataSources: [
      'Jira — sprint report totals for story points completed and originally committed in the sprint.',
      'Jira — issue changelog to detect tickets added to or removed from the sprint mid-flight (scope churn).',
      'EOW Survey — average 1–10 morale score across all responses collected on the last sprint day.',
      'LEIA Snapshot Storage — day-1 committed points and prior-sprint values used to calculate delta pills (e.g. vs S22).',
    ],
    processing: [
      'Sum completed story points from the Jira sprint report for Points Delivered.',
      'Compare delivered points to the LEIA day-1 snapshot for Planned vs Delivered.',
      'Average all EOW survey responses into the Team Health score.',
      'Count mid-sprint ticket adds and removals from Jira changelog for Scope Churn, then compute deltas vs the prior LEIA snapshot.',
    ],
  },
  'program-progress': {
    title: 'Program & Capability Progress',
    whatItShows: 'Program cards for CCN R2, BEEP, WoT plus workstream bars for Identity (Kavita), Guest Events (Chu), Analytics (Elaine), Integration (Emily), Activation (Samantha).',
    whyImportant: 'Mid-level view of program pace and which capabilities are ahead or at risk.',
    displayType: 'Three program cards + five horizontal progress bars',
    owner: 'David (Scrum Master)',
    ownerWhy: 'Pulls Done points from Jira, validates percentages with capability leads, and updates status labels before retro publish.',
    dataSources: [
      'Jira — story points on Done tickets, grouped by program label (CCN R2, BEEP, WoT) and workstream label (Identity, Guest Events, Analytics, Integration, Activation).',
      'LEIA Snapshot Storage — total estimated program scope (the denominator) and last sprint\'s percentages for delta calculation.',
    ],
    processing: [
      'Sum Done points per program and divide by the LEIA scope baseline to get each program card percentage.',
      'Sum Done points per workstream label and render as horizontal progress bars with owner names.',
      'Compare this sprint\'s percentage to the prior LEIA snapshot to produce the delta text (e.g. "+8% this sprint").',
      'Apply on-track or at-risk status based on pace vs target milestones.',
    ],
  },
  'work-detail': {
    title: 'Sprint Delivery Detail',
    whatItShows: 'Completed work table by workstream, What Went Well / Areas to Improve themes, action items owned by David, Ryan, Brian, Emily, Elaine.',
    whyImportant: 'Granular shipped work plus qualitative retro story and process improvement commitments.',
    displayType: 'Grouped table + two-column bullet lists + action items table',
    owner: 'David (Scrum Master)',
    ownerWhy: 'Facilitates the retro, imports ceremony themes, and keeps the completed-work table and action items current after sprint close.',
    dataSources: [
      'Jira — Done parent stories in the sprint (GST360 project), including workstream label, program, and story points.',
      'Retro Tool — what went well and areas to improve lists captured during the ceremony (Parabol or Miro export).',
      'Jira — tickets tagged retro-action for open action items, with assignee and due sprint.',
    ],
    processing: [
      'Query Jira for Done parent issues in the closed sprint and group rows by workstream.',
      'Import retro ceremony bullet lists; flag any theme that also appeared last sprint as recurring.',
      'Pull retro-action labeled tickets from Jira and merge with any items still open from the prior LEIA snapshot.',
    ],
  },
  'people-capacity': {
    title: 'People & Team Health',
    whatItShows: 'Individual delivery for Alex, Jordan, Sam, Taylor, Morgan, Casey, Riley, Avery — plus happiness buckets and 5-sprint trend (avg 7.8).',
    whyImportant: 'Shows who delivered fully vs carried work, and whether morale is evenly distributed.',
    displayType: 'Table with progress bars + five sentiment cards + sparkline',
    owner: 'David (Scrum Master)',
    ownerWhy: 'Runs the EOW survey, buckets happiness scores, and confirms individual delivery rows before retro publish.',
    dataSources: [
      'Jira — story points assigned to each person at sprint start and points completed by sprint close.',
      'EOW Survey — individual 1–10 scores used to bucket people into Thriving, Happy, Neutral, Stressed, or Burned Out.',
      'LEIA Snapshot Storage — day-1 assigned points per person and five sprints of health scores for the trend sparkline.',
    ],
    processing: [
      'Read each assignee\'s starting points from the LEIA day-1 snapshot and completed points from Jira at sprint close.',
      'Calculate delivery status per person (Full delivery, Partial, +Unplanned) by comparing assigned vs completed.',
      'Group EOW scores into five happiness buckets and compute counts and percentages.',
      'Plot the last five sprints\' average health scores from LEIA history as a sparkline.',
    ],
  },
  'risks-followup': {
    title: 'Risks & Follow-up',
    whatItShows: 'Retro action items — carried items (David, Ryan) highlighted at top; open items for Emily, Brian, Elaine.',
    whyImportant: 'Tracks whether the team closes the loop on process improvements from prior retros.',
    displayType: 'Compact table with status chips; Carried items float to top',
    owner: 'David (Scrum Master)',
    ownerWhy: 'Maintains the action item list after each retro and marks items as New, In Progress, or Carried into the next sprint.',
    dataSources: [
      'Jira — tickets with the retro-action label, including description, owner, due sprint, and status.',
      'LEIA Snapshot Storage — prior sprint\'s action item list to detect items that rolled forward unchanged.',
    ],
    processing: [
      'Fetch all open retro-action tickets from Jira.',
      'Compare each item to the prior LEIA snapshot — if it existed last sprint and is still open, mark it Carried.',
      'Sort carried items to the top, then order remaining items by due sprint.',
    ],
  },
};

const LEIA_PLANNING_META = {
  header: {
    ...LEIA_RETRO_META.header,
    whatItShows: 'Sprint 24, Jun 2–Jun 13, 10 days, Q2 W23, David (Scrum Master), program tags CCN R2 · BEEP · WoT.',
    ownerWhy: 'Updates sprint name, dates, length, and program tags before the planning summary is shared with stakeholders.',
  },
  'ai-insight': {
    title: 'AI Insight',
    whatItShows: 'Forward-looking narrative: 62 pts vs 58 avg velocity, BEEP-442 dependency risk, Samantha OOO days 6–10, Day 1 front-load for Emily.',
    whyImportant: 'Prep for planning — surfaces stretch vs conservative commitment and top risk before sprint starts.',
    displayType: 'Shaded narrative card — paragraph text',
    owner: 'David (Scrum Master)',
    ownerWhy: 'Reviews the AI-generated planning brief, edits for accuracy, and approves it before the planning meeting.',
    dataSources: [
      'LEIA Snapshot Storage — rolling velocity average, prior sprint risks, and historical commitment patterns.',
      'Jira — current sprint backlog (committed points, blockers, dependency links) and velocity from the last 3–5 closed sprints.',
      'Outlook Calendar — OOO and partial-availability flags for team members during the upcoming sprint dates.',
      'AI / Cursor MCP Layer — turns the structured inputs above into a forward-looking paragraph; does not calculate numbers.',
    ],
    processing: [
      'Compare total committed points in Jira to the LEIA rolling velocity average.',
      'Rank open blocker and dependency tickets from Jira by impact on committed work.',
      'Factor Outlook OOO data into the narrative (e.g. Samantha days 6–10).',
      'David reads the AI draft, corrects anything misstated, and publishes before planning kickoff.',
    ],
  },
  'headline-stats': {
    title: 'Four Headline Stats',
    whatItShows: 'Committed Points (62), Avg Velocity (58), Stories in Scope (16, 3 carryover), Capacity Utilized (91%).',
    whyImportant: 'Immediately answers whether the team is overcommitting given real availability.',
    displayType: 'Four stat cards with context notes',
    owner: 'David (Scrum Master)',
    ownerWhy: 'Confirms committed points, velocity, carryover count, and capacity % are accurate before sprint kickoff.',
    dataSources: [
      'Jira — sum of story points on all tickets in the upcoming sprint backlog, plus ticket count.',
      'Jira — sprint reports from the last 3–5 closed sprints used to calculate average velocity.',
      'Outlook Calendar — OOO events and partial availability to determine how many points the team can actually deliver.',
      'LEIA Snapshot Storage — carryover ticket list (open items from the prior sprint) and day-1 capacity baseline.',
    ],
    processing: [
      'Sum committed story points and count tickets in the Jira sprint backlog.',
      'Average completed points from the last three closed Jira sprint reports for Avg Velocity.',
      'Identify tickets carried over from the prior sprint that are still in the new backlog.',
      'Calculate Capacity Utilized = committed points ÷ available capacity (headcount adjusted for Outlook OOO).',
    ],
  },
  'program-progress': {
    ...LEIA_RETRO_META['program-progress'],
    whatItShows: 'Entering-sprint baseline for CCN R2, BEEP, WoT and workstreams Identity · Guest Events · Analytics · Integration · Activation.',
    ownerWhy: 'Confirms entering-sprint program and workstream baselines with capability leads before planning is published.',
    dataSources: [
      'Jira — committed story points in the upcoming sprint, grouped by program and workstream labels.',
      'LEIA Snapshot Storage — total program scope baseline and prior sprint percentages for comparison.',
    ],
    processing: [
      'Sum committed (not Done) points per program label and calculate entering-sprint percentage vs LEIA scope baseline.',
      'Sum committed points per workstream and render progress bars with capability lead names.',
      'Compare entering percentages to prior LEIA snapshot to show whether each program is pacing toward its target.',
    ],
  },
  'work-detail': {
    title: 'Sprint Plan Detail',
    whatItShows: 'Sprint goals by program (Kavita, Elaine, Chu, Emily, Samantha, Brian), committed work table, velocity chart S19–S24.',
    whyImportant: 'Business-level goals plus readable backlog and historical commitment context for stakeholders.',
    displayType: 'Goal lists + sortable table + bar chart with average line',
    owner: 'David (Scrum Master)',
    ownerWhy: 'Assembles sprint goals, committed work table, and velocity chart after planning and before sprint day 1.',
    dataSources: [
      'LEIA Snapshot Storage — sprint goal text, confirmed/at-risk flags, and five sprints of velocity history for the chart.',
      'Jira — full upcoming sprint backlog with story points, program labels, assignees, and priority.',
      'Jira — completed points from the last 5 closed sprint reports for the velocity bar chart.',
    ],
    processing: [
      'Match each sprint goal to linked Jira tickets and mark as confirmed or at-risk based on blocker/dependency status.',
      'Pull the full sprint backlog from Jira and render as a sortable committed-work table grouped by workstream.',
      'Build a 5-sprint bar chart from Jira sprint report history and overlay the rolling average velocity line.',
    ],
  },
  'people-capacity': {
    title: 'Team Capacity & Benchmark',
    whatItShows: 'Per-person committed points vs 3-sprint avg for Alex, Jordan, Sam, Taylor, Morgan, Casey, Riley, Avery — OOO flag for Avery.',
    whyImportant: 'Surfaces individual over/under-loading and availability constraints before day 1.',
    displayType: 'Table grouped by Eng/DPE with variance chips',
    owner: 'David (Scrum Master)',
    ownerWhy: 'Collects OOO/availability from the team and Outlook, then validates per-person load before sprint kickoff.',
    dataSources: [
      'Jira — story points assigned to each person in the upcoming sprint backlog.',
      'LEIA Snapshot Storage — each person\'s average committed points over the last 3 sprints for benchmark comparison.',
      'Outlook Calendar — formal OOO events; informal partial availability entered manually by David before planning.',
    ],
    processing: [
      'Sum assigned story points per person from the Jira sprint backlog.',
      'Compare each person\'s committed load to their 3-sprint LEIA average and label as above, avg, or below.',
      'Flag OOO or partial availability from Outlook (and any manual notes) next to the affected person\'s row.',
    ],
  },
  'risks-followup': {
    title: 'Risks & Blockers',
    whatItShows: 'Prioritized risks owned by Emily, David, Brian, Chu — BEEP-442 dependency, test env instability, OOO impact, requirements gaps.',
    whyImportant: 'Exposes sprint exposure before kickoff so leadership can escalate early.',
    displayType: 'Prioritized list with severity dots and chips',
    owner: 'David (Scrum Master)',
    ownerWhy: 'Maintains the risk register before sprint kickoff and updates severity and resolution notes as blockers resolve.',
    dataSources: [
      'Jira — open tickets with blocker label or Blocked status on board 13159, plus dependency links (blocks / is blocked by).',
      'LEIA Snapshot Storage — unresolved retro action items and risks carried forward from the prior sprint.',
    ],
    processing: [
      'Query Jira for open blocker and dependency tickets affecting the upcoming sprint backlog.',
      'Pull any unresolved retro action items from the prior LEIA snapshot that still pose sprint risk.',
      'Assign severity (High, Medium, Low), name an owner per row, and sort highest severity first.',
    ],
  },
};

const LEIA_INITIAL_RETRO = {"identity":{"sprintNumber":23,"sprintName":"Sprint 23 — Retrospective Summary","platform":"Data Plat Platform","dateRange":"May 15 – May 30, 2025","participants":12,"scrumMaster":"David","status":"Completed","programTags":[{"label":"CCN R2","color":"blue"},{"label":"BEEP","color":"orange"},{"label":"WoT","color":"green"}]},"aiInsight":"Sprint 23 delivered 54 story points against a 48-point commitment — a solid +6 surplus driven by strong Identity and Analytics workstreams. Team health rose to 7.8 (+0.6), though the happiness distribution reveals two members in the Stressed bucket, suggesting uneven workload. Scope churn was moderate (+3 added, −2 removed), within the team's typical range. Integration remains the primary risk area entering Sprint 24, with two carried action items on cross-team dependency meetings that need resolution in the first two days.","headlineStats":[{"id":"points-delivered","value":"54","label":"Points delivered","delta":"+6 vs. S22","deltaDirection":"up"},{"id":"planned-vs-delivered","value":"54 / 48","label":"Delivered / Planned","subNote":"Above plan","healthColor":"green"},{"id":"team-health","value":"7.8","label":"Team health","delta":"+0.6 vs. S22","deltaDirection":"up","healthColor":"green"},{"id":"scope-churn","value":"+3 / −2","label":"Scope changes","subNote":"Within typical range","healthColor":"green"}],"programSnapshots":[{"name":"CCN R2","percentage":72,"delta":"+8% this sprint","remaining":"28 pts remaining","status":"On track","statusColor":"green","color":"#3b82f6"},{"name":"BEEP","percentage":58,"delta":"+4% this sprint","remaining":"42 pts remaining","status":"At risk","statusColor":"amber","color":"#f59e0b"},{"name":"WoT","percentage":85,"delta":"+12% this sprint","remaining":"15 pts remaining","status":"On track","statusColor":"green","color":"#10b981"}],"workstreamProgress":[{"name":"Identity","percentage":78,"status":"On track","owner":"Kavita"},{"name":"Guest Events","percentage":65,"status":"On track","owner":"Chu"},{"name":"Analytics","percentage":82,"status":"On track","owner":"Elaine"},{"name":"Integration","percentage":45,"status":"At risk","owner":"Emily"},{"name":"Activation","percentage":70,"status":"On track","owner":"Samantha"}],"completedWork":[{"workstream":"Identity","workstreamColor":"#8b5cf6","storyName":"Build dining reservation event pipeline","program":"CCN R2","points":8},{"workstream":"Identity","workstreamColor":"#8b5cf6","storyName":"Fix identity resolution edge case","program":"BEEP","points":5},{"workstream":"Analytics","workstreamColor":"#06b6d4","storyName":"Guest journey funnel dashboard v2","program":"WoT","points":13},{"workstream":"Analytics","workstreamColor":"#06b6d4","storyName":"Real-time event aggregation service","program":"CCN R2","points":8},{"workstream":"Guest Events","workstreamColor":"#ec4899","storyName":"Park entry event schema update","program":"CCN R2","points":5},{"workstream":"Integration","workstreamColor":"#f59e0b","storyName":"Cross-platform API gateway config","program":"BEEP","points":8},{"workstream":"Activation","workstreamColor":"#10b981","storyName":"Onboarding flow A/B test results","program":"WoT","points":3},{"workstream":"Activation","workstreamColor":"#10b981","storyName":"Push notification targeting rules","program":"BEEP","points":4}],"wentWell":[{"text":"Strong cross-workstream collaboration on CCN R2 deliverables"},{"text":"Analytics dashboard shipped ahead of schedule"},{"text":"New standup format reduced meeting overrun","recurring":true},{"text":"Pair programming sessions improved code review turnaround"},{"text":"Clear sprint goals set at planning — team aligned from day 1"}],"toImprove":[{"text":"Cross-team dependency meetings still ad hoc — need scheduled cadence","recurring":true},{"text":"Integration testing environment unstable mid-sprint"},{"text":"Requirements clarity on BEEP epics caused rework","recurring":true},{"text":"Late ticket additions disrupted Analytics capacity planning"},{"text":"Documentation lagging behind shipped features"}],"actionItems":[{"description":"Schedule recurring cross-team dependency sync (bi-weekly)","owner":"David","dueSprint":"S24","status":"Carried"},{"description":"Define acceptance criteria template before sprint start","owner":"Ryan","dueSprint":"S24","status":"Carried"},{"description":"Stabilize integration test environment — root cause analysis","owner":"Emily","dueSprint":"S24","status":"In Progress"},{"description":"Create BEEP epic requirements checklist","owner":"Brian","dueSprint":"S24","status":"New"},{"description":"Document shipped Analytics features in Confluence","owner":"Elaine","dueSprint":"S25","status":"New"}],"individualDelivery":[{"name":"Alex Chen","initials":"AC","role":"Eng","assigned":10,"completed":10,"status":"Full delivery","workstream":"Identity"},{"name":"Jordan Lee","initials":"JL","role":"Eng","assigned":8,"completed":8,"status":"Full delivery","workstream":"Analytics"},{"name":"Sam Rivera","initials":"SR","role":"Eng","assigned":8,"completed":6,"status":"Partial","workstream":"Integration"},{"name":"Taylor Kim","initials":"TK","role":"Eng","assigned":5,"completed":5,"status":"Full delivery","workstream":"Guest Events"},{"name":"Morgan Patel","initials":"MP","role":"Eng","assigned":0,"completed":5,"status":"+Unplanned","workstream":"Activation"},{"name":"Casey Wong","initials":"CW","role":"DPE","assigned":8,"completed":8,"status":"Full delivery","workstream":"Analytics"},{"name":"Riley Nguyen","initials":"RN","role":"DPE","assigned":5,"completed":5,"status":"Full delivery","workstream":"Identity"},{"name":"Avery Brooks","initials":"AB","role":"DPE","assigned":8,"completed":7,"status":"Partial","workstream":"Integration"}],"happinessBuckets":[{"label":"Thriving","count":3,"percentage":25,"color":"#059669"},{"label":"Happy","count":5,"percentage":42,"color":"#34d399"},{"label":"Neutral","count":2,"percentage":17,"color":"#fbbf24"},{"label":"Stressed","count":2,"percentage":17,"color":"#f59e0b"},{"label":"Burned Out","count":0,"percentage":0,"color":"#ef4444"}],"happinessTrend":[6.8,7.0,7.2,7.5,7.8],"happinessAverage":7.8};

const LEIA_INITIAL_PLANNING = {"identity":{"sprintNumber":24,"sprintName":"Sprint 24 — Planning Summary","platform":"Data Plat Platform","dateRange":"Jun 2 – Jun 13, 2025","participants":12,"scrumMaster":"David","sprintLengthDays":10,"quarterWeek":"Q2 W23","programTags":[{"label":"CCN R2","color":"blue"},{"label":"BEEP","color":"orange"},{"label":"WoT","color":"green"}]},"aiInsight":"Sprint 24 commits 62 story points against a 58-point rolling average — a modest +4 stretch that is achievable if Integration dependencies resolve in the first two days. The highest-risk item is the cross-platform API dependency (BEEP-442) blocking three downstream stories; Emily should front-load the dependency sync meeting on Day 1. Capacity is at 91% utilization with Samantha OOO days 6–10 — consider shifting her 8 points to Alex or Jordan. CCN R2 goals are well-scoped; BEEP goals carry two at-risk dependencies that need confirmation before sprint kickoff.","headlineStats":[{"id":"committed-points","value":"62","label":"Committed points","subNote":"Capacity: 68 pts"},{"id":"avg-velocity","value":"58","label":"Avg velocity (3 sprints)","delta":"↑6% vs last sprint","deltaDirection":"up"},{"id":"stories-in-scope","value":"16","label":"Stories in scope","subNote":"3 carried over from S23","healthColor":"amber"},{"id":"capacity-utilized","value":"91%","label":"Capacity utilized","subNote":"Healthy range","healthColor":"green"}],"programSnapshots":[{"name":"CCN R2","percentage":72,"delta":"Target: 85% by S26","remaining":"28 pts remaining","status":"On track","statusColor":"green","color":"#3b82f6"},{"name":"BEEP","percentage":58,"delta":"Target: 70% by S27","remaining":"42 pts remaining","status":"At risk","statusColor":"amber","color":"#f59e0b"},{"name":"WoT","percentage":85,"delta":"Target: 95% by S25","remaining":"15 pts remaining","status":"On track","statusColor":"green","color":"#10b981"}],"workstreamProgress":[{"name":"Identity","percentage":78,"status":"On track","owner":"Kavita"},{"name":"Guest Events","percentage":65,"status":"On track","owner":"Chu"},{"name":"Analytics","percentage":82,"status":"On track","owner":"Elaine"},{"name":"Integration","percentage":45,"status":"At risk","owner":"Emily"},{"name":"Activation","percentage":70,"status":"On track","owner":"Samantha"}],"programGoals":[{"program":"CCN R2","color":"#3b82f6","goals":[{"text":"Complete dining reservation event pipeline end-to-end","confirmed":true,"owner":"Kavita"},{"text":"Deploy guest journey funnel dashboard to production","confirmed":true,"owner":"Elaine"},{"text":"Integrate park entry events with identity resolution","confirmed":false,"owner":"Chu"}]},{"program":"BEEP","color":"#f59e0b","goals":[{"text":"Resolve cross-platform API gateway blockers","confirmed":false,"owner":"Emily"},{"text":"Ship push notification targeting v2","confirmed":true,"owner":"Samantha"},{"text":"Complete BEEP epic requirements for S25 planning","confirmed":true,"owner":"Brian"}]},{"program":"WoT","color":"#10b981","goals":[{"text":"Launch onboarding A/B test in production","confirmed":true,"owner":"Samantha"},{"text":"Analytics real-time pipeline for guest events","confirmed":true,"owner":"Elaine"}]}],"committedWork":[{"workstream":"Identity","workstreamColor":"#8b5cf6","storyName":"Identity resolution v3 migration","ticketKey":"GST360-1201","programs":["CCN R2"],"role":"Eng","points":8,"priority":"High","owners":["Alex Chen"]},{"workstream":"Identity","workstreamColor":"#8b5cf6","storyName":"Guest profile merge logic","ticketKey":"GST360-1205","programs":["BEEP"],"role":"Both","points":5,"priority":"Medium","owners":["Alex Chen","Riley Nguyen"]},{"workstream":"Analytics","workstreamColor":"#06b6d4","storyName":"Funnel dashboard production deploy","ticketKey":"GST360-1210","programs":["CCN R2","WoT"],"role":"DPE","points":5,"priority":"High","owners":["Casey Wong"]},{"workstream":"Analytics","workstreamColor":"#06b6d4","storyName":"Real-time event aggregation scaling","ticketKey":"GST360-1215","programs":["WoT"],"role":"Eng","points":8,"priority":"Medium","owners":["Jordan Lee"]},{"workstream":"Guest Events","workstreamColor":"#ec4899","storyName":"Park entry event integration","ticketKey":"GST360-1220","programs":["CCN R2"],"role":"Eng","points":5,"priority":"High","owners":["Taylor Kim"]},{"workstream":"Integration","workstreamColor":"#f59e0b","storyName":"Cross-platform API gateway (BEEP-442)","ticketKey":"GST360-1225","programs":["BEEP"],"role":"Eng","points":13,"priority":"High","owners":["Sam Rivera"]},{"workstream":"Integration","workstreamColor":"#f59e0b","storyName":"Third-party webhook reliability","ticketKey":"GST360-1230","programs":["BEEP"],"role":"Both","points":5,"priority":"Medium","owners":["Sam Rivera","Avery Brooks"]},{"workstream":"Activation","workstreamColor":"#10b981","storyName":"Onboarding A/B test launch","ticketKey":"GST360-1235","programs":["WoT"],"role":"DPE","points":3,"priority":"High","owners":["Morgan Patel"]},{"workstream":"Activation","workstreamColor":"#10b981","storyName":"Push notification targeting v2","ticketKey":"GST360-1240","programs":["BEEP"],"role":"Eng","points":5,"priority":"Medium","owners":["Morgan Patel"]},{"workstream":"Analytics","workstreamColor":"#06b6d4","storyName":"Data quality monitoring alerts","ticketKey":"GST360-1245","programs":["CCN R2"],"role":"DPE","points":5,"priority":"Low","owners":["Casey Wong"]}],"velocityHistory":[{"sprint":"S19","points":52},{"sprint":"S20","points":48},{"sprint":"S21","points":55},{"sprint":"S22","points":48},{"sprint":"S23","points":54},{"sprint":"S24","points":62,"isCurrent":true}],"avgVelocity":58,"teamCapacity":[{"name":"Alex Chen","initials":"AC","role":"Eng","committed":13,"threeSprintAvg":10,"variance":"above"},{"name":"Jordan Lee","initials":"JL","role":"Eng","committed":8,"threeSprintAvg":8,"variance":"avg"},{"name":"Sam Rivera","initials":"SR","role":"Eng","committed":18,"threeSprintAvg":10,"variance":"above"},{"name":"Taylor Kim","initials":"TK","role":"Eng","committed":5,"threeSprintAvg":6,"variance":"below"},{"name":"Morgan Patel","initials":"MP","role":"Eng","committed":8,"threeSprintAvg":5,"variance":"above"},{"name":"Casey Wong","initials":"CW","role":"DPE","committed":10,"threeSprintAvg":8,"variance":"above"},{"name":"Riley Nguyen","initials":"RN","role":"DPE","committed":5,"threeSprintAvg":5,"variance":"avg"},{"name":"Avery Brooks","initials":"AB","role":"DPE","committed":5,"threeSprintAvg":7,"variance":"below","availability":"OOO Jun 6–10"}],"risks":[{"severity":"High","description":"Cross-platform API dependency (BEEP-442) blocking 3 downstream stories","owner":"Emily","resolution":"Schedule dependency sync Day 1; escalate to BEEP team lead if unresolved by Day 2"},{"severity":"High","description":"Integration test environment instability from S23 not yet resolved","owner":"Emily","resolution":"Root cause analysis action item — target fix by Day 3"},{"severity":"Medium","description":"Samantha OOO days 6–10 reduces Activation capacity by 40%","owner":"David","resolution":"Shift 3 pts to Alex; defer push notification polish to S25"},{"severity":"Medium","description":"BEEP epic requirements still incomplete for 2 stories","owner":"Brian","resolution":"Requirements checklist due before sprint kickoff"},{"severity":"Low","description":"Park entry event schema change pending external team sign-off","owner":"Chu","resolution":"Follow up with Guest Events platform team — non-blocking for sprint start"}],"oooNotes":"Avery Brooks: OOO Jun 6–10 | Samantha (Activation lead): partial availability days 6–10"};
