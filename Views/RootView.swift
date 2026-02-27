import SwiftUI

struct RootView: View {
    @StateObject private var model = CalendarViewModel()
    @Namespace private var cardNamespace

    var body: some View {
        NavigationStack {
            GeometryReader { proxy in
                let size = proxy.size

                ScrollView(showsIndicators: false) {
                    VStack(alignment: .leading, spacing: 24) {
                        headerSection
                        promptCard
                        timelineSection(maxHeight: size.height * 0.4)
                        suggestionsSection
                    }
                    .padding(.horizontal, 20)
                    .padding(.vertical, 16)
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
                .background(
                    LinearGradient(
                        colors: [
                            Color.blue.opacity(0.12),
                            Color.indigo.opacity(0.16),
                            Color(.systemBackground)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                    .ignoresSafeArea()
                )
            }
            .navigationTitle("AI Calendar")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        withAnimation(.snappy) {
                            model.seedSampleData()
                        }
                    } label: {
                        Image(systemName: "arrow.triangle.2.circlepath")
                    }
                    .accessibilityLabel("Reset sample data")
                }
            }
        }
    }

    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 8) {
                Image(systemName: "sparkles")
                    .foregroundStyle(.yellow)
                Text("Today, \(formattedDate(model.today))")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            Text("Let AI tidy up your day")
                .font(.title.bold())
                .foregroundStyle(.primary)

            Text("Experiment with how an assistant might rearrange, protect focus time, and resolve conflicts across all your calendars.")
                .font(.footnote)
                .foregroundStyle(.secondary)
        }
    }

    private var promptCard: some View {
        Button {
            model.isPresentingPromptSheet = true
        } label: {
            HStack(alignment: .center, spacing: 12) {
                ZStack {
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .fill(Color.blue.opacity(0.12))
                    Image(systemName: "wand.and.stars.inverse")
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundStyle(.blue)
                }
                .frame(width: 44, height: 44)

                VStack(alignment: .leading, spacing: 4) {
                    Text("Ask AI to reshuffle your day")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.primary)
                    Text("“Make room for a 60‑min walk between meetings.”")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.footnote.weight(.semibold))
                    .foregroundStyle(.tertiary)
            }
            .padding(14)
            .background(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .fill(.ultraThinMaterial)
                    .shadow(color: .black.opacity(0.08), radius: 18, x: 0, y: 10)
            )
        }
        .buttonStyle(.plain)
        .sheet(isPresented: $model.isPresentingPromptSheet) {
            PromptSheet(model: model)
                .presentationDetents([.height(260)])
                .presentationDragIndicator(.visible)
        }
    }

    private func timelineSection(maxHeight: CGFloat) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Label("Today’s schedule", systemImage: "calendar")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.primary)
                Spacer()
                Text("\(model.events.count) events")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            TimelineView(events: model.events, maxHeight: maxHeight, namespace: cardNamespace) { event in
                model.selectedEvent = event
            }
            .frame(maxHeight: maxHeight)
        }
    }

    private var suggestionsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Label("AI proposals", systemImage: "sparkles.rectangle.stack")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.primary)
                Spacer()
                if model.isThinking {
                    ProgressView()
                        .scaleEffect(0.7)
                }
            }

            if model.aiSuggestions.isEmpty {
                Text("No proposals yet. Describe how you’d like your day to feel, and we’ll generate a few options to explore.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
            } else {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 12) {
                        ForEach(model.aiSuggestions) { suggestion in
                            SuggestionCard(
                                event: suggestion,
                                onApply: { model.applySuggestion(suggestion) }
                            )
                            .matchedGeometryEffect(id: suggestion.id, in: cardNamespace)
                        }
                    }
                    .padding(.vertical, 2)
                }
            }
        }
    }

    private func formattedDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        return formatter.string(from: date)
    }
}

// MARK: - Components

private struct TimelineView: View {
    let events: [CalendarEvent]
    let maxHeight: CGFloat
    let namespace: Namespace.ID
    let onSelect: (CalendarEvent) -> Void

