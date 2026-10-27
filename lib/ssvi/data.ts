// Server-side market data adapters for the SSVI demo (ports of TickerAdapter / OptionsAdapter /
// fetch_zero_rates_stateless). No API keys needed: treasury yields come from FRED's public CSV
// and option chains from Yahoo. If ALPACA_KEY / ALPACA_SECRET_KEY are set, quotes come from
// Alpaca exactly like the original app.
import { TBILLS, TENOR_TO_ID, calcZeroRates, interpolateZeroRate, tte, type OptionRow } from "./engine";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

// ---------------------------------------------------------------------------
// Zero curve
// ---------------------------------------------------------------------------

let curveCache: { at: number; curve: Record<number, number>; parYields: Record<string, number> } | null = null;

async function latestFred(seriesId: string): Promise<number | null> {
  const start = new Date(Date.now() - 45 * 86400000).toISOString().slice(0, 10);
  const res = await fetch(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${seriesId}&cosd=${start}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`FRED ${seriesId}: HTTP ${res.status}`);
  const lines = (await res.text()).trim().split("\n").slice(1);
  for (let i = lines.length - 1; i >= 0; i--) {
    const v = parseFloat(lines[i].split(",")[1]);
    if (!Number.isNaN(v)) return v / 100.0;
  }
  return null;
}

export async function fetchZeroRates() {
  if (curveCache && Date.now() - curveCache.at < 3600_000) return curveCache;

  const parIds = Object.entries(TENOR_TO_ID);
  const billIds = Object.entries(TBILLS);
  const values = await Promise.all(
    [...parIds, ...billIds].map(([, id]) => latestFred(id).catch(() => null))
  );

  const parYields: Record<number, number> = {};
  const raw: Record<string, number> = {};
  parIds.forEach(([tenor, id], i) => {
    if (values[i] !== null) {
      parYields[Number(tenor)] = values[i]!;
      raw[id] = values[i]!;
    }
  });
  if (Object.keys(parYields).length === 0) throw new Error("Could not fetch any treasury yields");

  const curve = calcZeroRates(parYields);
  billIds.forEach(([tenor, id], i) => {
    const r = values[parIds.length + i];
    if (r !== null) {
      curve[Number(tenor)] = 1.0 / (1.0 + r * Number(tenor));
      raw[id] = r;
    }
  });

  curveCache = { at: Date.now(), curve, parYields: raw };
  return curveCache;
}

// ---------------------------------------------------------------------------
// Yahoo session (cookie + crumb, same handshake yfinance performs)
// ---------------------------------------------------------------------------

let yahoo: { cookie: string; crumb: string; at: number } | null = null;

async function yahooSession(force = false) {
  if (yahoo && !force && Date.now() - yahoo.at < 30 * 60_000) return yahoo;
  const res = await fetch("https://fc.yahoo.com", { headers: { "User-Agent": UA }, redirect: "manual", cache: "no-store" });
  const cookie = res.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
  const crumbRes = await fetch("https://query2.finance.yahoo.com/v1/test/getcrumb", {
    headers: { "User-Agent": UA, Cookie: cookie },
    cache: "no-store",
  });
  const crumb = await crumbRes.text();
  if (!crumbRes.ok || !crumb || crumb.includes("<")) throw new Error("Yahoo Finance rejected the session request");
  yahoo = { cookie, crumb, at: Date.now() };
  return yahoo;
}

async function yahooOptions(ticker: string, date?: number): Promise<any> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const s = await yahooSession(attempt > 0);
    const url = new URL(`https://query2.finance.yahoo.com/v7/finance/options/${encodeURIComponent(ticker)}`);
    url.searchParams.set("crumb", s.crumb);
    if (date) url.searchParams.set("date", String(date));
    const res = await fetch(url, { headers: { "User-Agent": UA, Cookie: s.cookie }, cache: "no-store" });
    if (res.status === 401 || res.status === 403) continue;
    if (!res.ok) throw new Error(`Yahoo options ${ticker}: HTTP ${res.status}`);
    const json = await res.json();
    const result = json?.optionChain?.result?.[0];
    if (!result) throw new Error(`No option chain found for ${ticker}`);
    return result;
  }
  throw new Error("Yahoo Finance session expired");
}

// ---------------------------------------------------------------------------
// Alpaca (optional, mirrors OptionHistoricalDataClient.get_option_chain)
// ---------------------------------------------------------------------------

