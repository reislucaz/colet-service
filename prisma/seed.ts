import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Delete all existing categories
  await prisma.category.deleteMany();
  await prisma.product.deleteMany();

  const categories = [
    {
      id: '1ba2177a-f0da-4e84-912f-2384212f9cab',
      name: 'Eletrônicos',
      description: 'Resíduos eletrônicos, como computadores, celulares, etc.',
      iconKey: 'Monitor',
    },
    {
      id: '1f9f4912-9f26-48ae-803f-8b6d8a27a4d3',
      name: 'Vidro',
      description: 'Resíduos de vidro, como garrafas, copos, etc.',
      iconKey: 'GlassWater',
    },
    {
      id: '300b8a0c-17f0-4a02-840b-1a12ce82117d',
      name: 'Têxtil',
      description: 'Resíduos têxteis, como roupas, tecidos, etc.',
      iconKey: 'Shirt',
    },
    {
      id: '3b26d702-bdcb-4029-9c12-47f4efa8f9aa',
      name: 'Entulho',
      description: 'Resíduos de construção, como tijolos, cimento, etc.',
      iconKey: 'Construction',
    },
    {
      id: '4b0defb2-2329-4907-9edd-e15a379f6f97',
      name: 'Móveis',
      description: 'Móveis usados ou danificados para descarte.',
      iconKey: 'Armchair',
    },
    {
      id: '670ba795-285a-474d-b79c-59f02c885af2',
      name: 'Metal',
      description: 'Resíduos metálicos, como latas, ferros, etc.',
      iconKey: 'Wrench',
    },
    {
      id: '95147321-97c4-4c74-af61-7035ded7f513',
      name: 'Plástico',
      description: 'Resíduos plásticos, como garrafas, embalagens, etc.',
      iconKey: 'Package',
    },
    {
      id: '96d740f9-21a0-478c-9ebb-e85ea4c89656',
      name: 'Papel e Papelão',
      description: 'Resíduos de papel e papelão, como jornais, caixas, etc.',
      iconKey: 'FileText',
    },
    {
      id: 'a9733cab-901d-46e3-aa75-e0caf918e5c9',
      name: 'Óleo de Cozinha',
      description: 'Óleo de cozinha usado para reciclagem.',
      iconKey: 'Droplet',
    },
    {
      id: 'ebb9dd01-f5a0-4b4e-b745-9362fa904086',
      name: 'Orgânico',
      description: 'Resíduos orgânicos, como restos de comida, cascas, etc.',
      iconKey: 'Leaf',
    },
  ];

  const products = [
    {
      id: 'a1e1d2c3-4b5f-6789-0abc-def123456789',
      name: 'Notebook Usado',
      description: 'Notebook antigo para descarte ou reciclagem.',
      price: 150.0,
      categoryId: '1ba2177a-f0da-4e84-912f-2384212f9cab', // Eletrônicos
      authorId: 'user-1', // Substitua pelo ID real de um usuário
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
    },
    {
      id: 'b2f2e3d4-5c6a-7890-1bcd-ef234567890a',
      name: 'Garrafa de Vidro',
      description: 'Garrafa de vidro transparente para reciclagem.',
      price: 5.0,
      categoryId: '1f9f4912-9f26-48ae-803f-8b6d8a27a4d3', // Vidro
      authorId: 'user-1',
      neighborhood: 'Jardins',
      city: 'São Paulo',
      state: 'SP',
    },
    {
      id: 'c3g3h4i5-6d7b-8901-2cde-f345678901ab',
      name: 'Camiseta Velha',
      description: 'Camiseta usada para descarte.',
      price: 10.0,
      categoryId: '300b8a0c-17f0-4a02-840b-1a12ce82117d', // Têxtil
      authorId: 'user-2',
      neighborhood: 'Copacabana',
      city: 'Rio de Janeiro',
      state: 'RJ',
    },
    {
      id: 'd4i4j5k6-7e8c-9012-3def-456789012abc',
      name: 'Tijolo Quebrado',
      description: 'Restos de tijolos de obra.',
      price: 20.0,
      categoryId: '3b26d702-bdcb-4029-9c12-47f4efa8f9aa', // Entulho
      authorId: 'user-2',
      neighborhood: 'Centro',
      city: 'Belo Horizonte',
      state: 'MG',
    },
    {
      id: 'e5k5l6m7-8f9d-0123-4ef0-567890123bcd',
      name: 'Cadeira Quebrada',
      description: 'Cadeira de madeira danificada.',
      price: 50.0,
      categoryId: '4b0defb2-2329-4907-9edd-e15a379f6f97', // Móveis
      authorId: 'user-3',
      neighborhood: 'Boa Viagem',
      city: 'Recife',
      state: 'PE',
    },
    {
      id: 'f6m6n7o8-9g0e-1234-5f01-678901234cde',
      name: 'Lata de Alumínio',
      description: 'Lata de refrigerante para reciclagem.',
      price: 2.5,
      categoryId: '670ba795-285a-474d-b79c-59f02c885af2', // Metal
      authorId: 'user-3',
      neighborhood: 'Centro',
      city: 'Curitiba',
      state: 'PR',
    },
    {
      id: 'g7o7p8q9-0h1f-2345-6g12-789012345def',
      name: 'Garrafa PET',
      description: 'Garrafa plástica para reciclagem.',
      price: 3.0,
      categoryId: '95147321-97c4-4c74-af61-7035ded7f513', // Plástico
      authorId: 'user-1',
      neighborhood: 'Asa Sul',
      city: 'Brasília',
      state: 'DF',
    },
    {
      id: 'h8q8r9s0-1i2g-3456-7h23-890123456efa',
      name: 'Caixa de Papelão',
      description: 'Caixa de papelão usada.',
      price: 8.0,
      categoryId: '96d740f9-21a0-478c-9ebb-e85ea4c89656', // Papel e Papelão
      authorId: 'user-2',
      neighborhood: 'Centro',
      city: 'Porto Alegre',
      state: 'RS',
    },
    {
      id: 'i9s9t0u1-2j3h-4567-8i34-901234567fab',
      name: 'Óleo Usado',
      description: 'Óleo de cozinha usado armazenado em garrafa PET.',
      price: 15.0,
      categoryId: 'a9733cab-901d-46e3-aa75-e0caf918e5c9', // Óleo de Cozinha
      authorId: 'user-3',
      neighborhood: 'Centro',
      city: 'Salvador',
      state: 'BA',
    },
    {
      id: 'j0u0v1w2-3k4i-5678-9j45-012345678abc',
      name: 'Restos de Alimentos',
      description: 'Restos de comida para compostagem.',
      price: 0.5,
      categoryId: 'ebb9dd01-f5a0-4b4e-b745-9362fa904086', // Orgânico
      authorId: 'user-1',
      neighborhood: 'Centro',
      city: 'Fortaleza',
      state: 'CE',
    },
  ];

  const users = [
    {
      id: 'user-1',
      name: 'Alice Silva',
      email: 'alice@example.com',
      passwordHash: 'hash1', // Substitua por um hash real em produção
    },
    {
      id: 'user-2',
      name: 'Bruno Souza',
      email: 'bruno@example.com',
      passwordHash: 'hash2',
    },
    {
      id: 'user-3',
      name: 'Carla Lima',
      email: 'carla@example.com',
      passwordHash: 'hash3',
    },
  ];

  // Crie os usuários antes das categorias e produtos
  await prisma.user.createMany({
    data: users,
  });

  // Create all categories
  await prisma.category.createMany({
    data: categories,
  });

  await prisma.product.createMany({
    data: products,
  });

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
