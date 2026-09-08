"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Monitor, 
  TrendingUp, 
  Activity, 
  Users, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  Radio, 
  Play, 
  Pause, 
  RotateCw,
  ExternalLink,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Layers,
  Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamData {
  id: string;
  name: string;
  rank: number;
  portfolioValue: number;
  initialCapital: number;
  totalReturn: number;
  dailyPnL: number;
  dailyReturn: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  totalTrades: number;
  winRate: number;
  status: "ACTIVE" | "REBALANCING" | "IDLE";
  positions: {
    symbol: string;
    shares: number;
    avgPrice: number;
    currentPrice: number;
    side: "LONG" | "SHORT";
  }[];
}

interface TradeExecution {
  id: string;
  timestamp: string;
  symbol: string;
  side: "BUY" | "SELL";
  shares: number;
  price: number;
  slippage: number;
  venue: string;
}

const INITIAL_TEAMS: TeamData[] = [
  {
    id: "alqavi_systems",
    name: "ALQAVI_SYSTEMS",
    rank: 1,
    portfolioValue: 148420.50,
    initialCapital: 100000,
    totalReturn: 48.42,
    dailyPnL: 3410.20,
    dailyReturn: 2.35,
    sharpeRatio: 2.45,
    sortinoRatio: 3.18,
    maxDrawdown: 3.82,
    totalTrades: 1482,
    winRate: 68.4,
    status: "ACTIVE",
    positions: [
      { symbol: "NVDA", shares: 140, avgPrice: 118.20, currentPrice: 124.50, side: "LONG" },
      { symbol: "AAPL", shares: 210, avgPrice: 220.10, currentPrice: 228.40, side: "LONG" },
      { symbol: "MSFT", shares: -65, avgPrice: 442.80, currentPrice: 436.20, side: "SHORT" },
      { symbol: "TSLA", shares: 95, avgPrice: 232.40, currentPrice: 241.80, side: "LONG" },
      { symbol: "SPY", shares: 80, avgPrice: 550.20, currentPrice: 558.10, side: "LONG" },
    ]
  },
  {
    id: "alpha_prime",
    name: "ALPHA_PRIME",
    rank: 2,
    portfolioValue: 139120.00,
    initialCapital: 100000,
    totalReturn: 39.12,
    dailyPnL: 1890.40,
    dailyReturn: 1.38,
    sharpeRatio: 2.18,
    sortinoRatio: 2.74,
    maxDrawdown: 4.65,
    totalTrades: 1320,
    winRate: 64.2,
    status: "ACTIVE",
    positions: [
      { symbol: "AMD", shares: 180, avgPrice: 152.40, currentPrice: 156.80, side: "LONG" },
      { symbol: "GOOGL", shares: 130, avgPrice: 178.10, currentPrice: 182.40, side: "LONG" },
      { symbol: "META", shares: 70, avgPrice: 510.50, currentPrice: 518.20, side: "LONG" },
    ]
  },
  {
    id: "quant_x",
    name: "QUANT_X_LABS",
    rank: 3,
    portfolioValue: 131840.25,
    initialCapital: 100000,
    totalReturn: 31.84,
    dailyPnL: 940.10,
    dailyReturn: 0.72,
    sharpeRatio: 1.95,
    sortinoRatio: 2.41,
    maxDrawdown: 5.12,
    totalTrades: 1640,
    winRate: 61.8,
    status: "ACTIVE",
    positions: [
      { symbol: "AMZN", shares: 160, avgPrice: 182.20, currentPrice: 186.10, side: "LONG" },
      { symbol: "NFLX", shares: 45, avgPrice: 660.40, currentPrice: 672.30, side: "LONG" },
    ]
  },
  {
    id: "delta_force",
    name: "DELTA_FORCE",
    rank: 4,
    portfolioValue: 125600.80,
    initialCapital: 100000,
    totalReturn: 25.60,
    dailyPnL: -420.50,
    dailyReturn: -0.33,
    sharpeRatio: 1.72,
    sortinoRatio: 2.10,
    maxDrawdown: 6.40,
    totalTrades: 980,
    winRate: 59.4,
    status: "ACTIVE",
    positions: [
      { symbol: "QQQ", shares: 110, avgPrice: 472.00, currentPrice: 476.50, side: "LONG" },
      { symbol: "IWM", shares: -150, avgPrice: 218.40, currentPrice: 219.80, side: "SHORT" },
    ]
  },
  {
    id: "sigma_capital",
    name: "SIGMA_CAPITAL",
    rank: 5,
    portfolioValue: 119850.00,
    initialCapital: 100000,
    totalReturn: 19.85,
    dailyPnL: 620.00,
    dailyReturn: 0.52,
    sharpeRatio: 1.54,
    sortinoRatio: 1.88,
    maxDrawdown: 7.10,
    totalTrades: 1110,
    winRate: 56.5,
    status: "ACTIVE",
    positions: [
      { symbol: "JPM", shares: 90, avgPrice: 205.20, currentPrice: 208.40, side: "LONG" },
      { symbol: "GS", shares: 40, avgPrice: 480.00, currentPrice: 485.10, side: "LONG" },
    ]
  },
  {
    id: "beta_neutral",
    name: "BETA_NEUTRAL",
    rank: 6,
    portfolioValue: 114220.40,
    initialCapital: 100000,
    totalReturn: 14.22,
    dailyPnL: 210.80,
    dailyReturn: 0.18,
    sharpeRatio: 1.41,
    sortinoRatio: 1.65,
    maxDrawdown: 4.10,
    totalTrades: 840,
    winRate: 55.2,
    status: "ACTIVE",
    positions: [
      { symbol: "SPY", shares: 120, avgPrice: 552.00, currentPrice: 558.10, side: "LONG" },
      { symbol: "XLF", shares: -200, avgPrice: 42.10, currentPrice: 42.30, side: "SHORT" },
    ]
  },
  {
    id: "apex_strat",
    name: "APEX_STRATEGY",
    rank: 7,
    portfolioValue: 108940.00,
    initialCapital: 100000,
    totalReturn: 8.94,
    dailyPnL: -810.00,
    dailyReturn: -0.74,
    sharpeRatio: 1.15,
    sortinoRatio: 1.30,
    maxDrawdown: 9.80,
    totalTrades: 720,
    winRate: 51.4,
    status: "ACTIVE",
    positions: [
      { symbol: "COIN", shares: 60, avgPrice: 215.00, currentPrice: 222.00, side: "LONG" },
    ]
  },
  {
    id: "stochastic_flow",
    name: "STOCHASTIC_FLOW",
    rank: 8,
    portfolioValue: 102450.10,
    initialCapital: 100000,
    totalReturn: 2.45,
    dailyPnL: 140.20,
    dailyReturn: 0.14,
    sharpeRatio: 0.98,
    sortinoRatio: 1.12,
    maxDrawdown: 11.20,
    totalTrades: 640,
    winRate: 48.9,
    status: "IDLE",
    positions: [
      { symbol: "TLT", shares: 150, avgPrice: 94.20, currentPrice: 95.10, side: "LONG" },
    ]
  }
];

