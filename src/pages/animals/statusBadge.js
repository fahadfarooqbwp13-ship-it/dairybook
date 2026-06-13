// Shared status badge styling for animals.
export const STATUS = {
  active: { key: 'animals_active', emoji: '✅', cls: 'bg-ok/15 text-ok' },
  pregnant: { key: 'animals_pregnant', emoji: '🤰', cls: 'bg-rose/15 text-rose' },
  calf: { key: 'animals_calf', emoji: '🍼', cls: 'bg-sky/15 text-sky' },
  sold: { key: 'animals_sold', emoji: '💰', cls: 'bg-gold/20 text-[#8a6d00]' },
  dead: { key: 'animals_dead', emoji: '☠️', cls: 'bg-black/10 text-muted' },
}

// age from dob → "4 سال" / "8 ماہ"
export function ageText(dob, t) {
  if (!dob) return '—'
  const d = new Date(dob + 'T00:00:00')
  const months = Math.max(0, Math.round((Date.now() - d) / (86400000 * 30.44)))
  if (months < 18) return `${months} ${t('animals_months')}`
  return `${Math.floor(months / 12)} ${t('animals_years')}`
}
