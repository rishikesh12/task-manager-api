const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const auth = require('../middleware/auth');


const router = new express.Router();

router.post('/users', async (req, res) => {
  try {
     const user = new User(req.body);
     await user.save();
     const token = await user.generateAuthToken();
     res.status(201).send({user, token});
  } catch(e) {
    res.status(400).send(e);
  }
});

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch(e) {
    res.status(400).send(e.toString());
  }
});

router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
    await req.user.save();
    res.send(200);
  } catch(e) {
    res.status(500).send();
  }
});

router.post('/users/logoutall', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send(200);
  } catch(e) {
    res.status(500).send();
  }
});

const upload = new multer({
  limits: {
    fileSize: 1e6 //size in bytes
  },
  fileFilter(req, file, cb) {
    if(!file.originalname.match(/\.(jpg| jpeg|png)$/)) {
      cb(new Error('Upload an image'));
    }
    cb(undefined, true);
  }
});

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  const buffer = await sharp(req.file.buffer).resize({ width: 250 , height: 250 }).png().toBuffer();
  req.user.avatar = buffer;
  await req.user.save();
  res.send();
}, (error, req, res, next) => {
  res.send({ error: error.message });
});

router.delete('/users/me/avatar', auth, async (req,res) => {
  if(!req.user.avatar) {
    res.status(400).send();
  }
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if(!user || ! user.avatar) {
      throw new Error();
    }

    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch(e) {
    res.status(404).send();
  }
})

router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password', 'age'];
  const isValidOperation =  updates.every(update => allowedUpdates.includes(update));
  if (!isValidOperation) {
    res.status(400).send('Error: Invalid update');
  }
  try {
    updates.forEach(update => req.user[update] = req.body[update]);
    await req.user.save();

    res.send(req.user);
  } catch(e) {
    res.status(400).send(e);
  }
});

router.delete('/users/me', auth, async (req, res) => {
  try {
    // const _id = req.user._id;
    // const user = await User.findByIdAndDelete(_id);
    // if(!user) {
    //   res.status(404).send('User not found');
    // }
    await req.user.remove();
    res.send(req.user);
  } catch(e) {
    res.status(500).send(e);
  }
});

module.exports = router;