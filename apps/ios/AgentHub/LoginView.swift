import SwiftUI

struct LoginView: View {
    @ObservedObject var authSession: AgentHubAuthSession
    @AppStorage("agenthub.locale") private var localeRaw = AgentHubMobileLocale.english.rawValue

    private var strings: AgentHubStrings {
        AgentHubStrings(locale: AgentHubMobileLocale.normalized(localeRaw))
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            Text(strings.text(.loginTitle))
                .font(.title2)
                .fontWeight(.semibold)
            Text(strings.text(.loginDescription))
                .foregroundStyle(.secondary)
            Button {
                authSession.signInWithGitHub(
                    supabaseURL: URL(string: ProcessInfo.processInfo.environment["VITE_SUPABASE_URL"] ?? "https://example.supabase.co")!
                )
            } label: {
                Text(authSession.authenticating ? strings.text(.signingIn) : strings.text(.continueWithGitHub))
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .disabled(authSession.authenticating)
            if let error = authSession.errorMessage {
                Text(strings.text(.authError(error)))
                    .foregroundStyle(.red)
            }
            Picker(strings.text(.language), selection: $localeRaw) {
                ForEach(AgentHubMobileLocale.allCases) { locale in
                    Text(locale.displayName).tag(locale.rawValue)
                }
            }
        }
        .padding()
    }
}
