import { useStocks } from "../context/StockContext";
import "./NewsPage.css";

export default function NewsPage() {
  const { news } = useStocks();

  return (
    <div className="newspage">
      <h1 className="newspage__title">Market News</h1>
      <p className="newspage__subtitle">Live financial headlines from the market feed</p>

      <div className="newspage__list">
        {news.length === 0 ? (
          <p className="newspage__empty">No news yet — headlines will appear as the market moves.</p>
        ) : (
          news.map((item, i) => {
            const relatedTicker = item.headline?.match(/\b(GOOG|TSLA|AMZN|META|NVDA)\b/)?.[1];
            return (
              <article className="newspage__item" key={i}>
                <div className="newspage__item-header">
                  <span className="newspage__time">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {relatedTicker && (
                    <span className="newspage__tag">{relatedTicker}</span>
                  )}
                </div>
                <p className="newspage__headline">{item.headline}</p>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
