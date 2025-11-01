import * as request from 'supertest';
import { TestSetup } from './helpers/test-setup';

describe('Wallet e Segurança - E2E', () => {
  const setup = new TestSetup();
  let authToken: string;

  beforeAll(async () => {
    await setup.init();
    await setup.cleanDatabase();

    // Criar usuário
    await request(setup.app.getHttpServer()).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'senha123',
      confirmPassword: 'senha123',
    });

    const login = await request(setup.app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'senha123',
      });
    authToken = login.body.access_token;
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  describe('GET /api/wallet', () => {
    it('não deve acessar wallet sem autenticação', async () => {
      const response = await request(setup.app.getHttpServer()).get(
        '/api/wallet',
      );

      expect(response.status).toBe(401);
    });

    it('deve acessar wallet com autenticação', async () => {
      const response = await request(setup.app.getHttpServer())
        .get('/api/wallet')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('available');
      expect(response.body).toHaveProperty('pending');
    });
  });

  describe('GET /api/wallet/transactions', () => {
    it('não deve acessar transações sem autenticação', async () => {
      const response = await request(setup.app.getHttpServer()).get(
        '/api/wallet/transactions',
      );

      expect(response.status).toBe(401);
    });

    it('deve acessar transações com autenticação', async () => {
      const response = await request(setup.app.getHttpServer())
        .get('/api/wallet/transactions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});

