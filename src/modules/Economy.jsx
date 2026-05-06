import { useMemo, useState } from 'react'
import { Plus, Trash2, Flame, Store, Trophy } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { fmtSilver, fmtPct, parseNumber, uid } from '../lib/format'

function RefiningCalculator() {
  const [state, setState] = useLocalStorage('economy.refining', {
    rawPrice: 1200,
    refinedPrice: 5000,
    rraPercent: 36.7,
    rawPerRefined: 2,
    fee: 4.5,
  })

  const set = (k) => (e) => setState({ ...state, [k]: parseNumber(e.target.value) })

  const calc = useMemo(() => {
    const rawCost = state.rawPrice * state.rawPerRefined * (1 - state.rraPercent / 100)
    const taxes = state.refinedPrice * (state.fee / 100)
    const netRevenue = state.refinedPrice - taxes
    const profit = netRevenue - rawCost
    const margin = rawCost > 0 ? (profit / rawCost) * 100 : 0
    return { rawCost, taxes, netRevenue, profit, margin }
  }, [state])

  const positive = calc.profit >= 0

  return (
    <section className="card">
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-gold-400" />
          <h2 className="card-title">Calculateur d'Affinage</h2>
        </div>
        <span className="pill border-gold-600/40 text-gold-400">RRA = Resource Return Rate</span>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div>
          <label className="label">Prix brut (matière)</label>
          <input className="input" type="number" min="0" value={state.rawPrice} onChange={set('rawPrice')} />
        </div>
        <div>
          <label className="label">Brut / raffiné</label>
          <input className="input" type="number" min="1" step="0.1" value={state.rawPerRefined} onChange={set('rawPerRefined')} />
        </div>
        <div>
          <label className="label">RRA (%)</label>
          <input className="input" type="number" min="0" max="100" step="0.1" value={state.rraPercent} onChange={set('rraPercent')} />
        </div>
        <div>
          <label className="label">Prix de revente</label>
          <input className="input" type="number" min="0" value={state.refinedPrice} onChange={set('refinedPrice')} />
        </div>
        <div>
          <label className="label">Taxes marché (%)</label>
          <input className="input" type="number" min="0" step="0.1" value={state.fee} onChange={set('fee')} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
        <div className="stat">
          <span className="stat-label">Coût ressource (RRA appliqué)</span>
          <span className="stat-value text-ink-200">{fmtSilver(calc.rawCost)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Taxes</span>
          <span className="stat-value text-blood-400">−{fmtSilver(calc.taxes)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Revenu net</span>
          <span className="stat-value text-ink-100">{fmtSilver(calc.netRevenue)}</span>
        </div>
        <div className={['stat', positive ? 'border-gold-600/50 shadow-gold' : 'border-blood-600/50 shadow-blood'].join(' ')}>
          <span className="stat-label">Profit net</span>
          <span className={['stat-value', positive ? 'text-gold-400' : 'text-blood-400'].join(' ')}>
            {fmtSilver(calc.profit)}
          </span>
          <span className={['text-xs', positive ? 'text-gold-500' : 'text-blood-400'].join(' ')}>
            Marge {fmtPct(calc.margin)}
          </span>
        </div>
      </div>
    </section>
  )
}

function FlipTracker() {
  const [items, setItems] = useLocalStorage('economy.flips', [
    { id: uid(), name: 'Cape Mercenaire 8.0', city: 240000, bm: 480000, qty: 1 },
    { id: uid(), name: 'Bâton Sacré 8.3', city: 1100000, bm: 1850000, qty: 1 },
  ])
  const [draft, setDraft] = useState({ name: '', city: '', bm: '', qty: 1 })

  const add = () => {
    if (!draft.name.trim()) return
    setItems([
      ...items,
      {
        id: uid(),
        name: draft.name.trim(),
        city: parseNumber(draft.city),
        bm: parseNumber(draft.bm),
        qty: Math.max(1, parseNumber(draft.qty) || 1),
      },
    ])
    setDraft({ name: '', city: '', bm: '', qty: 1 })
  }

  const remove = (id) => setItems(items.filter((i) => i.id !== id))
  const patch = (id, k, v) =>
    setItems(items.map((i) => (i.id === id ? { ...i, [k]: k === 'name' ? v : parseNumber(v) } : i)))

  const enriched = useMemo(() => {
    const fee = 0.04 // 4% marché noir
    return items
      .map((i) => {
        const sale = i.bm * (1 - fee)
        const spread = sale - i.city
        const margin = i.city > 0 ? (spread / i.city) * 100 : 0
        const total = spread * (i.qty || 1)
        return { ...i, sale, spread, margin, total }
      })
      .sort((a, b) => b.margin - a.margin)
  }, [items])

  const best = enriched[0]
  const totalProfit = enriched.reduce((s, i) => s + i.total, 0)

  return (
    <section className="card">
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5 text-gold-400" />
          <h2 className="card-title">Flip — Ville Royale → Marché Noir</h2>
        </div>
        <span className="pill border-blood-600/40 text-blood-400">Taxe BM 4%</span>
      </header>

      <div className="grid grid-cols-12 gap-2 mb-3">
        <input
          className="input col-span-12 md:col-span-5"
          placeholder="Nom de l'objet (ex: Bâton Sacré 8.3)"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <input
          className="input col-span-4 md:col-span-2"
          placeholder="Achat ville"
          type="number"
          value={draft.city}
          onChange={(e) => setDraft({ ...draft, city: e.target.value })}
        />
        <input
          className="input col-span-4 md:col-span-2"
          placeholder="Vente BM"
          type="number"
          value={draft.bm}
          onChange={(e) => setDraft({ ...draft, bm: e.target.value })}
        />
        <input
          className="input col-span-2 md:col-span-1"
          placeholder="Qté"
          type="number"
          min="1"
          value={draft.qty}
          onChange={(e) => setDraft({ ...draft, qty: e.target.value })}
        />
        <button onClick={add} className="btn-gold col-span-2 md:col-span-2 justify-center">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      <div className="grid grid-cols-12 px-3 py-2 text-[11px] uppercase tracking-widest text-ink-300 border-b border-bg-600">
        <div className="col-span-4">Objet</div>
        <div className="col-span-2 text-right">Achat ville</div>
        <div className="col-span-2 text-right">Vente BM</div>
        <div className="col-span-1 text-right">Qté</div>
        <div className="col-span-2 text-right">Spread / Marge</div>
        <div className="col-span-1"></div>
      </div>

      <ul className="divide-y divide-bg-700/60">
        {enriched.length === 0 && (
          <li className="px-3 py-8 text-center text-ink-300 text-sm">
            Ajoutez votre premier flip pour commencer à traquer les marges.
          </li>
        )}
        {enriched.map((i) => {
          const isBest = best && i.id === best.id && i.margin > 0
          const positive = i.spread >= 0
          return (
            <li
              key={i.id}
              className={[
                'grid grid-cols-12 items-center gap-2 px-3 py-2 transition',
                isBest ? 'bg-gold-600/5 border-l-2 border-gold-500' : '',
              ].join(' ')}
            >
              <div className="col-span-4 flex items-center gap-2">
                {isBest && <Trophy className="w-4 h-4 text-gold-400 shrink-0" />}
                <input
                  className="input !py-1 !px-2 text-sm bg-transparent border-transparent hover:border-bg-600 focus:bg-bg-900/50"
                  value={i.name}
                  onChange={(e) => patch(i.id, 'name', e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <input
                  className="input !py-1 !px-2 text-right text-sm"
                  type="number"
                  value={i.city}
                  onChange={(e) => patch(i.id, 'city', e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <input
                  className="input !py-1 !px-2 text-right text-sm"
                  type="number"
                  value={i.bm}
                  onChange={(e) => patch(i.id, 'bm', e.target.value)}
                />
              </div>
              <div className="col-span-1">
                <input
                  className="input !py-1 !px-2 text-right text-sm"
                  type="number"
                  min="1"
                  value={i.qty}
                  onChange={(e) => patch(i.id, 'qty', e.target.value)}
                />
              </div>
              <div className="col-span-2 text-right">
                <div className={['text-sm font-medium', positive ? 'text-gold-400' : 'text-blood-400'].join(' ')}>
                  {fmtSilver(i.spread)}
                </div>
                <div className={['text-[11px]', positive ? 'text-gold-500' : 'text-blood-400'].join(' ')}>
                  {fmtPct(i.margin)}
                </div>
              </div>
              <div className="col-span-1 flex justify-end">
                <button onClick={() => remove(i.id)} className="text-ink-400 hover:text-blood-400 p-1.5 rounded hover:bg-bg-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      {enriched.length > 0 && (
        <footer className="flex items-center justify-between mt-4 pt-3 border-t border-bg-700 text-sm">
          <span className="text-ink-300">
            {enriched.length} objet{enriched.length > 1 ? 's' : ''} suivi{enriched.length > 1 ? 's' : ''}
          </span>
          <span>
            Profit total potentiel:{' '}
            <span className={['font-display', totalProfit >= 0 ? 'text-gold-400' : 'text-blood-400'].join(' ')}>
              {fmtSilver(totalProfit)}
            </span>
          </span>
        </footer>
      )}
    </section>
  )
}

export default function Economy() {
  return (
    <div className="space-y-6">
      <RefiningCalculator />
      <FlipTracker />
    </div>
  )
}
