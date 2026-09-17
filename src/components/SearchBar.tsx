import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <label className="search-field">
      <Search size={19} aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="搜尋飯店、縣市或地區"
        aria-label="搜尋飯店、縣市或地區"
      />
      {value && (
        <button
          className="icon-button icon-button--subtle"
          type="button"
          onClick={() => onChange('')}
          aria-label="清除搜尋"
        >
          <X size={17} />
        </button>
      )}
    </label>
  )
}
