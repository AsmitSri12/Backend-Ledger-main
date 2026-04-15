const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const userModel = require('../models/user.model');

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    // Connect to a test DB if not already connected
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test-ledger');
    }
    // Clean up
    await userModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'testuser@example.com',
        name: 'Test User',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
  });

  it('should not register user with existing email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'testuser@example.com',
        name: 'Test User 2',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(422);
  });

  it('should login an existing user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });
});
