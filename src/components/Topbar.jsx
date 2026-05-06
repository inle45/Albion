import { Coins } from 'lucide-react'
import { fmtSilver } from '../lib/format'

export default function Topbar({ title, subtitle, fortune }) {
  return (
    <header className="flex items-center justify-between gap-4 px-6 py-4 border-b border-bg-700 bg-bg-800/40 backdrop-blur-sm">
      <div>
        <h1 className="font-display text-2xl text-ink-100">{title}</h1>
        {subtitle && <p className="text-sm text-ink-300">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gold-600/30 bg-gold-600/5">
        <Coins className="w-4 h-4 text-gold-400" />
        <div className="leading-tight">
          <div className="text-[10px] uppercase tracking-widest text-ink-300">Fortune</div>
          <div className="font-display text-gold-400">{fmtSilver(fortune)}</div>
        </div>
      </div>
    </header>
  )
}
