const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/opportunities/discover',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Status:', res.statusCode, '\nBody:', data));
});

req.on('error', e => console.error(e));
req.write(JSON.stringify({ projectId: 'proj_1781780786278' }));
req.end();
