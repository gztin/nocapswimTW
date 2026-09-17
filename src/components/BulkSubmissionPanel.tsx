import type { RefObject } from 'react'
import { useState } from 'react'
import type { BulkSubmissionPayload } from '../types/submission'
import {
  ImportFormatError,
  MAX_IMPORT_FILE_BYTES,
  MAX_IMPORT_ROWS,
  parseImportFile,
  type ImportPreview,
} from '../utils/importLocations'

interface BulkSubmissionPanelProps {
  turnstileSiteKey?: string
  turnstileRef: RefObject<HTMLDivElement | null>
  turnstileToken: string | null
  turnstileLoadError: boolean
  submitting: boolean
  submitError: string | null
  onSubmit: (payload: BulkSubmissionPayload) => Promise<void>
}

function formatFileSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(0)} MB`
}

export function BulkSubmissionPanel({
  turnstileSiteKey,
  turnstileRef,
  turnstileToken,
  turnstileLoadError,
  submitting,
  submitError,
  onSubmit,
}: BulkSubmissionPanelProps) {
  const [fileName, setFileName] = useState<string | null>(null)
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const selectFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]
    setFileName(file?.name ?? null)
    setPreview(null)
    setFileError(null)
    setFormError(null)
    if (!file) return
    if (file.size > MAX_IMPORT_FILE_BYTES) {
      setFileError(`檔案大小不可超過 ${formatFileSize(MAX_IMPORT_FILE_BYTES)}。`)
      return
    }

    try {
      setPreview(parseImportFile(file.name, await file.text()))
    } catch (error) {
      setFileError(error instanceof ImportFormatError ? error.message : '檔案讀取失敗，請確認檔案格式。')
    }
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    if (!preview || preview.errors.length || !preview.items.length) {
      setFormError('請先上傳沒有格式錯誤的檔案。')
      return
    }
    if (turnstileSiteKey && !turnstileToken) {
      setFormError('請先完成安全驗證後再送出。')
      return
    }

    const form = new FormData(event.currentTarget)
    await onSubmit({
      items: preview.items,
      nickname: String(form.get('bulk-nickname') ?? '').trim() || null,
      email: String(form.get('bulk-email') ?? '').trim() || null,
      turnstileToken,
    })
  }

  return (
    <form className="report-form bulk-import-form" onSubmit={submit}>
      <section className="import-guide" aria-labelledby="import-guide-title">
        <h3 id="import-guide-title">檔案格式說明</h3>
        <p>可直接上傳你整理好的 JSON，或使用第一列為欄位名稱的 CSV。JSON 可是資料陣列，也可以是包含 <code>locations</code> 的格式。</p>
        <p className="import-guide-limit">單檔上限 {formatFileSize(MAX_IMPORT_FILE_BYTES)}，最多 {MAX_IMPORT_ROWS} 筆；檔案只會在瀏覽器中解析。</p>
        <details>
          <summary>查看欄位與範例</summary>
          <div className="import-guide-details">
            <p><strong>必要欄位：</strong>地點名稱、地址、地區。若 CSV 沒有縣市，系統會嘗試從地址判斷。</p>
            <p><strong>可用欄位：</strong>name、city、district、region、address、phone、latitude、longitude、capPolicy、restrictions、sourceType、sourceUrl、notes。</p>
            <p><strong>附件相容欄位：</strong>swim_cap_policy、source_type、website、verification_status。</p>
            <code className="import-code-example">name,city,region,address,capPolicy,sourceType,sourceUrl{`\n`}海邊渡假飯店,屏東縣,south,屏東縣某鄉某路1號,not-required,community,https://example.com</code>
          </div>
        </details>
      </section>

      <label className="file-picker">
        <span>選擇 CSV／JSON 檔案</span>
        <input type="file" accept=".csv,.json,text/csv,application/json" onChange={(event) => void selectFile(event)} disabled={submitting} />
      </label>
      <p className="form-hint">支援 .csv、.json，檔案大小上限 {formatFileSize(MAX_IMPORT_FILE_BYTES)}。</p>

      {fileName && <p className="selected-file">已選擇：{fileName}</p>}
      {fileError && <p className="form-error" role="alert">{fileError}</p>}
      {preview && !fileError && (
        <div className={`import-preview ${preview.errors.length ? 'import-preview--error' : ''}`}>
          <strong>{preview.errors.length ? '檔案需要修正' : `已讀取 ${preview.items.length} 筆資料`}</strong>
          {preview.errors.length ? (
            <ul className="import-error-list">
              {preview.errors.slice(0, 8).map((error) => (
                <li key={`${error.row}-${error.message}`}>{error.row ? `第 ${error.row} 筆：` : ''}{error.message}</li>
              ))}
              {preview.errors.length > 8 && <li>還有 {preview.errors.length - 8} 個錯誤，請修正檔案後重新上傳。</li>}
            </ul>
          ) : (
            <p>送出後每筆資料都會進入待審核，不會立即公開。</p>
          )}
        </div>
      )}

      <div className="form-grid">
        <label className="form-field">
          <span>暱稱（選填）</span>
          <input name="bulk-nickname" placeholder="如何稱呼你" disabled={submitting} />
        </label>
        <label className="form-field">
          <span>Email（選填）</span>
          <input name="bulk-email" type="email" placeholder="you@example.com" disabled={submitting} />
        </label>
      </div>

      {turnstileSiteKey ? (
        <div className="turnstile-field">
          <div ref={turnstileRef} />
          {turnstileLoadError && <p className="form-error">安全驗證載入失敗，請重新整理後再試。</p>}
        </div>
      ) : (
        <p className="form-hint">本機開發環境暫未啟用安全驗證。</p>
      )}

      {(formError || submitError) && <p className="form-error" role="alert">{formError || submitError}</p>}

      <div className="form-actions">
        <button className="button button--primary" type="submit" disabled={submitting || turnstileLoadError || Boolean(preview?.errors.length)}>
          {submitting ? '送出中...' : '送出批次投稿'}
        </button>
      </div>
    </form>
  )
}
