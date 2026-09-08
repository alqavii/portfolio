# Petral — Crude Oil Trading Desk Dashboard

> **A reliable, sourced and proxy-labelled aggregation & synthesis dashboard for physical crude oil and commodity trading desks.**

- **Live Dashboard:** [petral.xyz](https://petral.xyz)
- **Backend API:** [petral2.vercel.app](https://petral2.vercel.app)
- **GitHub Repository:** [github.com/alqavii/petral](https://github.com/alqavii/petral)
- **Author:** AlQavi Hasan
- **Stack:** `Next.js 16`, `TypeScript`, `Python 3.11+`, `FastAPI`, `NumPy`, `Pandas`, `Plotly.js / ECharts`, `Parquet + SQLite`

---

## 🎯 Executive Thesis

In physical crude oil and trading-house desks, the hardest challenge is not predictive machine learning—it is **sourcing, reconciling, and honestly handling dirty, fragmented market data**.

**Petral** is an institutional-grade diagnostic dashboard built on strict data rigor:
- **Descriptive & diagnostic only:** Levels, spreads, z-scores, carry framing, consensus-vs-actual. **No predictive signals, no bot.**
- **Provenance on every series:** Every number displays its origin source, retrieval mode (live / cached / fixture), as-of timestamp, frequency, reliability class (settlement / official / proxy / estimate), and human caveats.
- **Honesty about dirty data:** Proxies are explicitly labeled as proxies (e.g., Brent–Dubai via futures, WS-points estimates, AIS vessel tracking error bars).
- **Zero-key resilience:** Absent an API key, sources fall back gracefully to local parquet cache, then to bundled deterministic fixtures badged `SAMPLE - not real market data`.

---

## 🏗️ Architecture

```
Browser ──► Next.js 16 + TypeScript Frontend (petral.xyz)
                     │  Typed JSON Contract (REST / WebSockets)
                     ▼
            FastAPI Backend (petral2.vercel.app)
                     │
                     ▼
            Python Data & Analytics Layer
       ├─ Provenance & SeriesMeta Engine
       ├─ Parquet Series + SQLite Manifest Cache
       ├─ Pure-NumPy Nelson-Siegel Curve Calibration
       ├─ Benchmark Registry (WTI, Brent, Dubai, Products)
       └─ Deterministic Fixture Fallbacks (Offline Ready)
```

- **Backend (Python 3.11+ & FastAPI):** Handles all heavy data ingestion, reconciliation, proxy tagging, and mathematical modeling (pure-numpy Nelson-Siegel term structure fits). Caches series in Parquet format with SQLite indexing.
- **Frontend (Next.js & TypeScript):** Renders high-frequency interactive charts (Plotly / ECharts), provenance tags, and trade desk views.

---

## 📊 Core Desk Panels & Features

1. **Benchmark Board:** Real-time and settlement monitoring for NYMEX WTI, ICE Brent, and Dubai crude proxies.
2. **Term Structure & Forward Curves:** Live multi-month forward curves ($M1 \to M24$) calibrated via Nelson-Siegel modeling.
3. **Calendar Spreads & Roll Yields:** Prompt spreads ($M1-M2$, $M1-M12$) measuring backwardation/contango tightness and roll yield carry.
4. **Product Cracks:** Gasoline (RBOB) and Distillate (Heating Oil) 3:2:1 crack spreads reflecting downstream refinery margins.
5. **Inventory & Balance Sheet Framing:** EIA weekly petroleum balance sheets, Cushing storage utilization, and SPR flows.

---

## 📐 Forward Curve Calibration Engine

Petral implements pure-NumPy Nelson-Siegel term structure calibration:

$$F(0, \tau) = \beta_0 + \beta_1 \left( \frac{1 - e^{-\tau / \lambda}}{\tau / \lambda} \right) + \beta_2 \left( \frac{1 - e^{-\tau / \lambda}}{\tau / \lambda} - e^{-\tau / \lambda} \right)$$

- $\beta_0$: Long-term equilibrium anchor.
- $\beta_1$: Front-end slope ($<0$ indicates physical backwardation).
- $\beta_2$: Medium-term curvature (seasonal refinery demand peaks).
- $\lambda$: Rate of exponential decay.

*You can interact with the live forward curve simulator below or test the full production dashboard at [petral.xyz](https://petral.xyz).*
