import * as fs from 'fs';
import * as path from 'path';
import * as request from 'supertest';
import { TestSetup } from './helpers/test-setup';

describe('Upload de Imagens - E2E', () => {
  const setup = new TestSetup();
  let authToken: string;
  let authToken2: string;
  let productId: string;
  let imageId: string;

  const firstUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'senha123',
    confirmPassword: 'senha123',
  };

  const secondUser = {
    name: 'Second User',
    email: 'second@example.com',
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

    const uploadsPath = path.join(process.cwd(), 'uploads', 'products');
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
    }

    await request(setup.app.getHttpServer())
      .post('/api/auth/register')
      .send(firstUser);

    const login1 = await request(setup.app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: firstUser.email,
        password: firstUser.password,
      });
    authToken = login1.body.access_token;

    await request(setup.app.getHttpServer())
      .post('/api/auth/register')
      .send(secondUser);

    const login2 = await request(setup.app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: secondUser.email,
        password: secondUser.password,
      });
    authToken2 = login2.body.access_token;

    const product = await request(setup.app.getHttpServer())
      .post('/api/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send(testProduct);
    productId = product.body.id;
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  describe('POST /api/products/:id/images', () => {
    it('deve fazer upload de imagem válida', async () => {
      const testImageBuffer = Buffer.from('fake image data');

      const response = await request(setup.app.getHttpServer())
        .post(`/api/products/${productId}/images`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('images', testImageBuffer, 'test-image.jpg');

      expect([200, 201]).toContain(response.status);
      expect(response.body.images).toBeDefined();
      expect(response.body.images.length).toBeGreaterThan(0);
      imageId = response.body.images[0].id;
    });

    it('deve fazer upload de múltiplas imagens', async () => {
      const testImageBuffer1 = Buffer.from('fake image 1');
      const testImageBuffer2 = Buffer.from('fake image 2');

      const response = await request(setup.app.getHttpServer())
        .post(`/api/products/${productId}/images`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('images', testImageBuffer1, 'test1.png')
        .attach('images', testImageBuffer2, 'test2.webp');

      expect([200, 201]).toContain(response.status);
      expect(response.body.images.length).toBeGreaterThanOrEqual(2);
    });

    it('não deve permitir outro usuário fazer upload', async () => {
      const testImageBuffer = Buffer.from('fake image');

      const response = await request(setup.app.getHttpServer())
        .post(`/api/products/${productId}/images`)
        .set('Authorization', `Bearer ${authToken2}`)
        .attach('images', testImageBuffer, 'hack.jpg');

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/products/:id/images/:imageId', () => {
    it('deve permitir dono deletar imagem', async () => {
      // Buscar o produto para pegar um imageId válido
      const productResponse = await request(setup.app.getHttpServer())
        .get(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const validImageId = productResponse.body.images?.[0]?.id;

      if (!validImageId) {
        // Se não houver imagem, fazer upload de uma
        const testImageBuffer = Buffer.from('image to delete');
        const uploadResponse = await request(setup.app.getHttpServer())
          .post(`/api/products/${productId}/images`)
          .set('Authorization', `Bearer ${authToken}`)
          .attach('images', testImageBuffer, 'to-delete.jpg');

        imageId = uploadResponse.body.images[0].id;
      } else {
        imageId = validImageId;
      }

      const response = await request(setup.app.getHttpServer())
        .delete(`/api/products/${productId}/images/${imageId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 204]).toContain(response.status);
    });

    it('não deve permitir outro usuário deletar imagem', async () => {
      // Criar uma nova imagem
      const testImageBuffer = Buffer.from('fake image for delete test');
      const uploadResponse = await request(setup.app.getHttpServer())
        .post(`/api/products/${productId}/images`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('images', testImageBuffer, 'delete-test.jpg');

      const newImageId = uploadResponse.body.images[0].id;

      // Tentar deletar com outro usuário
      const response = await request(setup.app.getHttpServer())
        .delete(`/api/products/${productId}/images/${newImageId}`)
        .set('Authorization', `Bearer ${authToken2}`);

      expect(response.status).toBe(403);
    });
  });
});
