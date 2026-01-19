"use client";

import { useTheme } from "next-themes";
import React from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;

  function toggle() {
    if (currentTheme === "dark") setTheme("light");
    else setTheme("dark");
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle color theme"
      title={currentTheme === "dark" ? "Switch to light" : "Switch to dark"}
      className="inline-flex items-center justify-center rounded-md p-2 cursor-pointer hover:bg-muted"
    >
      {currentTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

// "use client";
// import { useEffect, useState } from "react";
// import { Sun, Moon } from "lucide-react";

// type Theme = "light" | "dark";

// function getInitialTheme(): Theme {
//   if (typeof window === "undefined") return "light";
//   const saved = localStorage.getItem("theme") as Theme | null;
//   if (saved) return saved;
//   const prefersDark = window.matchMedia?.(
//     "(prefers-color-scheme: dark)"
//   ).matches;
//   return prefersDark ? "dark" : "light";
// }

// export default function ThemeToggle() {
//   const [theme, setTheme] = useState<Theme>(() => getInitialTheme());

//   useEffect(() => {
//     const root = document.documentElement;
//     if (theme === "dark") {
//       root.classList.add("dark");
//     } else {
//       root.classList.remove("dark");
//     }
//     localStorage.setItem("theme", theme);
//   }, [theme]);

//   function toggle() {
//     setTheme((t) => (t === "dark" ? "light" : "dark"));
//   }

//   return (
//     <button
//       onClick={toggle}
//       aria-label="Toggle color theme"
//       title={theme === "dark" ? "Switch to light" : "Switch to dark"}
//       className="inline-flex items-center justify-center rounded-md p-2 hover:bg-muted"
//     >
//       {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
//     </button>
//   );
// }
