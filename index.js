const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('express-flash');

const db = require('./connection/db');
const upload = require('./middlewares/uploadFile');

const app = express();
const PORT = 5000;

const isLogin = true;
let blogs = [];

app.set('view engine', 'hbs');

app.use(flash());

app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: 'secret',
    cookie: { maxAge: 1000 * 60 * 60 * 2 },
  })
);

app.use('/public', express.static(__dirname + '/public'));
app.use('/uploads', express.static(__dirname + '/uploads'));

app.use(express.urlencoded({ extended: false }));

app.get('/', function (req, res) {
  res.render('index');
});

app.get('/contact-me', function (req, res) {
  res.render('contact-me');
});

app.get('/blog', function (req, res) {
  // console.log('User session Login: ', req.session.isLogin ? true : false);
  // console.log('User : ', req.session.user ? req.session.user : {});

  db.connect(function (err, client, done) {
    if (err) throw err;

    let query = '';

    if (req.session.isLogin) {
      query = `SELECT tb_blog.*, tb_user.id as "user_id", tb_user.name, tb_user.email
                    FROM tb_blog LEFT JOIN tb_user 
                    ON tb_blog.author_id = tb_user.id WHERE tb_user.id=${req.session.user.id}`;
    } else {
      query = `SELECT tb_blog.*, tb_user.id as "user_id", tb_user.name, tb_user.email
                    FROM tb_blog LEFT JOIN tb_user 
                    ON tb_blog.author_id = tb_user.id`;
    }

    client.query(query, function (err, result) {
      if (err) throw err;
      done();

      // Perulangan/looping
      // Pengembalian data/return
      let dataBlogs = result.rows.map(function (data) {
        //   const user_id = data.user_id ? data.user_id : '-';
        //   const name = data.name ? data.name : '-';
        //   const email = data.email ? data.email : '-';

        const user_id = data.user_id;
        const name = data.name;
        const email = data.email;

        delete data.user_id;
        delete data.name;
        delete data.email;

        const PATH = 'http://localhost:5000/uploads/';

        return {
          ...data,
          post_at: getFullTime(data.post_at),
          duration: getDistanceTime(data.post_at),
          author: {
            user_id,
            name,
            email,
          },
          isLogin: req.session.isLogin,
          image: data.image ? PATH + data.image : null,
        };
      });

      console.log(dataBlogs);

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
    if (err) throw err;

    const query = `SELECT tb_blog.*, tb_user.id as "user_id", tb_user.name, tb_user.email
                    FROM tb_blog LEFT JOIN tb_user 
                    ON tb_blog.author_id = tb_user.id WHERE tb_blog.id=${id}`;

    client.query(query, function (err, result) {
      if (err) throw err;
      done();

      let blog = result.rows[0];

      blog = {
        ...blog,
        author: {
          user_id: blog.user_id,
          name: blog.name,
          email: blog.email,
        },
        post_at: getFullTime(blog.post_at),
      };

      delete blog.user_id;
      delete blog.name;
      delete blog.email;

      res.render('blog-detail', { blog });
    });
  });
});

app.get('/add-blog', function (req, res) {
  res.render('add-blog');
});

app.post('/add-blog', upload.single('image'), function (req, res) {
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

  if (data.image == '') {
    res.redirect('/add-blog');

    return console.log('Please insert image!');
  }

  db.connect(function (err, client, done) {
    if (err) throw err;

    const filename = req.file.filename;

    const query = `INSERT INTO tb_blog (title,content,image,author_id) 
                    VALUES ('${data.title}','${data.content}','${filename}','${req.session.user.id}')`;

    client.query(query, function (err, result) {
      if (err) throw err;
      done();
      res.redirect('/blog');
    });
  });
});

app.get('/delete-blog/:id', function (req, res) {
  let id = req.params.id;

  db.connect(function (err, client, done) {
    if (err) throw err;

    const query = `DELETE FROM tb_blog WHERE id=${id}`;

    client.query(query, function (err, result) {
      if (err) throw err;
      done();
      res.redirect('/blog');
    });
  });
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

    const query = `INSERT INTO tb_user(name,email,password) VALUES('${data.name}','${data.email}','${hashedPassword}')`;

    client.query(query, function (err, result) {
      if (err) throw err;
      done();
      req.flash('success', 'Success register your account!');
      res.redirect('/login');
    });
  });

  // res.redirect('register');
});

app.get('/login', function (req, res) {
  res.render('login');
});

app.post('/login', function (req, res) {
  const data = req.body;

  db.connect(function (err, client, done) {
    if (err) throw err;

    const query = `SELECT * FROM tb_user WHERE email = '${data.email}'`;

    client.query(query, function (err, result) {
      if (err) throw err;
      done();

      //Check account by email
      if (result.rows.length == 0) {
        req.flash('error', 'Email not found!');
        return res.redirect('/login');
      }

      const isMatch = bcrypt.compareSync(
        data.password,
        result.rows[0].password
      );

      // Check password
      if (isMatch == false) {
        req.flash('error', 'Wrong password!');
        return res.redirect('/login');
      } else {
        req.session.isLogin = true;
        req.session.user = {
          id: result.rows[0].id,
          email: result.rows[0].email,
          name: result.rows[0].name,
        };

        res.redirect('/blog');
      }
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
