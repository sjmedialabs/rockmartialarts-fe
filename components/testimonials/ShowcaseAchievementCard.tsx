"use client"

import { SafeImage, DEFAULT_IMAGE_PLACEHOLDER } from "@/components/ui/safe-image"

export type ShowcaseAchievementItem = {
  id?: string
  student_name?: string
  student_photo?: string | null
  achievement_title?: string
  description?: string | null
  image?: string | null
}

export function ShowcaseAchievementCard({ item }: { item: ShowcaseAchievementItem }) {
  const title = item.achievement_title || "Achievement"
  const desc = item.description?.trim() || ""

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden h-full flex flex-col transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-[#FFB70F]/40">
      <div className="aspect-[4/3] bg-gray-800 relative">
        <SafeImage
          src={item.image || DEFAULT_IMAGE_PLACEHOLDER}
          alt=""
          resolveUrl={Boolean(item.image)}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-2">
          <SafeImage
            src={item.student_photo || DEFAULT_IMAGE_PLACEHOLDER}
            alt={item.student_name || ""}
            resolveUrl={Boolean(item.student_photo)}
            className="w-10 h-10 rounded-full object-cover border border-[#FFB70F]/30"
            loading="lazy"
          />
          <span className="font-medium text-white truncate text-sm">{item.student_name || "Student"}</span>
        </div>
        <h3 className="text-[#FFB70F] font-bold text-base mb-2 line-clamp-2">{title}</h3>
        {desc ? <p className="text-gray-400 text-sm leading-relaxed line-clamp-4 flex-1">{desc}</p> : null}
      </div>
    </div>
  )
}
