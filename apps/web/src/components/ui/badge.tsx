import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-primary bg-primary text-primary-foreground',
        secondary: 'border-border bg-secondary text-secondary-foreground',
        outline: 'border-border bg-background text-muted-foreground',
        available: 'border-available/20 bg-available/10 text-available',
        registered: 'border-border bg-muted text-muted-foreground',
        pending: 'border-pending/20 bg-pending/10 text-pending',
        score: 'border-score/20 bg-score/10 text-score'
      }
    },
    defaultVariants: {
      variant: 'secondary'
    }
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
