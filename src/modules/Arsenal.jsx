import { useMemo, useState } from 'react'
import { Plus, Trash2, Shield, Skull, Wallet, AlertTriangle } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { fmtSilver, fmtPct, parseNumber, uid } from '../lib/format'

const RISK_THRESHOLD = 0.20 // 20% de la fortune = limite "gear fear"

export default function Arsenal({ fortune, setFortune }) {
  const [loadouts, setLoadouts] = useLocalStorage('arsenal.loadouts', [
    { id: uid(), name: 'PvE Solo Donjons', cost: 250000, role: 'PvE',  notes: 'Stuff de farm' },
    { id: uid(), name: 'ZvZ Tanky',        cost: 1800000, role: 'ZvZ', notes: 'Plate + masse' },
  ])
  const [draft, setDraft] = useState({ name: '', cost: '', role: 'PvP', notes: '' })

  const add = () => {
    if (!draft.name.trim()) return
    setLoadouts([
      ...loadouts,
      { id: uid(), name: draft.name.trim(), cost: parseNumber(draft.cost), role: draft.role, notes: draft.notes.trim() },
    ])
    setDraft({ name: '', cost: '', role: 'PvP', notes: '' })
  }

  const remove = (id) => setLoadouts(loadouts.filter((l) => l.id !== id))
  const patch = (id, k, v) =>
    setLoadouts(loadouts.map((l) => (l.id === id ? { ...l, [k]: k === 'cost' ? parseNumber(v) : v } : l)))

  const safeBudget = Math.max(0, fortune * RISK_THRESHOLD)
  const totalLoadoutValue = loadouts.reduce((s, l) => s + (l.cost || 0), 0)

  const enriched = useMemo(
    () =>
      loadouts.map((l) => {
        const ratio = l.cost > 0 ? safeBudget / l.cost : Infinity
        const pctOfFortune = fortune > 0 ? (l.cost / fortune) * 100 : 0
        let zone = 'safe'
        if (pctOfFortune > RISK_THRESHOLD * 100) zone = 'danger'
        else if (pctOfFortune > RISK_THRESHOLD * 100 * 0.5) zone = 'warn'
        return { ...l, ratio, pctOfFortune, zone }
      }),
    [loadouts, safeBudget, fortune],
  )

  return (
    <div className="space-y-6">
      <section className="card">
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-gold-400" />
            <h2 className="card-title">Budget & Tolérance au Risque</h2>
          </div>
          <span className="pill border-blood-600/40 text-blood-400">
            <AlertTriangle className="w-3 h-3" /> Seuil 20%
          </span>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="label">Fortune totale (silver)</label>
            <input
              className="input"
              type="number"
              min="0"
              value={fortune}
              onChange={(e) => setFortune(parseNumber(e.target.value))}
              placeholder="Ex: 50000000"
            />
          </div>
          <div className="stat">
            <span className="stat-label">Budget "perdable" (20%)</span>
            <span className="stat-value text-gold-400">{fmtSilver(safeBudget)}</span>
            <span className="text-[11px] text-ink-300">Au-delà, c'est de la dette émotionnelle.</span>
          </div>
          <div className="stat">
            <span className="stat-label">Valeur cumulée des loadouts</span>
            <span className="stat-value text-ink-100">{fmtSilver(totalLoadoutValue)}</span>
            <span className="text-[11px] text-ink-300">
              {loadouts.length} set{loadouts.length > 1 ? 's' : ''} enregistré{loadouts.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </section>

      <section className="card">
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-gold-400" />
            <h2 className="card-title">Loadouts & Risk Ratio</h2>
          </div>
          <span className="text-xs text-ink-300">
            Risk Ratio = combien de morts avant d'atteindre 20% de la fortune
          </span>
        </header>

        <div className="grid grid-cols-12 gap-2 mb-3">
          <input
            className="input col-span-12 md:col-span-4"
            placeholder="Nom du loadout (ex: ZvZ Tank)"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && add()}
          />
          <input
            className="input col-span-6 md:col-span-2"
            placeholder="Coût total"
            type="number"
            min="0"
            value={draft.cost}
            onChange={(e) => setDraft({ ...draft, cost: e.target.value })}
          />
          <select
            className="input col-span-6 md:col-span-2"
            value={draft.role}
            onChange={(e) => setDraft({ ...draft, role: e.target.value })}
          >
            <option value="PvE">PvE</option>
            <option value="PvP">PvP</option>
            <option value="ZvZ">ZvZ</option>
            <option value="Gank">Gank</option>
            <option value="HCE">HCE</option>
            <option value="Avalon">Avalon</option>
          </select>
          <input
            className="input col-span-12 md:col-span-2"
            placeholder="Notes"
            value={draft.notes}
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
          />
          <button onClick={add} className="btn-gold col-span-12 md:col-span-2 justify-center">
            <Plus className="w-4 h-4" /> Ajouter
          </button>
        </div>

        <div className="grid grid-cols-12 px-3 py-2 text-[11px] uppercase tracking-widest text-ink-300 border-b border-bg-600">
          <div className="col-span-3">Loadout</div>
          <div className="col-span-1">Rôle</div>
          <div className="col-span-2 text-right">Coût</div>
          <div className="col-span-2 text-right">% Fortune</div>
          <div className="col-span-2 text-right">Risk Ratio</div>
          <div className="col-span-1">Notes</div>
          <div className="col-span-1"></div>
        </div>

        <ul className="divide-y divide-bg-700/60">
          {enriched.length === 0 && (
            <li className="px-3 py-8 text-center text-ink-300 text-sm">
              Aucun loadout. Ajoutez votre premier set pour évaluer votre exposition au risque.
            </li>
          )}
          {enriched.map((l) => {
            const zoneStyles = {
              safe:   { bar: 'bg-gold-500',  text: 'text-gold-400',  border: '' },
              warn:   { bar: 'bg-gold-600',  text: 'text-gold-500',  border: '' },
              danger: { bar: 'bg-blood-500', text: 'text-blood-400', border: 'border-l-2 border-blood-500' },
            }[l.zone]
            const ratioDisplay = l.ratio === Infinity ? '∞' : l.ratio.toFixed(1) + '×'
            return (
              <li
                key={l.id}
                className={['grid grid-cols-12 items-center gap-2 px-3 py-2.5', zoneStyles.border].join(' ')}
              >
                <div className="col-span-3">
                  <input
                    className="input !py-1 !px-2 text-sm bg-transparent border-transparent hover:border-bg-600 focus:bg-bg-900/50"
                    value={l.name}
                    onChange={(e) => patch(l.id, 'name', e.target.value)}
                  />
                </div>
                <div className="col-span-1">
                  <span className="pill border-bg-600 text-ink-200">{l.role}</span>
                </div>
                <div className="col-span-2">
                  <input
                    className="input !py-1 !px-2 text-right text-sm"
                    type="number"
                    value={l.cost}
                    onChange={(e) => patch(l.id, 'cost', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-2 justify-end">
                    <div className="flex-1 h-1.5 bg-bg-700 rounded-full overflow-hidden">
                      <div
                        className={['h-full', zoneStyles.bar].join(' ')}
                        style={{ width: `${Math.min(100, l.pctOfFortune)}%` }}
                      />
                    </div>
                    <span className={['text-xs tabular-nums w-12 text-right', zoneStyles.text].join(' ')}>
                      {fmtPct(l.pctOfFortune)}
                    </span>
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  <div className={['font-display text-base', zoneStyles.text].join(' ')}>
                    {ratioDisplay}
                  </div>
                  <div className="flex items-center gap-1 justify-end text-[11px] text-ink-300">
                    <Skull className="w-3 h-3" /> morts avant seuil
                  </div>
                </div>
                <div className="col-span-1 text-xs text-ink-300 truncate" title={l.notes}>
                  {l.notes || '—'}
                </div>
                <div className="col-span-1 flex justify-end">
                  <button
                    onClick={() => remove(l.id)}
                    className="text-ink-400 hover:text-blood-400 p-1.5 rounded hover:bg-bg-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>

        {enriched.some((l) => l.zone === 'danger') && (
          <div className="mt-4 px-3 py-2 rounded-lg border border-blood-600/40 bg-blood-600/10 text-blood-400 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Au moins un loadout dépasse 20% de votre fortune — gear fear garanti en cas de mort.
          </div>
        )}
      </section>
    </div>
  )
}
