import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@cardealership.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminSecurePassword123!';

  console.log(`Seeding database. Checking for admin user: ${adminEmail}...`);

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const createdAdmin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        role: Role.ADMIN,
      },
    });
    console.log(`Admin user successfully seeded with ID: ${createdAdmin.id}`);
  } else {
    console.log(`Admin user ${adminEmail} already exists. Skipping creation.`);
  }

  // Also seed initial sample vehicles if table is empty
  const vehicleCount = await prisma.vehicle.count();
  if (vehicleCount === 0) {
    console.log('Seeding initial vehicle inventory...');
    await prisma.vehicle.createMany({
      data: [
        {
          make: 'Toyota',
          model: 'Camry',
          category: 'Sedan',
          price: 26420.0,
          quantity: 5,
        },
        {
          make: 'Tesla',
          model: 'Model Y',
          category: 'SUV',
          price: 44990.0,
          quantity: 3,
        },
        {
          make: 'Ford',
          model: 'F-150',
          category: 'Truck',
          price: 36570.0,
          quantity: 2,
        },
        {
          make: 'Porsche',
          model: '911 Carrera',
          category: 'Coupe',
          price: 114400.0,
          quantity: 1,
        },
        {
          make: 'Honda',
          model: 'Civic',
          category: 'Sedan',
          price: 23950.0,
          quantity: 0, // out of stock demo
        },
      ],
    });
    console.log('Sample vehicles seeded.');
  }
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
