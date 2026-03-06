import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Store | Rock Martial Arts Academy",
  description: "Quality training gear and equipment hand-picked by Rock Martial Arts. Uniforms, sparring gear, boxing, belts, weapons and accessories.",
}

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
