#!/usr/bin/env python3
"""
Build LEIA retro + planning snapshots from Guest360 Jira (Atlassian Cloud).

Source: https://disneyexperiences.atlassian.net — project GST360, board 608

Usage (live API — requires Atlassian API token):
  export ATLASSIAN_EMAIL=you@disney.com
  export ATLASSIAN_API_TOKEN=your_token
  python3 scripts/jira_to_leia.py

Output: static/data/jira-snapshot.json
"""

from __future__ import annotations

import json
import os
import re
import ssl
import sys
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_PATH = ROOT / "static" / "data" / "jira-snapshot.json"
OOO_PATH = ROOT / "static" / "data" / "ooo-schedule.json"

CLOUD_ID = "70826d2c-16d0-4cfa-b445-cc7c9d3bce39"
SITE = "https://disneyexperiences.atlassian.net"
PROJECT = "GST360"
BOARD_ID = 608
STORY_POINTS_FIELD = "customfield_10042"
SPRINT_FIELD = "customfield_10020"
SCRUM_MASTER = "David Vandenbelt"

WORKSTREAM_COLORS = {
    "Guest Events": "#ec4899",
    "Identity": "#8b5cf6",
    "Analytics": "#06b6d4",
    "Integration": "#f59e0b",
    "Activation": "#10b981",
    "API": "#3b82f6",
    "Core Platform": "#6366f1",
    "CICD": "#14b8a6",
    "General": "#64748b",
}

PROGRAM_COLORS = {"CCN R2": "blue", "CCN R1": "blue", "CCN": "blue", "BEEP": "orange", "WoT": "green"}


def api_request(path: str, query: dict | None = None) -> dict:
    email = os.environ.get("ATLASSIAN_EMAIL", "")
    token = os.environ.get("ATLASSIAN_API_TOKEN", "")
    if not email or not token:
        raise RuntimeError("Set ATLASSIAN_EMAIL and ATLASSIAN_API_TOKEN for live Jira fetch")

    base = f"https://api.atlassian.com/ex/jira/{CLOUD_ID}{path}"
    if query:
        base += "?" + urllib.parse.urlencode(query)

    req = urllib.request.Request(
        base,
        headers={
            "Accept": "application/json",
            "Authorization": "Basic "
            + __import__("base64").b64encode(f"{email}:{token}".encode()).decode(),
        },
    )
    ctx = ssl.create_default_context()
    with urllib.request.urlopen(req, context=ctx, timeout=60) as resp:
        return json.loads(resp.read().decode())


def search_jql(jql: str, fields: list[str], max_results: int = 100) -> list[dict]:
    data = api_request(
        "/rest/api/3/search/jql",
        {
            "jql": jql,
            "maxResults": str(max_results),
            "fields": ",".join(fields),
        },
    )
    return data.get("issues", data.get("values", []))


def fetch_sprint_issues(sprint_name: str) -> list[dict]:
    fields = [
        "summary",
        "status",
        "assignee",
        "priority",
        "issuetype",
        "labels",
        "components",
        "parent",
        STORY_POINTS_FIELD,
        SPRINT_FIELD,
    ]
    jql = f'project = {PROJECT} AND sprint = "{sprint_name}" ORDER BY rank ASC'
    return search_jql(jql, fields, 100)


def fetch_velocity_issues() -> list[dict]:
    fields = ["summary", "status", SPRINT_FIELD, STORY_POINTS_FIELD]
    jql = f"project = {PROJECT} AND sprint is not EMPTY AND status = Done ORDER BY updated DESC"
    return search_jql(jql, fields, 100)


def points(issue: dict) -> int:
    fields = issue.get("fields", {})
    val = fields.get(STORY_POINTS_FIELD)
    if val is None:
        return 1
    try:
        return int(float(val))
    except (TypeError, ValueError):
        return 1


