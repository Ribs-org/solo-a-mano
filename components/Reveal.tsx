"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const subscribe = () => () => {};
const isSupported = () => typeof IntersectionObserver !== "undefined";

/** Muestra su contenido con un fundido hacia arriba la primera vez que entra en pantalla. */
export default function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  // En el servidor asumimos soporte; sin soporte, el contenido se muestra sin animar.
  const supported = useSyncExternalStore(subscribe, isSupported, () => true);
  const visible = seen || !supported;

  useEffect(() => {
    if (!supported || !ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [supported]);

  return (
    <div ref={ref} data-visible={visible}
      className={`transition duration-700 ease-out data-[visible=false]:translate-y-8 data-[visible=false]:opacity-0 ${className}`}>
      {children}
    </div>
  );
}
