import React from 'react';
import { DomainRecord } from '@digitx/core';
import { Calendar, ExternalLink, Info, ShieldCheck, Tag, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { type Locale, copy, statusLabel } from '@/lib/copy';
import { cn } from '@/lib/utils';

interface DetailSheetProps {
  locale: Locale;
  domain: DomainRecord | null;
  onClose: () => void;
}

export const DetailSheet: React.FC<DetailSheetProps> = ({ locale, domain, onClose }) => {
  const text = copy[locale];
  const isAvailable = domain?.status === 'available';

  return (
    <Sheet open={Boolean(domain)} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="right" className="gap-0 p-0">
        {domain && (
          <>
            <SheetHeader className="border-b px-6 py-5 pr-14">
              <p className="font-mono text-xs text-muted-foreground">{text.detailEyebrow}</p>
              <SheetTitle className="font-mono text-2xl">{domain.domain}</SheetTitle>
              <SheetDescription>{text.detailDescription}</SheetDescription>
            </SheetHeader>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="absolute right-4 top-4" aria-label={text.close}>
                <X />
              </Button>
            </SheetClose>

            <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-6">
              <section className="rounded-lg border bg-muted/50 p-5">
                <p className="font-mono text-xs text-muted-foreground">{text.score}</p>
                <p className="mt-2 font-mono text-4xl font-medium tracking-tight text-score">{domain.score}<span className="text-lg text-muted-foreground"> / 100</span></p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{domain.patternDesc}</p>
              </section>

              <dl className="flex flex-col divide-y border-y">
                <div className="flex items-center justify-between gap-5 py-4">
                  <dt className="flex items-center gap-2 text-sm text-muted-foreground"><Tag className="size-4" />{text.pattern}</dt>
                  <dd className="text-right text-sm font-medium text-foreground">{domain.category}</dd>
                </div>
                <div className="flex items-center justify-between gap-5 py-4">
                  <dt className="flex items-center gap-2 text-sm text-muted-foreground"><ShieldCheck className="size-4" />{text.currentStatus}</dt>
                  <dd>
                    <Badge variant={isAvailable ? 'available' : domain.status === 'registered' ? 'registered' : 'pending'}>
                      {statusLabel(locale, domain.status)}
                    </Badge>
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-5 py-4">
                  <dt className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="size-4" />{text.checkedAt}</dt>
                  <dd className="text-right font-mono text-xs text-foreground">
                    {domain.updatedAt ? new Date(domain.updatedAt).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US') : '—'}
                  </dd>
                </div>
              </dl>

              <section>
                <p className="mb-2 flex items-center gap-2 font-mono text-xs text-muted-foreground"><Info className="size-3.5" />{text.whoisDetail}</p>
                <pre className="max-h-56 overflow-auto rounded-lg border bg-primary p-4 font-mono text-xs leading-5 text-primary-foreground">
                  {domain.detail || text.noDetail}
                </pre>
              </section>
            </div>

            <SheetFooter className="border-t px-6 py-5">
              {isAvailable ? (
                <a
                  href={`https://www.spaceship.com/domain-search/?query=${domain.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ size: 'lg' }), 'w-full')}
                >
                  {text.goRegister}
                  <ExternalLink data-icon="inline-end" />
                </a>
              ) : (
                <p className="text-center text-sm leading-6 text-muted-foreground">{text.unavailableMessage}</p>
              )}
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