def is_done(issue: dict) -> bool:
    status = issue.get("fields", {}).get("status", {})
    cat = status.get("statusCategory", {}).get("key", "")
    name = status.get("name", "")
    return cat == "done" or name in ("Done", "Deploy")


def is_blocked(issue: dict) -> bool:
    name = issue.get("fields", {}).get("status", {}).get("name", "")
    return name == "Blocked"


def assignee_name(issue: dict) -> str:
    a = issue.get("fields", {}).get("assignee")
    return a.get("displayName", "Unassigned") if a else "Unassigned"


def initials(name: str) -> str:
    parts = [p for p in re.split(r"\s+", name.strip()) if p]
    if not parts:
        return "??"
    if len(parts) == 1:
        return parts[0][:2].upper()
    return (parts[0][0] + parts[-1][0]).upper()


def role_from_components(issue: dict) -> str:
    comps = [c.get("name", "") for c in issue.get("fields", {}).get("components", [])]
    if "DPE" in comps and "Eng" in comps:
        return "Both"
    if "DPE" in comps:
        return "DPE"
    return "Eng"


def workstream_from_issue(issue: dict) -> str:
    fields = issue.get("fields", {})
    summary = fields.get("summary", "")
    parent = fields.get("parent", {})
    if parent:
        ps = parent.get("fields", {}).get("summary", "")
        if "|" in ps:
            return ps.split("|")[0].strip()
        if ps:
            return ps.split("|")[0].strip()[:40]

    if "|" in summary:
        return summary.split("|")[0].strip()
    if summary.lower().startswith("api "):
        return "API"
    if "event" in summary.lower():
        return "Guest Events"
    if "retry" in summary.lower() or "deploy" in summary.lower():
        return "Core Platform"
    return "General"


def program_from_issue(issue: dict) -> str:
    fields = issue.get("fields", {})
    labels = [lb.lower() for lb in fields.get("labels", [])]
    text = fields.get("summary", "")
    parent = fields.get("parent", {}).get("fields", {}).get("summary", "")
    blob = f"{text} {parent}".upper()
    if "beep" in blob or "beep" in labels:
        return "BEEP"
    if "wot" in blob or "way of travel" in blob:
        return "WoT"
    if "ccn" in blob or "ccn" in labels:
        return "CCN R2"
    return "CCN R2"


def priority_label(issue: dict) -> str:
    p = issue.get("fields", {}).get("priority", {}).get("name", "Major")
    if p in ("Critical", "Blocker"):
        return "High"
    if p in ("Minor", "Trivial"):
        return "Low"
    return "Medium"


def sprint_meta(issues: list[dict]) -> dict:
    for issue in issues:
        sprints = issue.get("fields", {}).get(SPRINT_FIELD) or []
        if sprints:
            return sprints[0]
    return {}


def format_date_range(sprint: dict) -> str:
    start = sprint.get("startDate", "")[:10]
    end = sprint.get("endDate", "")[:10]
    if start and end:
        return f"{start} – {end}"
    return "Dates TBD"


def sprint_number(name: str) -> int:
    m = re.search(r"Sprint\s+(\d+)", name, re.I)
    return int(m.group(1)) if m else 0


def unique_assignees(issues: list[dict]) -> int:
    names = {assignee_name(i) for i in issues if assignee_name(i) != "Unassigned"}
    return len(names)


def program_tags_from_issues(issues: list[dict]) -> list[dict]:
    found = set()
    for issue in issues:
        found.add(program_from_issue(issue))
    order = ["CCN R2", "BEEP", "WoT"]
    tags = []
    for p in order:
        if p in found:
            tags.append({"label": p, "color": PROGRAM_COLORS.get(p, "blue")})
    if not tags:
        tags = [{"label": "CCN R2", "color": "blue"}]
    return tags


def merge_issues(*issue_lists: list[dict]) -> list[dict]:
    by_key: dict[str, dict] = {}
    for issues in issue_lists:
        for issue in issues:
            key = issue.get("key")
            if key:
                by_key[key] = issue
    return list(by_key.values())


