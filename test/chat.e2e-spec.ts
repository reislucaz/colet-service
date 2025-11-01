import * as request from 'supertest';
import { TestSetup } from './helpers/test-setup';

describe('Chat e Permissões - E2E', () => {
  const setup = new TestSetup();
  let authToken: string;
  let authToken2: string;
  let authToken3: string;
  let userId: string;
  let userId2: string;
  let productId: string;
  let chatId: string;

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
    const user2 = await request(setup.app.getHttpServer())
      .post('/api/auth/register')
      .send({
        name: 'Buyer User',
        email: 'buyer@example.com',
        password: 'senha123',
        confirmPassword: 'senha123',
      });
    userId2 = user2.body.id;

    const login2 = await request(setup.app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'buyer@example.com',
        password: 'senha123',
      });
    authToken2 = login2.body.access_token;

    // Criar usuário 3 (externo)
    await request(setup.app.getHttpServer()).post('/api/auth/register').send({
      name: 'Third User',
      email: 'third@example.com',
      password: 'senha123',
      confirmPassword: 'senha123',
    });

    const login3 = await request(setup.app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'third@example.com',
        password: 'senha123',
      });
    authToken3 = login3.body.access_token;

    // Criar produto do usuário 1
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
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  describe('POST /api/chats', () => {
    it('deve criar chat', async () => {
      const response = await request(setup.app.getHttpServer())
        .post('/api/chats')
        .set('Authorization', `Bearer ${authToken2}`)
        .send({
          productId: productId,
          sellerId: userId,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      chatId = response.body.id;
    });
  });

  describe('GET /api/chats/:id', () => {
    it('deve permitir participante acessar chat', async () => {
      const response = await request(setup.app.getHttpServer())
        .get(`/api/chats/${chatId}`)
        .set('Authorization', `Bearer ${authToken2}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(chatId);
    });

    it('não deve permitir não-participante acessar chat', async () => {
      const response = await request(setup.app.getHttpServer())
        .get(`/api/chats/${chatId}`)
        .set('Authorization', `Bearer ${authToken3}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/messages/chat/:chatId', () => {
    it('deve permitir participante enviar mensagem', async () => {
      const response = await request(setup.app.getHttpServer())
        .post(`/api/messages/chat/${chatId}`)
        .set('Authorization', `Bearer ${authToken2}`)
        .send({
          text: 'Olá, estou interessado no produto!',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.text).toBe('Olá, estou interessado no produto!');
    });
  });

  describe('GET /api/chats', () => {
    it('deve listar apenas meus chats', async () => {
      const response = await request(setup.app.getHttpServer())
        .get('/api/chats')
        .set('Authorization', `Bearer ${authToken2}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      // Verificar que o usuário é participante de todos os chats
      response.body.data.forEach((chat) => {
        const isParticipant = chat.participants.some((p) => p.id === userId2);
        expect(isParticipant).toBe(true);
      });
    });
  });
});
