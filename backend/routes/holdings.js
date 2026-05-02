const express = require('express');
const router = express.Router();
const supabase = require('../db');

router.get('/', async (req, res) => {
  try {
    const { data: holdings, error } = await supabase
      .from('holdings')
      .select('*')
      .order('ticker');

    if (error) throw error;

    if (holdings.length === 0) {
      return res.json({
        holdings: [],
        summary: { totalValue: 0, totalCost: 0, totalGain: 0, totalGainPct: 0 },
      });
    }

    const { default: yahooFinance } = await import('yahoo-finance2');
    const tickers = [...new Set(holdings.map(h => h.ticker.toUpperCase()))];
    const quotes = {};

    await Promise.all(tickers.map(async (ticker) => {
      try {
        const q = await yahooFinance.quote(ticker);
        quotes[ticker] = {
          price: q.regularMarketPrice ?? null,
          change: q.regularMarketChange ?? null,
          changePct: q.regularMarketChangePercent ?? null,
          name: q.shortName || q.longName || ticker,
        };
      } catch {
        quotes[ticker] = { price: null, change: null, changePct: null, name: ticker };
      }
    }));

    const enriched = holdings.map(h => {
      const q = quotes[h.ticker.toUpperCase()] || {};
      const costBasis = h.avg_cost * h.shares;
      const currentValue = q.price != null ? q.price * h.shares : null;
      const gain = currentValue != null ? currentValue - costBasis : null;
      const gainPct = gain != null && costBasis > 0 ? (gain / costBasis) * 100 : null;
      return { ...h, ...q, costBasis, currentValue, gain, gainPct };
    });

    const validHoldings = enriched.filter(h => h.currentValue != null);
    const totalValue = validHoldings.reduce((s, h) => s + h.currentValue, 0);
    const validCost = validHoldings.reduce((s, h) => s + h.costBasis, 0);
    const totalCost = enriched.reduce((s, h) => s + h.costBasis, 0);
    const totalGain = totalValue - validCost;
    const totalGainPct = validCost > 0 ? (totalGain / validCost) * 100 : 0;

    res.json({ holdings: enriched, summary: { totalValue, totalCost, totalGain, totalGainPct } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { ticker, shares, avg_cost } = req.body;
  if (!ticker || shares == null || avg_cost == null) {
    return res.status(400).json({ error: 'ticker, shares, and avg_cost are required' });
  }
  try {
    const { data, error } = await supabase
      .from('holdings')
      .insert({ ticker: ticker.toUpperCase().trim(), shares: Number(shares), avg_cost: Number(avg_cost) })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { shares, avg_cost } = req.body;
  if (shares == null || avg_cost == null) {
    return res.status(400).json({ error: 'shares and avg_cost are required' });
  }
  try {
    const { data, error } = await supabase
      .from('holdings')
      .update({ shares: Number(shares), avg_cost: Number(avg_cost) })
      .eq('id', Number(req.params.id))
      .select()
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { error, count } = await supabase
      .from('holdings')
      .delete({ count: 'exact' })
      .eq('id', Number(req.params.id));
    if (error) throw error;
    if (count === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
