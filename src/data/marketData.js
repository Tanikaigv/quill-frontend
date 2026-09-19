// Synthetic multi-asset price history used to build the UI end-to-end
// before real market-data ingestion is wired up on the backend.
import { mulberry32, gaussian } from "../utils/random";

function businessDaysEnding(endDate, count) {
  const dates = [];
  const cursor = new Date(endDate);
  while (dates.length < count) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() - 1);
  }
  return dates.reverse();
}

// Each asset walks through alternating regime "phases" (drift + vol) so the
// series has realistic bull / bear / calm / turbulent stretches to analyze.
function generateSeries({ seed, start, phases, length }) {
  const rng = mulberry32(seed);
  const closes = [start];
  let phaseIdx = 0;
  let phaseCounter = 0;
  for (let i = 1; i < length; i++) {
    const phase = phases[phaseIdx % phases.length];
    const shock = gaussian(rng) * phase.vol;
    const next = closes[i - 1] * (1 + phase.drift + shock);
    closes.push(Math.max(next, start * 0.15));
    phaseCounter++;
    if (phaseCounter >= phase.len) {
      phaseCounter = 0;
      phaseIdx++;
    }
  }
  return closes;
}

const LENGTH = 380;
const TODAY = new Date();
const DATES = businessDaysEnding(TODAY, LENGTH);

const RAW = {
  GOLD: {
    symbol: "GOLD",
    name: "Gold Spot",
    unit: "USD / oz",
    assetClass: "Commodity",
    accent: "gold",
    closes: generateSeries({
      seed: 1911,
      start: 2020,
      length: LENGTH,
      phases: [
        { len: 60, drift: 0.0009, vol: 0.006 },
        { len: 40, drift: -0.0004, vol: 0.009 },
        { len: 70, drift: 0.0013, vol: 0.0055 },
        { len: 50, drift: 0.0002, vol: 0.005 },
      ],
    }),
  },
  BTC: {
    symbol: "BTC",
    name: "Bitcoin",
    unit: "USD",
    assetClass: "Cryptocurrency",
    accent: "primary",
    closes: generateSeries({
      seed: 7331,
      start: 42000,
      length: LENGTH,
      phases: [
        { len: 45, drift: 0.004, vol: 0.026 },
        { len: 35, drift: -0.006, vol: 0.038 },
        { len: 55, drift: 0.003, vol: 0.03 },
        { len: 40, drift: -0.002, vol: 0.034 },
        { len: 60, drift: 0.0035, vol: 0.024 },
      ],
    }),
  },
  NVDA: {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    unit: "USD",
    assetClass: "Equity",
    accent: "loss",
    closes: generateSeries({
      seed: 2664,
      start: 118,
      length: LENGTH,
      phases: [
        { len: 50, drift: 0.0032, vol: 0.021 },
        { len: 30, drift: -0.003, vol: 0.03 },
        { len: 65, drift: 0.0028, vol: 0.019 },
        { len: 35, drift: 0.0005, vol: 0.024 },
      ],
    }),
  },
};

export const ASSETS = Object.fromEntries(
  Object.entries(RAW).map(([key, asset]) => [
    key,
    {
      ...asset,
      series: DATES.map((date, i) => ({
        date: date.toISOString().slice(0, 10),
        close: Number(asset.closes[i].toFixed(2)),
      })),
    },
  ])
);

export const ASSET_LIST = Object.values(ASSETS).map(({ closes: _closes, ...rest }) => rest);

export const DEFAULT_ASSET = "NVDA";
