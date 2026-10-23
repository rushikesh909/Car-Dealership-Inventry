import React from 'react';
import { Vehicle } from '../types';
import { useAuth } from '../context/AuthContext';
import { Edit2, PackagePlus, ShoppingCart, Trash2 } from 'lucide-react';

interface VehicleCardProps {
  vehicle: Vehicle;
  onPurchase: (vehicle: Vehicle) => Promise<void>;
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (vehicle: Vehicle) => void;
  onRestock?: (vehicle: Vehicle) => void;
  isPurchasing?: boolean;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onPurchase,
  onEdit,
  onDelete,
  onRestock,
  isPurchasing = false,
}) => {
  const { isAdmin } = useAuth();
  const isOutOfStock = vehicle.quantity <= 0;

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(vehicle.price));

  return (
    <div
      data-testid={`vehicle-card-${vehicle.id}`}
      className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
    >
      <div className="p-5">
        {/* Top Badges */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
            {vehicle.category}
          </span>
          {isOutOfStock ? (
            <span
              data-testid="out-of-stock-badge"
              className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200"
            >
              Out of Stock
            </span>
          ) : (
            <span
              data-testid="in-stock-badge"
              className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200"
            >
              {vehicle.quantity} {vehicle.quantity === 1 ? 'unit left' : 'units in stock'}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 leading-snug">
          {vehicle.make} {vehicle.model}
        </h3>

        {/* Price */}
        <div className="mt-4 flex items-baseline">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {formattedPrice}
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-5 pb-5 pt-2 border-t border-slate-100 flex flex-col space-y-2">
        <button
          data-testid="purchase-button"
          onClick={() => onPurchase(vehicle)}
          disabled={isOutOfStock || isPurchasing}
          aria-label={`Purchase ${vehicle.make} ${vehicle.model}`}
          className={`w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all shadow-sm ${
            isOutOfStock
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              : 'bg-brand-600 hover:bg-brand-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 active:scale-[0.98]'
          }`}
        >
          {isPurchasing ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Processing...</span>
            </div>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              <span>{isOutOfStock ? 'Sold Out' : 'Purchase Vehicle'}</span>
            </>
          )}
        </button>

        {/* Admin Controls Area */}
        {isAdmin && (
          <div
            data-testid="admin-controls"
            className="pt-2 flex items-center justify-between border-t border-dashed border-slate-200 text-xs"
          >
            {onRestock && (
              <button
                onClick={() => onRestock(vehicle)}
                title="Restock units"
                aria-label={`Restock ${vehicle.model}`}
                className="flex items-center space-x-1 text-slate-600 hover:text-emerald-700 py-1 px-2 rounded-md hover:bg-emerald-50 transition-colors"
              >
                <PackagePlus className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-medium">Restock</span>
              </button>
            )}

            <div className="flex items-center space-x-1">
              {onEdit && (
                <button
                  onClick={() => onEdit(vehicle)}
                  title="Edit vehicle details"
                  aria-label={`Edit ${vehicle.model}`}
                  className="flex items-center space-x-1 text-slate-600 hover:text-brand-700 py-1 px-2 rounded-md hover:bg-brand-50 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-brand-600" />
                  <span className="font-medium">Edit</span>
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(vehicle)}
                  title="Delete vehicle"
                  aria-label={`Delete ${vehicle.model}`}
                  className="flex items-center space-x-1 text-slate-600 hover:text-rose-700 py-1 px-2 rounded-md hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span className="font-medium">Delete</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
