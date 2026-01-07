import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service | Job Foxy',
  description: 'The rules and regulations for using Job Foxy.',
}

export default function TermsOfService() {
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
              Terms of Service
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
              Welcome to Job Foxy. By using our platform, you agree to comply with the following terms and conditions.
            </p>

            <h2>1. Account Registration</h2>
            <p>To access certain features, you must create an account. You are responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account.</p>

            <h2>2. Permitted Use</h2>
            <p>Job Foxy grants you a personal, non-transferable license to use our AI coaching tools for individual career preparation. Commercial redistribution or automated scraping of our tools is strictly prohibited.</p>

            <h2>3. AI Disclaimer</h2>
            <p>
              Our AI provides feedback based on patterns and data. While highly accurate, we do not guarantee specific employment outcomes. Job Foxy is a tool to assist your preparation, not a replacement for human judgment or professional career advice.
            </p>

            <h2>4. Payments & Subscriptions</h2>
            <p>
              Subscription fees are billed in advance. You can cancel at any time via your account settings. Access will remain active until the end of your paid billing cycle.
            </p>

            <h2>5. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account if you violate these terms, specifically regarding the misuse of our AI systems or harassment within the community.
            </p>

            <h2>6. Limitation of Liability</h2>
            <p>
              Job Foxy shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use the service.
            </p>

            <div className="mt-12 p-8 bg-gray-50 rounded-2xl border border-gray-100 italic">
              "Our goal is to help you succeed. These terms are designed to ensure a fair and safe environment for all job seekers."
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}