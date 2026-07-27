import React from 'react';
import { DomainRecord } from '@digitx/core';
import { CheckCircle2, ChevronRight, ExternalLink, HelpCircle, ScanLine } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Locale, copy, statusLabel } from '@/lib/copy';
import { cn } from '@/lib/utils';

interface DomainTableProps {
  domains: DomainRecord[];
  locale: Locale;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSelectDomain: (domain: DomainRecord) => void;
}

function getPageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis', totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [1, 'ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages];
}

export const DomainTable: React.FC<DomainTableProps> = ({
  domains,
  locale,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onSelectDomain
}) => {
  const text = copy[locale];

  if (domains.length === 0) {
    return (
      <Card>
        <CardHeader className="items-center py-14 text-center">
          <HelpCircle className="size-8 text-muted-foreground" />
          <CardTitle>{text.emptyTitle}</CardTitle>
          <CardDescription>{text.emptyDescription}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const totalItems = domains.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const pageDomains = domains.slice(startIndex, endIndex);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b bg-muted/50">
              <tr className="font-mono text-[11px] font-normal text-muted-foreground">
                <th className="px-5 py-3.5 font-normal">{text.tableDomain}</th>
                <th className="px-4 py-3.5 font-normal">{text.tableLength}</th>
                <th className="px-4 py-3.5 font-normal">{text.tablePattern}</th>
                <th className="px-4 py-3.5 text-right font-normal">{text.tableScore}</th>
                <th className="px-4 py-3.5 text-center font-normal">{text.tableStatus}</th>
                <th className="px-5 py-3.5 text-right font-normal">{text.tableAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y bg-card">
              {pageDomains.map((domain) => {
                const isAvailable = domain.status === 'available';
                const badgeVariant = isAvailable ? 'available' : domain.status === 'registered' ? 'registered' : 'pending';

                return (
                  <tr
                    key={domain.domain}
                    onClick={() => onSelectDomain(domain)}
                    className="cursor-pointer transition-colors hover:bg-muted/60 focus-within:bg-muted/60"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-foreground">{domain.domain}</span>
                        {domain.score >= 95 && <Badge variant="score">{text.top}</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-muted-foreground">{domain.number.length}</td>
                    <td className="max-w-72 px-4 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-foreground">{domain.category}</span>
                        <span className="truncate text-xs text-muted-foreground">{domain.patternDesc}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-medium">
                      <span className={cn(domain.score >= 90 && 'text-score')}>{domain.score}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Badge variant={badgeVariant} className="justify-center">
                        {isAvailable && <CheckCircle2 className="size-3" />}
                        {!isAvailable && domain.status !== 'registered' && <ScanLine className="size-3" />}
                        {statusLabel(locale, domain.status)}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right" onClick={(event) => event.stopPropagation()}>
                      {isAvailable ? (
                        <a
                          href={`https://www.spaceship.com/domain-search/?query=${domain.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(buttonVariants({ size: 'sm' }), 'gap-1.5')}
                        >
                          {text.register}
                          <ExternalLink className="size-3" />
                        </a>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => onSelectDomain(domain)}>
                          {text.detail}
                          <ChevronRight data-icon="inline-end" />
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-center justify-between gap-4 border-t bg-muted/20 px-5 py-3.5 sm:flex-row">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="font-mono">
            {text.showingRange(totalItems > 0 ? startIndex + 1 : 0, endIndex, totalItems)}
          </span>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-1.5">
            <Select value={String(pageSize)} onValueChange={(val) => onPageSizeChange(Number(val))}>
              <SelectTrigger className="h-7 w-24 text-xs font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25" className="text-xs font-mono">25 {text.perPage}</SelectItem>
                <SelectItem value="50" className="text-xs font-mono">50 {text.perPage}</SelectItem>
                <SelectItem value="100" className="text-xs font-mono">100 {text.perPage}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {totalPages > 1 && (
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  disabled={safePage <= 1}
                  onClick={() => safePage > 1 && onPageChange(safePage - 1)}
                  label={text.previousPage}
                />
              </PaginationItem>

              {getPageNumbers(safePage, totalPages).map((p, idx) => (
                <PaginationItem key={typeof p === 'number' ? p : `ellipsis-${idx}`}>
                  {typeof p === 'number' ? (
                    <PaginationLink
                      isActive={p === safePage}
                      onClick={() => onPageChange(p)}
                    >
                      {p}
                    </PaginationLink>
                  ) : (
                    <PaginationEllipsis />
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  disabled={safePage >= totalPages}
                  onClick={() => safePage < totalPages && onPageChange(safePage + 1)}
                  label={text.nextPage}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </CardFooter>
    </Card>
  );
};