const alpacaHeaders = () =>
  process.env.ALPACA_KEY && process.env.ALPACA_SECRET_KEY
    ? { "APCA-API-KEY-ID": process.env.ALPACA_KEY, "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET_KEY }
    : null;

async function alpacaSpot(ticker: string): Promise<number | null> {
  const headers = alpacaHeaders();
  if (!headers) return null;
  try {
    const res = await fetch(`https://data.alpaca.markets/v2/stocks/${ticker}/quotes/latest`, { headers, cache: "no-store" });
    if (!res.ok) return null;
    const q = (await res.json()).quote;
    return (q.ap + q.bp) / 2;
  } catch {
    return null;
  }
}

async function alpacaChain(ticker: string, expiry: string, strikeGte: number, strikeLte: number) {
  const headers = alpacaHeaders()!;
  const rows: { strike: number; bid: number; ask: number; lastPrice: number }[] = [];
  let pageToken: string | undefined;
  do {
    const url = new URL(`https://data.alpaca.markets/v1beta1/options/snapshots/${ticker}`);
    url.searchParams.set("type", "call");
    url.searchParams.set("expiration_date", expiry);
    url.searchParams.set("strike_price_gte", String(strikeGte));
    url.searchParams.set("strike_price_lte", String(strikeLte));
    url.searchParams.set("feed", "indicative");
    url.searchParams.set("limit", "1000");
    if (pageToken) url.searchParams.set("page_token", pageToken);
    const res = await fetch(url, { headers, cache: "no-store" });
    if (!res.ok) throw new Error(`Alpaca options ${ticker}: HTTP ${res.status}`);
    const json = await res.json();
    for (const [symbol, snap] of Object.entries<any>(json.snapshots ?? {})) {
      if (!symbol.startsWith(ticker) || symbol.length < 15 + ticker.length) continue;
      const suffix = symbol.slice(-15);
      rows.push({
        strike: parseFloat(suffix.slice(7)) / 1000,
        bid: Number(snap.latestQuote?.bp ?? 0),
        ask: Number(snap.latestQuote?.ap ?? 0),
        lastPrice: Number(snap.latestTrade?.p ?? 0),
      });
    }
    pageToken = json.next_page_token ?? undefined;
  } while (pageToken);
  return rows;
}

// ---------------------------------------------------------------------------
// OptionsAdapter.fetch_option_chain
// ---------------------------------------------------------------------------

export interface ChainRequest {
  ticker: string;
  expiryStart: string;
  expiryEnd: string;
  moneynessMin: number;
  moneynessMax: number;
}

export async function fetchOptionChain(req: ChainRequest) {
  const { curve } = await fetchZeroRates();
  const base = await yahooOptions(req.ticker);

  // TickerAdapter.fetchBasic: Alpaca mid if within 1% of Yahoo, otherwise Yahoo
  const yahooSpot: number = base.quote.regularMarketPrice;
  let spot = await alpacaSpot(req.ticker);
  if (spot === null || Math.abs(spot - yahooSpot) / yahooSpot > 0.01) spot = yahooSpot;
  const div: number = base.quote.dividendYield ?? 0; // percent, same convention as yfinance .info

  const allExpiries: { ts: number; date: string }[] = (base.expirationDates as number[]).map((ts) => ({
    ts,
    date: new Date(ts * 1000).toISOString().slice(0, 10),
  }));
  const targets = allExpiries.filter((e) => e.date >= req.expiryStart && e.date <= req.expiryEnd);

  const nowUtc = new Date();
  const useAlpaca = alpacaHeaders() !== null;
  const rows: (OptionRow & { bid: number; ask: number; lastPrice: number })[] = [];

  const fetchOne = async (e: { ts: number; date: string }) => {
    const T = tte(e.date, nowUtc);
    const rate = interpolateZeroRate(T, curve);
    const forward = spot! * Math.exp((rate - div / 100) * T);
    const lo = req.moneynessMin * forward;
    const hi = req.moneynessMax * forward;

    let quotes: { strike: number; bid: number; ask: number; lastPrice: number }[];
    if (useAlpaca) {
      quotes = await alpacaChain(req.ticker, e.date, lo, hi);
    } else {
      const chain = e.ts === base.options?.[0]?.expirationDate ? base : await yahooOptions(req.ticker, e.ts);
      quotes = (chain.options?.[0]?.calls ?? [])
        .map((c: any) => ({ strike: c.strike, bid: c.bid ?? 0, ask: c.ask ?? 0, lastPrice: c.lastPrice ?? 0 }))
        .filter((q: any) => q.strike >= lo && q.strike <= hi);
    }

    return quotes.map((q) => ({
      optionType: "call" as const,
      strike: q.strike,
      timeToExpiry: T,
      // Mid price, falling back to last trade when either side of the book is empty
      midPrice: q.bid === 0 || q.ask === 0 ? q.lastPrice : (q.bid + q.ask) / 2,
      expiry: e.date,
      bid: q.bid,
      ask: q.ask,
      lastPrice: q.lastPrice,
    }));
  };

  // Small batches keep Yahoo from rate limiting us
  for (let i = 0; i < targets.length; i += 6) {
    const batch = await Promise.all(targets.slice(i, i + 6).map(fetchOne));
    batch.forEach((b) => rows.push(...b));
  }

  rows.sort((a, b) => (a.expiry === b.expiry ? a.strike - b.strike : a.expiry < b.expiry ? -1 : 1));

  return {
    ticker: req.ticker,
    spot,
    dividendYield: div,
    source: useAlpaca ? "Alpaca" : "Yahoo Finance",
    rows,
  };
}
