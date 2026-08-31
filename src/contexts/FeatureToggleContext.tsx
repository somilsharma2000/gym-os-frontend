import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { api, apiCall } from '../api/client'
import { DEMO_MODE } from '../data/demoData'

// --- Types ---

export type FeatureCategoryKey =
  | 'core'
  | 'growth'
  | 'communication'
  | 'commerce'
  | 'membership'
  | 'member_portal'
  | 'platform'

export interface FeatureCategoryDef {
  name: string
  description?: string
  alwaysOn?: boolean
  features: string[]
}

export type PlanTier = 'starter' | 'standard' | 'premium'

export interface FeatureToggleContextValue {
  features: Record<string, boolean>
  isEnabled: (key: string) => boolean
  plan: string
  loading: boolean
  refresh: () => void
}

// --- 1. Category Groupings & Feature Definitions ---

export const FEATURE_CATEGORIES: Record<FeatureCategoryKey, FeatureCategoryDef> = {
  core: {
    name: 'Core',
    description: 'Essential core platform features (always enabled)',
    alwaysOn: true,
    features: [
      'command_center',
      'members',
      'memberships',
      'qr_checkin',
      'payments',
      'lead_crm',
      'staff',
    ],
  },
  growth: {
    name: 'Growth',
    description: 'Lead conversion, retention, and growth features',
    features: [
      'trial_engine',
      'renewals',
      'at_risk',
      'referrals',
      'revenue_analytics',
      'diet_plans',
      'workout_plans',
      'body_measurement',
      'activities',
    ],
  },
  communication: {
    name: 'Communication',
    description: 'Automations, broadcasts, SMS, and email',
    features: [
      'whatsapp_automations',
      'whatsapp_broadcast',
      'sms',
      'email',
    ],
  },
  commerce: {
    name: 'Commerce',
    description: 'POS, dues tracking, supplier management, and billing',
    features: [
      'pos',
      'member_dues',
      'supplier_management',
      'purchase_sale',
      'invoice_generation',
    ],
  },
  membership: {
    name: 'Membership',
    description: 'Freezes, group classes, and biometric attendance',
    features: [
      'membership_freeze',
      'classes',
      'biometric_attendance',
    ],
  },
  member_portal: {
    name: 'Member Portal',
    description: 'Member login and self-service portal',
    features: [
      'member_login',
    ],
  },
  platform: {
    name: 'Platform',
    description: 'Integrations, settings, multi-currency, multi-language, and data backup',
    features: [
      'integrations',
      'settings',
      'multi_currency',
      'multi_language',
      'data_backup',
    ],
  },
}

export const CORE_FEATURES: string[] = FEATURE_CATEGORIES.core.features

export const ALL_FEATURES: string[] = Object.values(FEATURE_CATEGORIES).flatMap(
  (cat) => cat.features
)

// --- 2. Plan Presets ---

export const STARTER_FEATURES: string[] = [
  ...CORE_FEATURES,
  'trial_engine',
  'renewals',
  'at_risk',
  'whatsapp_broadcast',
  'classes',
  'membership_freeze',
  'settings',
]

export const STANDARD_FEATURES: string[] = [
  ...STARTER_FEATURES,
  'whatsapp_automations',
  'revenue_analytics',
  'diet_plans',
  'workout_plans',
  'body_measurement',
  'member_dues',
  'invoice_generation',
  'referrals',
  'integrations',
  'activities',
  'multi_currency',
]

export const PREMIUM_FEATURES: string[] = [
  ...STANDARD_FEATURES,
  'pos',
  'supplier_management',
  'purchase_sale',
  'sms',
  'email',
  'member_login',
  'multi_language',
  'data_backup',
  'biometric_attendance',
]

