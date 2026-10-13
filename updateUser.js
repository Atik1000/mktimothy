const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = '1jgkq@web-library.net';
  
  try {
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { emailVerified: true },
    });
    console.log(`Successfully verified user: ${updatedUser.email}`);
  } catch (error) {
    console.error(`Error updating user:`, error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
