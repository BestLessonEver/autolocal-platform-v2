import Link from 'next/link'

export default function PreviewNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Preview Not Found</h1>
        <p className="text-gray-600 mb-8">
          This website preview may have expired or doesn&apos;t exist yet.
          Want a custom preview for your business?
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="https://autolocal.ai"
            className="px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition"
          >
            Get Your Free Preview
          </Link>
          <Link
            href="https://autolocal.ai/contact"
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}
