import { useEffect } from 'react'
import posthog from 'posthog-js'

export function PostHogProvider({ children }) {
  useEffect(() => {
    const posthogKey = import.meta.env.VITE_POSTHOG_KEY
    const posthogHost = import.meta.env.VITE_POSTHOG_HOST

    if (posthogKey && posthogHost) {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        person_profiles: 'identified_only',
        capture_pageview: true,
        capture_pageleave: true,
        loaded: (posthog) => {
          if (import.meta.env.DEV) {
            console.log('PostHog initialized')
          }
        }
      })
    } else {
      console.warn('PostHog keys not found in environment variables')
    }

    return () => {
      posthog.reset()
    }
  }, [])

  return children
}

export { posthog }
