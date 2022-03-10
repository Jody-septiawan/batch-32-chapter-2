const express = require('express');

const app = express();
const PORT = 5000;

app.get('/', function (request, response) {
  response.send('Hello World');
});

app.get('/home', function (request, response) {
  response.send('Ini halaman home');
});

app.get('/blog', function (request, response) {
  response.send('Ini halaman blog');
});

app.get('/contact-me', function (request, response) {
  response.send('Ini halaman Contact Me');
});

app.listen(PORT, function () {
  console.log(`Server starting on PORT: ${PORT}`);
});
