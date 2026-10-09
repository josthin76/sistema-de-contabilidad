import React from 'react';

export default function LoadingSpinner({ message = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
      {message && <p className="text-gray-600 font-medium">{message}</p>}
    </div>
  );
}
