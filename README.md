# ORBIT
**Operations, Risk, and Backlog Intelligence Tracker**

Live site: [angelaayay29.github.io/ORBIT](https://angelaayay29.github.io/ORBIT/)

---

## What is ORBIT?

ORBIT is a sprint planning and delivery risk management tool for the Guest360 CDP team. It reads directly from Jira and turns sprint data into plain-English summaries — so leadership can see what's happening and what's at risk without opening a single ticket.

There are two views:

- **Retrospective summary** — generated after each sprint closes. Covers what got delivered, what slipped, how the team felt, and what the retro surfaced.
- **Planning summary** — generated at sprint start. Covers what's committed, whether the plan is realistic given velocity, who is available, and what risks exist entering the sprint.

---

## Accessing the site

No setup required. Open the link:

**[https://angelaayay29.github.io/ORBIT/](https://angelaayay29.github.io/ORBIT/)**

You'll be prompted to log in. Two user types exist:

| Role | Who | What they can do |
|------|-----|-----------------|
| **Viewer** | Ryan, Brian, program owners | View summaries, hover widget specs, drag and drop layout |
| **Editor** | David, Kavita, Chu, Emily, Samantha, Elaine | Everything above + edit fields, approve AI insight, trigger Jira refresh |

---

## Features

- **Hover any widget** to see its full spec — what it represents, how it's calculated, who owns it, its data source, and any open questions
- **Drag and drop** widgets to arrange the page in whatever order works for you — layout is saved per user
- **Space-themed dark mode** with star-rain navigation animation
- **AI insight panel** at the top of each page — a plain-English paragraph synthesizing all sprint data, reviewed and approved by the Scrum Master before publishing

---

## Data sources

| Source | What it powers |
|--------|---------------|
| Jira (board 13159) | Points, assignees, program tags, blockers, sprint history |
| Outlook calendar | Team OOO and availability for capacity calculations |
| EOW survey (Google Forms) | Team health score, happiness index, sentiment trend |
| Standup transcripts | AI insight qualitative signal, blocker patterns |
| ORBIT snapshots (internal) | Sprint-over-sprint deltas, velocity trend, pattern detection |
| Anthropic API | AI insight and root-cause narrative generation |

---

## Project context

ORBIT is Deliverable 2 of the Guest360 Summer 2025 Internship suite:

| Tool | Full name | Purpose |
|------|-----------|---------|
| **GENIE** | Guest Event Navigation and Intelligence Engine | Guest events catalog with AI search |
| **ORBIT** | Operations, Risk, and Backlog Intelligence Tracker | Sprint planning and retrospective summaries |
| **BELLE** | Business Evaluation of Legal Lifecycle Enablement | RTA delta analysis |
| **GUS** | Guest360 Unified Site | DPP platform overview page |

---

## Repo structure

```
ORBIT/
├── index.html          # Login page
├── retro.html          # Sprint retrospective summary
├── planning.html       # Sprint planning summary
├── data/
│   └── orbit-snapshots/    # Sprint JSON snapshots
├── scripts/
│   └── refresh-orbit-from-jira.md  # Cursor prompt for Jira refresh
└── README.md
```

---

## Refreshing data

Until automated sync is set up, data is refreshed manually via Cursor:

1. Open Cursor
2. Run the prompt in `scripts/refresh-orbit-from-jira.md`
3. The agent queries board 13159, aggregates the sprint data, and writes a new snapshot file to `data/orbit-snapshots/`

The site reads from these snapshot files — no backend required.

---

## Open questions

Before live Jira integration can be fully wired up:

- IT ticket needed for API access to `myjira.disney.com` (behind Disney SSO)
- Custom field ID for story points on GST360 to be confirmed
- Program tag convention (CCN R2, BEEP, WoT) to be confirmed — label vs. fix version
- Standup recording tool to be adopted if not already in use
- EOW survey to be created and distributed if it doesn't exist

See the ORBIT one-pager for the full list of pending questions and next steps.
