"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface Position {
  symbol: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
}

interface Team {
  id: string;
  portfolioValue: number;
  dailyPnL: number;
  sharpe: number;
  sortino: number;
  maxDrawdown: number;
  positions: Position[];
}

interface Trade {
  id: number;
  time: string;
  team: string;
  symbol: string;
  side: "BUY" | "SELL";
  qty: number;
  price: number;
}

const INITIAL_CAPITAL = 100000;

const PRICES: Record<string, number> = {
  NVDA: 124.5, AAPL: 228.4, MSFT: 436.2, TSLA: 241.8, SPY: 558.1, AMD: 156.8,
  GOOGL: 182.4, META: 518.2, AMZN: 186.1, NFLX: 672.3, QQQ: 476.5, IWM: 219.8,
  JPM: 208.4, GS: 485.1, XLF: 42.3, COIN: 222.0, TLT: 95.1,
};

const pos = (symbol: string, shares: number, avgPrice: number): Position => ({
  symbol, shares, avgPrice, currentPrice: PRICES[symbol],
});

const INITIAL_TEAMS: Team[] = [
  { id: "team-kappa", portfolioValue: 148420.5, dailyPnL: 3410.2, sharpe: 2.45, sortino: 3.18, maxDrawdown: 3.82,
    positions: [pos("NVDA", 140, 118.2), pos("AAPL", 210, 220.1), pos("MSFT", -65, 442.8), pos("TSLA", 95, 232.4), pos("SPY", 80, 550.2)] },
  { id: "team-alpha", portfolioValue: 139120.0, dailyPnL: 1890.4, sharpe: 2.18, sortino: 2.74, maxDrawdown: 4.65,
    positions: [pos("AMD", 180, 152.4), pos("GOOGL", 130, 178.1), pos("META", 70, 510.5)] },
  { id: "team-sigma", portfolioValue: 131840.25, dailyPnL: 940.1, sharpe: 1.95, sortino: 2.41, maxDrawdown: 5.12,
    positions: [pos("AMZN", 160, 182.2), pos("NFLX", 45, 660.4)] },
  { id: "team-delta", portfolioValue: 125600.8, dailyPnL: -420.5, sharpe: 1.72, sortino: 2.1, maxDrawdown: 6.4,
    positions: [pos("QQQ", 110, 472.0), pos("IWM", -150, 218.4)] },
  { id: "team-omega", portfolioValue: 119850.0, dailyPnL: 620.0, sharpe: 1.54, sortino: 1.88, maxDrawdown: 7.1,
    positions: [pos("JPM", 90, 205.2), pos("GS", 40, 480.0)] },
  { id: "team-beta", portfolioValue: 114220.4, dailyPnL: 210.8, sharpe: 1.41, sortino: 1.65, maxDrawdown: 4.1,
    positions: [pos("SPY", 120, 552.0), pos("XLF", -200, 42.1)] },
  { id: "team-gamma", portfolioValue: 108940.0, dailyPnL: -810.0, sharpe: 1.15, sortino: 1.3, maxDrawdown: 9.8,
    positions: [pos("COIN", 60, 215.0)] },
  { id: "team-theta", portfolioValue: 102450.1, dailyPnL: 140.2, sharpe: 0.98, sortino: 1.12, maxDrawdown: 11.2,
    positions: [pos("TLT", 150, 94.2)] },
];

const usd = (v: number) =>
  v.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
const signed = (v: number, suffix = "") => `${v >= 0 ? "+" : ""}${v.toFixed(2)}${suffix}`;
const signedUsd = (v: number) => `${v >= 0 ? "+" : "-"}${usd(Math.abs(v))}`;
const pnlColor = (v: number) => (v >= 0 ? "text-[#4ec9b0]" : "text-[#f14c4c]");
const totalReturn = (t: Team) => ((t.portfolioValue - INITIAL_CAPITAL) / INITIAL_CAPITAL) * 100;
const now = () => new Date().toTimeString().slice(0, 8);

function randomTrade(id: number, teams: Team[]): Trade {
  const team = teams[Math.floor(Math.random() * teams.length)];
  const symbols = team.positions.map((p) => p.symbol);
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  return {
    id,
    time: now(),
    team: team.id,
    symbol,
    side: Math.random() > 0.45 ? "BUY" : "SELL",
    qty: Math.floor(Math.random() * 40) + 10,
    price: PRICES[symbol] * (1 + (Math.random() - 0.5) * 0.004),
  };
}

