import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions | AutoLocal.ai',
  description: 'AutoLocal.ai terms and conditions of service.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-300">
      <div className="max-w-3xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-black text-white mb-2">Terms &amp; Conditions</h1>
        <p className="text-gray-500 mb-12">Last updated: March 10, 2026</p>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Agreement to Terms</h2>
            <p>By accessing or using AutoLocal.ai (&quot;Service&quot;), operated by Futureproof Music, Inc. (&quot;Company,&quot; &quot;we,&quot; &quot;us&quot;), you agree to be bound by these Terms &amp; Conditions. If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Description of Service</h2>
            <p>AutoLocal.ai provides automated custom website creation and hosting for local businesses. We pull publicly available information from Google Business Profiles (reviews, photos, hours) to generate website previews. You may also submit your own content manually.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Pricing &amp; Payments</h2>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Website creation is free</li>
              <li>Hosting is $9/month, billed monthly via Stripe</li>
              <li>First month is free — no credit card required for preview</li>
              <li>Premium features are available for a one-time $99 fee</li>
              <li>You may cancel hosting at any time with no cancellation fee</li>
              <li>Refunds are handled on a case-by-case basis — contact <a href="mailto:support@autolocal.ai" className="text-indigo-400 hover:underline">support@autolocal.ai</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Your Content</h2>
            <p>You retain ownership of all content you provide (photos, text, logos). By submitting content, you grant us a license to display it on your website. We may use publicly available Google Business Profile data (reviews, photos, hours) that is already visible to the public.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Hosting &amp; Uptime</h2>
            <p>We aim for 99.9% uptime but do not guarantee uninterrupted service. We are not liable for downtime caused by third-party providers, scheduled maintenance, or circumstances beyond our control.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Cancellation</h2>
            <p>You may cancel your hosting subscription at any time. Upon cancellation:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Your website will remain active until the end of your current billing period</li>
              <li>After that, your website will be taken offline</li>
              <li>We retain your site data for 30 days in case you want to reactivate</li>
              <li>After 30 days, all data is permanently deleted</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. SMS/Text Messaging Program</h2>
            <p className="mb-2">By opting in to receive SMS messages from AutoLocal.ai, you agree to the following:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong className="text-white">Program name:</strong> AutoLocal.ai Website Updates</li>
              <li><strong className="text-white">Program description:</strong> Receive text messages about your website status, updates, reminders, and occasional promotional offers from AutoLocal.ai</li>
              <li><strong className="text-white">Message frequency:</strong> Message frequency varies. No more than 10 messages per month.</li>
              <li><strong className="text-white">Message and data rates may apply.</strong> Check with your carrier for details.</li>
              <li><strong className="text-white">Opt-out:</strong> Reply <strong className="text-white">STOP</strong> at any time to unsubscribe from SMS messages</li>
              <li><strong className="text-white">Help:</strong> Reply <strong className="text-white">HELP</strong> for help, or contact <a href="mailto:support@autolocal.ai" className="text-indigo-400 hover:underline">support@autolocal.ai</a></li>
              <li>Consent to receive SMS messages is not a condition of purchase or use of our services</li>
              <li>Your phone number and consent will not be shared with any third parties for their marketing purposes</li>
            </ul>
            <p className="mt-2">Supported carriers include but are not limited to: AT&amp;T, T-Mobile, Verizon, Sprint, and all major US carriers.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Acceptable Use</h2>
            <p className="mb-2">You agree not to use AutoLocal.ai to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Create websites for illegal businesses or activities</li>
              <li>Display content that is defamatory, obscene, or infringes on others&apos; rights</li>
              <li>Impersonate another business or person</li>
              <li>Engage in spam, phishing, or other malicious activities</li>
            </ul>
            <p className="mt-2">We reserve the right to suspend or terminate any website that violates these terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, AutoLocal.ai and Futureproof Music, Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business opportunities arising from your use of the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Intellectual Property</h2>
            <p>The AutoLocal.ai platform, design templates, code, and branding are the property of Futureproof Music, Inc. You may not copy, modify, or distribute our platform or templates without permission.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Changes to Terms</h2>
            <p>We may update these terms from time to time. Continued use of the Service after changes constitutes acceptance of the new terms. We will notify you of material changes by email.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">12. Governing Law</h2>
            <p>These terms are governed by the laws of the State of Texas. Any disputes shall be resolved in the courts of Galveston County, Texas.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">13. Contact</h2>
            <p>Questions about these terms? Contact us at:</p>
            <p className="mt-2">
              Futureproof Music, Inc.<br />
              Email: <a href="mailto:support@autolocal.ai" className="text-indigo-400 hover:underline">support@autolocal.ai</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
