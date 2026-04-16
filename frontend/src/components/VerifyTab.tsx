import { useState } from 'react'
import axios from 'axios'
import { ShieldCheck, ShieldX, Loader2, AlertCircle } from 'lucide-react'
import AlgoSelector from './AlgoSelector'
import DropZone from './DropZone'

type Algorithm = 'sha256' | 'sha512' | 'sha1' | 'md5'

interface VerifyResult {
  filename: string
  algorithm: string
  stored_hash: string
  computed_hash: string
  match: boolean
  hmac_valid: boolean
}

export default function VerifyTab() {
  const [algo, setAlgo] = useState<Algorithm>('sha256')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VerifyResult | null>(null)
  const [error, setError] = useState('')

  const handleVerify = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    setResult(null)

    const form = new FormData()
    form.append('file', file)
    form.append('algorithm', algo)

    try {
      const { data } = await axios.post<VerifyResult>('/api/verify', form)
      setResult(data)
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

  const integrityOk = result?.match && result?.hmac_valid

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-cyber-muted mb-3 uppercase tracking-widest">Hash Algorithm</p>
        <AlgoSelector value={algo} onChange={setAlgo} />
      </div>

      <DropZone
        onFile={(f) => { setFile(f); setResult(null); setError('') }}
        label="Drop the file you want to verify"
      />

      {file && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-cyber-card border border-cyber-border">
          <div className="w-2 h-2 rounded-full bg-cyber-blue animate-pulse" />
          <span className="text-sm text-cyber-text truncate flex-1">{file.name}</span>
          <span className="text-xs text-cyber-muted">{(file.size / 1024).toFixed(1)} KB</span>
        </div>
      )}

      <button
        onClick={handleVerify}
        disabled={!file || loading}
        className="
          w-full py-3 rounded-lg font-mono text-sm font-semibold tracking-wider uppercase transition-all
          bg-cyber-blue/90 text-white hover:shadow-[0_0_20px_#00b4d860]
          disabled:opacity-30 disabled:cursor-not-allowed
        "
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" /> Verifying...
          </span>
        ) : (
          '🔍  Verify Integrity'
        )}
      </button>

      {error && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-red-950/30 border border-red-800/50">
          <AlertCircle size={16} className="text-cyber-red mt-0.5 shrink-0" />
          <p className="text-sm text-cyber-red">{error}</p>
        </div>
      )}

      {result && (
        <div className={`
          rounded-lg border p-5 space-y-4
          ${integrityOk
            ? 'border-cyber-green/40 bg-cyber-green/5'
            : 'border-cyber-red/40 bg-red-950/20'
          }
        `}>
          {/* Verdict */}
          <div className="flex items-center gap-3">
            {integrityOk
              ? <ShieldCheck size={28} className="text-cyber-green" />
              : <ShieldX size={28} className="text-cyber-red" />
            }
            <div>
              <p className={`font-bold text-lg ${integrityOk ? 'text-cyber-green glow-green' : 'text-cyber-red'}`}>
                {integrityOk ? 'INTEGRITY VERIFIED' : 'INTEGRITY FAILURE'}
              </p>
              <p className="text-xs text-cyber-muted mt-0.5">
                {integrityOk
                  ? 'File matches stored hash — no tampering detected.'
                  : 'File does not match stored hash — possible tampering!'}
              </p>
            </div>
          </div>

          <div className="border-t border-cyber-border pt-4 space-y-3 font-mono text-xs">
            <Row label="File" value={result.filename} />
            <Row label="Algorithm" value={result.algorithm.toUpperCase()} />
            <Row label="Hash Match" value={result.match ? '✅  YES' : '❌  NO'} highlight={result.match} />
            <Row label="HMAC Valid" value={result.hmac_valid ? '✅  YES' : '❌  NO'} highlight={result.hmac_valid} />

            <div className="space-y-1 pt-1">
              <p className="text-cyber-muted uppercase tracking-widest">Stored Hash</p>
              <p className="hash-text">{result.stored_hash}</p>
            </div>
            <div className="space-y-1">
              <p className="text-cyber-muted uppercase tracking-widest">Computed Hash</p>
              <p className={`hash-text ${result.match ? 'text-cyber-green' : 'text-cyber-red'}`}>
                {result.computed_hash}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-cyber-muted uppercase tracking-widest">{label}</span>
      <span className={highlight !== undefined
        ? highlight ? 'text-cyber-green' : 'text-cyber-red'
        : 'text-cyber-text'
      }>{value}</span>
    </div>
  )
}
