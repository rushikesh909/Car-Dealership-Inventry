import React from 'react';
import { Filter, RotateCcw, Search } from 'lucide-react';

interface SearchBarProps {
  make: string;
  setMake: (val: string) => void;
  model: string;
  setModel: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  minPrice: string;
  setMinPrice: (val: string) => void;
  maxPrice: string;
  setMaxPrice: (val: string) => void;
  onReset: () => void;
}

const CATEGORIES = ['All', 'Sedan', 'SUV', 'Truck', 'Coupe', 'Convertible', 'Van'];

export const SearchBar: React.FC<SearchBarProps> = ({
  make,
  setMake,
  model,
  setModel,
  category,
  setCategory,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  onReset,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm mb-8">
      <div className="flex items-center space-x-2 text-slate-800 font-bold mb-4">
        <Filter className="w-5 h-5 text-brand-600" />
        <h2 className="text-base font-semibold">Search & Filter Inventory</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Make Search */}
        <div>
          <label htmlFor="search-make" className="block text-xs font-semibold text-slate-600 uppercase mb-1">
            Make
          </label>
          <div className="relative">
            <input
              id="search-make"
              type="text"
              placeholder="e.g. Toyota, Tesla"
              value={make}
              onChange={(e) => setMake(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Model Search */}
        <div>
          <label htmlFor="search-model" className="block text-xs font-semibold text-slate-600 uppercase mb-1">
            Model
          </label>
          <div className="relative">
            <input
              id="search-model"
              type="text"
              placeholder="e.g. Camry, 911"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label htmlFor="search-category" className="block text-xs font-semibold text-slate-600 uppercase mb-1">
            Category
          </label>
          <select
            id="search-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat === 'All' ? '' : cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Min Price */}
        <div>
          <label htmlFor="search-min-price" className="block text-xs font-semibold text-slate-600 uppercase mb-1">
            Min Price ($)
          </label>
          <input
            id="search-min-price"
            type="number"
            min="0"
            placeholder="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
          >
          </input>
        </div>

        {/* Max Price */}
        <div>
          <label htmlFor="search-max-price" className="block text-xs font-semibold text-slate-600 uppercase mb-1">
            Max Price ($)
          </label>
          <input
            id="search-max-price"
            type="number"
            min="0"
            placeholder="No limit"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
          >
          </input>
        </div>
      </div>

      {/* Reset Filter Button */}
      {(make || model || category || minPrice || maxPrice) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onReset}
            className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-100"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      )}
    </div>
  );
};
