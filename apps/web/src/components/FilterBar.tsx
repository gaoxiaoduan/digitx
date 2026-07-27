import React from 'react';
import { Search, Filter, Flame, EyeOff } from 'lucide-react';

interface FilterBarProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  selectedLength: string;
  setSelectedLength: (v: string) => void;
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  excludeFour: boolean;
  setExcludeFour: (v: boolean) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  categories: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  setSearchTerm,
  selectedLength,
  setSelectedLength,
  selectedCategory,
  setSelectedCategory,
  excludeFour,
  setExcludeFour,
  statusFilter,
  setStatusFilter,
  categories
}) => {
  return (
    <div className="bg-canvas border-b border-hairline sticky top-0 z-20 backdrop-blur-md bg-opacity-90">
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-hairline-strong" />
          <input
            type="text"
            placeholder="搜索数字模式 (例: 88, 1024)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-canvas-soft border border-hairline rounded-sm text-sm text-ink placeholder-hairline-strong focus:outline-none focus:border-ink transition-colors font-mono"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs">
          {/* Status Filter */}
          <div className="flex items-center bg-canvas-soft border border-hairline rounded-sm p-0.5 font-mono">
            {['all', 'available', 'registered'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-sm capitalize transition-all ${
                  statusFilter === st ? 'bg-ink text-white font-medium shadow-sm' : 'text-hairline-strong hover:text-ink'
                }`}
              >
                {st === 'all' ? '全部状态' : st === 'available' ? '✅ 可注册' : '已注册'}
              </button>
            ))}
          </div>

          {/* Length Selector */}
          <select
            value={selectedLength}
            onChange={(e) => setSelectedLength(e.target.value)}
            className="bg-canvas-soft border border-hairline rounded-sm px-3 py-1.5 font-mono text-ink focus:outline-none focus:border-ink"
          >
            <option value="all">任意长度</option>
            <option value="6">6 位数字</option>
            <option value="7">7 位数字</option>
            <option value="8">8 位数字</option>
          </select>

          {/* Category Selector */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-canvas-soft border border-hairline rounded-sm px-3 py-1.5 text-ink focus:outline-none focus:border-ink"
          >
            <option value="all">所有靓号模式</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Exclude 4 Toggle */}
          <button
            onClick={() => setExcludeFour(!excludeFour)}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-sm transition-all font-mono ${
              excludeFour
                ? 'bg-brand-blue/10 border-brand-blue text-brand-blue font-medium'
                : 'bg-canvas-soft border-hairline text-hairline-strong hover:text-ink'
            }`}
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>避讳数字4</span>
          </button>
        </div>
      </div>
    </div>
  );
};
