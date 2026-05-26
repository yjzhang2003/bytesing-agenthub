import SwiftUI

struct WorkspaceHomeView: View {
    let state: AgentHubMobileState
    let workspace: WorkspaceSummary
    @AppStorage("agenthub.locale") private var localeRaw = AgentHubMobileLocale.english.rawValue
    private var locale: AgentHubMobileLocale {
        AgentHubMobileLocale.normalized(localeRaw)
    }
    private var strings: AgentHubStrings {
        AgentHubStrings(locale: locale)
    }

    var body: some View {
        List {
            Section(strings.text(.runtime)) {
                Text(strings.text(.runtimeStatus(workspace.runtimeStatus)))
            }

            Section(strings.text(.conversations)) {
                ForEach(state.conversations) { conversation in
                    NavigationLink(conversation.title) {
                        ConversationView(state: state, conversation: conversation)
                    }
                }
            }

            Section(strings.text(.pending)) {
                NavigationLink("\(strings.text(.permission)): \(state.permission.summary)") {
                    PermissionDetailView(permission: state.permission)
                }
            }

            Section(strings.text(.settings)) {
                Picker(strings.text(.language), selection: $localeRaw) {
                    ForEach(AgentHubMobileLocale.allCases) { locale in
                        Text(locale.displayName).tag(locale.rawValue)
                    }
                }
            }
        }
        .navigationTitle(workspace.name)
    }
}
