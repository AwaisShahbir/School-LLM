const http = require('http');
const https = require('https');

const TARGET = 'https://iowkrflylrypjjeymotg.supabase.co';

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const targetUrl = new URL(req.url, TARGET);
  const headers = { ...req.headers, host: targetUrl.host };
  delete headers['content-length'];

  const options = {
    method: req.method,
    headers: headers,
  };

  const proxyReq = https.request(targetUrl, options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Bridge Proxy Error:', err.message);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  });

  req.pipe(proxyReq);
});

const PORT = 8082;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Supabase USB Bridge listening on port ${PORT} -> ${TARGET}`);
});
