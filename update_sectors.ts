import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const sectors = await prisma.sector.findMany();
  console.log('Sectors:', sectors.map(s => ({id: s.id, name: s.name})));
  
  const mapping: Record<string, string> = {
    'Tourism & Hospitality': '/images/sectors/tourism.png',
    'Agriculture & Agribusiness': '/images/sectors/agriculture.png',
    'Real Estate & Infrastructure': '/images/sectors/real_estate.png',
    'Manufacturing': '/images/sectors/manufacturing.png',
    'Energy & Natural Resources': '/images/sectors/energy.png',
    'ICT & Innovation': '/images/sectors/ict.png',
  };
  
  for (const sector of sectors) {
    const imageUrl = mapping[sector.name];
    if (imageUrl) {
      try {
        await prisma.sector.update({
          where: { id: sector.id },
          data: { image: imageUrl } as any
        });
        console.log('Updated image for', sector.name);
      } catch (e: any) {
        try {
          await prisma.sector.update({
            where: { id: sector.id },
            data: { icon: imageUrl } as any
          });
          console.log('Updated icon for', sector.name);
        } catch (err: any) {
          console.error('Failed to update', sector.name, err.message);
        }
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
