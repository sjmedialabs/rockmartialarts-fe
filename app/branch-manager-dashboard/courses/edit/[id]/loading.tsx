import Header from "@/components/layout/Header"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Edit Course" role="branch_admin" />
      <main className="w-full p-4 lg:px-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading course data...</p>
          </div>
        </div>
      </main>
    </div>
  )
}
