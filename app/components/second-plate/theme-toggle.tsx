import { useEffect, useState } from "react";
import { IconMoon, IconSun } from "@tabler/icons-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const isDark =
      document.documentElement.classList.contains("dark") ||
      (window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches &&
        localStorage.getItem("theme") !== "light");
    if (isDark) {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
      aria-label="Toggle theme"
      className="flex size-9 items-center justify-center rounded-full border border-border/70 bg-card text-muted-foreground shadow-xs transition-all hover:border-primary/40 hover:bg-accent hover:text-foreground hover:scale-105 active:scale-95"
    >
      {theme === "dark" ? (
        <IconSun size={17} className="text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <IconMoon size={17} className="text-primary transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
}
