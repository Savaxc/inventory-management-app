import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;

    const body = await req.json();
    const { price, quantity, lowStockAt } = body;

    if (!id) {
      return new NextResponse("Product ID is missing", { status: 400 });
    }

    const updatedProduct = await prisma.product.update({
      where: {
        id: id,
        userId: user.id,
      },
      data: {
        price: parseFloat(price.toString()), 
        quantity: parseInt(quantity.toString()),
        lowStockAt: parseInt(lowStockAt.toString()),
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("[PRODUCT_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}