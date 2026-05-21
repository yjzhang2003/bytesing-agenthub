import SwiftUI

struct WorkspaceHomeView: View {
    let state: AgentHubMobileState
    let workspace: WorkspaceSummary

    var body: some View {
        List {
            Section("Runtime") {
                Text(workspace.runtimeStatus.rawValue)
            }

            Section("Conversations") {
                ForEach(state.conversations) { conversation in
                    NavigationLink(conversation.title) {
                        ConversationView(state: state, conversation: conversation)
                    }
                }
            }

            Section("Pending") {
                NavigationLink("Permission: \(state.permission.summary)") {
                    PermissionDetailView(permission: state.permission)
                }
            }
        }
        .navigationTitle(workspace.name)
    }
}

