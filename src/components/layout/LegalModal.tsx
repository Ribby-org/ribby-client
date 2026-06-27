import { X } from 'lucide-react';

type LegalType = 'privacy' | 'terms';

interface LegalModalProps {
  type: LegalType;
  onClose: () => void;
}

const CONTENT = {
  privacy: {
    title: 'Privacy Policy',
    updated: 'Last updated: June 28, 2026',
    sections: [
      {
        heading: '1. Information We Collect',
        body: `Ribby collects information you provide when creating an account (email address, name), information from GitHub OAuth when you connect your repositories (username, repository metadata), and scan results generated when you test URLs or repositories. We do not collect or store the content of the websites you scan beyond what is needed to generate findings.`
      },
      {
        heading: '2. How We Use Your Information',
        body: `We use your information to provide and improve Ribby's scanning services, authenticate your identity, associate scan results and bug reports with your organization, and send you notifications you have opted into. We do not sell your personal data to third parties.`
      },
      {
        heading: '3. Data Storage',
        body: `Your data is stored securely using Supabase infrastructure. Scan results, bug reports, and organization data are stored in encrypted databases. GitHub tokens are used only during active sessions and are not persisted to our database.`
      },
      {
        heading: '4. Third-Party Services',
        body: `Ribby uses GitHub OAuth for authentication and repository access. When you connect GitHub, you are subject to GitHub's Privacy Policy. Scan results may involve fetching publicly accessible URLs — no authentication credentials are sent to target URLs.`
      },
      {
        heading: '5. Data Retention',
        body: `We retain your account data for as long as your account is active. Scan history and bug reports are retained until you delete them or close your account. You may request deletion of your data at any time by contacting us.`
      },
      {
        heading: '6. Security',
        body: `We implement industry-standard security measures including encrypted data transmission (HTTPS), row-level security on all database tables, and API authentication. However, no method of transmission over the Internet is 100% secure.`
      },
      {
        heading: '7. Contact',
        body: `For privacy-related questions, please contact us at privacy@ribby.dev.`
      }
    ]
  },
  terms: {
    title: 'Terms & Conditions',
    updated: 'Last updated: June 28, 2026',
    sections: [
      {
        heading: '1. Acceptance of Terms',
        body: `By accessing or using Ribby, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our service.`
      },
      {
        heading: '2. Use of Service',
        body: `Ribby provides web application and repository scanning tools for security, performance, and quality assurance purposes. You agree to use Ribby only to scan URLs and repositories that you own or have explicit permission to test. Scanning third-party applications without authorization may violate applicable laws.`
      },
      {
        heading: '3. Prohibited Activities',
        body: `You must not use Ribby to scan systems without authorization, attempt to disrupt or overload target servers, circumvent security measures, use results to conduct attacks, or resell access to the platform without written permission.`
      },
      {
        heading: '4. Accounts and Organizations',
        body: `You are responsible for maintaining the security of your account credentials. Each account may create up to 20 organizations. You must not share account access with unauthorized parties. We reserve the right to suspend accounts that violate these terms.`
      },
      {
        heading: '5. Scan Results',
        body: `Scan results provided by Ribby are for informational purposes only. Ribby does not guarantee the completeness or accuracy of scan findings. You are solely responsible for decisions made based on scan results. Ribby is not liable for any damages resulting from the use or misuse of scan data.`
      },
      {
        heading: '6. Intellectual Property',
        body: `Ribby and its original content, features, and functionality are owned by the Ribby team and are protected by applicable intellectual property laws. You retain ownership of any data you submit to the platform.`
      },
      {
        heading: '7. Limitation of Liability',
        body: `Ribby is provided "as is" without warranties of any kind. To the maximum extent permitted by law, Ribby shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service.`
      },
      {
        heading: '8. Changes to Terms',
        body: `We reserve the right to modify these terms at any time. Continued use of Ribby after changes constitutes acceptance of the new terms. We will notify users of significant changes via email.`
      },
      {
        heading: '9. Contact',
        body: `For questions about these Terms, please contact us at legal@ribby.dev.`
      }
    ]
  }
};

export default function LegalModal({ type, onClose }: LegalModalProps) {
  const content = CONTENT[type];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}>
      <div
        className="w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col"
        style={{ backgroundColor: '#1d1a2b', border: '1px solid #2e2a42', maxHeight: '85vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid #2e2a42' }}>
          <div>
            <h2 className="text-base font-semibold" style={{ color: '#ede9ff' }}>{content.title}</h2>
            <p className="text-[11px] mt-0.5" style={{ color: '#6b6880' }}>{content.updated}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: '#6b6880' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#ede9ff'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#6b6880'; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-6 py-5 space-y-5">
          {content.sections.map(({ heading, body }) => (
            <div key={heading}>
              <h3 className="text-sm font-semibold mb-1.5" style={{ color: '#ede9ff' }}>{heading}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#9390aa' }}>{body}</p>
            </div>
          ))}
          <div className="h-2" />
        </div>
      </div>
    </div>
  );
}