export function buildFeatureMap(
  enabledKeys: string[],
  customOverrides?: Record<string, boolean>
): Record<string, boolean> {
  const map: Record<string, boolean> = {}

  ALL_FEATURES.forEach((key) => {
    map[key] = enabledKeys.includes(key)
  })

  if (customOverrides) {
    Object.keys(customOverrides).forEach((key) => {
      map[key] = Boolean(customOverrides[key])
    })
  }

  // Core features are ALWAYS true (cannot be disabled)
  CORE_FEATURES.forEach((key) => {
    map[key] = true
  })

  return map
}

export const PLAN_PRESETS: Record<PlanTier, Record<string, boolean>> = {
  starter: buildFeatureMap(STARTER_FEATURES),
  standard: buildFeatureMap(STANDARD_FEATURES),
  premium: buildFeatureMap(PREMIUM_FEATURES),
}

export function getPresetFeatures(
  planName: string,
  customOverrides?: Record<string, boolean>
): Record<string, boolean> {
  const p = (planName || '').toLowerCase()
  let baseKeys = STANDARD_FEATURES
  if (p === 'starter') {
    baseKeys = STARTER_FEATURES
  } else if (p === 'premium') {
    baseKeys = PREMIUM_FEATURES
  }
  return buildFeatureMap(baseKeys, customOverrides)
}

// --- 3. Context & Provider ---

const FeatureToggleContext = createContext<FeatureToggleContextValue | undefined>(undefined)

export function FeatureToggleProvider({ children }: { children: ReactNode }) {
  const [features, setFeatures] = useState<Record<string, boolean>>(PLAN_PRESETS.standard)
  const [plan, setPlan] = useState<string>('standard')
  const [loading, setLoading] = useState<boolean>(true)

  const fetchFeatureToggles = useCallback(async () => {
    setLoading(true)

    // Demo Mode -> Return 'premium' plan with all features enabled
    if (DEMO_MODE) {
      setPlan('premium')
      setFeatures(PLAN_PRESETS.premium)
      setLoading(false)
      return
    }

    try {
      let response: any = null
      if (typeof api.getFeatureToggles === 'function') {
        response = await api.getFeatureToggles()
      } else {
        response = await apiCall('getFeatureToggles')
      }

      if (response) {
        let record = response
        if (response.feature_toggle) {
          record = response.feature_toggle
        } else if (Array.isArray(response.data) && response.data.length > 0) {
          record = response.data[0]
        } else if (Array.isArray(response) && response.length > 0) {
          record = response[0]
        }

        if (record && (record.plan || record.features || record.custom_features)) {
          const fetchedPlan = (record.plan || 'standard').toLowerCase()
          const customOverrides = record.features || record.custom_features
          setPlan(fetchedPlan)
          setFeatures(getPresetFeatures(fetchedPlan, customOverrides))
        } else {
          // No FeatureToggle record exists for the gym -> default to 'standard' plan
          setPlan('standard')
          setFeatures(PLAN_PRESETS.standard)
        }
      } else {
        // No response data -> default to 'standard' plan
        setPlan('standard')
        setFeatures(PLAN_PRESETS.standard)
      }
    } catch (err) {
      // If API call fails, default to standard plan features
      console.warn('FeatureToggle fetch failed, defaulting to standard plan:', err)
      setPlan('standard')
      setFeatures(PLAN_PRESETS.standard)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFeatureToggles()
  }, [fetchFeatureToggles])

  const isEnabled = useCallback(
    (key: string): boolean => {
      // Core features always return true
      if (CORE_FEATURES.includes(key)) {
        return true
      }
      return Boolean(features[key])
    },
    [features]
  )

  const refresh = useCallback(() => {
    fetchFeatureToggles()
  }, [fetchFeatureToggles])

  return (
    <FeatureToggleContext.Provider
      value={{
        features,
        isEnabled,
        plan,
        loading,
        refresh,
      }}
    >
      {children}
    </FeatureToggleContext.Provider>
  )
}

export function useFeatureToggle(): FeatureToggleContextValue {
  const context = useContext(FeatureToggleContext)
  if (!context) {
    throw new Error('useFeatureToggle must be used within a FeatureToggleProvider')
  }
  return context
}
