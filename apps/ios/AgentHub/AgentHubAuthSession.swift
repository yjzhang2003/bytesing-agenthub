import AuthenticationServices
import Foundation

@MainActor
final class AgentHubAuthSession: NSObject, ObservableObject {
    @Published private(set) var authenticated: Bool
    @Published var authenticating = false
    @Published var errorMessage: String?

    private let callbackScheme: String
    private let sessionKey = "agenthub.ios.authenticated"
    private var webSession: ASWebAuthenticationSession?

    init(callbackScheme: String = "agenthub", defaults: UserDefaults = .standard) {
        self.callbackScheme = callbackScheme
        self.authenticated = defaults.bool(forKey: sessionKey)
        self.defaults = defaults
    }

    private let defaults: UserDefaults

    func signInWithGitHub(supabaseURL: URL) {
        authenticating = true
        errorMessage = nil
        var components = URLComponents(url: supabaseURL.appendingPathComponent("auth/v1/authorize"), resolvingAgainstBaseURL: false)
        components?.queryItems = [
            URLQueryItem(name: "provider", value: "github"),
            URLQueryItem(name: "redirect_to", value: "\(callbackScheme)://auth/callback")
        ]
        guard let url = components?.url else {
            authenticating = false
            errorMessage = "Invalid Supabase URL"
            return
        }
        webSession = ASWebAuthenticationSession(url: url, callbackURLScheme: callbackScheme) { [weak self] callbackURL, error in
            Task { @MainActor in
                self?.handleCallback(callbackURL, error: error)
            }
        }
        webSession?.presentationContextProvider = self
        webSession?.prefersEphemeralWebBrowserSession = false
        webSession?.start()
    }

    func handleCallback(_ callbackURL: URL?, error: Error?) {
        authenticating = false
        if let error {
            errorMessage = error.localizedDescription
            authenticated = false
            defaults.set(false, forKey: sessionKey)
            return
        }
        guard callbackURL != nil else {
            errorMessage = "Missing OAuth callback"
            authenticated = false
            defaults.set(false, forKey: sessionKey)
            return
        }
        authenticated = true
        defaults.set(true, forKey: sessionKey)
    }

    func signOut() {
        webSession?.cancel()
        webSession = nil
        authenticating = false
        errorMessage = nil
        authenticated = false
        defaults.set(false, forKey: sessionKey)
    }
}

extension AgentHubAuthSession: ASWebAuthenticationPresentationContextProviding {
    nonisolated func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        ASPresentationAnchor()
    }
}
