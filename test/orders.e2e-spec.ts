import * as request from 'supertest';
import { TestSetup } from './helpers/test-setup';

describe('Pedidos (Orders) - E2E', () => {
  const setup = new TestSetup();
  let authToken: string;
  let authToken3: string;
  let userId: string;
  let userId2: string;
  let productId: string;
  let orderId: string;

  const sellerUser = {
    name: 'Seller User',
    email: 'seller@example.com',
    password: 'senha123',
    confirmPassword: 'senha123',
  };

  const buyerUser = {
    name: 'Buyer User',
    email: 'buyer@example.com',
    password: 'senha123',
    confirmPassword: 'senha123',
  };

  const thirdUser = {
    name: 'Third User',
    email: 'third@example.com',
    password: 'senha123',
    confirmPassword: 'senha123',
  };

  const testProduct = {
    name: 'Notebook Dell',
    description: 'Notebook para reciclagem',
    price: 250.0,
    recurring: false,
    category: 'test-category-id',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
  };

  beforeAll(async () => {
    await setup.init();
    await setup.cleanDatabase();
    await setup.createTestCategory();

    const user1 = await request(setup.app.getHttpServer())
      .post('/api/auth/register')
      .send(sellerUser);
    userId = user1.body.id;

    const login1 = await request(setup.app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: sellerUser.email,
        password: sellerUser.password,
      });
    authToken = login1.body.access_token;

    const user2 = await request(setup.app.getHttpServer())
      .post('/api/auth/register')
      .send(buyerUser);
    userId2 = user2.body.id;

    await request(setup.app.getHttpServer())
      .post('/api/auth/register')
      .send(thirdUser);

    const login3 = await request(setup.app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: thirdUser.email,
        password: thirdUser.password,
      });
    authToken3 = login3.body.access_token;

    const product = await request(setup.app.getHttpServer())
      .post('/api/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send(testProduct);
    productId = product.body.id;
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  describe('POST /api/orders', () => {
    it('deve criar pedido com valor válido', async () => {
      const response = await request(setup.app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 200.0,
          productId: productId,
          purchaserId: userId2,
          sellerId: userId,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      orderId = response.body.id;
    });

    it('não deve criar pedido com valor zero', async () => {
      const response = await request(setup.app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 0,
          productId: productId,
          purchaserId: userId2,
          sellerId: userId,
        });

      expect(response.status).toBe(400);
    });

    it('não deve criar pedido com valor negativo', async () => {
      const response = await request(setup.app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: -100,
          productId: productId,
          purchaserId: userId2,
          sellerId: userId,
        });

      expect(response.status).toBe(400);
    });

    it('não deve permitir criar pedido sem ser participante', async () => {
      const response = await request(setup.app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken3}`)
        .send({
          amount: 200.0,
          productId: productId,
          purchaserId: userId2,
          sellerId: userId,
        });

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('deve permitir participante ver pedido', async () => {
      const response = await request(setup.app.getHttpServer())
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(orderId);
    });

    it('não deve permitir não-participante ver pedido', async () => {
      const response = await request(setup.app.getHttpServer())
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken3}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/orders', () => {
    it('deve listar apenas meus pedidos', async () => {
      const response = await request(setup.app.getHttpServer())
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      // Verificar que todos os pedidos pertencem ao usuário
      response.body.forEach((order) => {
        expect(order.sellerId === userId || order.purchaserId === userId).toBe(
          true,
        );
      });
    });

    it('usuário sem pedidos deve receber lista vazia', async () => {
      const response = await request(setup.app.getHttpServer())
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken3}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('PUT /api/orders/:id', () => {
    it('deve permitir participante atualizar pedido', async () => {
      const response = await request(setup.app.getHttpServer())
        .put(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'PAID',
        });

      expect(response.status).toBe(200);
    });

    it('não deve permitir não-participante atualizar pedido', async () => {
      const response = await request(setup.app.getHttpServer())
        .put(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken3}`)
        .send({
          status: 'CANCELLED',
        });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/orders/:id', () => {
    it('não deve permitir não-participante deletar pedido', async () => {
      const response = await request(setup.app.getHttpServer())
        .delete(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken3}`);

      expect(response.status).toBe(403);
    });

    it('deve permitir participante deletar pedido', async () => {
      const response = await request(setup.app.getHttpServer())
        .delete(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });
  });
});
