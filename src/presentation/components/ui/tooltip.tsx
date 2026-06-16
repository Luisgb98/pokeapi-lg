'use client';

import * as React from 'react';
import { Tooltip as TooltipPrimitive } from 'radix-ui';

import { cn } from '@/presentation/lib/utils';

type TooltipSide = 'top' | 'right' | 'bottom' | 'left';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: TooltipSide;
  delayDuration?: number;
  className?: string;
}

/**
 * Self-contained hint tooltip. Wraps a single trigger element and shows
 * `content` on hover/focus. Renders the child untouched when there is no
 * content, so it is safe to pass a possibly-undefined reason.
 *
 * To explain a disabled control, wrap it in a focusable element (e.g. a
 * `<span tabIndex={0}>`) since disabled buttons swallow pointer events.
 */
function Tooltip({
  content,
  children,
  side = 'top',
  delayDuration = 150,
  className,
}: TooltipProps) {
  if (content === undefined || content === null || content === false) {
    return <>{children}</>;
  }

  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration} skipDelayDuration={300}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={6}
            collisionPadding={8}
            className={cn(
              'z-50 max-w-xs rounded-lg bg-stone-900 px-2.5 py-1.5 text-xs font-medium text-stone-50 shadow-lg',
              'select-none data-[state=delayed-open]:animate-in data-[state=closed]:animate-out',
              'data-[state=delayed-open]:fade-in-0 data-[state=closed]:fade-out-0',
              'data-[state=delayed-open]:zoom-in-95 data-[state=closed]:zoom-out-95',
              'dark:bg-stone-100 dark:text-stone-900',
              className,
            )}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-stone-900 dark:fill-stone-100" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

export { Tooltip };
