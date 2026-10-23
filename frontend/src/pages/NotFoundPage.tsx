import React from 'react';
import { Link } from 'react-router-dom';
import { Car } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mb-6">
        <Car className="w-8 h-8" />
      </div>
      <h1 className="text-5xl font-black text-white">404</h1>
      <p className="text-xl font-bold text-slate-300 mt-2">Page Not Found</p>
      <p className="text-sm text-slate-500 mt-1 max-w-sm">
        The page or resource you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 py-2.5 px-6 rounded-xl font-bold text-sm bg-brand-600 hover:bg-brand-700 text-white transition-all shadow-lg"
      >
        Back to Dashboard
      </Link>
    </div>
  );
};
