# Brief Desk

Intake and scheduling for Marketing requests.

- **New brief**: a structured briefing form. Required fields (requester, requesting team, approving team, request name, type, priority, objective, audience, key message, success metrics, go-live date) are validated before submit. Requesters tick whether copy and/or creative is required; channels are picked by the execution team on acceptance. Briefs submitted less than 48 hours before go-live are flagged as rush.
- **Requests**: the shared queue. Open a request to accept or decline it (accepting needs at least one channel; declining needs a reason), then assign an owner, internal due date, effort estimate and team notes, and move it through New → Accepted → In progress → In review → Delivered.
- **Teams**: who reviews briefs for each approving team (CRM, Loyalty, Social Media, Digital Marketing, PR, Print & OOH). Admins (the artifact owner and Editors) add members with **Add me**, the people search, or by approving **Ask to join** requests, and remove them with **Remove**.
- **Calendar**: a month grid and a timeline, grouped and coloured by marketing team or by channel, with team/channel filters.

`index.html` is published as a claude.ai Artifact with the `db` capability. Requests are stored in the artifact's shared `requests` collection, so every signed-in viewer sees the same live data. Opened outside claude.ai it runs in a local, unsaved mode.

## Roles and permissions

| Role | Who | Can |
|---|---|---|
| Anyone | Contributor access on the artifact | Submit briefs, view all requests and the calendar |
| Team member | Listed under an approving team on the Teams tab | Accept/decline and update briefs sent to that team |
| Admin | Artifact owner and Editors | Manage team membership, delete any request |

How it is enforced (db access rules):

- `requests/*` holds the briefs; any Contributor can write here.
- `config/roster` holds team membership; only admins can write it.
- `work/<user id>` holds each person's accept/decline/status decisions, their join requests and the name they entered; each person can write only their own document, everyone can read them all.

A request's status, owner, channels, due date and notes come from the most recent decision by someone who is on (or was on, at the time) the request's approving team. Decisions by anyone else are ignored, so nobody outside the team can accept a brief even by writing to the database directly.
