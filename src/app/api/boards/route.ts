import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const CreateBoardSchema = z.object({
  name: z.string().min(3),
  contractId: z.string().min(10),
  network: z.enum(["testnet", "mainnet"]),
  deployerAddress: z.string().regex(/^G[A-Z2-7]{55}$/, "Invalid Stellar address"),
});

export async function GET() {
  try {
    const boards = await prisma.board.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(boards);
  } catch (err) {
    console.error("[GET /api/boards]", err);
    return NextResponse.json({ error: "Failed to fetch boards" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = CreateBoardSchema.parse(body);

    const board = await prisma.board.create({ data });
    return NextResponse.json(board, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }
    // Unique constraint (duplicate contractId)
    if ((err as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "Board with this contractId already exists" }, { status: 409 });
    }
    console.error("[POST /api/boards]", err);
    return NextResponse.json({ error: "Failed to create board" }, { status: 500 });
  }
}
