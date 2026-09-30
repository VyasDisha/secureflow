import { NextResponse } from "next/server";
import { prisma } from "../../../../src/lib/prisma";

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    const eventId =
      payload?.id ?? crypto.randomUUID();

    const eventType =
      payload?.type ?? "unknown";

    const emailId =
      payload?.data?.email_id ??
      payload?.data?.emailId ??
      null;

    await prisma.emailEvent.upsert({
      where: {
        eventId,
      },
      update: {
        type: eventType,
        emailId,
        payload,
      },
      create: {
        eventId,
        type: eventType,
        emailId,
        payload,
      },
    });

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error("Resend webhook error:", error);

    return NextResponse.json(
      {
        error: "Invalid webhook payload",
      },
      { status: 400 },
    );
  }
}