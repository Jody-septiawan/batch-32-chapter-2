const express = require('express');

const db = require('./connection/db');

const app = express();
const PORT = 5000;

const isLogin = true;
let blogs = [];

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
  db.connect(function (err, client, done) {
    if (err) throw err;

    const query = 'SELECT * FROM tb_blog';
    client.query(query, function (err, result) {
      if (err) throw err;

      console.log(result.rows);

      // Perulangan/looping
      // Pengembalian data/return
      let dataBlogs = result.rows.map(function (data) {
        return {
          ...data,
          post_at: getFullTime(data.post_at),
          duration: getDistanceTime(data.post_at),
          author: 'Jody Septiawan',
          isLogin,
        };
      });

      console.log(dataBlogs);

      res.render('blog', { isLogin, blogs: dataBlogs });
    });
  });
});

app.get('/blog-detail/:id', function (req, res) {
  let id = req.params.id;

  db.connect(function (err, client, done) {
    if (err) throw err;

    const query = `SELECT * FROM tb_blog WHERE id=${id}`;

    client.query(query, function (err, result) {
      if (err) throw err;

      console.log(result.rows);

      let blog = result.rows[0];

      console.log(blog);

      blog = {
        ...blog,
        author: 'Jody Septiawan',
        post_at: getFullTime(blog.post_at),
      };

      res.render('blog-detail', { blog });
    });
  });
});

app.get('/add-blog', function (req, res) {
  res.render('add-blog');
});

app.post('/add-blog', function (req, res) {
  // Cara 1
  // let data = {
  //   title: req.body.title,
  //   content: req.body.content,
  //   image: req.body.image,
  //   post_at: new Date(),
  //   author: 'Jody Septiawan',
  // };

  // Cara 2
  let data = req.body;
  data.post_at = new Date();
  data.author = 'Jody Septiawan';

  blogs.push(data);
  res.redirect('/blog');
});

app.get('/delete-blog/:index', function (req, res) {
  let index = req.params.index;
  blogs.splice(index, 1);
  res.redirect('/blog');
});

app.listen(PORT, function () {
  console.log(`Server starting on PORT: ${PORT}`);
});

function getFullTime(time) {
  let month = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  let date = time.getDate();
  let monthIndex = time.getMonth();

  let year = time.getFullYear();

  let hours = time.getHours();
  let minutes = time.getMinutes();

  let fullTime = `${date} ${month[monthIndex]} ${year} ${hours}:${minutes} WIB`;

  return fullTime;
}

function getDistanceTime(time) {
  let timeNow = new Date();
  let timeBlog = new Date(time);

  let distance = timeNow - timeBlog; // miliseconds

  let dayDistance = Math.floor(distance / (24 * 60 * 60 * 1000)); // convert to day

  if (dayDistance != 0) {
    return dayDistance + ' day ago';
  } else {
    let hourDistance = Math.floor(distance / (60 * 60 * 1000));
    if (hourDistance != 0) {
      return hourDistance + ' hours ago';
    } else {
      let minuteDistance = Math.floor(distance / (60 * 1000));
      if (minuteDistance != 0) {
        return minuteDistance + ' minute ago';
      } else {
        let secondDistance = Math.floor(distance / 1000);
        return secondDistance + ' seconds ago';
      }
    }
  }
}
