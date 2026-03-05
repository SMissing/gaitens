import { requireManager } from '@/lib/auth'

export default async function MeetingsPage() {
  await requireManager()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Meetings</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Meeting management coming soon...</p>
        </div>
      </div>
    </div>
  )
}
