"use client"

import Image from "next/image"
import { Download, User } from "lucide-react"
import { AchievementGallery } from "./AchievementGallery"

export interface AchievementCardData {
  id: string
  student_id: string
  student_name?: string
  title: string
  description?: string | null
  images?: string[]
  documents?: string[]
  created_at?: string
}

interface AchievementCardProps {
  achievement: AchievementCardData
  /** If true, show student name and photo placeholder; for public branch page */
  showStudent?: boolean
}

export function AchievementCard({ achievement, showStudent = true }: AchievementCardProps) {
  const images = achievement.images || []
  const documents = achievement.documents || []
  const shortDesc = achievement.description
    ? achievement.description.length > 120
      ? achievement.description.slice(0, 120) + "..."
      : achievement.description
    : ""

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden h-full flex flex-col transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
      {showStudent && (
        <div className="p-4 border-b border-gray-800 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-gray-400" />
          </div>
          <span className="font-medium text-white truncate">
            {achievement.student_name || "Student"}
          </span>
        </div>
      )}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-[#FFB70F] font-semibold text-lg mb-2">{achievement.title}</h3>
        {shortDesc && <p className="text-gray-400 text-sm leading-relaxed mb-4 flex-1">{shortDesc}</p>}
        {images.length > 0 && (
          <div className="mb-4">
            <AchievementGallery images={images} />
          </div>
        )}
        {documents.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-auto">
            {documents.map((url, i) => (
              <a
                key={i}
                href={url.startsWith("http") ? url : url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#FFB70F]/20 text-[#FFB70F] px-3 py-2 text-sm font-medium hover:bg-[#FFB70F]/30 transition-colors min-h-[48px]"
              >
                <Download className="w-4 h-4" />
                Certificate {documents.length > 1 ? i + 1 : ""}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
