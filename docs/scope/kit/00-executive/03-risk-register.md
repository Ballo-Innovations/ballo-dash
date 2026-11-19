# Risk Register
| # | Risk | L | I | Mitigation | Owner |
|---|---|---|---|---|---|
| R1 | Judges dismiss simulated social data | High | High | Provenance chips; live RSS + live web tracker + real survey; connector adapters shaped to real APIs; honest slide | CEO |
| R2 | Sentiment looks wrong on local slang | Med | High | Custom lexicon additions; LLM second pass on flagged items; show confidence | Dev B |
| R3 | Real-time wall jitters / performance | Med | Med | Server-sent events; batch inserts; indexes on (source, occurredAt) | Dev C |
| R4 | LLM unavailable on demo day | Med | High | Cache at seed; template fallback | Dev B |
| R5 | Scope creep across 4 big areas | High | High | Vertical slices; cut list; PM gatekeeps | PM |
| R6 | Paid media "billing status" misunderstood | Med | Med | Define: Planned → Booked → Invoiced → Paid per line item; show variance | PM |
| R7 | PDF report generation flaky | Med | Med | Server-side render with @react-pdf; snapshot test | Dev C |
| R8 | Dev drops out | Low | High | Second owners; small tickets | Tech lead |
| R9 | Deployment breaks | Med | High | Daily deploys; freeze; docker-compose fallback; recording | Dev C |
| R10 | Pitch overrun | Med | Med | 8-min script; cut list | CEO |
