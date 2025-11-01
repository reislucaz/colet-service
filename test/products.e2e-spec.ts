import * as request from 'supertest';
import { TestSetup } from './helpers/test-setup';

describe('Produtos - E2E', () => {
  const setup = new TestSetup();
  let authToken: string;
  let authToken2: string;
  let userId: string;
  let userId2: string;
  let productId: string;

  beforeAll(async () => {
    await setup.init();
    await setup.cleanDatabase();
    await setup.createTestCategory();

    // Criar usuário 1
    const user1 = await request(setup.app.getHttpServer())
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'senha123',
        confirmPassword: 'senha123',
      });
    userId = user1.body.id;

    const login1 = await request(setup.app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'senha123',
      });
    authToken = login1.body.access_token;

    // Criar usuário 2
    const user2 = await request(setup.app.getHttpServer())
      .post('/api/auth/register')
      .send({
        name: 'Second User',
        email: 'second@example.com',
        password: 'senha123',
        confirmPassword: 'senha123',
      });
    userId2 = user2.body.id;

    const login2 = await request(setup.app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'second@example.com',
        password: 'senha123',
      });
    authToken2 = login2.body.access_token;
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  describe('POST /api/products', () => {
    it('deve criar produto com preço válido', async () => {
      const response = await request(setup.app.getHttpServer())
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

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.price).toBe(250.0);
      productId = response.body.id;
    });

    it('não deve criar produto sem preço', async () => {
      const response = await request(setup.app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Produto sem preço',
          description: 'Teste',
          category: 'test-category-id',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
        });

      expect(response.status).toBe(400);
    });

    it('não deve criar produto com preço zero', async () => {
      const response = await request(setup.app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Produto grátis',
          description: 'Teste',
          price: 0,
          category: 'test-category-id',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
        });

      expect(response.status).toBe(400);
    });

    it('deve validar campos obrigatórios', async () => {
      const response = await request(setup.app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Produto Incompleto',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/products', () => {
    it('deve listar produtos', async () => {
      const response = await request(setup.app.getHttpServer())
        .get('/api/products')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/products/:id', () => {
    it('deve buscar produto por ID', async () => {
      const response = await request(setup.app.getHttpServer())
        .get(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(productId);
    });

    it('deve acessar endpoint público de produto', async () => {
      const response = await request(setup.app.getHttpServer()).get(
        `/api/products/${productId}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(productId);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('deve permitir dono editar produto', async () => {
      const response = await request(setup.app.getHttpServer())
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Notebook Dell Atualizado',
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Notebook Dell Atualizado');
    });

    it('não deve permitir outro usuário editar produto', async () => {
      const response = await request(setup.app.getHttpServer())
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken2}`)
        .send({
          name: 'Tentando hackear',
        });

      expect(response.status).toBe(403);
    });
  });
});

