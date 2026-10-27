// TypeScript port of alqavii/ssvi-surface (backend/streamlit_app.py).
// Function names and maths mirror the Python so the two can be read side by side.
import { Delaunay } from "d3-delaunay";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const TENOR_TO_ID: Record<number, string> = {
  0.5: "DGS6MO",
  1.0: "DGS1",
  2.0: "DGS2",
  3.0: "DGS3",
  5.0: "DGS5",
  7.0: "DGS7",
  10.0: "DGS10",
};

export const TBILLS: Record<number, string> = { [1 / 12]: "DGS1MO", 0.25: "DGS3MO" };

function nyOffsetMinutes(utc: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(utc);
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"));
  return (asUtc - utc.getTime()) / 60000;
}

/** Time-to-expiry in years, with expiry at 16:00 US/Eastern on a 365-day basis. */
export function tte(expiry: string, nowUtc: Date = new Date(), minTte = 1e-5): number {
  const [y, m, d] = expiry.split("-").map(Number);
  const naive = new Date(Date.UTC(y, m - 1, d, 16, 0, 0));
  const expiryUtc = naive.getTime() - nyOffsetMinutes(naive) * 60000;
  const years = (expiryUtc - nowUtc.getTime()) / 1000 / (365 * 24 * 3600);
  return Math.max(years, minTte);
}

