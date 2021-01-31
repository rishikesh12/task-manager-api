// CRUD operations

const { MongoClient, ObjectID } = require('mongodb');

const connectionURL = process.env.MONGODB_URL;
const databaseName = 'task-manager';

MongoClient.connect(connectionURL,  { useNewUrlParser: true }, (err, client) => {
  if(err) {
    console.log('Unable to connect', err.toString());
    return;
  }
  const db = client.db(databaseName);
  db.collection('users').insertOne({
    name: 'Vikram',
    age: 25
  }, (err, result) => {
    if(err) {
      console.log(err);
      return;
    }
    console.log(result.ops);
  });
  db.collection('users').insertMany([
    {
      name: 'Rio',
      age: 21
    },
    {
      name: 'Gunther',
      age: 15
    }
  ], (err, result) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(result.ops);
  })
  db.collection('tasks').insertMany([
    {
      description: 'Life long learning',
      completed: false
    },
    {
      description: 'Daily Routine',
      completed: false
    },
    {
      description: 'CI',
      completed: true
    }
  ], (err, result) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(result.ops);
  });

  db.collection('users').findOne({_id: new ObjectID('600842f2391e1f59f09919fa')}, (err, result) => {
    if(err) {
      return console.log('Unable to find user');
    }
    console.log(result);
  });

  db.collection('users').find({age: 30}).toArray((err, users) => {
    if (err) {
      return console.log(error);
    }
    console.log(users);
  });

  const updatePromise = db.collection('users').updateOne({
    _id: new ObjectID('600707576aa99d40b03a933a')
  }, {
    $inc: {
      age: -1
    }
  });

  updatePromise.then(result => {
    console.log(result.matchedCount);
  }).catch(error => {
    console.log(error);
  });

  db.collection('tasks').updateMany({
    completed: false
  }, {
    $set: {
      completed: true
    }
  }).then(result => {
    console.log(result.modifiedCount);
  }).catch(error => {
    console.log(error);
  });

  db.collection('tasks').deleteOne({
    description: 'CI'
  }).then(result => {
    console.log(result.deletedCount);
  }).catch(error => {
    console.log(error);
  });

  db.collection('users').deleteMany({
    age: 25
  }).then(result => {
    console.log(result.deletedCount);
  }).catch(error => {
    console.log(error);
  });

});