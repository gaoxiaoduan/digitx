import React, { useState, useEffect, useMemo } from 'react';
import { DomainRecord, DomainDatabase } from '@digitx/core';
import { HeroBand } from './components/HeroBand';
import { FilterBar } from './components/FilterBar';
import { DomainTable } from './components/DomainTable';
import { DetailSheet } from './components/DetailSheet';
import { RefreshCw, Code2, Globe } from 'lucide-react';

export const App: React.FC = () => {
  const [data, setData] = useState<DomainDatabase>({
    domains: {},
    stats: { total: 0, checked: 0, unchecked: 0, available: 0, registered: 0, error: 0 },
    config: { delay: 2000, exclude4: true, minLength: 6, maxLength: 8, minScore: 60, tld: '.xyz' }
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLength, setSelectedLength] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [excludeFour, setExcludeFour] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDomain, setSelectedDomain] = useState<DomainRecord | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/domains');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.warn('Failed to fetch from API, falling back to local dataset...');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const domainList = useMemo(() => {
    return Object.values(data.domains || {});
  }, [data]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    domainList.forEach((d) => {
      if (d.category) set.add(d.category);
    });
    return Array.from(set);
  }, [domainList]);

  const filteredDomains = useMemo(() => {
    return domainList.filter((d) => {
      // Search
      if (searchTerm && !d.domain.includes(searchTerm) && !d.patternDesc.includes(searchTerm)) {
        return false;
      }
      // Status
      if (statusFilter !== 'all' && d.status !== statusFilter) {
        return false;
      }
      // Length
      if (selectedLength !== 'all' && String(d.number.length) !== selectedLength) {
        return false;
      }
      // Category
      if (selectedCategory !== 'all' && d.category !== selectedCategory) {
        return false;
      }
      // Exclude 4
      if (excludeFour && d.number.includes('4')) {

        const allowed4s = ['1024', '2048', '4096', '404'];
        let hasUnlucky = true;
        for (const allowed of allowed4s) {
          if (d.number.includes(allowed)) {
            hasUnlucky = false;
            break;
          }
        }
        if (hasUnlucky) return false;
      }
      return true;
    });
  }, [domainList, searchTerm, statusFilter, selectedLength, selectedCategory, excludeFour]);

  return (
    <div className="min-h-screen flex flex-col bg-canvas-soft text-ink font-sans">
      {/* Header Bar */}
      <header className="bg-canvas border-b border-hairline px-6 py-3 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-sm bg-ink text-white flex items-center justify-center font-mono font-bold text-sm">
            D
          </div>
          <span className="font-semibold tracking-tight text-ink text-sm">DIGITX</span>
          <span className="px-2 py-0.5 rounded-full bg-canvas-soft border border-hairline text-[10px] font-mono text-hairline-strong">
            v2.0 TS
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-canvas border border-hairline hover:bg-canvas-soft transition-colors font-mono text-ink"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>刷新数据</span>
          </button>
          <a
            href="https://github.com/gaoxiaoduan/digitx"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 text-hairline-strong hover:text-ink transition-colors font-mono"
          >
            <Code2 className="w-4 h-4" />
            <span>GitHub</span>
          </a>
        </div>
      </header>

      {/* Hero Band */}
      <HeroBand stats={data.stats} />

      {/* Filter Bar */}
      <FilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedLength={selectedLength}
        setSelectedLength={setSelectedLength}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        excludeFour={excludeFour}
        setExcludeFour={setExcludeFour}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categories={categories}
      />

      {/* Table Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-mono text-hairline-strong">
            SHOWING <span className="font-bold text-ink">{filteredDomains.length}</span> DOMAINS
          </div>
        </div>

        <div className="bg-canvas border border-hairline rounded-lg stacked-shadow overflow-hidden">
          <DomainTable domains={filteredDomains} onSelectDomain={(d) => setSelectedDomain(d)} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-canvas border-t border-hairline py-8 px-6 text-center text-xs text-hairline-strong font-mono">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Globe className="w-4 h-4 text-brand-teal" />
          <span>DIGITX - High-Performance Numeric Domain Engine</span>
        </div>
        <p>© 2026 DIGITX. Deployed on Cloudflare Pages & Workers.</p>
      </footer>

      {/* Detail Sheet */}
      <DetailSheet domain={selectedDomain} onClose={() => setSelectedDomain(null)} />
    </div>
  );
};
