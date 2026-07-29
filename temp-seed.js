const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding dummy data for audio test...');
  
  // Create an admin if not exists
  let admin = await prisma.user.findFirst();
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        username: 'admin_test',
        password: 'password', // dummy
        name: 'Admin Tester',
        role: 'ADMIN'
      }
    });
  }

  // Create a service
  let service = await prisma.service.findFirst();
  if (!service) {
    service = await prisma.service.create({
      data: {
        name: 'Konsultasi Statistik',
        code: 'K',
        status: 'ACTIVE'
      }
    });
  }

  // Create a visitor
  let visitor = await prisma.visitor.findFirst();
  if (!visitor) {
    visitor = await prisma.visitor.create({
      data: {
        name: 'Pengunjung Dummy',
        phone: '08123456789'
      }
    });
  }

  // Create Queues
  const queue1 = await prisma.queue.create({
    data: {
      queueNumber: 1,
      status: 'WAITING',
      queueType: 'OFFLINE',
      visitorId: visitor.id,
      serviceId: service.id,
    }
  });
  
  const queue2 = await prisma.queue.create({
    data: {
      queueNumber: 2,
      status: 'WAITING',
      queueType: 'OFFLINE',
      visitorId: visitor.id,
      serviceId: service.id,
    }
  });

  const queue3 = await prisma.queue.create({
    data: {
      queueNumber: 3,
      status: 'WAITING',
      queueType: 'OFFLINE',
      visitorId: visitor.id,
      serviceId: service.id,
    }
  });

  console.log(`Created Queues: ${queue1.id}, ${queue2.id}, ${queue3.id}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
