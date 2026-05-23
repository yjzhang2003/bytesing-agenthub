import Foundation

enum AgentHubMobileLocale: String, CaseIterable, Identifiable {
    case english = "en-US"
    case simplifiedChinese = "zh-CN"

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .english:
            return "English"
        case .simplifiedChinese:
            return "简体中文"
        }
    }

    static func normalized(_ rawValue: String) -> AgentHubMobileLocale {
        AgentHubMobileLocale(rawValue: rawValue) ?? .english
    }
}

struct AgentHubStrings {
    let locale: AgentHubMobileLocale

    func text(_ key: Key) -> String {
        switch locale {
        case .english:
            return key.english
        case .simplifiedChinese:
            return key.simplifiedChinese
        }
    }

    enum Key {
        case actions
        case agents
        case allowOnce
        case approve
        case cancel
        case conversations
        case deny
        case diff
        case files
        case filesChanged(Int)
        case goal
        case language
        case participants
        case pending
        case permission
        case plan
        case request
        case risk(String)
        case runtime
        case settings
        case state(String)
        case statusLabel
        case status(String)
        case summary
        case workspaces
        case revise

        var english: String {
            switch self {
            case .actions: return "Actions"
            case .agents: return "Agents"
            case .allowOnce: return "Allow once"
            case .approve: return "Approve"
            case .cancel: return "Cancel"
            case .conversations: return "Conversations"
            case .deny: return "Deny"
            case .diff: return "Diff"
            case .files: return "Files"
            case .filesChanged(let count): return "\(count) files changed"
            case .goal: return "Goal"
            case .language: return "Language"
            case .participants: return "Participants"
            case .pending: return "Pending"
            case .permission: return "Permission"
            case .plan: return "Plan"
            case .request: return "Request"
            case .risk(let value): return "Risk: \(value)"
            case .runtime: return "Runtime"
            case .settings: return "Settings"
            case .state(let value): return "State: \(value)"
            case .statusLabel: return "Status"
            case .status(let value): return "Status: \(value)"
            case .summary: return "Summary"
            case .workspaces: return "Workspaces"
            case .revise: return "Ask to revise"
            }
        }

        var simplifiedChinese: String {
            switch self {
            case .actions: return "操作"
            case .agents: return "智能体"
            case .allowOnce: return "允许一次"
            case .approve: return "批准"
            case .cancel: return "取消"
            case .conversations: return "会话"
            case .deny: return "拒绝"
            case .diff: return "差异"
            case .files: return "文件"
            case .filesChanged(let count): return "\(count) 个文件已更改"
            case .goal: return "目标"
            case .language: return "语言"
            case .participants: return "参与者"
            case .pending: return "待处理"
            case .permission: return "权限"
            case .plan: return "计划"
            case .request: return "请求"
            case .risk(let value): return "风险：\(value)"
            case .runtime: return "运行时"
            case .settings: return "设置"
            case .state(let value): return "状态：\(value)"
            case .statusLabel: return "状态"
            case .status(let value): return "状态：\(value)"
            case .summary: return "摘要"
            case .workspaces: return "工作区"
            case .revise: return "要求修改"
            }
        }
    }
}
