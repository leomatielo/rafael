const http = require('http');
const fs = require('fs');
const path = require('path');
const { URLSearchParams } = require('url');

const port = process.env.PORT || 3000;

const publicDir = path.join(__dirname, 'public');
const staticFiles = {
  '/styles.css': {
    filePath: path.join(publicDir, 'styles.css'),
    contentType: 'text/css; charset=utf-8',
  },
  '/rafael.svg': {
    filePath: path.join(publicDir, 'rafael.svg'),
    contentType: 'image/svg+xml',
  },
};

let candles = [];
let nextId = 1;

const cleanupExpired = () => {
  const now = Date.now();
  candles = candles.filter((candle) => candle.expiresAt > now);
};

const formatRemaining = (ms) => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
};

const renderPage = () => {
  cleanupExpired();
  const now = Date.now();
  const candleCards = candles
    .map((candle) => {
      const remaining = formatRemaining(candle.expiresAt - now);
      return `
        <li class="candle-card">
          <div class="candle">
            <span class="flame"></span>
            <span class="wax"></span>
          </div>
          <div>
            <p class="candle-title">Vela #${candle.id}</p>
            <p class="candle-detail">Duração escolhida: ${candle.durationMinutes} min</p>
            <p class="candle-detail">Tempo restante: ${remaining}</p>
          </div>
        </li>
      `;
    })
    .join('');

  const candleContent = candleCards || '<p class="empty">Ainda não tem vela acesa. Seja o primeiro!</p>';

  return `
    <!DOCTYPE html>
    <html lang="pt-br">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Acende a vela do Rafael</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <main class="page">
          <section class="hero">
            <div>
              <span class="badge">Ritual coletivo</span>
              <h1>Acende uma vela para tirar o azar do Rafael</h1>
              <p class="subtitle">
                Cada vela acesa aparece para todo mundo. Escolha a duração, faça o pedido e vamos
                iluminar esse destino.
              </p>
              <form class="candle-form" method="POST" action="/light">
                <label>
                  Duração da vela (minutos)
                  <input type="number" name="duration" min="1" max="240" value="30" required />
                </label>
                <button type="submit">Acender vela agora</button>
              </form>
              <p class="note">As velas somem automaticamente quando o tempo acaba.</p>
            </div>
            <div class="photo-card">
              <img src="/rafael.svg" alt="Foto do Rafael" />
              <p class="photo-caption">Rafael no modo meme pedindo uma energia boa.</p>
            </div>
          </section>

          <section class="candles">
            <div class="section-header">
              <h2>Velas acesas (${candles.length})</h2>
              <span class="server-side">Atualização server-side</span>
            </div>
            <div class="candle-grid">
              ${candleContent}
            </div>
          </section>
        </main>
      </body>
    </html>
  `;
};

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && staticFiles[req.url]) {
    const { filePath, contentType } = staticFiles[req.url];
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Erro ao carregar o arquivo.');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/light') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      const params = new URLSearchParams(body);
      const durationMinutes = Number.parseInt(params.get('duration'), 10);
      const safeDuration = Number.isFinite(durationMinutes)
        ? Math.min(Math.max(durationMinutes, 1), 240)
        : 30;

      const now = Date.now();
      candles.push({
        id: nextId,
        durationMinutes: safeDuration,
        createdAt: now,
        expiresAt: now + safeDuration * 60 * 1000,
      });
      nextId += 1;

      res.writeHead(302, { Location: '/' });
      res.end();
    });
    return;
  }

  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderPage());
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Página não encontrada.');
});

server.listen(port, () => {
  console.log(`Vela do Rafael no ar em http://localhost:${port}`);
});
