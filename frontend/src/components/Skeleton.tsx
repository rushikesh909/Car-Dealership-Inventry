import React from 'react';

export const VehicleCardSkeleton: React.FC = () => {
  return (
    <div
      data-testid="vehicle-card-skeleton"
      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm animate-pulse flex flex-col justify-between h-[230px]"
    >
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="h-5 bg-slate-200 rounded-md w-16" />
          <div className="h-5 bg-slate-200 rounded-full w-20" />
        </div>
        <div className="h-6 bg-slate-200 rounded-md w-3/4 mb-4" />
        <div className="h-8 bg-slate-200 rounded-md w-1/3" />
      </div>
      <div className="h-10 bg-slate-200 rounded-xl w-full" />
    </div>
  );
};