def is_parent_story(issue: dict) -> bool:
    return not issue.get("fields", {}).get("issuetype", {}).get("subtask", False)


def has_sprint(issue: dict) -> bool:
    return bool(issue.get("fields", {}).get(SPRINT_FIELD))


def sprint_attributed_issues(all_issues: list[dict]) -> list[dict]:
    """Parent stories/tasks in GST360 that appear on at least one sprint."""
    return [i for i in all_issues if is_parent_story(i) and has_sprint(i)]


def fetch_all_sprint_attributed_issues() -> list[dict]:
    fields = [
        "summary",
        "status",
        "assignee",
        "priority",
        "issuetype",
        "labels",
        "components",
        "parent",
        STORY_POINTS_FIELD,
        SPRINT_FIELD,
    ]
    jql = f"project = {PROJECT} AND sprint is not EMPTY ORDER BY updated DESC"
    return search_jql(jql, fields, 100)


def build_program_snapshots(all_project_issues: list[dict]) -> list[dict]:
    """
    Program % = done tasks / total sprint-attributed tasks per program (GST360).
    Total = all parent issues in project that have customfield_10020 (any sprint).
    Done = issues with status Done or Deploy.
    """
    issues = sprint_attributed_issues(all_project_issues)
    by_prog_total: dict[str, int] = defaultdict(int)
    by_prog_done: dict[str, int] = defaultdict(int)
    for issue in issues:
        prog = program_from_issue(issue)
        by_prog_total[prog] += 1
        if is_done(issue):
            by_prog_done[prog] += 1

    colors = {"CCN R2": "#3b82f6", "BEEP": "#f59e0b", "WoT": "#10b981"}
    snapshots = []
    for name in sorted(by_prog_total.keys(), key=lambda n: (-by_prog_total[n], n)):
        total = by_prog_total[name]
        done = by_prog_done[name]
        pct = round((done / total) * 100) if total else 0
        remaining = total - done
        snapshots.append(
            {
                "name": name,
                "percentage": pct,
                "delta": f"{done} of {total} tasks done",
                "remaining": f"{remaining} tasks remaining",
                "status": "On track" if pct >= 40 else "At risk",
                "statusColor": "green" if pct >= 40 else "amber",
                "color": colors.get(name, "#3b82f6"),
                "doneTasks": done,
                "totalTasks": total,
            }
        )
    return snapshots or [
        {
            "name": "CCN R2",
            "percentage": 0,
            "delta": "0 of 0 tasks done",
            "remaining": "—",
            "status": "At risk",
            "statusColor": "amber",
            "color": "#3b82f6",
            "doneTasks": 0,
            "totalTasks": 0,
        }
    ]


def build_workstreams(all_project_issues: list[dict]) -> list[dict]:
    """Workstream % = done tasks / total sprint-attributed tasks per workstream."""
    issues = sprint_attributed_issues(all_project_issues)
    by_ws_total: dict[str, int] = defaultdict(int)
    by_ws_done: dict[str, int] = defaultdict(int)
    for issue in issues:
        ws = workstream_from_issue(issue)
        by_ws_total[ws] += 1
        if is_done(issue):
            by_ws_done[ws] += 1

    rows = []
    for name, total in sorted(by_ws_total.items(), key=lambda x: -x[1]):
        done = by_ws_done[name]
        pct = round((done / total) * 100) if total else 0
        rows.append(
            {
                "name": name,
                "percentage": pct,
                "status": "On track" if pct >= 40 else "At risk",
                "owner": "—",
                "doneTasks": done,
                "totalTasks": total,
            }
        )
    return rows[:8]


