import { posthog } from '../providers/PostHogProvider'

/**
 * Hook để sử dụng PostHog trong các component
 * @returns {Object} PostHog instance và helper functions
 */
export function usePostHog() {
  const captureEvent = (eventName, properties = {}) => {
    if (posthog) {
      posthog.capture(eventName, properties)
    }
  }

  const identifyUser = (userId, userProperties = {}) => {
    if (posthog) {
      posthog.identify(userId, userProperties)
    }
  }

  const resetUser = () => {
    if (posthog) {
      posthog.reset()
    }
  }

  const setUserProperties = (properties) => {
    if (posthog) {
      posthog.people.set(properties)
    }
  }

  return {
    posthog,
    captureEvent,
    identifyUser,
    resetUser,
    setUserProperties
  }
}
