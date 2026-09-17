import { Check, Copy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface CopyButtonProps {
  value: string
  label: string
}

function fallbackCopy(value: string) {
  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  textarea.remove()
  if (!copied) throw new Error('copy failed')
}

export function CopyButton({ value, label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const [failed, setFailed] = useState(false)
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (resetTimer.current) window.clearTimeout(resetTimer.current)
  }, [])

  const handleCopy = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setFailed(false)

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value)
      } else {
        fallbackCopy(value)
      }
      setCopied(true)
      if (resetTimer.current) window.clearTimeout(resetTimer.current)
      resetTimer.current = window.setTimeout(() => setCopied(false), 1800)
    } catch {
      try {
        fallbackCopy(value)
        setCopied(true)
        if (resetTimer.current) window.clearTimeout(resetTimer.current)
        resetTimer.current = window.setTimeout(() => setCopied(false), 1800)
      } catch {
        setCopied(false)
        setFailed(true)
      }
    }
  }

  return (
    <span className="copy-control">
      <button
        className={`copy-button${copied ? ' is-copied' : ''}`}
        type="button"
        onClick={handleCopy}
        aria-label={copied ? `${label}，已複製` : label}
        title={copied ? '已複製' : label}
      >
        {copied ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}
      </button>
      {copied && <span className="copy-feedback" role="status">已複製</span>}
      {failed && <span className="copy-feedback copy-feedback--error" role="status">無法複製</span>}
    </span>
  )
}
