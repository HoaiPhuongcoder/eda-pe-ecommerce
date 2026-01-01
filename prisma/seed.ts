import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { RoleName } from './seed/constants/roles.constant';
import * as argon2 from 'argon2';

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };

async function main() {
  const roleCount = await prisma.role.count();
  if (roleCount > 0) {
    throw new Error('Roles have already been seeded.');
  }
  await prisma.role.createMany({
    data: [
      { name: RoleName.Admin, description: 'Administrator with full access' },
      {
        name: RoleName.Client,
        description: 'Client with purchasing capabilities',
      },
      {
        name: RoleName.Seller,
        description: 'Seller with product management capabilities',
      },
    ],
  });

  const adminRole = await prisma.role.findUniqueOrThrow({
    where: { name: RoleName.Admin },
  });
  const hashedPassword = await argon2.hash(process.env.ADMIN_PASSWORD || '');

  const adminUser = await prisma.user.create({
    data: {
      email: process.env.ADMIN_EMAIL || '',
      password: hashedPassword,
      name: process.env.ADMIN_NAME || '',
      roleId: adminRole.id,
      phoneNumber: process.env.ADMIN_PHONE || '',
    },
  });
  return {
    roleCount,
    adminUser,
  };
}

main()
  .then(async ({ adminUser, roleCount }) => {
    console.log(`✅ Admin user created: ${adminUser.email}`);
    console.log(`✅ Seeded ${roleCount} roles successfully.`);
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
