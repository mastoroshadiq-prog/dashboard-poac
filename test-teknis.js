// Quick test script for Dashboard Teknis endpoint
const http = require('http');

const url = 'http://localhost:3000/api/v1/dashboard/teknis';

const req = http.get(url, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n' + '='.repeat(60));
    console.log('RESPONSE FROM:', url);
    console.log('='.repeat(60));
    console.log(JSON.stringify(JSON.parse(data), null, 2));
    console.log('='.repeat(60));
  });
});

req.on('error', (err) => {
  console.error('ERROR:', err.message);
});
