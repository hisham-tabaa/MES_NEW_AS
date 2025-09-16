import React, { useState, useEffect } from 'react';
import { CURRENCIES, CurrencyCode, getCurrentCurrency, setCurrentCurrency, getCurrencyNameAr } from '../../utils/currency';

interface CurrencySelectorProps {
  className?: string;
  showLabel?: boolean;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({ 
  className = '', 
  showLabel = true 
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(getCurrentCurrency());

  useEffect(() => {
    const handleCurrencyChange = (event: CustomEvent<CurrencyCode>) => {
      setSelectedCurrency(event.detail);
    };

    window.addEventListener('currencyChange', handleCurrencyChange as EventListener);
    return () => {
      window.removeEventListener('currencyChange', handleCurrencyChange as EventListener);
    };
  }, []);

  const handleCurrencyChange = (newCurrency: CurrencyCode) => {
    setCurrentCurrency(newCurrency);
    setSelectedCurrency(newCurrency);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <label className="text-sm font-medium text-gray-700">العملة:</label>
      )}
      <select
        value={selectedCurrency}
        onChange={(e) => handleCurrencyChange(e.target.value as CurrencyCode)}
        className="select-field min-w-[140px]"
      >
        {Object.values(CURRENCIES).map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.symbol} - {currency.nameAr}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CurrencySelector;
