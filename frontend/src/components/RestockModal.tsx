import React from 'react';
import { useForm } from 'react-hook-form';
import { Vehicle } from '../types';
import { PackagePlus, X } from 'lucide-react';

interface RestockFormData {
  amount: number;
}

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (vehicleId: string, amount: number) => Promise<void>;
  vehicle: Vehicle | null;
  isSubmitting?: boolean;
}

export const RestockModal: React.FC<RestockModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  vehicle,
  isSubmitting = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RestockFormData>({
    defaultValues: { amount: 5 },
  });

  if (!isOpen || !vehicle) return null;

  const handleFormSubmit = async (data: RestockFormData) => {
    await onSubmit(vehicle.id, data.amount);
    reset();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="restock-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <PackagePlus className="w-5 h-5 text-emerald-600" />
            <h3 id="restock-modal-title" className="text-base font-bold text-slate-900">
              Restock Inventory
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-xs text-slate-500">Vehicle to restock:</p>
          <p className="text-sm font-bold text-slate-900">
            {vehicle.make} {vehicle.model}
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Current stock:{' '}
            <span className="font-semibold text-slate-900">{vehicle.quantity} units</span>
          </p>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Quantity to Add
            </label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 5"
              {...register('amount', {
                required: 'Restock amount is required',
                min: { value: 1, message: 'Amount must be at least 1' },
                valueAsNumber: true,
              })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            {errors.amount && (
              <p className="mt-1 text-xs text-rose-600">{errors.amount.message}</p>
            )}
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Restocking...' : 'Confirm Restock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
