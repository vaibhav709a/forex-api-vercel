const fetch = require('node-fetch');

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { symbol, interval } = req.query;
  const apiKey = '806dd29a09244737ae6cd1a305061557';

  if (!symbol || !interval) {
    return res.status(400).json({ 
      error: 'Missing symbol or interval',
      usage: '/api/EURUSD/5min'
    });
  }

  try {
    console.log(`Fetching TwelveData: ${symbol} ${interval}`);
    
    const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${interval}&outputsize=100&apikey=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ForexBot/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`TwelveData API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status === 'error') {
      return res.status(400).json({ 
        error: data.message || 'TwelveData API error',
        code: data.code 
      });
    }

    if (!data.values || data.values.length === 0) {
      return res.status(404).json({ 
        error: 'No data found for this symbol/interval',
        symbol,
        interval 
      });
    }

    // Return successful data
    res.status(200).json({
      ...data,
      proxy_info: {
        server: 'Vercel',
        timestamp: new Date().toISOString(),
        symbol,
        interval
      }
    });

  } catch (error) {
    console.error('Forex API Error:', error);
    res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
