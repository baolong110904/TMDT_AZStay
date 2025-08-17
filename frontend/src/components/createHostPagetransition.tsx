"use client";

import React, { useEffect, useState } from "react";

type Props = {
  children: React.ReactNode;
  /** Key to trigger the animation (pass pathname or route key) */
  animateKey?: string | number;
  /** Enter animation duration in ms */
  enterDuration?: number;
  /** Exit animation duration in ms */
  exitDuration?: number;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * createHostPagetransition
 * Lightweight, dependency-free wrapper that fades/slides content on mount and when `animateKey` changes.
 * Usage:
 *  import CreateHostPageTransition from '@/components/createHostPagetransition';
 *  const pathname = usePathname();
 *  return <CreateHostPageTransition animateKey={pathname}>{children}</CreateHostPageTransition>;
 */
export default function CreateHostPageTransition({
  children,
  animateKey,
  enterDuration = 320,
  exitDuration = 200,
  className = "",
  style,
}: Props) {
  const [visible, setVisible] = useState(true);

  // when animateKey changes, play a quick exit -> enter by toggling visibility
  useEffect(() => {
    if (animateKey === undefined) return;
    // start exit (fade out)
    setVisible(false);
    const t = setTimeout(() => setVisible(true), exitDuration);
    return () => clearTimeout(t);
  }, [animateKey, exitDuration]);

  const combinedStyle: React.CSSProperties = {
    // fade-only transition (no movement/translate)
    transition: `opacity ${enterDuration}ms cubic-bezier(.2,.9,.2,1)`,
    opacity: visible ? 1 : 0,
    willChange: "opacity",
    ...style,
  };

  return (
    <div style={combinedStyle} className={className}>
      {children}
    </div>
  );
}
