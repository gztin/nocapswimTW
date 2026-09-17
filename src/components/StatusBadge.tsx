import { AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react'
import type { CapPolicy } from '../types/location'
import { CAP_POLICY_LABELS } from '../types/location'

interface StatusBadgeProps {
  policy: CapPolicy
  compact?: boolean
}

const icons = {
  'not-required': CheckCircle2,
  conditional: AlertCircle,
  unknown: HelpCircle,
}

export function StatusBadge({ policy, compact = false }: StatusBadgeProps) {
  const Icon = icons[policy]
  return (
    <span className={`status-badge status-badge--${policy} ${compact ? 'is-compact' : ''}`}>
      <Icon size={compact ? 14 : 16} aria-hidden="true" />
      {CAP_POLICY_LABELS[policy]}
    </span>
  )
}
