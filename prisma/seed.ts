import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { CATEGORIES, SDGS, PRODUCTS, BADGES } from "../src/data/initial-data";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || "file:dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding JejakHijau SQLite database...");

  // 1. Seed Categories
  console.log("Seeding categories...");
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
      },
      create: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
      },
    });
  }

  // 2. Seed SDGs
  console.log("Seeding SDGs...");
  for (const sdg of SDGS) {
    await prisma.sdg.upsert({
      where: { id: sdg.id },
      update: {
        name: sdg.name,
        description: sdg.description,
        color: sdg.color,
      },
      create: {
        id: sdg.id,
        name: sdg.name,
        description: sdg.description,
        color: sdg.color,
      },
    });
  }

  // 3. Seed Badges
  console.log("Seeding Badges...");
  for (const b of BADGES) {
    await prisma.badge.upsert({
      where: { code: b.code },
      update: {
        name: b.name,
        description: b.description,
        icon: b.icon,
        requiredMetric: b.requiredMetric,
      },
      create: {
        id: b.id,
        code: b.code,
        name: b.name,
        description: b.description,
        icon: b.icon,
        requiredMetric: b.requiredMetric,
      },
    });
  }

  // 4. Seed Initial Users
  console.log("Seeding users...");
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@jejakhijau.id" },
    update: {
      name: "Administrator JejakHijau",
      role: "ADMIN",
      ecoPoints: 2500,
      totalCo2Kg: 1420.0,
      totalPlastic: 890,
    },
    create: {
      name: "Administrator JejakHijau",
      email: "admin@jejakhijau.id",
      role: "ADMIN",
      ecoPoints: 2500,
      phone: "+62 811-9988-7711",
      totalCo2Kg: 1420.0,
      totalPlastic: 890,
    },
  });

  const customerUser = await prisma.user.upsert({
    where: { email: "user@jejakhijau.id" },
    update: {
      name: "Alim Pratama",
      role: "CUSTOMER",
      ecoPoints: 750,
      totalCo2Kg: 48.5,
      totalPlastic: 320,
    },
    create: {
      name: "Alim Pratama",
      email: "user@jejakhijau.id",
      role: "CUSTOMER",
      ecoPoints: 750,
      phone: "+62 812-3456-7890",
      totalCo2Kg: 48.5,
      totalPlastic: 320,
    },
  });

  // 5. Seed 20 Products
  console.log("Seeding 20 products...");
  for (const prod of PRODUCTS) {
    const createdProduct = await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        price: prod.price,
        stock: prod.stock,
        weightGram: prod.weightGram,
        status: prod.status,
        isFeatured: prod.isFeatured,
        co2SavedKg: prod.co2SavedKg,
        plasticSavedPcs: prod.plasticSavedPcs,
        impactNote: prod.impactNote,
        origin: (prod as any).origin || null,
        materials: (prod as any).materials || null,
        avgRating: prod.avgRating,
        soldCount: prod.soldCount,
        categoryId: prod.categoryId,
      },
      create: {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        sku: prod.sku,
        description: prod.description,
        price: prod.price,
        stock: prod.stock,
        weightGram: prod.weightGram,
        status: prod.status,
        isFeatured: prod.isFeatured,
        co2SavedKg: prod.co2SavedKg,
        plasticSavedPcs: prod.plasticSavedPcs,
        impactNote: prod.impactNote,
        origin: (prod as any).origin || null,
        materials: (prod as any).materials || null,
        avgRating: prod.avgRating,
        soldCount: prod.soldCount,
        categoryId: prod.categoryId,
      },
    });

    // Delete existing relations to avoid duplicate keys on re-seed
    await prisma.productImage.deleteMany({ where: { productId: createdProduct.id } });
    await prisma.productSdg.deleteMany({ where: { productId: createdProduct.id } });

    // Seed product images
    for (let i = 0; i < prod.images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: createdProduct.id,
          url: prod.images[i],
          order: i,
        },
      });
    }

    // Seed product SDGs
    for (const sdgId of prod.sdgIds) {
      await prisma.productSdg.create({
        data: {
          productId: createdProduct.id,
          sdgId,
        },
      });
    }
  }

  // 6. Seed Sample Orders
  console.log("Seeding sample orders...");
  const existingOrder = await prisma.order.findUnique({
    where: { orderNumber: "JH-20261029-0001" },
  });

  if (!existingOrder) {
    const order1 = await prisma.order.create({
      data: {
        orderNumber: "JH-20261029-0001",
        userId: customerUser.id,
        status: "PAID",
        subtotal: 529000,
        shippingCost: 10000,
        discount: 0,
        total: 539000,
        courier: "Motor Listrik EV (Green Delivery)",
        courierService: "Instant EV",
        isGreenDelivery: true,
        plasticFreePack: true,
        customerName: customerUser.name,
        customerEmail: customerUser.email,
        customerPhone: customerUser.phone,
        shippingAddress: "Jl. Dago Asri No. 14, Coblong, Kota Bandung, Jawa Barat 40135",
        totalCo2Kg: 15.0,
        totalPlastic: 8,
        pointsEarned: 539,
        items: {
          create: [
            {
              productId: PRODUCTS[0].id,
              productName: PRODUCTS[0].name,
              productImage: PRODUCTS[0].images[0],
              price: PRODUCTS[0].price,
              quantity: 2,
              co2SavedKg: PRODUCTS[0].co2SavedKg,
              plasticSavedPcs: PRODUCTS[0].plasticSavedPcs,
            },
            {
              productId: PRODUCTS[1].id,
              productName: PRODUCTS[1].name,
              productImage: PRODUCTS[1].images[0],
              price: PRODUCTS[1].price,
              quantity: 1,
              co2SavedKg: PRODUCTS[1].co2SavedKg,
              plasticSavedPcs: PRODUCTS[1].plasticSavedPcs,
            },
          ],
        },
      },
    });

    const order2 = await prisma.order.create({
      data: {
        orderNumber: "JH-20261028-0089",
        userId: customerUser.id,
        status: "PROCESSING",
        subtotal: 175000,
        shippingCost: 10000,
        total: 185000,
        courier: "SiCepat Regular",
        isGreenDelivery: false,
        plasticFreePack: true,
        customerName: "Budi Santoso",
        customerEmail: "budi.santoso@example.com",
        customerPhone: "+62 813-9090-8811",
        shippingAddress: "Kebayoran Baru, Jakarta Selatan",
        totalCo2Kg: 3.0,
        totalPlastic: 2,
        pointsEarned: 185,
        items: {
          create: [
            {
              productId: PRODUCTS[2].id,
              productName: PRODUCTS[2].name,
              productImage: PRODUCTS[2].images[0],
              price: PRODUCTS[2].price,
              quantity: 1,
              co2SavedKg: PRODUCTS[2].co2SavedKg,
              plasticSavedPcs: PRODUCTS[2].plasticSavedPcs,
            },
          ],
        },
      },
    });

    const order3 = await prisma.order.create({
      data: {
        orderNumber: "JH-20261028-0085",
        userId: customerUser.id,
        status: "SHIPPED",
        trackingNumber: "JP98231023912",
        subtotal: 79000,
        shippingCost: 10000,
        total: 89000,
        courier: "J&T Eco",
        isGreenDelivery: false,
        plasticFreePack: true,
        customerName: "Citra Lestari",
        customerEmail: "citra.lestari@example.com",
        shippingAddress: "Coblong, Bandung",
        totalCo2Kg: 4.5,
        totalPlastic: 3,
        pointsEarned: 89,
        items: {
          create: [
            {
              productId: PRODUCTS[3].id,
              productName: PRODUCTS[3].name,
              productImage: PRODUCTS[3].images[0],
              price: PRODUCTS[3].price,
              quantity: 1,
              co2SavedKg: PRODUCTS[3].co2SavedKg,
              plasticSavedPcs: PRODUCTS[3].plasticSavedPcs,
            },
          ],
        },
      },
    });
  }

  // 7. Seed Sample Tree Donations
  console.log("Seeding tree donations...");
  const treeCount = await prisma.treeDonation.count();
  if (treeCount === 0) {
    await prisma.treeDonation.create({
      data: {
        userId: customerUser.id,
        treeType: "Trembesi",
        quantity: 1,
        source: "POINTS",
        status: "PENDING",
        location: "Tahura Juanda, Bandung",
        gpsCoordinates: "-6.8524, 107.6321",
        proofImage: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=300&q=80",
      },
    });

    await prisma.treeDonation.create({
      data: {
        userId: customerUser.id,
        treeType: "Mahoni",
        quantity: 2,
        source: "POINTS",
        status: "PLANTED",
        location: "Muara Gembong, Bekasi",
        gpsCoordinates: "-5.9124, 107.0125",
        proofImage: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=300&q=80",
        plantedAt: new Date(),
      },
    });
  }

  console.log("Database seeded successfully with 20 eco-products, categories, SDGs, badges, and initial accounts!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
