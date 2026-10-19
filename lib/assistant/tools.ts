import type { Tool } from "@mozaik-ai/core";
import { prisma } from "@/lib/db";

export function stockTools(userId: string): Tool[] {
  return [
    {
      type: "function",
      name: "find_products",
      description: "Pretraži proizvode korisnika po nazivu ili SKU.",
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
          select: { id: true, name: true, sku: true, quantity: true, lowStockAt: true, price: true },
          take: 20,
        }),
    },
    {
      type: "function",
      name: "get_low_stock",
      description: "Prikazuje proizvode čija je količina manja ili jednaka pragu upozorenja (lowStockAt), kao i one kojih uopšte nema na stanju.",
      strict: true,
      parameters: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      invoke: async () =>
        prisma.product.findMany({
          where: {
            userId,
            OR: [
              { quantity: { lte: prisma.product.fields.lowStockAt } }, // Proizvodi ispod praga
              { quantity: 0 }
            ]
          },
          select: { id: true, name: true, quantity: true, lowStockAt: true },
        }),
    },
    {
      type: "function",
      name: "get_inventory_summary",
      description: "Daje ukupnu vrednost zaliha, broj proizvoda po statusu i kategoriji.",
      strict: true,
      parameters: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      invoke: async () => {
        const products = await prisma.product.findMany({
          where: { userId },
          include: { category: true },
        });

        const totalItems = products.reduce((acc, p) => acc + p.quantity, 0);
        const totalValue = products.reduce((acc, p) => acc + Number(p.price) * p.quantity, 0);
        
        return {
          totalProductsCount: products.length,
          totalItemsInStock: totalItems,
          totalInventoryValue: totalValue,
        };
      },
    },
    {
      type: "function",
      name: "get_recent_activity",
      description: "Prikazuje poslednje izmene i aktivnosti iz dnevnika (Activity feed).",
      strict: true,
      parameters: {
        type: "object",
        properties: { limit: { type: "number" } },
        additionalProperties: false,
      },
      invoke: async ({ limit = 5 }: { limit?: number }) =>
        prisma.activity.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: limit || 5,
        }),
    },
    {
      type: "function",
      name: "propose_stock_update",
      description: "Predlaže izmenu stanja za proizvod. Ne menja bazu direktno, već vraća predlog koji korisnik potvrđuje u UI-ju.",
      strict: true,
      parameters: {
        type: "object",
        properties: {
          productId: { type: "string" },
          newQuantity: { type: "number" },
          reason: { type: "string" }
        },
        required: ["productId", "newQuantity", "reason"],
        additionalProperties: false,
      },
      invoke: async ({ productId, newQuantity, reason }) => {
        const product = await prisma.product.findUnique({
          where: { id: productId, userId }
        });
        if (!product) throw new Error("Product not found");

        return {
          action: "PROPOSE_UPDATE",
          productId,
          productName: product.name,
          oldQuantity: product.quantity,
          newQuantity,
          reason
        };
      },
    },
  ];
}