const http = require('http');

const fs = require('fs');

const qs = require('querystring')

const PORT = 3000;

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    fs.readFile('./index.html', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else if (req.method === 'POST' && req.url === '/test') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      console.log('Received data:', body);

      let parsedData;
      try {
        parsedData = qs.parse(body);
        console.log(parsedData);
        console.log(JSON.stringify(parsedData));
      } catch (err) {
        console.error('Invalid JSON received:', err);
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Bad Request');
        return;
      }

      async function fetchTest() {
        console.log( 'in func')
        const response = await fetch('http://localhost:8000/save',{
          method : 'POST',
          headers : {"Content-Type":"application/json"},
          body : JSON.stringify(parsedData),
        })
        try {
          if(!response.ok) {
            res.writeHead(500,{"Content-Type":"application/json"});
            res.end('Error Server');
          }
          let data = await response.json();
          console.log('success Fetch', data);
          res.writeHead(200,{"Content-Type":"application/json"});
          res.end(JSON.stringify(data));
        }
        catch(err){
          console.error('This is error', err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Server error');
        }
      }
      fetchTest();
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});