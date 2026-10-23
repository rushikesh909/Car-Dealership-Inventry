import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { VehicleCard } from '../components/VehicleCard';
import { Vehicle } from '../types';
import * as AuthContextModule from '../context/AuthContext';

describe('VehicleCard Component', () => {
  const inStockVehicle: Vehicle = {
    id: 'veh-1',
    make: 'Toyota',
    model: 'Camry',
    category: 'Sedan',
    price: 25000,
    quantity: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const outOfStockVehicle: Vehicle = {
    ...inStockVehicle,
    id: 'veh-2',
    model: 'Supra',
    quantity: 0,
  };

  it('renders in-stock vehicle and enables purchase button', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'u1', email: 'user@test.com', role: 'USER' },
      token: 'tok',
      role: 'USER',
      isAuthenticated: true,
      isAdmin: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    const handlePurchase = vi.fn().mockResolvedValue(undefined);

    render(<VehicleCard vehicle={inStockVehicle} onPurchase={handlePurchase} />);

    expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
    expect(screen.getByTestId('in-stock-badge')).toHaveTextContent('3 units in stock');

    const purchaseBtn = screen.getByTestId('purchase-button');
    expect(purchaseBtn).not.toBeDisabled();
    expect(purchaseBtn).toHaveTextContent('Purchase Vehicle');

    fireEvent.click(purchaseBtn);
    expect(handlePurchase).toHaveBeenCalledWith(inStockVehicle);
  });

  it('disables purchase button and shows Out of Stock badge when quantity is 0', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'u1', email: 'user@test.com', role: 'USER' },
      token: 'tok',
      role: 'USER',
      isAuthenticated: true,
      isAdmin: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    const handlePurchase = vi.fn().mockResolvedValue(undefined);

    render(<VehicleCard vehicle={outOfStockVehicle} onPurchase={handlePurchase} />);

    expect(screen.getByTestId('out-of-stock-badge')).toHaveTextContent('Out of Stock');
    const purchaseBtn = screen.getByTestId('purchase-button');
    expect(purchaseBtn).toBeDisabled();
    expect(purchaseBtn).toHaveTextContent('Sold Out');
  });

  it('hides admin action buttons for normal USER role', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'u1', email: 'user@test.com', role: 'USER' },
      token: 'tok',
      role: 'USER',
      isAuthenticated: true,
      isAdmin: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <VehicleCard
        vehicle={inStockVehicle}
        onPurchase={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onRestock={vi.fn()}
      />,
    );

    expect(screen.queryByTestId('admin-controls')).not.toBeInTheDocument();
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    expect(screen.queryByText('Restock')).not.toBeInTheDocument();
  });

  it('displays admin action buttons when logged in as ADMIN role', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'admin-1', email: 'admin@test.com', role: 'ADMIN' },
      token: 'admin-tok',
      role: 'ADMIN',
      isAuthenticated: true,
      isAdmin: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <VehicleCard
        vehicle={inStockVehicle}
        onPurchase={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onRestock={vi.fn()}
      />,
    );

    expect(screen.getByTestId('admin-controls')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Restock')).toBeInTheDocument();
  });
});
