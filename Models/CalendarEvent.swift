import Foundation

struct CalendarEvent: Identifiable, Hashable {
    let id = UUID()
    let title: String
    let startDate: Date
    let endDate: Date
    let location: String?
    let sourceCalendar: String
    let isAIProposed: Bool
    let confidence: Double?

    var duration: TimeInterval {
        endDate.timeIntervalSince(startDate)
    }

    var isAllDay: Bool {
        Calendar.current.isDate(startDate, inSameDayAs: endDate) &&
            duration >= 24 * 60 * 60 - 60
    }
}

