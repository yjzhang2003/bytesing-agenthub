import SwiftUI

struct ConversationView: View {
    let state: AgentHubMobileState
    let conversation: ConversationSummary
    @AppStorage("agenthub.locale") private var localeRaw = AgentHubMobileLocale.english.rawValue
    private var strings: AgentHubStrings {
        AgentHubStrings(locale: AgentHubMobileLocale.normalized(localeRaw))
    }

    var body: some View {
        List {
            Section(strings.text(.participants)) {
                Text(conversation.participants.joined(separator: ", "))
            }

            Section(strings.text(.plan)) {
                NavigationLink(state.plan.goal) {
                    PlanDetailView(plan: state.plan)
                }
            }

            Section(strings.text(.permission)) {
                NavigationLink(state.permission.summary) {
                    PermissionDetailView(permission: state.permission)
                }
            }

            Section(strings.text(.diff)) {
                NavigationLink(strings.text(.filesChanged(state.diff.filesChanged))) {
                    DiffDetailView(diff: state.diff)
                }
            }
        }
        .navigationTitle(conversation.title)
    }
}
