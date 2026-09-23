"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Script from "next/script";
import { Source_Sans_3 } from "next/font/google";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

const sourceSans = Source_Sans_3({ subsets: ["latin"], weight: ["400", "600", "700"] });

// Streamlit default dark theme
const ST = {
  bg: "#0e1117",
  sidebar: "#262730",
  text: "#fafafa",
  muted: "rgba(250, 250, 250, 0.6)",
  primary: "#ff4b4b",
  border: "rgba(250, 250, 250, 0.2)",
  grid: "rgba(250, 250, 250, 0.1)",
  series: ["#83c9ff", "#0068c9", "#ffabab", "#ff2b2b", "#7defa1", "#29b09d"],
};

interface Params {
  sigma0: number;
  rho: number;
  eta: number;
  gamma: number;
  termSlope: number;
}

const PRESETS: Record<string, Params> = {
  SPY: { sigma0: 15.5, rho: -0.72, eta: 0.54, gamma: 0.38, termSlope: 0.04 },
  QQQ: { sigma0: 19.8, rho: -0.68, eta: 0.58, gamma: 0.36, termSlope: 0.035 },
  NVDA: { sigma0: 46.2, rho: -0.38, eta: 0.85, gamma: 0.28, termSlope: -0.02 },
  AAPL: { sigma0: 22.4, rho: -0.55, eta: 0.62, gamma: 0.42, termSlope: 0.025 },
  TSLA: { sigma0: 54.0, rho: -0.32, eta: 0.92, gamma: 0.25, termSlope: -0.015 },
};

const SMILE_EXPIRIES = [
  { t: 30 / 365, label: "30d" },
  { t: 90 / 365, label: "90d" },
  { t: 180 / 365, label: "180d" },
  { t: 1, label: "1y" },
];

declare global {
  interface Window {
    Plotly?: any;
  }
}

// SSVI total variance: w(k, θ) = θ/2 · [1 + ρφk + √((φk + ρ)² + 1 − ρ²)], φ(θ) = η / θ^γ
function impliedVol(k: number, t: number, p: Params) {
  const atmVol = p.sigma0 / 100 + p.termSlope * Math.log(1 + t);
  const theta = Math.max(1e-6, atmVol * atmVol * t);
  const phi = p.eta / Math.pow(theta, p.gamma);
  const disc = Math.pow(phi * k + p.rho, 2) + (1 - p.rho * p.rho);
  const w = (theta / 2) * (1 + p.rho * phi * k + Math.sqrt(Math.max(1e-8, disc)));
  return Math.sqrt(Math.max(1e-8, w / t));
}

const axis = (title: string) => ({
  title: { text: title, font: { color: ST.muted, size: 12 } },
  tickfont: { color: ST.muted, size: 12 },
  gridcolor: ST.grid,
  zerolinecolor: ST.grid,
  backgroundcolor: "rgba(0,0,0,0)",
});

function Slider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="mb-4">
      <label className="block text-sm mb-1" style={{ color: ST.text }}>
        {label}
      </label>
      <div className="relative pt-5">
        <div
          className="absolute top-0 text-sm tabular-nums -translate-x-1/2 whitespace-nowrap"
          style={{ left: `calc(${pct}% + ${6 - pct * 0.12}px)`, color: ST.primary }}
        >
          {format(value)}
        </div>
        <input
          type="range"
          className="st-slider w-full"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{
            background: `linear-gradient(to right, ${ST.primary} ${pct}%, ${ST.border} ${pct}%)`,
          }}
        />
        <div className="flex justify-between text-sm tabular-nums mt-0.5" style={{ color: ST.muted }}>
          <span>{format(min)}</span>
          <span>{format(max)}</span>
        </div>
      </div>
    </div>
  );
}

