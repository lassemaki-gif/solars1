"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="fixed bottom-4 right-4 z-50 w-9 h-9 rounded-full bg-paper border border-ink/20 shadow flex items-center justify-center text-base hover:border-ink/60 transition-colors"
    >
      {dark ? "☀︎" : "☽"}
    </button>
  );
}
