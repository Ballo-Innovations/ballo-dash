# ADR-001: Single Next.js app + worker; connector architecture with live/import/simulated sources
**Context:** Social APIs are paid/gated; open-source listening tools are heavy and AGPL. Judges need a working pipeline and honesty.
**Decision:** One TypeScript repo (app + worker). Connector interface; three live sources (RSS, tracker, surveys), CSV imports, deterministic simulated social stream, API stubs shaped to real responses. Provenance on every record.
**Consequences:** Demo is reproducible and offline-safe; we must build sentiment/trend/crisis ourselves (in scope); real social is a key-switch away.
