const jwt = require('jsonwebtoken');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();

let checkToken = (req, res, next) => {
  if (req.url == '/login' && req.method == 'POST') return next();
  if (req.path == '/users' && req.method == 'POST') return next();

  let token = req.headers['authorization'];
  if (token) {
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    }
    jwt.verify(token, 'secret', (err, decoded) => {
      if (err) {
        console.log('ERR');
        return res.status(401).json({
          success: false,
          location: 'middleware checkToken',
          message: 'Token is not valid'
        });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.status(401).json({
      success: false,
      location: 'middleware checkToken',
      message: 'Auth token is not supplied'
    });
  }
};

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

let upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

function sendUploadToGCS(req, res, next) {
  if (!req.file) {
    res.status(400).send({
      location: 'middleware sendUploadToGCS',
      message: 'No file to upload'
    });
    return;
  }
  const bucket = storage.bucket('imgur-1005');

  // Create a new blob in the bucket and upload the file data.
  console.log('sendUploadToGCS');
  const gcsname = Date.now() + req.file.originalname;
  const file = bucket.file(gcsname);
  const stream = file.createWriteStream();

  stream.on('error', err => {
    err.location = 'middleware sendUploadToGCS';
    next(err);
  });
  stream.on('finish', () => {
    req.file.cloudStorageObject = gcsname;
    file.makePublic().then(() => {
      req.file.cloudStoragePublicUrl = 'https://storage.cloud.google.com/imgur-1005/' + gcsname;
      next();
    });
  });
  stream.end(req.file.buffer);
}

module.exports = {
  checkToken: checkToken,
  upload: upload,
  sendUploadToGCS: sendUploadToGCS
};