export function normPdf(x: number) {
  return (1.0 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
}

// scipy.special.ndtr: double-precision normal CDF (Hart 1968, via West 2005)
export function ndtr(x: number): number {
  const xa = Math.abs(x);
  let c: number;
  if (xa > 37) {
    c = 0;
  } else {
    const e = Math.exp((-xa * xa) / 2);
    if (xa < 7.07106781186547) {
      let b = 3.52624965998911e-2 * xa + 0.700383064443688;
      b = b * xa + 6.37396220353165;
      b = b * xa + 33.912866078383;
      b = b * xa + 112.079291497871;
      b = b * xa + 221.213596169931;
      b = b * xa + 220.206867912376;
      c = e * b;
      b = 8.83883476483184e-2 * xa + 1.75566716318264;
      b = b * xa + 16.064177579207;
      b = b * xa + 86.7807322029461;
      b = b * xa + 296.564248779674;
      b = b * xa + 637.333633378831;
      b = b * xa + 793.826512519948;
      b = b * xa + 440.413735824752;
      c = c / b;
    } else {
      let b = xa + 0.65;
      b = xa + 4 / b;
      b = xa + 3 / b;
      b = xa + 2 / b;
      b = xa + 1 / b;
      c = e / b / 2.506628274631;
    }
  }
  return x > 0 ? 1 - c : c;
}

/** scipy.optimize.brentq */
function brentq(f: (x: number) => number, a: number, b: number, xtol = 2e-12, rtol = 8.88e-16, maxiter = 100): number {
  let fa = f(a);
  let fb = f(b);
  if (fa * fb > 0) throw new Error("f(a) and f(b) must have different signs");
  let c = a, fc = fa, d = b - a, e = d;
  for (let i = 0; i < maxiter; i++) {
    if (fb * fc > 0) {
      c = a; fc = fa; d = b - a; e = d;
    }
    if (Math.abs(fc) < Math.abs(fb)) {
      a = b; b = c; c = a;
      fa = fb; fb = fc; fc = fa;
    }
    const tol = 2 * rtol * Math.abs(b) + xtol / 2;
    const m = (c - b) / 2;
    if (Math.abs(m) <= tol || fb === 0) return b;
    if (Math.abs(e) >= tol && Math.abs(fa) > Math.abs(fb)) {
      const s = fb / fa;
      let p: number, q: number;
      if (a === c) {
        p = 2 * m * s;
        q = 1 - s;
      } else {
        const qq = fa / fc, r = fb / fc;
        p = s * (2 * m * qq * (qq - r) - (b - a) * (r - 1));
        q = (qq - 1) * (r - 1) * (s - 1);
      }
      if (p > 0) q = -q;
      else p = -p;
      if (2 * p < Math.min(3 * m * q - Math.abs(tol * q), Math.abs(e * q))) {
        e = d;
        d = p / q;
      } else {
        d = m;
        e = m;
      }
    } else {
      d = m;
      e = m;
    }
    a = b;
    fa = fb;
    b += Math.abs(d) > tol ? d : m > 0 ? tol : -tol;
    fb = f(b);
  }
  return b;
}

/** numpy.interp: piecewise linear, clamped to the end values. */
export function interp(x: number, xp: number[], fp: number[]): number {
  if (x <= xp[0]) return fp[0];
  if (x >= xp[xp.length - 1]) return fp[fp.length - 1];
  let i = 1;
  while (xp[i] < x) i++;
  const t = (x - xp[i - 1]) / (xp[i] - xp[i - 1]);
  return fp[i - 1] + t * (fp[i] - fp[i - 1]);
}

// ============================================================================
// ZERO RATES ENGINE (STATELESS)
// ============================================================================

/** Bootstrap discount factors from par yields. Returns tenor -> discount factor. */
export function calcZeroRates(yields: Record<number, number>): Record<number, number> {
  const ys = Object.entries(yields)
    .map(([k, v]) => [Number(k), Number(v)] as [number, number])
    .sort((a, b) => a[0] - b[0]);
  const discountRates = new Map<number, number>();

  const y05 = ys.find(([t]) => t === 0.5);
  if (y05 && !Number.isNaN(y05[1])) {
    discountRates.set(0.5, 100 / (100 + (100 * y05[1]) / 2));
  } else {
    discountRates.set(0.5, Math.exp(-ys[0][1] * 0.5));
  }

  const priceError = (x: number, prevT: number, tenorT: number, cpn: number, dfPrev: number) => {
    let knownSum = 0;
    discountRates.forEach((df, t) => {
      if (t <= prevT) knownSum += df;
    });
    knownSum *= cpn;
    const steps = Math.trunc((tenorT - prevT) * 2);
    let futureSum = 0;
    for (let a = 1; a < steps; a++) futureSum += cpn * dfPrev * Math.exp(x * -(a * 0.5));
    const finalLeg = (100 + cpn) * dfPrev * Math.exp(x * -(tenorT - prevT));
    return knownSum + futureSum + finalLeg - 100.0;
  };

  for (const [tenor, rate] of ys) {
    if (discountRates.has(tenor)) continue;
    const prev = Math.max(...Array.from(discountRates.keys()));
    const c = (100.0 * rate) / 2.0;
    const dfPrev = discountRates.get(prev)!;
    const f = (x: number) => priceError(x, prev, tenor, c, dfPrev);

    let a = -0.5, b = 5.0;
    let fa = f(a), fb = f(b);
    let expand = 0;
    while (fa * fb > 0 && expand < 10) {
      a -= 0.5;
      b += 0.5;
      fa = f(a);
      fb = f(b);
      expand++;
    }
    const forwardRate = fa * fb > 0 ? Math.max(rate, 0.0) : brentq(f, a, b);

    const steps = Math.trunc((tenor - prev) * 2);
    for (let k = 1; k <= steps; k++) {
      discountRates.set(prev + k * 0.5, dfPrev * Math.exp(-forwardRate * (k * 0.5)));
    }
  }

  const filtered: Record<number, number> = {};
  for (const t of Object.keys(TENOR_TO_ID).map(Number).sort((a, b) => a - b)) {
    if (discountRates.has(t)) filtered[t] = discountRates.get(t)!;
  }
  return filtered;
}

/** Zero rate at time T from the in-memory discount curve (linear in zero rate). */
export function interpolateZeroRate(T: number, zeroCurve: Record<number, number>): number {
  const tenors = Object.keys(zeroCurve).map(Number).sort((a, b) => a - b);
  const zeroRates = tenors.map((t) => -Math.log(zeroCurve[t]) / t);
  return interp(T, tenors, zeroRates);
}

// ============================================================================
// IV ENGINE
// ============================================================================

export function blackScholes(sigma: number, K: number, T: number, r: number, q: number, S: number, isCall: number) {
  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r - q + 0.5 * sigma ** 2) * T) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;
  return isCall * (S * Math.exp(-q * T) * ndtr(isCall * d1) - K * Math.exp(-r * T) * ndtr(isCall * d2));
}

export function vega(sigma: number, K: number, T: number, r: number, q: number, S: number) {
  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r - q + 0.5 * sigma ** 2) * T) / (sigma * sqrtT);
  return S * Math.exp(-q * T) * normPdf(d1) * sqrtT;
}

