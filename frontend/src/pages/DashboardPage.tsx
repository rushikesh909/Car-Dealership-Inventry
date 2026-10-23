import React, { useCallback, useEffect, useState } from 'react';
import { Vehicle } from '../types';
import { vehiclesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { VehicleCard } from '../components/VehicleCard';
import { SearchBar } from '../components/SearchBar';
import { VehicleModal } from '../components/VehicleModal';
import { RestockModal } from '../components/RestockModal';
import { VehicleCardSkeleton } from '../components/Skeleton';
import { ToastContainer, ToastMessage } from '../components/Toast';
import { useDebounce } from '../hooks/useDebounce';
import { Car, ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { isAdmin } = useAuth();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalVehicles, setTotalVehicles] = useState<number>(0);

  // Search Filter State
  const [make, setMake] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  const debouncedMake = useDebounce(make, 350);
  const debouncedModel = useDebounce(model, 350);
  const debouncedCategory = useDebounce(category, 350);
  const debouncedMinPrice = useDebounce(minPrice, 350);
  const debouncedMaxPrice = useDebounce(maxPrice, 350);

  // Purchasing tracker (vehicle ID undergoing purchase)
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  // Modals state
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [restockVehicle, setRestockVehicle] = useState<Vehicle | null>(null);
  const [isModalSubmitting, setIsModalSubmitting] = useState(false);

  // Toast state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch vehicles with active filters
  const fetchVehicles = useCallback(async () => {
    setIsLoading(true);
    try {
      const hasFilters =
        debouncedMake ||
        debouncedModel ||
        debouncedCategory ||
        debouncedMinPrice ||
        debouncedMaxPrice;

      if (hasFilters) {
        const parsedMin = debouncedMinPrice ? Number(debouncedMinPrice) : undefined;
        const parsedMax = debouncedMaxPrice ? Number(debouncedMaxPrice) : undefined;

        if (parsedMin !== undefined && parsedMax !== undefined && parsedMin > parsedMax) {
          addToast('error', 'Minimum price cannot exceed Maximum price');
          setIsLoading(false);
          return;
        }

        const res = await vehiclesApi.search({
          make: debouncedMake || undefined,
          model: debouncedModel || undefined,
          category: debouncedCategory || undefined,
          minPrice: parsedMin,
          maxPrice: parsedMax,
          page,
          limit: 12,
        });
        setVehicles(res.data);
        setTotalPages(res.meta.totalPages);
        setTotalVehicles(res.meta.total);
      } else {
        const res = await vehiclesApi.getAll(page, 12);
        setVehicles(res.data);
        setTotalPages(res.meta.totalPages);
        setTotalVehicles(res.meta.total);
      }
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Failed to fetch inventory');
    } finally {
      setIsLoading(false);
    }
  }, [
    debouncedMake,
    debouncedModel,
    debouncedCategory,
    debouncedMinPrice,
    debouncedMaxPrice,
    page,
  ]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleResetFilters = () => {
    setMake('');
    setModel('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setPage(1);
  };

  // Purchase vehicle handler with optimistic update and error fallback
  const handlePurchase = async (vehicle: Vehicle) => {
    if (vehicle.quantity <= 0) return;
    setPurchasingId(vehicle.id);

    try {
      const updated = await vehiclesApi.purchase(vehicle.id);
      // Smoothly update local state
      setVehicles((prev) =>
        prev.map((v) => (v.id === vehicle.id ? { ...v, quantity: updated.quantity } : v)),
      );
      addToast('success', `Successfully purchased ${vehicle.make} ${vehicle.model}!`);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Purchase failed';
      addToast('error', msg);
      // Refetch on error to ensure accurate inventory representation
      fetchVehicles();
    } finally {
      setPurchasingId(null);
    }
  };

  // Admin: Save Vehicle (Create or Update)
  const handleSaveVehicle = async (data: any) => {
    setIsModalSubmitting(true);
    try {
      if (editingVehicle) {
        await vehiclesApi.update(editingVehicle.id, data);
        addToast('success', `Vehicle updated successfully!`);
      } else {
        await vehiclesApi.create(data);
        addToast('success', `New vehicle added to inventory!`);
      }
      setIsVehicleModalOpen(false);
      setEditingVehicle(null);
      fetchVehicles();
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Operation failed');
    } finally {
      setIsModalSubmitting(false);
    }
  };

  // Admin: Delete Vehicle
  const handleDeleteVehicle = async (vehicle: Vehicle) => {
    if (!window.confirm(`Are you sure you want to delete ${vehicle.make} ${vehicle.model}?`)) {
      return;
    }
    try {
      await vehiclesApi.delete(vehicle.id);
      addToast('success', `Deleted ${vehicle.make} ${vehicle.model}`);
      fetchVehicles();
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Delete failed');
    }
  };

  // Admin: Restock Vehicle
  const handleRestockSubmit = async (vehicleId: string, amount: number) => {
    setIsModalSubmitting(true);
    try {
      const updated = await vehiclesApi.restock(vehicleId, amount);
      setVehicles((prev) =>
        prev.map((v) => (v.id === vehicleId ? { ...v, quantity: updated.quantity } : v)),
      );
      addToast('success', `Successfully added ${amount} units to stock!`);
      setRestockVehicle(null);
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Restock failed');
    } finally {
      setIsModalSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onAddVehicle={() => setIsVehicleModalOpen(true)} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Vehicle Inventory
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Browse current dealership inventory, view real-time stock, and purchase online.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => {
                setEditingVehicle(null);
                setIsVehicleModalOpen(true);
              }}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 transition-all self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Vehicle</span>
            </button>
          )}
        </div>

        {/* Search & Filter Component */}
        <SearchBar
          make={make}
          setMake={setMake}
          model={model}
          setModel={setModel}
          category={category}
          setCategory={setCategory}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          onReset={handleResetFilters}
        />

        {/* Results summary bar */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-4 px-1">
          <span>Showing {vehicles.length} of {totalVehicles} total vehicles</span>
          {totalPages > 1 && (
            <span>Page {page} of {totalPages}</span>
          )}
        </div>

        {/* Vehicle Grid / Skeletons / Empty State */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <VehicleCardSkeleton key={idx} />
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div
            data-testid="empty-state"
            className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-md mx-auto my-12 shadow-sm"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-4">
              <Car className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Vehicles Found</h3>
            <p className="text-sm text-slate-500 mt-1 mb-6">
              We couldn't find any vehicles matching your filter criteria. Try adjusting or resetting your search.
            </p>
            <button
              onClick={handleResetFilters}
              className="py-2 px-4 rounded-xl text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {vehicles.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                onPurchase={handlePurchase}
                onEdit={(veh) => {
                  setEditingVehicle(veh);
                  setIsVehicleModalOpen(true);
                }}
                onDelete={handleDeleteVehicle}
                onRestock={(veh) => setRestockVehicle(veh)}
                isPurchasing={purchasingId === v.id}
              />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && !isLoading && (
          <div className="mt-10 flex items-center justify-center space-x-3">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
              aria-label="Previous page"
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-slate-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              aria-label="Next page"
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </main>

      {/* Admin Modals */}
      <VehicleModal
        isOpen={isVehicleModalOpen}
        onClose={() => {
          setIsVehicleModalOpen(false);
          setEditingVehicle(null);
        }}
        onSubmit={handleSaveVehicle}
        vehicle={editingVehicle}
        isSubmitting={isModalSubmitting}
      />

      <RestockModal
        isOpen={!!restockVehicle}
        onClose={() => setRestockVehicle(null)}
        onSubmit={handleRestockSubmit}
        vehicle={restockVehicle}
        isSubmitting={isModalSubmitting}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};
