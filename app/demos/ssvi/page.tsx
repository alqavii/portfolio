"use client";

import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Source_Sans_3 } from "next/font/google";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import {
  generateIVSmile,
  interpolateZeroRate,
  runSSVI,
  type AnalysisResult,
  type OptionRow,
} from "@/lib/ssvi/engine";

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
};

const ALERT = {
  info: { bg: "rgba(61, 157, 243, 0.2)", fg: "rgb(199, 235, 255)" },
  success: { bg: "rgba(61, 213, 109, 0.2)", fg: "rgb(223, 253, 233)" },
  error: { bg: "rgba(255, 108, 108, 0.2)", fg: "rgb(255, 222, 222)" },
};

declare global {
  interface Window {
    Plotly?: any;
  }
}

// ---------------------------------------------------------------------------
// Streamlit widgets
// ---------------------------------------------------------------------------

function Alert({ kind, children }: { kind: keyof typeof ALERT; children: React.ReactNode }) {
  return (
    <div className="rounded-lg px-4 py-3 mb-4 text-base" style={{ background: ALERT[kind].bg, color: ALERT[kind].fg }}>
      {children}
    </div>
  );
}

function Spinner({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 mb-4 text-base">
      <span
        className="inline-block w-5 h-5 rounded-full border-[3px] animate-spin"
        style={{ borderColor: "rgba(250,250,250,0.2)", borderTopColor: ST.text }}
      />
      <span>{text}</span>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-sm mb-1 truncate">{label}</div>
      <div className="text-[2.25rem] leading-tight tabular-nums truncate">{value}</div>
    </div>
  );
}

function Columns({ n, children }: { n: number; children: React.ReactNode }) {
  const cls = n === 2 ? "sm:grid-cols-2" : n === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4";
  return <div className={`grid grid-cols-1 ${cls} gap-4 mb-4`}>{children}</div>;
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[2.25rem] leading-tight font-semibold pt-5 pb-3">{children}</h2>;
}

function Slider({
  label, value, min, max, onChange,
}: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="mb-4">
      <label className="block text-sm mb-1">{label}</label>
      <div className="relative pt-5">
        <div
          className="absolute top-0 text-sm tabular-nums -translate-x-1/2 whitespace-nowrap"
          style={{ left: `calc(${pct}% + ${6 - pct * 0.12}px)`, color: ST.primary }}
        >
          {value}
        </div>
        <input
          type="range"
          className="st-slider w-full"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          style={{ background: `linear-gradient(to right, ${ST.primary} ${pct}%, ${ST.border} ${pct}%)` }}
        />
        <div className="flex justify-between text-sm tabular-nums mt-0.5" style={{ color: ST.muted }}>
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
}

