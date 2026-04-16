import { useEffect, useState } from 'react'
import axios from 'axios'
import { Download, Trash2, Trash, RefreshCw, FileDigit, Loader2 } from 'lucide-react'

interface FileEntry {
  filename: string
  algorithm: string
  hash_value: string
  hmac_value: string
}

export default function HistoryTab() {
  const [entries, setEntries] = useState<FileEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [clearingAll, setClearingAll] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  const fetchFiles = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get<FileEntry[]>('/api/files')
      setEntries(data)
    } catch {
      setEntries([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchFiles() }, [])

  const deleteEntry = async (filename: string, algorithm: string) => {
    const key = `${filename}::${algorithm}`
    setDeleting(key)
    try {
      await axios.delete(`/api/files/${encodeURIComponent(filename)}/${algorithm}`)
      setEntries(prev => prev.filter(e => !(e.filename === filename && e.algorithm === algorithm)))
    } finally {
      setDeleting(null)
    }
  }

  const clearAll = async () => {
    setClearingAll(true)
    try {
      await axios.delete('/api/files')
      setEntries([])
    } finally {
      setClearingAll(false)
      setConfirmClear(false)
    }
  }

  const downloadHash = (filename: string, algorithm: string) => {
    window.open(`/api/download/${encodeURIComponent(filename)}/${algorithm}`, '_blank')
  }

  const algoColor = (algo: string) => {
    switch (algo) {
      case 'sha256': return 'text-cyber-green border-cyber-green/30 bg-cyber-green/5'
      case 'sha512': return 'text-cyber-blue border-cyber-blue/30 bg-cyber-blue/5'
      case 'sha1':   return 'text-cyber-yellow border-cyber-yellow/30 bg-cyber-yellow/5'
      case 'md5':    return 'text-cyber-red border-cyber-red/30 bg-cyber-red/5'
      default:       return 'text-cyber-muted border-cyber-border bg-cyber-card'
    }
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-cyber-muted uppercase tracking-widest">
          {entries.length} {entries.length === 1 ? 'record' : 'records'} stored
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchFiles}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs border border-cyber-border text-cyber-muted hover:text-cyber-green hover:border-cyber-green/40 transition-colors"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>

          {entries.length > 0 && (
            confirmClear ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-cyber-red">Sure?</span>
                <button
                  onClick={clearAll}
                  disabled={clearingAll}
                  className="px-3 py-1.5 rounded text-xs border border-cyber-red/50 text-cyber-red hover:bg-cyber-red/10 transition-colors"
                >
                  {clearingAll ? <Loader2 size={12} className="animate-spin" /> : 'Yes, delete all'}
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="px-3 py-1.5 rounded text-xs border border-cyber-border text-cyber-muted hover:text-cyber-text transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs border border-cyber-border text-cyber-muted hover:text-cyber-red hover:border-cyber-red/40 transition-colors"
              >
                <Trash size={12} />
                Clear all
              </button>
            )
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading && entries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 size={24} className="text-cyber-green animate-spin" />
          <p className="text-xs text-cyber-muted">Fetching records...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && entries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-lg border border-dashed border-cyber-border">
          <FileDigit size={36} className="text-cyber-muted/40" />
          <div className="text-center">
            <p className="text-sm text-cyber-muted">No files hashed yet</p>
            <p className="text-xs text-cyber-muted/50 mt-1">Upload a file to create an entry</p>
          </div>
        </div>
      )}

      {/* Entries */}
      <div className="space-y-3">
        {entries.map((entry) => {
          const key = `${entry.filename}::${entry.algorithm}`
          const isDeleting = deleting === key

          return (
            <div
              key={key}
              className="rounded-lg border border-cyber-border bg-cyber-card p-4 space-y-3 hover:border-cyber-border/80 transition-colors"
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyber-green shrink-0" />
                  <span className="text-sm text-cyber-text truncate font-semibold">{entry.filename}</span>
                </div>
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded border font-mono uppercase ${algoColor(entry.algorithm)}`}>
                  {entry.algorithm}
                </span>
              </div>

              {/* Hash */}
              <div className="space-y-1">
                <p className="text-xs text-cyber-muted uppercase tracking-widest">Hash</p>
                <p className="hash-text">{entry.hash_value}</p>
              </div>

              {/* HMAC */}
              <div className="space-y-1">
                <p className="text-xs text-cyber-muted uppercase tracking-widest">HMAC-SHA256</p>
                <p className="hash-text opacity-60">{entry.hmac_value}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1 border-t border-cyber-border">
                <button
                  onClick={() => downloadHash(entry.filename, entry.algorithm)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs border border-cyber-border text-cyber-muted hover:text-cyber-blue hover:border-cyber-blue/40 transition-colors"
                >
                  <Download size={11} />
                  Download .hash
                </button>
                <button
                  onClick={() => deleteEntry(entry.filename, entry.algorithm)}
                  disabled={isDeleting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs border border-cyber-border text-cyber-muted hover:text-cyber-red hover:border-cyber-red/40 transition-colors ml-auto"
                >
                  {isDeleting
                    ? <Loader2 size={11} className="animate-spin" />
                    : <Trash2 size={11} />
                  }
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
