# ssvi-surface

Builds an implied volatility surface from option prices using the SSVI model, which keeps the surface free of static arbitrage.

Implied vols are backed out of market prices, then SSVI parameters are fitted per expiry with vega-weighted least squares. Rates come from a zero curve bootstrapped off US Treasury yields.

**Stack:** Python, NumPy, SciPy, Streamlit, Plotly

- Demo: [/demos/ssvi](/demos/ssvi)
- Code: [github.com/alqavii/ssvi-surface](https://github.com/alqavii/ssvi-surface)
