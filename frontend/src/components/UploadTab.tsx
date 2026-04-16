import { useState } from 'react'
import axios from 'axios'
import { CheckCircle, Loader2, AlertCircle, Copy, Check } from 'lucide-react'
import AlgoSelector from './AlgoSelector'
import DropZone from './DropZone'

type Algorithm = 'sha256' | 'sha512' | 'sha1' | 'md5'

interface UploadResult {
  filename: string
  algorithm: string
  hash_value: string
  hmac_value: string
}

export default function UploadTab() {
  const [algo, setAlgo] = useState<Algorithm>('sha256')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<'hash' | 'hmac' | null>(null)
  const [progress, setProgress] = useState(0)

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    setResult(null)
    setProgress(0)

    const form = new FormData()
    form.append('file', file)
    form.append('algorithm', algo)

    try {
      const { data } = await axios.post<UploadResult>('/api/upload', form, {
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100))
        },
      })
      setResult(data)
      setProgress(100)
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        const detail = e.response?.data?.detail
        if (detail) setError(String(detail))
        else if (!e.response) setError('Cannot reach the server — make sure the backend is running on port 8000.')
        else setError(`Server error ${e.response.status}`)
      } else {
        setError('Unexpected error.')
      }
    } finally {
      setLoading(false)
    }
  }

  const copy = (text: string, type: 'hash' | 'hmac') => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-cyber-muted mb-3 uppercase tracking-widest">Hash Algorithm</p>
        <AlgoSelector value={algo} onChange={setAlgo} />
      </div>

      <DropZone onFile={(f) => { setFile(f); setResult(null); setError('') }} />

      {file && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-cyber-card border border-cyber-border">
          <div className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
          <span className="text-sm text-cyber-text truncate flex-1">{file.name}</span>
          <span className="text-xs text-cyber-muted">{(file.size / 1024).toFixed(1)} KB</span>
        </div>
      )}

      {loading && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-cyber-muted">
            <span>Computing {algo.toUpperCase()} hash...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-cyber-border overflow-hidden">
            <div
              className="h-full progress-shimmer rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="
          w-full py-3 rounded-lg font-mono text-sm font-semibold tracking-wider uppercase transition-all
          bg-cyber-green text-cyber-bg hover:shadow-[0_0_20px_#00ff4160]
          disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none
        "
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" /> Processing...
          </span>
        ) : (
          '⬆  Upload & Hash'
        )}
      </button>

      {error && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-red-950/30 border border-red-800/50">
          <AlertCircle size={16} className="text-cyber-red mt-0.5 shrink-0" />
          <p className="text-sm text-cyber-red">{error}</p>
        </div>
      )}

      {result && (
        <div className="rounded-lg border border-cyber-green/30 bg-cyber-green/5 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-cyber-green" />
            <span className="text-cyber-green font-semibold text-sm">File hashed successfully</span>
          </div>

          <div className="space-y-3">
            <HashRow
              label={result.algorithm.toUpperCase()}
              value={result.hash_value}
              copied={copied === 'hash'}
              onCopy={() => copy(result.hash_value, 'hash')}
            />
            <HashRow
              label="HMAC-SHA256"
              value={result.hmac_value}
              copied={copied === 'hmac'}
              onCopy={() => copy(result.hmac_value, 'hmac')}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function HashRow({ label, value, copied, onCopy }: {
  label: string; value: string; copied: boolean; onCopy: () => void
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-cyber-muted uppercase tracking-widest">{label}</p>
      <div className="flex items-start gap-2">
        <p className="hash-text flex-1 break-all">{value}</p>
        <button
          onClick={onCopy}
          className="shrink-0 p-1 rounded hover:bg-cyber-green/10 text-cyber-muted hover:text-cyber-green transition-colors"
          title="Copy"
        >
          {copied ? <Check size={14} className="text-cyber-green" /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  )
}
