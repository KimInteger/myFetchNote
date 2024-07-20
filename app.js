const http = require('http');

const fs = require('fs');

const qs = require('querystring')

const PORT = 3000;

const xhr2 = require('xhr2');

const server = http.createServer((req, res) => {
  console.log(req.method);
  console.log(req.url);
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
      let parseData;
      try {
        parseData = qs.parse(body);
      } catch (err) {
        res.writeHead(400,{"Content-Type":"text/plain"});
        res.end('Bad Request');
        return;
      }
      const xhr = new xhr2.XMLHttpRequest();
      xhr.open('http://localhost:8000/test','POST')
      xhr.setRequestHeader('Content-Type','application/json');

      xhr.onreadystatechange = function() {
        if(xhr.readyState === 4) {
          res.writeHead(200,{"Content-Type":"application/json"});
          res.end(xhr.responseText);
        } else {
          res.writeHead(500,{"Content-Type":"application/json"});
          res.end(JSON.stringify({error : "Server error"}));
        }
      }

      xhr.send(JSON.stringify(parseData));

    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});