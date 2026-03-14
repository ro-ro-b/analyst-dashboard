---
type: video_summary
channel: Tomm King
channel_slug: tomm-king
generated_date: 2026-03-14
model: claude-sonnet
---

## Market Read
- Neutral to bearish regime on S&P: 8 EMA below 21 EMA on daily chart. Weekly timeframe still bullish.
- Volatility: Not specified in detail, but gold/silver margin requirements increased dramatically, indicating elevated vol across commodities.
- Transitioning from bullish 2025 to more cautious positioning in 2026. SPY and QQQ had strong uptrends in 2025.
- Bonds have been range-bound for a year, providing consistent strangle opportunities. Gold trending strongly (no longer strangling).

## Positions Discussed

| Underlying | Direction | Structure | Strikes | Expiry | Size/Risk | Rationale | Management Rules |
|-----------|-----------|-----------|---------|--------|-----------|-----------|-----------------|
| SPX | Neutral/Bearish | 1-1-3 (was 1-1-2) | Long 6870, Long 5870, Short 5770 | 60 DTE (April 30) | $30 credit, 2x max loss ($60) | Moved trap from 25 delta to ATM due to neutral/bearish regime. 100-point wide trap vs previous 50. | 90% profit target ($27), 2x stop loss ($60). Hold if in trap near expiration for 100-200% gains. |
| SPX | Delta-neutral income | Dynamic poor man's covered call (synthetic + weekly ATM/ITM calls) | Synthetic: Long call/Short put at same strike (Dec, 1yr out). Weekly: ATM or ITM calls. | Weekly short calls, 1yr synthetic | ~$6,400/week extrinsic on SPX (~1% of notional, 4% of capital deployed) | Collect extrinsic regardless of direction. Positive vega offsets 1-1-2/1-1-3 negative vega. Synthetic behaves like 100 delta. | ATM calls in bullish regime, ITM calls in bearish regime. Roll weeklies when 80-90% extrinsic captured. Close synthetic at 100% gain or 60-90 DTE remaining. Add disaster put 20% OTM at inception. |
| SPY/QQQ | Long with income overlay | Same dynamic PMCC structure | Not specified | Weekly/1yr | Not specified | Exited SPY leap put campaign due to excessive negative vega. Moved to synthetic structure for less vega, more capital efficiency. | Same as SPX structure above. |
| MSTR (Micro Strategy) | Income during drawdown | Dynamic PMCC (selling ITM calls during decline) | Not specified | Not specified | 20% return during 40% decline | Collected extrinsic + downside protection while asset fell. | Sell ITM calls to collect extrinsic + downside buffer during bearish price action. |
| CL (Oil futures) | Long directional | Not specified | Not specified | Not specified | Not specified | Betting on Iran-US tensions escalating. Normally strangles oil, but shifted to long bias. | Not specified |
| GLD/GC (Gold) | No upside risk structures | 1-1-2 or Jade Lizard | Not specified | Not specified | Not specified | Gold futures margin too high, shifted to GLD ETF. Stopped strangling gold due to strong uptrend. | No risk to upside preferred in strong trending environment. |
| Circle (CRCL) stock | Spec long | 100/110 call vertical | 100/110 strikes | Not specified | 100 lot for $0.07 debit ($7,000 risk) | Stable coin thesis: governments will promote stablecoins for debt financing. Circle is only US-approved option (Tether banned). | Low probability spec trade (10% of portfolio allocation). Took half off at $2.10, rode to $2.90. |
| S&P | Synthetic strangle variant | Long ITM calls 6mo out + short OTM puts 30 delta | Calls: 6100 and 5800 June. Puts: 6750/6700/6650 | Calls 6mo, Puts shorter-term | Not specified | Deep ITM calls provide downside protection with extrinsic collection. Short puts are synthetic long exposure. Added wide 7000/7500 butterfly for upside protection. | Roll calls to September before June expiration. Butterfly protection if rally threatens short calls. |

## Greeks & Risk Commentary
- Portfolio target: 200 deltas per $100k (0.2% of NLV), 400 theta per $100k (4% of NLV), negative 400 vega per $100k.
- Shifted from negative vega SPY leap puts to positive vega dynamic PMCC to reduce overall portfolio vega exposure.
- 1-1-3 structures have reduced naked put count vs 2-2-4 (9 vs 12), lowering vega risk while maintaining theta collection.
- Dynamic PMCC generates positive vega (helps in vol spikes) while 1-1-2/1-1-3 structures remain negative vega. Portfolio balanced between both.
- Prefers slightly positive delta bias (markets drift up), contrasts with Tom Sosnoff's negative delta preference.
- Size by regime: 2% NLV for aligned trades (bullish trade in bullish regime), 1-1.5% for neutral trades, <1% for counter-regime spec trades.

## Key Claims
- "He who dies with the most SPY wins" - core philosophy shared from trader named Tony from Mexico. Systematically reinvesting all income/distributions into SPY accumulation.
- Emotions are the biggest trading killer. Written trade plan is mandatory. Dynamic adjustment based on market regime (8 EMA vs 21 EMA, RSI, parabolic SAR) determines ATM vs ITM strike selection and position sizing.
- Gold and silver market caps have reached significant size (gold now half of US equity market cap at $32.5T vs $65T equities; silver in top 6 global asset classes). Expects consolidation/slower upward drift from current levels despite ongoing money printing.
- Oil likely to rally on Iran-US tensions (settlement odds "zero" in his view). Geopolitical risk premium not fully priced.
- Stable coins (specifically Circle) positioned as government debt financing mechanism. Regulatory moat with Tether banned in US.
- Track extrinsic collection separately from P&L when running PMCC strategies to avoid psychological trap of focusing on intrinsic losses while ignoring long delta gains.
