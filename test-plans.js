const http = require('http');

http.get('http://localhost:5000/api/payments/plans', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Plans:', data));
});
http.get('http://localhost:5000/api/payments/packs', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Packs:', data));
});
