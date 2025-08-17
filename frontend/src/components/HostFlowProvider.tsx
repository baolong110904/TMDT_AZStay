"use client";

import React, { createContext, useContext, useState } from "react";

type Nav = { next?: string; prev?: string; currentStep?: number; totalSteps?: number };

type HostFlowContextType = {
  canProceed: boolean;
  setCanProceed: (v: boolean) => void;
  nav: Nav;
  setNav: (n: Nav) => void;
  onNext?: (() => Promise<void> | void) | null;
  setOnNext: (fn: (() => Promise<void> | void) | null) => void;
};

const HostFlowContext = createContext<HostFlowContextType | undefined>(undefined);

export function HostFlowProvider({ children }: { children: React.ReactNode }) {
  const [canProceed, setCanProceed] = useState(false);
  const [nav, setNav] = useState<Nav>({ currentStep: 1, totalSteps: 8 });
  const [onNext, setOnNext] = useState<(() => Promise<void> | void) | null>(null);

  React.useEffect(() => {
    console.log("HostFlowProvider mounted");
    return () => console.log("HostFlowProvider unmounted");
  }, []);

  return (
    <HostFlowContext.Provider value={{ canProceed, setCanProceed, nav, setNav, onNext, setOnNext }}>
      {children}
    </HostFlowContext.Provider>
  );
}

export function useHostFlow() {
  const ctx = useContext(HostFlowContext);
  if (!ctx) throw new Error("useHostFlow must be used within HostFlowProvider");
  return ctx;
}

export default HostFlowProvider;
