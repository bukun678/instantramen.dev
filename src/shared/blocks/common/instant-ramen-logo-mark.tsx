import { cn } from '@/shared/lib/utils';

export function InstantRamenLogoMark({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) {
  return (
    <svg
      viewBox="9 9 50 50"
      className={cn('shrink-0', className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <use href="/instant-ramen-logo.svg#instant-ramen-mark" />
    </svg>
  );
}
