import { useState, useEffect } from 'react';
import { CurrencyCode, getCurrentCurrency, formatCurrency, getCurrencySymbol, getCurrencyNameAr } from '../utils/currency';

export const useCurrency = () => {
  const [currentCurrency, setCurrentCurrency] = useState<CurrencyCode>(getCurrentCurrency());

  useEffect(() => {
    const handleCurrencyChange = (event: CustomEvent<CurrencyCode>) => {
      setCurrentCurrency(event.detail);
    };

    window.addEventListener('currencyChange', handleCurrencyChange as EventListener);
    return () => {
      window.removeEventListener('currencyChange', handleCurrencyChange as EventListener);
    };
  }, []);

  return {
    currentCurrency,
    formatCurrency: (amount: number) => formatCurrency(amount, currentCurrency),
    getCurrencySymbol: () => getCurrencySymbol(currentCurrency),
    getCurrencyNameAr: () => getCurrencyNameAr(currentCurrency),
  };
};

export default useCurrency;
