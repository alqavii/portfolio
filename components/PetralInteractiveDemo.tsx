"use client";

import React, { useState, useMemo } from "react";
import { Activity, Play, RotateCcw, TrendingUp, TrendingDown, Layers, Sparkles, ExternalLink } from "lucide-react";

export default function PetralInteractiveDemo() {
  // Nelson-Siegel parameters
  const [beta0, setBeta0] = useState<number>(75.0); // Level
  const [beta1, setBeta1] = useState<number>(-9.5); // Slope (negative = backwardation)
  const [beta2, setBeta2] = useState<number>(4.2);  // Curvature
  const [lambda, setLambda] = useState<number>(1.5); // Decay rate

  // Presets
  const applyPreset = (preset: "backwardation" | "contango" | "humped") => {
    if (preset === "backwardation") {
      setBeta0(74.5);
      setBeta1(-11.2);
      setBeta2(2.5);
      setLambda(1.3);
    } else if (preset === "contango") {
      setBeta0(71.0);
      setBeta1(8.4);
      setBeta2(-3.8);
      setLambda(1.7);
    } else if (preset === "humped") {
      setBeta0(75.0);
      setBeta1(-2.0);
      setBeta2(10.5);
      setLambda(1.2);
    }
  };

  // Evaluate Nelson-Siegel at time-to-expiry tau (in years)
  const calcNelsonSiegel = (tau: number, b0: number, b1: number, b2: number, l: number) => {
    if (tau <= 0.0001) return b0 + b1;
    const factor = tau / l;
    const expTerm = Math.exp(-factor);
    const term1 = (1 - expTerm) / factor;
    const term2 = term1 - expTerm;
    return b0 + b1 * term1 + b2 * term2;
  };

  // Generate 18 monthly contract points (M1 to M18)
  const contracts = useMemo(() => {
    const months = [
      { name: "M1", tau: 1 / 12 },
      { name: "M2", tau: 2 / 12 },
      { name: "M3", tau: 3 / 12 },
      { name: "M4", tau: 4 / 12 },
      { name: "M5", tau: 5 / 12 },
      { name: "M6", tau: 6 / 12 },
      { name: "M7", tau: 7 / 12 },
      { name: "M8", tau: 8 / 12 },
      { name: "M9", tau: 9 / 12 },
      { name: "M10", tau: 10 / 12 },
      { name: "M11", tau: 11 / 12 },
      { name: "M12", tau: 12 / 12 },
      { name: "M15", tau: 15 / 12 },
      { name: "M18", tau: 18 / 12 },
    ];

    return months.map((m) => {
      const price = calcNelsonSiegel(m.tau, beta0, beta1, beta2, lambda);
      return {
        ...m,
        price: parseFloat(price.toFixed(2)),
      };
    });
  }, [beta0, beta1, beta2, lambda]);

  // Curve characteristics
  const m1 = contracts[0]?.price || 0;
  const m2 = contracts[1]?.price || 0;
  const m12 = contracts[11]?.price || 0;
  const spreadM1M2 = parseFloat((m1 - m2).toFixed(2));
  const spreadM1M12 = parseFloat((m1 - m12).toFixed(2));
  const isBackwardation = spreadM1M2 > 0;
  const annualizedRollYield = m1 > 0 ? parseFloat((((m1 - m2) / m1) * 12 * 100).toFixed(1)) : 0;

  // SVG Chart bounds
  const prices = contracts.map((c) => c.price);
  const minPrice = Math.floor(Math.min(...prices) - 2);
  const maxPrice = Math.ceil(Math.max(...prices) + 2);
  const priceRange = maxPrice - minPrice || 1;

  const svgWidth = 600;
  const svgHeight = 240;
  const paddingX = 45;
  const paddingY = 25;

  const getX = (index: number) =>
    paddingX + (index / (contracts.length - 1)) * (svgWidth - paddingX * 2);
  const getY = (price: number) =>
    svgHeight - paddingY - ((price - minPrice) / priceRange) * (svgHeight - paddingY * 2);

  // SVG Path generator
  const points = contracts.map((c, i) => `${getX(i)},${getY(c.price)}`).join(" ");

  return (
    <div className="bg-surface-0 border border-surface-2 rounded-xl p-4 md:p-6 my-4 shadow-xl text-text-primary">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue/10 text-blue border border-blue/20">
            <Activity size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-text-primary">Petral Forward Curve Simulator</h3>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue/15 text-blue border border-blue/30 font-semibold">
                Nelson-Siegel Model
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Simulate CME WTI Crude Oil term structure dynamics, roll yields & spread shapes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://petral.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-text-primary bg-blue hover:bg-blue-light px-3 py-1.5 rounded-lg text-base font-bold transition-colors shadow"
          >
            <ExternalLink size={13} />
            <span>Open petral.xyz</span>
          </a>
          <a
            href="https://github.com/alqavii/petral"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary bg-surface-1 hover:bg-surface-2 px-3 py-1.5 rounded-lg border border-surface-2 transition-colors"
          >
            <ExternalLink size={13} />
            <span>GitHub</span>
          </a>
        </div>
      </div>

      {/* Market Regime Badge & Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        {/* Regime */}
        <div className="bg-surface-1 border border-surface-2 p-3 rounded-lg flex flex-col">
          <span className="text-[11px] text-text-tertiary font-mono">Market Regime</span>
          <div className="flex items-center gap-1.5 mt-1">
            {isBackwardation ? (
              <>
                <TrendingUp size={16} className="text-green" />
                <span className="text-sm font-bold text-green">Backwardation</span>
              </>
            ) : (
              <>
                <TrendingDown size={16} className="text-peach" />
                <span className="text-sm font-bold text-peach">Contango</span>
              </>
            )}
          </div>
          <span className="text-[10px] text-text-tertiary mt-1">
            {isBackwardation ? "Inventories tight (Spot premium)" : "Storage surplus (Future premium)"}
          </span>
        </div>

        {/* Spot M1 */}
        <div className="bg-surface-1 border border-surface-2 p-3 rounded-lg flex flex-col">
          <span className="text-[11px] text-text-tertiary font-mono">Front Month (M1)</span>
          <span className="text-base font-bold text-text-primary mt-1 font-mono">${m1.toFixed(2)}/bbl</span>
          <span className="text-[10px] text-text-tertiary mt-1">M12: ${m12.toFixed(2)}/bbl</span>
        </div>

        {/* M1 - M2 Prompt Spread */}
        <div className="bg-surface-1 border border-surface-2 p-3 rounded-lg flex flex-col">
          <span className="text-[11px] text-text-tertiary font-mono">M1 - M2 Spread</span>
          <span
            className={`text-base font-bold mt-1 font-mono ${
              spreadM1M2 > 0 ? "text-green" : spreadM1M2 < 0 ? "text-peach" : "text-text-primary"
            }`}
          >
            {spreadM1M2 > 0 ? `+$${spreadM1M2}` : `-$${Math.abs(spreadM1M2)}`}
          </span>
          <span className="text-[10px] text-text-tertiary mt-1">
            1-12 spread: {spreadM1M12 >= 0 ? `+$${spreadM1M12}` : `-$${Math.abs(spreadM1M12)}`}
          </span>
        </div>

        {/* Annualized Roll Yield */}
        <div className="bg-surface-1 border border-surface-2 p-3 rounded-lg flex flex-col">
          <span className="text-[11px] text-text-tertiary font-mono">Annualized Roll Yield</span>
          <span
            className={`text-base font-bold mt-1 font-mono ${
              annualizedRollYield >= 0 ? "text-green" : "text-peach"
            }`}
          >
            {annualizedRollYield >= 0 ? `+${annualizedRollYield}%` : `${annualizedRollYield}%`}
          </span>
          <span className="text-[10px] text-text-tertiary mt-1">
            {annualizedRollYield >= 0 ? "Positive carry tailwind" : "Negative carry cost"}
          </span>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-xs text-text-tertiary mr-1 font-mono">Presets:</span>
        <button
          onClick={() => applyPreset("backwardation")}
          className="text-xs px-2.5 py-1 rounded bg-green/10 hover:bg-green/20 text-green border border-green/30 transition-colors font-medium flex items-center gap-1"
        >
          <TrendingUp size={12} />
          Backwardation (Tight Physical)
        </button>
        <button
          onClick={() => applyPreset("contango")}
          className="text-xs px-2.5 py-1 rounded bg-peach/10 hover:bg-peach/20 text-peach border border-peach/30 transition-colors font-medium flex items-center gap-1"
        >
          <TrendingDown size={12} />
          Contango (Storage Surplus)
        </button>
        <button
          onClick={() => applyPreset("humped")}
          className="text-xs px-2.5 py-1 rounded bg-mauve/10 hover:bg-mauve/20 text-mauve border border-mauve/30 transition-colors font-medium flex items-center gap-1"
        >
          <Layers size={12} />
          Seasonal Hump / Refinery
        </button>
      </div>

      {/* Interactive SVG Forward Curve Chart */}
      <div className="bg-surface-1 border border-surface-2 rounded-lg p-2 overflow-x-auto relative">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[500px]"
          style={{ maxHeight: "250px" }}
        >
          {/* Background gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = paddingY + pct * (svgHeight - paddingY * 2);
            const priceVal = maxPrice - pct * priceRange;
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="currentColor"
                  className="text-surface-2"
                  strokeDasharray="3 3"
                />
                <text
                  x={paddingX - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-text-tertiary font-mono"
                >
                  ${priceVal.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* Forward Curve Gradient Area */}
          <defs>
            <linearGradient id="curveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isBackwardation ? "#34d399" : "#38bdf8"} stopOpacity="0.25" />
              <stop offset="100%" stopColor={isBackwardation ? "#34d399" : "#38bdf8"} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          <polygon
            points={`${getX(0)},${svgHeight - paddingY} ${points} ${getX(contracts.length - 1)},${svgHeight - paddingY}`}
            fill="url(#curveGradient)"
          />

          {/* Forward Curve Line */}
          <polyline
            points={points}
            fill="none"
            stroke={isBackwardation ? "#34d399" : "#38bdf8"}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Contract dots and labels */}
          {contracts.map((c, i) => {
            const cx = getX(i);
            const cy = getY(c.price);
            return (
              <g key={c.name} className="group cursor-pointer">
                <circle
                  cx={cx}
                  cy={cy}
                  r={i === 0 || i === contracts.length - 1 ? 4.5 : 3}
                  className="fill-surface-0 stroke-blue stroke-2 hover:r-5 transition-all"
                />
                {/* X-axis tick */}
                <text
                  x={cx}
                  y={svgHeight - 8}
                  textAnchor="middle"
                  className="text-[9px] fill-text-tertiary font-mono"
                >
                  {c.name}
                </text>
                {/* Price tag on key contracts */}
                {(i === 0 || i === 5 || i === 11 || i === contracts.length - 1) && (
                  <text
                    x={cx}
                    y={cy - 8}
                    textAnchor="middle"
                    className="text-[9px] fill-text-secondary font-bold font-mono"
                  >
                    ${c.price}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Interactive Parameter Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-surface-2 font-mono text-xs">
        {/* Beta 0: Level */}
        <div className="space-y-1.5 bg-surface-1 p-3 rounded-lg border border-surface-2">
          <div className="flex justify-between items-center text-text-secondary">
            <span>β₀ (Long-Term Level)</span>
            <span className="text-text-primary font-bold">${beta0.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="50"
            max="110"
            step="0.5"
            value={beta0}
            onChange={(e) => setBeta0(parseFloat(e.target.value))}
            className="w-full accent-blue cursor-pointer"
          />
          <span className="text-[10px] text-text-tertiary block">Asymptotic baseline forward price</span>
        </div>

        {/* Beta 1: Slope */}
        <div className="space-y-1.5 bg-surface-1 p-3 rounded-lg border border-surface-2">
          <div className="flex justify-between items-center text-text-secondary">
            <span>β₁ (Curve Slope)</span>
            <span
              className={`font-bold ${
                beta1 < 0 ? "text-green" : beta1 > 0 ? "text-peach" : "text-text-primary"
              }`}
            >
              {beta1 > 0 ? `+${beta1.toFixed(1)}` : beta1.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min="-25"
            max="25"
            step="0.5"
            value={beta1}
            onChange={(e) => setBeta1(parseFloat(e.target.value))}
            className="w-full accent-green cursor-pointer"
          />
          <span className="text-[10px] text-text-tertiary block">&lt;0 = Backwardation, &gt;0 = Contango</span>
        </div>

        {/* Beta 2: Curvature */}
        <div className="space-y-1.5 bg-surface-1 p-3 rounded-lg border border-surface-2">
          <div className="flex justify-between items-center text-text-secondary">
            <span>β₂ (Curvature / Hump)</span>
            <span className="text-text-primary font-bold">{beta2 > 0 ? `+${beta2.toFixed(1)}` : beta2.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="-20"
            max="25"
            step="0.5"
            value={beta2}
            onChange={(e) => setBeta2(parseFloat(e.target.value))}
            className="w-full accent-mauve cursor-pointer"
          />
          <span className="text-[10px] text-text-tertiary block">Medium-term seasonal bow</span>
        </div>

        {/* Lambda: Decay */}
        <div className="space-y-1.5 bg-surface-1 p-3 rounded-lg border border-surface-2">
          <div className="flex justify-between items-center text-text-secondary">
            <span>λ (Decay Velocity)</span>
            <span className="text-text-primary font-bold">{lambda.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="3.5"
            step="0.1"
            value={lambda}
            onChange={(e) => setLambda(parseFloat(e.target.value))}
            className="w-full accent-yellow cursor-pointer"
          />
          <span className="text-[10px] text-text-tertiary block">Peak loading at ~{(1.79 * lambda).toFixed(1)} yrs</span>
        </div>
      </div>
    </div>
  );
}
