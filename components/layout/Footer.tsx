"use client"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-gray-200 bg-white py-4 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-6 w-auto" />
          <span>&copy; {currentYear} Rock Martial Arts. All rights reserved.</span>
        </div>
        <span>Powered by Rock Martial Arts</span>
      </div>
    </footer>
  )
}
