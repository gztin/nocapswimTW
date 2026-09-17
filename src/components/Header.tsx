import { Waves } from 'lucide-react'

interface HeaderProps {
  onReport: () => void
}

export function Header({ onReport }: HeaderProps) {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="免泳帽泳池地圖首頁">
        <span className="brand-mark" aria-hidden="true">
          <Waves size={21} strokeWidth={2.3} />
        </span>
        <span>
          <strong>免泳帽泳池地圖</strong>
          <small>No Cap Swim TW</small>
        </span>
      </a>
      <button className="button button--outline" type="button" onClick={onReport}>
        回報地點
      </button>
    </header>
  )
}
