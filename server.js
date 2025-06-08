const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');
let writeQueue = Promise.resolve();

async function readData() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return { entries: [], goals: { calories:0, protein:0, carbs:0, fat:0 } };
  }
}

async function backupData() {
  try {
    await fs.copyFile(DATA_FILE, `${DATA_FILE}.bak`);
  } catch {}
}

function writeData(data) {
  writeQueue = writeQueue.then(async () => {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    await backupData();
  });
  return writeQueue;
}

const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  if (url.startsWith('/api/entries')) {
    if (method === 'GET') {
      const data = await readData();
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data.entries));
    } else if (method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', async () => {
        try {
          const entry = JSON.parse(body);
          const data = await readData();
          data.entries.push({ ...entry, id: Date.now() });
          await writeData(data);
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

  if (url.startsWith('/api/goals')) {
    if (method === 'GET') {
      const data = await readData();
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data.goals));
    } else if (method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', async () => {
        try {
          const goals = JSON.parse(body);
          const data = await readData();
          data.goals = goals;
          await writeData(data);
          res.statusCode = 200;
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

  if (url === '/api/recipes' && method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const recipe = JSON.parse(body);
        const totals = recipe.ingredients.reduce((acc, ing) => {
          acc.calories += ing.calories;
          acc.protein += ing.protein;
          acc.carbs += ing.carbs;
          acc.fat += ing.fat;
          return acc;
        }, {calories:0, protein:0, carbs:0, fat:0});
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(totals));
      } catch {
        res.statusCode = 400;
        res.end('Invalid JSON');
      }
    });
    return;
  }

  // serve static files
  const filePath = url === '/' ? 'index.html' : url.slice(1);
  const fullPath = path.join(__dirname, 'public', filePath);
  try {
    const data = await fs.readFile(fullPath);
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else {
      res.setHeader('Content-Type', 'text/html');
    }
    res.end(data);
  } catch {
    res.statusCode = 404;
    res.end('Not Found');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
