import { NextResponse } from "next/server";
import { z } from "zod";

const CreateBoardSchema = z.object({
  name: z.string().min(3),
  contractId: z.string().min(10),
  network: z.enum(["testnet", "mainnet"]),
  deployerAddress: z.string().regex(/^G[A-Z2-7]{55}$/, "Invalid Stellar address"),
});

async function getPrisma() {
  try {
    const { prisma } = await import("@/lib/prisma");
    return prisma;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const prisma = await getPrisma();
    if (!prisma || !process.env.DATABASE_URL) {
      // Demo path: board UI reads Soroban directly; metadata DB is optional.
      return NextResponse.json([]);
    }
    const boards = await prisma.board.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(boards);
  } catch (err) {
    console.error("[GET /api/boards]", err);
    // Don't hard-fail the landing page if Postgres isn't provisioned yet.
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          error:
            "DATABASE_URL not configured. Open the live board directly — metadata registration is optional.",
        },
        { status: 503 }
      );
    }

    const prisma = await getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const body = await request.json();
    const data = CreateBoardSchema.parse(body);

    const board = await prisma.board.create({ data });
    return NextResponse.json(board, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }
    if ((err as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { error: "Board with this contractId already exists" },
        { status: 409 }
      );
    }
    console.error("[POST /api/boards]", err);
    return NextResponse.json({ error: "Failed to create board" }, { status: 500 });
  }
}
