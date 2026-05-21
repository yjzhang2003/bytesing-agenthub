import Foundation

enum RuntimeStatus: String, Codable {
    case online
    case offline
    case degraded
    case activeRunning = "active-running"
}

enum PlanStatus: String, Codable {
    case draft
    case invalid
    case approved
    case revisionRequested = "revision-requested"
    case cancelled
    case dispatched
    case completed
    case failed
}

enum PermissionStatus: String, Codable {
    case pending
    case allowedOnce = "allowed-once"
    case denied
    case expired
    case blocked
    case completed
}

struct WorkspaceSummary: Identifiable, Codable {
    let id: String
    let name: String
    let runtimeStatus: RuntimeStatus
}

struct ConversationSummary: Identifiable, Codable {
    let id: String
    let title: String
    let participants: [String]
}

struct PlanSummary: Identifiable, Codable {
    let id: String
    let goal: String
    let status: PlanStatus
    let assignedAgents: [String]
}

struct PermissionSummary: Identifiable, Codable {
    let id: String
    let summary: String
    let status: PermissionStatus
    let risk: String
}

struct DiffSummary: Identifiable, Codable {
    let id: String
    let filesChanged: Int
    let insertions: Int
    let deletions: Int
    let state: String
}

struct AgentHubMobileState {
    let authenticated: Bool
    let workspaces: [WorkspaceSummary]
    let conversations: [ConversationSummary]
    let plan: PlanSummary
    let permission: PermissionSummary
    let diff: DiffSummary

    static let demo = AgentHubMobileState(
        authenticated: true,
        workspaces: [
            WorkspaceSummary(id: "workspace_1", name: "AgentHub Demo", runtimeStatus: .online)
        ],
        conversations: [
            ConversationSummary(
                id: "conversation_1",
                title: "AgentHub demo group chat",
                participants: ["Orchestrator", "Implementer", "Reviewer"]
            )
        ],
        plan: PlanSummary(
            id: "plan_1",
            goal: "Implement AgentHub foundation",
            status: .draft,
            assignedAgents: ["Orchestrator", "Implementer", "Reviewer"]
        ),
        permission: PermissionSummary(
            id: "permission_1",
            summary: "Run pnpm check",
            status: .pending,
            risk: "high"
        ),
        diff: DiffSummary(id: "diff_1", filesChanged: 1, insertions: 24, deletions: 3, state: "available")
    )
}

