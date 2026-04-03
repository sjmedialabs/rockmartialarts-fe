/** Strip obvious active content before dangerouslySetInnerHTML (client-only use). */

export function sanitizeRichHtmlClient(html: string): string {
  if (typeof window === "undefined" || !html?.trim()) return ""
  try {
    const el = document.createElement("div")
    el.innerHTML = html
    el.querySelectorAll("script, iframe, object, embed, link").forEach((n) => n.remove())
    el.querySelectorAll("*").forEach((node) => {
      for (const attr of [...node.attributes]) {
        const name = attr.name.toLowerCase()
        if (name.startsWith("on") || name === "style") node.removeAttribute(attr.name)
      }
    })
    return el.innerHTML
  } catch {
    return ""
  }
}
