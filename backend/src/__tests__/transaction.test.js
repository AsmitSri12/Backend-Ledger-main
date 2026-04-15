const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const userModel = require('../models/user.model');
const accountModel = require('../models/account.model');

describe('Transaction Endpoints', () => {
  let token;
  let fromAccountId;
  let toAccountId;

  beforeAll(async () => {
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test-ledger');
    }
    await userModel.deleteMany({});
    await accountModel.deleteMany({});
    
    // Create user and get token
    const resUser1 = await request(app).post('/api/auth/register').send({
      email: 'sender@example.com',
      name: 'Sender',
      password: 'password123',
    });
    token = resUser1.body.token;

    // Create accounts
    const resAcc1 = await request(app).post('/api/accounts').set('Cookie', [`token=${token}`]);
    fromAccountId = resAcc1.body.account._id;

    // We don't have funds in Acc1 but that's fine, we will just test logic structure.
    
    const resUser2 = await request(app).post('/api/auth/register').send({
      email: 'receiver@example.com',
      name: 'Receiver',
      password: 'password123',
    });
    const token2 = resUser2.body.token;
    
    const resAcc2 = await request(app).post('/api/accounts').set('Cookie', [`token=${token2}`]);
    toAccountId = resAcc2.body.account._id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should fail with missing data', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Cookie', [`token=${token}`])
      .send({
        amount: 50,
        idempotencyKey: 'key-1'
      });
    expect(res.statusCode).toEqual(400); // Validation failure
  });

  it('should not allow negative amounts', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Cookie', [`token=${token}`])
      .send({
        fromAccount: fromAccountId,
        toAccount: toAccountId,
        amount: -10,
        idempotencyKey: 'key-test'
      });
    expect(res.statusCode).toEqual(400);
  });
});
