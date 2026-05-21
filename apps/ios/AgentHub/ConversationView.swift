import SwiftUI

struct ConversationView: View {
    let state: AgentHubMobileState
    let conversation: ConversationSummary

    var body: some View {
        List {
            Section("Participants") {
                Text(conversation.participants.joined(separator: ", "))
            }

            Section("Plan") {
                NavigationLink(state.plan.goal) {
                    PlanDetailView(plan: state.plan)
                }
            }

            Section("Permission") {
                NavigationLink(state.permission.summary) {
                    PermissionDetailView(permission: state.permission)
                }
            }

            Section("Diff") {
                NavigationLink("\(state.diff.filesChanged) files changed") {
                    DiffDetailView(diff: state.diff)
                }
            }
        }
        .navigationTitle(conversation.title)
    }
}

