type Algorithm = 'sha256' | 'sha512' | 'sha1' | 'md5'

interface Props {
  value: Algorithm
  onChange: (v: Algorithm) => void
}

const OPTIONS: { value: Algorithm; label: string; desc: string }[] = [
  { value: 'sha256', label: 'SHA-256', desc: 'Recommended' },
  { value: 'sha512', label: 'SHA-512', desc: 'Maximum security' },
  { value: 'sha1',   label: 'SHA-1',   desc: 'Legacy' },
  { value: 'md5',    label: 'MD5',     desc: 'Checksum only' },
]

export default function AlgoSelector({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`
            px-3 py-1.5 rounded border text-xs font-mono transition-all
            ${value === opt.value
              ? 'border-cyber-green text-cyber-green bg-cyber-green/10 shadow-[0_0_8px_#00ff4140]'
              : 'border-cyber-border text-cyber-muted hover:border-cyber-dim hover:text-cyber-text'
            }
          `}
        >
          {opt.label}
          <span className={`ml-1.5 text-[10px] ${value === opt.value ? 'text-cyber-dim' : 'text-cyber-muted/60'}`}>
            {opt.desc}
          </span>
        </button>
      ))}
    </div>
  )
}
