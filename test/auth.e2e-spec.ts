import * as request from 'supertest';
import { TestSetup } from './helpers/test-setup';

describe('Autenticação - E2E', () => {
  const setup = new TestSetup();
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    await setup.init();
    await setup.cleanDatabase();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  describe('POST /api/auth/register', () => {
    it('deve registrar um novo usuário', async () => {
      const response = await request(setup.app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'senha123',
          confirmPassword: 'senha123',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      userId = response.body.id;
    });

    it('não deve registrar usuário com email duplicado', async () => {
      const response = await request(setup.app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Duplicate User',
          email: 'test@example.com',
          password: 'senha123',
          confirmPassword: 'senha123',
        });

      expect([400, 401, 409]).toContain(response.status);
    });

    it('não deve registrar usuário com senhas diferentes', async () => {
      const response = await request(setup.app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Test User 2',
          email: 'test2@example.com',
          password: 'senha123',
          confirmPassword: 'senha456',
        });

      expect([400, 401]).toContain(response.status);
    });
  });

  describe('POST /api/auth/login', () => {
    it('deve fazer login e retornar JWT token', async () => {
      const response = await request(setup.app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'senha123',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('access_token');
      authToken = response.body.access_token;
    });

    it('não deve fazer login com senha incorreta', async () => {
      const response = await request(setup.app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'senhaerrada',
        });

      expect(response.status).toBe(401);
    });

    it('não deve fazer login com email inexistente', async () => {
      const response = await request(setup.app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'naoexiste@example.com',
          password: 'senha123',
        });

      expect(response.status).toBe(401);
    });
  });
});
