"use client"

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[error-boundary]", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="bg-white rounded-xl p-10 max-w-md shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-3 text-gray-900">
          Something went wrong
        </h2>
        <p className="text-gray-500 mb-6 leading-relaxed">
          We encountered an unexpected error. Please try again or return to the homepage.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 bg-[#FFB70F] text-black rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
          <a
            href="/"
            className="px-5 py-2.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    </div>
  )
}
