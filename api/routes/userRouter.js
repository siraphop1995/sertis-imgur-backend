const router = require('express').Router();
const mongoose = require('mongoose');
const User = mongoose.model('Users');
const bcrypt = require('bcrypt');
const middleware = require('../Helpers/middleware');

//read all
app.get('/users', middleware.checkToken, async function(req, res, next) {
  try {
    const query = { sort: { firstName: 1 } };
    const user = await User.find({}, null, query);
    res.json(user);
  } catch (err) {
    err.location = 'get `/users`';
    next(err);
  }
});

//create
app.post('/users', middleware.checkToken, async function(req, res, next) {
  try {
    let newUser = new User(req.body);
    newUser.password = bcrypt.hashSync(req.body.password, 10);
    const user = await newUser.save();
    user.password = undefined;
    return res.json(user);
  } catch (err) {
    if (err.code == 11000) {
      return res.status(409).json({ message: 'username already exist', location: 'post `/users`' });
    }
    err.location = 'post `/users`';
    next(err);
  }
});

//read one
app.get('/users/:userId', middleware.checkToken, async function(req, res) {
  try {
    const user = await User.findById(req.params.userId);
    res.json(user);
  } catch (err) {
    err.location = 'get `/users/:userId`';
    next(err);
  }
});

//update
app.post('/users/:userId', middleware.checkToken, async function(req, res) {
  try {
    let newUser = req.body;
    const user = await User.findByIdAndUpdate(req.params.userId, newUser, { new: true });
    res.json(user);
  } catch (err) {
    err.location = 'post `/users/:userId`';
    next(err);
  }
});

//delete
app.delete('/users/:userId', middleware.checkToken, async function(req, res) {
  try {
    const user = await User.findByIdAndRemove(req.params.userId);
    const response = {
      message: 'Delete user id: ' + req.params.userId + ' successfully',
      id: user._id
    };
    res.json(response);
  } catch (err) {
    err.location = 'delete `/users/:userId`';
    next(err);
  }
});

module.exports = router;
