import { WebsiteFooter } from "@/components/website/WebsiteFooter"

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <WebsiteFooter />
    </>
  )
}
