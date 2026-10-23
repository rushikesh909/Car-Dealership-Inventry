import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Vehicle } from '../types';
import { X } from 'lucide-react';

interface VehicleFormData {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VehicleFormData) => Promise<void>;
  vehicle?: Vehicle | null;
  isSubmitting?: boolean;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  vehicle,
  isSubmitting = false,
}) => {
  const isEditing = !!vehicle;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VehicleFormData>();

  useEffect(() => {
    if (vehicle) {
      reset({
        make: vehicle.make,
        model: vehicle.model,
        category: vehicle.category,
        price: Number(vehicle.price),
        quantity: vehicle.quantity,
      });
    } else {
      reset({
        make: '',
        model: '',
        category: 'Sedan',
        price: 25000,
        quantity: 1,
      });
    }
  }, [vehicle, reset, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="vehicle-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 id="vehicle-modal-title" className="text-lg font-bold text-slate-900">
            {isEditing ? 'Edit Vehicle Details' : 'Add New Vehicle'}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          {/* Make */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Make / Manufacturer
            </label>
            <input
              type="text"
              placeholder="e.g. Toyota"
              {...register('make', { required: 'Make is required' })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            {errors.make && (
              <p className="mt-1 text-xs text-rose-600">{errors.make.message}</p>
            )}
          </div>

          {/* Model */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Model
            </label>
            <input
              type="text"
              placeholder="e.g. Camry"
              {...register('model', { required: 'Model is required' })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            {errors.model && (
              <p className="mt-1 text-xs text-rose-600">{errors.model.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Category
            </label>
            <select
              {...register('category', { required: 'Category is required' })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="Truck">Truck</option>
              <option value="Coupe">Coupe</option>
              <option value="Convertible">Convertible</option>
              <option value="Van">Van</option>
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Price ($ USD)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('price', {
                required: 'Price is required',
                min: { value: 0.01, message: 'Price must be greater than 0' },
                valueAsNumber: true,
              })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            {errors.price && (
              <p className="mt-1 text-xs text-rose-600">{errors.price.message}</p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Initial Stock Quantity
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              {...register('quantity', {
                required: 'Quantity is required',
                min: { value: 0, message: 'Quantity cannot be negative' },
                valueAsNumber: true,
              })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            {errors.quantity && (
              <p className="mt-1 text-xs text-rose-600">{errors.quantity.message}</p>
            )}
          </div>

          <div className="pt-4 flex justify-end space-x-3">
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
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
