import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Managers
  const manager1 = await prisma.manager.create({
    data: {
      name: 'Sarah Johnson',
    },
  });

  const manager2 = await prisma.manager.create({
    data: {
      name: 'Michael Chen',
    },
  });

  const manager3 = await prisma.manager.create({
    data: {
      name: 'Priya Patel',
    },
  });

  console.log('✅ Created managers');

  // Create Staff
  await prisma.staff.createMany({
    data: [
      {
        name: 'Alice Williams',
        location: 'US',
        hourlyCost: 85,
        managerId: manager1.id,
      },
      {
        name: 'Bob Thompson',
        location: 'US',
        hourlyCost: 75,
        managerId: manager1.id,
      },
      {
        name: 'Charlie Davis',
        location: 'UK',
        hourlyCost: 70,
        managerId: manager2.id,
      },
      {
        name: 'Diana Kumar',
        location: 'India',
        hourlyCost: 45,
        managerId: manager3.id,
      },
      {
        name: 'Ethan Martinez',
        location: 'Contract',
        hourlyCost: 95,
        managerId: manager1.id,
      },
      {
        name: 'Fiona Lee',
        location: 'UK',
        hourlyCost: 68,
        managerId: manager2.id,
      },
    ],
  });

  console.log('✅ Created staff');

  // Create Products
  const productA = await prisma.product.create({
    data: {
      name: 'Customer Portal',
    },
  });

  const productB = await prisma.product.create({
    data: {
      name: 'Analytics Platform',
    },
  });

  const productC = await prisma.product.create({
    data: {
      name: 'Mobile App',
    },
  });

  console.log('✅ Created products');

  // Create Initiatives
  await prisma.initiative.createMany({
    data: [
      {
        name: 'User Authentication',
        productId: productA.id,
        category: 'Contract',
        description: 'Implement OAuth2 authentication as per contract requirements',
      },
      {
        name: 'Dashboard Redesign',
        productId: productA.id,
        category: 'Promise',
        description: 'Promised dashboard improvements for Q1 release',
      },
      {
        name: 'Customer Support',
        productId: productA.id,
        category: 'Expectation',
        description: 'Ongoing customer support and bug fixes',
      },
      {
        name: 'Real-time Analytics',
        productId: productB.id,
        category: 'Contract',
        description: 'Contractual obligation for real-time data processing',
      },
      {
        name: 'Custom Reports',
        productId: productB.id,
        category: 'Promise',
        description: 'Custom reporting feature promised to key clients',
      },
      {
        name: 'AI Insights',
        productId: productB.id,
        category: 'Growth',
        description: 'New AI-powered insights feature for market expansion',
      },
      {
        name: 'iOS Development',
        productId: productC.id,
        category: 'Contract',
        description: 'iOS app development per contract',
      },
      {
        name: 'Push Notifications',
        productId: productC.id,
        category: 'Expectation',
        description: 'Expected push notification functionality',
      },
    ],
  });

  console.log('✅ Created initiatives');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
