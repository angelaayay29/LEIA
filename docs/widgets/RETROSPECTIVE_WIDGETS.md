# LEIA Retrospective Widgets

Specifications for every widget on the **Retrospective** summary page.  
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

| Source | Jira / system fields |
|--------|----------------------|
| Jira GST360 board 608 | `customfield_10020` (Sprint): `name`, `startDate`, `endDate`, `state` |
| Jira GST360 | `fields.assignee.displayName` — unique assignees in retro sprint |
| Jira GST360 | `fields.parent.fields.summary`, `fields.labels[]` — program tags |
| Manual / config | Scrum Master name (`David`) from LEIA config |

### Statistics & formulas

| Display | Definition | How obtained |
|---------|------------|--------------|
| **Sprint name** | `{customfield_10020.name} — Retrospective Summary` | First sprint object on any issue in retro sprint query |
| **Date range** | `startDate – endDate` from sprint field | ISO dates trimmed to `YYYY-MM-DD` |
| **Participants** | Count of distinct assignees | `COUNT(DISTINCT assignee)` where assignee ≠ Unassigned on sprint issues |
| **Scrum Master** | Display name (first name shown) | Static config: David Vandenbelt |
| **Status pill** | Completed / In progress / Upcoming | `customfield_10020.state`: `closed` → Completed, `active` → In progress, `future` → Upcoming |
| **Program tags** | CCN R2, BEEP, WoT pills | Programs inferred from issues in sprint (see Program & Capability Progress) |

### Processing

1. JQL: `project = GST360 AND sprint = "{retro sprint name}"`
2. Read sprint metadata from `customfield_10020[0]` on first issue
3. Count unique `fields.assignee.displayName`
4. Derive program tag set from `program_from_issue()` across sprint issues

---

## 2. AI Insight

### Data sources

| Source | Fields / inputs |
|--------|-----------------|
| Jira GST360 | `customfield_10042`, `fields.status`, sprint name, board id |
| Retro Tool | Went well / to improve (manual; not in Jira today) |
| EOW Survey | Team health (not wired; placeholder) |
| LEIA `scripts/jira_to_leia.py` | Rule-based narrative template |

### Statistics referenced in narrative

| Phrase | Formula | Jira derivation |
|--------|---------|-----------------|
| Story points delivered | `SUM(customfield_10042)` where status Done or Deploy | Sum on completed issues in retro sprint |
| Completed ticket count | `COUNT(issues)` where Done/Deploy | Count completed parent stories |
| Planned total (if sprint active) | `SUM(customfield_10042)` on all sprint issues | All issues in sprint |
| Blocked count | `COUNT` where `fields.status.name = Blocked` | Blocked issues in sprint |

### Processing

1. Compute `done_pts`, `total_pts`, `done_count`, `blocked` from sprint issue set
2. Pass to `build_ai_insight_retro()` template
3. Scrum Master edits and approves before publish (editor mode)

---

## 3. Executive Brief

### Data sources

| Source | Fields / inputs |
|--------|-----------------|
| Jira GST360 | Delivery totals, blocked count from retro sprint |
| LEIA snapshot | Prior executive items (planned) |
| `scripts/jira_to_leia.py` | `build_executive_brief_retro()` rule engine |

### Checklist sections

| Section | Logic |
|---------|-------|
| **Review these** | Confirms sprint delivery ratio; program % methodology; individual delivery scan; delivery gap if `done_pts < total_pts` |
| **How you can help** | Escalate blocked tickets; align on deprioritized scope; or “no escalations” default |

### Formulas

| Input | Formula |
|-------|---------|
| Delivery gap | `total_pts - done_pts` (story points) |
| Blocked escalations | `COUNT(status = Blocked)` in retro sprint |

### Output shape

```json
{
  "needs": [{ "text": "...", "checked": false }],
  "howToHelp": [{ "text": "...", "checked": false }]
}
```

Check state persists in browser localStorage when toggled (all roles). Text editable by editors only.

---

## 4. Four Headline Stats

### Data sources

| Stat | Jira fields | Other |
|------|-------------|-------|
| Points delivered | `customfield_10042`, `fields.status` | — |
| Delivered / Planned | Same | — |
| Team health | — | EOW Survey (placeholder `—`) |
| Scope changes | `changelog` (not wired) | Placeholder `—` |

### Statistics & formulas

#### Points delivered
- **Formula:** `SUM(customfield_10042)` for issues where `status.name IN (Done, Deploy)` OR `statusCategory.key = done`
- **Fallback:** null points → `1`
- **Delta pill:** `{done_count} stories done`
- **Color:** green if `done_pts >= total_pts`, else red

#### Delivered / Planned
- **Formula:** `{done_pts} / {total_pts}`
- **Numerator:** sum points on Done/Deploy issues
- **Denominator:** sum points on all issues in retro sprint
- **Sub-note:** “Above plan” if `done_pts >= total_pts`, else “Below plan”
- **Color:** green / red same as above

#### Team health
- **Formula:** `AVG(EOW score 1–10)` — **not implemented**
- Display: `—` with note “EOW survey not in Jira”

#### Scope changes
- **Formula:** `COUNT(sprint adds) - COUNT(sprint removes)` from issue changelog — **not implemented**
- Display: `—` with note “Requires changelog export”

### Processing

1. Filter retro sprint issues from snapshot
2. Apply `is_done()` and `points()` helpers per issue
3. Build four `headlineStats` objects in `build_retro()`

---

## 5. Program & Capability Progress

### Data sources

| Source | Jira fields |
|--------|-------------|
| All GST360 sprint-attributed issues | `project = GST360`, `customfield_10020` not empty |
| Program attribution | `fields.parent.fields.summary`, `fields.labels[]`, `fields.summary` |
| Workstream attribution | `fields.parent.fields.summary` (segment before `\|`) |
| Completion | `fields.status.name`, `fields.status.statusCategory.key` |
| Issue filter | `fields.issuetype.subtask = false` |

