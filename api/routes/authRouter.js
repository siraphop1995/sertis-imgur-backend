const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

app.post('/login', async function(req, res) {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res.status(401).json({ message: 'Username and password does not match' });
    }
    if (!bcrypt.compareSync(req.body.password, user.password)) {
      return res.status(401).json({ message: 'Username and password does not match' });
    }

    let token = jwt.sign({ user }, 'secret', {
      expiresIn: '7d'
    });

    user.password = undefined;

    return res.status(200).json({
      user,
      message: 'Authenticated! Use this token in the Authorization header',
      token: token
    });
  } catch (err) {
    err.location = 'post `/login`';
    next(err);
  }
});

app.get('/test', async function(req, res) {
  res.status(200).json({text:'test'})
});

module.exports = router;
