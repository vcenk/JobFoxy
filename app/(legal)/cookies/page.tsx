import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Cookie Policy | Job Foxy',
  description: 'How Job Foxy uses cookies to improve your experience.',
}

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
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
          <header className="mb-12 border-b border-gray-100 pb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#1a1615] mb-6 tracking-tight">
              Cookie Policy
            </h1>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
              Updated Jan 2, 2026
            </span>
          </header>

          <div className="blog-content prose prose-lg md:prose-xl max-w-none text-[#2d2d2d] 
            prose-headings:text-[#1a1615] prose-headings:font-bold prose-headings:tracking-tight
            prose-p:leading-8 prose-p:mb-6
            prose-strong:text-[#1a1615]
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline">
            
            <p className="lead text-xl text-gray-500 mb-10">
              This policy explains how we use cookies and similar technologies to enhance your experience on Job Foxy.
            </p>

            <h2>What are Cookies?</h2>
            <p>Cookies are small text files stored on your device that help us remember your preferences and understand how you use our platform.</p>

            <h2>How We Use Them</h2>
            <ul>
              <li><strong>Essential:</strong> Keeping you logged in and securing your data.</li>
              <li><strong>Performance:</strong> Analyzing which features are most popular so we can improve them.</li>
              <li><strong>Functional:</strong> Remembering your theme settings or language preferences.</li>
            </ul>

            <h2>Third-Party Cookies</h2>
            <p>
              We use trusted third-party services like Google Analytics to help us analyze site traffic. These partners may set their own cookies according to their respective privacy policies.
            </p>

            <h2>Managing Preferences</h2>
            <p>
              You can control or disable cookies through your browser settings at any time. Note that disabling essential cookies may prevent parts of the site from functioning correctly.
            </p>

            <h2>Questions?</h2>
            <p>
              Reach out to us at <a href="mailto:support@jobfoxy.com">support@jobfoxy.com</a> if you have any questions about our use of technologies.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}