import { List, Map } from 'lucide-react'
import type { ViewMode } from '../types/location'

interface ViewSwitcherProps {
  value: ViewMode
  onChange: (view: ViewMode) => void
}

export function ViewSwitcher({ value, onChange }: ViewSwitcherProps) {
  return (
    <div className="view-switcher" role="group" aria-label="切換檢視模式">
      <button
        className={value === 'list' ? 'is-active' : ''}
        type="button"
        onClick={() => onChange('list')}
        aria-pressed={value === 'list'}
      >
        <List size={17} aria-hidden="true" />
        清單
      </button>
      <button
        className={value === 'map' ? 'is-active' : ''}
        type="button"
        onClick={() => onChange('map')}
        aria-pressed={value === 'map'}
      >
        <Map size={17} aria-hidden="true" />
        地圖
      </button>
    </div>
  )
}
