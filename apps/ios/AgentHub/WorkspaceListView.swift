import SwiftUI

struct WorkspaceListView: View {
    let state: AgentHubMobileState
    @AppStorage("agenthub.locale") private var localeRaw = AgentHubMobileLocale.english.rawValue
    private var strings: AgentHubStrings {
        AgentHubStrings(locale: AgentHubMobileLocale.normalized(localeRaw))
    }

    var body: some View {
        NavigationStack {
            List(state.workspaces) { workspace in
                NavigationLink {
                    WorkspaceHomeView(state: state, workspace: workspace)
                } label: {
                    VStack(alignment: .leading) {
                        Text(workspace.name)
                        Text("\(strings.text(.runtime)): \(strings.text(.runtimeStatus(workspace.runtimeStatus)))")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .navigationTitle(strings.text(.workspaces))
        }
    }
}