    var body: some View {
        ZStack(alignment: .top) {
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .fill(.ultraThinMaterial)
                .shadow(color: .black.opacity(0.04), radius: 16, x: 0, y: 10)

            VStack(alignment: .leading, spacing: 12) {
                ForEach(events) { event in
                    Button {
                        onSelect(event)
                    } label: {
                        HStack(alignment: .top, spacing: 10) {
                            VStack {
                                Circle()
                                    .fill(color(for: event))
                                    .frame(width: 8, height: 8)
                                RoundedRectangle(cornerRadius: 999)
                                    .fill(.quaternary)
                                    .frame(width: 2)
                                    .frame(maxHeight: .infinity)
                            }

                            VStack(alignment: .leading, spacing: 4) {
                                Text(event.title)
                                    .font(.subheadline.weight(.semibold))
                                    .foregroundStyle(.primary)

                                Text(timeRange(for: event))
                                    .font(.caption2)
                                    .foregroundStyle(.secondary)

                                HStack(spacing: 6) {
                                    if let location = event.location {
                                        Label(location, systemImage: "mappin.and.ellipse")
                                            .font(.caption2)
                                    }

                                    Label(event.sourceCalendar, systemImage: "circle.grid.2x2")
                                        .font(.caption2)
                                }
                                .foregroundStyle(.secondary)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)

                            Image(systemName: "chevron.right")
                                .font(.caption2.weight(.semibold))
                                .foregroundStyle(.tertiary)
                        }
                        .padding(.vertical, 6)
                    }
                    .buttonStyle(.plain)
                    .matchedGeometryEffect(id: event.id, in: namespace)

                    if event.id != events.last?.id {
                        Divider()
                    }
                }
            }
            .padding(14)
        }
    }

    private func timeRange(for event: CalendarEvent) -> String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        formatter.dateStyle = .none
        return "\(formatter.string(from: event.startDate))–\(formatter.string(from: event.endDate))"
    }

    private func color(for event: CalendarEvent) -> Color {
        switch event.sourceCalendar {
        case "Work":
            return .blue
        case "Personal":
            return .pink
        case "Focus":
            return .indigo
        case "Synced":
            return .green
        default:
            return .gray
        }
    }
}

private struct SuggestionCard: View {
    let event: CalendarEvent
    let onApply: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 8) {
                Image(systemName: "sparkles")
                    .foregroundStyle(.yellow)
                Text("Proposal")
                    .font(.caption.weight(.semibold))
                    .textCase(.uppercase)
                    .foregroundStyle(.secondary)
                Spacer()
                if let confidence = event.confidence {
                    Text("\(Int(confidence * 100))% fit")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }

            Text(event.title.replacingOccurrences(of: "AI: ", with: ""))
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(.primary)
                .lineLimit(3)

            Text(timeRange(for: event))
                .font(.caption2)
                .foregroundStyle(.secondary)

            Spacer(minLength: 4)

            HStack {
                Button(role: .cancel) {
                    // In this exploration, dismiss by swiping away the card.
                } label: {
                    Text("Later")
                }
                .buttonStyle(.borderless)
                .font(.caption)

                Spacer()

                Button(action: onApply) {
                    Label("Apply", systemImage: "checkmark.circle.fill")
                        .font(.caption.weight(.semibold))
                }
                .buttonStyle(.borderedProminent)
                .tint(.blue)
            }
        }
        .padding(14)
        .frame(width: 240, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .fill(.ultraThinMaterial)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .strokeBorder(Color.white.opacity(0.3))
        )
    }

    private func timeRange(for event: CalendarEvent) -> String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        formatter.dateStyle = .none
        return "\(formatter.string(from: event.startDate))–\(formatter.string(from: event.endDate))"
    }
}

private struct PromptSheet: View {
    @ObservedObject var model: CalendarViewModel
    @FocusState private var isFieldFocused: Bool

    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                TextField("Describe how you’d like your day to change…", text: $model.promptText, axis: .vertical)
                    .textFieldStyle(.roundedBorder)
                    .focused($isFieldFocused)

                VStack(alignment: .leading, spacing: 8) {
                    Text("Examples")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.secondary)

                    exampleButton(title: "Protect my deep work from 1–4pm") {
                        model.promptText = "Protect my deep work from 1–4pm and push non-urgent meetings later in the week."
                    }

                    exampleButton(title: "Make time for a 45‑minute walk") {
                        model.promptText = "Find a 45‑minute block for a walk, ideally in daylight between 11am and 3pm."
                    }
                }

                Spacer()

                Button {
                    Task {
                        await model.submitPrompt()
                    }
                } label: {
                    Label("Generate proposals", systemImage: "sparkles")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .tint(.blue)
                .disabled(model.promptText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || model.isThinking)
            }
            .padding(20)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Close") {
                        model.isPresentingPromptSheet = false
                    }
                }
            }
            .onAppear {
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) {
                    isFieldFocused = true
                }
            }
        }
    }

    private func exampleButton(title: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack {
                Text(title)
                    .font(.caption)
                Spacer()
                Image(systemName: "arrow.triangle.2.circlepath")
                    .font(.caption2)
            }
            .padding(10)
            .background(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .fill(Color(.secondarySystemBackground))
            )
        }
        .buttonStyle(.plain)
    }
}

#Preview("Root") {
    RootView()
}

