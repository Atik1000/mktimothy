import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
  const allowedCategories = [
    "businesses-for-sale",
    "investment-projects",
    "commercial-real-estate",
    "tourism-hospitality",
    "agriculture",
    "joint-venture"
  ];

  const allCategories = await prisma.category.findMany();
  let kept = 0;
  let deleted = 0;

  for (const cat of allCategories) {
    if (!allowedCategories.includes(cat.slug)) {
      // Find listings that use this category and delete them (to allow category deletion)
      await prisma.listing.deleteMany({
        where: { categoryId: cat.id }
      });
      // Delete blogs that use this category
      await prisma.blog.deleteMany({
        where: { categoryId: cat.id }
      });
      // Delete the category
      await prisma.category.delete({
        where: { id: cat.id }
      });
      console.log(`Deleted category: ${cat.name}`);
      deleted++;
    } else {
      kept++;
    }
  }

  console.log(`Cleanup complete. Kept: ${kept}, Deleted: ${deleted}`);
}

cleanup()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
