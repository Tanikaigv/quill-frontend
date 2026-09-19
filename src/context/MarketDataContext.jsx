import { createContext, useContext, useMemo, useState } from "react";
import { ASSETS, ASSET_LIST, DEFAULT_ASSET } from "../data/marketData";
import { dailyReturns } from "../utils/indicators";

const MarketDataContext = createContext(null);

// Central source of market data + the currently focused asset, shared across
// the dashboard, markets, analytics, correlation and backtesting pages so a
// selection made in one place carries into the next.
export function MarketDataProvider({ children }) {
  const [selectedSymbol, setSelectedSymbol] = useState(DEFAULT_ASSET);

  const returnsBySymbol = useMemo(() => {
    return Object.fromEntries(
      Object.entries(ASSETS).map(([key, asset]) => [key, dailyReturns(asset.series)])
    );
  }, []);

  const value = useMemo(
    () => ({
      assets: ASSETS,
      assetList: ASSET_LIST,
      returnsBySymbol,
      selectedSymbol,
      setSelectedSymbol,
      selectedAsset: ASSETS[selectedSymbol],
    }),
    [selectedSymbol, returnsBySymbol]
  );

  return <MarketDataContext.Provider value={value}>{children}</MarketDataContext.Provider>;
}

export function useMarketData() {
  const ctx = useContext(MarketDataContext);
  if (!ctx) throw new Error("useMarketData must be used within a MarketDataProvider");
  return ctx;
}
