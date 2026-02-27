import Foundation
import SwiftUI

@MainActor
final class CalendarViewModel: ObservableObject {
    @Published var today: Date = .now
    @Published var events: [CalendarEvent] = []
    @Published var aiSuggestions: [CalendarEvent] = []
    @Published var selectedEvent: CalendarEvent?
    @Published var isPresentingPromptSheet = false
    @Published var promptText: String = ""
    @Published var isThinking = false

    init() {
        seedSampleData()
    }

    func seedSampleData() {
        let calendar = Calendar.current
        let now = Date()

        func makeEvent(
            title: String,
            hourOffset: Int,
            durationMinutes: Int,
            location: String? = nil,
            calendarName: String,
            isAIProposed: Bool = false,
            confidence: Double? = nil
        ) -> CalendarEvent {
            let start = calendar.date(byAdding: .hour, value: hourOffset, to: now) ?? now
            let end = calendar.date(byAdding: .minute, value: durationMinutes, to: start) ?? start
            return CalendarEvent(
                title: title,
                startDate: start,
                endDate: end,
                location: location,
                sourceCalendar: calendarName,
                isAIProposed: isAIProposed,
                confidence: confidence
            )
        }

        events = [
            makeEvent(
                title: "Product sync",
                hourOffset: 1,
                durationMinutes: 45,
                location: "Zoom",
                calendarName: "Work"
            ),
            makeEvent(
                title: "Deep work: design explorations",
                hourOffset: 3,
                durationMinutes: 90,
                calendarName: "Focus"
            ),
            makeEvent(
                title: "Lunch with Sam",
                hourOffset: 5,
                durationMinutes: 60,
                location: "Downtown",
                calendarName: "Personal"
            )
        ]

        aiSuggestions = [
            makeEvent(
                title: "AI: Move product sync 30 min later",
                hourOffset: 1,
                durationMinutes: 45,
                location: "Zoom",
                calendarName: "AI Planner",
                isAIProposed: true,
                confidence: 0.82
            ),
            makeEvent(
                title: "AI: Block focus time for spec writing",
                hourOffset: 4,
                durationMinutes: 60,
                calendarName: "AI Planner",
                isAIProposed: true,
                confidence: 0.9
            )
        ]
    }

    func submitPrompt() async {
        guard !promptText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
        isThinking = true

        try? await Task.sleep(for: .milliseconds(800))

        withAnimation(.snappy) {
            let synthetic = CalendarEvent(
                title: "AI: \(promptText)",
                startDate: today.addingTimeInterval(60 * 60 * 2),
                endDate: today.addingTimeInterval(60 * 60 * 3),
                location: nil,
                sourceCalendar: "AI Planner",
                isAIProposed: true,
                confidence: 0.76
            )
            aiSuggestions.insert(synthetic, at: 0)
        }

        isThinking = false
        promptText = ""
    }

    func applySuggestion(_ suggestion: CalendarEvent) {
        guard suggestion.isAIProposed else { return }

        withAnimation(.snappy) {
            aiSuggestions.removeAll { $0.id == suggestion.id }
            events.append(
                CalendarEvent(
                    title: suggestion.title.replacingOccurrences(of: "AI: ", with: ""),
                    startDate: suggestion.startDate,
                    endDate: suggestion.endDate,
                    location: suggestion.location,
                    sourceCalendar: "Synced",
                    isAIProposed: false,
                    confidence: nil
                )
            )
        }
    }
}

