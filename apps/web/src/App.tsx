import React, { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import type { DomainDatabase, DomainRecord } from '@digitx/core';
import { createEmptyDomainDatabase } from '@digitx/core/candidate-contract';
import { Code2, Moon, RefreshCw, Sun } from 'lucide-react';
import { DetailSheet } from '@/components/DetailSheet';
import { DomainTable } from '@/components/DomainTable';
import { FilterBar } from '@/components/FilterBar';
import { HeroBand } from '@/components/HeroBand';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { copy, type Locale } from '@/lib/copy';

type Theme = 'light' | 'dark';

const EMPTY_DATABASE = createEmptyDomainDatabase();

const API_ORIGIN = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? '';
const DOMAINS_ENDPOINT = `${API_ORIGIN}/api/domains`;

function readStoredLocale(): Locale {
  const storedLocale = window.localStorage.getItem('digitx.locale.v1');
  return storedLocale === 'en' ? 'en' : 'zh';
}

function readStoredTheme(): Theme {
  const storedTheme = window.localStorage.getItem('digitx.theme.v1');
  return storedTheme === 'dark' ? 'dark' : 'light';
}

export const App: React.FC = () => {
  const [data, setData] = useState<DomainDatabase>(EMPTY_DATABASE);
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState<Locale>(readStoredLocale);
  const [theme, setTheme] = useState<Theme>(readStoredTheme);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLength, setSelectedLength] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [selectedDomain, setSelectedDomain] = useState<DomainRecord | null>(null);
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const text = copy[locale];

  useEffect(() => {
    setPage(1);
  }, [deferredSearchTerm, statusFilter, selectedLength, selectedCategory]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(DOMAINS_ENDPOINT);
      if (response.ok) {
        setData(await response.json());
      }
    } catch (error) {
      console.warn('Failed to load domain data.', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem('digitx.theme.v1', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
    window.localStorage.setItem('digitx.locale.v1', locale);
  }, [locale]);

  const domainList = useMemo(() => Object.values(data.domains), [data]);

  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    for (const domain of domainList) {
      if (domain.category) categorySet.add(domain.category);
    }
    return Array.from(categorySet);
  }, [domainList]);

  const filteredDomains = useMemo(
    () =>
      domainList.filter((domain) => {
        if (
          deferredSearchTerm &&
          !domain.domain.includes(deferredSearchTerm) &&
          !domain.patternDesc.includes(deferredSearchTerm) &&
          !(domain.tags ?? []).some((tag) => tag.includes(deferredSearchTerm))
        ) {
          return false;
        }
        if (statusFilter !== 'all' && domain.status !== statusFilter) return false;
        if (selectedLength !== 'all' && String(domain.number.length) !== selectedLength) return false;
        if (selectedCategory !== 'all' && domain.category !== selectedCategory) return false;

        return true;
      }),
    [deferredSearchTerm, domainList, selectedCategory, selectedLength, statusFilter]
  );

  const toggleTheme = () => setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'));

  return (
    <TooltipProvider delayDuration={250}>
      <div className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            <a href="/" className="flex items-center gap-2.5" aria-label="DIGITX home">
              <span className="flex size-8 items-center justify-center rounded-md bg-primary font-mono text-sm font-medium text-primary-foreground">
                D
              </span>
              <span className="text-sm font-semibold tracking-tight">DIGITX</span>
            </a>

            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={fetchData} disabled={loading} aria-label={text.refresh}>
                    <RefreshCw className={loading ? 'animate-spin' : undefined} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{text.refresh}</TooltipContent>
              </Tooltip>

              <div className="mx-1 hidden h-5 w-px bg-border sm:block" />

              <ToggleGroup
                type="single"
                value={locale}
                onValueChange={(nextLocale) => {
                  if (nextLocale === 'zh' || nextLocale === 'en') setLocale(nextLocale);
                }}
                variant="outline"
                size="sm"
                aria-label={text.language}
              >
                <ToggleGroupItem value="zh" aria-label="中文">
                  中
                </ToggleGroupItem>
                <ToggleGroupItem value="en" aria-label="English">
                  EN
                </ToggleGroupItem>
              </ToggleGroup>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={theme === 'light' ? text.darkMode : text.lightMode}>
                    {theme === 'light' ? <Moon /> : <Sun />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{theme === 'light' ? text.darkMode : text.lightMode}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button asChild variant="ghost" size="icon">
                    <a
                      href="https://github.com/gaoxiaoduan/digitx"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={text.github}
                    >
                      <Code2 />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{text.github}</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </header>

        <HeroBand stats={data.stats} locale={locale} />

        <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
          <FilterBar
            locale={locale}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedLength={selectedLength}
            setSelectedLength={setSelectedLength}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            categories={categories}
          />

          <section aria-label={text.domains}>
            <div className="mb-3 flex items-center justify-between">
              <p className="font-mono text-xs text-muted-foreground">
                {text.showing} <span className="font-medium text-foreground">{filteredDomains.length}</span> {text.domains}
              </p>
              <p className="hidden font-mono text-xs text-muted-foreground sm:block">{data.config.tld.toUpperCase()}</p>
            </div>
            <DomainTable
              domains={filteredDomains}
              locale={locale}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              onSelectDomain={setSelectedDomain}
            />
          </section>
        </main>

        <footer className="border-t bg-card">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
            <p className="font-mono text-xs text-muted-foreground">{text.footer}</p>
          </div>
        </footer>

        <DetailSheet locale={locale} domain={selectedDomain} onClose={() => setSelectedDomain(null)} />
      </div>
    </TooltipProvider>
  );
};
