"use client"

export type ShowcaseAchievementItem = {
  id?: string
  student_name?: string
  student_photo?: string | null
  achievement_title?: string
  description?: string | null
  image?: string | null
}

function resolveUploadUrl(url?: string | null): string {
  if (!url) return ""
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) return url
  return `/api/backend/uploads/${encodeURIComponent(url)}`
}

export function ShowcaseAchievementCard({ item }: { item: ShowcaseAchievementItem }) {
  const title = item.achievement_title || "Achievement"
  const desc = item.description?.trim() || ""
  const img = item.image ? resolveUploadUrl(item.image) : ""
  const studentPhoto = item.student_photo ? resolveUploadUrl(item.student_photo) : ""

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden h-full flex flex-col transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-[#FFB70F]/40">
      <div className="aspect-[4/3] bg-gray-800 relative">
        {img ? (
          <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 text-4xl">🏆</div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-2">
          {studentPhoto ? (
            <img
              src={studentPhoto}
              alt={item.student_name || ""}
              className="w-10 h-10 rounded-full object-cover border border-[#FFB70F]/30"
              loading="lazy"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-sm text-gray-400">
              👤
            </div>
          )}
          <span className="font-medium text-white truncate text-sm">{item.student_name || "Student"}</span>
        </div>
        <h3 className="text-[#FFB70F] font-bold text-base mb-2 line-clamp-2">{title}</h3>
        {desc ? <p className="text-gray-400 text-sm leading-relaxed line-clamp-4 flex-1">{desc}</p> : null}
      </div>
    </div>
  )
}
