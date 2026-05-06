export const fmtSilver = (n) => {
  if (n == null || isNaN(n)) return '—'
  const v = Math.round(Number(n))
  return v.toLocaleString('fr-FR') + ' s'
}

export const fmtPct = (n, digits = 1) => {
  if (n == null || isNaN(n)) return '—'
  return `${Number(n).toFixed(digits)}%`
}

export const fmtNumber = (n) => {
  if (n == null || isNaN(n)) return '—'
  return Number(n).toLocaleString('fr-FR')
}

export const parseNumber = (v) => {
  if (v === '' || v == null) return 0
  const n = Number(String(v).replace(/[\s,]/g, '').replace(',', '.'))
  return isNaN(n) ? 0 : n
}

export const uid = () =>
  Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4)