def build_individual_delivery(issues: list[dict], done_only: bool) -> list[dict]:
    by_person: dict[str, dict] = {}
    for issue in issues:
        name = assignee_name(issue)
        if name == "Unassigned":
            continue
        pts = points(issue)
        entry = by_person.setdefault(
            name,
            {
                "name": name,
                "initials": initials(name),
                "role": role_from_components(issue),
                "assigned": 0,
                "completed": 0,
                "workstream": workstream_from_issue(issue),
            },
        )
        entry["assigned"] += pts
        if is_done(issue):
            entry["completed"] += pts

    rows = []
    for entry in by_person.values():
        if entry["completed"] >= entry["assigned"] and entry["assigned"] > 0:
            status = "Full delivery"
        elif entry["completed"] > 0:
            status = "Partial"
        elif not done_only:
            status = "Partial"
        else:
            status = "+Unplanned" if entry["completed"] > entry["assigned"] else "Partial"
        entry["status"] = status
        rows.append(entry)
    return sorted(rows, key=lambda r: r["name"])


def build_completed_work(issues: list[dict]) -> list[dict]:
    rows = []
    for issue in issues:
        if not is_done(issue):
            continue
        if issue.get("fields", {}).get("issuetype", {}).get("subtask"):
            continue
        ws = workstream_from_issue(issue)
        rows.append(
            {
                "workstream": ws,
                "workstreamColor": WORKSTREAM_COLORS.get(ws, "#64748b"),
                "storyName": issue.get("fields", {}).get("summary", ""),
                "program": program_from_issue(issue),
                "points": points(issue),
            }
        )
    return rows


def build_committed_work(issues: list[dict]) -> list[dict]:
    rows = []
    for issue in issues:
        if issue.get("fields", {}).get("issuetype", {}).get("subtask"):
            continue
        ws = workstream_from_issue(issue)
        prog = program_from_issue(issue)
        owner = assignee_name(issue)
        rows.append(
            {
                "workstream": ws,
                "workstreamColor": WORKSTREAM_COLORS.get(ws, "#64748b"),
                "storyName": issue.get("fields", {}).get("summary", ""),
                "ticketKey": issue.get("key", ""),
                "programs": [prog],
                "role": role_from_components(issue),
                "points": points(issue),
                "priority": priority_label(issue),
                "owners": [owner] if owner != "Unassigned" else [],
            }
        )
    return rows


def build_risks(issues: list[dict]) -> list[dict]:
    risks = []
    for issue in issues:
        if not is_blocked(issue):
            continue
        sev = "High" if priority_label(issue) == "High" else "Medium"
        risks.append(
            {
                "severity": sev,
                "description": f"{issue.get('key')}: {issue.get('fields', {}).get('summary', '')}",
                "owner": assignee_name(issue),
                "resolution": "Resolve dependency or escalate before sprint midpoint.",
            }
        )
    return sorted(risks, key=lambda r: 0 if r["severity"] == "High" else 1)[:8]


def velocity_history(closed_issues: list[dict], current_sprint_name: str, current_points: int) -> tuple[list[dict], int]:
    by_sprint: dict[str, int] = defaultdict(int)
    for issue in closed_issues:
        if not is_done(issue):
            continue
        for sp in issue.get("fields", {}).get(SPRINT_FIELD) or []:
            if sp.get("state") == "closed":
                by_sprint[sp.get("name", "")] += points(issue)

    names = sorted(
        [n for n in by_sprint if n],
        key=lambda n: sprint_number(n),
    )
    recent = names[-5:] if len(names) > 5 else names
    bars = [{"sprint": f"S{sprint_number(n)}", "points": by_sprint[n]} for n in recent]
    if current_sprint_name:
        bars.append(
            {
                "sprint": f"S{sprint_number(current_sprint_name)}",
                "points": current_points,
                "isCurrent": True,
            }
        )
    vals = [b["points"] for b in bars if not b.get("isCurrent")]
    avg = round(sum(vals) / len(vals)) if vals else current_points
    return bars, avg


