const fs = require('fs');

test('server.js exists', () => {
  expect(fs.existsSync('server.js')).toBe(true);
});

test('index.html exists', () => {
  expect(fs.existsSync('public/index.html')).toBe(true);
});
