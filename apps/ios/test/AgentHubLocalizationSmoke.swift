import Foundation

func expectEqual(_ actual: String, _ expected: String, _ label: String) {
    if actual != expected {
        fatalError("\(label): expected \(expected), got \(actual)")
    }
}

expectEqual(AgentHubMobileLocale.normalized("en").rawValue, "en-US", "English alias")
expectEqual(AgentHubMobileLocale.normalized("zh").rawValue, "zh-CN", "Chinese alias")
expectEqual(AgentHubMobileLocale.normalized("bogus").rawValue, "en-US", "Invalid locale fallback")

let english = AgentHubStrings(locale: .english)
let chinese = AgentHubStrings(locale: .simplifiedChinese)

expectEqual(english.text(.runtimeStatus(.activeRunning)), "Active run", "English runtime status")
expectEqual(chinese.text(.runtimeStatus(.activeRunning)), "运行中", "Chinese runtime status")
expectEqual(english.text(.planStatus(.revisionRequested)), "Revision requested", "English plan status")
expectEqual(chinese.text(.planStatus(.revisionRequested)), "已要求修改", "Chinese plan status")
expectEqual(english.text(.permissionStatus(.allowedOnce)), "Allowed once", "English permission status")
expectEqual(chinese.text(.permissionStatus(.allowedOnce)), "已允许一次", "Chinese permission status")
expectEqual(chinese.text(.singleFileDiffDetail), "单文件差异详情", "Chinese diff detail")
expectEqual(english.text(.loginTitle), "Sign in to AgentHub", "English login title")
expectEqual(chinese.text(.loginTitle), "登录 AgentHub", "Chinese login title")
expectEqual(english.text(.continueWithGitHub), "Continue with GitHub", "English GitHub sign-in")
expectEqual(chinese.text(.continueWithGitHub), "使用 GitHub 继续", "Chinese GitHub sign-in")
expectEqual(chinese.text(.authError("redirect_uri_mismatch")), "登录失败：redirect_uri_mismatch", "Chinese auth error")
