import * as React from 'react';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const toggleGroupVariants = cva('inline-flex items-center justify-center rounded-md bg-muted p-1 text-muted-foreground', {
  variants: {
    variant: {
      default: 'bg-muted',
      outline: 'border bg-background'
    },
    size: {
      default: 'h-10',
      sm: 'h-8 text-xs'
    }
  },
  defaultVariants: {
    variant: 'default',
    size: 'default'
  }
});

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> & VariantProps<typeof toggleGroupVariants>
>(({ className, variant, size, ...props }, ref) => (
  <ToggleGroupPrimitive.Root ref={ref} className={cn(toggleGroupVariants({ variant, size }), className)} {...props} />
));
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> & VariantProps<typeof toggleGroupVariants>
>(({ className, children, size, ...props }, ref) => (
  <ToggleGroupPrimitive.Item
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center rounded-sm px-3 font-medium transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-sm',
      size === 'sm' && 'h-6 px-2 text-xs',
      className
    )}
    {...props}
  >
    {children}
  </ToggleGroupPrimitive.Item>
));
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleGroupItem, toggleGroupVariants };
