'use client';

import { useEffect, useState, type ReactNode } from 'react';

/**
 * Fade/slide-in wrapper that mounts with opacity-0 on SSR and animates in
 * only after hydration — avoiding Framer Motion SSR/hydration mismatches.
 */
export function MotionItem({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <div
      className={className}
      style={{
        opacity: mounted ? undefined : 0,
        transform: mounted ? undefined : 'translateY(8px)',
        animation: mounted
          ? `slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s both`
          : 'none',
      }}
    >
      {children}
    </div>
  );
}
