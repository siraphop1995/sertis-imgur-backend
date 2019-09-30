const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

app = express();
port = process.env.PORT || 3000;

User = require('./api/models/userListModel');
Image = require('./api/models/imageListModel');

mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);
mongoose.connect(
  'mongodb+srv://siraphop95:sira123456@cluster0-yejh3.gcp.mongodb.net/imgur?retryWrites=true&w=majority',
  { useNewUrlParser: true },
  function(error) {
    if (error) throw error;
    console.log('Successfully connected');
  }
);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const authRouter = require('./api/routes/authRouter');
const userRouter = require('./api/routes/userRouter');
const imageRouter = require('./api/routes/imageRouter');

app.use(authRouter);
app.use(userRouter);
app.use(imageRouter);


app.use(errorHandler)

function errorHandler (err, req, res, next) {
  console.error(err)
  let newError = {
    message: err.message,
    location: err.location
  }
  res.status(500).send(newError);
}

app.listen(port);

console.log('Server started on : ' + port);
