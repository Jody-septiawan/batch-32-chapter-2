const express = require('express');

const db = require('./connection/db');

db.connect(function (err, _, done) {
  if (err) throw err;

  console.log('Database Connection Success');
  done();
});

const app = express();
const PORT = 5000;

// Boolean => true/false
const isLogin = true;

let blogs = [];

app.set('view engine', 'hbs');

app.use('/public', express.static(__dirname + '/public'));

app.use(express.urlencoded({ extended: false }));

app.get('/', function (req, res) {
  res.render('index');
});

app.get('/blog', function (req, res) {
  db.connect(function (err, client, done) {
    const query = 'SELECT * FROM tb_blog';

    client.query(query, function (err, result) {
      if (err) throw err;
      done();

      let data = result.rows;

      // Perulangan/looping
      // Mengembalikan data/return
      let dataBlogs = data.map(function (data) {
        let category;

        if (data.category) {
          category = data.category.find(function (item) {
            return item == 'Technology';
          });
        }

        return {
          ...data,
          post_at: getFullTime(data.post_at),
          duration: getDistanceTime(data.post_at),
          author: 'Jody Septiawan',
          isLogin,
          category: category,
        };
      });

      res.render('blog', { isLogin, blogs: dataBlogs });
    });
  });
});

app.get('/blog-detail/:id', function (req, res) {
  let id = req.params.id;

  db.connect(function (err, client, done) {
    const query = `SELECT * FROM tb_blog WHERE id=${id}`;

    client.query(query, function (err, result) {
      if (err) throw err;
      done();

      let data = result.rows[0];

      data = {
        ...data,
        post_at: getFullTime(data.post_at),
        author: 'Jody Septiawan',
      };

      res.render('blog-detail', { blog: data });
    });
  });
});

app.get('/blog-add', function (req, res) {
  res.render('blog-add');
});

app.post('/blog-add', function (req, res) {
  // post_at & author
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
  // data.post_at = new Date();
  // data.author = 'Jody Septiawan';

  if (data.title == '' || data.content == '' || data.image == '') {
    return res.redirect('/blog-add');
  }

  db.connect(function (err, client, done) {
    if (err) throw err;

    const query = `INSERT INTO tb_blog(title,content,image) VALUES('${data.title}','${data.content}','${data.image}')`;

    client.query(query, function (err, result) {
      if (err) throw err;
      done();
    });
  });

  res.redirect('/blog');
});

app.get('/blog-delete/:id', function (req, res) {
  let id = req.params.id;

  db.connect(function (err, client, done) {
    if (err) throw err;
    const query = `DELETE FROM tb_blog WHERE id=${id}`;

    client.query(query, function (err, result) {
      if (err) throw err;
      done();
    });
  });

  res.redirect('/blog');
});

app.get('/contact-me', function (req, res) {
  res.render('contact-me');
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

  let hour = time.getHours();
  let minute = time.getMinutes();

  let fullTime = `${date} ${month[monthIndex]} ${year} ${hour}:${minute} WIB`;

  return fullTime;
}

function getDistanceTime(time) {
  let timeNow = new Date();
  let timeBlog = new Date(time);

  let distance = timeNow - timeBlog; // miliseconds

  let dayDistance = Math.floor(distance / (24 * 60 * 60 * 1000));

  if (dayDistance != 0) {
    return dayDistance + ' day ago';
  } else {
    let hourDistance = Math.floor(distance / (60 * 60 * 1000));

    if (hourDistance != 0) {
      return hourDistance + ' hours ago';
    } else {
      let minuteDistance = Math.floor(distance / (60 * 1000));

      if (minuteDistance != 0) {
        return minuteDistance + ' minutes ago';
      } else {
        let secondsDistance = Math.floor(distance / 1000);

        return secondsDistance + ' second ago';
      }
    }
  }
}
