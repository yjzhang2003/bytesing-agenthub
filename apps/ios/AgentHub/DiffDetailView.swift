import SwiftUI

struct DiffDetailView: View {
    @AppStorage("agenthub.locale") private var localeRaw = AgentHubMobileLocale.english.rawValue

    let diff: DiffSummary

    private var strings: AgentHubStrings {
        AgentHubStrings(locale: AgentHubMobileLocale.normalized(localeRaw))
    }

    var body: some View {
        List {
            Section(strings.text(.summary)) {
                Text(strings.text(.filesChanged(diff.filesChanged)))
                Text("+\(diff.insertions) -\(diff.deletions)")
                Text(strings.text(.state(diff.state)))
            }
            Section(strings.text(.files)) {
                NavigationLink("packages/ui/src/index.tsx") {
                    Text("Single file diff detail")
                        .font(.system(.body, design: .monospaced))
                }
            }
        }
        .navigationTitle(strings.text(.diff))
    }
}
