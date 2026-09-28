# Brief Desk

Intake and scheduling for Marketing requests.

- **New brief**: a structured briefing form. Required fields (requester, requesting team, approver, request name, type, priority, channels, objective, audience, key message, deliverables, success metrics, go-live date) are validated before submit. Briefs with under 10 business days of lead time are flagged as rush.
- **Requests**: the shared queue. Open a request to accept or decline it (declining needs a reason), then assign an owner, internal due date, effort estimate and team notes, and move it through New → Accepted → In progress → In review → Delivered.
- **Calendar**: a month grid and a timeline, grouped and coloured by marketing team or by channel, with team/channel filters.

`index.html` is published as a claude.ai Artifact with the `db` capability. Requests are stored in the artifact's shared `requests` collection, so every signed-in viewer sees the same live data. Opened outside claude.ai it runs in a local, unsaved mode.
