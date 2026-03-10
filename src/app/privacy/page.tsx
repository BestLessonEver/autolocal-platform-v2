import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | AutoLocal.ai',
  description: 'AutoLocal.ai privacy policy — how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-300">
      <div className="max-w-3xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-black text-white mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-12">Last updated: March 10, 2026</p>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Who We Are</h2>
            <p>AutoLocal.ai (&quot;AutoLocal,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is a product of Futureproof Music, Inc., a Texas corporation. We build custom websites for local businesses. Our website is located at <a href="https://autolocal.ai" className="text-indigo-400 hover:underline">https://autolocal.ai</a>.</p>
            <p className="mt-2">Contact: <a href="mailto:support@autolocal.ai" className="text-indigo-400 hover:underline">support@autolocal.ai</a></p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Information We Collect</h2>
            <p className="mb-2">We collect the following information when you use our services:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong className="text-white">Contact information:</strong> Name, email address, phone number</li>
              <li><strong className="text-white">Business information:</strong> Business name, address, hours, photos, and reviews (pulled from your public Google Business Profile)</li>
              <li><strong className="text-white">Payment information:</strong> Processed securely by Stripe. We do not store credit card numbers.</li>
              <li><strong className="text-white">Usage data:</strong> Pages visited, browser type, IP address, and other standard analytics</li>
              <li><strong className="text-white">Communications:</strong> Emails, SMS messages, and support conversations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>To build, deliver, and host your custom website</li>
              <li>To communicate with you about your website, account, and services</li>
              <li>To send transactional messages (e.g., &quot;your website is ready,&quot; payment confirmations)</li>
              <li>To send marketing communications (only with your explicit consent)</li>
              <li>To send SMS messages about your website status and updates (only with your explicit opt-in consent)</li>
              <li>To process payments via Stripe</li>
              <li>To improve our services and user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. SMS/Text Messaging</h2>
            <p className="mb-2">If you opt in to receive SMS messages from AutoLocal.ai:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>You will receive messages about your website status, updates, and promotional offers</li>
              <li>Message frequency varies but will not exceed 10 messages per month</li>
              <li>Message and data rates may apply depending on your carrier</li>
              <li>You can opt out at any time by replying <strong className="text-white">STOP</strong> to any message</li>
              <li>Reply <strong className="text-white">HELP</strong> for assistance or contact <a href="mailto:support@autolocal.ai" className="text-indigo-400 hover:underline">support@autolocal.ai</a></li>
              <li>Your phone number and consent will not be shared with third parties for marketing purposes</li>
              <li>Consent to receive SMS is not a condition of purchase</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. How We Share Your Information</h2>
            <p className="mb-2">We do not sell your personal information. We may share data with:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong className="text-white">Service providers:</strong> Stripe (payments), Twilio (SMS), Resend (email), Railway (hosting) — only as needed to provide our services</li>
              <li><strong className="text-white">Legal requirements:</strong> If required by law, court order, or government regulation</li>
            </ul>
            <p className="mt-2">We do not share your opt-in consent or phone number with any third parties for their own marketing purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Data Security</h2>
            <p>We use industry-standard security measures including SSL encryption, secure payment processing via Stripe, and access controls to protect your data. However, no method of transmission over the internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Data Retention</h2>
            <p>We retain your information for as long as your account is active or as needed to provide services. If you cancel your hosting, we retain basic records for up to 12 months for legal and accounting purposes, then delete them.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Your Rights</h2>
            <p className="mb-2">You have the right to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Access, correct, or delete your personal information</li>
              <li>Opt out of marketing communications at any time</li>
              <li>Opt out of SMS by replying STOP</li>
              <li>Request a copy of your data</li>
            </ul>
            <p className="mt-2">To exercise these rights, email <a href="mailto:support@autolocal.ai" className="text-indigo-400 hover:underline">support@autolocal.ai</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Cookies</h2>
            <p>We use essential cookies for site functionality and analytics cookies to understand how visitors use our site. You can disable cookies in your browser settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Children&apos;s Privacy</h2>
            <p>Our services are not directed to individuals under 18. We do not knowingly collect information from children.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. We will notify you of material changes by email or by posting a notice on our website.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">12. Contact Us</h2>
            <p>If you have questions about this privacy policy, contact us at:</p>
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
