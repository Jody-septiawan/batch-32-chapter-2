const express = require('express');

const app = express();
const PORT = 5000;

const isLogin = true;

app.set('view engine', 'hbs');

app.use('/public', express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: false }));

app.get('/', function (req, res) {
  res.render('index');
});

app.get('/contact-me', function (req, res) {
  res.render('contact-me');
});

app.get('/blog', function (req, res) {
  res.render('blog', { isLogin });
});

app.get('/blog-detail/:id', function (req, res) {
  let id = req.params.id;
  console.log(id);
  res.render('blog-detail', { id: id });
});

app.get('/add-blog', function (req, res) {
  res.render('add-blog');
});

app.post('/add-blog', function (req, res) {
  let title = req.body.title;
  console.log(title);
});

app.listen(PORT, function () {
  console.log(`Server starting on PORT: ${PORT}`);
});
