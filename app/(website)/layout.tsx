import { WebsiteFooter } from "@/components/website/WebsiteFooter"
import { LeadCaptureModal } from "@/components/website/LeadCaptureModal"
import { WebsitePageLoader } from "@/components/website/WebsitePageLoader"

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <WebsitePageLoader />
      {children}
      <LeadCaptureModal />
      <WebsiteFooter />
    </>
  )
}
