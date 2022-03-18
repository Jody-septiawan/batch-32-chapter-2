const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('express-flash');

const db = require('./connection/db');

db.connect(function (err, _, done) {
  if (err) throw err;

  console.log('Database Connection Success');
  done();
});

const app = express();
const PORT = 5000;

// Boolean => true/false
const isLogin = false;

let blogs = [];

app.set('view engine', 'hbs');
app.use(flash());
app.use(
  session({
    secret: 'rahasia',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 2 },
  })
);

app.use('/public', express.static(__dirname + '/public'));

app.use(express.urlencoded({ extended: false }));

app.get('/', function (req, res) {
  res.render('index');
});

app.get('/blog', function (req, res) {
  console.log('Session isLogin: ', req.session.isLogin);
  console.log('Session user: ', req.session.user);

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
          isLogin: req.session.isLogin,
          category: category,
        };
      });

      res.render('blog', {
        user: req.session.user,
        isLogin: req.session.isLogin,
        blogs: dataBlogs,
      });
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

app.get('/register', function (req, res) {
  res.render('register');
});

app.post('/register', function (req, res) {
  const data = req.body;

  if (data.name == '' || data.email == '' || data.password == '') {
    req.flash('error', 'Please insert all field!');
    return res.redirect('/register');
  }

  const hashedPassword = bcrypt.hashSync(data.password, 10);

  db.connect(function (err, client, done) {
    if (err) throw err;

    const query = `INSERT INTO tb_user(name,email,password) VALUES ('${data.name}','${data.email}','${hashedPassword}')`;

    client.query(query, function (err, result) {
      if (err) throw err;

      req.flash('success', 'Success register your account!');
      res.redirect('/login');
    });
  });
});

app.get('/login', function (req, res) {
  res.render('login');
});

app.post('/login', function (req, res) {
  const data = req.body;

  if (data.email == '' || data.password == '') {
    req.flash('error', 'Please insert all field!');
    return res.redirect('/login');
  }

  db.connect(function (err, client, done) {
    if (err) throw err;

    const query = `SELECT * FROM tb_user WHERE email = '${data.email}'`;

    client.query(query, function (err, result) {
      if (err) throw err;

      // Check account by email
      if (result.rows.length == 0) {
        console.log('Email not found!');
        return res.redirect('/login');
      }

      // Check password
      const isMatch = bcrypt.compareSync(
        data.password,
        result.rows[0].password
      );

      if (isMatch == false) {
        console.log('Wrong Password!');
        return res.redirect('/login');
      }

      req.session.isLogin = true;
      req.session.user = {
        id: result.rows[0].id,
        email: result.rows[0].email,
        name: result.rows[0].name,
      };

      res.redirect('/blog');
    });
  });
});

app.get('/logout', function (req, res) {
  req.session.destroy();
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
