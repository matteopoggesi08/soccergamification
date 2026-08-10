import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type QuickActionCardProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  variant?: 'primary' | 'default';
};

export function QuickActionCard({
  href,
  label,
  icon: Icon,
  variant = 'default',
}: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl border p-4 text-center transition-colors active:scale-[0.98]',
        variant === 'primary'
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card hover:bg-accent'
      )}
    >
      <Icon className="h-8 w-8" strokeWidth={1.75} />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}