/** Vectorised Newton-Raphson, same stopping rule as the numpy version. */
export function impliedVolatility(
  marketPrice: number[], K: number[], T: number[], r: number[], q: number, S: number, isCall: number[],
  tolerance = 1e-5, maxIter = 20
): number[] {
  const n = marketPrice.length;
  const sigma = new Array<number>(n).fill(0.5);

  for (let it = 0; it < maxIter; it++) {
    const diff = new Array<number>(n);
    let maxAbs = 0;
    for (let i = 0; i < n; i++) {
      diff[i] = blackScholes(sigma[i], K[i], T[i], r[i], q, S, isCall[i]) - marketPrice[i];
      // np.max propagates NaN, so any NaN keeps the loop running
      maxAbs = Number.isNaN(diff[i]) || Number.isNaN(maxAbs) ? NaN : Math.max(maxAbs, Math.abs(diff[i]));
    }
    if (maxAbs < tolerance) break;
    for (let i = 0; i < n; i++) {
      const v = Math.max(vega(sigma[i], K[i], T[i], r[i], q, S), 1e-8);
      sigma[i] = Math.max(sigma[i] - diff[i] / v, 1e-6);
    }
  }

  return sigma.map((s, i) => {
    const finalDiff = blackScholes(s, K[i], T[i], r[i], q, S, isCall[i]) - marketPrice[i];
    return Math.abs(finalDiff) > tolerance * 10 || Number.isNaN(finalDiff) ? NaN : s;
  });
}

// ============================================================================
// SSVI
// ============================================================================

export function ssviW(k: number, theta: number, phi: number, rho: number) {
  return 0.5 * theta * (1 + rho * phi * k + Math.sqrt((phi * k + rho) ** 2 + 1 - rho ** 2));
}

/** sklearn IsotonicRegression(increasing=True) via pool-adjacent-violators; x must be sorted. */
export function isotonicIncreasing(y: number[]): number[] {
  const blocks: { sum: number; n: number }[] = [];
  for (const v of y) {
    blocks.push({ sum: v, n: 1 });
    while (blocks.length > 1) {
      const b = blocks[blocks.length - 1], a = blocks[blocks.length - 2];
      if (a.sum / a.n <= b.sum / b.n) break;
      a.sum += b.sum;
      a.n += b.n;
      blocks.pop();
    }
  }
  return blocks.flatMap((b) => new Array(b.n).fill(b.sum / b.n));
}

// ============================================================================
// ANALYSIS PIPELINE
// ============================================================================

export interface OptionRow {
  optionType: "call" | "put";
  strike: number;
  timeToExpiry: number;
  midPrice: number;
  expiry: string;
}

export interface SurfaceRow {
  index: number;
  expiry: string;
  K: number;
  T: number;
  Price: number;
  rate: number;
  iv: number;
  F: number;
  k: number;
  w: number;
  theta: number;
  vega: number;
  w_ssvi: number;
  iv_ssvi: number;
  residuals: number;
  relative_residuals: number;
  iv_error: number;
}

/** IVEngine.generateIVSmile + dropna */
export function generateIVSmile(
  df: OptionRow[], rate: number[], dividendYield: number, spot: number, optionType: "call" | "put"
) {
  const rows = df.map((r, i) => ({ ...r, index: i, rate: rate[i] })).filter((r) => r.optionType === optionType);
  const iv = impliedVolatility(
    rows.map((r) => r.midPrice),
    rows.map((r) => r.strike),
    rows.map((r) => r.timeToExpiry),
    rows.map((r) => r.rate),
    dividendYield,
    spot,
    rows.map((r) => (r.optionType === "call" ? 1 : -1))
  );
  return rows
    .map((r, i) => ({ index: r.index, expiry: r.expiry, K: r.strike, T: r.timeToExpiry, Price: r.midPrice, rate: r.rate, iv: iv[i] }))
    .filter((r) => !Number.isNaN(r.iv));
}

/**
 * Minimises the Streamlit objective
 *   loss(x) = Σ weights · (w_ssvi − w_mkt)², ρ = tanh(x₀), φᵢ = ηᵢ / √θ
 * subject to bounds x₀ ∈ [−5, 5], ηᵢ ∈ [1e-5, 2] and constraints 2 − ηᵢ(1 + |x₀|) ≥ 0.
 * Given ρ the loss separates by expiry, so instead of SLSQP we search x₀ and solve each
 * ηᵢ exactly on its feasible interval with a bracketed 1-D search.
 */
