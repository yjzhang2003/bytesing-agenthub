import SwiftUI

struct DiffDetailView: View {
    let diff: DiffSummary

    var body: some View {
        List {
            Section("Summary") {
                Text("\(diff.filesChanged) files changed")
                Text("+\(diff.insertions) -\(diff.deletions)")
                Text("State: \(diff.state)")
            }
            Section("Files") {
                NavigationLink("packages/ui/src/index.tsx") {
                    Text("Single file diff detail")
                        .font(.system(.body, design: .monospaced))
                }
            }
        }
        .navigationTitle("Diff")
    }
}

