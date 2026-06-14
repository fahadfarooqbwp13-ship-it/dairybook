import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { buildSeed, emptyFarm } from './seed.js'
import { today } from '../lib/date.js'
import { speciesInfo } from '../lib/domain.js'

const uid = (p) => `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`

// every record collection (used by the generic edit / soft-delete actions)
export const COLLECTIONS = [
  'animals', 'milkLogs', 'bulkMilk', 'buyers', 'deliveries', 'payments', 'expenses',
  'employees', 'salaryPayments', 'breedingEvents', 'vaccinations',
  'healthEvents', 'medicines', 'medicineLogs', 'transactions',
]

// snapshot only the data slices we mutate, for one-step undo
const SNAP_KEYS = [...COLLECTIONS, 'recycleBin']
const snapshot = (s) => Object.fromEntries(SNAP_KEYS.map((k) => [k, s[k]]))

export const useStore = create(
  persist(
    (set, get) => ({
      lang: 'ur',
      ...buildSeed(),
      _undo: null, // transient (not persisted)

      // ---- settings ----
      toggleLang: () => set((s) => ({ lang: s.lang === 'ur' ? 'en' : 'ur' })),
      setFarm: (farmName, ownerName) => set({ farmName, ownerName }),
      setOnboarded: (v = true) => set({ onboarded: v }),
      resetDemo: () => set({ ...buildSeed(), _undo: null }),

      // ---- undo ----
      _mark: () => set((s) => ({ _undo: snapshot(s) })),
      undo: () => set((s) => (s._undo ? { ...s._undo, _undo: null } : s)),
      clearUndo: () => set({ _undo: null }),

      // ---- milk ----
      // upsert one animal's milk for a date (morning/evening in liters)
      upsertMilk: (animalId, date, morning, evening) => {
        get()._mark()
        set((s) => {
          const i = s.milkLogs.findIndex((m) => m.animalId === animalId && m.date === date)
          const next = s.milkLogs.slice()
          const rec = {
            id: i >= 0 ? next[i].id : uid('m'),
            animalId,
            date,
            morning: +morning || 0,
            evening: +evening || 0,
          }
          if (i >= 0) next[i] = rec
          else next.push(rec)
          return { milkLogs: next }
        })
      },

      // quick "total milk" mode: one combined morning/evening figure for a date,
      // for when logging each animal is too slow (master prompt anti-burden rule)
      upsertBulkMilk: (date, morning, evening) => {
        get()._mark()
        set((s) => {
          const i = s.bulkMilk.findIndex((b) => b.date === date)
          const next = s.bulkMilk.slice()
          const rec = { id: i >= 0 ? next[i].id : uid('bm'), date, morning: +morning || 0, evening: +evening || 0 }
          if (i >= 0) next[i] = rec
          else next.push(rec)
          return { bulkMilk: next }
        })
      },

      // ---- animals ----
      addAnimal: (data) => {
        get()._mark()
        const a = {
          id: uid('a'),
          tag: '',
          name: '',
          species: 'cow',
          breed: '',
          sex: 'f',
          status: 'active',
          dob: '',
          weight: 0,
          emoji: speciesInfo(data.species).emoji,
          tint: speciesInfo(data.species).tint,
          createdAt: today(),
          ...data,
        }
        set((s) => ({ animals: [a, ...s.animals] }))
        return a.id
      },
      updateAnimal: (id, patch) => {
        get()._mark()
        set((s) => ({
          animals: s.animals.map((a) =>
            a.id === id
              ? {
                  ...a,
                  ...patch,
                  ...(patch.species
                    ? {
                        emoji: speciesInfo(patch.species).emoji,
                        tint: speciesInfo(patch.species).tint,
                      }
                    : {}),
                }
              : a,
          ),
        }))
      },

      // ---- buyers ----
      addBuyer: (data) => {
        get()._mark()
        const b = {
          id: uid('b'),
          name: '',
          phone: '',
          address: '',
          dailyQty: 0,
          rate: 0,
          cycleDays: 7,
          color: '#0277BD',
          createdAt: today(),
          ...data,
        }
        set((s) => ({ buyers: [...s.buyers, b] }))
        return b.id
      },
      updateBuyer: (id, patch) => {
        get()._mark()
        set((s) => ({ buyers: s.buyers.map((b) => (b.id === id ? { ...b, ...patch } : b)) }))
      },
      recordPayment: (buyerId, amount, note = '') => {
        get()._mark()
        set((s) => ({
          payments: [
            ...s.payments,
            { id: uid('p'), buyerId, date: today(), amount: +amount || 0, note },
          ],
        }))
      },

      // distribute a day's milk: replace that date's deliveries with new allocations
      // allocations: [{ buyerId, liters }]
      distribute: (date, allocations) => {
        get()._mark()
        set((s) => {
          const kept = s.deliveries.filter((d) => d.date !== date)
          const made = allocations
            .filter((al) => +al.liters > 0)
            .map((al) => {
              const b = s.buyers.find((x) => x.id === al.buyerId)
              const rate = b ? b.rate : 0
              return {
                id: uid('d'),
                buyerId: al.buyerId,
                date,
                liters: +al.liters,
                rate,
                amount: Math.round(+al.liters * rate),
              }
            })
          return { deliveries: [...kept, ...made] }
        })
      },

      // ---- expenses ----
      addExpense: (category, amount, note = '') => {
        get()._mark()
        set((s) => ({
          expenses: [
            { id: uid('e'), category, amount: +amount || 0, note, date: today() },
            ...s.expenses,
          ],
        }))
      },

      // ---- employees & salaries (Module 3) ----
      addEmployee: (data) => {
        get()._mark()
        const e = { id: uid('emp'), name: '', role: 'worker', salary: 0, joinDate: today(), active: true, ...data }
        set((s) => ({ employees: [...s.employees, e] }))
        return e.id
      },
      paySalary: (employeeId, amount, monthDate = today()) => {
        get()._mark()
        const d = new Date(monthDate + 'T00:00:00')
        set((s) => ({
          salaryPayments: [
            ...s.salaryPayments,
            { id: uid('sp'), employeeId, month: d.getMonth(), year: d.getFullYear(), amount: +amount || 0, date: today(), note: '' },
          ],
        }))
      },

      // ---- breeding (Module 6) ----
      addBreedingEvent: (data) => {
        get()._mark()
        const b = { id: uid('br'), type: 'heat', date: today(), method: '', aiDetails: '', partnerId: '', expectedCalving: '', outcome: '', offspringId: '', ...data }
        set((s) => ({ breedingEvents: [...s.breedingEvents, b] }))
        return b.id
      },
      // record a calving: register the calf, link it, set mother active
      recordCalving: (motherId, { date = today(), sex = 'f', weight = 0, outcome = 'live', species, tag = '', name = '' } = {}) => {
        get()._mark()
        const calfId = uid('a')
        set((s) => {
          const mother = s.animals.find((a) => a.id === motherId)
          const sp = species || mother?.species || 'cow'
          const calf = {
            id: calfId, tag: tag || '', name: name || '', species: sp, breed: mother?.breed || '', sex,
            status: 'calf', dob: date, weight: +weight || 0,
            emoji: speciesInfo(sp).emoji, tint: speciesInfo(sp).tint,
            motherId, createdAt: today(),
          }
          return {
            animals: [calf, ...s.animals.map((a) => (a.id === motherId ? { ...a, status: 'active' } : a))],
            breedingEvents: [
              ...s.breedingEvents,
              { id: uid('br'), animalId: motherId, type: 'calving', date, method: '', aiDetails: '', partnerId: '', expectedCalving: '', outcome, offspringId: calfId },
            ],
          }
        })
        return calfId
      },

      // ---- health & vaccines (Module 7) ----
      markVaccineDone: (vacId, nextDue) => {
        get()._mark()
        set((s) => ({
          vaccinations: s.vaccinations.map((v) =>
            v.id === vacId ? { ...v, givenDate: today(), nextDue: nextDue || v.nextDue } : v,
          ),
        }))
      },
      addVaccination: (data) => {
        get()._mark()
        const v = { id: uid('vac'), vaccine: 'fmd', givenDate: today(), nextDue: '', vet: '', cost: 0, batch: '', ...data }
        set((s) => ({ vaccinations: [...s.vaccinations, v] }))
        return v.id
      },
      addHealthEvent: (data) => {
        get()._mark()
        const h = { id: uid('he'), symptoms: [], diagnosis: '', treatment: '', medicine: '', cost: 0, date: today(), resolvedDate: '', notes: '', ...data }
        set((s) => ({ healthEvents: [h, ...s.healthEvents] }))
        return h.id
      },
      resolveHealthEvent: (id) => {
        get()._mark()
        set((s) => ({ healthEvents: s.healthEvents.map((h) => (h.id === id ? { ...h, resolvedDate: today() } : h)) }))
      },
      addMedicine: (data) => {
        get()._mark()
        const m = { id: uid('med'), name: '', qty: 0, unit: '', expiry: '', ...data }
        set((s) => ({ medicines: [...s.medicines, m] }))
        return m.id
      },
      adjustMedicine: (id, delta) => {
        get()._mark()
        set((s) => ({ medicines: s.medicines.map((m) => (m.id === id ? { ...m, qty: Math.max(0, m.qty + delta) } : m)) }))
      },
      // a medicine GIVEN to an animal (treatment log)
      addMedicineLog: (data) => {
        get()._mark()
        const r = { id: uid('ml'), animalId: '', name: '', dose: '', date: today(), days: 0, ...data }
        set((s) => ({ medicineLogs: [r, ...s.medicineLogs] }))
        return r.id
      },

      // ---- custom calendar reminders (Module 8) ----
      addCustomAlert: (date, text) => set((s) => ({
        customAlerts: [{ id: uid('al'), date, text: (text || '').trim(), notified: false }, ...s.customAlerts],
      })),
      removeCustomAlert: (id) => set((s) => ({ customAlerts: s.customAlerts.filter((a) => a.id !== id) })),
      markAlertNotified: (id) => set((s) => ({ customAlerts: s.customAlerts.map((a) => (a.id === id ? { ...a, notified: true } : a)) })),

      // ---- buy/sell (Module 10) ----
      addPurchase: (data) => {
        get()._mark()
        const animalId = uid('a')
        set((s) => {
          const sp = data.species || 'cow'
          const animal = {
            id: animalId, tag: data.tag || '?', name: data.name || '', species: sp, breed: data.breed || '',
            sex: data.sex || 'f', status: 'active', dob: data.dob || '', weight: +data.weight || 0,
            emoji: speciesInfo(sp).emoji, tint: speciesInfo(sp).tint, createdAt: today(),
          }
          return {
            animals: [animal, ...s.animals],
            transactions: [
              { id: uid('tx'), animalId, type: 'buy', counterparty: data.counterparty || '', price: +data.price || 0, weight: +data.weight || 0, date: data.date || today(), notes: data.notes || '' },
              ...s.transactions,
            ],
          }
        })
        return animalId
      },
      addSale: (animalId, data) => {
        get()._mark()
        set((s) => ({
          animals: s.animals.map((a) => (a.id === animalId ? { ...a, status: 'sold' } : a)),
          transactions: [
            { id: uid('tx'), animalId, type: 'sell', counterparty: data.counterparty || '', price: +data.price || 0, weight: +data.weight || 0, date: data.date || today(), notes: data.notes || '' },
            ...s.transactions,
          ],
        }))
      },

      // ---- generic edit + soft delete + recycle bin (applies to EVERY record) ----
      // edit any field of any record in any collection
      updateRecord: (collection, id, patch) => {
        get()._mark()
        set((s) => ({ [collection]: s[collection].map((r) => (r.id === id ? { ...r, ...patch } : r)) }))
      },
      // soft delete → moves the record to the recycle bin (never hard-deleted)
      softDelete: (collection, id) => {
        get()._mark()
        set((s) => {
          const rec = s[collection].find((r) => r.id === id)
          if (!rec) return {}
          return {
            [collection]: s[collection].filter((r) => r.id !== id),
            recycleBin: [
              { binId: uid('bin'), collection, record: rec, deletedAt: new Date().toISOString() },
              ...s.recycleBin,
            ],
          }
        })
      },
      // restore from recycle bin back into its original collection
      restoreRecord: (binId) => {
        get()._mark()
        set((s) => {
          const item = s.recycleBin.find((b) => b.binId === binId)
          if (!item) return {}
          return {
            [item.collection]: [item.record, ...s[item.collection]],
            recycleBin: s.recycleBin.filter((b) => b.binId !== binId),
          }
        })
      },
      // permanent delete — only ever called from the recycle bin, after confirm
      permanentDelete: (binId) => {
        get()._mark()
        set((s) => ({ recycleBin: s.recycleBin.filter((b) => b.binId !== binId) }))
      },
      emptyRecycleBin: () => {
        get()._mark()
        set({ recycleBin: [] })
      },

      // ---- danger zone (fresh start / clear) ----
      newFarm: () => set({ ...emptyFarm(), lang: get().lang, _undo: null }),
      clearAnimals: () => {
        get()._mark()
        set({ animals: [], milkLogs: [], bulkMilk: [], breedingEvents: [], vaccinations: [], healthEvents: [] })
      },

      // ---- backup (Module 11) ----
      setLastBackup: (iso) => set({ lastBackupAt: iso || new Date().toISOString() }),
      importData: (data) => {
        const allowed = [...SNAP_KEYS, 'farmName', 'ownerName', 'lastBackupAt']
        const next = {}
        allowed.forEach((k) => { if (data[k] !== undefined) next[k] = data[k] })
        set({ ...next, _undo: null })
      },
    }),
    {
      name: 'gaesathi-storage',
      version: 6,
      migrate: (persisted, version) => {
        if (!persisted) return undefined
        // v1 (pre health/breeding/trade slices) had inconsistent ids → reseed.
        if (version < 2) return { ...buildSeed(), lang: persisted.lang || 'ur' }
        // v2+ → latest: merge in any new slices, keep the user's real data.
        return {
          ...buildSeed(),
          ...persisted,
          bulkMilk: persisted.bulkMilk || [],
          recycleBin: persisted.recycleBin || [],
          medicineLogs: persisted.medicineLogs || [],
          customAlerts: persisted.customAlerts || [],
          onboarded: persisted.onboarded ?? true, // existing users are already set up
        }
      },
      partialize: (s) => {
        const { _undo, ...rest } = s
        return rest
      },
    },
  ),
)

// expose for console/automation seeding (matches rayyan-app convention)
if (typeof window !== 'undefined') {
  window.appStore = useStore
}
