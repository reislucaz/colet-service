import * as request from 'supertest';
import { TestSetup } from './helpers/test-setup';

describe('Ofertas e Validações - E2E', () => {
  const setup = new TestSetup();
  let authToken: string;
  let authToken2: string;
  let userId: string;
  let productId: string;
  let chatId: string;
  let offerId: string;

  beforeAll(async () => {
    await setup.init();
    await setup.cleanDatabase();
    await setup.createTestCategory();

    // Criar usuário 1 (vendedor)
    const user1 = await request(setup.app.getHttpServer())
      .post('/api/auth/register')
      .send({
        name: 'Seller User',
        email: 'seller@example.com',
        password: 'senha123',
        confirmPassword: 'senha123',
      });
    userId = user1.body.id;

    const login1 = await request(setup.app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'seller@example.com',
        password: 'senha123',
      });
    authToken = login1.body.access_token;

    // Criar usuário 2 (comprador)
    await request(setup.app.getHttpServer()).post('/api/auth/register').send({
      name: 'Buyer User',
      email: 'buyer@example.com',
      password: 'senha123',
      confirmPassword: 'senha123',
    });

    const login2 = await request(setup.app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'buyer@example.com',
        password: 'senha123',
      });
    authToken2 = login2.body.access_token;

    // Criar produto
    const product = await request(setup.app.getHttpServer())
      .post('/api/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Notebook Dell',
        description: 'Notebook para reciclagem',
        price: 250.0,
        recurring: false,
        category: 'test-category-id',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
      });
    productId = product.body.id;

    // Criar chat
    const chat = await request(setup.app.getHttpServer())
      .post('/api/chats')
      .set('Authorization', `Bearer ${authToken2}`)
      .send({
        productId: productId,
        sellerId: userId,
      });
    chatId = chat.body.id;
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  describe('POST /api/offers/chat/:chatId', () => {
    it('deve criar oferta com valor válido', async () => {
      const response = await request(setup.app.getHttpServer())
        .post(`/api/offers/chat/${chatId}`)
        .set('Authorization', `Bearer ${authToken2}`)
        .send({
          chatId: chatId,
          amount: 180.0,
          productId: productId,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.amount).toBe(180.0);
      offerId = response.body.id;
    });

    it('não deve criar oferta com valor zero', async () => {
      const response = await request(setup.app.getHttpServer())
        .post(`/api/offers/chat/${chatId}`)
        .set('Authorization', `Bearer ${authToken2}`)
        .send({
          chatId: chatId,
          amount: 0,
          productId: productId,
        });

      expect(response.status).toBe(400);
    });

    it('não deve criar oferta com valor negativo', async () => {
      const response = await request(setup.app.getHttpServer())
        .post(`/api/offers/chat/${chatId}`)
        .set('Authorization', `Bearer ${authToken2}`)
        .send({
          chatId: chatId,
          amount: -50,
          productId: productId,
        });

      expect(response.status).toBe(400);
    });

    it('não deve permitir usuário fazer oferta ao próprio produto', async () => {
      // Tentar criar oferta no chat existente, mas o sistema deve validar
      // que o usuário é o dono do produto
      const response = await request(setup.app.getHttpServer())
        .post(`/api/offers/chat/${chatId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          chatId: chatId,
          amount: 100,
          productId: productId,
        });

      // Deve retornar erro (não 201 sucesso)
      expect(response.status).not.toBe(201);
      expect([400, 403, 404]).toContain(response.status);
    });
  });

  describe('POST /api/offers/:id/accept', () => {
    it('deve aceitar oferta (recipient)', async () => {
      const response = await request(setup.app.getHttpServer())
        .post(`/api/offers/${offerId}/accept`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('ACCEPTED');
    });

    it('não deve aceitar oferta já aceita', async () => {
      const response = await request(setup.app.getHttpServer())
        .post(`/api/offers/${offerId}/accept`)
        .set('Authorization', `Bearer ${authToken}`);

      expect([400, 404]).toContain(response.status);
    });
  });

  describe('POST /api/offers/:id/decline', () => {
    it('deve criar nova oferta para testar recusa', async () => {
      const response = await request(setup.app.getHttpServer())
        .post(`/api/offers/chat/${chatId}`)
        .set('Authorization', `Bearer ${authToken2}`)
        .send({
          chatId: chatId,
          amount: 200.0,
          productId: productId,
        });

      expect(response.status).toBe(201);
      offerId = response.body.id;
    });

    it('deve recusar oferta (recipient)', async () => {
      const response = await request(setup.app.getHttpServer())
        .post(`/api/offers/${offerId}/decline`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('DECLINED');
    });
  });
});
