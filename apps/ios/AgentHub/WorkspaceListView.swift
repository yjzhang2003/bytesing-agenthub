import SwiftUI

struct WorkspaceListView: View {
    let state: AgentHubMobileState

    var body: some View {
        NavigationStack {
            List(state.workspaces) { workspace in
                NavigationLink {
                    WorkspaceHomeView(state: state, workspace: workspace)
                } label: {
                    VStack(alignment: .leading) {
                        Text(workspace.name)
                        Text("Runtime: \(workspace.runtimeStatus.rawValue)")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .navigationTitle("Workspaces")
        }
    }
}

