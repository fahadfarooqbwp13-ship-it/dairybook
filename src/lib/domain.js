// Domain reference data for the farm modules. Urdu labels are inline because
// the app is Urdu-first; English is provided where a toggle reads it.

// ---- animal species (Module 5) ----
export const SPECIES = [
  { id: 'cow', ur: 'گائے', en: 'Cow', emoji: '🐄', tint: '#FDE7C9' },
  { id: 'buffalo', ur: 'بھینس', en: 'Buffalo', emoji: '🐃', tint: '#E3E0F2' },
  { id: 'goat', ur: 'بکری', en: 'Goat', emoji: '🐐', tint: '#E8F0D8' },
  { id: 'sheep', ur: 'بھیڑ', en: 'Sheep', emoji: '🐑', tint: '#F0E8F8' },
  { id: 'camel', ur: 'اونٹ', en: 'Camel', emoji: '🐪', tint: '#F3E6D0' },
  { id: 'horse', ur: 'گھوڑا', en: 'Horse', emoji: '🐎', tint: '#E6D8C8' },
  { id: 'donkey', ur: 'گدھا', en: 'Donkey', emoji: '🫏', tint: '#E2E2E2' },
  { id: 'hen', ur: 'مرغی', en: 'Hen', emoji: '🐔', tint: '#FDEBD0' },
  { id: 'other', ur: 'دیگر', en: 'Other', emoji: '🐾', tint: '#E8E8E8' },
]
export const speciesInfo = (id) => SPECIES.find((s) => s.id === id) || SPECIES[0]
export const speciesLabel = (id, lang = 'ur') => speciesInfo(id)[lang]

// ---- expense categories (Module 3) ----
export const EXPENSE_CATS = [
  { id: 'feed', icon: '🌾', ur: 'چارہ', en: 'Feed', color: '#2E7D32' },
  { id: 'medicine', icon: '💊', ur: 'دوائیں', en: 'Medicine', color: '#B71C1C' },
  { id: 'salary', icon: '👨‍🌾', ur: 'تنخواہیں', en: 'Salaries', color: '#4527A0' },
  { id: 'utilities', icon: '⚡', ur: 'بجلی/پانی', en: 'Utilities', color: '#F9A825' },
  { id: 'repairs', icon: '🔧', ur: 'مرمت', en: 'Repairs', color: '#5D4037' },
  { id: 'transport', icon: '🚛', ur: 'ٹرانسپورٹ', en: 'Transport', color: '#0277BD' },
  { id: 'vet', icon: '🏥', ur: 'ڈاکٹر فیس', en: 'Vet fees', color: '#AD1457' },
  { id: 'other', icon: '📦', ur: 'دیگر', en: 'Other', color: '#607D8B' },
]
export const expenseCat = (id) => EXPENSE_CATS.find((c) => c.id === id) || EXPENSE_CATS[7]

// ---- employee roles (Module 3) ----
export const ROLES = [
  { id: 'guard', ur: 'چوکیدار', en: 'Guard' },
  { id: 'worker', ur: 'ملازم', en: 'Worker' },
  { id: 'driver', ur: 'ڈرائیور', en: 'Driver' },
  { id: 'milker', ur: 'دودھ دوہنے والا', en: 'Milker' },
]
export const roleLabel = (id, lang) => (ROLES.find((r) => r.id === id) || ROLES[1])[lang] || id

// ---- Pakistan vaccination schedule (Module 7), pre-loaded ----
// monthsDue: which calendar months (1-12) the vaccine is normally given
export const VACCINES = [
  { id: 'fmd', ur: 'منہ کھر (FMD)', en: 'FMD', monthsDue: [3, 9], every: 6 },
  { id: 'hs', ur: 'گلا گھوٹو (HS)', en: 'HS', monthsDue: [4], every: 12 },
  { id: 'bq', ur: 'لنگڑا بخار (BQ)', en: 'BQ', monthsDue: [4], every: 12 },
  { id: 'anthrax', ur: 'اینتھریکس', en: 'Anthrax', monthsDue: [4], every: 12 },
  { id: 'brucellosis', ur: 'بروسیلوسس', en: 'Brucellosis', monthsDue: [], every: 0 },
  { id: 'ppr', ur: 'پی پی آر', en: 'PPR', monthsDue: [1], every: 12 },
]
export const vaccineLabel = (id, lang) => {
  const v = VACCINES.find((x) => x.id === id)
  return v ? v[lang] : id
}

// ---- illness symptoms (Module 7), illustrated picker ----
export const SYMPTOMS = [
  { id: 'fever', icon: '🌡️', ur: 'بخار' },
  { id: 'limp', icon: '🦵', ur: 'لنگڑانا' },
  { id: 'diarrhea', icon: '💧', ur: 'دست' },
  { id: 'cough', icon: '😮‍💨', ur: 'کھانسی' },
  { id: 'noappetite', icon: '🍽️', ur: 'بھوک نہ لگنا' },
  { id: 'lowmilk', icon: '🥛', ur: 'دودھ کم' },
  { id: 'blisters', icon: '👅', ur: 'چھالے' },
  { id: 'eye', icon: '👁️', ur: 'آنکھ بہنا' },
]
export const symptomLabel = (id) => (SYMPTOMS.find((s) => s.id === id) || {}).ur || id

// gestation length for cows/buffalo (days) — Module 6
export const GESTATION_DAYS = 283
