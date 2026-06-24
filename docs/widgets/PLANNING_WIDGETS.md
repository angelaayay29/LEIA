# LEIA Planning Widgets

Specifications for every widget on the **Planning** summary page.  
Source: GST360 on `disneyexperiences.atlassian.net`, board 608.

**Pipeline:** Jira → `scripts/jira_to_leia.py` → `static/data/jira-snapshot.json` → browser

## Shared Jira field reference

| Field ID | Name | Usage |
|----------|------|--------|
| `customfield_10020` | Sprint | Sprint name, dates, state |
| `customfield_10042` | Story Points | Points (default 1 if empty) |
| `fields.summary` | Summary | Story title |
| `fields.status.name` | Status | Done, Blocked, In Progress, Deploy, To Do |
| `fields.status.statusCategory.key` | Status category | done \| indeterminate \| new |
| `fields.assignee.displayName` | Assignee | People widgets |
| `fields.parent.fields.summary` | Epic | Workstream + program hints |
| `fields.components[].name` | Components | Eng / DPE role |
| `fields.labels[]` | Labels | Program fallback |
| `fields.priority.name` | Priority | Risk severity |
| `fields.issuetype.subtask` | Subtask flag | Excludes subtasks from counts |
| `key` | Issue key | GST360-### |

---

## 1. Sprint Identity Bar

### Data sources

| Source | Jira fields |
|--------|-------------|
| Jira GST360 board 608 | `customfield_10020` on planning sprint issues |
| Jira GST360 | `fields.assignee.displayName` |
| Jira GST360 | Program inference from parent/labels |
| Config | Scrum Master, sprint length (14 days default) |

### Statistics & formulas

| Display | Definition | How obtained |
|---------|------------|--------------|
| **Sprint name** | `{sprint name} — Planning Summary` | `customfield_10020.name` on planning sprint |
| **Date range** | Sprint start–end | `startDate`, `endDate` |
| **Sprint length** | Days in sprint | Default 14; can derive from dates |
| **Quarter week** | Calendar label | UTC week at sync time |
| **Participants** | Distinct assignees in planning backlog | Unique assignees on planning sprint issues |
| **Program tags** | CCN R2 / BEEP / WoT | From `program_from_issue()` on planning issues |

### Processing

1. JQL: `project = GST360 AND sprint = "{planning sprint name}"`
2. Same helpers as retro header; planning view adds sprint length and quarter week

---

## 2. AI Insight

### Data sources

| Source | Fields |
|--------|--------|
| Jira planning sprint | `customfield_10042`, issue count, `status` Blocked |
| Jira closed sprints | Done points for velocity average |
| OOO schedule | `static/data/ooo-schedule.json` (optional) |
| LEIA script | `build_ai_insight_planning()` |

### Statistics in narrative

| Phrase | Formula |
|--------|---------|
| Committed points | `SUM(customfield_10042)` on all planning sprint issues |
| Story count | `COUNT(parent issues)` in planning sprint |
| Rolling avg velocity | `AVG(done points per closed sprint)` — see Sprint Plan Detail velocity |
| Stretch tone | “modest stretch” if `committed > avg_vel` |

### Processing

1. Compute committed, blocked, story_count, avg from snapshot builders
2. Render template paragraph; SM edits in editor mode

---

## 3. Executive Brief

### Data sources

| Source | Inputs |
|--------|--------|
| Jira planning sprint | Committed points, blocked count, risk list |
| OOO schedule | `static/data/ooo-schedule.json` |
| LEIA script | `build_executive_brief_planning()` |

### Checklist sections

| Section | Logic |
|---------|-------|
| **Review these** | Approve commitment vs velocity; confirm goals; review capacity/OOO |
| **How you can help** | Top 4 risk descriptions; OOO coverage asks; blocker escalations |

### Formulas

| Input | Formula |
|-------|---------|
| Stretch delta | `committed - avg_velocity` (story points) |
| OOO ask | Per person: `oooDays[]` → “Cover load for {name} — OOO D6, D7…” |

### Output shape

Each item: `{ "text": "...", "checked": false }`. Interactive checkboxes in UI; checked state saved to localStorage.

---

## 4. Four Headline Stats

### Data sources

| Stat | Jira fields |
|------|-------------|
| Committed points | `customfield_10042` on planning sprint |
| Avg velocity | Done `customfield_10042` in closed sprints (`customfield_10020.state = closed`) |
| Stories in scope | Parent issue count; Blocked status count |
| Capacity utilized | Heuristic from committed vs cap estimate |

### Statistics & formulas

#### Committed points
```
committed = SUM(customfield_10042) for all issues in planning sprint
```
- **Color:** green if `committed >= avg_velocity`, red if below
- **Delta:** `{committed - avg} vs avg`
- **Sub-note:** `Capacity: ~{cap} pts` where `cap = max(committed + 10, round(committed × 1.1))`

#### Avg velocity (closed sprints)
```
For each closed sprint S: pts(S) = SUM(customfield_10042) WHERE done
avg_velocity = ROUND(MEAN(pts(S)) for last up to 5 closed sprints)
```
- Current planning sprint bar excluded from average; shown separately on velocity chart

#### Stories in scope
```
story_count = COUNT(issues WHERE issuetype.subtask = false)
blocked = COUNT(WHERE status.name = Blocked)
```
- **Sub-note:** `{blocked} blocked` or “No blockers flagged”
- **Color:** amber if blocked > 0, else green

#### Capacity utilized
```
util% = MIN(99, ROUND(100 × committed / cap))
cap = max(committed + 10, round(committed × 1.1))
```
- **Sub-note:** “Healthy range” if 75 ≤ util ≤ 95, else “Review load”

### Processing

Built in `build_planning()` → `headlineStats` array

---

## 5. Program & Capability Progress

