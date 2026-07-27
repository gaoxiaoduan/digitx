import React from 'react';
import { DomainStats } from '@digitx/core';
import { ArrowRight, CheckCircle2, CircleDashed, ScanSearch, ShieldCheck } from 'lucide-react';
import { type Locale, copy } from '@/lib/copy';
import { cn } from '@/lib/utils';

interface HeroBandProps {
  stats: DomainStats;
  locale: Locale;
}

export const HeroBand: React.FC<HeroBandProps> = ({ stats, locale }) => {
  const text = copy[locale];
  const metrics = [
    { label: text.available, value: stats.available, tone: 'text-available' },
    { label: text.checked, value: stats.checked, tone: 'text-foreground' },
    { label: text.registered, value: stats.registered, tone: 'text-muted-foreground' },
    { label: text.queued, value: stats.unchecked, tone: 'text-pending' }
  ];

  return (
    <section className="mesh-gradient relative overflow-hidden border-b bg-card">
      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="w-full">
          <p className="mb-5 flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <ScanSearch className="size-4 text-available" />
            {text.eyebrow}
          </p>
          <h1 className="text-4xl font-semibold tracking-[-0.06em] text-foreground sm:text-5xl sm:leading-[1.05]">
            {text.heroTitle}
          </h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">{text.heroDescription}</p>
        </div>

        <div className="mt-10 grid w-full grid-cols-2 overflow-hidden rounded-lg border bg-card/80 shadow-surface sm:grid-cols-4">
          {metrics.map((metric, index) => (
            <div
              key={metric.label}
              className={cn(
                'flex flex-col gap-2 p-4 sm:p-5',
                index < metrics.length - 1 && 'border-b sm:border-b-0 sm:border-r',
              )}
            >
              <span className="font-mono text-[11px] text-muted-foreground">{metric.label}</span>
              <span className={`font-mono text-2xl font-medium tracking-tight sm:text-3xl ${metric.tone}`}>
                {metric.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8 w-full rounded-lg border bg-background/60 px-4 py-3 backdrop-blur-sm sm:px-5">
          <div className="mb-3 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
            <span>{text.verificationPath}</span>
            <span>{stats.total.toLocaleString()} {text.domains}</span>
          </div>
          <div className="verification-line h-px w-full" />
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><CircleDashed className="size-3.5" />{text.dns}</span>
            <span className="flex items-center justify-center gap-1.5"><ShieldCheck className="size-3.5" />{text.whois}</span>
            <span className="flex items-center justify-end gap-1.5"><CheckCircle2 className="size-3.5" />{text.availability}</span>
          </div>
        </div>
      </div>
      <ArrowRight className="pointer-events-none absolute -right-10 bottom-8 size-40 text-foreground/[0.035] sm:size-56" aria-hidden="true" />
    </section>
  );
};
