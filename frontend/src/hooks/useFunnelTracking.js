import { useState, useCallback } from 'react'

export const useFunnelTracking = (funnelId = '', steps = []) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  const trackEvent = useCallback((eventName, data = {}) => {
    if (!funnelId) return
    console.log('[Funnel Event]', eventName, data)
  }, [funnelId])

  return {
    currentStep: steps[currentStepIndex] || null,
    currentStepIndex,
    trackEvent,
    isComplete: false
  }
}

export default useFunnelTracking
