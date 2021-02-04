const mongoose = require('mongoose');

const url = (process.env.TEST) ? (process.env.MONGODB_URL + '/task-manager-api-test') : (process.env.MONGODB_URL + '/task-manager-api');

mongoose.connect(`${url}`, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
});