function Panel({ title, right, children, className }: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col min-h-0 border-[#262626]", className)}>
      <div className="h-9 px-4 flex items-center justify-between border-b border-[#262626] flex-shrink-0">
        <h2 className="text-[13px] font-medium text-[#e5e5e5]">{title}</h2>
        {right && <div className="text-xs text-[#8a8a8a]">{right}</div>}
      </div>
      <div className="flex-1 min-h-0 overflow-auto">{children}</div>
    </section>
  );
}

const th = "py-2 px-4 font-normal text-[#8a8a8a]";
const td = "py-1.5 px-4";

export default function QTCDemo() {
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [selectedId, setSelectedId] = useState(INITIAL_TEAMS[0].id);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [running, setRunning] = useState(true);
  const [clock, setClock] = useState("");

  useEffect(() => {
    setTrades(Array.from({ length: 8 }, (_, i) => randomTrade(i, INITIAL_TEAMS)));
    setClock(now());
    const id = setInterval(() => setClock(now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setTeams((prev) =>
        prev.map((team) => {
          const value = team.portfolioValue * (1 + (Math.random() - 0.48) * 0.003);
          return {
            ...team,
            portfolioValue: value,
            dailyPnL: team.dailyPnL + (value - team.portfolioValue),
            positions: team.positions.map((p) => ({
              ...p,
              currentPrice: p.currentPrice * (1 + (Math.random() - 0.48) * 0.004),
            })),
          };
        })
      );
      setTrades((prev) => [randomTrade(Date.now(), INITIAL_TEAMS), ...prev.slice(0, 19)]);
    }, 2500);
    return () => clearInterval(id);
  }, [running]);

  const ranked = useMemo(
    () => [...teams].sort((a, b) => b.portfolioValue - a.portfolioValue),
    [teams]
  );
  const selected = teams.find((t) => t.id === selectedId) ?? teams[0];

  const equity = useMemo(() => {
    const seed = selected.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const n = 60;
    const pts = Array.from({ length: n + 1 }, (_, i) => {
      const trend = INITIAL_CAPITAL + ((selected.portfolioValue - INITIAL_CAPITAL) * i) / n;
      const noise = (Math.sin(i * 0.7 + seed) + Math.cos(i * 1.3 + seed * 0.5)) * 1400 * Math.min(1, i / 6);
      return trend + noise;
    });
    pts[n] = selected.portfolioValue;
    const min = Math.min(...pts);
    const max = Math.max(...pts);
    const W = 600;
    const H = 200;
    const line = pts
      .map((p, i) => `${(i / n) * W},${H - 8 - ((p - min) / (max - min || 1)) * (H - 16)}`)
      .join(" ");
    return { line, W, H, min, max };
  }, [selected.id, selected.portfolioValue]);

  const ret = totalReturn(selected);
  const stats = [
    { label: "Value", value: usd(selected.portfolioValue) },
    { label: "Today", value: signedUsd(selected.dailyPnL), color: pnlColor(selected.dailyPnL) },
    { label: "Return", value: signed(ret, "%"), color: pnlColor(ret) },
    { label: "Sharpe", value: selected.sharpe.toFixed(2) },
    { label: "Sortino", value: selected.sortino.toFixed(2) },
    { label: "Max drawdown", value: `${selected.maxDrawdown.toFixed(2)}%` },
  ];

  return (
    <div className="min-h-screen lg:h-screen w-full bg-[#141414] text-[#d4d4d4] text-[13px] flex flex-col font-sans tabular-nums">
      <header className="h-11 px-4 border-b border-[#262626] flex items-center justify-between flex-shrink-0">
        <div className="flex items-baseline gap-3">
          <span className="font-semibold text-[#f5f5f5]">QTC</span>
          <span className="text-[#8a8a8a]">Leaderboard</span>
        </div>
        <div className="flex items-center gap-3 text-[#8a8a8a]">
          <span className="font-mono text-xs">{clock}</span>
          <button
            onClick={() => setRunning((r) => !r)}
            className="p-1.5 rounded hover:bg-[#262626] hover:text-[#e5e5e5]"
            title={running ? "Pause" : "Resume"}
          >
            {running ? <Pause size={14} /> : <Play size={14} />}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border-b border-[#262626] flex-shrink-0">
        {stats.map((s) => (
          <div key={s.label} className="px-4 py-3">
            <div className="text-xs text-[#8a8a8a]">{s.label}</div>
            <div className={cn("text-base font-medium mt-0.5 text-[#f5f5f5]", s.color)}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-2">
        <Panel title="Teams" className="lg:col-span-5 border-b lg:border-r">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-[#141414]">
              <tr>
                <th className={th}>#</th>
                <th className={th}>Team</th>
                <th className={cn(th, "text-right")}>Value</th>
                <th className={cn(th, "text-right")}>Return</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((t, i) => {
                const r = totalReturn(t);
                return (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    className={cn(
                      "cursor-pointer",
                      t.id === selectedId ? "bg-[#1f2a36]" : "hover:bg-[#1c1c1c]"
                    )}
                  >
                    <td className={cn(td, "text-[#8a8a8a] w-8")}>{i + 1}</td>
                    <td className={cn(td, "text-[#e5e5e5]")}>{t.id}</td>
                    <td className={cn(td, "text-right")}>{usd(t.portfolioValue)}</td>
                    <td className={cn(td, "text-right", pnlColor(r))}>{signed(r, "%")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>

        <Panel title={`Equity: ${selected.id}`} className="lg:col-span-7 border-b">
          <div className="h-full min-h-[200px] p-4 flex flex-col">
            <svg viewBox={`0 0 ${equity.W} ${equity.H}`} preserveAspectRatio="none" className="w-full flex-1 min-h-[160px]">
              {[0.25, 0.5, 0.75].map((f) => (
                <line key={f} x1="0" x2={equity.W} y1={equity.H * f} y2={equity.H * f} stroke="#262626" />
              ))}
              <polyline
                points={equity.line}
                fill="none"
                stroke="#4fc1ff"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <div className="flex justify-between text-xs text-[#8a8a8a] pt-2">
              <span>Low {usd(equity.min)}</span>
              <span>High {usd(equity.max)}</span>
            </div>
          </div>
        </Panel>

        <Panel title="Positions" right={selected.id} className="lg:col-span-5 border-b lg:border-b-0 lg:border-r">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-[#141414]">
              <tr>
                <th className={th}>Symbol</th>
                <th className={cn(th, "text-right")}>Qty</th>
                <th className={cn(th, "text-right")}>Avg</th>
                <th className={cn(th, "text-right")}>Last</th>
                <th className={cn(th, "text-right")}>P&amp;L</th>
              </tr>
            </thead>
            <tbody>
              {selected.positions.map((p) => {
                const pnl = (p.currentPrice - p.avgPrice) * p.shares;
                return (
                  <tr key={p.symbol} className="hover:bg-[#1c1c1c]">
                    <td className={cn(td, "text-[#e5e5e5]")}>{p.symbol}</td>
                    <td className={cn(td, "text-right")}>{p.shares}</td>
                    <td className={cn(td, "text-right text-[#8a8a8a]")}>{p.avgPrice.toFixed(2)}</td>
                    <td className={cn(td, "text-right")}>{p.currentPrice.toFixed(2)}</td>
                    <td className={cn(td, "text-right", pnlColor(pnl))}>{signed(pnl)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>

        <Panel title="Fills" className="lg:col-span-7">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-[#141414]">
              <tr>
                <th className={th}>Time</th>
                <th className={th}>Team</th>
                <th className={th}>Symbol</th>
                <th className={th}>Side</th>
                <th className={cn(th, "text-right")}>Qty</th>
                <th className={cn(th, "text-right")}>Price</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t) => (
                <tr key={t.id} className="hover:bg-[#1c1c1c]">
                  <td className={cn(td, "font-mono text-xs text-[#8a8a8a]")}>{t.time}</td>
                  <td className={td}>{t.team}</td>
                  <td className={cn(td, "text-[#e5e5e5]")}>{t.symbol}</td>
                  <td className={cn(td, t.side === "BUY" ? "text-[#4ec9b0]" : "text-[#f14c4c]")}>{t.side}</td>
                  <td className={cn(td, "text-right")}>{t.qty}</td>
                  <td className={cn(td, "text-right")}>{t.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </div>
  );
}
