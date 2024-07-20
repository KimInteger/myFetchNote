import http from 'http'
import sqlite3 from 'sqlite3'

const PORT = 8000;
const db = new sqlite3.Database('./test.db');

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS user (name TEXT)');
});

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/save') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const postData = JSON.parse(body);
      const userName = postData.data;

      db.serialize(() => {
        const stmt = db.prepare('INSERT INTO user (name) VALUES (?)');
        stmt.run(userName, (err) => {
          if (err) {
            console.error('Error inserting data:', err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
            return;
          }
          console.log('Data inserted successfully');
          res.writeHead(200, { 'Content-Type': 'application:json' });
          res.end({"response":"success"});
        });
        stmt.finalize();
      });
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
