import { redirect } from "next/navigation"

/**
 * Legacy /branches URL — branch list is now on Contact page.
 * Branch detail is at /branches/[slug] (slug = branch id).
 */
export default function BranchesPage() {
  redirect("/contact")
}
