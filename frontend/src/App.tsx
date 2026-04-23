// © 2026 Aboubacar Sidick Meite (ApollonASM8977) — All Rights Reserved
import { useState } from 'react'
import { Shield, Upload, ShieldCheck, History } from 'lucide-react'
import UploadTab from './components/UploadTab'
import VerifyTab from './components/VerifyTab'
import HistoryTab from './components/HistoryTab'

type Tab = 'upload' | 'verify' | 'history'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'upload',  label: 'Upload & Hash',  icon: <Upload size={14} /> },
  { id: 'verify',  label: 'Verify',         icon: <ShieldCheck size={14} /> },
  { id: 'history', label: 'History',         icon: <History size={14} /> },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('upload')

  return (
    <div className="relative min-h-screen bg-cyber-bg overflow-x-hidden">
      {/* Scanline overlay */}
      <div className="scanline" />

      {/* Grid background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#00ff41 1px, transparent 1px), linear-gradient(90deg, #00ff41 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-4 py-10 min-h-screen">
        {/* Header */}
        <header className="w-full max-w-xl mb-10 text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className="relative">
              <Shield size={36} className="text-cyber-green" />
              <div className="absolute inset-0 blur-xl bg-cyber-green/30 rounded-full" />
            </div>
            <h1 className="text-3xl font-bold tracking-widest glow-green uppercase">
              FileIntegrity
            </h1>
          </div>
          <p className="text-xs text-cyber-muted tracking-widest uppercase">
            Cryptographic file hashing &amp; integrity verification
          </p>
          <div className="flex items-center justify-center gap-2 text-cyber-muted/40 text-xs font-mono">
            <span className="w-12 h-px bg-cyber-border" />
            SHA-256 Â· SHA-512 Â· SHA-1 Â· MD5 Â· HMAC
            <span className="w-12 h-px bg-cyber-border" />
          </div>
        </header>

        {/* Card */}
        <main className="w-full max-w-xl">
          <div className="rounded-xl border border-cyber-border bg-cyber-surface shadow-[0_0_40px_#00ff4108]">
            {/* Tab bar */}
            <div className="flex border-b border-cyber-border">
              {TABS.map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`
                    flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-mono uppercase tracking-widest
                    transition-all border-b-2 -mb-px
                    ${tab === id
                      ? 'border-cyber-green text-cyber-green bg-cyber-green/5'
                      : 'border-transparent text-cyber-muted hover:text-cyber-text hover:bg-cyber-card/50'
                    }
                  `}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-6">
              {tab === 'upload'  && <UploadTab />}
              {tab === 'verify'  && <VerifyTab />}
              {tab === 'history' && <HistoryTab />}
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-cyber-muted/30 text-xs mt-6 font-mono tracking-widest">
            v2.0.0 Â· FastAPI + React Â· All operations local
          </p>
          <p className="text-right text-cyber-muted/20 text-xs mt-1 font-mono pr-1">© ASM</p>
        </main>
      </div>
    </div>
  )
}

