// Multi-currency utilities for Syrian system
export type CurrencyCode = 'SYP' | 'USD';

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
  nameAr: string;
  locale: string;
}

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  SYP: {
    code: 'SYP',
    symbol: 'ل.س',
    name: 'Syrian Pound',
    nameAr: 'الليرة السورية',
    locale: 'ar-SY'
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    nameAr: 'الدولار الأمريكي',
    locale: 'en-US'
  }
};

// Default currency
export const DEFAULT_CURRENCY: CurrencyCode = 'SYP';

// Get current currency from localStorage or default
export const getCurrentCurrency = (): CurrencyCode => {
  const stored = localStorage.getItem('selectedCurrency') as CurrencyCode;
  return stored && CURRENCIES[stored] ? stored : DEFAULT_CURRENCY;
};

// Set current currency
export const setCurrentCurrency = (currency: CurrencyCode): void => {
  localStorage.setItem('selectedCurrency', currency);
  // Dispatch event to notify components about currency change
  window.dispatchEvent(new CustomEvent('currencyChange', { detail: currency }));
};

// Format currency for display
export const formatCurrency = (amount: number, currencyCode?: CurrencyCode): string => {
  const currency = CURRENCIES[currencyCode || getCurrentCurrency()];
  
  if (currency.code === 'USD') {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else {
    return `${amount.toLocaleString('ar-SY')} ${currency.symbol}`;
  }
};

// Format currency for input (no symbol)
export const formatCurrencyInput = (amount: number, currencyCode?: CurrencyCode): string => {
  const currency = CURRENCIES[currencyCode || getCurrentCurrency()];
  
  if (currency.code === 'USD') {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else {
    return amount.toLocaleString('ar-SY');
  }
};

// Parse currency input
export const parseCurrency = (value: string): number => {
  // Remove any non-digit characters except decimal point
  const cleanValue = value.replace(/[^\d.]/g, '');
  return parseFloat(cleanValue) || 0;
};

// Get currency symbol
export const getCurrencySymbol = (currencyCode?: CurrencyCode): string => {
  return CURRENCIES[currencyCode || getCurrentCurrency()].symbol;
};

// Get currency name in Arabic
export const getCurrencyNameAr = (currencyCode?: CurrencyCode): string => {
  return CURRENCIES[currencyCode || getCurrentCurrency()].nameAr;
};

// Syrian phone number validation
export const validateSyrianPhone = (phone: string): boolean => {
  // Syrian phone formats:
  // Mobile: +963 9XX XXX XXX or 09XX XXX XXX
  // Landline: +963 XX XXX XXX or 0XX XXX XXX
  const mobilePattern = /^(\+963|0)?9[0-9]{8}$/;
  const landlinePattern = /^(\+963|0)?[1-9][0-9]{7,8}$/;
  
  const cleanPhone = phone.replace(/[\s-]/g, '');
  return mobilePattern.test(cleanPhone) || landlinePattern.test(cleanPhone);
};

// Format Syrian phone number
export const formatSyrianPhone = (phone: string): string => {
  const cleanPhone = phone.replace(/[\s-]/g, '');
  
  // If starts with +963, keep as is
  if (cleanPhone.startsWith('+963')) {
    return cleanPhone;
  }
  
  // If starts with 963, add +
  if (cleanPhone.startsWith('963')) {
    return `+${cleanPhone}`;
  }
  
  // If starts with 0, replace with +963
  if (cleanPhone.startsWith('0')) {
    return `+963${cleanPhone.substring(1)}`;
  }
  
  // Otherwise, assume it needs +963
  return `+963${cleanPhone}`;
};

// Syrian cities
export const SYRIAN_CITIES = [
  'دمشق',
  'حلب',
  'حمص',
  'حماة',
  'اللاذقية',
  'دير الزور',
  'الرقة',
  'إدلب',
  'درعا',
  'السويداء',
  'القنيطرة',
  'طرطوس',
  'الحسكة',
  'ريف دمشق',
];

// Default Syrian address format
export const formatSyrianAddress = (address: string, city?: string): string => {
  if (city && !address.includes(city)) {
    return `${address} - ${city}`;
  }
  return address;
};
