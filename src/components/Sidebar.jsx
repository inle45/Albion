import { Coins, Shield, Swords, ScrollText, Crown } from 'lucide-react'

const NAV = [
  { id: 'economie', label: 'Économie',  icon: Coins,      hint: 'Affinage & Marché Noir' },
  { id: 'arsenal',  label: 'Arsenal',   icon: Shield,     hint: 'Gear Fear & Loadouts' },
  { id: 'pvp',      label: 'PvP',       icon: Swords,     hint: 'Kills, Deaths & Fame' },
  { id: 'quetes',   label: 'Tâches',    icon: ScrollText, hint: 'Journalières' },
]

export default function Sidebar({ current, onChange }) {
  return (
    <aside className="w-60 shrink-0 border-r border-bg-700 bg-bg-800/60 backdrop-blur-md flex flex-col">
      <div className="px-5 py-5 border-b border-bg-700">
        <div className="flex items-center gap-2">
          <Crown className="w-6 h-6 text-gold-400" />
          <div>
            <div className="font-display text-lg leading-none text-gold-400">Albion</div>
            <div className="text-[11px] uppercase tracking-widest text-ink-300">Dashboard</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(({ id, label, icon: Icon, hint }) => {
          const active = current === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={[
                'w-full text-left rounded-xl px-3 py-2.5 flex items-center gap-3 transition border',
                active
                  ? 'bg-gold-600/10 border-gold-600/40 text-gold-400 shadow-gold'
                  : 'border-transparent text-ink-200 hover:bg-bg-700/60 hover:text-ink-100',
              ].join(' ')}
            >
              <Icon className={['w-4 h-4', active ? 'text-gold-400' : 'text-ink-300'].join(' ')} />
              <div className="flex-1">
                <div className={['text-sm font-medium', active ? 'text-gold-400' : ''].join(' ')}>{label}</div>
                <div className="text-[10px] uppercase tracking-widest text-ink-400">{hint}</div>
              </div>
            </button>
          )
        })}
      </nav>

      <div className="p-3 border-t border-bg-700 text-[11px] text-ink-400 leading-relaxed">
        <p>Données stockées localement (LocalStorage). Aucune connexion serveur.</p>
      </div>
    </aside>
  )
}