function calibrate(k: number[], theta: number[], wMkt: number[], idx: number[], weights: number[], nExp: number) {
  const bySlice: number[][] = Array.from({ length: nExp }, () => []);
  idx.forEach((s, j) => bySlice[s].push(j));

  const sliceLoss = (s: number, eta: number, rho: number) => {
    let loss = 0;
    for (const j of bySlice[s]) {
      const phi = eta / Math.sqrt(Math.max(theta[j], 1e-12));
      const err = ssviW(k[j], theta[j], phi, rho) - wMkt[j];
      loss += weights[j] * err * err;
    }
    return loss;
  };

  const minimise1d = (f: (x: number) => number, lo: number, hi: number, gridN: number, iters: number) => {
    let best = lo, bestF = Infinity;
    const step = (hi - lo) / (gridN - 1);
    for (let i = 0; i < gridN; i++) {
      const x = lo + i * step;
      const fx = f(x);
      if (fx < bestF) { bestF = fx; best = x; }
    }
    let a = Math.max(lo, best - step), b = Math.min(hi, best + step);
    const g = (Math.sqrt(5) - 1) / 2;
    let c = b - g * (b - a), d = a + g * (b - a);
    let fc = f(c), fd = f(d);
    for (let i = 0; i < iters; i++) {
      if (fc < fd) { b = d; d = c; fd = fc; c = b - g * (b - a); fc = f(c); }
      else { a = c; c = d; fc = fd; d = a + g * (b - a); fd = f(d); }
    }
    const x = (a + b) / 2, fx = f(x);
    return fx < bestF ? { x, f: fx } : { x: best, f: bestF };
  };

  const solveEtas = (rhoRaw: number) => {
    const rho = Math.tanh(rhoRaw);
    const upper = Math.min(2, 2 / (1 + Math.abs(rhoRaw)));
    let total = 0;
    const eta = new Array<number>(nExp);
    for (let s = 0; s < nExp; s++) {
      const r = minimise1d((e) => sliceLoss(s, e, rho), 1e-5, upper, 24, 40);
      eta[s] = r.x;
      total += r.f;
    }
    return { eta, loss: total };
  };

  const outer = minimise1d((x) => solveEtas(x).loss, -5, 5, 81, 40);
  const { eta, loss } = solveEtas(outer.x);
  return { rhoRaw: outer.x, eta, loss };
}

/** scipy.interpolate.griddata(method="linear"): Delaunay triangulation + barycentric weights. */
export function griddataLinear(px: number[], py: number[], values: number[], gx: number[], gy: number[]): number[] {
  const delaunay = Delaunay.from(px.map((x, i) => [x, py[i]]));
  const tri = delaunay.triangles;
  const out = new Array<number>(gx.length).fill(NaN);
  for (let t = 0; t < tri.length; t += 3) {
    const [a, b, c] = [tri[t], tri[t + 1], tri[t + 2]];
    const x1 = px[a], y1 = py[a], x2 = px[b], y2 = py[b], x3 = px[c], y3 = py[c];
    const det = (y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3);
    if (Math.abs(det) < 1e-18) continue;
    const minX = Math.min(x1, x2, x3), maxX = Math.max(x1, x2, x3);
    const minY = Math.min(y1, y2, y3), maxY = Math.max(y1, y2, y3);
    for (let i = 0; i < gx.length; i++) {
      if (!Number.isNaN(out[i])) continue;
      const x = gx[i], y = gy[i];
      if (x < minX - 1e-12 || x > maxX + 1e-12 || y < minY - 1e-12 || y > maxY + 1e-12) continue;
      const l1 = ((y2 - y3) * (x - x3) + (x3 - x2) * (y - y3)) / det;
      const l2 = ((y3 - y1) * (x - x3) + (x1 - x3) * (y - y3)) / det;
      const l3 = 1 - l1 - l2;
      const eps = -1e-10;
      if (l1 >= eps && l2 >= eps && l3 >= eps) out[i] = l1 * values[a] + l2 * values[b] + l3 * values[c];
    }
  }
  return out;
}

export interface AnalysisResult {
  surface: SurfaceRow[];
  rhoOpt: number;
  etaOpt: number[];
  ssviLoss: number;
  metrics: { rmse: number; vegaWeightedRmse: number; meanIvError: number; maxIvError: number };
  grid: { M: number[][]; T: number[][]; ivMarket: (number | null)[][]; ivModel: (number | null)[][] };
}

