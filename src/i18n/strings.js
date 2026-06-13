// Bilingual UI strings. Urdu is the default (RTL); English is a toggle.
// Data the farmer enters (animal names, buyer names, notes) is shown as-is.
// Keep keys flat and screen-grouped so they are easy to find.

export const STRINGS = {
  // app / chrome
  appName: { ur: 'ڈیری بک', en: 'DairyBook' },
  tagline: { ur: 'آپ کا ڈیجیٹل فارم مددگار', en: 'Your digital farm helper' },

  // bottom nav
  nav_home: { ur: 'ہوم', en: 'Home' },
  nav_milk: { ur: 'دودھ', en: 'Milk' },
  nav_animals: { ur: 'جانور', en: 'Animals' },
  nav_buyers: { ur: 'خریدار', en: 'Buyers' },
  nav_more: { ur: 'مزید', en: 'More' },

  // generic actions
  save: { ur: 'محفوظ کریں', en: 'Save' },
  confirm: { ur: 'تصدیق', en: 'Confirm' },
  done: { ur: 'مکمل', en: 'Done' },
  cancel: { ur: 'منسوخ', en: 'Cancel' },
  edit: { ur: 'تبدیل کریں', en: 'Edit' },
  add: { ur: 'شامل کریں', en: 'Add' },
  back: { ur: 'واپس', en: 'Back' },
  call: { ur: 'فون کریں', en: 'Call' },
  today: { ur: 'آج', en: 'Today' },
  liters: { ur: 'لیٹر', en: 'Liters' },
  rupees: { ur: 'روپے', en: 'Rupees' },
  morning: { ur: 'صبح', en: 'Morning' },
  evening: { ur: 'شام', en: 'Evening' },
  total: { ur: 'کل', en: 'Total' },
  undo: { ur: 'واپس لائیں', en: 'Undo' },
  saved_ok: { ur: 'محفوظ ہو گیا ✅', en: 'Saved ✅' },

  // home
  home_todayMilk: { ur: 'آج کا دودھ', en: "Today's milk" },
  home_todayIncome: { ur: 'آج کی آمدن', en: "Today's income" },
  home_totalAnimals: { ur: 'کل جانور', en: 'Total animals' },
  home_todayTasks: { ur: 'آج کے کام', en: "Today's tasks" },
  home_alerts: { ur: 'اہم اطلاعات', en: 'Alerts' },
  home_noAlerts: { ur: 'سب ٹھیک ہے — کوئی اطلاع نہیں', en: 'All good — no alerts' },
  home_quickLog: { ur: 'فوری اندراج', en: 'Quick log' },
  home_menu: { ur: 'مرکزی فہرست', en: 'Main menu' },
  qa_milk: { ur: 'دودھ لکھیں', en: 'Log milk' },
  qa_sale: { ur: 'فروخت لکھیں', en: 'Log sale' },
  qa_expense: { ur: 'خرچ لکھیں', en: 'Log expense' },
  qa_newAnimal: { ur: 'نیا جانور', en: 'New animal' },

  // menu tiles
  m_milk: { ur: 'دودھ', en: 'Milk' },
  m_buyers: { ur: 'خریدار', en: 'Buyers' },
  m_reports: { ur: 'رپورٹ', en: 'Reports' },
  m_animals: { ur: 'جانور', en: 'Animals' },
  m_health: { ur: 'صحت', en: 'Health' },
  m_calendar: { ur: 'کیلنڈر', en: 'Calendar' },
  m_breeding: { ur: 'افزائش', en: 'Breeding' },
  m_trade: { ur: 'خرید فروخت', en: 'Buy/Sell' },
  m_backup: { ur: 'بیک اپ', en: 'Backup' },
  comingSoon: { ur: 'جلد آ رہا ہے', en: 'Coming soon' },

  // milk
  milk_logTitle: { ur: 'آج کا دودھ لکھیں', en: "Log today's milk" },
  milk_pickAnimal: { ur: 'جانور چنیں', en: 'Pick an animal' },
  milk_herd: { ur: 'سارے جانوروں کا دودھ', en: 'Whole herd milk' },
  milk_herdTotalToday: { ur: 'آج کل دودھ', en: 'Total milk today' },
  milk_perAnimal: { ur: 'فی جانور دودھ', en: 'Milk per animal' },
  milk_7day: { ur: '7 دن کا دودھ', en: '7-day milk' },
  milk_30day: { ur: '30 دن کا رجحان', en: '30-day trend' },
  milk_monthTotal: { ur: 'اس ماہ کل', en: 'This month total' },
  milk_avg: { ur: 'اوسط', en: 'Average' },
  milk_peak: { ur: 'سب سے زیادہ', en: 'Peak' },
  milk_aboveAvg: { ur: 'اوسط سے زیادہ', en: 'Above average' },
  milk_belowAvg: { ur: 'اوسط سے کم', en: 'Below average' },
  milk_alreadyLogged: { ur: 'آج کا دودھ لکھا جا چکا', en: 'Today already logged' },
  milk_tapToLog: { ur: 'لکھنے کے لیے دبائیں', en: 'Tap to log' },

  // animals
  animals_title: { ur: 'جانور رجسٹر', en: 'Animal registry' },
  animals_add: { ur: 'نیا جانور شامل کریں', en: 'Add new animal' },
  animals_tag: { ur: 'ٹیگ نمبر', en: 'Tag number' },
  animals_name: { ur: 'نام', en: 'Name' },
  animals_breed: { ur: 'نسل', en: 'Breed' },
  animals_sex: { ur: 'جنس', en: 'Sex' },
  animals_female: { ur: 'مادہ', en: 'Female' },
  animals_male: { ur: 'نر', en: 'Male' },
  animals_age: { ur: 'عمر', en: 'Age' },
  animals_status: { ur: 'حالت', en: 'Status' },
  animals_weight: { ur: 'وزن', en: 'Weight' },
  animals_active: { ur: 'فعال', en: 'Active' },
  animals_pregnant: { ur: 'حاملہ', en: 'Pregnant' },
  animals_calf: { ur: 'بچہ', en: 'Calf' },
  animals_sold: { ur: 'فروخت', en: 'Sold' },
  animals_dead: { ur: 'فوت', en: 'Dead' },
  animals_count: { ur: 'جانور', en: 'animals' },
  animals_noPhoto: { ur: 'تصویر شامل کریں', en: 'Add photo' },
  animals_years: { ur: 'سال', en: 'yr' },
  animals_months: { ur: 'ماہ', en: 'mo' },

  // buyers
  buyers_title: { ur: 'دودھ خریدار', en: 'Milk buyers' },
  buyers_add: { ur: 'نیا خریدار', en: 'New buyer' },
  buyers_totalReceivable: { ur: 'کل وصول ہونے والی رقم', en: 'Total receivable' },
  buyers_balance: { ur: 'باقی رقم', en: 'Balance owed' },
  buyers_lastPayment: { ur: 'آخری ادائیگی', en: 'Last payment' },
  buyers_rate: { ur: 'ریٹ فی لیٹر', en: 'Rate / liter' },
  buyers_dailyQty: { ur: 'روزانہ مقدار', en: 'Daily quantity' },
  buyers_phone: { ur: 'فون نمبر', en: 'Phone' },
  buyers_ledger: { ur: 'کھاتہ', en: 'Ledger' },
  buyers_deliveries: { ur: 'دودھ کی ترسیل', en: 'Deliveries' },
  buyers_payments: { ur: 'ادائیگیاں', en: 'Payments' },
  buyers_recordPayment: { ur: 'ادائیگی درج کریں', en: 'Record payment' },
  buyers_amountReceived: { ur: 'موصولہ رقم', en: 'Amount received' },
  buyers_distribute: { ur: 'آج کا دودھ تقسیم کریں', en: "Distribute today's milk" },
  buyers_remaining: { ur: 'بچا ہوا', en: 'Remaining' },
  buyers_home: { ur: 'گھر', en: 'Home' },
  buyers_paidUp: { ur: 'حساب صاف', en: 'Paid up' },
  buyers_overdue: { ur: 'باقی', en: 'Overdue' },
  buyers_daysAgo: { ur: 'دن پہلے', en: 'days ago' },
  buyers_never: { ur: 'کبھی نہیں', en: 'never' },

  // expenses (Module 3)
  exp_title: { ur: 'اخراجات', en: 'Expenses' },
  exp_thisMonth: { ur: 'اس ماہ خرچ', en: 'This month' },
  exp_thisWeek: { ur: 'اس ہفتے خرچ', en: 'This week' },
  exp_top: { ur: 'سب سے بڑا خرچ', en: 'Biggest expense' },
  exp_add: { ur: 'خرچ لکھیں', en: 'Log expense' },
  exp_salaries: { ur: 'تنخواہیں', en: 'Salaries' },
  exp_payroll: { ur: 'ماہانہ تنخواہ', en: 'Monthly payroll' },
  exp_pay: { ur: 'تنخواہ ادا کریں', en: 'Pay salary' },
  exp_paid: { ur: 'ادا شدہ', en: 'Paid' },
  exp_recent: { ur: 'حالیہ اخراجات', en: 'Recent expenses' },

  // reports (Module 4)
  rep_title: { ur: 'رپورٹیں', en: 'Reports' },
  rep_weekly: { ur: 'ہفتہ وار', en: 'Weekly' },
  rep_monthly: { ur: 'ماہانہ', en: 'Monthly' },
  rep_predict: { ur: 'پیشگوئی', en: 'Forecast' },
  rep_milk: { ur: 'کل دودھ', en: 'Total milk' },
  rep_revenue: { ur: 'آمدن', en: 'Revenue' },
  rep_expense: { ur: 'اخراجات', en: 'Expenses' },
  rep_profit: { ur: 'خالص منافع', en: 'Net profit' },
  rep_best: { ur: 'بہترین جانور', en: 'Best animal' },
  rep_share: { ur: 'WhatsApp پر بھیجیں', en: 'Share on WhatsApp' },
  rep_nextMonth: { ur: 'اگلے ماہ متوقع دودھ', en: 'Next month milk (est.)' },

  // breeding (Module 6)
  breed_title: { ur: 'افزائش نسل', en: 'Breeding' },
  breed_log: { ur: 'افزائش واقعہ لکھیں', en: 'Log breeding event' },
  breed_heat: { ur: 'گرمی', en: 'Heat' },
  breed_mating: { ur: 'ملاپ / مصنوعی نسل', en: 'Mating / AI' },
  breed_pregnancy: { ur: 'حمل', en: 'Pregnancy' },
  breed_calving: { ur: 'بچہ پیدائش', en: 'Calving' },
  breed_expected: { ur: 'متوقع بچہ', en: 'Expected calf' },
  breed_upcoming: { ur: 'آنے والے بچے', en: 'Upcoming calvings' },
  breed_recordCalf: { ur: 'بچہ درج کریں', en: 'Record calf' },

  // health (Module 7)
  health_title: { ur: 'صحت اور ٹیکے', en: 'Health & vaccines' },
  health_vaccines: { ur: 'ٹیکے', en: 'Vaccines' },
  health_illness: { ur: 'بیماری', en: 'Illness' },
  health_meds: { ur: 'دوائیں', en: 'Medicines' },
  health_due: { ur: 'باقی ٹیکے', en: 'Due vaccines' },
  health_markDone: { ur: 'لگ گیا ✅', en: 'Done ✅' },
  health_logIllness: { ur: 'بیماری لکھیں', en: 'Log illness' },
  health_underTreatment: { ur: 'زیرِ علاج', en: 'Under treatment' },
  health_resolve: { ur: 'ٹھیک ہو گیا', en: 'Resolved' },
  health_overdue: { ur: 'باقی', en: 'overdue' },
  health_inDays: { ur: 'دن میں', en: 'in days' },

  // calendar (Module 8)
  cal_title: { ur: 'کیلنڈر', en: 'Calendar' },
  cal_today: { ur: 'آج', en: 'Today' },

  // weather (Module 9)
  weather_title: { ur: 'موسم', en: 'Weather' },
  weather_advice: { ur: 'فارم مشورہ', en: 'Farm advice' },
  weather_locating: { ur: 'مقام تلاش ہو رہا ہے…', en: 'Locating…' },
  weather_useGps: { ur: 'میرا مقام استعمال کریں', en: 'Use my location' },
  weather_offline: { ur: 'آف لائن — آخری محفوظ موسم', en: 'Offline — last saved' },
  weather_updated: { ur: 'آخری اپ ڈیٹ', en: 'Updated' },

  // trade (Module 10)
  trade_title: { ur: 'خرید و فروخت', en: 'Buy & sell' },
  trade_buy: { ur: 'جانور خریدا', en: 'Bought' },
  trade_sell: { ur: 'جانور بیچا', en: 'Sold' },
  trade_addBuy: { ur: 'خریداری لکھیں', en: 'Log purchase' },
  trade_addSell: { ur: 'فروخت لکھیں', en: 'Log sale' },
  trade_spent: { ur: 'اس سال خرچ', en: 'Spent this year' },
  trade_earned: { ur: 'اس سال آمدن', en: 'Earned this year' },
  trade_profit: { ur: 'منافع', en: 'Profit' },

  // backup (Module 11)
  backup_title: { ur: 'بیک اپ', en: 'Backup' },
  backup_export: { ur: 'بیک اپ فائل محفوظ کریں', en: 'Save backup file' },
  backup_restore: { ur: 'پرانا ڈیٹا واپس لائیں', en: 'Restore data' },
  backup_last: { ur: 'آخری بیک اپ', en: 'Last backup' },
  backup_done: { ur: 'بیک اپ مکمل', en: 'Backup complete' },
  backup_never: { ur: 'ابھی تک بیک اپ نہیں ہوا', en: 'No backup yet' },
  backup_drive: { ur: 'گوگل ڈرائیو سے جوڑیں', en: 'Connect Google Drive' },
}

export function tr(key, lang) {
  const e = STRINGS[key]
  if (!e) return key
  return e[lang] ?? e.ur ?? key
}
