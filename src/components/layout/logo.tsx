import { cn } from '@/lib/utils';

export function Logo({
  className,
  showWordmark = true, // Mantido para não quebrar outros componentes que possam passar essa prop
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <img 
        src="/logo.svg" 
        alt="Logo" 
        className="h-10 w-auto object-contain"
      />
    </div>
  );
}
