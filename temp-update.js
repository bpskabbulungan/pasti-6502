const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Updating admin credentials...');
  
  const hashedPassword = bcrypt.hashSync('bulungan6502', 12);
  
  // Try to find the dummy user we created earlier
  const oldAdmin = await prisma.user.findUnique({
    where: { username: 'admin_test' }
  });

  if (oldAdmin) {
    // Check if 'admin' already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { username: 'admin' }
    });
    
    if (existingAdmin && existingAdmin.id !== oldAdmin.id) {
       // Just update the password for the existing 'admin'
       await prisma.user.update({
         where: { username: 'admin' },
         data: { password: hashedPassword }
       });
       console.log('Password updated successfully for existing "admin"');
    } else {
       await prisma.user.update({
         where: { username: 'admin_test' },
         data: { 
           username: 'admin',
           password: hashedPassword 
         }
       });
       console.log('Username changed to "admin" and password updated successfully');
    }
  } else {
    // If somehow missing, create it
    const existingAdmin = await prisma.user.findUnique({
      where: { username: 'admin' }
    });
    if (existingAdmin) {
       await prisma.user.update({
         where: { username: 'admin' },
         data: { password: hashedPassword }
       });
       console.log('Password updated successfully for "admin"');
    } else {
      await prisma.user.create({
        data: {
          username: 'admin',
          password: hashedPassword,
          name: 'Admin Tester',
          role: 'ADMIN'
        }
      });
      console.log('Created new "admin" with hashed password');
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
