# KnowledgeHub QMS Constitution

## Core Principles

### I. Part-Centric Deviation Intelligence
KnowledgeHub is not just a deviation archive. Its primary purpose is to let users search a Part and immediately understand recurrence history: how many deviations involved that Part, what issue patterns repeated, how each was handled, and what should be done if the same or similar condition happens again.

### II. Evidence as Source of Truth
Raw Word/PDF/Excel/images remain the source of truth. Extracted records and curated lessons are derived artifacts and must retain lineage to source folders, Word/PDF references, evidence snippets, and import history.

### III. Many-to-Many Case Knowledge
One Part can appear in many deviations, and one deviation can involve multiple Parts. Lessons can group multiple deviations only when issue, action, verification, and scope justify reuse. The system must support repeated but distinct technical lessons for the same Part.

### IV. Human-Approved Knowledge
AI may draft, classify, compare, and suggest reusable lessons, but approved knowledge must be reviewable and human-approved. The app must preserve draft/review/approved/superseded states and revision history.

### V. Smart Upsert and Auditability
Imports must be idempotent using a stable business key. Updates must preserve audit trail, content hash, import history, and source evidence. Existing records must be updated intelligently, not blindly duplicated.

## Domain Model Requirements

- `Deviation`: individual case record with deviation id, business key, date, part field, supplier, product, customer, root cause, issue, solution, actions/process, folder, reference Word/PDF.
- `Part`: searchable normalized part token extracted from deviation part fields, including multi-part deviations.
- `PartDeviation`: join relation between Part and Deviation to support many-to-many recurrence queries.
- `Lesson`: curated reusable knowledge containing problem pattern, lesson text, verification, result, prevention, conditions, scope, review status, and source deviations.
- `Evidence`: source Word/PDF/image/Excel/document links and optional exact section/excerpt locators.
- `ReviewQueue`: AI/human workflow for new lesson, matched existing, update proposed, different scope, conflict detected, and needs review.

## Required User Experience

When a user searches a Part, the app must show:
1. recurrence count and trend,
2. all deviations involving the Part,
3. grouped issue patterns/root-cause families,
4. approved reusable lessons and their conditions,
5. prior solutions/actions/processes,
6. evidence/source links,
7. recommendation for what to do if the issue repeats.

## Governance

This constitution supersedes UI-only requirements. A beautiful dashboard is not enough unless it improves part-centric retrieval, recurrence awareness, and reusable handling guidance.

**Version**: 1.0.0 | **Ratified**: 2026-07-24 | **Last Amended**: 2026-07-24
