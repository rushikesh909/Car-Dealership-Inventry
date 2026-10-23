import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SearchBar } from '../components/SearchBar';

describe('SearchBar Component', () => {
  it('updates text inputs correctly and triggers callbacks', () => {
    const setMake = vi.fn();
    const setModel = vi.fn();
    const setCategory = vi.fn();
    const setMinPrice = vi.fn();
    const setMaxPrice = vi.fn();
    const onReset = vi.fn();

    render(
      <SearchBar
        make=""
        setMake={setMake}
        model=""
        setModel={setModel}
        category=""
        setCategory={setCategory}
        minPrice=""
        setMinPrice={setMinPrice}
        maxPrice=""
        setMaxPrice={setMaxPrice}
        onReset={onReset}
      />,
    );

    const makeInput = screen.getByLabelText(/Make/i);
    fireEvent.change(makeInput, { target: { value: 'Ford' } });
    expect(setMake).toHaveBeenCalledWith('Ford');

    const modelInput = screen.getByLabelText(/Model/i);
    fireEvent.change(modelInput, { target: { value: 'Mustang' } });
    expect(setModel).toHaveBeenCalledWith('Mustang');
  });

  it('shows and executes reset filters when criteria are active', () => {
    const onReset = vi.fn();

    render(
      <SearchBar
        make="Toyota"
        setMake={vi.fn()}
        model=""
        setModel={vi.fn()}
        category=""
        setCategory={vi.fn()}
        minPrice=""
        setMinPrice={vi.fn()}
        maxPrice=""
        setMaxPrice={vi.fn()}
        onReset={onReset}
      />,
    );

    const resetBtn = screen.getByText(/Reset Filters/i);
    expect(resetBtn).toBeInTheDocument();

    fireEvent.click(resetBtn);
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
