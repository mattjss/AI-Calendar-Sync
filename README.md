# AI-Calendar-Sync

Experiment interaction design project for an AI-powered calendar sync.

This repo currently contains a lightweight SwiftUI 6 iOS interaction prototype targeting iOS 18+. It focuses on **how an assistant might help you restructure your day across multiple calendars**, rather than on real calendar integrations (for now).

## Interaction concepts

- **AI prompt entry**: A prompt sheet where you describe how you want your day to change (e.g. _“Protect deep work 1–4pm”_, _“Make time for a 45‑minute walk”_).
- **AI proposals lane**: A horizontal stack of AI-generated proposals with confidence scores that you can apply or ignore.
- **Today timeline**: A vertical timeline of today’s events, with visual grouping and calendar-specific colors to explore how proposals might reshape the schedule.

## Code structure

- `AI_Calendar_SyncApp.swift`: App entry point.
- `Models/CalendarEvent.swift`: Lightweight event model used everywhere in the prototype.
- `ViewModels/CalendarViewModel.swift`: Sample data, AI proposal generation stub, and interaction state.
- `Views/RootView.swift`: Main SwiftUI screen with header, timeline, AI prompt sheet, and proposals.

## Next steps

- Wire this prototype up to real calendars (EventKit, CalDAV, etc.).
- Swap the AI stub for a real LLM-backed planner.
- Iterate on microinteractions, transitions, and edge cases (conflicts, overbooked days, multiple time zones).

