const sqlite3 = require('sqlite3');
const http = require('http');

const PORT = 8000;
const DB_PATH = './test.db';

function openDB() {
  return new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Error opening database:', err);
    } else {
      console.log('Database opened successfully');
    }
  });
}

function insertUser(db, userName, callback) {
  db.serialize(() => {
    const stmt = db.prepare('INSERT INTO user (name) VALUES (?)');
    stmt.run(userName, (err) => {
      if (err) {
        console.error('Error inserting data:', err);
        callback(err);
      } else {
        console.log('Data inserted successfully');
        callback(null);
      }
      stmt.finalize();
    });
  });
}

function handlePostRequest(req, res) {
  let body = '';

  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  req.on('end', () => {
    try {
      const postData = JSON.parse(body);
      const userName = postData.name;

      const db = openDB();

      insertUser(db, userName, (err) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ response: 'success' }));
        }
        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err);
          } else {
            console.log('Database closed successfully');
          }
        });
      });
    } catch (error) {
      console.error('Invalid JSON received:', error);
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Bad Request');
    }
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/save') {
    handlePostRequest(req, res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
