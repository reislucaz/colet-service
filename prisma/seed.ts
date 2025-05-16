import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Delete all existing categories
  await prisma.category.deleteMany();

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

  // Create all categories
  await prisma.category.createMany({
    data: categories,
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
