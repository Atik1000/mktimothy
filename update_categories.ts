import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany();
  console.log('Categories:', categories.map(s => ({id: s.id, name: s.name})));
  
  const mapping: Record<string, string> = {
    'Businesses for Sale': '/images/categories/businesses_for_sale.png',
    'Investment Projects Seeking Capital': '/images/categories/investment_projects.png',
    'Commercial Real Estate': '/images/categories/commercial_real_estate.png',
    'Tourism & Hospitality Assets': '/images/categories/tourism_assets.png',
    'Agricultural Opportunities': '/images/categories/agricultural_opportunities.png',
    'Joint Venture Opportunities': '/images/categories/joint_venture.png',
  };
  
  for (const category of categories) {
    const imageUrl = mapping[category.name];
    if (imageUrl) {
      try {
        await prisma.category.update({
          where: { id: category.id },
          data: { image: imageUrl } as any
        });
        console.log('Updated image for', category.name);
      } catch (e: any) {
        try {
          await prisma.category.update({
            where: { id: category.id },
            data: { icon: imageUrl } as any
          });
          console.log('Updated icon for', category.name);
        } catch (err: any) {
          console.error('Failed to update', category.name, err.message);
        }
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
