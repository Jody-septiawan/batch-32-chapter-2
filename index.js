const express = require('express');

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
  // Perulangan/looping
  // Pengembalian data/return
  let dataBlogs = blogs.map(function (data) {
    return {
      ...data,
      post_at: getFullTime(data.post_at),
      duration: getDistanceTime(data.post_at),
      isLogin,
    };
  });

  res.render('blog', { isLogin, blogs: dataBlogs });
});

app.get('/blog-detail/:index', function (req, res) {
  let index = req.params.index;

  let blog = blogs[index];

  if (blog) {
    blog = {
      ...blog,
      post_at: getFullTime(blog.post_at),
    };
  } else {
    return res.redirect('/blog');
  }

  res.render('blog-detail', { blog });
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
