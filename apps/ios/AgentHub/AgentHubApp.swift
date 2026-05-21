import SwiftUI

@main
struct AgentHubApp: App {
    var body: some Scene {
        WindowGroup {
            WorkspaceListView(state: .demo)
        }
    }
}

