import * as React from 'react';
import type { VariantProps } from 'class-variance-authority';

import { cn } from '@/presentation/lib/utils';
import { cardVariants } from './card-variants';

type CardProps = React.ComponentProps<'div'> & VariantProps<typeof cardVariants>;

function Card({ className, variant, ...props }: CardProps) {
  return <div data-slot="card" className={cn(cardVariants({ variant }), className)} {...props} />;
}

export { Card };
