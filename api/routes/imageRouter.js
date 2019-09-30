const router = require('express').Router();
const mongoose = require('mongoose');
const Image = mongoose.model('Images');
const middleware = require('../Helpers/middleware');
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
const path = require('path');
const fs = require('fs');

app.get('/images', middleware.checkToken, async function(req, res) {
  try {
    const query = { sort: { firstName: 1 } };
    const image = await Image.find({}, null, query);
    res.json(image);
  } catch (err) {
    err.location = 'get `/images`';
    next(err);
  }
});

app.post('/images', middleware.checkToken, async function(req, res) {
  try {
    const newImage = new Image(req.body);
    const image = await newImage.save();
    res.json(image);
  } catch (err) {
    err.location = 'post `/images`';
    next(err);
  }
});

app.get('/images/:imageId', middleware.checkToken, async function(req, res) {
  try {
    const image = await Image.findById(req.params.imageId);
    res.json(image);
  } catch (err) {
    err.location = 'get `/images/:imageId`';
    next(err);
  }
});

app.post('/images/:imageId', middleware.checkToken, async function(req, res) {
  try {
    const newImage = req.body;
    const image = await Image.findByIdAndUpdate(req.params.imageId, newImage, {
      new: true
    });
    res.json(image);
  } catch (err) {
    err.location = 'post `/images/:imageId`';
    next(err);
  }
});

app.delete('/images/:imageId', middleware.checkToken, async function(req, res) {
  try {
    const image = await Image.findByIdAndRemove(req.params.imageId);
    const response = {
      message: 'Delete image id: ' + req.params.imageId + ' successfully',
      id: image._id
    };
    res.json(response);
  } catch (err) {
    err.location = 'delete `/images/:imageId`';
    next(err);
  }
});

app.get('/user_images/:userId', middleware.checkToken, async function(req, res) {
  try {
    const image = await Image.find({ userId: req.params.userId }, null);
    res.json(image);
  } catch (err) {
    err.location = 'get `/user_images/:userId`';
    next(err);
  }
});

app.post('/deletehandler', middleware.checkToken, async function(req, res) {
  try {
    await storage
      .bucket('imgur-1005')
      .file(req.body.gcloudObject)
      .delete();

    const image = await Image.findByIdAndRemove(req.body._id);
    const response = {
      message: 'Delete image id: ' + req.body._id + ' successfully',
      id: image._id
    };
    res.json(response);
  } catch (err) {
    err.location = 'post `/deletehandler`';
    next(err);
  }
});

app.post(
  '/uploadhandler/:userId',
  middleware.checkToken,
  middleware.upload.single('imageData'),
  middleware.sendUploadToGCS,
  async function(req, res) {
    try {
      const newImage = new Image({
        imageName: req.body.imageName,
        description: req.body.description,
        userId: req.params.userId,
        url: req.file.cloudStoragePublicUrl,
        gcloudObject: req.file.cloudStorageObject
      });
      const image = await newImage.save();
      res.json(image);
    } catch (err) {
      err.location = 'post `/uploadhandler/:userId`';
      next(err);
    }
  }
);

app.get('/downloadhandler/:imgName', middleware.checkToken, async function(req, res) {
  try {
    const options = {
      destination: './file.jpg'
    };
    await storage
      .bucket('imgur-1005')
      .file(req.params.imgName)
      .download(options);
    const file = path.join(__dirname, '../../file.jpg');

    res.download(file, function(err) {
      if (err) {
        next(err);
      } else {
        fs.unlinkSync('./file.jpg');
      }
    });
  } catch (err) {
    err.location = 'get `/downloadhandler/:imgName`';
    next(err);
  }
});

module.exports = router;
