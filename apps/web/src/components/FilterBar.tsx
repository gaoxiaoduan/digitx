import React from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { type Locale, copy } from '@/lib/copy';

interface FilterBarProps {
  locale: Locale;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedLength: string;
  setSelectedLength: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  categories: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  locale,
  searchTerm,
  setSearchTerm,
  selectedLength,
  setSelectedLength,
  selectedCategory,
  setSelectedCategory,
  statusFilter,
  setStatusFilter,
  categories
}) => {
  const text = copy[locale];

  return (
    <Card className="sticky top-20 z-20 bg-card/95 backdrop-blur-xl">
      <CardContent className="flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:max-w-md">
            <label htmlFor="domain-search" className="sr-only">
              {text.searchPlaceholder}
            </label>
            <InputGroup>
              <InputGroupAddon>
                <Search className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                id="domain-search"
                type="search"
                placeholder={text.searchPlaceholder}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </InputGroup>
          </div>

          <ToggleGroup
            type="single"
            value={statusFilter}
            onValueChange={(nextStatus) => {
              if (nextStatus) setStatusFilter(nextStatus);
            }}
            variant="outline"
            size="sm"
            aria-label={text.status}
            className="self-start lg:self-auto"
          >
            <ToggleGroupItem value="all">{text.status}</ToggleGroupItem>
            <ToggleGroupItem value="available">{text.available}</ToggleGroupItem>
            <ToggleGroupItem value="registered">{text.registered}</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center">
          <div className="grid flex-1 grid-cols-2 gap-3">
            <Select value={selectedLength} onValueChange={setSelectedLength}>
              <SelectTrigger aria-label={text.length}>
                <SelectValue placeholder={text.length} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">{text.anyLength}</SelectItem>
                  <SelectItem value="6">6 {locale === 'zh' ? '位数字' : 'digits'}</SelectItem>
                  <SelectItem value="7">7 {locale === 'zh' ? '位数字' : 'digits'}</SelectItem>
                  <SelectItem value="8">8 {locale === 'zh' ? '位数字' : 'digits'}</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger aria-label={text.category}>
                <SelectValue placeholder={text.category} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">{text.allPatterns}</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
