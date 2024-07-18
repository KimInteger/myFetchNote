import http from 'http';
import fs from 'node:fs';
import fetch from 'node-fetch';
import qs from 'querystring'

const PORT = 3000;

// 서버 생성
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

      // body를 JSON으로 파싱
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

      // dbServer로 데이터 전송
      fetch('http://localhost:8000/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedData), // 이미 JSON 객체이므로 그대로 전송
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Response error!');
          }
          return response.json();
        })
        .then((data) => {
          console.log('Perfect! Fetch!', data);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(data));
        })
        .catch((err) => {
          console.error('This is error', err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Server error');
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