const INITIAL_TRADES: TradeExecution[] = [
  { id: "ORD-94821", timestamp: "16:28:42", symbol: "NVDA", side: "BUY", shares: 25, price: 124.52, slippage: 0.008, venue: "NASDAQ" },
  { id: "ORD-94820", timestamp: "16:28:15", symbol: "AAPL", side: "BUY", shares: 40, price: 228.38, slippage: 0.005, venue: "ARCA" },
  { id: "ORD-94819", timestamp: "16:27:54", symbol: "MSFT", side: "SELL", shares: 15, price: 436.22, slippage: 0.012, venue: "BATS" },
  { id: "ORD-94818", timestamp: "16:27:10", symbol: "TSLA", side: "BUY", shares: 30, price: 241.75, slippage: 0.015, venue: "NASDAQ" },
  { id: "ORD-94817", timestamp: "16:26:38", symbol: "SPY", side: "BUY", shares: 10, price: 558.08, slippage: 0.003, venue: "NYSE" },
];

export default function QTCQuantDemo() {
  const [teams, setTeams] = useState<TeamData[]>(INITIAL_TEAMS);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("alqavi_systems");
  const [trades, setTrades] = useState<TradeExecution[]>(INITIAL_TRADES);
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [flashKey, setFlashKey] = useState<Record<string, "up" | "down">>({});

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];

  // Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toTimeString().split(" ")[0] + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Real-time live simulation engine (ticking prices, PnL micro-fluctuations, streaming fills)
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      // 1. Pick a random team and fluctuate value slightly
      setTeams((prev) =>
        prev.map((team) => {
          const deltaPct = (Math.random() - 0.48) * 0.003; // Slight upward bias
          const newPortVal = Math.max(80000, team.portfolioValue * (1 + deltaPct));
          const newReturn = ((newPortVal - team.initialCapital) / team.initialCapital) * 100;
          const newDailyPnL = team.dailyPnL + (newPortVal - team.portfolioValue);
          
          // Flash effect
          const dir = deltaPct >= 0 ? "up" : "down";
          setFlashKey((f) => ({ ...f, [team.id]: dir }));

          // Randomize positions slightly for selected team
          const newPositions = team.positions.map((pos) => {
            const pDelta = (Math.random() - 0.48) * 0.004;
            const newPrice = Math.max(1, pos.currentPrice * (1 + pDelta));
            return { ...pos, currentPrice: Number(newPrice.toFixed(2)) };
          });

          return {
            ...team,
            portfolioValue: Number(newPortVal.toFixed(2)),
            totalReturn: Number(newReturn.toFixed(2)),
            dailyPnL: Number(newDailyPnL.toFixed(2)),
            positions: newPositions,
          };
        })
      );

      // Clear flash after 800ms
      setTimeout(() => {
        setFlashKey({});
      }, 800);

      // 2. Generate a simulated trade fill
      const symbols = ["NVDA", "AAPL", "MSFT", "TSLA", "SPY", "AMD", "META", "GOOGL"];
      const venues = ["NASDAQ", "ARCA", "BATS", "IEX", "NYSE"];
      const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      const randomSide = Math.random() > 0.45 ? "BUY" : "SELL";
      const randomShares = Math.floor(Math.random() * 40) + 10;
      const basePrice = randomSymbol === "NVDA" ? 124.5 : randomSymbol === "AAPL" ? 228.4 : randomSymbol === "MSFT" ? 436.2 : 241.8;
      const executedPrice = Number((basePrice + (Math.random() - 0.5) * 1.5).toFixed(2));
      const nowTime = new Date().toTimeString().split(" ")[0];

      const newTrade: TradeExecution = {
        id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        timestamp: nowTime,
        symbol: randomSymbol,
        side: randomSide,
        shares: randomShares,
        price: executedPrice,
        slippage: Number((Math.random() * 0.015).toFixed(4)),
        venue: venues[Math.floor(Math.random() * venues.length)],
      };

      setTrades((prev) => [newTrade, ...prev.slice(0, 14)]);
    }, 2800);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  // Synthetic equity curve points (30 historical data points)
  const equityPoints = React.useMemo(() => {
    const points = [];
    let val = selectedTeam.initialCapital;
    const target = selectedTeam.portfolioValue;
    const step = (target - val) / 30;
    const seed = selectedTeam.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    for (let i = 0; i <= 30; i++) {
      const noise = (Math.sin(i * 0.8 + seed) + Math.cos(i * 1.2 + seed)) * 1200;
      points.push(Math.round(val + noise));
      val += step;
    }
    points[points.length - 1] = selectedTeam.portfolioValue;
    return points;
  }, [selectedTeam.id, selectedTeam.portfolioValue, selectedTeam.initialCapital]);

  // Normalize SVG points for equity chart
  const minVal = Math.min(...equityPoints) * 0.98;
  const maxVal = Math.max(...equityPoints) * 1.02;
  const svgWidth = 600;
  const svgHeight = 160;

  const polylinePoints = equityPoints
    .map((p, idx) => {
      const x = (idx / (equityPoints.length - 1)) * svgWidth;
      const y = svgHeight - ((p - minVal) / (maxVal - minVal)) * (svgHeight - 20) - 10;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="min-h-screen w-full bg-[#000000] text-[#CCCCCC] font-mono text-xs select-none flex flex-col">
      {/* ============================================================ */}
      {/* 1. MDI TERMINAL TOP BAR                                       */}
      {/* ============================================================ */}
      <header className="border-b border-[#222222] bg-[#080808] px-3 py-2 flex flex-wrap items-center justify-between gap-2">
        {/* Left: Terminal Logo */}
        <div className="flex items-center gap-3">
          <div className="border border-[#00A0E8] p-1 bg-[#001828]">
            <Monitor className="size-4 text-[#00A0E8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#00A0E8] text-sm tracking-wider">QTC TERMINAL</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#00A0E8]/20 text-[#00A0E8] border border-[#00A0E8]/40">
                MDI v1.2
              </span>
            </div>
            <div className="text-[10px] text-[#808080]">
              QUANTITATIVE TRADING COMPETITION // EXECUTION ENVIRONMENT
            </div>
          </div>
        </div>

        {/* Center: Live Session Indicators */}
        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <Radio className={cn("size-3.5", isLiveStreaming ? "text-[#00C805] animate-pulse" : "text-[#808080]")} />
            <span className={isLiveStreaming ? "text-[#00C805]" : "text-[#808080]"}>
              {isLiveStreaming ? "LIVE SIMULATION ACTIVE" : "SIMULATION PAUSED"}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[#808080] border-l border-[#222222] pl-3">
            <Clock className="size-3 text-[#FFAA00]" />
            <span>{currentTime || "16:30:00 UTC"}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[#808080] border-l border-[#222222] pl-3">
            <span className="text-[#00C805]">NYSE: OPEN (SIM)</span>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#111111] hover:bg-[#1a1a1a] border border-[#333333] text-[11px] text-[#CCCCCC] transition-colors"
          >
            {isLiveStreaming ? <Pause className="size-3 text-[#FFAA00]" /> : <Play className="size-3 text-[#00C805]" />}
            <span>{isLiveStreaming ? "Pause Ticks" : "Resume Ticks"}</span>
          </button>
          
          <a
            href="https://github.com/alqavii/qtc"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#00A0E8]/15 hover:bg-[#00A0E8]/25 text-[#00A0E8] border border-[#00A0E8]/30 text-[11px] font-semibold transition-colors"
          >
            <ExternalLink className="size-3" />
            <span>GitHub</span>
          </a>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. ARCHIVED / DEMO DISCLAIMER BANNER                          */}
      {/* ============================================================ */}
      <div className="bg-[#001018] border-b border-[#00A0E8]/30 px-4 py-1.5 flex items-center justify-between text-[11px] text-[#80B0D0]">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-3.5 text-[#FFAA00] flex-shrink-0" />
          <span>
            <strong className="text-[#FFAA00] uppercase tracking-wider">Demo Simulation Mode:</strong> Competition execution cycle is concluded. This workstation operates client-side with real-time simulated order matching and fluctuating ticks for portfolio review.
          </span>
        </div>
        <span className="hidden md:inline font-mono text-[10px] text-[#808080]">
          ZERO-API SELF-CONTAINED
        </span>
      </div>

      {/* ============================================================ */}
      {/* 3. EXECUTIVE KPI ROW FOR SELECTED TEAM                        */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border-b border-[#222222] bg-[#050505]">
        <div className="p-3 border-r border-b sm:border-b-0 border-[#222222]">
          <div className="text-[10px] text-[#808080] uppercase">Selected Team</div>
          <div className="text-sm font-bold text-[#00A0E8] mt-0.5 truncate">{selectedTeam.name}</div>
          <div className="text-[10px] text-[#00C805]">RANK #{selectedTeam.rank} OF 8</div>
        </div>

        <div className={cn(
          "p-3 border-r border-b sm:border-b-0 border-[#222222] transition-colors",
          flashKey[selectedTeam.id] === "up" && "bg-[#00C805]/10",
          flashKey[selectedTeam.id] === "down" && "bg-[#FF0000]/10"
        )}>
          <div className="text-[10px] text-[#808080] uppercase">Portfolio Value</div>
          <div className="text-sm font-bold text-[#FFFFFF] mt-0.5 font-mono">
            ${selectedTeam.portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-[#00C805] flex items-center gap-0.5">
            <ArrowUpRight className="size-3" />
            <span>+${selectedTeam.dailyPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })} (24h)</span>
          </div>
        </div>

        <div className="p-3 border-r border-b sm:border-b-0 border-[#222222]">
          <div className="text-[10px] text-[#808080] uppercase">Cumulative Return</div>
          <div className="text-sm font-bold text-[#00C805] mt-0.5 font-mono">
            +{selectedTeam.totalReturn.toFixed(2)}%
          </div>
          <div className="text-[10px] text-[#808080]">BASE: $100,000.00</div>
        </div>

        <div className="p-3 border-r border-[#222222]">
          <div className="text-[10px] text-[#808080] uppercase">Sharpe / Sortino</div>
          <div className="text-sm font-bold text-[#FFAA00] mt-0.5 font-mono">
            {selectedTeam.sharpeRatio.toFixed(2)} <span className="text-[#808080] font-normal">/</span> {selectedTeam.sortinoRatio.toFixed(2)}
          </div>
          <div className="text-[10px] text-[#808080]">ANNUALIZED 252d</div>
        </div>

        <div className="p-3 border-r border-[#222222]">
          <div className="text-[10px] text-[#808080] uppercase">Max Drawdown</div>
          <div className="text-sm font-bold text-[#FF6B6B] mt-0.5 font-mono">
            -{selectedTeam.maxDrawdown.toFixed(2)}%
          </div>
          <div className="text-[10px] text-[#808080]">PEAK-TO-TROUGH</div>
        </div>

        <div className="p-3">
          <div className="text-[10px] text-[#808080] uppercase">Execution Health</div>
          <div className="text-sm font-bold text-[#00C805] mt-0.5 flex items-center gap-1.5">
            <ShieldCheck className="size-4" />
            <span>OPTIMAL</span>
          </div>
          <div className="text-[10px] text-[#808080]">{selectedTeam.totalTrades} FILLS • 12.4ms LAT</div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. MAIN 4-QUADRANT MDI GRID                                   */}
      {/* ============================================================ */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden bg-[#000000]">
        {/* ============================================================ */}
        {/* LEFT COLUMN (5 COLS): LEADERBOARD & ACTIVE POSITIONS         */}
        {/* ============================================================ */}
        <div className="lg:col-span-5 flex flex-col border-r border-[#222222] overflow-hidden">
          {/* TOP-LEFT: TEAM RANKINGS LEADERBOARD */}
          <div className="flex-1 flex flex-col border-b border-[#222222] overflow-hidden min-h-[260px]">
            <div className="px-3 py-1.5 bg-[#0a0a0a] border-b border-[#222222] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-3.5 bg-[#00A0E8]" />
                <Users className="size-3 text-[#00A0E8]" />
                <span className="font-bold text-[#00A0E8] uppercase tracking-wider text-[11px]">
                  TEAM LEADERBOARD
                </span>
              </div>
              <span className="text-[10px] text-[#808080]">8 TEAMS ACTIVE</span>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-[#050505] text-[#808080] sticky top-0 border-b border-[#222222]">
                  <tr>
                    <th className="py-1.5 px-3">#</th>
                    <th className="py-1.5 px-2">Team</th>
                    <th className="py-1.5 px-2 text-right">Portfolio</th>
                    <th className="py-1.5 px-2 text-right">Return</th>
                    <th className="py-1.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#151515]">
                  {teams.map((t) => {
                    const isSelected = t.id === selectedTeamId;
                    const flash = flashKey[t.id];
                    return (
                      <tr
                        key={t.id}
                        onClick={() => setSelectedTeamId(t.id)}
                        className={cn(
                          "cursor-pointer transition-colors",
                          isSelected ? "bg-[#00223a] text-[#FFFFFF]" : "hover:bg-[#0c0c0c] text-[#AAAAAA]",
                          flash === "up" && "bg-[#00C805]/15",
                          flash === "down" && "bg-[#FF0000]/15"
                        )}
                      >
                        <td className="py-2 px-3 font-bold text-[#808080]">{t.rank}</td>
                        <td className="py-2 px-2 font-semibold text-[#00A0E8] truncate max-w-[120px]">
                          {t.name}
                        </td>
                        <td className="py-2 px-2 text-right font-mono text-[#FFFFFF]">
                          ${t.portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className={cn(
                          "py-2 px-2 text-right font-mono font-semibold",
                          t.totalReturn >= 0 ? "text-[#00C805]" : "text-[#FF0000]"
                        )}>
                          {t.totalReturn >= 0 ? "+" : ""}{t.totalReturn.toFixed(2)}%
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase",
                            t.status === "ACTIVE" ? "bg-[#00C805]/20 text-[#00C805]" : "bg-[#808080]/20 text-[#808080]"
                          )}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* BOTTOM-LEFT: ACTIVE PORTFOLIO POSITIONS */}
          <div className="flex-1 flex flex-col overflow-hidden min-h-[240px]">
            <div className="px-3 py-1.5 bg-[#0a0a0a] border-b border-[#222222] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-3.5 bg-[#FFAA00]" />
                <Layers className="size-3 text-[#FFAA00]" />
                <span className="font-bold text-[#FFAA00] uppercase tracking-wider text-[11px]">
                  OPEN POSITIONS // {selectedTeam.name}
                </span>
              </div>
              <span className="text-[10px] text-[#808080]">
                {selectedTeam.positions.length} ACTIVE PAIRS
              </span>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-[#050505] text-[#808080] sticky top-0 border-b border-[#222222]">
                  <tr>
                    <th className="py-1.5 px-3">Asset</th>
                    <th className="py-1.5 px-2">Side</th>
                    <th className="py-1.5 px-2 text-right">Shares</th>
                    <th className="py-1.5 px-2 text-right">Avg Entry</th>
                    <th className="py-1.5 px-2 text-right">Mark</th>
                    <th className="py-1.5 px-3 text-right">Unrealized</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#151515]">
                  {selectedTeam.positions.map((pos) => {
                    const pnl = pos.side === "LONG" 
                      ? (pos.currentPrice - pos.avgPrice) * pos.shares
                      : (pos.avgPrice - pos.currentPrice) * Math.abs(pos.shares);
                    const pnlPct = ((pos.currentPrice - pos.avgPrice) / pos.avgPrice) * 100 * (pos.side === "SHORT" ? -1 : 1);

                    return (
                      <tr key={pos.symbol} className="hover:bg-[#0c0c0c] text-[#CCCCCC]">
                        <td className="py-1.5 px-3 font-bold text-[#00A0E8]">{pos.symbol}</td>
                        <td className="py-1.5 px-2">
                          <span className={cn(
                            "px-1 py-0.2 rounded text-[9px] font-bold",
                            pos.side === "LONG" ? "bg-[#00C805]/20 text-[#00C805]" : "bg-[#FF0000]/20 text-[#FF0000]"
                          )}>
                            {pos.side}
                          </span>
                        </td>
                        <td className="py-1.5 px-2 text-right font-mono">{pos.shares}</td>
                        <td className="py-1.5 px-2 text-right font-mono text-[#808080]">${pos.avgPrice.toFixed(2)}</td>
                        <td className="py-1.5 px-2 text-right font-mono text-[#FFFFFF]">${pos.currentPrice.toFixed(2)}</td>
                        <td className={cn(
                          "py-1.5 px-3 text-right font-mono font-semibold",
                          pnl >= 0 ? "text-[#00C805]" : "text-[#FF0000]"
                        )}>
                          {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)} ({pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%)
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN (7 COLS): EQUITY CURVE & LIVE STREAM             */}
        {/* ============================================================ */}
        <div className="lg:col-span-7 flex flex-col overflow-hidden">
          {/* TOP-RIGHT: EQUITY PERFORMANCE CURVE */}
          <div className="flex-1 flex flex-col border-b border-[#222222] overflow-hidden min-h-[260px]">
            <div className="px-3 py-1.5 bg-[#0a0a0a] border-b border-[#222222] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-3.5 bg-[#00C805]" />
                <TrendingUp className="size-3 text-[#00C805]" />
                <span className="font-bold text-[#00C805] uppercase tracking-wider text-[11px]">
                  CUMULATIVE PERFORMANCE // {selectedTeam.name}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {["1D", "7D", "30D", "ALL"].map((tf) => (
                  <button
                    key={tf}
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-semibold transition-colors",
                      tf === "30D" ? "bg-[#00A0E8] text-[#000000]" : "bg-[#151515] text-[#808080] hover:text-[#FFFFFF]"
                    )}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 p-3 flex flex-col justify-between bg-[#040404]">
              {/* Dynamic SVG Equity Chart */}
              <div className="relative w-full h-[160px] flex items-center justify-center">
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="equityGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#00A0E8" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#00A0E8" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid lines */}
                  <line x1="0" y1="40" x2={svgWidth} y2="40" stroke="#1c1c1c" strokeDasharray="3 3" />
                  <line x1="0" y1="80" x2={svgWidth} y2="80" stroke="#1c1c1c" strokeDasharray="3 3" />
                  <line x1="0" y1="120" x2={svgWidth} y2="120" stroke="#1c1c1c" strokeDasharray="3 3" />

                  {/* Area fill */}
                  <polygon
                    points={`0,${svgHeight} ${polylinePoints} ${svgWidth},${svgHeight}`}
                    fill="url(#equityGrad)"
                  />

                  {/* Main equity line */}
                  <polyline
                    points={polylinePoints}
                    fill="none"
                    stroke="#00A0E8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* End dot */}
                  <circle
                    cx={svgWidth}
                    cy={svgHeight - ((equityPoints[equityPoints.length - 1] - minVal) / (maxVal - minVal)) * (svgHeight - 20) - 10}
                    r="4"
                    fill="#00C805"
                    className="animate-pulse"
                  />
                </svg>
              </div>

              {/* Chart Footer Stats */}
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#1a1a1a] text-[10px] text-[#808080]">
                <div>
                  <span>STARTING: </span>
                  <span className="text-[#CCCCCC] font-mono">$100,000.00</span>
                </div>
                <div>
                  <span>MIN: </span>
                  <span className="text-[#CCCCCC] font-mono">${Math.round(minVal).toLocaleString()}</span>
                </div>
                <div>
                  <span>MAX: </span>
                  <span className="text-[#CCCCCC] font-mono">${Math.round(maxVal).toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-[#00C805] font-bold">ALPHA: +{selectedTeam.totalReturn.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM-RIGHT: LIVE TRADE EXECUTION STREAM */}
          <div className="flex-1 flex flex-col overflow-hidden min-h-[240px]">
            <div className="px-3 py-1.5 bg-[#0a0a0a] border-b border-[#222222] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-3.5 bg-[#00A0E8]" />
                <Activity className="size-3 text-[#00A0E8]" />
                <span className="font-bold text-[#00A0E8] uppercase tracking-wider text-[11px]">
                  LIVE EXECUTION STREAM // ORDER FILLS
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-[#808080]">
                <span className="inline-block w-2 h-2 rounded-full bg-[#00C805] animate-ping" />
                <span>DIRECT MARKET ACCESS</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-[#050505] text-[#808080] sticky top-0 border-b border-[#222222]">
                  <tr>
                    <th className="py-1.5 px-3">Time</th>
                    <th className="py-1.5 px-2">Order ID</th>
                    <th className="py-1.5 px-2">Symbol</th>
                    <th className="py-1.5 px-2">Side</th>
                    <th className="py-1.5 px-2 text-right">Qty</th>
                    <th className="py-1.5 px-2 text-right">Fill Price</th>
                    <th className="py-1.5 px-2 text-right">Slippage</th>
                    <th className="py-1.5 px-3 text-right">Venue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#151515]">
                  {trades.map((tr) => (
                    <tr key={tr.id} className="hover:bg-[#0c0c0c] transition-colors">
                      <td className="py-1.5 px-3 font-mono text-[#808080]">{tr.timestamp}</td>
                      <td className="py-1.5 px-2 font-mono text-[#666666]">{tr.id}</td>
                      <td className="py-1.5 px-2 font-bold text-[#FFFFFF]">{tr.symbol}</td>
                      <td className="py-1.5 px-2">
                        <span className={cn(
                          "px-1 py-0.2 rounded text-[9px] font-bold",
                          tr.side === "BUY" ? "bg-[#00C805]/20 text-[#00C805]" : "bg-[#FF0000]/20 text-[#FF0000]"
                        )}>
                          {tr.side}
                        </span>
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono text-[#CCCCCC]">{tr.shares}</td>
                      <td className="py-1.5 px-2 text-right font-mono font-semibold text-[#FFFFFF]">
                        ${tr.price.toFixed(2)}
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono text-[#808080]">
                        {(tr.slippage * 100).toFixed(3)}%
                      </td>
                      <td className="py-1.5 px-3 text-right text-[10px] text-[#00A0E8] font-mono">
                        {tr.venue}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. BOTTOM STATUS STRIP                                        */}
      {/* ============================================================ */}
      <footer className="h-6 bg-[#080808] border-t border-[#222222] px-3 flex items-center justify-between text-[10px] text-[#808080]">
        <div className="flex items-center gap-3">
          <span>ALQAVI QUANTITATIVE EXECUTION DESK</span>
          <span>•</span>
          <span className="text-[#00C805]">WEBSOCKET: CONNECTED</span>
          <span>•</span>
          <span>ALPACA-PY GATEWAY: OK</span>
        </div>
        <div className="flex items-center gap-2">
          <span>TICK RATE: 350ms</span>
          <span>•</span>
          <span className="text-[#00A0E8]">PORTFOLIO SHOWCASE DEMO</span>
        </div>
      </footer>
    </div>
  );
}
