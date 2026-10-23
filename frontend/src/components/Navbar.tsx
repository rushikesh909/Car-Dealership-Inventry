import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Car, LogOut, ShieldCheck, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onAddVehicle?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onAddVehicle }) => {
  const { user, isAdmin, logout, isAuthenticated } = useAuth();

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link
            to="/dashboard"
            className="flex items-center space-x-3 text-white hover:text-brand-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-lg p-1"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shadow-md">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white">AutoVault</span>
              <span className="hidden sm:inline-block ml-2 text-xs uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-semibold border border-slate-700">
                Dealership
              </span>
            </div>
          </Link>

          {/* User Info & Actions */}
          {isAuthenticated && user && (
            <div className="flex items-center space-x-4">
              {isAdmin && onAddVehicle && (
                <button
                  onClick={onAddVehicle}
                  className="hidden md:inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all"
                >
                  + Add Vehicle
                </button>
              )}

              <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                {isAdmin ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ) : (
                  <UserIcon className="w-4 h-4 text-slate-400" />
                )}
                <span className="text-xs sm:text-sm font-medium text-slate-200 truncate max-w-[140px] sm:max-w-none">
                  {user.email}
                </span>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                    isAdmin
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {user.role}
                </span>
              </div>

              <button
                onClick={logout}
                title="Log out"
                aria-label="Log out of account"
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
