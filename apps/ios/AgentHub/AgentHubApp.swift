import SwiftUI

@main
struct AgentHubApp: App {
    @StateObject private var authSession = AgentHubAuthSession()

    var body: some Scene {
        WindowGroup {
            if authSession.authenticated {
                WorkspaceListView(state: .demo)
                    .environmentObject(authSession)
            } else {
                LoginView(authSession: authSession)
            }
        }
    }
}
