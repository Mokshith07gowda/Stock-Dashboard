import { useState, useEffect, useRef } from "react";
import "./SearchBar.css";

export default function SearchBar({ value, onChange }) {
  const inputRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="searchbar">
      <span className="searchbar__icon">🔍</span>
      <input
        ref={inputRef}
        className="searchbar__input"
        type="text"
        placeholder="Search stocks…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        id="stock-search"
      />
      <kbd className="searchbar__shortcut">/</kbd>
    </div>
  );
}
