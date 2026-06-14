// Field schemas that drive the one generic record editor. Every collection
// lists its editable fields so the same <RecordEditor> can edit any record.
import { EXPENSE_CATS, ROLES, VACCINES, SYMPTOMS } from './domain.js'

const opt = (arr, vKey, lKey) => arr.map((x) => ({ value: x[vKey], label: x[lKey] }))

const SCHEMAS = {
  milkLogs: {
    title: { ur: 'دودھ ریکارڈ', en: 'Milk record' },
    fields: [
      { key: 'date', label: { ur: 'تاریخ', en: 'Date' }, type: 'date' },
      { key: 'morning', label: { ur: 'صبح (لیٹر)', en: 'Morning (L)' }, type: 'number' },
      { key: 'evening', label: { ur: 'شام (لیٹر)', en: 'Evening (L)' }, type: 'number' },
    ],
  },
  bulkMilk: {
    title: { ur: 'کل دودھ', en: 'Total milk' },
    fields: [
      { key: 'date', label: { ur: 'تاریخ', en: 'Date' }, type: 'date' },
      { key: 'morning', label: { ur: 'صبح (لیٹر)', en: 'Morning (L)' }, type: 'number' },
      { key: 'evening', label: { ur: 'شام (لیٹر)', en: 'Evening (L)' }, type: 'number' },
    ],
  },
  buyers: {
    title: { ur: 'خریدار', en: 'Buyer' },
    fields: [
      { key: 'name', label: { ur: 'نام', en: 'Name' }, type: 'text' },
      { key: 'phone', label: { ur: 'فون', en: 'Phone' }, type: 'text' },
      { key: 'rate', label: { ur: 'ریٹ فی لیٹر', en: 'Rate/L' }, type: 'number' },
      { key: 'dailyQty', label: { ur: 'روزانہ مقدار', en: 'Daily qty' }, type: 'number' },
      { key: 'cycleDays', label: { ur: 'ادائیگی دن', en: 'Payment cycle (days)' }, type: 'number' },
      { key: 'address', label: { ur: 'پتہ', en: 'Address' }, type: 'text' },
    ],
  },
  deliveries: {
    title: { ur: 'دودھ کی ترسیل', en: 'Delivery' },
    fields: [
      { key: 'date', label: { ur: 'تاریخ', en: 'Date' }, type: 'date' },
      { key: 'liters', label: { ur: 'لیٹر', en: 'Liters' }, type: 'number' },
      { key: 'rate', label: { ur: 'ریٹ', en: 'Rate' }, type: 'number' },
    ],
  },
  payments: {
    title: { ur: 'ادائیگی', en: 'Payment' },
    fields: [
      { key: 'date', label: { ur: 'تاریخ', en: 'Date' }, type: 'date' },
      { key: 'amount', label: { ur: 'رقم', en: 'Amount' }, type: 'number' },
      { key: 'note', label: { ur: 'تفصیل', en: 'Note' }, type: 'text' },
    ],
  },
  expenses: {
    title: { ur: 'خرچ', en: 'Expense' },
    fields: [
      { key: 'category', label: { ur: 'قسم', en: 'Category' }, type: 'select', options: () => opt(EXPENSE_CATS.map((c) => ({ id: c.id, ur: c.ur })), 'id', 'ur') },
      { key: 'amount', label: { ur: 'رقم', en: 'Amount' }, type: 'number' },
      { key: 'note', label: { ur: 'تفصیل', en: 'Note' }, type: 'text' },
      { key: 'date', label: { ur: 'تاریخ', en: 'Date' }, type: 'date' },
    ],
  },
  employees: {
    title: { ur: 'ملازم', en: 'Employee' },
    fields: [
      { key: 'name', label: { ur: 'نام', en: 'Name' }, type: 'text' },
      { key: 'role', label: { ur: 'کام', en: 'Role' }, type: 'select', options: () => opt(ROLES, 'id', 'ur') },
      { key: 'salary', label: { ur: 'ماہانہ تنخواہ', en: 'Monthly salary' }, type: 'number' },
    ],
  },
  salaryPayments: {
    title: { ur: 'تنخواہ ادائیگی', en: 'Salary payment' },
    fields: [
      { key: 'date', label: { ur: 'تاریخ', en: 'Date' }, type: 'date' },
      { key: 'amount', label: { ur: 'رقم', en: 'Amount' }, type: 'number' },
      { key: 'note', label: { ur: 'تفصیل', en: 'Note' }, type: 'text' },
    ],
  },
  breedingEvents: {
    title: { ur: 'افزائش واقعہ', en: 'Breeding event' },
    fields: [
      { key: 'type', label: { ur: 'قسم', en: 'Type' }, type: 'select', options: () => [
        { value: 'heat', label: 'گرمی' }, { value: 'mating', label: 'ملاپ/AI' },
        { value: 'pregnancy', label: 'حمل' }, { value: 'calving', label: 'بچہ' },
      ] },
      { key: 'date', label: { ur: 'تاریخ', en: 'Date' }, type: 'date' },
      { key: 'aiDetails', label: { ur: 'تفصیل', en: 'Details' }, type: 'text' },
      { key: 'expectedCalving', label: { ur: 'متوقع بچہ', en: 'Expected calving' }, type: 'date' },
    ],
  },
  vaccinations: {
    title: { ur: 'ٹیکہ', en: 'Vaccination' },
    fields: [
      { key: 'vaccine', label: { ur: 'ٹیکہ', en: 'Vaccine' }, type: 'select', options: () => opt(VACCINES, 'id', 'ur') },
      { key: 'givenDate', label: { ur: 'لگنے کی تاریخ', en: 'Given date' }, type: 'date' },
      { key: 'nextDue', label: { ur: 'اگلی تاریخ', en: 'Next due' }, type: 'date' },
      { key: 'vet', label: { ur: 'ڈاکٹر', en: 'Vet' }, type: 'text' },
      { key: 'cost', label: { ur: 'خرچ', en: 'Cost' }, type: 'number' },
    ],
  },
  healthEvents: {
    title: { ur: 'صحت ریکارڈ', en: 'Health record' },
    fields: [
      { key: 'date', label: { ur: 'تاریخ', en: 'Date' }, type: 'date' },
      { key: 'diagnosis', label: { ur: 'تشخیص', en: 'Diagnosis' }, type: 'text' },
      { key: 'treatment', label: { ur: 'علاج', en: 'Treatment' }, type: 'text' },
      { key: 'medicine', label: { ur: 'دوائی', en: 'Medicine' }, type: 'text' },
      { key: 'cost', label: { ur: 'خرچ', en: 'Cost' }, type: 'number' },
    ],
  },
  medicines: {
    title: { ur: 'دوائی', en: 'Medicine' },
    fields: [
      { key: 'name', label: { ur: 'نام', en: 'Name' }, type: 'text' },
      { key: 'qty', label: { ur: 'تعداد', en: 'Quantity' }, type: 'number' },
      { key: 'unit', label: { ur: 'یونٹ', en: 'Unit' }, type: 'text' },
      { key: 'expiry', label: { ur: 'ختم تاریخ', en: 'Expiry' }, type: 'date' },
    ],
  },
  transactions: {
    title: { ur: 'خرید/فروخت', en: 'Buy/Sell' },
    fields: [
      { key: 'type', label: { ur: 'قسم', en: 'Type' }, type: 'select', options: () => [
        { value: 'buy', label: 'خرید' }, { value: 'sell', label: 'فروخت' },
      ] },
      { key: 'date', label: { ur: 'تاریخ', en: 'Date' }, type: 'date' },
      { key: 'counterparty', label: { ur: 'فریق', en: 'Party' }, type: 'text' },
      { key: 'price', label: { ur: 'قیمت', en: 'Price' }, type: 'number' },
      { key: 'weight', label: { ur: 'وزن kg', en: 'Weight kg' }, type: 'number' },
      { key: 'notes', label: { ur: 'تفصیل', en: 'Notes' }, type: 'text' },
    ],
  },
  medicineLogs: {
    title: { ur: 'دوائی', en: 'Medicine given' },
    fields: [
      { key: 'name', label: { ur: 'دوائی کا نام', en: 'Medicine' }, type: 'text' },
      { key: 'dose', label: { ur: 'مقدار', en: 'Dose' }, type: 'text' },
      { key: 'date', label: { ur: 'تاریخ', en: 'Date' }, type: 'date' },
      { key: 'days', label: { ur: 'کتنے دن', en: 'Days' }, type: 'number' },
    ],
  },
}

export const getSchema = (collection) => SCHEMAS[collection] || null
// numeric keys whose value must be coerced to a number on save
export const NUMERIC_KEYS = new Set(['morning', 'evening', 'rate', 'dailyQty', 'cycleDays', 'liters', 'amount', 'salary', 'cost', 'qty', 'price', 'weight', 'days'])
