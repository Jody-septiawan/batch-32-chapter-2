const multer = require('multer');

// Initialization multer diskstorage

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads'); // File storage location
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Rename file
  },
});

const upload = multer({
  storage: storage,
});

module.exports = upload;
