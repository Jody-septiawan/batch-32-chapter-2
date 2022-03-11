const express = require('express');

const app = express();
const PORT = 5000;

// Boolean => true/false
const isLogin = true;

app.set('view engine', 'hbs');

app.use('/public', express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: false }));

app.get('/', function (req, res) {
  res.render('index');
});

app.get('/blog', function (req, res) {
  res.render('blog', { isLogin });
});

app.get('/blog-detail/:id', function (req, res) {
  let id = req.params.idBlog;
  res.render('blog-detail', { id });
});

app.get('/blog-add', function (req, res) {
  res.render('blog-add');
});

app.post('/blog-add', function (req, res) {
  console.log(req.body);
  console.log(req.body.title);
  console.log(req.body.content);
  console.log(req);
  res.redirect('/blog');
});

app.get('/contact-me', function (req, res) {
  res.render('contact-me');
});

app.listen(PORT, function () {
  console.log(`Server starting on PORT: ${PORT}`);
});
