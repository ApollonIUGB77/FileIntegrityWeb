import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'

interface Props {
  onFile: (file: File) => void
  label?: string
}

export default function DropZone({ onFile, label = 'Drop file here or click to browse' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onFile(file)
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`
        relative cursor-pointer rounded-lg border-2 border-dashed p-10
        flex flex-col items-center justify-center gap-3 transition-all select-none
        ${dragging
          ? 'border-cyber-green bg-cyber-green/5 shadow-[0_0_20px_#00ff4130]'
          : 'border-cyber-border hover:border-cyber-dim hover:bg-cyber-green/5'
        }
      `}
    >
      <Upload
        size={32}
        className={dragging ? 'text-cyber-green glow-green' : 'text-cyber-muted'}
      />
      <p className="text-sm text-cyber-muted text-center">{label}</p>
      <p className="text-xs text-cyber-muted/50">Any file type · No size limit</p>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />
    </div>
  )
}
