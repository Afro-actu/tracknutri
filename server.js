const http = require('http');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');

function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (err) {
    return [];
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

const server = http.createServer((req, res) => {
  const { method, url } = req;

  if (url.startsWith('/api/entries')) {
    if (method === 'GET') {
      const data = readData();
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
    } else if (method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const entry = JSON.parse(body);
          const data = readData();
          data.push({ ...entry, id: Date.now() });
          writeData(data);
          res.statusCode = 201;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true }));
        } catch (err) {
          res.statusCode = 400;
          res.end('Invalid JSON');
        }
      });
    } else {
      res.statusCode = 405;
      res.end('Method Not Allowed');
    }
    return;
  }

  // serve static files
  const filePath = url === '/' ? 'index.html' : url.slice(1);
  const fullPath = path.join(__dirname, 'public', filePath);
  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.end('Not Found');
    } else {
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      } else {
        res.setHeader('Content-Type', 'text/html');
      }
      res.end(data);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
