import { useMemo, useState } from 'react'
import { Plus, Trash2, Swords, Skull, Trophy, TrendingUp } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { fmtSilver, fmtNumber, parseNumber, uid } from '../lib/format'

const TYPES = ['Kill', 'Death', 'Assist']

export default function PvP() {
  const [entries, setEntries] = useLocalStorage('pvp.entries', [])
  const [draft, setDraft] = useState({
    type: 'Kill',
    target: '',
    fame: '',
    loot: '',
    zone: '',
    date: new Date().toISOString().slice(0, 10),
  })

  const add = () => {
    if (!draft.target.trim()) return
    setEntries([
      {
        id: uid(),
        type: draft.type,
        target: draft.target.trim(),
        fame: parseNumber(draft.fame),
        loot: parseNumber(draft.loot),
        zone: draft.zone.trim(),
        date: draft.date,
      },
      ...entries,
    ])
    setDraft({ ...draft, target: '', fame: '', loot: '', zone: '' })
  }

  const remove = (id) => setEntries(entries.filter((e) => e.id !== id))

  const stats = useMemo(() => {
    const kills = entries.filter((e) => e.type === 'Kill').length
    const deaths = entries.filter((e) => e.type === 'Death').length
    const assists = entries.filter((e) => e.type === 'Assist').length
    const fame = entries.reduce((s, e) => s + (e.fame || 0), 0)
    const loot = entries.reduce((s, e) => s + (e.type !== 'Death' ? e.loot || 0 : -(e.loot || 0)), 0)
    const kd = deaths === 0 ? (kills > 0 ? Infinity : 0) : kills / deaths
    return { kills, deaths, assists, fame, loot, kd }
  }, [entries])

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="stat">
          <span className="stat-label">Kills</span>
          <span className="stat-value text-gold-400 flex items-center gap-2">
            <Swords className="w-5 h-5" /> {fmtNumber(stats.kills)}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Deaths</span>
          <span className="stat-value text-blood-400 flex items-center gap-2">
            <Skull className="w-5 h-5" /> {fmtNumber(stats.deaths)}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Assists</span>
          <span className="stat-value text-silver-300">{fmtNumber(stats.assists)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">K/D</span>
          <span className="stat-value text-ink-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gold-400" />
            {stats.kd === Infinity ? '∞' : stats.kd.toFixed(2)}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Fame totale</span>
          <span className="stat-value text-gold-400 flex items-center gap-2">
            <Trophy className="w-5 h-5" /> {fmtNumber(stats.fame)}
          </span>
        </div>
      </section>

      <section className="card">
        <header className="flex items-center justify-between mb-4">
          <h2 className="card-title flex items-center gap-2">
            <Swords className="w-5 h-5 text-gold-400" /> Journal de Combat
          </h2>
          <span className={['pill', stats.loot >= 0 ? 'border-gold-600/40 text-gold-400' : 'border-blood-600/40 text-blood-400'].join(' ')}>
            Loot net: {fmtSilver(stats.loot)}
          </span>
        </header>

        <div className="grid grid-cols-12 gap-2 mb-3">
          <select
            className="input col-span-4 md:col-span-1"
            value={draft.type}
            onChange={(e) => setDraft({ ...draft, type: e.target.value })}
          >
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input
            className="input col-span-8 md:col-span-3"
            placeholder="Cible / pseudo"
            value={draft.target}
            onChange={(e) => setDraft({ ...draft, target: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && add()}
          />
          <input
            className="input col-span-6 md:col-span-2"
            placeholder="Fame"
            type="number"
            value={draft.fame}
            onChange={(e) => setDraft({ ...draft, fame: e.target.value })}
          />
          <input
            className="input col-span-6 md:col-span-2"
            placeholder="Loot (silver)"
            type="number"
            value={draft.loot}
            onChange={(e) => setDraft({ ...draft, loot: e.target.value })}
          />
          <input
            className="input col-span-6 md:col-span-2"
            placeholder="Zone"
            value={draft.zone}
            onChange={(e) => setDraft({ ...draft, zone: e.target.value })}
          />
          <input
            className="input col-span-3 md:col-span-1"
            type="date"
            value={draft.date}
            onChange={(e) => setDraft({ ...draft, date: e.target.value })}
          />
          <button onClick={add} className="btn-blood col-span-3 md:col-span-1 justify-center">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-12 px-3 py-2 text-[11px] uppercase tracking-widest text-ink-300 border-b border-bg-600">
          <div className="col-span-1">Type</div>
          <div className="col-span-3">Cible</div>
          <div className="col-span-2 text-right">Fame</div>
          <div className="col-span-2 text-right">Loot</div>
          <div className="col-span-2">Zone</div>
          <div className="col-span-1">Date</div>
          <div className="col-span-1"></div>
        </div>

        <ul className="divide-y divide-bg-700/60">
          {entries.length === 0 && (
            <li className="px-3 py-8 text-center text-ink-300 text-sm">
              Pas encore d'engagement. Le sang n'a pas encore coulé sur Albion.
            </li>
          )}
          {entries.map((e) => {
            const isKill = e.type === 'Kill'
            const isDeath = e.type === 'Death'
            return (
              <li key={e.id} className="grid grid-cols-12 items-center gap-2 px-3 py-2 text-sm">
                <div className="col-span-1">
                  <span
                    className={[
                      'pill',
                      isKill && 'border-gold-600/40 text-gold-400',
                      isDeath && 'border-blood-600/40 text-blood-400',
                      !isKill && !isDeath && 'border-bg-600 text-ink-200',
                    ].filter(Boolean).join(' ')}
                  >
                    {e.type}
                  </span>
                </div>
                <div className="col-span-3 text-ink-100 truncate">{e.target}</div>
                <div className="col-span-2 text-right text-gold-400 tabular-nums">{fmtNumber(e.fame)}</div>
                <div className={['col-span-2 text-right tabular-nums', isDeath ? 'text-blood-400' : 'text-ink-100'].join(' ')}>
                  {isDeath ? '−' : ''}{fmtSilver(e.loot)}
                </div>
                <div className="col-span-2 text-ink-300 truncate">{e.zone || '—'}</div>
                <div className="col-span-1 text-ink-300 text-xs">{e.date}</div>
                <div className="col-span-1 flex justify-end">
                  <button onClick={() => remove(e.id)} className="text-ink-400 hover:text-blood-400 p-1.5 rounded hover:bg-bg-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
