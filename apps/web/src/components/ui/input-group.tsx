import * as React from 'react';
import { cn } from '@/lib/utils';

const InputGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex h-10 w-full items-center rounded-md border bg-background text-sm transition-colors focus-within:ring-2 focus-within:ring-ring',
      className
    )}
    {...props}
  />
));
InputGroup.displayName = 'InputGroup';

const InputGroupAddon = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex shrink-0 items-center px-3 text-muted-foreground', className)} {...props} />
));
InputGroupAddon.displayName = 'InputGroupAddon';

const InputGroupInput = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'h-full min-w-0 flex-1 bg-transparent px-0 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  />
));
InputGroupInput.displayName = 'InputGroupInput';

export { InputGroup, InputGroupAddon, InputGroupInput };
