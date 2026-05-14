import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/db.js';

describe('Auth API', () => {
  const testUser = {
    email: 'test_auth@example.com',
    password: 'password123',
    fullName: 'Test Auth User'
  };

  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
  });

  it('should sign up a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send(testUser);
      
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', testUser.email);
  });

  it('should not allow duplicate email signup', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send(testUser);
      
    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
  });

  it('should login the user and return a token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('token');
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword'
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
  });
});
