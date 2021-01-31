const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');

const router = new express.Router();

router.post('/tasks', auth, async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      owner: req.user._id
    });
    await task.save();
    res.status(201).send(task);
  } catch(e) {
    res.status(400).send(e);
  }
});

// Use query param GET /tasks?completed=true
// GET /tasks?limit=10&skip=20 (ex - third page by skipping first 20 results)
// Get /tasks?sortBy=createdAt_desc
router.get('/tasks', auth, async (req, res) => {
  const match = {};
  const sort = {};
  if(req.query.completed) {
    match.completed = req.query.completed === 'true' ? true : false;
  }
  if(req.query.sortBy) {
    const parts = req.query.sortBy.split('_');
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
  }
  try {
    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(req.query.limit), // Mongoose ignores if limit is not a number or doesn't exist
        skip: parseInt(req.query.skip),
        sort
      }
    }).execPopulate();
    res.send(req.user.tasks);
  } catch(e) {
    res.status(500).send(e);
  }
});

router.get('/tasks/:id', auth, async (req, res) => {
  try {
    const _id = req.params.id;
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      res.status(404).send();
    }
    res.send(task);
  } catch(e) {
    res.status(500).send(e);
  }
});

router.patch('/tasks/:id', auth, async (req, res) => {
  const allowedUpdateFields = ['description', 'completed'];
  const receivedUpdateFields = Object.keys(req.body);
  const isValid = receivedUpdateFields.every(field => allowedUpdateFields.includes(field));
  if (!isValid) {
    res.status(400).send('Invalid update request');
  }
  try {
    // const task = await Task.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true });
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
  
    if(!task) {
      res.status(404).send();
    }
    receivedUpdateFields.forEach(update => task[update] = req.body[update]);
    await task.save();
    res.send(task);
  } catch(e) {
    res.status(500).send(e);
  }
});

router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const _id = req.params.id;
    const task = await Task.findOneAndDelete({ _id, owner: req.user._id });
    if (!task) {
      res.status(404).send();
    }
    res.send(task);
  } catch(e) {
    res.status(500).send(e);
  }
});

module.exports = router;