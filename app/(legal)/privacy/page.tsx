import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | Job Foxy',
  description: 'How Job Foxy collects, uses, and protects your data.',
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Simple Navigation */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#1a1615] transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>
        </div>
      </nav>

      <main className="py-16 md:py-24 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <header className="mb-12 border-b border-gray-100 pb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#1a1615] mb-6 tracking-tight">
              Privacy Policy
            </h1>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
                Updated Jan 2, 2026
              </span>
            </div>
          </header>

          {/* Content */}
          <div className="blog-content prose prose-lg md:prose-xl max-w-none text-[#2d2d2d] 
            prose-headings:text-[#1a1615] prose-headings:font-bold prose-headings:tracking-tight
            prose-p:leading-8 prose-p:mb-6
            prose-strong:text-[#1a1615]
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline">
            
            <p className="lead text-xl text-gray-500 mb-10">
              At Job Foxy, we are committed to protecting your personal data and your privacy. This policy outlines our practices regarding information collection and use.
            </p>

            <h2>1. Information We Collect</h2>
            <p>We collect information that identifies, relates to, or could reasonably be linked, directly or indirectly, with a particular consumer or device.</p>
            
            <h3>Personal Data</h3>
            <ul>
              <li><strong>Contact Details:</strong> Name and email address provided during registration.</li>
              <li><strong>Payment Information:</strong> Handled securely via Stripe; we do not store credit card numbers.</li>
              <li><strong>Professional Profile:</strong> LinkedIn URLs or job titles you share with us.</li>
            </ul>

            <h3>User Content (AI Processing)</h3>
            <p>Our core service involves processing the professional documents and audio you provide:</p>
            <ul>
              <li><strong>Resumes & CVs:</strong> Used for skill gap analysis and JD matching.</li>
              <li><strong>Audio Data:</strong> Voice recordings from mock interviews are transcribed and analyzed for feedback.</li>
              <li><strong>Job Descriptions:</strong> Used to customize your preparation experience.</li>
            </ul>

            <h2>2. Use of AI Technologies</h2>
            <p>
              Job Foxy uses advanced AI models to provide feedback. Your data is processed by these models to generate insights but is <strong>never sold</strong> to third parties for their own marketing or model training purposes without your explicit consent.
            </p>

            <h2>3. Data Security & Retention</h2>
            <p>
              We utilize AES-256 encryption for data at rest and TLS 1.2+ for data in transit. We retain your data only as long as necessary to provide you with our services or as required by law.
            </p>

            <h2>4. Your Privacy Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal information at any time. You can manage most of these settings directly within your account dashboard.
            </p>

            <h2>5. Contact Support</h2>
            <p>
              For any privacy-related inquiries, please contact our Data Protection Officer at <a href="mailto:support@jobfoxy.com">support@jobfoxy.com</a>.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}