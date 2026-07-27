import React from 'react';
import { DomainRecord } from '@digitx/core';
import { CheckCircle2, ChevronRight, ExternalLink, HelpCircle, ScanLine } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type Locale, copy, statusLabel } from '@/lib/copy';
import { cn } from '@/lib/utils';

interface DomainTableProps {
  domains: DomainRecord[];
  locale: Locale;
  onSelectDomain: (domain: DomainRecord) => void;
}

export const DomainTable: React.FC<DomainTableProps> = ({ domains, locale, onSelectDomain }) => {
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
              {domains.map((domain) => {
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
    </Card>
  );
};
