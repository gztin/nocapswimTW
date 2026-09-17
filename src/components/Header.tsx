import { Waves } from 'lucide-react'

interface HeaderProps {
  onReport: () => void
}

export function Header({ onReport }: HeaderProps) {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="免泳帽泳池首頁">
        <span className="brand-mark" aria-hidden="true">
          <Waves size={21} strokeWidth={2.3} />
        </span>
        <strong>免泳帽泳池</strong>
      </a>
      <button className="button button--outline" type="button" onClick={onReport}>
        ＋ 新增地點
      </button>
    </header>
  )
}
