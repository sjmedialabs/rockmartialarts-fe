"use client"

import { useEffect } from "react"

/**
 * After a one-way step (e.g. payment success), block browser Back from returning
 * to checkout. Replaces the current history entry and intercepts popstate.
 */
export function usePreventBackNavigation(enabled = true) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return

    const url = window.location.href
    window.history.replaceState({ paymentComplete: true }, "", url)
    window.history.pushState({ paymentComplete: true }, "", url)

    const onPopState = () => {
      window.history.pushState({ paymentComplete: true }, "", url)
    }

    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [enabled])
}
