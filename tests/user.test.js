const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../src/models/user');

const userOneID = new mongoose.Types.ObjectId();
const userOne = {
  _id: userOneID,
  name: 'testUser',
  email: 'testUser@example.com',
  password: 'Nachos@mexico',
  tokens:[{
    token: jwt.sign({_id: userOneID}, process.env.JWT_SECRET)
  }]
}
beforeEach(async () => {
  await User.deleteMany({});
  await new User(userOne).save();
});

test('should signup a new user', async() => {
  await request(app).post('/users').send({
    name: 'Jio',
    email: 'jio@riolo.com',
    password: 'Jackie@Deli'
  }).expect(201);
});

test('Should login existing user', async() => {
  await request(app).post('/users/login').send({
    email: userOne.email,
    password: userOne.password
  }).expect(200);
});

test('Should get profile', async() => {
  await request(app).get('/users/me')
  .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
  .send()
  .expect(200);
});