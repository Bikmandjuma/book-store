// Central configuration. Change currency, coupons, delivery rules here or in Store management > Settings.

export const STORE = {
  name: 'Booksta',
  domain: 'Booksta.store',
  tagline: 'Books worth keeping.',
}

// Sample prices are written in USD ("base" currency). Display currency is just a presentation layer.
// Rates are illustrative only - not live exchange rates.
export const CURRENCIES = {
  USD: { code: 'USD', label: 'US dollar', rate: 1 },
  EUR: { code: 'EUR', label: 'Euro', rate: 0.92 },
  GBP: { code: 'GBP', label: 'British pound', rate: 0.79 },
  RWF: { code: 'RWF', label: 'Rwandan franc', rate: 1450 },
  KES: { code: 'KES', label: 'Kenyan shilling', rate: 129 },
  UGX: { code: 'UGX', label: 'Ugandan shilling', rate: 3700 },
  NGN: { code: 'NGN', label: 'Nigerian naira', rate: 1550 },
  ZAR: { code: 'ZAR', label: 'South African rand', rate: 18.5 },
}

export const DEFAULT_SETTINGS = {
  storeName: 'Booksta.store',
  currency: 'USD',
  deliveryFee: 4.99, // base currency
  freeDeliveryThreshold: 50, // base currency
  contactEmail: 'hello@booksta.store',
  contactPhone: '+250 700 000 000',
  address: 'Store address placeholder, Kigali',
  customer: { name: 'Demo Reader', email: '', phone: '', country: 'Rwanda', city: '', address: '' },
}

// Sample promo codes. `value` for fixed coupons is in base currency.
export const COUPONS = [
  { code: 'WELCOME10', type: 'percent', value: 10, minSubtotal: 0, label: '10% off your order' },
  { code: 'READ15', type: 'percent', value: 15, minSubtotal: 40, label: '15% off orders over 40' },
  { code: 'BOOKWORM5', type: 'fixed', value: 5, minSubtotal: 25, label: '5 off orders over 25' },
  { code: 'FREESHIP', type: 'shipping', value: 0, minSubtotal: 0, label: 'Free delivery' },
]

export const ORDER_STATUSES = ['Pending', 'Confirmed', 'Preparing', 'Shipped', 'Delivered', 'Cancelled']
export const PROGRESS_STATUSES = ['Pending', 'Confirmed', 'Preparing', 'Shipped', 'Delivered']
export const CANCELLABLE = ['Pending', 'Confirmed']

export const PAYMENT_METHODS = [
  { id: 'card', label: 'Card payment (demo)', hint: 'No card details are collected or charged.' },
  { id: 'momo', label: 'Mobile money (demo)', hint: 'Simulated only. No money moves.' },
  { id: 'cod', label: 'Pay on delivery (demo)', hint: 'Simulated only. Nothing is arranged with a courier.' },
]

export const COUNTRIES = [
  'Rwanda', 'Kenya', 'Uganda', 'Tanzania', 'Burundi', 'DR Congo', 'Nigeria', 'Ghana', 'South Africa',
  'Ethiopia', 'United Kingdom', 'United States', 'Canada', 'France', 'Germany', 'Other',
]

export const PAGE_SIZE = 9
export const LOW_STOCK = 5
