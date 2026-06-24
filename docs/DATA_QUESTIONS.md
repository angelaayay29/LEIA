# LEIA Open Data Questions

Open questions the team is still grappling with while wiring LEIA to GST360 Jira (board 608, `disneyexperiences.atlassian.net`). These block fully accurate percentages, baselines, and executive insights.

---

## 1. CCN program total scope (program % denominator) — RESOLVED IN LEIA

**Current LEIA definition (implemented):**
```
program_% = done_tasks(program) / total_tasks(program) × 100

total_tasks(program) = count of parent GST360 issues
  where customfield_10020 (sprint) is not empty
  and program_from_issue(issue) = program

done_tasks(program) = same set where status is Done or Deploy
```

**Remaining questions:**
- Is task **count** the right unit vs story points for executive reporting?
- Should “total project” include issues **never sprinted** (backlog only)?
- Canonical program field vs epic-summary heuristic — see section 3.

---

## 2. Workstream ownership mapping

**Problem:** Workstreams are inferred from `parent.fields.summary` (text before the first `|`). Epic naming is inconsistent; some stories lack parents.

**Questions:**
- Is there a Jira **Component**, **Label**, or custom field that should be canonical for workstream (Identity, Guest Events, Analytics, etc.)?
- Who is the named owner per workstream for the progress bar subtitle (today shows "—")?
- How do we handle stories with no epic parent?

---

## 3. Program tag taxonomy (CCN R2 vs CCN R1 vs BEEP vs WoT)

**Problem:** Program is inferred from epic summary text and `labels[]` keyword search (`ccn`, `beep`, `wot`). Many tickets default to **CCN R2**.

**Questions:**
- Is there a standard Jira label or custom field for program (e.g. `program=CCN-R2`)?
- Should program roll up from **Epic** only, or can stories override?
- How do we distinguish CCN R1 vs R2 in Jira today?

---

## 4. Story points completeness (`customfield_10042`)

**Problem:** Null story points fall back to **1 point**, which can inflate velocity and commitment totals.

**Questions:**
- What is the team policy for tickets without points at sprint planning?
- Should LEIA exclude unpointed tickets from totals or flag them explicitly?
- Are subtasks ever pointed, or only parent stories?

---

## 5. Velocity baseline definition

**Problem:** Rolling average uses sum of `customfield_10042` on **Done** issues in **closed** sprints (last 5). Sprint 8 may still be active; historical data is incomplete.

**Questions:**
- Average of last **3** or **5** closed sprints — which does leadership expect?
- Include **Deploy** status as done (currently yes)?
- Should velocity be per-team, per-program, or whole board?
- How do we handle sprints with abnormally low/high delivery (outliers)?

---

## 6. Scope churn (mid-sprint adds/removes)

**Problem:** Headline stat shows "—" — requires **issue changelog** analysis (sprint field changes), not yet implemented.

**Questions:**
- What counts as churn — any add/remove, or only after sprint day 2?
- Do we track churn in story points or ticket count?
- Is there a Jira report or filter the SM already uses?

---

## 7. Team health / EOW survey

**Problem:** Happiness buckets and team health score are **placeholders** — not in Jira.

**Questions:**
- Where does EOW survey data live (Forms, Slack, separate tool)?
- Can we get a per-sprint export with respondent → score (respecting anonymity rules)?
- What is the official scale (1–10) and bucket thresholds?

---

## 8. OOO and capacity (`static/data/ooo-schedule.json`)

**Problem:** OOO is manually edited JSON today; Outlook integration is planned.

**Questions:**
- Which Outlook calendars / distribution lists represent Guest360 team OOO?
- Partial days vs full days — how should that reduce effective capacity (points or %)?
- Should OOO automatically reduce committed points on the plan, or only flag risk?

---

## 9. Cross-team dependencies and blockers

**Problem:** Risks use `status = Blocked` only; `issuelinks` (blocks / is blocked by) not yet parsed.

**Questions:**
- Is **Blocked** status used consistently, or do teams only use link types?
- Which external projects (BEEP, etc.) should LEIA query for dependencies?
- Who owns escalation when a blocker is outside GST360?

---

## 10. Retro themes and action items

**Problem:** "What went well" / "To improve" are template bullets; retro-action label usage is inconsistent.

**Questions:**
- Standard retro tool export format (Parabol, Miro, Confluence)?
- Is `retro-action` a real Jira label on GST360 today?
- Should carried action items auto-create Jira tickets?

---

## 11. Executive brief generation

**Problem:** Executive brief bullets are rule-based from Jira signals today, not yet a full LLM pass with human approval workflow.

**Questions:**
- Which asks require **Ryan** vs **Brian** vs capability lead routing?
- Should executives see only High-severity items, or full list?
- Where is the approval audit trail stored before publish?

---

## 12. Sprint mapping (retro vs planning)

**Problem:** Retro uses Sprint 8, Planning uses Sprint 9 — mapping must stay in sync with board 608 state.

**Questions:**
- When Sprint 8 closes, does retro auto-shift to closed sprint without manual config?
- Should LEIA read **active** vs **future** sprint from the board API instead of hardcoded names?

---

## 13. Day-1 snapshot for planned vs delivered

**Problem:** True "planned at sprint start" requires a **day-1 snapshot** of committed points; we compare to current sprint totals only.

**Questions:**
- Who locks the day-1 snapshot (SM at planning, or automated at sprint start)?
- Store in LEIA localStorage, JSON file, or Confluence?

---

## Next steps (recommended)

1. **CCN scope** workshop with program owners → define denominator source.
2. Agree **canonical Jira fields** for program, workstream, and retro-action.
3. Wire **changelog** for scope churn and **issuelinks** for dependencies.
4. Integrate **EOW** and **Outlook** or document manual refresh cadence.
5. Automate sprint selection from board 608 API.