### Program progress formula

**Total project (per program):**
```
total_tasks(program) = COUNT(parent issues in GST360
  WHERE customfield_10020 is not empty
  AND program_from_issue(issue) = program)
```

**Done tasks (per program):**
```
done_tasks(program) = COUNT(same set WHERE is_done(issue) = true)
```

**Percentage:**
```
program_% = ROUND(100 × done_tasks / total_tasks)
```

**Display:**
- **%** — progress bar width
- **Delta line** — `{done} of {total} tasks done`
- **Remaining** — `{total - done} tasks remaining`
- **Status** — On track if `% >= 40`, else At risk

#### Program inference (`program_from_issue`)
1. Concatenate `parent.summary + issue.summary + labels` (uppercase)
2. If contains `BEEP` → BEEP
3. Else if `WOT` or `WAY OF TRAVEL` → WoT
4. Else if `CCN` in text or labels → CCN R2
5. Default → CCN R2

### Workstream progress formula

Same task-count logic grouped by `workstream_from_issue()`:
- Workstream = text before first `|` on epic `parent.fields.summary`, else heuristics on summary

### Processing

1. Merge all issues from retro sprint, planning sprint, and velocity/history fetches (`merge_issues`)
2. Filter to parent stories with sprint field populated
3. Group by program and workstream; compute done/total counts
4. Cap workstream list at 8 rows by total task volume

### Limitations

- Jira API fetch capped at 100 issues per query; full GST360 backlog may require pagination for exact totals
- Program tag inference is heuristic until canonical Jira labels exist

---

## 6. Sprint Delivery Detail

### Data sources

| Section | Source | Jira fields |
|---------|--------|-------------|
| Completed work table | Jira GST360 retro sprint | `summary`, `key`, `customfield_10042`, `parent`, `status`, `issuetype` |
| What went well | Retro ceremony | Manual / template |
| Areas to improve | Retro ceremony | Manual / template |
| Action items | Jira + template | `labels[]` retro-action (planned), assignee |

### Completed work table

| Column | Formula / source |
|--------|------------------|
| Workstream | `workstream_from_issue(issue)` |
| Story | `fields.summary` |
| Program | `program_from_issue(issue)` |
| Points | `customfield_10042` (default 1) |
| Status | Done pill — issue passed `is_done()` filter |

**Row filter:**
```
issuetype.subtask = false
AND is_done(issue) = true
AND issue in retro sprint
```

**Grouping:** rows sorted under workstream group headers

### Retro themes

| List | Source | Processing |
|------|--------|------------|
| What went well | Template + sprint stats | Generated bullets; editable by SM |
| Areas to improve | Template + blocked flag | `recurring: true` if blockers present |

### Action items

| Column | Source |
|--------|--------|
| Description | Template or Jira `summary` |
| Owner | `assignee.displayName` or SM first name |
| Due sprint | `S{sprintNumber + 1}` |
| Status | New / In Progress / Carried |

### Processing

1. `build_completed_work()` — filter Done parent issues, map fields
2. Theme lists from `build_retro()` templates
3. Action items from template until retro-action label is standardized

---

## 7. People & Team Health

### Data sources

| Section | Jira fields | Other |
|---------|-------------|-------|
| Individual delivery | `assignee.displayName`, `customfield_10042`, `status`, `components`, `parent` | — |
| Team happiness | — | EOW Survey (placeholder) |
| Happiness trend | — | LEIA history (placeholder) |

### Individual delivery

| Column | Formula |
|--------|---------|
| **Assigned points** | `SUM(customfield_10042)` per assignee on all retro sprint issues |
| **Completed points** | `SUM(customfield_10042)` per assignee where `is_done(issue)` |
| **Progress bar** | `MIN(100, 100 × completed / assigned)` — width and color by status |
| **Points display** | `{completed} → {assigned}` |
| **Status** | Full delivery if `completed >= assigned` and assigned > 0; Partial if completed > 0 but less; +Unplanned if completed > assigned |
| **Role** | `Eng` if component Eng; `DPE` if DPE; `Both` if both |
| **Workstream** | Primary `workstream_from_issue()` from person's issues |

**Exclusions:** `assignee = Unassigned`

### Team happiness index

| Bucket | Formula | Status |
|--------|---------|--------|
| Thriving / Happy / Neutral / Stressed / Burned Out | EOW score thresholds | Not wired — all zeros |

### Happiness trend sparkline

- **Formula:** avg EOW score per prior sprint (5 points)
- **Status:** placeholder `[0,0,0,0,0]`

### Processing

1. `build_individual_delivery(closed_issues, done_only=True)`
2. Group table rows by Eng vs DPE component
3. Happiness widgets render structure only until EOW integrated

---

## 8. Risks & Follow-up

### Data sources

| Source | Jira fields |
|--------|-------------|
| Action items | `labels[]` (retro-action), `summary`, `assignee`, sprint |
| Carried detection | LEIA prior snapshot (planned) |

### Statistics

| Display | Definition |
|---------|------------|
| Carried count | Action items with `status = Carried` |
| Action row | description, owner, due sprint, status chip |

### Status values

| Status | Meaning |
|--------|---------|
| New | Created this retro |
| In Progress | Owner working |
| Carried | Open from prior sprint (when snapshot compare wired) |

### Processing

1. `build_retro()` seeds template action items
2. UI sorts Carried items to top in `renderRetroRisks()`
3. Future: JQL `project = GST360 AND labels = retro-action AND status != Done`

### Formulas

- **Carried forward count:** `COUNT(actionItems WHERE status = 'Carried')`
