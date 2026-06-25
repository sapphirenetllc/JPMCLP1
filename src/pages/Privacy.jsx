import { useState } from 'react';
import { Link } from 'react-router-dom';
import Brand from '../components/Brand';
import { useAuth } from '../context/AuthContext';
import TopNav from '../components/TopNav';

const TABS = ['Privacy Policy', 'Terms of Service', 'Cookie Notice'];

export default function Privacy() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="privacy-page page-enter">
      {isAuthenticated ? <TopNav /> : (
        <div style={{ padding:'16px 24px', borderBottom:'1px solid var(--gray-200)', background:'var(--white)' }}>
          <Brand />
        </div>
      )}

      <div className="privacy-hero">
        <h1>Legal & Privacy</h1>
        <p>Last updated: June 1, 2026 · JPMorgan Chase Bank, N.A.</p>
      </div>

      <div className="privacy-body">
        <div className="tab-row" role="tablist" aria-label="Legal document tabs">
          {TABS.map((t, i) => (
            <button
              key={t}
              className={`tab-btn${activeTab === i ? ' active' : ''}`}
              role="tab"
              aria-selected={activeTab === i}
              onClick={() => setActiveTab(i)}
            >
              {t}
            </button>
          ))}
        </div>

        <div role="tabpanel">
          {activeTab === 0 && <PrivacyPolicy />}
          {activeTab === 1 && <TermsOfService />}
          {activeTab === 2 && <CookieNotice />}
        </div>

        <div style={{ textAlign:'center', marginTop:48 }}>
          {isAuthenticated
            ? <Link to="/dashboard" className="link link-sm">← Back to Dashboard</Link>
            : <Link to="/signin"    className="link link-sm">← Back to Sign In</Link>
          }
        </div>
      </div>
    </div>
  );
}

function PrivacyPolicy() {
  return (
    <div className="prose">
      <h2>Privacy Policy</h2>
      <p>JPMorgan Chase Bank, N.A. ("JPMorgan Chase," "we," "us," or "our") is committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services or visit our website.</p>
      <h3>1. Information We Collect</h3>
      <p>We may collect information about you in a variety of ways, including:</p>
      <ul>
        <li><strong>Personal Data:</strong> Name, email address, telephone number, mailing address, and account credentials.</li>
        <li><strong>Financial Data:</strong> Payment card details, billing address, and transaction history (processed securely through our payment processors).</li>
        <li><strong>Usage Data:</strong> Data consumption metrics, device identifiers, IP addresses, and browsing behavior on our portal.</li>
        <li><strong>Communications:</strong> Records of your interactions with our customer support team.</li>
      </ul>
      <h3>2. How We Use Your Information</h3>
      <p>We use your information to provide and improve our services, process transactions, send billing and service notifications, respond to support inquiries, comply with legal obligations, and prevent fraud or abuse. We do not sell your personal information to third parties.</p>
      <h3>3. Disclosure of Your Information</h3>
      <p>We may share your information with service providers who assist in our operations (under strict confidentiality agreements), with regulatory authorities when required by law, and in connection with a merger, acquisition, or sale of assets.</p>
      <h3>4. Data Retention</h3>
      <p>We retain your personal data for as long as your account is active or as needed to provide services, comply with legal obligations, resolve disputes, and enforce our agreements. Upon account closure, we follow a structured data deletion schedule.</p>
      <h3>5. Your Rights</h3>
      <p>Depending on your jurisdiction, you may have the right to access, correct, or delete your personal information; to object to or restrict processing; and to data portability. To exercise these rights, contact us at privacy@chase.com.</p>
      <h3>6. Contact Us</h3>
      <p>If you have questions about this Privacy Policy, please contact our Privacy Office at <strong>privacy@chase.com</strong> or write to us at JPMorgan Chase Bank, N.A., 47 Maple Street, New York, NY 10005.</p>
    </div>
  );
}

function TermsOfService() {
  return (
    <div className="prose">
      <h2>Terms of Service</h2>
      <p>By accessing or using Chase's services, you agree to be bound by these Terms of Service. Please read them carefully. If you do not agree, you may not use our services.</p>
      <h3>1. Acceptance of Terms</h3>
      <p>These Terms constitute a legally binding agreement between you and JPMorgan Chase Bank, N.A. governing your use of our banking services, customer portal, and related products.</p>
      <h3>2. Eligibility</h3>
      <p>You must be at least 18 years of age to create an account. By creating an account you represent that you are of legal age and have the authority to enter into this agreement.</p>
      <h3>3. Account Responsibilities</h3>
      <ul>
        <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
        <li>You must notify us immediately of any unauthorized use of your account.</li>
        <li>You may not share your account with others or use another person's account.</li>
      </ul>
      <h3>4. Acceptable Use</h3>
      <p>You agree not to use our services for any unlawful purpose, to transmit harmful or malicious content, to interfere with network infrastructure, or to violate the rights of any third party.</p>
      <h3>5. Service Availability</h3>
      <p>We strive to maintain high availability of our services but do not guarantee uninterrupted service. We reserve the right to perform maintenance, which may result in temporary service interruptions.</p>
      <h3>6. Limitation of Liability</h3>
      <p>To the fullest extent permitted by law, JPMorgan Chase shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services.</p>
      <h3>7. Changes to Terms</h3>
      <p>We may update these Terms from time to time. Continued use of our services after any changes constitutes acceptance of the new Terms. We will provide notice of material changes via email or portal notification.</p>
    </div>
  );
}

function CookieNotice() {
  return (
    <div className="prose">
      <h2>Cookie Notice</h2>
      <p>Chase uses cookies and similar tracking technologies to enhance your experience on our portal. This notice explains what cookies we use and how you can control them.</p>
      <h3>What Are Cookies?</h3>
      <p>Cookies are small text files stored on your device by your web browser. They help us recognize you, remember your preferences, and understand how you interact with our portal.</p>
      <h3>Types of Cookies We Use</h3>
      <ul>
        <li><strong>Essential Cookies:</strong> Required for the portal to function. These cannot be disabled. Examples include session authentication tokens and CSRF protection cookies.</li>
        <li><strong>Functional Cookies:</strong> Remember your preferences such as language settings and form field inputs.</li>
        <li><strong>Analytics Cookies:</strong> Help us understand aggregate usage patterns to improve our services. We use privacy-respecting analytics that do not track individuals across third-party sites.</li>
        <li><strong>Security Cookies:</strong> Detect and prevent fraudulent activity, such as multiple failed login attempts.</li>
      </ul>
      <h3>Your Choices</h3>
      <p>You can control non-essential cookies through your browser settings or our cookie preference center (accessible from the portal footer). Note that disabling certain cookies may affect the functionality of the portal.</p>
      <h3>Third-Party Cookies</h3>
      <p>We do not permit third-party advertising cookies on our customer portal. Any third-party integrations we use (such as payment processors) operate under their own privacy and cookie policies.</p>
      <h3>Updates to This Notice</h3>
      <p>We may update this Cookie Notice as our practices evolve or as required by applicable law. We encourage you to review this notice periodically.</p>
    </div>
  );
}
