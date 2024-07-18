const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = 3000;
const fetch = require('node-fetch')

// 서버 생성
const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
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
      // dbServer로 데이터 전송
      fetch('http://localhost:8000/save',{
        method : 'POST',
        headers : {'Content-Type' : 'application/json'},
        body : JSON.stringify({data : body}),
      })
      .then((res)=>{
        if(!res.ok){
          throw new Error('response error!');
        }
        return res.json();
      })
      .then((data)=>{
        console.log('perfect! fetch!', data);
        res.writeHead(200,{"Content-Type":"application/json"});
        res.end(data);
      })
      .catch((err)=>{
        console.error('this is error', err);
        res.writeHead(500,{'Content-Type':'text/plain'});
        res.end('server error')
      })
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
