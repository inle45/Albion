import { useMemo, useState } from 'react'
import {
  Plus, Trash2, Shield, Skull, Wallet, AlertTriangle,
  CheckSquare, Square, RotateCcw, ChevronDown, ChevronRight,
} from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { fmtSilver, fmtPct, parseNumber, uid } from '../lib/format'

const RISK_THRESHOLD = 0.20 // 20% de la fortune = limite "gear fear"

const DEFAULT_CHECKLIST = () => [
  { id: uid(), label: 'Monture',  checked: false },
  { id: uid(), label: 'Bouffe',   checked: false },
  { id: uid(), label: 'Potions',  checked: false },
  { id: uid(), label: 'Capes',    checked: false },
]

const seed = () => [
  { id: uid(), name: 'PvE Solo Donjons', cost: 250000,  role: 'PvE', notes: 'Stuff de farm', checklist: DEFAULT_CHECKLIST() },
  { id: uid(), name: 'ZvZ Tanky',        cost: 1800000, role: 'ZvZ', notes: 'Plate + masse', checklist: DEFAULT_CHECKLIST() },
]

export default function Arsenal({ fortune, setFortune }) {
  const [loadouts, setLoadouts] = useLocalStorage('arsenal.loadouts', seed())
  const [draft, setDraft] = useState({ name: '', cost: '', role: 'PvP', notes: '' })
  const [openId, setOpenId] = useState(null)

  const add = () => {
    if (!draft.name.trim()) return
    setLoadouts([
      ...loadouts,
      {
        id: uid(),
        name: draft.name.trim(),
        cost: parseNumber(draft.cost),
        role: draft.role,
        notes: draft.notes.trim(),
        checklist: DEFAULT_CHECKLIST(),
      },
    ])
    setDraft({ name: '', cost: '', role: 'PvP', notes: '' })
  }

  const remove = (id) => setLoadouts(loadouts.filter((l) => l.id !== id))
  const patch = (id, k, v) =>
    setLoadouts(loadouts.map((l) => (l.id === id ? { ...l, [k]: k === 'cost' ? parseNumber(v) : v } : l)))

  // Checklist helpers
  const updateChecklist = (loadoutId, mutator) =>
    setLoadouts(loadouts.map((l) => (l.id === loadoutId ? { ...l, checklist: mutator(l.checklist || []) } : l)))

  const toggleItem = (loadoutId, itemId) =>
    updateChecklist(loadoutId, (cl) =>
      cl.map((i) => (i.id === itemId ? { ...i, checked: !i.checked } : i)),
    )

  const addItem = (loadoutId, label) => {
    const trimmed = label.trim()
    if (!trimmed) return
    updateChecklist(loadoutId, (cl) => [...cl, { id: uid(), label: trimmed, checked: false }])
  }

  const removeItem = (loadoutId, itemId) =>
    updateChecklist(loadoutId, (cl) => cl.filter((i) => i.id !== itemId))

  const resetChecklist = (loadoutId) =>
    updateChecklist(loadoutId, (cl) => cl.map((i) => ({ ...i, checked: false })))

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
        const cl = l.checklist || []
        const checkedCount = cl.filter((i) => i.checked).length
        return { ...l, ratio, pctOfFortune, zone, checklistTotal: cl.length, checkedCount }
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
            Risk Ratio = morts possibles avant d'atteindre 20% de la fortune
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

        <ul className="divide-y divide-bg-700/60">
          {enriched.length === 0 && (
            <li className="px-3 py-8 text-center text-ink-300 text-sm">
              Aucun loadout. Ajoutez votre premier set pour évaluer votre exposition au risque.
            </li>
          )}
          {enriched.map((l) => {
            const zoneStyles = {
              safe:   { bar: 'bg-gold-500',  text: 'text-gold-400',  border: 'border-bg-700' },
              warn:   { bar: 'bg-gold-600',  text: 'text-gold-500',  border: 'border-gold-600/40' },
              danger: { bar: 'bg-blood-500', text: 'text-blood-400', border: 'border-blood-600/40' },
            }[l.zone]
            const ratioDisplay = l.ratio === Infinity ? '∞' : l.ratio.toFixed(1) + '×'
            const open = openId === l.id

            return (
              <li key={l.id} className={['rounded-xl border my-1', zoneStyles.border].join(' ')}>
                <div className="grid grid-cols-12 items-center gap-2 px-3 py-2.5">
                  <button
                    onClick={() => setOpenId(open ? null : l.id)}
                    className="col-span-3 flex items-center gap-2 text-left"
                  >
                    {open ? <ChevronDown className="w-4 h-4 text-ink-300" /> : <ChevronRight className="w-4 h-4 text-ink-300" />}
                    <span className="text-sm font-medium text-ink-100 truncate">{l.name}</span>
                  </button>
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
                    <div className={['font-display text-base', zoneStyles.text].join(' ')}>{ratioDisplay}</div>
                    <div className="flex items-center gap-1 justify-end text-[11px] text-ink-300">
                      <Skull className="w-3 h-3" /> morts avant seuil
                    </div>
                  </div>
                  <div className="col-span-1 text-right">
                    <span
                      className={[
                        'pill',
                        l.checklistTotal > 0 && l.checkedCount === l.checklistTotal
                          ? 'border-gold-600/40 text-gold-400'
                          : 'border-bg-600 text-ink-300',
                      ].join(' ')}
                      title="Checklist avant départ"
                    >
                      {l.checkedCount}/{l.checklistTotal}
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => remove(l.id)}
                      className="text-ink-400 hover:text-blood-400 p-1.5 rounded hover:bg-bg-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {open && (
                  <ChecklistPanel
                    loadout={l}
                    onToggle={(itemId) => toggleItem(l.id, itemId)}
                    onAdd={(label) => addItem(l.id, label)}
                    onRemove={(itemId) => removeItem(l.id, itemId)}
                    onReset={() => resetChecklist(l.id)}
                    onPatchNotes={(v) => patch(l.id, 'notes', v)}
                  />
                )}
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

function ChecklistPanel({ loadout, onToggle, onAdd, onRemove, onReset, onPatchNotes }) {
  const [newItem, setNewItem] = useState('')
  const cl = loadout.checklist || []
  const allChecked = cl.length > 0 && cl.every((i) => i.checked)

  return (
    <div className="border-t border-bg-700 px-4 py-4 bg-bg-900/30 rounded-b-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-widest text-ink-300">
            Checklist avant départ
          </span>
          {allChecked && (
            <span className="pill border-gold-600/40 text-gold-400">Prêt à sortir</span>
          )}
        </div>
        <button onClick={onReset} className="btn-ghost text-xs">
          <RotateCcw className="w-3 h-3" /> Décocher tout
        </button>
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5 mb-3">
        {cl.map((item) => (
          <li
            key={item.id}
            className={[
              'group flex items-center gap-2 px-2 py-1.5 rounded-lg border cursor-pointer transition',
              item.checked
                ? 'border-gold-600/30 bg-gold-600/5'
                : 'border-bg-700 hover:border-bg-600 hover:bg-bg-700/40',
            ].join(' ')}
            onClick={() => onToggle(item.id)}
          >
            {item.checked ? (
              <CheckSquare className="w-4 h-4 text-gold-400 shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-ink-400 shrink-0" />
            )}
            <span className={['flex-1 text-sm', item.checked ? 'line-through text-ink-300' : 'text-ink-100'].join(' ')}>
              {item.label}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(item.id) }}
              className="opacity-0 group-hover:opacity-100 text-ink-400 hover:text-blood-400 p-1 rounded transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </li>
        ))}
      </ul>

      <div className="flex gap-2 mb-3">
        <input
          className="input flex-1"
          placeholder="Ajouter un item (ex: Gemme de soin)"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { onAdd(newItem); setNewItem('') }
          }}
        />
        <button
          onClick={() => { onAdd(newItem); setNewItem('') }}
          className="btn-gold"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea
          className="input resize-none"
          rows={2}
          value={loadout.notes || ''}
          onChange={(e) => onPatchNotes(e.target.value)}
          placeholder="Combos, gemmes, builds…"
        />
      </div>
    </div>
  )
}
