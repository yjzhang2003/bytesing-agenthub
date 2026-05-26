import SwiftUI

struct PermissionDetailView: View {
    let permission: PermissionSummary
    @AppStorage("agenthub.locale") private var localeRaw = AgentHubMobileLocale.english.rawValue
    private var strings: AgentHubStrings {
        AgentHubStrings(locale: AgentHubMobileLocale.normalized(localeRaw))
    }

    var body: some View {
        List {
            Section(strings.text(.request)) {
                Text(permission.summary)
                Text(strings.text(.risk(permission.risk)))
                Text(strings.text(.status(strings.text(.permissionStatus(permission.status)))))
            }
            Section(strings.text(.actions)) {
                Button(strings.text(.allowOnce)) {}
                Button(strings.text(.deny), role: .destructive) {}
            }
        }
        .navigationTitle(strings.text(.permission))
    }
}
