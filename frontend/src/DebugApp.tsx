import React from 'react';

const DebugApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Debug Test
        </h1>
        <p className="text-gray-600 mb-4">
          If you can see this, the React app is working correctly.
        </p>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            • React is loaded: ✅
          </p>
          <p className="text-sm text-gray-500">
            • Tailwind CSS is working: ✅
          </p>
          <p className="text-sm text-gray-500">
            • Component rendering: ✅
          </p>
        </div>
        <button 
          onClick={() => window.location.href = '/'}
          className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Go to Main App
        </button>
      </div>
    </div>
  );
};

export default DebugApp;
