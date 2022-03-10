const express = require('express');

const app = express();
const PORT = 5008;

app.get('/', function (request, response) {
  const greeting = {
    message: 'Halo my name is Abdur',
  };
  response.send(greeting);
});

app.get('/blog', function (request, response) {
  const blog = [
    {
      title: 'Golang',
      content: 'Golang adalah ...',
    },
    {
      title: 'Javascript',
      content: 'Javascript adalah ...',
    },
    {
      title: 'Python',
      content: 'Python adalah ...',
    },
  ];
  response.send(blog);
});

app.get('/contact-me', function (request, response) {
  const data = {
    message: 'Halo, please contact me',
  };
  response.send(data);
});

app.listen(PORT, function () {
  console.log(`Server starting on PORT: ${PORT}`);
});
