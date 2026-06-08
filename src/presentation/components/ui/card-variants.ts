import { cva } from 'class-variance-authority';

export const cardVariants = cva('rounded-2xl border', {
  variants: {
    variant: {
      default: 'bg-card shadow-sm',
      pokemon: [
        'relative cursor-pointer overflow-hidden bg-white border-stone-200',
        'shadow-[var(--shadow-card)]',
        'transition-[transform,box-shadow,border-color] duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
        'hover:-translate-y-1.5 hover:shadow-[var(--shadow-card-hover)] hover:border-stone-300',
      ].join(' '),
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
