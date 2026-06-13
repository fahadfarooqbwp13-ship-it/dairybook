// Number / currency / liter formatting. Western digits in Roboto Mono
// (fixed-width) per the master prompt so money & liters align in tables.

export function rupees(n) {
  const v = Math.round(Number(n) || 0)
  return '₨' + v.toLocaleString('en-PK')
}

// plain integer with thousands separators (no symbol)
export function num(n) {
  return (Math.round(Number(n) || 0)).toLocaleString('en-PK')
}

// liters — keep one decimal only when needed
export function liters(n) {
  const v = Number(n) || 0
  const s = Number.isInteger(v) ? String(v) : v.toFixed(1)
  return s + 'L'
}

// raw liter number, trimmed (for inputs / chart labels)
export function lnum(n) {
  const v = Number(n) || 0
  return Number.isInteger(v) ? String(v) : v.toFixed(1)
}

export function pct(n) {
  const v = Math.round(Number(n) || 0)
  return (v > 0 ? '+' : '') + v + '%'
}
