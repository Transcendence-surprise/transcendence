export default function PrivacyPolicy() {
  const lastUpdated = "April 23, 2025";

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 text-white">Privacy Policy</h1>
          <p className="text-light-cyan text-lg">
            How Valinor collects, uses, and protects your personal data
          </p>
          <p className="text-sm text-light-cyan mt-2">Last updated: {lastUpdated}</p>
        </div>

        <div className="space-y-8">
          <section className="bg-bg-dark-secondary border border-[var(--color-border-subtle)] rounded-lg p-6">
            <h2 className="text-2xl font-bold text-cyan-bright mb-4">1. Who We Are</h2>
            <p className="text-white leading-relaxed">
              Valinor (<strong>valinor.ink</strong>) is a browser-based multiplayer puzzle game
              developed as a student project at School 42. The application is operated by the
              project team (mzhivoto, mzhitnik, ekashirs, mlitvino, imunaev-). When we refer to
              "we", "us", or "our" in this policy, we mean this team.
            </p>
            <p className="text-white leading-relaxed mt-3">
              This Privacy Policy explains what personal data we collect when you use Valinor, why
              we collect it, how we use it, and what rights you have over it.
            </p>
          </section>

          <section className="bg-bg-dark-secondary border border-[var(--color-border-subtle)] rounded-lg p-6">
            <h2 className="text-2xl font-bold text-cyan-bright mb-4">2. Data We Collect</h2>
            <div className="space-y-4 text-white">
              <div className="bg-bg-dark p-4 rounded border border-cyan-dark">
                <p className="font-bold text-cyan-bright mb-2">Account Data</p>
                <ul className="space-y-1 text-sm ml-4">
                  <li>• <strong>Username</strong> — chosen by you at registration; publicly visible</li>
                  <li>• <strong>Email address</strong> — used for login and account recovery; not publicly visible</li>
                  <li>• <strong>Password</strong> — stored as a salted bcrypt hash; we never store or transmit your plaintext password</li>
                  <li>• <strong>Avatar image</strong> — uploaded by you; publicly visible on your profile and the leaderboard</li>
                  <li>• <strong>Account creation date</strong></li>
                </ul>
              </div>

              <div className="bg-bg-dark p-4 rounded border border-cyan-dark">
                <p className="font-bold text-cyan-bright mb-2">Game and Activity Data</p>
                <ul className="space-y-1 text-sm ml-4">
                  <li>• <strong>Game history</strong> — results of games you played (win/loss, date, opponents)</li>
                  <li>• <strong>Statistics</strong> — total games played, total wins, win streak, leaderboard rank</li>
                  <li>• <strong>Badges</strong> — achievements unlocked and their unlock dates</li>
                  <li>• <strong>Friends list</strong> — usernames of users you have added as friends</li>
                  <li>• <strong>Chat messages</strong> — in-game and lobby messages; stored only for the duration of the active game session and not persisted to the database</li>
                </ul>
              </div>

              <div className="bg-bg-dark p-4 rounded border border-cyan-dark">
                <p className="font-bold text-cyan-bright mb-2">OAuth Data (if you sign in via Google or 42 Intra)</p>
                <ul className="space-y-1 text-sm ml-4">
                  <li>• We receive your <strong>email address</strong> and <strong>display name</strong> from the OAuth provider to create or link your account</li>
                  <li>• We do <strong>not</strong> receive or store your OAuth provider password</li>
                  <li>• We do <strong>not</strong> store long-lived OAuth access tokens</li>
                </ul>
              </div>

              <div className="bg-bg-dark p-4 rounded border border-cyan-dark">
                <p className="font-bold text-cyan-bright mb-2">Technical Data</p>
                <ul className="space-y-1 text-sm ml-4">
                  <li>• <strong>IP address and HTTP request logs</strong> — recorded by our Nginx server for security and abuse prevention; retained for a limited period</li>
                  <li>• <strong>Session cookie</strong> — an <code>access_token</code> HttpOnly cookie containing a signed JWT is set in your browser upon login; it expires automatically and is deleted on logout</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-bg-dark-secondary border border-[var(--color-border-subtle)] rounded-lg p-6">
            <h2 className="text-2xl font-bold text-cyan-bright mb-4">3. How We Use Your Data</h2>
            <div className="space-y-2 text-white">
              <div className="flex gap-3">
                <span className="text-cyan-bright font-bold mt-1">•</span>
                <span><strong>Authentication and account management</strong> — to verify your identity, maintain your session, and allow you to log in</span>
              </div>
              <div className="flex gap-3">
                <span className="text-cyan-bright font-bold mt-1">•</span>
                <span><strong>Gameplay</strong> — to track game progress, record results, update statistics, and award badges</span>
              </div>
              <div className="flex gap-3">
                <span className="text-cyan-bright font-bold mt-1">•</span>
                <span><strong>Leaderboard and social features</strong> — to display your username, avatar, and statistics to other users</span>
              </div>
              <div className="flex gap-3">
                <span className="text-cyan-bright font-bold mt-1">•</span>
                <span><strong>Security</strong> — to detect and prevent abuse, enforce rate limits, and protect the platform via our Web Application Firewall (ModSecurity)</span>
              </div>
              <div className="flex gap-3">
                <span className="text-cyan-bright font-bold mt-1">•</span>
                <span><strong>Account recovery</strong> — to send password reset emails via our transactional email provider (Brevo)</span>
              </div>
              <p className="text-light-cyan text-sm mt-3">
                We do not sell your personal data to third parties. We do not use your data for
                advertising or profiling.
              </p>
            </div>
          </section>

          <section className="bg-bg-dark-secondary border border-[var(--color-border-subtle)] rounded-lg p-6">
            <h2 className="text-2xl font-bold text-cyan-bright mb-4">4. Third-Party Services</h2>
            <div className="space-y-4 text-white">
              <p>We integrate with the following external services, each governed by their own privacy policies:</p>
              <div className="bg-bg-dark p-4 rounded border border-cyan-dark">
                <p className="font-bold text-cyan-bright mb-1">Google OAuth 2.0</p>
                <p className="text-sm">Used for "Sign in with Google". Google may collect data per their{" "}
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline text-cyan-bright">Privacy Policy</a>.
                </p>
              </div>
              <div className="bg-bg-dark p-4 rounded border border-cyan-dark">
                <p className="font-bold text-cyan-bright mb-1">42 Intra OAuth 2.0</p>
                <p className="text-sm">Used for "Sign in with 42". 42 may collect data per their platform policies.</p>
              </div>
              <div className="bg-bg-dark p-4 rounded border border-cyan-dark">
                <p className="font-bold text-cyan-bright mb-1">Brevo (email delivery)</p>
                <p className="text-sm">Used to send transactional emails (e.g., password resets). Your email address is transmitted to Brevo solely for this purpose.</p>
              </div>
              <div className="bg-bg-dark p-4 rounded border border-cyan-dark">
                <p className="font-bold text-cyan-bright mb-1">Hetzner VPS (hosting)</p>
                <p className="text-sm">Our server and database run on Hetzner infrastructure located in the EU.</p>
              </div>
            </div>
          </section>

          <section className="bg-bg-dark-secondary border border-[var(--color-border-subtle)] rounded-lg p-6">
            <h2 className="text-2xl font-bold text-cyan-bright mb-4">5. Data Retention</h2>
            <div className="space-y-2 text-white">
              <div className="flex gap-3">
                <span className="text-cyan-bright font-bold mt-1">•</span>
                <span><strong>Account data</strong> — retained for as long as your account exists</span>
              </div>
              <div className="flex gap-3">
                <span className="text-cyan-bright font-bold mt-1">•</span>
                <span><strong>Game history and statistics</strong> — retained indefinitely to maintain leaderboard integrity</span>
              </div>
              <div className="flex gap-3">
                <span className="text-cyan-bright font-bold mt-1">•</span>
                <span><strong>Chat messages</strong> — not stored persistently; lost when the game session ends</span>
              </div>
              <div className="flex gap-3">
                <span className="text-cyan-bright font-bold mt-1">•</span>
                <span><strong>Server logs</strong> — retained for up to 30 days for security purposes</span>
              </div>
            </div>
          </section>

          <section className="bg-bg-dark-secondary border border-[var(--color-border-subtle)] rounded-lg p-6">
            <h2 className="text-2xl font-bold text-cyan-bright mb-4">6. Security</h2>
            <p className="text-white leading-relaxed">
              We take reasonable technical measures to protect your data:
            </p>
            <ul className="space-y-2 mt-3 text-white ml-4">
              <li>• All traffic is encrypted in transit via <strong>HTTPS/TLS</strong></li>
              <li>• Passwords are hashed with <strong>bcrypt</strong> and never stored in plaintext</li>
              <li>• All application secrets (database passwords, JWT keys, OAuth credentials) are stored in <strong>HashiCorp Vault</strong> and never committed to version control</li>
              <li>• A <strong>Web Application Firewall (ModSecurity)</strong> filters malicious requests at the network edge</li>
              <li>• Authentication cookies are <strong>HttpOnly</strong> to prevent JavaScript access</li>
              <li>• API endpoints are <strong>rate-limited</strong> to prevent brute-force attacks</li>
            </ul>
          </section>

          <section className="bg-bg-dark-secondary border border-[var(--color-border-subtle)] rounded-lg p-6">
            <h2 className="text-2xl font-bold text-cyan-bright mb-4">7. Your Rights</h2>
            <p className="text-white leading-relaxed mb-3">You have the following rights over your personal data:</p>
            <div className="space-y-2 text-white">
              <div className="flex gap-3">
                <span className="text-cyan-bright font-bold mt-1">•</span>
                <span><strong>Access</strong> — you can view your profile data at any time from your profile page</span>
              </div>
              <div className="flex gap-3">
                <span className="text-cyan-bright font-bold mt-1">•</span>
                <span><strong>Rectification</strong> — you can update your username, email, and avatar from the Settings page</span>
              </div>
              <div className="flex gap-3">
                <span className="text-cyan-bright font-bold mt-1">•</span>
                <span><strong>Erasure</strong> — you can request deletion of your account by contacting us; note that anonymous game records may be retained for leaderboard integrity</span>
              </div>
              <div className="flex gap-3">
                <span className="text-cyan-bright font-bold mt-1">•</span>
                <span><strong>Portability</strong> — you can request an export of your personal data</span>
              </div>
            </div>
          </section>

          <section className="bg-bg-dark-secondary border border-[var(--color-border-subtle)] rounded-lg p-6">
            <h2 className="text-2xl font-bold text-cyan-bright mb-4">8. Children's Privacy</h2>
            <p className="text-white leading-relaxed">
              Valinor is not directed at persons under the age of 18. We do not knowingly collect
              personal data from users under 18. If you believe a person under 18 has provided us
              with personal data, please contact us and we will delete it promptly.
            </p>
          </section>

          <section className="bg-bg-dark-secondary border border-[var(--color-border-subtle)] rounded-lg p-6">
            <h2 className="text-2xl font-bold text-cyan-bright mb-4">9. Changes to This Policy</h2>
            <p className="text-white leading-relaxed">
              We may update this Privacy Policy from time to time. When we do, we will update the
              "Last updated" date at the top of this page. Continued use of Valinor after changes
              are posted constitutes your acceptance of the revised policy.
            </p>
          </section>

          <section className="bg-bg-dark-secondary border border-[var(--color-border-subtle)] rounded-lg p-6">
            <h2 className="text-2xl font-bold text-cyan-bright mb-4">10. Contact</h2>
            <p className="text-white leading-relaxed">
              If you have questions or requests about this Privacy Policy or your personal data,
              please contact the project team via the{" "}
              <a
                href="https://github.com/Transcendence-surprise"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-cyan-bright"
              >
                project repository
              </a>.
            </p>
          </section>
        </div>

        <div className="mt-12 text-center text-light-cyan text-sm border-t border-[var(--color-border-subtle)] pt-8">
          <p>Valinor — ft_transcendence · School 42 project</p>
        </div>
      </div>
    </div>
  );
}
