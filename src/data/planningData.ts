import type { PlanningData } from '../types';

export const initialPlanningData: PlanningData = {
  identity: {
    sprintNumber: 24,
    sprintName: 'Sprint 24 — Planning Summary',
    platform: 'Data Plat Platform',
    dateRange: 'Jun 2 – Jun 13, 2025',
    participants: 12,
    scrumMaster: 'David',
    sprintLengthDays: 10,
    quarterWeek: 'Q2 W23',
    programTags: [
      { label: 'CCN R2', color: 'blue' },
      { label: 'BEEP', color: 'orange' },
      { label: 'WoT', color: 'green' },
    ],
  },
  aiInsight:
    'Sprint 24 commits 62 story points against a 58-point rolling average — a modest +4 stretch that is achievable if Integration dependencies resolve in the first two days. The highest-risk item is the cross-platform API dependency (BEEP-442) blocking three downstream stories; Emily should front-load the dependency sync meeting on Day 1. Capacity is at 91% utilization with Samantha OOO days 6–10 — consider shifting her 8 points to Alex or Jordan. CCN R2 goals are well-scoped; BEEP goals carry two at-risk dependencies that need confirmation before sprint kickoff.',
  headlineStats: [
    { id: 'committed-points', value: '62', label: 'Committed points', subNote: 'Capacity: 68 pts' },
    { id: 'avg-velocity', value: '58', label: 'Avg velocity (3 sprints)', delta: '↑6% vs last sprint', deltaDirection: 'up' },
    { id: 'stories-in-scope', value: '16', label: 'Stories in scope', subNote: '3 carried over from S23', healthColor: 'amber' },
    { id: 'capacity-utilized', value: '91%', label: 'Capacity utilized', subNote: 'Healthy range', healthColor: 'green' },
  ],
  programSnapshots: [
    { name: 'CCN R2', percentage: 72, delta: 'Target: 85% by S26', remaining: '28 pts remaining', status: 'On track', statusColor: 'green', color: '#3b82f6' },
    { name: 'BEEP', percentage: 58, delta: 'Target: 70% by S27', remaining: '42 pts remaining', status: 'At risk', statusColor: 'amber', color: '#f59e0b' },
    { name: 'WoT', percentage: 85, delta: 'Target: 95% by S25', remaining: '15 pts remaining', status: 'On track', statusColor: 'green', color: '#10b981' },
  ],
  workstreamProgress: [
    { name: 'Identity', percentage: 78, status: 'On track', owner: 'Kavita' },
    { name: 'Guest Events', percentage: 65, status: 'On track', owner: 'Chu' },
    { name: 'Analytics', percentage: 82, status: 'On track', owner: 'Elaine' },
    { name: 'Integration', percentage: 45, status: 'At risk', owner: 'Emily' },
    { name: 'Activation', percentage: 70, status: 'On track', owner: 'Samantha' },
  ],
  programGoals: [
    {
      program: 'CCN R2',
      color: '#3b82f6',
      goals: [
        { text: 'Complete dining reservation event pipeline end-to-end', confirmed: true, owner: 'Kavita' },
        { text: 'Deploy guest journey funnel dashboard to production', confirmed: true, owner: 'Elaine' },
        { text: 'Integrate park entry events with identity resolution', confirmed: false, owner: 'Chu' },
      ],
    },
    {
      program: 'BEEP',
      color: '#f59e0b',
      goals: [
        { text: 'Resolve cross-platform API gateway blockers', confirmed: false, owner: 'Emily' },
        { text: 'Ship push notification targeting v2', confirmed: true, owner: 'Samantha' },
        { text: 'Complete BEEP epic requirements for S25 planning', confirmed: true, owner: 'Brian' },
      ],
    },
    {
      program: 'WoT',
      color: '#10b981',
      goals: [
        { text: 'Launch onboarding A/B test in production', confirmed: true, owner: 'Samantha' },
        { text: 'Analytics real-time pipeline for guest events', confirmed: true, owner: 'Elaine' },
      ],
    },
  ],
  committedWork: [
    { workstream: 'Identity', workstreamColor: '#8b5cf6', storyName: 'Identity resolution v3 migration', ticketKey: 'GST360-1201', programs: ['CCN R2'], role: 'Eng', points: 8, priority: 'High', owners: ['Alex Chen'] },
    { workstream: 'Identity', workstreamColor: '#8b5cf6', storyName: 'Guest profile merge logic', ticketKey: 'GST360-1205', programs: ['BEEP'], role: 'Both', points: 5, priority: 'Medium', owners: ['Alex Chen', 'Riley Nguyen'] },
    { workstream: 'Analytics', workstreamColor: '#06b6d4', storyName: 'Funnel dashboard production deploy', ticketKey: 'GST360-1210', programs: ['CCN R2', 'WoT'], role: 'DPE', points: 5, priority: 'High', owners: ['Casey Wong'] },
    { workstream: 'Analytics', workstreamColor: '#06b6d4', storyName: 'Real-time event aggregation scaling', ticketKey: 'GST360-1215', programs: ['WoT'], role: 'Eng', points: 8, priority: 'Medium', owners: ['Jordan Lee'] },
    { workstream: 'Guest Events', workstreamColor: '#ec4899', storyName: 'Park entry event integration', ticketKey: 'GST360-1220', programs: ['CCN R2'], role: 'Eng', points: 5, priority: 'High', owners: ['Taylor Kim'] },
    { workstream: 'Integration', workstreamColor: '#f59e0b', storyName: 'Cross-platform API gateway (BEEP-442)', ticketKey: 'GST360-1225', programs: ['BEEP'], role: 'Eng', points: 13, priority: 'High', owners: ['Sam Rivera'] },
    { workstream: 'Integration', workstreamColor: '#f59e0b', storyName: 'Third-party webhook reliability', ticketKey: 'GST360-1230', programs: ['BEEP'], role: 'Both', points: 5, priority: 'Medium', owners: ['Sam Rivera', 'Avery Brooks'] },
    { workstream: 'Activation', workstreamColor: '#10b981', storyName: 'Onboarding A/B test launch', ticketKey: 'GST360-1235', programs: ['WoT'], role: 'DPE', points: 3, priority: 'High', owners: ['Morgan Patel'] },
    { workstream: 'Activation', workstreamColor: '#10b981', storyName: 'Push notification targeting v2', ticketKey: 'GST360-1240', programs: ['BEEP'], role: 'Eng', points: 5, priority: 'Medium', owners: ['Morgan Patel'] },
    { workstream: 'Analytics', workstreamColor: '#06b6d4', storyName: 'Data quality monitoring alerts', ticketKey: 'GST360-1245', programs: ['CCN R2'], role: 'DPE', points: 5, priority: 'Low', owners: ['Casey Wong'] },
  ],
  velocityHistory: [
    { sprint: 'S19', points: 52 },
    { sprint: 'S20', points: 48 },
    { sprint: 'S21', points: 55 },
    { sprint: 'S22', points: 48 },
    { sprint: 'S23', points: 54 },
    { sprint: 'S24', points: 62, isCurrent: true },
  ],
  avgVelocity: 58,
  teamCapacity: [
    { name: 'Alex Chen', initials: 'AC', role: 'Eng', committed: 13, threeSprintAvg: 10, variance: 'above' },
    { name: 'Jordan Lee', initials: 'JL', role: 'Eng', committed: 8, threeSprintAvg: 8, variance: 'avg' },
    { name: 'Sam Rivera', initials: 'SR', role: 'Eng', committed: 18, threeSprintAvg: 10, variance: 'above' },
    { name: 'Taylor Kim', initials: 'TK', role: 'Eng', committed: 5, threeSprintAvg: 6, variance: 'below' },
    { name: 'Morgan Patel', initials: 'MP', role: 'Eng', committed: 8, threeSprintAvg: 5, variance: 'above' },
    { name: 'Casey Wong', initials: 'CW', role: 'DPE', committed: 10, threeSprintAvg: 8, variance: 'above' },
    { name: 'Riley Nguyen', initials: 'RN', role: 'DPE', committed: 5, threeSprintAvg: 5, variance: 'avg' },
    { name: 'Avery Brooks', initials: 'AB', role: 'DPE', committed: 5, threeSprintAvg: 7, variance: 'below', availability: 'OOO Jun 6–10' },
  ],
  risks: [
    { severity: 'High', description: 'Cross-platform API dependency (BEEP-442) blocking 3 downstream stories', owner: 'Emily', resolution: 'Schedule dependency sync Day 1; escalate to BEEP team lead if unresolved by Day 2' },
    { severity: 'High', description: 'Integration test environment instability from S23 not yet resolved', owner: 'Emily', resolution: 'Root cause analysis action item — target fix by Day 3' },
    { severity: 'Medium', description: 'Samantha OOO days 6–10 reduces Activation capacity by 40%', owner: 'David', resolution: 'Shift 3 pts to Alex; defer push notification polish to S25' },
    { severity: 'Medium', description: 'BEEP epic requirements still incomplete for 2 stories', owner: 'Brian', resolution: 'Requirements checklist due before sprint kickoff' },
    { severity: 'Low', description: 'Park entry event schema change pending external team sign-off', owner: 'Chu', resolution: 'Follow up with Guest Events platform team — non-blocking for sprint start' },
  ],
  oooNotes: 'Avery Brooks: OOO Jun 6–10 | Samantha (Activation lead): partial availability days 6–10',
};
