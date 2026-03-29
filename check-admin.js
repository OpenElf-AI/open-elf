const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Checking admin accounts...');

  const admins = await prisma.admin.findMany();
  
  if (admins.length === 0) {
    console.log('No admin accounts found.');
  } else {
    console.log(`Found ${admins.length} admin account(s):`);
    admins.forEach(admin => {
      console.log(`- ${admin.username} (${admin.role}) - ${admin.isActive ? 'Active' : 'Inactive'}`);
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