Uses the **same project-wide task formula** as retrospective (not limited to planning sprint only).

### Data sources

| Source | Jira fields |
|--------|-------------|
| Merged GST360 issues | All issues from retro + planning + velocity fetches |
| Sprint filter | `customfield_10020` not empty |
| Parent filter | `issuetype.subtask = false` |

### Program formula

```
total_tasks(program) = COUNT(GST360 parent issues with sprint,
  grouped by program_from_issue)

done_tasks(program) = COUNT(same WHERE status Done or Deploy)

program_% = ROUND(100 × done_tasks / total_tasks)
```

### Workstream formula

```
total_tasks(ws) = COUNT by workstream_from_issue)
done_tasks(ws) = COUNT done in each workstream
workstream_% = ROUND(100 × done / total)
```

### Display fields

| UI element | Maps to |
|------------|---------|
| Percentage | `program_%` or `workstream_%` |
| Meta line | `{done} of {total} tasks done · {remaining} tasks remaining` |
| Status pill | On track if % ≥ 40, else At risk |

### Processing

`build_program_snapshots(all_project_issues)` and `build_workstreams(all_project_issues)` in `jira_to_leia.py`

### Note for planning view

Shows **lifetime program completion** across all sprints attributed to GST360, not only the upcoming sprint commitment. Committed scope for the planning sprint appears in the Sprint Plan Detail table.

---

## 6. Sprint Plan Detail

### Data sources

| Section | Jira fields |
|---------|-------------|
| Sprint goals | Program tags + blocker state |
| Committed work | Full planning sprint backlog |
| Velocity chart | Done points per closed sprint + current commitment |

### Sprint goals

| Field | Formula |
|-------|---------|
| Goal text | Template: “Deliver committed {program} scope in {sprint name}” |
| Confirmed ✓ | `blocked == 0` for planning sprint |
| Owner | Scrum Master first name |

### Committed work table

| Column | Source |
|--------|--------|
| Workstream | `workstream_from_issue(issue)` |
| Ticket key | `key` (GST360-###) |
| Story | `fields.summary` |
| Program | `program_from_issue(issue)` |
| Role | `components[]` → Eng / DPE / Both |
| Points | `customfield_10042` (default 1) |
| Priority | `fields.priority.name` → High/Medium/Low |
| Owners | `assignee.displayName` |

**Filter:** parent issues only (`issuetype.subtask = false`)

### Velocity & commitment history

#### Per-sprint bar (historical)
```
For each closed sprint (last 5):
  bar_points = SUM(customfield_10042) WHERE done AND sprint = S
```

#### Current sprint bar
```
bar_points = SUM(customfield_10042) on all planning sprint issues (committed)
isCurrent = true
```

#### Rolling average line
```
avg_velocity = MEAN(historical bar_points excluding current)
```

#### Bar color vs baseline
```
green (above-avg) if bar_points >= avg_velocity
red (below-avg) if bar_points < avg_velocity
```

#### Callout delta
```
delta = current_committed - avg_velocity
color: green if delta >= 0, red if < 0
```

### Processing

1. `build_committed_work(active_issues)`
2. `velocity_history(velocity_issues, sprint_name, committed)`
3. Render grouped table + chart in `renderPlanningWorkDetail()`

---

## 7. Team Capacity & Benchmark

### Data sources

| Source | Fields |
|--------|--------|
| Jira planning sprint | `assignee.displayName`, `customfield_10042`, `components` |
| OOO schedule | `static/data/ooo-schedule.json` — `name`, `oooDays[]`, `note` |
| Benchmark | 3-sprint avg (placeholder: equals current committed until history wired) |

### Per-person row

| Column | Formula |
|--------|---------|
| **Committed** | `SUM(customfield_10042)` per assignee on planning sprint |
| **3-Sprint Avg** | `MEAN(committed per person over last 3 sprints)` — currently mirrors current sprint |
| **Variance** | above / avg / below vs benchmark (when history available) |
| **OOO badges** | For each day in `oooDays`: display `⚠ D{n}` |

### OOO banner

If `ooo-schedule.json` matches planning sprint name:
```
For each entry: "{name} (D6, D7, ...)"
```

### OOO schedule file format

```json
{
  "sprint": "Guest360 Sprint 9",
  "entries": [{ "name": "...", "oooDays": [6,7], "note": "PTO" }]
}
```

### Processing

1. `build_individual_delivery(active_issues, done_only=False)`
2. Merge `load_ooo_schedule(sprint_name)` by person name
3. `renderPlanningPeople()` — warning badges per OOO day

### Formulas

- **OOO day display:** sprint day number (1-based index within sprint), not calendar date
- **Row highlight:** `has-ooo` class when `oooDays.length > 0`

---

## 8. Risks & Blockers

### Data sources

| Source | Jira fields |
|--------|-------------|
| Planning sprint blockers | `fields.status.name = Blocked` |
| Future | `issuelinks` (blocks / is blocked by) |

### Risk row

| Field | Source |
|-------|--------|
| Description | `{key}: {summary}` |
| Owner | `assignee.displayName` |
| Severity | Mapped from `priority.name` |
| Resolution | Template escalation text |

### Severity mapping

| Jira priority | LEIA severity |
|---------------|---------------|
| Critical, Blocker | High |
| Minor, Trivial | Low |
| Major (default) | Medium |

### Processing

```
risks = issues in planning sprint WHERE status.name = Blocked
SORT BY severity (High first)
LIMIT 8
```

### Formulas

- **Blocked count (headline stat):** `COUNT(status = Blocked)` in planning sprint
- **High risk count:** `COUNT(severity = High)`

### Future

- Parse `issuelinks` for cross-project dependencies (BEEP, etc.)
- Merge unresolved retro-action items from prior snapshot