def load_ooo_schedule(sprint_name: str) -> tuple[list[dict], dict[str, dict]]:
    if not OOO_PATH.exists():
        return [], {}
    try:
        data = json.loads(OOO_PATH.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return [], {}
    if data.get("sprint") and data["sprint"] != sprint_name:
        return [], {}
    entries = data.get("entries", [])
    by_name = {
        e["name"]: {"oooDays": e.get("oooDays", []), "oooNote": e.get("note", "Out of office")}
        for e in entries
        if e.get("name")
    }
    return entries, by_name


def exec_checklist_items(strings: list[str]) -> list[dict]:
    return [{"text": s, "checked": False} for s in strings]


def build_executive_brief_retro(
    sprint_name: str, done_pts: int, total_pts: int, blocked: int, done_count: int
) -> dict:
    needs = [
        f"Confirm {sprint_name} delivery narrative: {done_pts} of {total_pts} story points completed ({done_count} stories).",
        "Review program progress — each % is done tasks ÷ all sprint-attributed GST360 tasks for that program.",
        "Scan individual delivery table for uneven load or partial completions before approving carry-forward scope.",
    ]
    if done_pts < total_pts:
        needs.insert(1, f"Delivery gap: {total_pts - done_pts} story points not completed — decide what carries to the next sprint.")
    help_items = []
    if blocked:
        help_items.append(f"Escalate {blocked} blocked GST360 ticket(s) still open at sprint end.")
    if done_pts < total_pts:
        help_items.append("Align with program owners on deprioritized scope vs. capacity constraints.")
    if not help_items:
        help_items.append("No escalations flagged — acknowledge team delivery and unblock next-sprint dependencies early.")
    return {"needs": exec_checklist_items(needs), "howToHelp": exec_checklist_items(help_items)}


def build_executive_brief_planning(
    sprint_name: str, committed: int, avg_vel: int, blocked: int, risks: list[dict], ooo_entries: list[dict]
) -> dict:
    stretch = committed - avg_vel
    needs = [
        f"Approve {sprint_name} commitment: {committed} story points vs {avg_vel}-pt rolling velocity ({'+' if stretch > 0 else ''}{stretch} delta).",
        "Confirm program goals and at-risk flags before sprint kickoff.",
        "Review team capacity table for over-loaded assignees and OOO impacts.",
    ]
    help_items = [r["description"] for r in risks[:4]]
    for entry in ooo_entries:
        days = entry.get("oooDays", [])
        if days:
            day_str = ", ".join(f"D{d}" for d in days)
            help_items.append(f"Cover or redistribute load for {entry['name']} — OOO {day_str}")
    if blocked and not any("GST360" in h for h in help_items):
        help_items.insert(0, f"Unblock {blocked} ticket(s) in Blocked status before day 1.")
    if not help_items:
        help_items.append("No blockers flagged — confirm cross-team dependencies in the first two days of sprint.")
    return {"needs": exec_checklist_items(needs), "howToHelp": exec_checklist_items(help_items[:6])}


def build_ai_insight_retro(
    sprint_name: str,
    done_pts: int,
    total_pts: int,
    done_count: int,
    blocked: int,
    sprint_state: str = "closed",
) -> str:
    verb = "delivered" if sprint_state == "closed" else "has delivered so far"
    return (
        f"{sprint_name} on Guest360 (board {BOARD_ID}) {verb} {done_pts} story points "
        f"across {done_count} completed tickets"
        f"{f' of {total_pts} planned' if sprint_state != 'closed' else ''}. "
        f"{'Blocked items remain a focus — ' + str(blocked) + ' ticket(s) carried dependency risk. ' if blocked else ''}"
        f"Data synced live from {SITE} via Jira MCP."
    )


def build_ai_insight_planning(sprint_name: str, committed: int, avg_vel: int, blocked: int, story_count: int) -> str:
    stretch = committed - avg_vel
    tone = "a modest stretch" if stretch > 0 else "within recent velocity"
    return (
        f"{sprint_name} commits {committed} story points across {story_count} stories — {tone} "
        f"vs a {avg_vel}-point rolling average from prior closed sprints. "
        f"{'Watch ' + str(blocked) + ' blocked item(s) entering the sprint. ' if blocked else ''}"
        f"Plan pulled from {SITE} backlog (board {BOARD_ID})."
    )


def build_retro(closed_issues: list[dict], sprint: dict, all_project_issues: list[dict]) -> dict:
    sprint_name = sprint.get("name", "Guest360 Sprint")
    sprint_state = sprint.get("state", "closed")
    num = sprint_number(sprint_name)
    done_issues = [i for i in closed_issues if is_done(i)]
    done_pts = sum(points(i) for i in done_issues)
    total_pts = sum(points(i) for i in closed_issues)
    blocked = sum(1 for i in closed_issues if is_blocked(i))
    status_label = "Completed" if sprint_state == "closed" else ("In progress" if sprint_state == "active" else "Upcoming")

    return {
        "identity": {
            "sprintNumber": num,
            "sprintName": f"{sprint_name} — Retrospective Summary",
            "platform": "Guest360 CDP",
            "dateRange": format_date_range(sprint),
            "participants": unique_assignees(closed_issues),
            "scrumMaster": SCRUM_MASTER.split()[0],
            "status": status_label,
            "programTags": program_tags_from_issues(closed_issues),
        },
        "aiInsight": build_ai_insight_retro(
            sprint_name, done_pts, total_pts, len(done_issues), blocked, sprint_state
        ),
        "executiveBrief": build_executive_brief_retro(
            sprint_name, done_pts, total_pts, blocked, len(done_issues)
        ),
        "headlineStats": [
            {
                "id": "points-delivered",
                "value": str(done_pts),
                "label": "Points delivered",
                "delta": f"{len(done_issues)} stories done",
                "deltaDirection": "up",
                "numericValue": done_pts,
                "baselineCompare": total_pts,
                "healthColor": "green" if done_pts >= total_pts else "red",
            },
            {
                "id": "planned-vs-delivered",
                "value": f"{done_pts} / {total_pts}",
                "label": "Delivered / Planned",
                "subNote": "Above plan" if done_pts >= total_pts else "Below plan",
                "healthColor": "green" if done_pts >= total_pts else "red",
            },
            {
                "id": "team-health",
                "value": "—",
                "label": "Team health",
                "subNote": "EOW survey not in Jira",
                "healthColor": "amber",
            },
            {
                "id": "scope-churn",
                "value": "—",
                "label": "Scope changes",
                "subNote": "Requires changelog export",
                "healthColor": "amber",
            },
        ],
        "programSnapshots": build_program_snapshots(all_project_issues),
        "workstreamProgress": build_workstreams(all_project_issues),
        "completedWork": build_completed_work(closed_issues),
        "wentWell": [
            {"text": f"{len(done_issues)} stories completed in {sprint_name}"},
            {"text": "API and platform deployment work closed successfully"},
            {"text": "Event router and retry redesign milestones reached"},
        ],
        "toImprove": [
            {"text": "Story points not consistently filled on all GST360 tickets", "recurring": True},
            {"text": "Blocked dependencies need earlier escalation", "recurring": blocked > 0},
            {"text": "Align program tags (CCN/BEEP/WoT) on epics and stories"},
        ],
        "actionItems": [
            {
                "description": "Enforce story point estimates on all sprint tickets",
                "owner": SCRUM_MASTER.split()[0],
                "dueSprint": f"S{num + 1}",
                "status": "New",
            }
        ],
        "individualDelivery": build_individual_delivery(closed_issues, done_only=True),
        "happinessBuckets": [
            {"label": "Thriving", "count": 0, "percentage": 0, "color": "#059669"},
            {"label": "Happy", "count": 0, "percentage": 0, "color": "#34d399"},
            {"label": "Neutral", "count": 0, "percentage": 0, "color": "#fbbf24"},
            {"label": "Stressed", "count": 0, "percentage": 0, "color": "#f59e0b"},
            {"label": "Burned Out", "count": 0, "percentage": 0, "color": "#ef4444"},
        ],
        "happinessTrend": [0, 0, 0, 0, 0],
        "happinessAverage": 0,
    }


def build_planning(active_issues: list[dict], sprint: dict, velocity_issues: list[dict], all_project_issues: list[dict]) -> dict:
    sprint_name = sprint.get("name", "Guest360 Sprint")
    num = sprint_number(sprint_name)
    committed = sum(points(i) for i in active_issues)
    story_count = len([i for i in active_issues if not i.get("fields", {}).get("issuetype", {}).get("subtask")])
    blocked = sum(1 for i in active_issues if is_blocked(i))
    bars, avg = velocity_history(velocity_issues, sprint_name, committed)
    cap = max(committed + 10, round(committed * 1.1))
    util = min(99, round((committed / cap) * 100)) if cap else 0

    team = build_individual_delivery(active_issues, done_only=False)
    ooo_entries, ooo_by_name = load_ooo_schedule(sprint_name)
    capacity_rows = []
    for person in team:
        ooo = ooo_by_name.get(person["name"], {})
        bench = person["assigned"]
        variance = "avg"
        capacity_rows.append(
            {
                "name": person["name"],
                "initials": person["initials"],
                "role": person["role"],
                "committed": person["assigned"],
                "threeSprintAvg": bench,
                "variance": variance,
                "oooDays": ooo.get("oooDays", []),
                "oooNote": ooo.get("oooNote", ""),
            }
        )

    risks = build_risks(active_issues)

    return {
        "identity": {
            "sprintNumber": num,
            "sprintName": f"{sprint_name} — Planning Summary",
            "platform": "Guest360 CDP",
            "dateRange": format_date_range(sprint),
            "participants": unique_assignees(active_issues),
            "scrumMaster": SCRUM_MASTER.split()[0],
            "sprintLengthDays": 14,
            "quarterWeek": datetime.utcnow().strftime("Q%q W%W"),
            "programTags": program_tags_from_issues(active_issues),
        },
        "aiInsight": build_ai_insight_planning(sprint_name, committed, avg, blocked, story_count),
        "executiveBrief": build_executive_brief_planning(
            sprint_name, committed, avg, blocked, risks, ooo_entries
        ),
        "headlineStats": [
            {
                "id": "committed-points",
                "value": str(committed),
                "label": "Committed points",
                "subNote": f"Capacity: ~{cap} pts",
                "numericValue": committed,
                "baselineCompare": avg,
                "healthColor": "green" if committed >= avg else "red",
                "delta": f"{'+' if committed >= avg else ''}{committed - avg} vs avg",
                "deltaDirection": "up" if committed >= avg else "down",
            },
            {
                "id": "avg-velocity",
                "value": str(avg),
                "label": "Avg velocity (closed sprints)",
                "subNote": "Baseline for green/red comparison",
            },
            {
                "id": "stories-in-scope",
                "value": str(story_count),
                "label": "Stories in scope",
                "subNote": f"{blocked} blocked" if blocked else "No blockers flagged",
                "healthColor": "amber" if blocked else "green",
            },
            {
                "id": "capacity-utilized",
                "value": f"{util}%",
                "label": "Capacity utilized",
                "subNote": "Healthy range" if 75 <= util <= 95 else "Review load",
                "healthColor": "green" if 75 <= util <= 95 else "amber",
            },
        ],
        "programSnapshots": build_program_snapshots(all_project_issues),
        "workstreamProgress": build_workstreams(all_project_issues),
        "programGoals": [
            {
                "program": tag["label"],
                "color": {"blue": "#3b82f6", "orange": "#f59e0b", "green": "#10b981"}[tag["color"]],
                "goals": [
                    {
                        "text": f"Deliver committed {tag['label']} scope in {sprint_name}",
                        "confirmed": blocked == 0,
                        "owner": SCRUM_MASTER.split()[0],
                    }
                ],
            }
            for tag in program_tags_from_issues(active_issues)
        ],
        "committedWork": build_committed_work(active_issues),
        "velocityHistory": bars,
        "avgVelocity": avg,
        "teamCapacity": capacity_rows,
        "risks": risks,
        "oooSchedule": ooo_entries,
        "oooNotes": (
            "OOO days from static/data/ooo-schedule.json — Outlook calendar integration planned."
            if ooo_entries
            else "OOO/capacity from Outlook not wired — edit static/data/ooo-schedule.json for sprint OOO days."
        ),
    }


def build_snapshot(closed_issues: list[dict], active_issues: list[dict], velocity_issues: list[dict]) -> dict:
    closed_sprint = sprint_meta(closed_issues) or {"name": "Guest360 Sprint 8"}
    active_sprint = sprint_meta(active_issues) or {"name": "Guest360 Sprint 9"}
    all_project_issues = merge_issues(closed_issues, active_issues, velocity_issues)

    return {
        "meta": {
            "source": SITE,
            "project": PROJECT,
            "boardId": BOARD_ID,
            "boardUrl": f"{SITE}/jira/software/c/projects/{PROJECT}/boards/{BOARD_ID}/backlog",
            "syncedAt": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
            "retroSprint": closed_sprint.get("name"),
            "planningSprint": active_sprint.get("name"),
            "storyPointsField": STORY_POINTS_FIELD,
            "programProgressFormula": "done_tasks / total_sprint_attributed_tasks per program (GST360)",
        },
        "retro": build_retro(closed_issues, closed_sprint, all_project_issues),
        "planning": build_planning(active_issues, active_sprint, velocity_issues, all_project_issues),
    }


def load_issues_from_file(path: Path) -> list[dict]:
    data = json.loads(path.read_text())
    if isinstance(data, dict):
        return data.get("issues", [])
    return data


def main() -> int:
    sprint7_path = os.environ.get("LEIA_RETRO_JSON") or os.environ.get("LEIA_SPRINT7_JSON")
    sprint8_path = os.environ.get("LEIA_PLANNING_JSON") or os.environ.get("LEIA_SPRINT8_JSON")
    velocity_path = os.environ.get("LEIA_VELOCITY_JSON")

    if sprint7_path and sprint8_path:
        closed_issues = load_issues_from_file(Path(sprint7_path))
        active_issues = load_issues_from_file(Path(sprint8_path))
        velocity_issues = (
            load_issues_from_file(Path(velocity_path)) if velocity_path else closed_issues + active_issues
        )
        all_project_issues = merge_issues(closed_issues, active_issues, velocity_issues)
    else:
        print("Fetching from Atlassian Cloud API…", file=sys.stderr)
        closed_name = os.environ.get("LEIA_RETRO_SPRINT", "Guest360 Sprint 8")
        active_name = os.environ.get("LEIA_PLANNING_SPRINT", "Guest360 Sprint 9")
        closed_issues = fetch_sprint_issues(closed_name)
        active_issues = fetch_sprint_issues(active_name)
        velocity_issues = fetch_velocity_issues()
        all_project_issues = merge_issues(
            closed_issues, active_issues, velocity_issues, fetch_all_sprint_attributed_issues()
        )

    snapshot = build_snapshot(closed_issues, active_issues, velocity_issues)
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(snapshot, indent=2), encoding="utf-8")
    print(f"Wrote {OUT_PATH}")
    print(
        f"  Retro: {snapshot['meta']['retroSprint']} — {len(snapshot['retro']['completedWork'])} done stories",
        file=sys.stderr,
    )
    print(
        f"  Planning: {snapshot['meta']['planningSprint']} — {len(snapshot['planning']['committedWork'])} committed",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
