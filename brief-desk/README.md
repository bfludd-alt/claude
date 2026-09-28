# Brief Desk

Intake and scheduling for Marketing requests.

- **New brief**: a structured briefing form. Required fields (requester, requesting team, approving team, request name, type, priority, objective, audience, key message, success metrics, go-live date) are validated before submit. Requesters tick whether copy and/or creative is required; channels are picked by the execution team on acceptance. Briefs submitted less than 48 hours before go-live are flagged as rush.
- **Requests**: the shared queue. Open a request to accept or decline it (accepting needs at least one channel; declining needs a reason), then assign an owner, internal due date, effort estimate and team notes, and move it through New → Accepted → In progress → In review → Delivered.
- **Calendar**: a month grid and a timeline, grouped and coloured by marketing team or by channel, with team/channel filters.

`index.html` is published as a claude.ai Artifact with the `db` capability. Requests are stored in the artifact's shared `requests` collection, so every signed-in viewer sees the same live data. Opened outside claude.ai it runs in a local, unsaved mode.
