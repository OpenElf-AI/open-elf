const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Creating initial admin account...');

  const adminExists = await prisma.admin.findFirst({
    where: { username: 'admin' }
  });

  if (adminExists) {
    console.log('Admin account already exists.');
    return;
  }

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.admin.create({
    data: {
      username: 'admin',
      email: 'admin@openelf.com',
      password: hashedPassword,
      name: '超级管理员',
      role: 'super_admin',
      isActive: true
    }
  });

  console.log('Admin account created successfully:', admin.username);
  console.log('Login credentials:');
  console.log('Username: admin');
  console.log('Password: admin123');
  console.log('Please change this password in production!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
