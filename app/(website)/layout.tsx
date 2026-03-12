import { WebsiteFooter } from "@/components/website/WebsiteFooter"
import { LeadCaptureModal } from "@/components/website/LeadCaptureModal"

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <LeadCaptureModal />
      <WebsiteFooter />
    </>
  )
}
