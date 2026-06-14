import {
  createContext, useContext, useState, useEffect,
  useCallback, useRef, useMemo,
} from "react";
import { useAuth } from "./AuthContext";

const StockContext = createContext(null);
const HISTORY_CAP = 200;
const WS_RECONNECT_MS = 2000;

export function StockProvider({ children }) {
  const { user, setUser } = useAuth();

  const [prices, setPrices] = useState({});
  const [openingPrices, setOpeningPrices] = useState({});
  const [priceHistory, setPriceHistory] = useState({});
  const [sessionStats, setSessionStats] = useState({});
  const [connected, setConnected] = useState(false);
  const [news, setNews] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [portfolio, setPortfolio] = useState({ cash: 100000, positions: {} });
  const [tradeHistory, setTradeHistory] = useState([]);

  const openingCaptured = useRef(false);
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);

  
  useEffect(() => {
    if (!user) return;
    fetch(`/api/portfolio/${encodeURIComponent(user.email)}`)
      .then((r) => r.json())
      .then((pf) => setPortfolio(pf))
      .catch(console.error);
  }, [user]);

  
  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  
  useEffect(() => {
    if (!user) return;
    let disposed = false;

    function connect() {
      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      const ws = new WebSocket(`${protocol}://${window.location.host}/ws`);
      wsRef.current = ws;

      ws.onopen = () => { if (!disposed) setConnected(true); };

      ws.onmessage = (event) => {
        if (disposed) return;
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === "SNAPSHOT") {
            setPrices(msg.prices);
            if (msg.stats) setSessionStats(msg.stats);
            if (!openingCaptured.current) {
              setOpeningPrices({ ...msg.prices });
              openingCaptured.current = true;
            }
            if (msg.history) {
              const h = {};
              for (const t of Object.keys(msg.history)) {
                h[t] = msg.history[t].slice(-HISTORY_CAP);
              }
              setPriceHistory(h);
            }
          }

          if (msg.type === "PRICE_UPDATE") {
            setPrices(msg.prices);
            if (msg.stats) setSessionStats(msg.stats);
            if (msg.prices) {
              setPriceHistory((prev) => {
                const next = { ...prev };
                for (const ticker of Object.keys(msg.prices)) {
                  const arr = prev[ticker] ? [...prev[ticker]] : [];
                  arr.push(msg.prices[ticker]);
                  if (arr.length > HISTORY_CAP) arr.shift();
                  next[ticker] = arr;
                }
                return next;
              });
            }
          }

          if (msg.type === "ALERTS" && msg.alerts) {
            for (const alert of msg.alerts) {
              addToast({
                type: alert.changePct > 0 ? "gain" : "loss",
                title: `${alert.ticker} ${alert.changePct > 0 ? "📈" : "📉"} ${alert.changePct > 0 ? "+" : ""}${alert.changePct}%`,
                message: `${alert.ticker} moved to $${alert.price.toFixed(2)}`,
              });
            }
          }

          if (msg.type === "NEWS" && msg.article) {
            setNews((prev) => [msg.article, ...prev].slice(0, 50));
          }
        } catch {  }
      };

      ws.onclose = () => {
        if (disposed) return;
        setConnected(false);
        reconnectTimer.current = setTimeout(connect, WS_RECONNECT_MS);
      };

      ws.onerror = () => ws.close();
    }

    connect();

    return () => {
      disposed = true;
      clearTimeout(reconnectTimer.current);
      if (wsRef.current) wsRef.current.close();
      wsRef.current = null;
      openingCaptured.current = false;
      setConnected(false);
      setPrices({});
      setPriceHistory({});
      setOpeningPrices({});
      setSessionStats({});
      setNews([]);
    };
  }, [user, addToast]);

  
  const subscribe = useCallback(async (email, ticker) => {
    const res = await fetch(`/api/subscriptions/${encodeURIComponent(email)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticker }),
    });
    const data = await res.json();
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, subscriptions: data.subscriptions };
      localStorage.setItem("td_user", JSON.stringify(updated));
      return updated;
    });
  }, [setUser]);

  const unsubscribe = useCallback(async (email, ticker) => {
    const res = await fetch(
      `/api/subscriptions/${encodeURIComponent(email)}/${ticker}`,
      { method: "DELETE" }
    );
    const data = await res.json();
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, subscriptions: data.subscriptions };
      localStorage.setItem("td_user", JSON.stringify(updated));
      return updated;
    });
  }, [setUser]);

  
  const executeTrade = useCallback(async (email, ticker, action, quantity) => {
    const res = await fetch("/api/trade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, ticker, action, quantity }),
    });
    const data = await res.json();
    if (res.ok) {
      setPortfolio(data.portfolio);
      setTradeHistory((prev) => [{ ...data.trade, id: Date.now() + Math.random() }, ...prev]);
      return { success: true, trade: data.trade };
    } else {
      addToast({ type: "loss", title: "Trade Failed", message: data.error });
      return { success: false, error: data.error };
    }
  }, [addToast]);

  
  const walletDeposit = useCallback(async (email, amount) => {
    const res = await fetch("/api/wallet/deposit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, amount }),
    });
    const data = await res.json();
    if (res.ok) {
      setPortfolio(data.portfolio);
      setTradeHistory((prev) => [{ id: Date.now(), ticker: "WALLET", action: "DEPOSIT", quantity: 1, price: amount, total: amount, timestamp: new Date().toISOString() }, ...prev]);
      return { success: true, cash: data.cash };
    }
    return { success: false, error: data.error };
  }, []);

  const walletWithdraw = useCallback(async (email, amount) => {
    const res = await fetch("/api/wallet/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, amount }),
    });
    const data = await res.json();
    if (res.ok) {
      setPortfolio(data.portfolio);
      setTradeHistory((prev) => [{ id: Date.now(), ticker: "WALLET", action: "WITHDRAW", quantity: 1, price: amount, total: amount, timestamp: new Date().toISOString() }, ...prev]);
      return { success: true, cash: data.cash };
    }
    return { success: false, error: data.error };
  }, []);

  const value = useMemo(() => ({
    prices, openingPrices, priceHistory, sessionStats, connected,
    news, toasts, dismissToast, addToast,
    portfolio, executeTrade, tradeHistory,
    subscribe, unsubscribe,
    walletDeposit, walletWithdraw,
  }), [
    prices, openingPrices, priceHistory, sessionStats, connected,
    news, toasts, dismissToast, addToast,
    portfolio, executeTrade, tradeHistory,
    subscribe, unsubscribe,
    walletDeposit, walletWithdraw,
  ]);

  return <StockContext.Provider value={value}>{children}</StockContext.Provider>;
}

export function useStocks() {
  const ctx = useContext(StockContext);
  if (!ctx) throw new Error("useStocks must be inside <StockProvider>");
  return ctx;
}
