import { useEffect, useMemo, useState } from 'react'
import { Play, Square, RotateCcw, TrendingUp, Trash2, Trophy, Save } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { fmtNumber, parseNumber, uid } from '../lib/format'

const fmtDuration = (ms) => {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const computeFamePerHour = (fame, ms) => {
  if (!ms || ms <= 0) return 0
  const hours = ms / 3_600_000
  return fame / hours
}

export default function Progression() {
  // Chrono : timestamp-based. Survit aux refresh.
  const [chrono, setChrono] = useLocalStorage('progression.chrono', {
    startedAt: null,   // ms epoch when running, else null
    elapsedBefore: 0,  // ms accumulated before current run
    fame: 0,
    label: '',
  })
  const [sessions, setSessions] = useLocalStorage('progression.sessions', [])

  const running = chrono.startedAt != null

  // Tick toutes les secondes quand le chrono tourne (force re-render).
  const [, setNow] = useState(Date.now())
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [running])

  const elapsed = useMemo(() => {
    return chrono.elapsedBefore + (running ? Date.now() - chrono.startedAt : 0)
  }, [chrono, running])

  const fph = useMemo(() => computeFamePerHour(chrono.fame, elapsed), [chrono.fame, elapsed])

  const start = () => {
    if (running) return
    setChrono({ ...chrono, startedAt: Date.now() })
  }

  const stop = () => {
    if (!running) return
    const now = Date.now()
    const newElapsed = chrono.elapsedBefore + (now - chrono.startedAt)
    setChrono({ ...chrono, startedAt: null, elapsedBefore: newElapsed })
  }

  const reset = () => setChrono({ startedAt: null, elapsedBefore: 0, fame: 0, label: chrono.label })

  const save = () => {
    if (elapsed <= 0 && chrono.fame <= 0) return
    setSessions([
      {
        id: uid(),
        label: chrono.label.trim() || 'Session',
        durationMs: elapsed,
        fame: chrono.fame,
        fph: computeFamePerHour(chrono.fame, elapsed),
        date: new Date().toISOString(),
      },
      ...sessions,
    ])
    setChrono({ startedAt: null, elapsedBefore: 0, fame: 0, label: '' })
  }

  const removeSession = (id) => setSessions(sessions.filter((s) => s.id !== id))
  const clearHistory = () => setSessions([])

  const cumul = useMemo(() => {
    const totalMs = sessions.reduce((s, x) => s + x.durationMs, 0)
    const totalFame = sessions.reduce((s, x) => s + x.fame, 0)
    const avgFph = computeFamePerHour(totalFame, totalMs)
    const best = sessions.reduce((b, x) => (x.fph > (b?.fph || 0) ? x : b), null)
    return { totalMs, totalFame, avgFph, best }
  }, [sessions])

  return (
    <div className="space-y-6">
      <section className="card">
        <header className="flex items-center justify-between mb-4">
          <h2 className="card-title flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gold-400" /> Fame Tracker — Session
          </h2>
          <span className={['pill', running ? 'border-gold-600/40 text-gold-400' : 'border-bg-600 text-ink-300'].join(' ')}>
            <span className={['w-2 h-2 rounded-full', running ? 'bg-gold-400 animate-pulse' : 'bg-ink-400'].join(' ')} />
            {running ? 'En cours' : 'Arrêté'}
          </span>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 stat items-center text-center">
            <span className="stat-label">Temps écoulé</span>
            <span className="font-display text-5xl text-ink-100 tabular-nums tracking-wider">
              {fmtDuration(elapsed)}
            </span>
            <input
              className="input mt-3 max-w-sm"
              placeholder="Étiquette de session (ex: Avalon T7, Faille rouge…)"
              value={chrono.label}
              onChange={(e) => setChrono({ ...chrono, label: e.target.value })}
            />
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              {!running ? (
                <button onClick={start} className="btn-gold">
                  <Play className="w-4 h-4" /> Démarrer
                </button>
              ) : (
                <button onClick={stop} className="btn-blood">
                  <Square className="w-4 h-4" /> Arrêter
                </button>
              )}
              <button onClick={reset} className="btn-ghost">
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
              <button
                onClick={save}
                disabled={elapsed <= 0 && chrono.fame <= 0}
                className="btn-gold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" /> Sauver session
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="label">Fame gagnée</label>
              <input
                className="input text-right text-lg tabular-nums"
                type="number"
                min="0"
                value={chrono.fame}
                onChange={(e) => setChrono({ ...chrono, fame: parseNumber(e.target.value) })}
              />
            </div>
            <div className="stat">
              <span className="stat-label">Fame / heure</span>
              <span className="stat-value text-gold-400 tabular-nums">{fmtNumber(Math.round(fph))}</span>
              <span className="text-[11px] text-ink-300">
                {elapsed > 0 ? 'Mise à jour en temps réel.' : 'Démarrez le chrono pour calculer.'}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <header className="flex items-center justify-between mb-4">
          <h2 className="card-title flex items-center gap-2">
            <Trophy className="w-5 h-5 text-gold-400" /> Historique des sessions
          </h2>
          {sessions.length > 0 && (
            <button onClick={clearHistory} className="btn-ghost text-xs">
              <Trash2 className="w-3.5 h-3.5" /> Vider l'historique
            </button>
          )}
        </header>

        {sessions.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="stat">
              <span className="stat-label">Sessions</span>
              <span className="stat-value">{sessions.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Temps cumulé</span>
              <span className="stat-value text-ink-100 tabular-nums">{fmtDuration(cumul.totalMs)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Fame totale</span>
              <span className="stat-value text-gold-400 tabular-nums">{fmtNumber(cumul.totalFame)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Fame/h moy.</span>
              <span className="stat-value text-gold-400 tabular-nums">{fmtNumber(Math.round(cumul.avgFph))}</span>
              {cumul.best && (
                <span className="text-[11px] text-ink-300 truncate">
                  Meilleure: {cumul.best.label} ({fmtNumber(Math.round(cumul.best.fph))}/h)
                </span>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 px-3 py-2 text-[11px] uppercase tracking-widest text-ink-300 border-b border-bg-600">
          <div className="col-span-4">Session</div>
          <div className="col-span-2 text-right">Durée</div>
          <div className="col-span-2 text-right">Fame</div>
          <div className="col-span-2 text-right">Fame/h</div>
          <div className="col-span-1">Date</div>
          <div className="col-span-1"></div>
        </div>

        <ul className="divide-y divide-bg-700/60">
          {sessions.length === 0 && (
            <li className="px-3 py-8 text-center text-ink-300 text-sm">
              Aucune session sauvegardée. Démarrez le chrono, farmez, puis cliquez sur "Sauver session".
            </li>
          )}
          {sessions.map((s, idx) => {
            const isBest = cumul.best && s.id === cumul.best.id
            return (
              <li
                key={s.id}
                className={[
                  'grid grid-cols-12 items-center gap-2 px-3 py-2 text-sm',
                  isBest ? 'bg-gold-600/5 border-l-2 border-gold-500' : '',
                ].join(' ')}
              >
                <div className="col-span-4 flex items-center gap-2 text-ink-100 truncate">
                  {isBest && <Trophy className="w-4 h-4 text-gold-400 shrink-0" />}
                  <span className="truncate">{s.label}</span>
                </div>
                <div className="col-span-2 text-right tabular-nums text-ink-200">{fmtDuration(s.durationMs)}</div>
                <div className="col-span-2 text-right tabular-nums text-gold-400">{fmtNumber(s.fame)}</div>
                <div className="col-span-2 text-right tabular-nums text-gold-500">{fmtNumber(Math.round(s.fph))}</div>
                <div className="col-span-1 text-ink-300 text-xs">
                  {new Date(s.date).toLocaleDateString('fr-FR')}
                </div>
                <div className="col-span-1 flex justify-end">
                  <button
                    onClick={() => removeSession(s.id)}
                    className="text-ink-400 hover:text-blood-400 p-1.5 rounded hover:bg-bg-700"
                  >
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
