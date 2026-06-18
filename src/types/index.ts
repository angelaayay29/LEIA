export type UserRole = 'editor' | 'viewer';

export interface User {
  username: string;
  role: UserRole;
  displayName: string;
}

export interface WidgetMeta {
  id: string;
  title: string;
  whatItShows: string;
  whyImportant: string;
  displayType: string;
  owner: string;
  ownerWhy: string;
  dataSources: string[];
  processing: string[];
  pendingQuestions: string[];
}

export interface ProgramTag {
  label: string;
  color: 'blue' | 'orange' | 'green' | 'purple';
}

export interface SprintIdentity {
  sprintNumber: number;
  sprintName: string;
  platform: string;
  dateRange: string;
  participants: number;
  scrumMaster: string;
  status?: string;
  sprintLengthDays?: number;
  quarterWeek?: string;
  programTags: ProgramTag[];
}

export interface HeadlineStat {
  id: string;
  value: string;
  label: string;
  delta?: string;
  deltaDirection?: 'up' | 'down' | 'neutral';
  subNote?: string;
  healthColor?: 'green' | 'amber' | 'red';
}

export interface ProgramSnapshot {
  name: string;
  percentage: number;
  delta: string;
  remaining: string;
  status: string;
  statusColor: 'green' | 'amber' | 'red';
  color: string;
}

export interface WorkstreamProgress {
  name: string;
  percentage: number;
  status: 'On track' | 'At risk' | 'Behind';
  owner: string;
}

export interface CompletedWorkRow {
  workstream: string;
  workstreamColor: string;
  storyName: string;
  program: string;
  points: number;
}

export interface RetroTheme {
  text: string;
  recurring?: boolean;
}

export interface ActionItem {
  description: string;
  owner: string;
  dueSprint: string;
  status: 'New' | 'In Progress' | 'Carried';
}

export interface IndividualDelivery {
  name: string;
  initials: string;
  role: 'Eng' | 'DPE';
  assigned: number;
  completed: number;
  status: 'Full delivery' | 'Partial' | '+Unplanned';
  workstream: string;
}

export interface HappinessBucket {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface RetroData {
  identity: SprintIdentity;
  aiInsight: string;
  headlineStats: HeadlineStat[];
  programSnapshots: ProgramSnapshot[];
  workstreamProgress: WorkstreamProgress[];
  completedWork: CompletedWorkRow[];
  wentWell: RetroTheme[];
  toImprove: RetroTheme[];
  actionItems: ActionItem[];
  individualDelivery: IndividualDelivery[];
  happinessBuckets: HappinessBucket[];
  happinessTrend: number[];
  happinessAverage: number;
}

export interface SprintGoal {
  text: string;
  confirmed: boolean;
  owner: string;
}

export interface ProgramGoals {
  program: string;
  color: string;
  goals: SprintGoal[];
}

export interface CommittedWorkRow {
  workstream: string;
  workstreamColor: string;
  storyName: string;
  ticketKey: string;
  programs: string[];
  role: 'Both' | 'Eng' | 'DPE';
  points: number;
  priority: 'High' | 'Medium' | 'Low';
  owners: string[];
}

export interface VelocityBar {
  sprint: string;
  points: number;
  isCurrent?: boolean;
}

export interface TeamCapacityRow {
  name: string;
  initials: string;
  role: 'Eng' | 'DPE';
  committed: number;
  threeSprintAvg: number;
  variance: 'avg' | 'above' | 'below';
  availability?: string;
}

export interface RiskItem {
  severity: 'High' | 'Medium' | 'Low';
  description: string;
  owner: string;
  resolution: string;
}

export interface PlanningData {
  identity: SprintIdentity;
  aiInsight: string;
  headlineStats: HeadlineStat[];
  programSnapshots: ProgramSnapshot[];
  workstreamProgress: WorkstreamProgress[];
  programGoals: ProgramGoals[];
  committedWork: CommittedWorkRow[];
  velocityHistory: VelocityBar[];
  avgVelocity: number;
  teamCapacity: TeamCapacityRow[];
  risks: RiskItem[];
  oooNotes?: string;
}

export type PageType = 'retro' | 'planning';

export const DEFAULT_RETRO_WIDGET_ORDER = [
  'header',
  'ai-insight',
  'headline-stats',
  'program-progress',
  'work-detail',
  'people-capacity',
  'risks-followup',
] as const;

export const DEFAULT_PLANNING_WIDGET_ORDER = [
  'header',
  'ai-insight',
  'headline-stats',
  'program-progress',
  'work-detail',
  'people-capacity',
  'risks-followup',
] as const;

export type RetroWidgetId = (typeof DEFAULT_RETRO_WIDGET_ORDER)[number];
export type PlanningWidgetId = (typeof DEFAULT_PLANNING_WIDGET_ORDER)[number];
