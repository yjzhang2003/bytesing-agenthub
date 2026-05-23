import SwiftUI

struct PlanDetailView: View {
    let plan: PlanSummary
    @AppStorage("agenthub.locale") private var localeRaw = AgentHubMobileLocale.english.rawValue
    private var strings: AgentHubStrings {
        AgentHubStrings(locale: AgentHubMobileLocale.normalized(localeRaw))
    }

    var body: some View {
        List {
            Section(strings.text(.goal)) {
                Text(plan.goal)
            }
            Section(strings.text(.statusLabel)) {
                Text(plan.status.rawValue)
            }
            Section(strings.text(.agents)) {
                ForEach(plan.assignedAgents, id: \.self) { agent in
                    Text(agent)
                }
            }
            Section(strings.text(.actions)) {
                Button(strings.text(.approve)) {}
                Button(strings.text(.revise)) {}
                Button(strings.text(.cancel), role: .destructive) {}
            }
        }
        .navigationTitle(strings.text(.plan))
    }
}
