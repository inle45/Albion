import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Circle, Plus, Trash2, RotateCcw, ScrollText } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { uid } from '../lib/format'

const today = () => new Date().toISOString().slice(0, 10)

const DEFAULT_TASKS = [
  { id: uid(), label: 'Connexion quotidienne (récompense)', category: 'Compte' },
  { id: uid(), label: 'Tâche d\'aventurier journalière', category: 'Aventurier' },
  { id: uid(), label: 'Carte trésor / mystérieuse', category: 'Loot' },
  { id: uid(), label: 'Faille corrompue solo', category: 'PvP' },
  { id: uid(), label: 'Donjon avalonien', category: 'PvE' },
  { id: uid(), label: 'Récolte ressource T6+', category: 'Récolte' },
]

export default function Quetes() {
  const [tasks, setTasks] = useLocalStorage('quests.tasks', DEFAULT_TASKS)
  const [done, setDone] = useLocalStorage('quests.done', { date: today(), ids: [] })
  const [draft, setDraft] = useState({ label: '', category: 'PvE' })

  useEffect(() => {
    if (done.date !== today()) {
      setDone({ date: today(), ids: [] })
    }
  }, [done.date, setDone])

  const toggle = (id) => {
    const ids = done.ids.includes(id) ? done.ids.filter((x) => x !== id) : [...done.ids, id]
    setDone({ date: today(), ids })
  }

  const add = () => {
    if (!draft.label.trim()) return
    setTasks([...tasks, { id: uid(), label: draft.label.trim(), category: draft.category }])
    setDraft({ label: '', category: draft.category })
  }
  const remove = (id) => {
    setTasks(tasks.filter((t) => t.id !== id))
    setDone({ date: today(), ids: done.ids.filter((x) => x !== id) })
  }
  const reset = () => setDone({ date: today(), ids: [] })

  const completed = done.ids.length
  const total = tasks.length
  const pct = total === 0 ? 0 : (completed / total) * 100

  const grouped = useMemo(() => {
    const map = {}
    tasks.forEach((t) => {
      ;(map[t.category] ||= []).push(t)
    })
    return Object.entries(map)
  }, [tasks])

  return (
    <div className="space-y-6">
      <section className="card">
        <header className="flex items-center justify-between mb-4">
          <h2 className="card-title flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-gold-400" /> Tâches Journalières
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-ink-300 tabular-nums">
              {completed}/{total} accomplies
            </span>
            <button onClick={reset} className="btn-ghost">
              <RotateCcw className="w-4 h-4" /> Réinitialiser
            </button>
          </div>
        </header>

        <div className="h-2 bg-bg-700 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-gold-600 to-gold-400 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="grid grid-cols-12 gap-2 mb-4">
          <input
            className="input col-span-12 md:col-span-7"
            placeholder="Nouvelle tâche (ex: Hellgate 2v2)"
            value={draft.label}
            onChange={(e) => setDraft({ ...draft, label: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && add()}
          />
          <select
            className="input col-span-8 md:col-span-3"
            value={draft.category}
            onChange={(e) => setDraft({ ...draft, category: e.target.value })}
          >
            <option>PvE</option>
            <option>PvP</option>
            <option>Récolte</option>
            <option>Crafting</option>
            <option>Aventurier</option>
            <option>Compte</option>
            <option>Loot</option>
            <option>Autre</option>
          </select>
          <button onClick={add} className="btn-gold col-span-4 md:col-span-2 justify-center">
            <Plus className="w-4 h-4" /> Ajouter
          </button>
        </div>

        <div className="space-y-5">
          {grouped.length === 0 && (
            <p className="text-center text-ink-300 text-sm py-8">Aucune tâche — ajoutez-en une pour commencer.</p>
          )}
          {grouped.map(([cat, list]) => (
            <div key={cat}>
              <div className="text-[11px] uppercase tracking-widest text-ink-300 mb-2">{cat}</div>
              <ul className="space-y-1">
                {list.map((t) => {
                  const checked = done.ids.includes(t.id)
                  return (
                    <li
                      key={t.id}
                      className={[
                        'group flex items-center gap-3 px-3 py-2 rounded-lg border transition cursor-pointer',
                        checked
                          ? 'bg-gold-600/5 border-gold-600/30'
                          : 'border-bg-700 hover:border-bg-600 hover:bg-bg-700/40',
                      ].join(' ')}
                      onClick={() => toggle(t.id)}
                    >
                      {checked ? (
                        <CheckCircle2 className="w-5 h-5 text-gold-400 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-ink-400 shrink-0" />
                      )}
                      <span
                        className={[
                          'flex-1 text-sm',
                          checked ? 'line-through text-ink-300' : 'text-ink-100',
                        ].join(' ')}
                      >
                        {t.label}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          remove(t.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 text-ink-400 hover:text-blood-400 p-1 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-ink-400 mt-4 text-center">
          Reset automatique chaque jour à minuit (heure locale).
        </p>
      </section>
    </div>
  )
}
