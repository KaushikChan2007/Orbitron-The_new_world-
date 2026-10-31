import React from 'react';
import { Database, RefreshCw, CheckCircle2 } from 'lucide-react';

interface DataStatusBadgeProps {
  retrievedAt?: string;
  sourceName?: string;
  totalRecords?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const DataStatusBadge: React.FC<DataStatusBadgeProps> = ({
  retrievedAt = '2026-10-31',
  sourceName = 'NASA Exoplanet Archive (pscomppars via TAP)',
  totalRecords = 520,
  onRefresh,
  isRefreshing = false
}) => {
  const formattedDate = retrievedAt.includes('T') ? retrievedAt.split('T')[0] : retrievedAt;

  return (
    <div className="flex flex-wrap items-center gap-3 px-3.5 py-1.5 rounded-full text-xs font-mono bg-slate-900/80 border border-cyan-500/30 text-slate-300 backdrop-blur-md">
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <Database className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-slate-400">Status:</span>
        <span className="text-cyan-300 font-medium">Cached NASA Archive</span>
      </div>

      <span className="text-slate-600">|</span>

      <span className="text-slate-300">
        Retrieved: <span className="text-slate-200 font-semibold">{formattedDate}</span>
      </span>

      <span className="text-slate-600">|</span>

      <span className="text-slate-400">
        <span className="text-emerald-400 font-semibold">{totalRecords}</span> curated worlds
      </span>

      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="ml-1 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
          title="Attempt archive refresh"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          <span className="hidden sm:inline text-[10px]">Refresh</span>
        </button>
      )}
    </div>
  );
};
