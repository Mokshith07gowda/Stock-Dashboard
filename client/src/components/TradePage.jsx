import { useState } from "react";
import { useStocks } from "../context/StockContext";
import MarketPanel from "./MarketPanel";
import StockModal from "./StockModal";
import "./TradePage.css";

export default function TradePage() {
  const { prices, openingPrices } = useStocks();
  const [modalTicker, setModalTicker] = useState(null);

  const tickers = Object.keys(prices);
  const gainers = tickers.filter((t) => (prices[t] - (openingPrices[t] || prices[t])) >= 0).length;
  const losers = tickers.length - gainers;

  return (
    <div className="tradepage">
      <div className="tradepage__header">
        <div>
          <h1 className="tradepage__title">Trade</h1>
          <p className="tradepage__subtitle">Click any stock to open the trading panel</p>
        </div>
        <div className="tradepage__summary">
          <span className="tradepage__pill tradepage__pill--gain">▲ {gainers} Gainers</span>
          <span className="tradepage__pill tradepage__pill--loss">▼ {losers} Losers</span>
        </div>
      </div>

      <MarketPanel onOpenModal={setModalTicker} />

      {modalTicker && (
        <StockModal ticker={modalTicker} onClose={() => setModalTicker(null)} />
      )}
    </div>
  );
}