/** Everything the Streamlit script does after the IV smile: θ, vega weights, SSVI fit, errors, grids. */
export function runSSVI(
  surfaceData: ReturnType<typeof generateIVSmile>, spot: number, div: number
): AnalysisResult {
  const rows = surfaceData.map((r) => {
    const F = spot * Math.exp((r.rate - div / 100) * r.T);
    const k = Math.log(r.K / F);
    return { ...r, F, k, w: r.iv ** 2 * r.T };
  });

  // θ(T): ATM total variance per expiry, made monotone in T with isotonic regression.
  // (The Python then fits a PCHIP through these points but only evaluates it at the same
  // T nodes, where PCHIP returns the node values exactly, so the lookup below is equivalent.)
  const T_unique = Array.from(new Set(rows.map((r) => r.T))).sort((a, b) => a - b);
  const atmW = T_unique.map((T) => {
    let best = rows.find((r) => r.T === T)!;
    for (const r of rows) if (r.T === T && Math.abs(r.k) < Math.abs(best.k)) best = r;
    return best.w;
  });
  const thetaIso = isotonicIncreasing(atmW);
  const thetaByT = new Map(T_unique.map((T, i) => [T, thetaIso[i]]));

  // Faithful to the original: vega is evaluated with q = div (in percent) and S = F.
  const withVega = rows.map((r) => ({
    ...r,
    theta: thetaByT.get(r.T)!,
    vega: Math.max(vega(r.iv, r.K, r.T, r.rate, div, r.F), 1e-6),
  }));

  const vegaSumByT = new Map<number, number>();
  for (const r of withVega) vegaSumByT.set(r.T, (vegaSumByT.get(r.T) ?? 0) + r.vega);
  const weights = withVega.map((r) => (r.vega / vegaSumByT.get(r.T)!) * 100);

  const T_to_index = new Map(T_unique.map((t, i) => [t, i]));
  const idx = withVega.map((r) => T_to_index.get(r.T)!);
  const k = withVega.map((r) => r.k);
  const theta = withVega.map((r) => r.theta);
  const wMkt = withVega.map((r) => r.w);

  const res = calibrate(k, theta, wMkt, idx, weights, T_unique.length);
  const rhoOpt = Math.tanh(res.rhoRaw);

  const surface: SurfaceRow[] = withVega.map((r, j) => {
    const w_ssvi = ssviW(r.k, r.theta, res.eta[idx[j]] / Math.sqrt(Math.max(r.theta, 1e-12)), rhoOpt);
    const iv_ssvi = Math.sqrt(w_ssvi / r.T);
    const residuals = w_ssvi - r.w;
    return {
      ...r,
      w_ssvi,
      iv_ssvi,
      residuals,
      relative_residuals: (residuals / r.w) * 100,
      iv_error: (iv_ssvi / r.iv - 1) * 100,
    };
  });

  const n = surface.length;
  const absErr = surface.map((r) => Math.abs(r.iv_error));
  const vegaTotal = surface.reduce((s, r) => s + r.vega, 0);
  const metrics = {
    rmse: Math.sqrt(surface.reduce((s, r) => s + (r.iv_ssvi - r.iv) ** 2, 0) / n),
    vegaWeightedRmse: Math.sqrt(surface.reduce((s, r) => s + (r.iv_ssvi - r.iv) ** 2 * (r.vega / vegaTotal), 0)),
    meanIvError: absErr.reduce((s, v) => s + v, 0) / n,
    maxIvError: Math.max(...absErr),
  };

  // np.mgrid[k_min:k_max:50j, T_min:T_max:50j]
  const N = 50;
  const kMin = Math.min(...k), kMax = Math.max(...k);
  const tMin = T_unique[0], tMax = T_unique[T_unique.length - 1];
  const kAxis = Array.from({ length: N }, (_, i) => kMin + ((kMax - kMin) * i) / (N - 1));
  const tAxis = Array.from({ length: N }, (_, j) => tMin + ((tMax - tMin) * j) / (N - 1));
  const gk = kAxis.flatMap((kv) => tAxis.map(() => kv));
  const gt = kAxis.flatMap(() => tAxis);
  const px = surface.map((r) => r.k), py = surface.map((r) => r.T);
  const mkt = griddataLinear(px, py, surface.map((r) => r.iv), gk, gt);
  const mdl = griddataLinear(px, py, surface.map((r) => r.iv_ssvi), gk, gt);
  const reshape = (flat: number[]) =>
    kAxis.map((_, i) => tAxis.map((__, j) => (Number.isNaN(flat[i * N + j]) ? null : flat[i * N + j])));

  return {
    surface,
    rhoOpt,
    etaOpt: res.eta,
    ssviLoss: res.loss,
    metrics,
    grid: {
      M: kAxis.map((kv) => tAxis.map(() => Math.exp(kv))),
      T: kAxis.map(() => tAxis.slice()),
      ivMarket: reshape(mkt),
      ivModel: reshape(mdl),
    },
  };
}
