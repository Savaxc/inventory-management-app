import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  const testUser = await prisma.user.create({
    data: {
      id: 'user_38oVjt6wf8G5j7VqXFAEt3Ws8Ok', 
      email: 'test-user@example.com',
      firstName: 'Sava',
      lastName: 'Dev',
      products: {
        create: [
          {
            name: 'MacBook Pro M3',
            sku: 'APPLE-MBP-M3',
            price: "2499.99",
            quantity: 12,
            lowStockAt: 5,
          },
          {
            name: 'Logitech MX Master 3S',
            sku: 'LOGI-MX3S',
            price: "99.00",
            quantity: 45,
            lowStockAt: 10,
          },
          {
            name: 'Dell UltraSharp 27"',
            sku: 'DELL-U2723QE',
            price: "580.50",
            quantity: 3,
            lowStockAt: 5,
          },
          {
            name: 'Keychron Q1 Pro',
            sku: 'KCH-Q1P',
            price: "199.99",
            quantity: 8,
            lowStockAt: 2,
          }
        ],
      },
    },
  });

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });