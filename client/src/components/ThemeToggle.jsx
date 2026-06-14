import { useState, useEffect } from "react";

const LS_KEY = "td_theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(LS_KEY) || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(LS_KEY, theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <button
      className="theme-toggle"
      onClick={toggle}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode (T)`}
      id="theme-toggle"
      style={{
        background: "none",
        border: "1px solid var(--border-color)",
        borderRadius: "6px",
        padding: "5px 10px",
        cursor: "pointer",
        fontSize: "16px",
        lineHeight: 1,
        transition: "border-color 0.2s",
      }}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
