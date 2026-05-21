import SwiftUI

struct PermissionDetailView: View {
    let permission: PermissionSummary

    var body: some View {
        List {
            Section("Request") {
                Text(permission.summary)
                Text("Risk: \(permission.risk)")
                Text("Status: \(permission.status.rawValue)")
            }
            Section("Actions") {
                Button("Allow once") {}
                Button("Deny", role: .destructive) {}
            }
        }
        .navigationTitle("Permission")
    }
}

