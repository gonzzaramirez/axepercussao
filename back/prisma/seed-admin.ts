import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL no está definida. Verificá el archivo .env');
}
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminData = {
    email: 'admin@axepercusao.com',
    password: 'CambiarEnProduccion123!',
    firstName: 'Admin',
    lastName: 'Axé',
    phone: '+59899999999',
  };

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminData.email },
  });

  if (existingAdmin) {
    console.log('⚠️  Admin ya existe:', adminData.email);
    return;
  }

  const hashedPassword = await bcrypt.hash(adminData.password, 10);

  const admin = await prisma.user.create({
    data: {
      email: adminData.email,
      passwordHash: hashedPassword,
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      phone: adminData.phone,
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Admin creado exitosamente:');
  console.log(`   Email: ${admin.email}`);
  console.log(`   Password: ${adminData.password}`);
  console.log('   ⚠️  CAMBIAR LA CONTRASEÑA EN PRODUCCIÓN');
}

main()
  .catch((e) => {
    console.error('❌ Error creando admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
