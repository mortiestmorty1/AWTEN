'use client';

import React from 'react';

type DailyStat = {
  date: string;
  visits: number;
  creditsEarned: number;
};

export default function AnalyticsDailyChart({
  stats
}: {
  stats: DailyStat[];
}) {
  if (!stats || stats.length === 0) {
    return (
      <div className="w-full h-40 rounded-md border border-awten-dark-200 flex items-center justify-center text-sm text-awten-dark-500">
        No daily stats available
      </div>
    );
  }

  const maxVisits = Math.max(...stats.map((s) => s.visits), 1);
  const chartHeight = 140; // px area for bars only
  const labelHeight = 20; // px area for labels
  
  // Responsive label step: show fewer labels on smaller screens
  const labelStep = Math.max(1, Math.ceil(stats.length / 7));

  return (
    <div className="w-full">
      <div className="relative overflow-x-auto overflow-y-hidden" style={{ height: chartHeight + labelHeight }}>
        {/* Bars layer */}
        <div className="absolute left-0 right-0" style={{ top: 0, bottom: labelHeight }}>
          {/* single baseline */}
          <div className="absolute left-0 right-0 bottom-0 border-t border-awten-dark-200" />
          <div className="absolute inset-x-0 bottom-0 top-0 flex items-end gap-1 sm:gap-2">
            {stats.map((day, index) => {
              const height = Math.max(4, Math.round((day.visits / maxVisits) * (chartHeight - 6)));
              return (
                <div key={day.date} className="flex-1 min-w-[8px] sm:min-w-[10px] flex flex-col items-center">
                  <div
                    className="w-full bg-awten-500 rounded-t-sm transition-all hover:bg-awten-600"
                    style={{ height }}
                    title={`${day.date}: ${day.visits} visits, ${day.creditsEarned} credits`}
                  />
                </div>
              );
            })}
          </div>
        </div>
        {/* Labels layer - does not affect bar heights */}
        <div className="absolute left-0 right-0 flex items-center gap-1 sm:gap-2" style={{ height: labelHeight, bottom: 0 }}>
          {stats.map((day, index) => {
            const showLabel = index % labelStep === 0 || index === stats.length - 1;
            return (
              <div key={`label-${day.date}`} className="flex-1 min-w-[8px] sm:min-w-[10px] text-center">
                <span className="block text-[9px] sm:text-[10px] leading-3 text-awten-dark-500 whitespace-nowrap select-none">
                  {showLabel
                    ? new Date(day.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })
                    : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


