import React from 'react';
import { useI18n } from '../../contexts/I18nContext';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { t } = useI18n();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto flex justify-center">
          <div className="relative">
            <img
              src="/images/logo/logo.png"
              alt="شعار نظام ما بعد البيع"
              className="logo-image h-20 w-auto mx-auto"
              onError={(e) => {
                // Fallback if logo not found
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            {/* Fallback logo */}
            <div className="hidden w-16 h-16 bg-primary-600 rounded-lg items-center justify-center mx-auto">
              <span className="text-white text-2xl font-bold">ما بعد البيع</span>
            </div>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 font-arabic">
          نظام ما بعد البيع
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 font-arabic">
          After-Sales Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-xl sm:px-10 border border-gray-200">
          {children}
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-gray-500">
        {t('app.copyright')}
      </div>
    </div>
  );
};

export default AuthLayout;
