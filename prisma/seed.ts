import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function main() {
  const initialPassword = process.env.INITIAL_ADMIN_PASSWORD;
  if (!initialPassword || initialPassword.length < 24) {
    throw new Error('INITIAL_ADMIN_PASSWORD must be set to a unique value of at least 24 characters.');
  }

  const organization = await db.organization.upsert({
    where: { slug: 'smartguard-demo' },
    update: {},
    create: {
      name: 'مؤسسة سمارت جارد',
      slug: 'smartguard-demo',
      timezone: 'Africa/Cairo',
    },
  });

  const roleSpecs = [
    ['SUPER_ADMIN', 'مدير النظام', ['*']],
    ['HR_MANAGER', 'مدير الموارد البشرية', []],
    ['SECURITY_OFFICER', 'مسؤول الأمن', []],
    ['SUPERVISOR', 'مشرف', []],
    ['VIEWER', 'مشاهد', []],
  ] as const;

  const roles = await Promise.all(
    roleSpecs.map(([key, name, permissions]) =>
      db.role.upsert({
        where: { organizationId_key: { organizationId: organization.id, key } },
        update: {},
        create: { organizationId: organization.id, key, name, permissions: [...permissions] },
      }),
    ),
  );

  const passwordHash = await bcrypt.hash(initialPassword, 12);
  await db.user.upsert({
    where: {
      organizationId_email: {
        organizationId: organization.id,
        email: 'admin@smartguard.local',
      },
    },
    update: {},
    create: {
      organizationId: organization.id,
      roleId: roles[0].id,
      email: 'admin@smartguard.local',
      name: 'مدير النظام',
      passwordHash,
    },
  });

  console.log('Initial admin account is ready for organization smartguard-demo.');
}

main().finally(() => db.$disconnect());
