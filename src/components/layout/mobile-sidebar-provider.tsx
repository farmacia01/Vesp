'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type MobileSidebarContextType = {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  open: () => void;
};

const MobileSidebarContext = createContext<MobileSidebarContextType>({
  isOpen: false,
  toggle: () => {},
  close: () => {},
  open: () => {},
});

export function useMobileSidebar() {
  return useContext(MobileSidebarContext);
}

export function MobileSidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);
  const open = useCallback(() => setIsOpen(true), []);

  return (
    <MobileSidebarContext value={{ isOpen, toggle, close, open }}>
      {children}
    </MobileSidebarContext>
  );
}
