const fs = require('fs');
const assert = require('assert');
assert.ok(fs.existsSync('server.js'), 'server.js should exist');
assert.ok(fs.existsSync('public/index.html'), 'index.html should exist');
console.log('All tests passed');
