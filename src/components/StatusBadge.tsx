import type { CapPolicy } from '../types/location'
import { CAP_POLICY_LABELS } from '../types/location'

interface StatusBadgeProps {
  policy: CapPolicy
}

export function StatusBadge({ policy }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-badge--${policy}`}>
      <span className="status-dot" aria-hidden="true" />
      {CAP_POLICY_LABELS[policy]}
    </span>
  )
}
