import { Metadata } from 'next'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'

export const metadata: Metadata = {
  title: 'Contact — AutoLocal.ai',
  description: 'Get in touch with AutoLocal.ai. Free consultation for local businesses ready to grow with AI.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-navy-950">
      <MarketingNav />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-indigo-500/10" />
        <div className="relative max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Let&apos;s Grow Your Business</h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">Book a free consultation and we&apos;ll show you exactly how AI can help your local business get more customers.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <form action="https://formspree.io/f/xlgwjnok" method="POST" className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                <input type="text" name="name" required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <input type="email" name="email" required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition" placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Business Name</label>
                <input type="text" name="business" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition" placeholder="Your business" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">What are you interested in?</label>
                <select name="service" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition">
                  <option value="">Select a service</option>
                  <option>AI Chatbots</option>
                  <option>Social Media Management</option>
                  <option>SEO &amp; Local Search</option>
                  <option>Review Management</option>
                  <option>Appointment Booking</option>
                  <option>Custom AI Solutions</option>
                  <option>Not sure — help me decide</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
                <textarea name="message" rows={4} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition" placeholder="Tell us about your business and goals..." />
              </div>
              <button type="submit" className="w-full btn-gradient px-8 py-4 rounded-xl font-semibold text-white">Send Message</button>
            </form>

            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Email</h3>
                <p className="text-slate-400">brian@autolocal.ai</p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Phone</h3>
                <p className="text-slate-400">(346) 341-0836</p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">What to Expect</h3>
                <ul className="space-y-3 text-slate-400 text-sm">
                  <li className="flex items-start gap-2"><span className="text-cyan-400 mt-0.5">✓</span>Free 15-minute consultation</li>
                  <li className="flex items-start gap-2"><span className="text-cyan-400 mt-0.5">✓</span>Custom AI strategy for your business</li>
                  <li className="flex items-start gap-2"><span className="text-cyan-400 mt-0.5">✓</span>No contracts or commitments</li>
                  <li className="flex items-start gap-2"><span className="text-cyan-400 mt-0.5">✓</span>Response within 24 hours</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
