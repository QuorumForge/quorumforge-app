import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const NotifySchema = z.object({
  boardId: z.string(),
  recipientAddresses: z.array(z.string().regex(/^G[A-Z2-7]{55}$/)).min(1),
  event: z.enum(["created", "expiring_soon", "executed"]),
});

async function sendWebhook(payload: Record<string, unknown>) {
  const url = process.env.NOTIFICATION_WEBHOOK_URL;
  if (!url) return { skipped: true };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Webhook failed: ${res.status}`);
  return { sent: true };
}

export async function POST(
  request: Request,
  { params }: { params: { proposalId: string } }
) {
  const { proposalId } = params;

  try {
    const body = await request.json();
    const { boardId, recipientAddresses, event } = NotifySchema.parse(body);

    // Persist notification records
    const records = await prisma.proposalNotification.createMany({
      data: recipientAddresses.map((addr) => ({
        boardId,
        proposalId,
        recipientAddress: addr,
        channel: "webhook",
      })),
      skipDuplicates: true,
    });

    // Send webhook if configured
    const webhookResult = await sendWebhook({
      proposalId,
      boardId,
      event,
      recipients: recipientAddresses,
      timestamp: new Date().toISOString(),
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
    });

    return NextResponse.json({
      notified: records.count,
      webhook: webhookResult,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }
    console.error("[POST /api/proposals/notify]", err);
    return NextResponse.json({ error: "Failed to send notifications" }, { status: 500 });
  }
}
