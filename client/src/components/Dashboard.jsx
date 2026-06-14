import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";
import TickerTape from "./TickerTape";
import Sidebar from "./Sidebar";
import HomePage from "./HomePage";
import TradePage from "./TradePage";
import PortfolioPage from "./PortfolioPage";
import WatchlistPage from "./WatchlistPage";
import WalletPage from "./WalletPage";
import NewsPage from "./NewsPage";

import "./Dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    const handler = (e) => {
      if (document.activeElement?.tagName === "INPUT") return;
      if (e.key === "t" || e.key === "T") {
        const btn = document.getElementById("theme-toggle");
        if (btn) btn.click();
      }
      if (e.key === "1") setActiveTab("home");
      if (e.key === "2") setActiveTab("trade");
      if (e.key === "3") setActiveTab("portfolio");
      if (e.key === "4") setActiveTab("watchlist");
      if (e.key === "5") setActiveTab("wallet");
      if (e.key === "6") setActiveTab("news");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const renderPage = () => {
    switch (activeTab) {
      case "home":      return <HomePage onNavigate={setActiveTab} />;
      case "trade":     return <TradePage />;
      case "portfolio": return <PortfolioPage />;
      case "watchlist": return <WatchlistPage onNavigate={setActiveTab} />;
      case "wallet":    return <WalletPage />;
      case "news":      return <NewsPage />;
      default:          return <HomePage onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="dashboard">
      <Navbar />
      <TickerTape />
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="dashboard__page">
        {renderPage()}
      </div>
    </div>
  );
}
