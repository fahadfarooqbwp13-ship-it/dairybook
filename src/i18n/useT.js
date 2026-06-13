import { useStore } from '../store/useStore.js'
import { tr } from './strings.js'

// useT() → { t, lang, dir }
export function useT() {
  const lang = useStore((s) => s.lang)
  return {
    lang,
    dir: lang === 'ur' ? 'rtl' : 'ltr',
    t: (key) => tr(key, lang),
  }
}