export default function SSVISurfaceDemo() {
  const [ticker, setTicker] = useState("SPY");
  const [params, setParams] = useState<Params>(PRESETS.SPY);
  const [tab, setTab] = useState<"surface" | "smile">("surface");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [plotlyReady, setPlotlyReady] = useState(false);

  const surfaceRef = useRef<HTMLDivElement>(null);
  const smileRef = useRef<HTMLDivElement>(null);

  const set = useCallback(
    (key: keyof Params) => (v: number) => setParams((p) => ({ ...p, [key]: v })),
    []
  );

  useEffect(() => {
    if (window.Plotly) setPlotlyReady(true);
    if (window.innerWidth < 640) setSidebarOpen(false);
  }, []);

  const grid = useMemo(() => {
    const moneyness = Array.from({ length: 35 }, (_, i) => 0.7 + (i / 34) * 0.6);
    const tenors = Array.from({ length: 25 }, (_, j) => 0.05 + (j / 24) * 1.95);
    const z = tenors.map((t) => moneyness.map((m) => impliedVol(Math.log(m), t, params) * 100));
    return { moneyness, tenors, z };
  }, [params]);

  const baseLayout = {
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: { family: sourceSans.style.fontFamily, color: ST.text, size: 12 },
    autosize: true,
  };

  useEffect(() => {
    if (!plotlyReady || tab !== "surface" || !surfaceRef.current) return;
    window.Plotly.react(
      surfaceRef.current,
      [
        {
          type: "surface",
          x: grid.moneyness,
          y: grid.tenors,
          z: grid.z,
          colorscale: "Viridis",
          colorbar: { title: { text: "IV (%)", side: "right" }, len: 0.7, tickfont: { color: ST.muted } },
          hovertemplate: "K/F %{x:.2f}<br>T %{y:.2f}y<br>IV %{z:.1f}%<extra></extra>",
        },
      ],
      {
        ...baseLayout,
        margin: { l: 0, r: 0, b: 0, t: 0 },
        scene: {
          xaxis: axis("K/F"),
          yaxis: axis("T (years)"),
          zaxis: axis("IV (%)"),
          camera: { eye: { x: 1.6, y: -1.6, z: 1.1 } },
        },
      },
      { responsive: true, displaylogo: false }
    );
  }, [plotlyReady, tab, grid]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!plotlyReady || tab !== "smile" || !smileRef.current) return;
    const m = Array.from({ length: 50 }, (_, i) => 0.75 + (i / 49) * 0.5);
    window.Plotly.react(
      smileRef.current,
      SMILE_EXPIRIES.map(({ t, label }, i) => ({
        x: m,
        y: m.map((x) => impliedVol(Math.log(x), t, params) * 100),
        mode: "lines",
        name: label,
        line: { color: ST.series[i], width: 2 },
      })),
      {
        ...baseLayout,
        margin: { l: 50, r: 10, b: 45, t: 10 },
        xaxis: axis("K/F"),
        yaxis: axis("IV (%)"),
        legend: { orientation: "h", y: 1.08, font: { color: ST.text } },
      },
      { responsive: true, displaylogo: false }
    );
  }, [plotlyReady, tab, params]); // eslint-disable-line react-hooks/exhaustive-deps

  const leeBound = params.eta * (1 + Math.abs(params.rho));

  return (
    <div
      className={`${sourceSans.className} min-h-screen w-full flex`}
      style={{ background: ST.bg, color: ST.text }}
    >
      <Script
        src="https://cdn.plot.ly/plotly-2.35.2.min.js"
        strategy="afterInteractive"
        onLoad={() => setPlotlyReady(true)}
      />
      <style>{`
        .st-slider { -webkit-appearance: none; appearance: none; height: 4px; border-radius: 4px; outline: none; }
        .st-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; background: ${ST.primary}; cursor: pointer; }
        .st-slider::-moz-range-thumb { width: 12px; height: 12px; border: 0; border-radius: 50%; background: ${ST.primary}; cursor: pointer; }
        .st-slider:focus-visible::-webkit-slider-thumb { box-shadow: 0 0 0 3px rgba(255, 75, 75, 0.5); }
      `}</style>

      {/* Streamlit's top decoration line */}
      <div
        className="fixed top-0 inset-x-0 h-0.5 z-50"
        style={{ backgroundImage: "linear-gradient(90deg, #ff4b4b, #fffd80)" }}
      />

      {sidebarOpen && (
        <aside
          className="w-[300px] flex-shrink-0 min-h-screen px-6 pt-12 pb-8 relative max-sm:fixed max-sm:inset-y-0 max-sm:left-0 max-sm:z-40 max-sm:overflow-y-auto"
          style={{ background: ST.sidebar }}
        >
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-3 right-3 p-1 rounded hover:bg-white/10"
            style={{ color: ST.muted }}
            title="Collapse sidebar"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="mb-4">
            <label className="block text-sm mb-1">Ticker</label>
            <div className="relative">
              <select
                value={ticker}
                onChange={(e) => {
                  setTicker(e.target.value);
                  setParams(PRESETS[e.target.value]);
                }}
                className="w-full appearance-none rounded-lg px-3 py-2 pr-9 text-base outline-none border border-transparent focus:border-[#ff4b4b] cursor-pointer"
                style={{ background: ST.bg, color: ST.text }}
              >
                {Object.keys(PRESETS).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: ST.muted }}
              />
            </div>
          </div>

          <Slider label="ATM vol σ₀ (%)" value={params.sigma0} min={10} max={65} step={0.5} format={(v) => v.toFixed(1)} onChange={set("sigma0")} />
          <Slider label="Skew ρ" value={params.rho} min={-0.95} max={-0.05} step={0.01} format={(v) => v.toFixed(2)} onChange={set("rho")} />
          <Slider label="Curvature η" value={params.eta} min={0.1} max={1.5} step={0.02} format={(v) => v.toFixed(2)} onChange={set("eta")} />
          <Slider label="Decay γ" value={params.gamma} min={0.15} max={0.65} step={0.01} format={(v) => v.toFixed(2)} onChange={set("gamma")} />
          <Slider label="Term slope" value={params.termSlope} min={-0.04} max={0.08} step={0.005} format={(v) => v.toFixed(3)} onChange={set("termSlope")} />

          <button
            onClick={() => setParams(PRESETS[ticker])}
            className="mt-1 px-3 py-1.5 rounded-lg text-base border hover:border-[#ff4b4b] hover:text-[#ff4b4b] transition-colors"
            style={{ borderColor: ST.border, background: ST.bg }}
          >
            Reset
          </button>
        </aside>
      )}

      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-3 left-3 p-1 rounded hover:bg-white/10 z-40"
          style={{ color: ST.muted }}
          title="Expand sidebar"
        >
          <ChevronRight size={18} />
        </button>
      )}

      <main className="flex-1 min-w-0 px-6 sm:px-12 lg:px-20 pt-14 pb-10">
        <h1 className="text-[2.75rem] leading-tight font-bold mb-4">SSVI Volatility Surface</h1>

        {leeBound > 2 && (
          <div
            className="rounded-lg px-4 py-3 mb-4 text-base"
            style={{ background: "rgba(255, 227, 18, 0.1)", color: "#ffffc2" }}
          >
            η(1 + |ρ|) = {leeBound.toFixed(2)} exceeds 2, so this surface admits arbitrage in the wings.
          </div>
        )}

        <div className="flex gap-6 border-b mb-4" style={{ borderColor: ST.border }}>
          {(["surface", "smile"] as const).map((id) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="pb-2 -mb-px text-sm border-b-2 capitalize"
              style={{
                color: tab === id ? ST.primary : ST.text,
                borderColor: tab === id ? ST.primary : "transparent",
              }}
            >
              {id}
            </button>
          ))}
        </div>

        <div className="relative">
          <div ref={surfaceRef} className={tab === "surface" ? "w-full h-[560px]" : "hidden"} />
          <div ref={smileRef} className={tab === "smile" ? "w-full h-[450px]" : "hidden"} />
          {!plotlyReady && (
            <div className="absolute inset-0 flex items-center justify-center text-sm" style={{ color: ST.muted }}>
              Running...
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
