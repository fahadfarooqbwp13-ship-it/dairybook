import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/Layout.jsx'
import { useT } from './i18n/useT.js'

import Home from './pages/Home.jsx'
import MilkHerd from './pages/milk/MilkHerd.jsx'
import MilkLog from './pages/milk/MilkLog.jsx'
import AnimalMilk from './pages/milk/AnimalMilk.jsx'
import AnimalList from './pages/animals/AnimalList.jsx'
import AnimalProfile from './pages/animals/AnimalProfile.jsx'
import AnimalEdit from './pages/animals/AnimalEdit.jsx'
import BuyerList from './pages/buyers/BuyerList.jsx'
import BuyerLedger from './pages/buyers/BuyerLedger.jsx'
import BillPreview from './pages/buyers/BillPreview.jsx'
import Distribute from './pages/buyers/Distribute.jsx'
import More from './pages/More.jsx'
import Expenses from './pages/expenses/Expenses.jsx'
import Reports from './pages/reports/Reports.jsx'
import Breeding from './pages/breeding/Breeding.jsx'
import Health from './pages/health/Health.jsx'
import Calendar from './pages/calendar/Calendar.jsx'
import Weather from './pages/weather/Weather.jsx'
import Trade from './pages/trade/Trade.jsx'
import Backup from './pages/backup/Backup.jsx'
import RecycleBin from './pages/RecycleBin.jsx'
import DayRecord from './pages/DayRecord.jsx'

export default function App() {
  const { dir, lang } = useT()
  // keep <html dir/lang> in sync with the language toggle
  useEffect(() => {
    document.documentElement.dir = dir
    document.documentElement.lang = lang
  }, [dir, lang])

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />

        <Route path="/milk" element={<MilkHerd />} />
        <Route path="/milk/log" element={<MilkLog />} />
        <Route path="/milk/animal/:id" element={<AnimalMilk />} />

        <Route path="/animals" element={<AnimalList />} />
        <Route path="/animals/new" element={<AnimalEdit />} />
        <Route path="/animals/:id" element={<AnimalProfile />} />
        <Route path="/animals/:id/edit" element={<AnimalEdit />} />

        <Route path="/buyers" element={<BuyerList />} />
        <Route path="/buyers/distribute" element={<Distribute />} />
        <Route path="/buyers/:id/bill/:ym" element={<BillPreview />} />
        <Route path="/buyers/:id" element={<BuyerLedger />} />

        <Route path="/expenses" element={<Expenses />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/breeding" element={<Breeding />} />
        <Route path="/health" element={<Health />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/weather" element={<Weather />} />
        <Route path="/trade" element={<Trade />} />
        <Route path="/backup" element={<Backup />} />
        <Route path="/recycle-bin" element={<RecycleBin />} />
        <Route path="/day" element={<DayRecord />} />
        <Route path="/day/:date" element={<DayRecord />} />

        <Route path="/more" element={<More />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
