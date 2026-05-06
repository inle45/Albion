import { useEffect, useMemo, useState } from 'react'
import {
  Plus, Trash2, Play, RotateCcw, Bell, Sprout, Trees, Beef, Wheat, Flower2, House,
} from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { uid } from '../lib/format'

// Presets : nom + durée par défaut (heures)
const PRESETS = [
  { label: 'Carottes',         hours: 22, icon: 'Sprout' },
  { label: 'Blé',              hours: 22, icon: 'Wheat' },
  { label: 'Choux',            hours: 36, icon: 'Sprout' },
  { label: 'Citrouilles',      hours: 96, icon: 'Sprout' },
  { label: 'Vache (lait)',     hours: 22, icon: 'Beef' },
  { label: 'Mouton',           hours: 36, icon: 'Beef' },
  { label: 'Bois',             hours: 24, icon: 'Trees' },
  { label: 'Fleur',            hours: 22, icon: 'Flower2' },
]

const ICONS = { Sprout, Trees, Beef, Wheat, Flower2, House, Bell }

const fmtRemaining = (ms) => {
  if (ms <= 0) return 'Terminé'
  const total = Math.floor(ms / 1000)
  const d = Math.floor(total / 86400)
  const h = Math.floor((total % 86400) / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (d > 0) return `${d}j ${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m`
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const seed = () => [
  {
    id: uid(),
    label: 'Champs de carottes',
    durationMs: 22 * 3600 * 1000,
    startedAt: Date.now() - 5 * 3600 * 1000,
    icon: 'Sprout',
  },
]

export default function Ile() {
  const [timers, setTimers] = useLocalStorage('island.timers', seed())
  const [draft, setDraft] = useState({ label: '', hours: 22, minutes: 0, icon: 'Sprout' })

  // tick global pour rafraîchir les barres (1 s)
  const [, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const addTimer = (label, hours, minutes, icon) => {
    const trimmed = label.trim()
    if (!trimmed) return
    const dur = (Number(hours) || 0) * 3600 * 1000 + (Number(minutes) || 0) * 60 * 1000
    if (dur <= 0) return
    setTimers([
      ...timers,
      {
        id: uid(),
        label: trimmed,
        durationMs: dur,
        startedAt: Date.now(),
        icon: icon || 'Sprout',
      },
    ])
  }

  const addFromDraft = () => {
    addTimer(draft.label, draft.hours, draft.minutes, draft.icon)
    setDraft({ label: '', hours: 22, minutes: 0, icon: draft.icon })
  }

  const addPreset = (p) => addTimer(p.label, p.hours, 0, p.icon)
  const remove = (id) => setTimers(timers.filter((t) => t.id !== id))
  const restart = (id) =>
    setTimers(timers.map((t) => (t.id === id ? { ...t, startedAt: Date.now() } : t)))

  const enriched = useMemo(() => {
    const now = Date.now()
    return timers
      .map((t) => {
        const endsAt = t.startedAt + t.durationMs
        const remaining = endsAt - now
        const elapsed = now - t.startedAt
        const pct = Math.max(0, Math.min(100, (elapsed / t.durationMs) * 100))
        return { ...t, endsAt, remaining, pct, finished: remaining <= 0 }
      })
      .sort((a, b) => a.remaining - b.remaining)
  }, [timers])

  const finishedCount = enriched.filter((t) => t.finished).length

  return (
    <div className="space-y-6">
      <section className="card">
        <header className="flex items-center justify-between mb-4">
          <h2 className="card-title flex items-center gap-2">
            <House className="w-5 h-5 text-gold-400" /> Minuteurs d'Île
          </h2>
          {finishedCount > 0 && (
            <span className="pill border-gold-600/40 text-gold-400">
              <Bell className="w-3 h-3" /> {finishedCount} prêt{finishedCount > 1 ? 's' : ''} à récolter
            </span>
          )}
        </header>

        <div className="mb-3">
          <div className="text-[11px] uppercase tracking-widest text-ink-300 mb-2">Presets rapides</div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => {
              const Ico = ICONS[p.icon] || Sprout
              return (
                <button key={p.label} onClick={() => addPreset(p)} className="btn-ghost">
                  <Ico className="w-4 h-4 text-gold-400" /> {p.label}
                  <span className="text-[10px] text-ink-300 ml-1">{p.hours}h</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2 pt-3 border-t border-bg-700">
          <input
            className="input col-span-12 md:col-span-5"
            placeholder='Nom (ex: "Champs de carottes - parcelle 3")'
            value={draft.label}
            onChange={(e) => setDraft({ ...draft, label: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && addFromDraft()}
          />
          <div className="col-span-4 md:col-span-2">
            <input
              className="input"
              type="number"
              min="0"
              placeholder="Heures"
              value={draft.hours}
              onChange={(e) => setDraft({ ...draft, hours: e.target.value })}
            />
          </div>
          <div className="col-span-4 md:col-span-2">
            <input
              className="input"
              type="number"
              min="0"
              max="59"
              placeholder="Min"
              value={draft.minutes}
              onChange={(e) => setDraft({ ...draft, minutes: e.target.value })}
            />
          </div>
          <select
            className="input col-span-4 md:col-span-1"
            value={draft.icon}
            onChange={(e) => setDraft({ ...draft, icon: e.target.value })}
            title="Icône"
          >
            {Object.keys(ICONS).map((k) => <option key={k}>{k}</option>)}
          </select>
          <button onClick={addFromDraft} className="btn-gold col-span-12 md:col-span-2 justify-center">
            <Plus className="w-4 h-4" /> Ajouter
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {enriched.length === 0 && (
          <div className="card md:col-span-2 text-center text-ink-300 text-sm py-10">
            Aucun minuteur. Utilisez un preset ou créez-en un personnalisé.
          </div>
        )}

        {enriched.map((t) => {
          const Ico = ICONS[t.icon] || Sprout
          const finished = t.finished
          return (
            <article
              key={t.id}
              className={[
                'card transition',
                finished ? 'border-gold-600/50 shadow-gold' : '',
              ].join(' ')}
            >
              <header className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={[
                      'w-9 h-9 rounded-lg border flex items-center justify-center shrink-0',
                      finished ? 'border-gold-600/50 bg-gold-600/10' : 'border-bg-600 bg-bg-700/60',
                    ].join(' ')}
                  >
                    <Ico className={['w-5 h-5', finished ? 'text-gold-400' : 'text-ink-200'].join(' ')} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-base text-ink-100 truncate">{t.label}</h3>
                    <p className="text-[11px] text-ink-300">
                      Fin: {new Date(t.endsAt).toLocaleString('fr-FR', {
                        weekday: 'short', day: '2-digit', month: 'short',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => restart(t.id)}
                    title="Redémarrer"
                    className="text-ink-300 hover:text-gold-400 p-1.5 rounded hover:bg-bg-700"
                  >
                    {finished ? <Play className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => remove(t.id)}
                    title="Supprimer"
                    className="text-ink-300 hover:text-blood-400 p-1.5 rounded hover:bg-bg-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </header>

              <div className="h-3 bg-bg-700 rounded-full overflow-hidden">
                <div
                  className={[
                    'h-full transition-all rounded-full',
                    finished
                      ? 'bg-gradient-to-r from-gold-500 to-gold-400 animate-pulse'
                      : 'bg-gradient-to-r from-gold-700 via-gold-500 to-gold-400',
                  ].join(' ')}
                  style={{ width: `${t.pct}%` }}
                />
              </div>

              <div className="flex items-center justify-between mt-2">
                <span className={[
                  'font-display tabular-nums',
                  finished ? 'text-gold-400 text-lg' : 'text-ink-100',
                ].join(' ')}>
                  {fmtRemaining(t.remaining)}
                </span>
                <span className="text-[11px] uppercase tracking-widest text-ink-300 tabular-nums">
                  {t.pct.toFixed(1)}%
                </span>
              </div>
            </article>
          )
        })}
      </section>
    </div>
  )
}
