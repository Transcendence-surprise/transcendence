export default function TermsOfService() {
  const lastUpdated = "April 23, 2025";

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 text-white">Terms of Service</h1>
          <p className="text-light-cyan text-lg">
            Rules and conditions for using Valinor
          </p>
          <p className="text-sm text-light-cyan mt-2">Last updated: {lastUpdated}</p>
        </div>

        <div className="space-y-8">
          <section className="bg-bg-dark-secondary border border-[var(--color-border-subtle)] rounded-lg p-6">
            <h2 className="text-2xl font-bold text-cyan-bright mb-4">1. Acceptance of Terms</h2>
            <p className="text-white leading-relaxed">
              By accessing or using Valinor at <strong>valinor.ink</strong>, you agree to be bound
              by these Terms of Service. If you do not agree to these terms, you must not use the
              application.
            </p>
            <p className="text-white leading-relaxed mt-3">
              These Terms apply to all users, including registered users, guest users, and
              spectators. We reserve the right to update these Terms at any time. Continued use of
              the service after updates constitutes acceptance.
            </p>
          </section>

          <section className="bg-bg-dark-secondary border border-[var(--color-border-subtle)] rounded-lg p-6">
            <h2 className="text-2xl font-bold text-cyan-bright mb-4">2. Eligibility</h2>
            <div className="space-y-2 text-white">
              <div className="flex gap-3">
                <span className="text-cyan-bright font-bold mt-1">•</span>
                <span>You must be at least <strong>18 years old</strong> to use Valinor</span>
              </div>
              <div className="flex gap-3">
                <span className="text-cyan-bright font-bold mt-1">•</span>
                <span>You must provide accurate and truthful information when creating an account</span>
              </div>
              <div className="flex gap-3">
                <span className="text-cyan-bright font-bold mt-1">•</span>
                <span>You are responsible for maintaining the confidentiality of your account credentials</span>
              </div>
              <div className="flex gap-3">
                <span className="text-cyan-bright font-bold mt-1">•</span>
                <span>Each person may maintain only <strong>one registered account</strong>; creating multiple accounts to gain an unfair advantage is prohibited</span>
              </div>
            </div>
          </section>

          <section className="bg-bg-dark-secondary border border-[var(--color-border-subtle)] rounded-lg p-6">
            <h2 className="text-2xl font-bold text-cyan-bright mb-4">3. User Accounts</h2>
            <div className="space-y-4 text-white">
              <div className="bg-bg-dark p-4 rounded border border-cyan-dark">
                <p className="font-bold text-cyan-bright mb-2">Account Responsibility</p>
                <p className="text-sm">
                  You are solely responsible for all activity that occurs under your account. If you
                  suspect unauthorised access to your account, you must change your password
                  immediately and notify us. We are not liable for any loss resulting from
                  unauthorised use of your account.
                </p>
              </div>
              <div className="bg-bg-dark p-4 rounded border border-cyan-dark">
                <p className="font-bold text-cyan-bright mb-2">Username and Avatar</p>
                <p className="text-sm">
                  Your username and avatar are publicly visible to all users. You must not use a
                  username or avatar that is offensive, impersonates another person, or violates
                  any third-party rights. We reserve the right to remove or change usernames and
                  avatars that violate these guidelines.
                </p>
              </div>
              <div className="bg-bg-dark p-4 rounded border border-cyan-dark">
                <p className="font-bold text-cyan-bright mb-2">Account Termination</p>
                <p className="text-sm">
                  We reserve the right to suspend or permanently terminate any account that
                  violates these Terms, without prior notice. You may also delete your own account
                  at any time by contacting us.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-bg-dark-secondary border border-[var(--color-border-subtle)] rounded-lg p-6">
            <h2 className="text-2xl font-bold text-cyan-bright mb-4">4. Acceptable Use</h2>
            <p className="text-white mb-4">When using Valinor you agree <strong>not</strong> to:</p>
            <div className="space-y-2 text-white">
              <div className="flex gap-3">
                <span className="text-red-400 font-bold mt-1">✗</span>
                <span><strong>Cheat or exploit</strong> — use bots, scripts, browser extensions, or any automated tools to manipulate gameplay or gain an unfair advantage</span>
              </div>
              <div className="flex gap-3">
                <span className="text-red-400 font-bold mt-1">✗</span>
                <span><strong>Interfere with the service</strong> — attempt to disrupt, overload, or compromise the servers, network, or other users' sessions</span>
              </div>
              <div className="flex gap-3">
                <span className="text-red-400 font-bold mt-1">✗</span>
                <span><strong>Attempt unauthorised access</strong> — probe, scan, or test the security of the application, or attempt to bypass authentication mechanisms</span>
              </div>
              <div className="flex gap-3">
                <span className="text-red-400 font-bold mt-1">✗</span>
                <span><strong>Harass other users</strong> — send abusive, threatening, or offensive messages in chat; use the chat system to spam or advertise</span>
              </div>
              <div className="flex gap-3">
                <span className="text-red-400 font-bold mt-1">✗</span>
                <span><strong>Impersonate others</strong> — pretend to be another user, a team member, or any other person or entity</span>
              </div>
              <div className="flex gap-3">
                <span className="text-red-400 font-bold mt-1">✗</span>
                <span><strong>Upload harmful content</strong> — upload avatars or other content that contains malware, is sexually explicit, or is otherwise illegal</span>
              </div>
              <div className="flex gap-3">
                <span className="text-red-400 font-bold mt-1">✗</span>
                <span><strong>Violate applicable law</strong> — use the service for any unlawful purpose or in violation of any applicable local, national, or international law</span>
              </div>
            </div>
          </section>

          <section className="bg-bg-dark-secondary border border-[var(--color-border-subtle)] rounded-lg p-6">
            <h2 className="text-2xl font-bold text-cyan-bright mb-4">5. Fair Play</h2>
            <p className="text-white leading-relaxed mb-4">
              Valinor is a competitive game and fair play is essential to the experience of all
              users. In addition to the general rules above:
            </p>
            <div className="space-y-2 text-white">
              <div className="flex gap-3">
                <span className="text-cyan-bright font-bold mt-1">•</span>
                <span>Do not intentionally disconnect from games to avoid a loss; repeated abandonment may result in account penalties</span>
              </div>
              <div className="flex gap-3">
                <span className="text-cyan-bright font-bold mt-1">•</span>
                <span>Do not coordinate with other players in multiplayer games to give one player an illegitimate advantage (match-fixing)</span>
              </div>
              <div className="flex gap-3">
                <span className="text-cyan-bright font-bold mt-1">•</span>
                <span>Guest users participate under the same fair-play rules as registered users</span>
              </div>
            </div>
          </section>

          <section className="bg-bg-dark-secondary border border-[var(--color-border-subtle)] rounded-lg p-6">
            <h2 className="text-2xl font-bold text-cyan-bright mb-4">6. Intellectual Property</h2>
            <p className="text-white leading-relaxed">
              All content, design, code, graphics, and other materials comprising Valinor are the
              property of the project team or their respective creators, and are protected by
              applicable intellectual property laws.
            </p>
            <p className="text-white leading-relaxed mt-3">
              You are granted a limited, non-exclusive, non-transferable licence to access and use
              the application for personal, non-commercial purposes. You must not copy, modify,
              distribute, sell, or otherwise exploit any part of the service without our explicit
              written permission.
            </p>
            <p className="text-white leading-relaxed mt-3">
              Content you upload (such as avatar images) remains your property. By uploading
              content you grant us a non-exclusive licence to store and display it within the
              application.
            </p>
          </section>

          <section className="bg-bg-dark-secondary border border-[var(--color-border-subtle)] rounded-lg p-6">
            <h2 className="text-2xl font-bold text-cyan-bright mb-4">7. Availability and Changes</h2>
            <div className="space-y-2 text-white">
              <p>
                We do not guarantee that Valinor will be available at all times. We reserve the right
                to:
              </p>
              <div className="flex gap-3 mt-3">
                <span className="text-cyan-bright font-bold mt-1">•</span>
                <span>Modify, suspend, or discontinue any part of the service at any time, with or without notice</span>
              </div>
              <div className="flex gap-3">
                <span className="text-cyan-bright font-bold mt-1">•</span>
                <span>Perform maintenance that may temporarily interrupt service</span>
              </div>
              <div className="flex gap-3">
                <span className="text-cyan-bright font-bold mt-1">•</span>
                <span>Reset leaderboard statistics in exceptional circumstances (e.g., discovery of widespread cheating)</span>
              </div>
            </div>
          </section>

          <section className="bg-bg-dark-secondary border border-[var(--color-border-subtle)] rounded-lg p-6">
            <h2 className="text-2xl font-bold text-cyan-bright mb-4">8. Disclaimers and Limitation of Liability</h2>
            <div className="space-y-3 text-white">
              <p>
                Valinor is provided <strong>"as is"</strong> and <strong>"as available"</strong>,
                without warranties of any kind, express or implied, including but not limited to
                merchantability, fitness for a particular purpose, or non-infringement.
              </p>
              <p>
                As a student project, we cannot guarantee continuous uptime, data durability, or
                bug-free operation. You use the service at your own risk.
              </p>
              <p>
                To the maximum extent permitted by applicable law, the project team shall not be
                liable for any indirect, incidental, special, consequential, or punitive damages
                arising from your use of or inability to use the service, including loss of data,
                game progress, or account access.
              </p>
            </div>
          </section>

          <section className="bg-bg-dark-secondary border border-[var(--color-border-subtle)] rounded-lg p-6">
            <h2 className="text-2xl font-bold text-cyan-bright mb-4">9. Privacy</h2>
            <p className="text-white leading-relaxed">
              Your use of Valinor is also governed by our{" "}
              <a href="/privacy" className="underline text-cyan-bright">
                Privacy Policy
              </a>
              , which is incorporated into these Terms by reference. By using the service, you
              consent to the data practices described in the Privacy Policy.
            </p>
          </section>

          <section className="bg-bg-dark-secondary border border-[var(--color-border-subtle)] rounded-lg p-6">
            <h2 className="text-2xl font-bold text-cyan-bright mb-4">10. Governing Law</h2>
            <p className="text-white leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of Finland,
              without regard to its conflict of law provisions, reflecting the location of School 42
              Helsinki where this project was developed.
            </p>
          </section>

          <section className="bg-bg-dark-secondary border border-[var(--color-border-subtle)] rounded-lg p-6">
            <h2 className="text-2xl font-bold text-cyan-bright mb-4">11. Contact</h2>
            <p className="text-white leading-relaxed">
              Questions about these Terms of Service can be directed to the project team via the{" "}
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
