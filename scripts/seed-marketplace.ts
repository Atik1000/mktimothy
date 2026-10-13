import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding marketplace data...");

  // 1. Sectors
  const sectors = [
    { name: "Tourism & Hospitality", slug: "tourism-hospitality", icon: "hotel", sortOrder: 1 },
    { name: "Agriculture & Agribusiness", slug: "agriculture-agribusiness", icon: "leaf", sortOrder: 2 },
    { name: "Real Estate & Infrastructure", slug: "real-estate-infrastructure", icon: "building", sortOrder: 3 },
    { name: "Manufacturing", slug: "manufacturing", icon: "industry", sortOrder: 4 },
    { name: "Energy & Natural Resources", slug: "energy-natural-resources", icon: "zap", sortOrder: 5 },
    { name: "ICT & Innovation", slug: "ict-innovation", icon: "cpu", sortOrder: 6 },
  ];

  console.log("Seeding Sectors...");
  for (const s of sectors) {
    await prisma.sector.upsert({
      where: { slug: s.slug },
      update: s,
      create: s,
    });
  }

  // 2. Categories
  const categories = [
    { name: "Businesses for Sale", slug: "businesses-for-sale", tagColor: "#1B2A4A", isFeatured: true, sortOrder: 1 },
    { name: "Investment Projects Seeking Capital", slug: "investment-projects-seeking-capital", tagColor: "#166534", isFeatured: false, sortOrder: 2 },
    { name: "Commercial Real Estate", slug: "commercial-real-estate", tagColor: "#475569", isFeatured: false, sortOrder: 3 },
    { name: "Tourism & Hospitality Assets", slug: "tourism-hospitality-assets", tagColor: "#B45309", isFeatured: false, sortOrder: 4 },
    { name: "Agricultural Opportunities", slug: "agricultural-opportunities", tagColor: "#3F6212", isFeatured: false, sortOrder: 5 },
    { name: "Joint Venture Opportunities", slug: "joint-venture-opportunities", tagColor: "#5B21B6", isFeatured: false, sortOrder: 6 },
  ];

  console.log("Seeding Categories...");
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
  }

  console.log("Marketplace data seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
