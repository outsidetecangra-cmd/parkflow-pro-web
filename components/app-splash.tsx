"use client";

import { useEffect, useState } from "react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const slides = [
  {
    src: `${basePath}/smartpark-logo.png`,
    alt: "SmartPark",
    label: "SmartPark",
  },
];

export function AppSplash() {
  const [visible, setVisible] = useState(true);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 850);

    const timeout = window.setTimeout(() => {
      setVisible(false);
    }, 3400);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, []);

  if (!visible) {
    return null;
  }

  const slide = slides[index];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950 text-white">
      <div className="flex flex-col items-center gap-5 px-8 text-center">
        <div className="flex h-36 w-36 items-center justify-center rounded-3xl border border-white/10 bg-white p-4 shadow-2xl">
          <img
            src={slide.src}
            alt={slide.alt}
            className="max-h-full max-w-full object-contain"
          />
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">
            {slide.label}
          </p>
          <p className="mt-2 text-sm text-slate-300">
            Carregando sistema...
          </p>
        </div>

        <div className="h-1.5 w-48 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-cyan-400" />
        </div>
      </div>
    </div>
  );
}
