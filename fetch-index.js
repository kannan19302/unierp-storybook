const http = require('http');

http.get('http://localhost:6006/index.json', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      const keys = Object.keys(parsed.entries).filter(k => k.includes('stat'));
      console.log("Matching keys:", keys);
    } catch (e) {
      console.error(e);
    }
  });
});