function NumberInput({
  label, value, step, onChange,
}: { label: string; value: number; step: number; onChange: (v: number) => void }) {
  const [text, setText] = useState(value.toFixed(2));
  useEffect(() => setText(value.toFixed(2)), [value]);
  const commit = () => {
    const v = parseFloat(text);
    if (Number.isFinite(v)) onChange(Math.round(v * 100) / 100);
    else setText(value.toFixed(2));
  };
  const bump = (d: number) => onChange(Math.round((value + d) * 100) / 100);
  return (
    <div className="min-w-0">
      <label className="block text-sm mb-1">{label}</label>
      <div
        className="flex rounded-lg overflow-hidden border border-transparent focus-within:border-[#ff4b4b]"
        style={{ background: ST.bg }}
      >
        <input
          inputMode="decimal"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && commit()}
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base outline-none tabular-nums"
        />
        <button onClick={() => bump(-step)} className="px-2 hover:bg-[#ff4b4b] transition-colors" aria-label="Decrease">
          <Minus size={14} />
        </button>
        <button onClick={() => bump(step)} className="px-2 hover:bg-[#ff4b4b] transition-colors" aria-label="Increase">
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

type Cell = string | number;

function DataFrame({ columns, index, rows }: { columns: string[]; index: number[]; rows: Cell[][] }) {
  const fmt = (v: Cell) => (typeof v === "number" ? (Number.isInteger(v) ? String(v) : v.toFixed(4)) : v);
  return (
    <div className="overflow-auto rounded-lg border h-[400px] text-sm" style={{ borderColor: ST.grid }}>
      <table className="w-full border-collapse tabular-nums">
        <thead className="sticky top-0" style={{ background: ST.bg }}>
          <tr>
            <th className="px-2 py-1.5 border-b border-r" style={{ borderColor: ST.grid }} />
            {columns.map((c) => (
              <th
                key={c}
                className="px-2 py-1.5 text-left font-normal border-b border-r whitespace-nowrap"
                style={{ borderColor: ST.grid, color: ST.muted }}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={index[i]} className="hover:bg-white/[0.03]">
              <td className="px-2 py-1 border-b border-r text-right" style={{ borderColor: ST.grid, color: ST.muted }}>
                {index[i]}
              </td>
              {r.map((v, j) => (
                <td
                  key={j}
                  className={`px-2 py-1 border-b border-r whitespace-nowrap ${typeof v === "number" ? "text-right" : ""}`}
                  style={{ borderColor: ST.grid }}
                >
                  {fmt(v)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Charts
// ---------------------------------------------------------------------------

/** st.pyplot rendering of the matplotlib scatter: white figure, viridis by T, red dashed zero line. */
function MplScatter({
  plotlyReady, x, y, c, xlabel, ylabel, title,
}: {
  plotlyReady: boolean; x: number[]; y: number[]; c: number[]; xlabel: string; ylabel: string; title: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!plotlyReady || !ref.current) return;
    const mplAxis = (label: string) => ({
      title: { text: label, font: { size: 13, color: "#000" } },
      showline: true,
      mirror: true,
      linecolor: "#000",
      linewidth: 1,
      ticks: "outside",
      tickcolor: "#000",
      tickfont: { color: "#000", size: 11 },
      gridcolor: "rgba(0,0,0,0.12)",
      zeroline: false,
    });
    window.Plotly.react(
      ref.current,
      [
        {
          type: "scatter",
          mode: "markers",
          x,
          y,
          marker: {
            color: c,
            colorscale: "Viridis",
            size: 9,
            opacity: 0.6,
            line: { width: 0 },
            colorbar: {
              title: { text: "Time to Expiry (T)", side: "right", font: { color: "#000", size: 13 } },
              tickfont: { color: "#000", size: 11 },
              outlinecolor: "#000",
              outlinewidth: 1,
              thickness: 18,
            },
          },
          hovertemplate: "k %{x:.4f}<br>%{y:.4f}<extra></extra>",
        },
      ],
      {
        paper_bgcolor: "#fff",
        plot_bgcolor: "#fff",
        font: { family: "DejaVu Sans, Verdana, sans-serif", color: "#000" },
        title: { text: title, font: { size: 15, color: "#000" }, y: 0.96 },
        margin: { l: 70, r: 20, t: 50, b: 55 },
        xaxis: mplAxis(xlabel),
        yaxis: mplAxis(ylabel),
        shapes: [
          { type: "line", xref: "paper", x0: 0, x1: 1, y0: 0, y1: 0, line: { color: "red", width: 2, dash: "dash" } },
        ],
        showlegend: false,
        autosize: true,
      },
      { responsive: true, displayModeBar: false }
    );
  }, [plotlyReady, x, y, c, xlabel, ylabel, title]);
  return <div ref={ref} className="w-full aspect-[10/6]" />;
}

function SurfaceComparison({ plotlyReady, grid }: { plotlyReady: boolean; grid: AnalysisResult["grid"] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!plotlyReady || !ref.current) return;
    const axis = (title: string) => ({
      title: { text: title, font: { size: 12, color: ST.text } },
      tickfont: { color: ST.muted, size: 11 },
      gridcolor: ST.grid,
      zerolinecolor: ST.grid,
      backgroundcolor: "rgba(0,0,0,0)",
    });
    const scene = (x0: number, x1: number) => ({
      domain: { x: [x0, x1], y: [0, 1] },
      xaxis: axis("Moneyness (K/F)"),
      yaxis: axis("Time to Expiry (Years)"),
      zaxis: axis("Implied Volatility"),
      camera: { eye: { x: 1.9, y: 1.9, z: 1.2 } },
    });
    window.Plotly.react(
      ref.current,
      [
        {
          type: "surface", x: grid.M, y: grid.T, z: grid.ivMarket, colorscale: "Viridis",
          name: "Market IV", showscale: false, scene: "scene",
        },
        {
          type: "surface", x: grid.M, y: grid.T, z: grid.ivModel, colorscale: "Viridis",
          name: "Model IV", showscale: true, scene: "scene2",
          colorbar: { x: 1.02, len: 0.8, tickfont: { color: ST.muted } },
        },
      ],
      {
        title: { text: "Implied Volatility Surface: Market vs SSVI Model", font: { size: 16, color: ST.text }, x: 0.02 },
        height: 700,
        showlegend: false,
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        font: { family: sourceSans.style.fontFamily, color: ST.text },
        margin: { l: 0, r: 0, t: 80, b: 0 },
        scene: scene(0, 0.45),
        scene2: scene(0.55, 1),
        annotations: [
          { text: "Market IV Surface", x: 0.225, y: 1, xref: "paper", yref: "paper", showarrow: false, yanchor: "bottom", font: { size: 16 } },
          { text: "Model IV Surface", x: 0.775, y: 1, xref: "paper", yref: "paper", showarrow: false, yanchor: "bottom", font: { size: 16 } },
        ],
        autosize: true,
      },
      { responsive: true, displaylogo: false }
    );
  }, [plotlyReady, grid]);
  return <div ref={ref} className="w-full h-[700px]" />;
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

interface Chain {
  spot: number;
  dividendYield: number;
  source: string;
  rows: OptionRow[];
}

interface RunState {
  step: "rates" | "chain" | "iv" | "ssvi" | "done";
  chain?: Chain;
  ivPoints?: number;
  result?: AnalysisResult;
  error?: string;
}

const isoDate = (d: Date) => d.toISOString().slice(0, 10);

// dateutil.relativedelta(months=n): calendar months, clamped to the end of the month
function addMonths(d: Date, n: number) {
  const y = d.getUTCFullYear(), m = d.getUTCMonth() + n;
  const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return new Date(Date.UTC(y, m, Math.min(d.getUTCDate(), last)));
}

async function getJson(url: string) {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
  return json;
}

const nextFrame = () => new Promise((r) => setTimeout(r, 30));

export default function SSVIStreamlitDemo() {
  const [ticker, setTicker] = useState("NVDA");
  const [minWeeks, setMinWeeks] = useState(4);
  const [maxMonths, setMaxMonths] = useState(12);
  const [mMin, setMMin] = useState(0.8);
  const [mMax, setMMax] = useState(1.2);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [plotlyReady, setPlotlyReady] = useState(false);
  const [run, setRun] = useState<RunState | null>(null);
  const [tab, setTab] = useState(0);
  const runId = useRef(0);

  useEffect(() => {
    if (window.Plotly) setPlotlyReady(true);
    if (window.innerWidth < 640) setSidebarOpen(false);
  }, []);

  const running = run !== null && run.step !== "done" && !run.error;

  async function runAnalysis() {
    const id = ++runId.current;
    const live = () => id === runId.current;
    let state: RunState = { step: "rates" };
    const update = (patch: Partial<RunState>) => {
      state = { ...state, ...patch };
      if (live()) setRun(state);
    };
    update({});
    setTab(0);
    if (window.innerWidth < 640) setSidebarOpen(false);

    try {
      const { zeroCurve } = await getJson("/api/ssvi/rates");
      if (!live()) return;
      update({ step: "chain" });

      const today = new Date();
      const params = new URLSearchParams({
        ticker: ticker.trim().toUpperCase(),
        expiryStart: isoDate(new Date(today.getTime() + minWeeks * 7 * 86400000)),
        expiryEnd: isoDate(addMonths(today, maxMonths)),
        moneynessMin: String(mMin),
        moneynessMax: String(mMax),
      });
      const chain: Chain = await getJson(`/api/ssvi/chain?${params}`);
      if (!live()) return;
      update({ step: "iv", chain });
      await nextFrame();

      const rateArray = chain.rows.map((r) => interpolateZeroRate(r.timeToExpiry, zeroCurve));
      const surfaceData = generateIVSmile(chain.rows, rateArray, chain.dividendYield / 100, chain.spot, "call");
      if (surfaceData.length === 0) throw new Error("No contracts produced a valid implied volatility.");
      update({ step: "ssvi", ivPoints: surfaceData.length });
      await nextFrame();

      const result = runSSVI(surfaceData, chain.spot, chain.dividendYield);
      update({ step: "done", result });
    } catch (e) {
      update({ error: e instanceof Error ? e.message : String(e) });
    }
  }

  const stepIdx = run ? ["rates", "chain", "iv", "ssvi", "done"].indexOf(run.step) : -1;
  const past = (i: number) => stepIdx > i;
  const r = run?.result;
  const chain = run?.chain;

  return (
    <div className={`${sourceSans.className} min-h-screen w-full flex`} style={{ background: ST.bg, color: ST.text }}>
      <Script src="https://cdn.plot.ly/plotly-2.35.2.min.js" strategy="afterInteractive" onLoad={() => setPlotlyReady(true)} />
      <style>{`
        .st-slider { -webkit-appearance: none; appearance: none; height: 4px; border-radius: 4px; outline: none; }
        .st-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; background: ${ST.primary}; cursor: pointer; }
        .st-slider::-moz-range-thumb { width: 12px; height: 12px; border: 0; border-radius: 50%; background: ${ST.primary}; cursor: pointer; }
        .st-slider:focus-visible::-webkit-slider-thumb { box-shadow: 0 0 0 3px rgba(255, 75, 75, 0.5); }
      `}</style>

      {/* Streamlit's top decoration line + status widget */}
      <div className="fixed top-0 inset-x-0 h-0.5 z-50" style={{ backgroundImage: "linear-gradient(90deg, #ff4b4b, #fffd80)" }} />
      {running && (
        <div className="fixed top-3 right-4 z-50 flex items-center gap-2 text-sm" style={{ color: ST.muted }}>
          <span
            className="inline-block w-3.5 h-3.5 rounded-full border-2 animate-spin"
            style={{ borderColor: "rgba(250,250,250,0.2)", borderTopColor: ST.text }}
          />
          Running...
        </div>
      )}

      {sidebarOpen && (
        <aside
          className="w-[336px] flex-shrink-0 min-h-screen px-6 pt-12 pb-8 relative max-sm:fixed max-sm:inset-y-0 max-sm:left-0 max-sm:z-40 max-sm:w-[85vw] max-sm:overflow-y-auto"
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

          <h2 className="text-[1.5rem] font-semibold mb-4">Configuration</h2>

          <div className="mb-4">
            <label className="block text-sm mb-1">Ticker Symbol</label>
            <input
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !running && runAnalysis()}
              className="w-full rounded-lg px-3 py-2 text-base outline-none border border-transparent focus:border-[#ff4b4b]"
              style={{ background: ST.bg, color: ST.text }}
            />
          </div>

          <Slider label="Min Expiry (weeks)" value={minWeeks} min={0} max={52} onChange={setMinWeeks} />
          <Slider label="Max Expiry (months)" value={maxMonths} min={1} max={60} onChange={setMaxMonths} />

          <div className="grid grid-cols-2 gap-4 mb-4">
            <NumberInput label="Moneyness Min" value={mMin} step={0.1} onChange={setMMin} />
            <NumberInput label="Moneyness Max" value={mMax} step={0.1} onChange={setMMax} />
          </div>

          <button
            onClick={runAnalysis}
            disabled={running}
            className="px-3 py-1.5 rounded-lg text-base text-white border transition-colors disabled:opacity-60"
            style={{ background: ST.primary, borderColor: ST.primary }}
          >
            Run Analysis
          </button>

          <p className="mt-6 text-sm" style={{ color: ST.muted }}>
            Live quotes: {chain?.source ?? "Yahoo Finance"} · Treasury yields: FRED
          </p>
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

      <main className="flex-1 min-w-0 px-4 sm:px-12 lg:px-20 pt-14 pb-16">
        <h1 className="text-[2.75rem] leading-tight font-bold mb-4">Options Implied Volatility Analysis</h1>
        <p className="text-base mb-4">This app analyzes options implied volatility and fits the SSVI model.</p>

        {!run && <Alert kind="info">&lt;-- Configure the parameters in the sidebar and click &apos;Run Analysis&apos; to begin.</Alert>}

        {run && (
          <>
            <Alert kind="info">Running analysis... This may take a moment.</Alert>

            {run.step === "rates" && !run.error && <Spinner text="Fetching treasury bond yields and building zero curve..." />}
            {past(0) && <Alert kind="success">✓ Fetched zero rates</Alert>}

            {run.step === "chain" && !run.error && <Spinner text="Fetching options data..." />}
            {past(1) && chain && <Alert kind="success">Fetched {chain.rows.length} contracts</Alert>}

            {run.step === "iv" && !run.error && <Spinner text="Calculating implied volatility..." />}
            {past(2) && chain && (
              <>
                <Alert kind="success">✓ Calculated IV for {run.ivPoints} data points</Alert>
                <Columns n={3}>
                  <Metric label="Spot Price" value={`$${chain.spot.toFixed(2)}`} />
                  <Metric label="Dividend Yield" value={`${chain.dividendYield.toFixed(2)}%`} />
                  <Metric label="Data Points" value={String(run.ivPoints)} />
                </Columns>
              </>
            )}

            {run.step === "ssvi" && !run.error && <Spinner text="Calibrating SSVI model..." />}

            {r && chain && (
              <>
                <Alert kind="success">✓ SSVI calibration complete</Alert>
                <Columns n={2}>
                  <Metric label="Optimized Rho" value={r.rhoOpt.toFixed(6)} />
                  <Metric label="SSVI Loss" value={r.ssviLoss.toFixed(6)} />
                </Columns>

                <H2>Data Summary</H2>
                <div className="flex gap-6 border-b mb-4 overflow-x-auto overflow-y-hidden" style={{ borderColor: ST.border }}>
                  {["Options Data", "Surface Data", "SSVI Results"].map((label, i) => (
                    <button
                      key={label}
                      onClick={() => setTab(i)}
                      className="pb-2 -mb-px text-sm border-b-2 whitespace-nowrap"
                      style={{ color: tab === i ? ST.primary : ST.text, borderColor: tab === i ? ST.primary : "transparent" }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {tab === 0 && (
                  <DataFrame
                    columns={["optionType", "strike", "timeToExpiry", "midPrice", "expiry"]}
                    index={chain.rows.map((_, i) => i)}
                    rows={chain.rows.map((o) => [o.optionType, o.strike, o.timeToExpiry, o.midPrice, o.expiry])}
                  />
                )}
                {tab === 1 && (
                  <DataFrame
                    columns={["expiry", "K", "k", "w", "theta"]}
                    index={r.surface.map((s) => s.index)}
                    rows={r.surface.map((s) => [s.expiry, s.K, s.k, s.w, s.theta])}
                  />
                )}
                {tab === 2 && (
                  <DataFrame
                    columns={["expiry", "K", "iv", "iv_ssvi", "iv_error"]}
                    index={r.surface.map((s) => s.index)}
                    rows={r.surface.map((s) => [s.expiry, s.K, s.iv, s.iv_ssvi, s.iv_error])}
                  />
                )}

                <H2>Visualizations</H2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="min-w-0">
                    <h3 className="text-[1.75rem] font-semibold pb-3">SSVI Residuals</h3>
                    <MplScatter
                      plotlyReady={plotlyReady}
                      x={r.surface.map((s) => s.k)}
                      y={r.surface.map((s) => s.residuals)}
                      c={r.surface.map((s) => s.T)}
                      xlabel="Log-Moneyness (k)"
                      ylabel="Residuals"
                      title="SSVI Model Residuals vs Log-Moneyness"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[1.75rem] font-semibold pb-3">IV Error (%)</h3>
                    <MplScatter
                      plotlyReady={plotlyReady}
                      x={r.surface.map((s) => s.k)}
                      y={r.surface.map((s) => s.iv_error)}
                      c={r.surface.map((s) => s.T)}
                      xlabel="Log-Moneyness (k)"
                      ylabel="Implied Volatility Error (%)"
                      title="IV Error vs Log-Moneyness"
                    />
                  </div>
                </div>

                <H2>Performance Metrics</H2>
                <Columns n={4}>
                  <Metric label="IV RMSE" value={`${(r.metrics.rmse * 100).toFixed(4)}%`} />
                  <Metric label="Vega Weighted RMSE" value={`${(r.metrics.vegaWeightedRmse * 100).toFixed(4)}%`} />
                  <Metric label="Mean IV Error" value={`${r.metrics.meanIvError.toFixed(4)}%`} />
                  <Metric label="Max IV Error" value={`${r.metrics.maxIvError.toFixed(4)}%`} />
                </Columns>

                <Alert kind="success">✓ Analysis complete!</Alert>

                <H2>IV Surface Comparison</H2>
                <div className="overflow-x-auto">
                  <div className="min-w-[720px]">
                    <SurfaceComparison plotlyReady={plotlyReady} grid={r.grid} />
                  </div>
                </div>
              </>
            )}

            {run.error && <Alert kind="error">Error during analysis: {run.error}</Alert>}
          </>
        )}
      </main>
    </div>
  );
}
