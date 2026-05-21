import SwiftUI

struct PlanDetailView: View {
    let plan: PlanSummary

    var body: some View {
        List {
            Section("Goal") {
                Text(plan.goal)
            }
            Section("Status") {
                Text(plan.status.rawValue)
            }
            Section("Agents") {
                ForEach(plan.assignedAgents, id: \.self) { agent in
                    Text(agent)
                }
            }
            Section("Actions") {
                Button("Approve") {}
                Button("Ask to revise") {}
                Button("Cancel", role: .destructive) {}
            }
        }
        .navigationTitle("Plan")
    }
}

