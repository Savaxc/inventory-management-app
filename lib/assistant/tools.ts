/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Tool } from "@mozaik-ai/core";
import { prisma } from "@/lib/db";

export function stockTools(userId: string): Tool[] {
  return [
    {
      type: "function",
      name: "find_products",
      description: "Pretraži proizvode korisnika po nazivu ili SKU šifri.",
      strict: true,
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
        additionalProperties: false,
      },
      invoke: async ({ query }: { query: string }) =>
        prisma.product.findMany({
          where: {
            userId,
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { sku: { contains: query, mode: "insensitive" } },
            ],
          },
          select: {
            id: true,
            name: true,
            sku: true,
            quantity: true,
            lowStockAt: true,
            price: true,
          },
          take: 20,
        }),
    },
    {
      type: "function",
      name: "get_low_stock",
      description:
        "Prikazuje sve proizvode čija je količina manja ili jednaka pragu upozorenja (lowStockAt), kao i rasprodate artikle.",
      strict: true,
      parameters: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      invoke: async () => {
        const products = await prisma.product.findMany({
          where: { userId },
          select: {
            id: true,
            name: true,
            quantity: true,
            lowStockAt: true,
            price: true,
            sku: true,
          },
        });

        // Filtriranje proizvoda koji su na ili ispod praga ili rasprodati
        return products.filter((p) => {
          const threshold = p.lowStockAt ?? 5;
          return p.quantity <= threshold;
        });
      },
    },
    {
      type: "function",
      name: "get_inventory_summary",
      description:
        "Daje ukupnu vrednost zaliha, broj artikala i analiza po kategoriji. Može se filtrirati po određenoj kategoriji.",
      strict: true,
      parameters: {
        type: "object",
        properties: {
          categoryName: {
            type: "string",
            description: "Opcioni naziv kategorije (npr. Elektronika, Kablovi).",
          },
        },
        additionalProperties: false,
      },
      invoke: async ({ categoryName }: { categoryName?: string }) => {
        const whereClause: any = { userId };

        if (categoryName) {
          whereClause.category = {
            name: { contains: categoryName, mode: "insensitive" },
          };
        }

        const products = await prisma.product.findMany({
          where: whereClause,
          include: { category: true },
        });

        const totalItems = products.reduce((acc, p) => acc + p.quantity, 0);
        const totalValue = products.reduce(
          (acc, p) => acc + Number(p.price) * p.quantity,
          0
        );

        // Agregacija vrednosti i količina po kategorijama
        const categoryMap: Record<string, { count: number; items: number; value: number }> = {};

        for (const p of products) {
          const catName = p.category?.name || "Nekategorisano";
          if (!categoryMap[catName]) {
            categoryMap[catName] = { count: 0, items: 0, value: 0 };
          }
          categoryMap[catName].count += 1;
          categoryMap[catName].items += p.quantity;
          categoryMap[catName].value += Number(p.price) * p.quantity;
        }

        return {
          filteredCategory: categoryName || "Sve kategorije",
          totalProductsCount: products.length,
          totalItemsInStock: totalItems,
          totalInventoryValue: totalValue,
          breakdownByCategory: categoryMap,
        };
      },
    },
    {
      type: "function",
      name: "get_recent_activity",
      description:
        "Prikazuje dnevnik aktivnosti (izmena zaliha, kreiranje proizvoda, brisanja). Može filtrirati po vremenskom opsegu.",
      strict: true,
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number" },
          daysAgo: {
            type: "number",
            description:
              "Broj dana unazad za pretragu (npr. 1 za juče, 7 za prošlu nedelju).",
          },
        },
        additionalProperties: false,
      },
      invoke: async ({ limit = 10, daysAgo }: { limit?: number; daysAgo?: number }) => {
        const whereClause: any = { userId };

        if (daysAgo !== undefined) {
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - daysAgo);
          startDate.setHours(0, 0, 0, 0);

          const endDate = new Date();
          if (daysAgo > 0) {
            endDate.setDate(endDate.getDate() - (daysAgo - 1));
            endDate.setHours(23, 59, 59, 999);
            whereClause.createdAt = { gte: startDate, lte: endDate };
          } else {
            whereClause.createdAt = { gte: startDate };
          }
        }

        return prisma.activity.findMany({
          where: whereClause,
          orderBy: { createdAt: "desc" },
          take: limit || 10,
        });
      },
    },
    {
      type: "function",
      name: "generate_restock_plan",
      description:
        "Generiše plan dopune za sve proizvode koji su ispod praga zaliha. Izračunava koliko komada treba naručiti i procenjeni trošak.",
      strict: true,
      parameters: {
        type: "object",
        properties: {
          targetBufferMultiplier: {
            type: "number",
            description: "Koleficijent za ciljani nivo zaliha (default: 2, npr. ako je prag 5, cilj je 10).",
          },
        },
        additionalProperties: false,
      },
      invoke: async ({ targetBufferMultiplier = 2 }: { targetBufferMultiplier?: number }) => {
        const products = await prisma.product.findMany({
          where: { userId },
          select: {
            id: true,
            name: true,
            quantity: true,
            lowStockAt: true,
            price: true,
            sku: true,
          },
        });

        const lowStockProducts = products.filter((p) => {
          const threshold = p.lowStockAt ?? 5;
          return p.quantity <= threshold;
        });

        const plan = lowStockProducts.map((p) => {
          const threshold = p.lowStockAt ?? 5;
          const targetQuantity = Math.max(threshold * targetBufferMultiplier, 10);
          const recommendedOrder = targetQuantity - p.quantity;
          const estimatedCost = recommendedOrder * Number(p.price);

          return {
            productId: p.id,
            productName: p.name,
            sku: p.sku,
            currentQuantity: p.quantity,
            lowStockAt: threshold,
            recommendedOrder,
            unitPrice: Number(p.price),
            estimatedCost,
          };
        });

        const totalEstimatedCost = plan.reduce((sum, item) => sum + item.estimatedCost, 0);
        const totalItemsToOrder = plan.reduce((sum, item) => sum + item.recommendedOrder, 0);

        return {
          totalProductsToRestock: plan.length,
          totalItemsToOrder,
          totalEstimatedCost,
          items: plan,
        };
      },
    },
    {
      type: "function",
      name: "propose_stock_update",
      description:
        "Predlaže izmenu stanja za proizvod. Ne menja bazu direktno, već vraća strukturu predloga koja se korisniku prikazuje kao kartica za odobrenje. Nikada ne tvrdi da je izmena već izvršena.",
      strict: true,
      parameters: {
        type: "object",
        properties: {
          productId: { type: "string" },
          newQuantity: { type: "number" },
          reason: { type: "string" },
        },
        required: ["productId", "newQuantity", "reason"],
        additionalProperties: false,
      },
      invoke: async ({ productId, newQuantity, reason }) => {
        const product = await prisma.product.findUnique({
          where: { id: productId, userId },
        });
        if (!product) throw new Error("Proizvod nije pronađen.");

        if (!Number.isInteger(newQuantity) || newQuantity < 0) {
          throw new Error("Količina mora biti ceo broj veći ili jednak 0.");
        }

        const normalizedReason =
          typeof reason === "string" ? reason.trim().slice(0, 500) : "";
        if (!normalizedReason) throw new Error("Razlog izmene je obavezan.");

        return {
          action: "PROPOSE_UPDATE" as const,
          productId,
          productName: product.name,
          sku: product.sku,
          oldQuantity: product.quantity,
          newQuantity,
          reason: normalizedReason,
        };
      },
    },
  ];
}